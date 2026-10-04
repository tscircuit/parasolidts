import { entityConstructors, IntegerArray } from "./entities"
import {
  EntityReference,
  UnknownEntity,
  Vector3,
  type Entity,
  type EntityField,
  type FieldValue,
} from "./entity"
import { Repository, SUPPORTED_SCHEMA, TransmitHeader } from "./repository"

/** Parse the documented fixed-layout V30 subset; preserve other schemas/record tails opaquely. */
export function parseRepository(source: string): Repository {
  let commonHeader = ""
  let stream = source
  if (source.startsWith("**")) {
    const marker = /\*\*END_OF_HEADER[^\r\n]*(?:\r?\n|\r)/.exec(source)
    if (!marker)
      throw new Error("Invalid Parasolid common header: missing END_OF_HEADER")
    const end = marker.index + marker[0].length
    commonHeader = source.slice(0, end)
    stream = source.slice(end)
  }
  // XT physical lines are continuations: trailing spaces and newlines carry no data.
  const logical = stream
    .split(/\r\n|\r|\n/)
    .map((line) => line.replace(/ +$/, ""))
    .join("")
  const reader = new Reader(logical)
  if (reader.character() !== "T")
    throw new Error("Expected Parasolid X_T text stream (T header)")
  const modellerVersion = reader.string()
  const schema = reader.string()
  const repository = new Repository({
    header: new TransmitHeader({ commonHeader, modellerVersion, schema }),
  })
  if (schema !== SUPPORTED_SCHEMA) {
    repository.preserveSource(
      source,
      new UnknownEntity(
        logical.slice(reader.position),
        `Unsupported schema ${schema}`,
      ),
    )
    return repository
  }
  repository.header.userFieldSize = reader.integer()
  if (repository.header.userFieldSize !== 0) {
    repository.preserveSource(
      source,
      new UnknownEntity(
        logical.slice(reader.position),
        "Application user fields are not decoded",
      ),
    )
    return repository
  }
  while (reader.position < logical.length) {
    const start = reader.position
    const nodeType = reader.integer()
    if (nodeType === 1) {
      if (reader.integer(true) !== 0 || reader.position !== logical.length)
        throw new Error("Invalid XT termination record or trailing data")
      repository.preserveSource(source)
      return repository
    }
    if (nodeType <= 1) throw new Error(`Invalid XT node type ${nodeType}`)
    const EntityClass =
      entityConstructors[nodeType as keyof typeof entityConstructors]
    if (!EntityClass) {
      repository.preserveSource(
        source,
        new UnknownEntity(
          logical.slice(start),
          `Unsupported node type ${nodeType}; subsequent boundaries require its schema`,
        ),
      )
      return repository
    }
    const count = nodeType === 82 ? reader.integer() : undefined
    if (count !== undefined && (count < 0 || count > 1_000_000))
      throw new Error("XT array length exceeds supported limits")
    const id = reader.integer()
    const entity: Entity = new EntityClass({ id })
    if (entity instanceof IntegerArray) {
      entity.values = Array.from({ length: count ?? 0 }, () =>
        reader.number(true),
      )
    } else {
      for (const field of entity.getFields())
        setField(entity, field, reader.field(field))
    }
    repository.add(entity)
  }
  throw new Error("Truncated XT stream: missing termination record")
}

export const parseParasolid = parseRepository
export function stringifyParasolid(repository: Repository): string {
  return repository.getString()
}

function setField(entity: Entity, field: EntityField, value: FieldValue): void {
  // Field names come exclusively from the typed class's own ordered descriptors.
  Object.assign(entity, { [field.name]: value })
}

class Reader {
  position = 0
  constructor(private text: string) {}

  character(): string {
    const value = this.text[this.position++]
    if (value === undefined) throw new Error("Truncated XT character")
    return value
  }

  token(allowEnd = false): string {
    const end = this.text.indexOf(" ", this.position)
    if (end === -1 && !allowEnd)
      throw new Error(`Truncated XT numeric field at ${this.position}`)
    const token = this.text.slice(this.position, end < 0 ? undefined : end)
    this.position = end < 0 ? this.text.length : end + 1
    if (!token) throw new Error(`Empty XT token at ${this.position}`)
    return token
  }

  number(integer = false, allowEnd = false): number | null {
    if (this.text[this.position] === "?") {
      this.position++
      return null
    }
    const token = this.token(allowEnd)
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token))
      throw new Error(`Invalid XT number ${token}`)
    const value = Number(token)
    if (!Number.isFinite(value) || (integer && !Number.isSafeInteger(value)))
      throw new Error(`Invalid XT number ${token}`)
    return value
  }

  integer(allowEnd = false): number {
    const value = this.number(true, allowEnd)
    if (value === null) throw new Error("Required XT integer is unset")
    return value
  }

  string(): string {
    const length = this.integer()
    if (
      length < 0 ||
      length > 1_000_000 ||
      this.position + length > this.text.length
    )
      throw new Error("Invalid XT string length")
    const value = this.text.slice(this.position, this.position + length)
    this.position += length
    return value
  }

  field(field: EntityField): FieldValue {
    if (field.kind === "C") return this.character()
    if (field.kind === "P") {
      const id = this.integer()
      return id === 0 ? null : new EntityReference(id)
    }
    if (field.kind === "V") {
      const coordinates = [this.number(), this.number(), this.number()]
      if (coordinates.some((value) => value === null))
        throw new Error(
          "Unset vector components are outside the supported subset",
        )
      return new Vector3(coordinates as [number, number, number])
    }
    if (field.kind === "U") {
      const value = this.integer()
      if (value < 0 || value > 255) throw new Error("XT byte is out of range")
      return value
    }
    return this.number(field.kind === "D")
  }
}
