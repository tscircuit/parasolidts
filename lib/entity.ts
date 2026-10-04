/** Coordinates in Parasolid transmit units (the writer uses metres). */
export class Vector3 {
  x: number
  y: number
  z: number

  constructor(
    value:
      | readonly [number, number, number]
      | { x: number; y: number; z: number } = [0, 0, 0],
  ) {
    if ("x" in value) {
      this.x = value.x
      this.y = value.y
      this.z = value.z
    } else {
      ;[this.x, this.y, this.z] = value
    }
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z]
  }
}

export class EntityReference<T extends Entity = Entity> {
  constructor(readonly id: number) {
    if (!Number.isSafeInteger(id) || id <= 0)
      throw new Error("An entity reference must have a positive integer ID")
  }

  resolve(repository: { get(id: number): Entity | undefined }): T {
    const entity = repository.get(this.id)
    if (!entity)
      throw new Error(`Unresolved Parasolid entity reference ${this.id}`)
    return entity as T
  }
}

export type FieldKind = "D" | "F" | "U" | "P" | "C" | "V" | "L"
export type FieldValue =
  | number
  | string
  | boolean
  | null
  | Vector3
  | EntityReference
export interface EntityField {
  name: string
  kind: FieldKind
  value: FieldValue
}

export abstract class Entity {
  abstract readonly type: string
  abstract readonly nodeType: number
  id: number

  constructor(id = 0) {
    this.id = id
  }

  abstract getFields(): EntityField[]
  abstract toSource(): string

  // References form a graph, so traversal through children must not recurse into them.
  getChildren(): Entity[] {
    return []
  }
}

export function serializeFields(fields: readonly EntityField[]): string {
  return fields
    .map(({ kind, value }) => {
      if (kind === "P")
        return `${value === null ? 0 : (value as EntityReference).id} `
      if (kind === "L") {
        if (typeof value !== "boolean") throw new Error("Expected XT logical")
        return value ? "T" : "F"
      }
      if (kind === "C") {
        if (typeof value !== "string" || value.length !== 1)
          throw new Error("Expected a single XT character")
        // XT §3.2 intentionally reverses the usual n/r escape meanings.
        if (value === "\0") return "\\0"
        if (value === "\r") return "\\n"
        if (value === "\n") return "\\r"
        if (value === "\\") return "\\\\"
        return value
      }
      if (kind === "V") {
        if (!(value instanceof Vector3)) throw new Error("Expected Vector3")
        return value
          .toArray()
          .map((coordinate) => formatNumber(coordinate, false))
          .join("")
      }
      if (value === null) {
        if (kind === "U")
          throw new Error("Unsigned-byte fields cannot be unset")
        return "?"
      }
      if (typeof value !== "number") throw new Error("Expected numeric field")
      if (kind === "U" && (value < 0 || value > 255))
        throw new Error("Unsigned byte out of range")
      return formatNumber(value, kind !== "F")
    })
    .join("")
}

function formatNumber(value: number, integer: boolean): string {
  if (!Number.isFinite(value) || (integer && !Number.isSafeInteger(value)))
    throw new Error("Expected finite XT number")
  return `${Object.is(value, -0) ? 0 : value} `
}

/** An unsupported stream suffix, retained whole because unknown record boundaries need a schema. */
export class UnknownEntity extends Entity {
  readonly type = "UnknownEntity"
  readonly nodeType = -1

  constructor(
    readonly rawSource: string,
    readonly reason: string,
  ) {
    super()
  }

  getFields(): EntityField[] {
    return []
  }

  toSource(): string {
    return this.rawSource
  }
}
