import { Body } from "./entities"
import { Entity, EntityReference, UnknownEntity } from "./entity"

export const SUPPORTED_SCHEMA = "SCH_3000000_30000"

export class TransmitHeader {
  schema: string
  modellerVersion: string
  userFieldSize: number
  commonHeader: string

  constructor(
    init: {
      schema?: string
      modellerVersion?: string
      userFieldSize?: number
      commonHeader?: string
    } = {},
  ) {
    this.schema = init.schema ?? SUPPORTED_SCHEMA
    this.modellerVersion =
      init.modellerVersion ??
      ": TRANSMIT FILE created by modeller version 3000000"
    this.userFieldSize = init.userFieldSize ?? 0
    this.commonHeader = init.commonHeader ?? ""
  }

  getString(): string {
    return `${this.commonHeader}T${this.modellerVersion.length} ${this.modellerVersion}${this.schema.length} ${this.schema}${this.userFieldSize} `
  }
}

/** Owns the graph of transmitted records. A parsed, unmodified document round-trips byte-for-byte. */
export class Repository {
  header: TransmitHeader
  private records: Entity[] = []
  private originalSource?: string
  private originalFingerprint?: string

  constructor(init: { header?: TransmitHeader; entities?: Entity[] } = {}) {
    this.header = init.header ?? new TransmitHeader()
    for (const entity of init.entities ?? []) this.add(entity)
  }

  add<T extends Entity>(entity: T): EntityReference<T> {
    if (entity instanceof UnknownEntity)
      throw new Error("Use parser preservation for unknown stream data")
    if (entity.id === 0)
      entity.id = Math.max(0, ...this.records.map((record) => record.id)) + 1
    if (!Number.isSafeInteger(entity.id) || entity.id <= 0)
      throw new Error("Entity IDs must be positive integers")
    if (this.get(entity.id))
      throw new Error(`Duplicate Parasolid entity ID ${entity.id}`)
    this.records.push(entity)
    return new EntityReference<T>(entity.id)
  }

  get<T extends Entity = Entity>(id: number): T | undefined {
    return this.records.find((entity) => entity.id === id) as T | undefined
  }

  entries(): IterableIterator<[number, Entity]> {
    return this.records
      .filter((entity) => !(entity instanceof UnknownEntity))
      .map((entity): [number, Entity] => [entity.id, entity])
      .values()
  }

  getChildren(): Entity[] {
    return [...this.records]
  }

  get bodies(): Body[] {
    return this.records.filter(
      (entity): entity is Body => entity instanceof Body,
    )
  }

  get fullyParsed(): boolean {
    return !this.records.some((entity) => entity instanceof UnknownEntity)
  }

  /** Canonical serializer; preserves the entire source when no typed properties changed. */
  getString(options: { canonical?: boolean } = {}): string {
    // IDs are editable along with other typed properties, so add-time checks
    // alone cannot guarantee a valid set of transmitted indices.
    const ids = new Set<number>()
    for (const entity of this.records) {
      if (entity instanceof UnknownEntity) continue
      if (!Number.isSafeInteger(entity.id) || entity.id <= 0)
        throw new Error("Entity IDs must be positive integers")
      if (ids.has(entity.id))
        throw new Error(`Duplicate Parasolid entity ID ${entity.id}`)
      ids.add(entity.id)
    }
    const current = this.fingerprint()
    if (
      !options.canonical &&
      this.originalSource !== undefined &&
      current === this.originalFingerprint
    )
      return this.originalSource
    if (!this.fullyParsed)
      throw new Error(
        "Cannot edit an opaque XT document: its schema is not fully supported",
      )
    if (
      this.header.schema !== SUPPORTED_SCHEMA ||
      this.header.userFieldSize !== 0
    )
      throw new Error(
        "Can only serialize the supported V30 schema without user fields",
      )
    return (
      this.header.getString() +
      this.records.map((entity) => entity.toSource()).join("") +
      "1 0 "
    )
  }

  /** @internal Retain the exact input and any unsupported suffix after parsing. */
  preserveSource(source: string, unknown?: UnknownEntity): void {
    if (unknown) this.records.push(unknown)
    this.originalSource = source
    this.originalFingerprint = this.fingerprint()
  }

  private fingerprint(): string {
    return JSON.stringify([
      this.header,
      this.records.map((entity) => [entity.type, entity.toSource()]),
    ])
  }
}
