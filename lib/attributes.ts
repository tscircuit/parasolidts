// Documented system attributes and V30 record layouts: XT reference §§5.4.1–8, A.1.1–2.
import {
  Entity,
  EntityReference,
  serializeFields,
  type EntityField,
  type FieldValue,
  type FieldKind,
} from "./entity"

export abstract class VariableEntity extends Entity {
  abstract setVariableLength(count: number): void
  abstract get variableLength(): number

  toSource(): string {
    return `${this.nodeType} ${this.variableLength} ${this.id} ${serializeFields(this.getFields())}`
  }
}

const field = (
  name: string,
  kind: FieldKind,
  value: FieldValue,
): EntityField => ({ name, kind, value })
const fields = (
  name: string,
  kind: FieldKind,
  values: readonly FieldValue[],
): EntityField[] =>
  values.map((value, index) => field(`${name}[${index}]`, kind, value))

export class AttributeIdentifier extends VariableEntity {
  readonly type = "AttributeIdentifier"
  readonly nodeType = 79
  characters: string[]
  constructor(init: { id?: number; value?: string } = {}) {
    super(init.id)
    this.characters = [...(init.value ?? "")]
  }
  get value(): string {
    return this.characters.join("")
  }
  set value(value: string) {
    this.characters = [...value]
  }
  get variableLength(): number {
    return this.characters.length
  }
  setVariableLength(count: number): void {
    this.characters = Array(count).fill(" ")
  }
  getFields(): EntityField[] {
    return fields("characters", "C", this.characters)
  }
  override toSource(): string {
    // XT §2.1.3 permits nine-space compression in attribute identifiers.
    const characters = serializeFields(this.getFields()).replace(/ {9}/g, "\\9")
    return `79 ${this.variableLength} ${this.id} ${characters}`
  }
}

export class RealArray extends VariableEntity {
  readonly type = "RealArray"
  readonly nodeType = 83
  values: (number | null)[]
  constructor(init: { id?: number; values?: (number | null)[] } = {}) {
    super(init.id)
    this.values = init.values ?? []
  }
  get variableLength(): number {
    return this.values.length
  }
  setVariableLength(count: number): void {
    this.values = Array(count).fill(0)
  }
  getFields(): EntityField[] {
    return fields("values", "F", this.values)
  }
}

export class AttributeDefinition extends VariableEntity {
  readonly type = "AttributeDefinition"
  readonly nodeType = 80
  nextDefinition: EntityReference<AttributeDefinition> | null
  identifierRef: EntityReference<AttributeIdentifier> | null
  kindId: number
  eventActions: number[]
  fieldLabels: EntityReference | null
  allowedOwners: boolean[]
  valueKinds: number[]
  constructor(
    init: {
      id?: number
      nextDefinition?: EntityReference<AttributeDefinition> | null
      identifierRef?: EntityReference<AttributeIdentifier> | null
      kindId?: number
      eventActions?: number[]
      fieldLabels?: EntityReference | null
      allowedOwners?: boolean[]
      valueKinds?: number[]
    } = {},
  ) {
    super(init.id)
    this.nextDefinition = init.nextDefinition ?? null
    this.identifierRef = init.identifierRef ?? null
    this.kindId = init.kindId ?? 9000
    this.eventActions = init.eventActions ?? [0, 0, 0, 0, 3, 5, 0, 0]
    this.fieldLabels = init.fieldLabels ?? null
    this.allowedOwners = init.allowedOwners ?? Array(14).fill(false)
    this.valueKinds = init.valueKinds ?? []
  }
  get variableLength(): number {
    return this.valueKinds.length
  }
  setVariableLength(count: number): void {
    this.valueKinds = Array(count).fill(0)
  }
  getFields(): EntityField[] {
    if (this.eventActions.length !== 8 || this.allowedOwners.length !== 14)
      throw new Error(
        "XT attribute definitions require 8 event actions and 14 allowed-owner flags",
      )
    return [
      field("nextDefinition", "P", this.nextDefinition),
      field("identifierRef", "P", this.identifierRef),
      field("kindId", "D", this.kindId),
      ...fields("eventActions", "U", this.eventActions),
      field("fieldLabels", "P", this.fieldLabels),
      ...fields("allowedOwners", "L", this.allowedOwners),
      ...fields("valueKinds", "U", this.valueKinds),
    ]
  }
}

export class Attribute extends VariableEntity {
  readonly type = "Attribute"
  readonly nodeType = 81
  localId: number
  definitionRef: EntityReference<AttributeDefinition> | null
  ownerRef: EntityReference | null
  nextAnnotation: EntityReference | null
  previousAnnotation: EntityReference | null
  nextSameKind: EntityReference<Attribute> | null
  previousSameKind: EntityReference<Attribute> | null
  valueArrays: (EntityReference | null)[]
  constructor(
    init: {
      id?: number
      localId?: number
      definitionRef?: EntityReference<AttributeDefinition> | null
      ownerRef?: EntityReference | null
      nextAnnotation?: EntityReference | null
      previousAnnotation?: EntityReference | null
      nextSameKind?: EntityReference<Attribute> | null
      previousSameKind?: EntityReference<Attribute> | null
      valueArrays?: (EntityReference | null)[]
    } = {},
  ) {
    super(init.id)
    this.localId = init.localId ?? 0
    this.definitionRef = init.definitionRef ?? null
    this.ownerRef = init.ownerRef ?? null
    this.nextAnnotation = init.nextAnnotation ?? null
    this.previousAnnotation = init.previousAnnotation ?? null
    this.nextSameKind = init.nextSameKind ?? null
    this.previousSameKind = init.previousSameKind ?? null
    this.valueArrays = init.valueArrays ?? []
  }
  get variableLength(): number {
    return this.valueArrays.length
  }
  setVariableLength(count: number): void {
    this.valueArrays = Array(count).fill(null)
  }
  getFields(): EntityField[] {
    return [
      field("localId", "D", this.localId),
      field("definitionRef", "P", this.definitionRef),
      field("ownerRef", "P", this.ownerRef),
      field("nextAnnotation", "P", this.nextAnnotation),
      field("previousAnnotation", "P", this.previousAnnotation),
      field("nextSameKind", "P", this.nextSameKind),
      field("previousSameKind", "P", this.previousSameKind),
      ...fields("valueArrays", "P", this.valueArrays),
    ]
  }
}

/** Per-body list of the first attribute of each definition used by that body. */
export class PointerList extends Entity {
  readonly type = "PointerList"
  readonly nodeType = 70
  localId = 0
  entryKind = 4
  transmissionFlag = true
  ownerRef: EntityReference | null = null
  nextList: EntityReference<PointerList> | null = null
  previousList: EntityReference<PointerList> | null = null
  entryCount = 0
  blockCapacity = 0
  cursorIndex = 0
  cursorBlock: EntityReference<PointerListBlock> | null = null
  firstBlock: EntityReference<PointerListBlock> | null = null
  constructor(init: { id?: number } = {}) {
    super(init.id)
  }
  getFields(): EntityField[] {
    return [
      field("localId", "D", this.localId),
      field("entryKind", "U", this.entryKind),
      field("transmissionFlag", "L", this.transmissionFlag),
      field("ownerRef", "P", this.ownerRef),
      field("nextList", "P", this.nextList),
      field("previousList", "P", this.previousList),
      field("entryCount", "D", this.entryCount),
      field("blockCapacity", "D", this.blockCapacity),
      field("cursorIndex", "D", this.cursorIndex),
      field("cursorBlock", "P", this.cursorBlock),
      field("firstBlock", "P", this.firstBlock),
    ]
  }
  toSource(): string {
    return `70 ${this.id} ${serializeFields(this.getFields())}`
  }
}

export class PointerListBlock extends VariableEntity {
  readonly type = "PointerListBlock"
  readonly nodeType = 74
  usedCount = 0
  indexOrigin = 0
  nextBlock: EntityReference<PointerListBlock> | null = null
  entries: (EntityReference | null)[]
  constructor(
    init: { id?: number; entries?: (EntityReference | null)[] } = {},
  ) {
    super(init.id)
    this.entries = init.entries ?? []
    this.usedCount = this.entries.length
  }
  get variableLength(): number {
    return this.entries.length
  }
  setVariableLength(count: number): void {
    this.entries = Array(count).fill(null)
  }
  getFields(): EntityField[] {
    return [
      field("usedCount", "D", this.usedCount),
      field("indexOrigin", "D", this.indexOrigin),
      field("nextBlock", "P", this.nextBlock),
      ...fields("entries", "P", this.entries),
    ]
  }
}

/** Read a native standard RGB attribute attached directly to an entity. */
export function getEntityColor(
  repository: { get(id: number): Entity | undefined },
  entity: Entity,
): [number, number, number] | undefined {
  const annotation = entity
    .getFields()
    .find((value) => value.name === "annotations")?.value
  let id = annotation instanceof EntityReference ? annotation.id : 0
  const visited = new Set<number>()
  while (id && !visited.has(id)) {
    visited.add(id)
    const attribute = repository.get(id)
    if (!(attribute instanceof Attribute)) return undefined
    const definition = attribute.definitionRef?.resolve(repository)
    const identifier = definition?.identifierRef?.resolve(repository).value
    if (
      (identifier === "SDL/TYSA_COLOUR" && definition?.kindId === 8001) ||
      (identifier === "SDL/TYSA_COLOUR_2" && definition?.kindId === 8040)
    ) {
      const values = attribute.valueArrays[0]?.resolve(repository)
      if (
        values instanceof RealArray &&
        values.values.length === 3 &&
        values.values.every(
          (value) => typeof value === "number" && value >= 0 && value <= 1,
        )
      )
        return values.values as [number, number, number]
    }
    id = attribute.nextAnnotation?.id ?? 0
  }
  return undefined
}
