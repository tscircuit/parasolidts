import { mergeCoplanarRegions } from "./merge-coplanar"

/** Coordinates in the input unit (millimetres by default). */
export type ParasolidPoint = readonly [number, number, number]
export type ParasolidPolygon = readonly ParasolidPoint[]
export type ParasolidPolygons = readonly ParasolidPolygon[]
/** Native Parasolid RGB values, each in [0, 1]. Alpha is not supported. */
export type ParasolidColor = readonly [number, number, number]

export interface ParasolidWriteOptions {
  /** Merge adjacent coplanar faces with matching effective colors. Default true. */
  mergeCoplanarFaces?: boolean
  /** Input units. Parasolid stores geometry in metres. */
  units?: "mm" | "m"
  /** Reserved for future name attributes; names are not transmitted yet. */
  name?: string
  /** Default RGB color, attached to the body and inherited by its faces. */
  color?: ParasolidColor
  /** Optional face overrides in polygon order; undefined inherits body color. */
  faceColors?: readonly (ParasolidColor | undefined)[]
}

export interface ParasolidBodyInput {
  polygons: ParasolidPolygons
  /** Reserved for future name attributes; names are not transmitted yet. */
  name?: string
  /** Default RGB color, attached to the body and inherited by its faces. */
  color?: ParasolidColor
  /** Optional face overrides in polygon order; undefined inherits body color. */
  faceColors?: readonly (ParasolidColor | undefined)[]
}

type Point = [number, number, number]
type Field = number | string | boolean
interface RecordNode {
  type: number
  id: number
  variableCount?: number
  fields: Field[]
}
interface Edge {
  start: number
  end: number
  fins: number[]
  node: RecordNode
  curve: RecordNode
}
interface Fin {
  start: number
  end: number
  edge: Edge
  node: RecordNode
}

// Below Parasolid's usual 1e-8 m linear resolution. Used only to weld matching
// vertices and split polygon edges at existing vertices (CSG T-junctions).
const tolerance = 1e-9
const sub = (a: Point, b: Point): Point => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
]
const dot = (a: Point, b: Point) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Point, b: Point): Point => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const length = (a: Point) => Math.hypot(...a)
const unit = (a: Point): Point => {
  const magnitude = length(a)
  return [a[0] / magnitude, a[1] / magnitude, a[2] / magnitude]
}
const edgeKey = (a: number, b: number) => (a < b ? `${a},${b}` : `${b},${a}`)

function normalOf(cycle: number[], points: Point[]): Point {
  const origin = points[cycle[0]!]!
  const sum: Point = [0, 0, 0]
  for (let i = 1; i < cycle.length - 1; i++) {
    const area = cross(
      sub(points[cycle[i]!]!, origin),
      sub(points[cycle[i + 1]!]!, origin),
    )
    for (let axis = 0; axis < 3; axis++) sum[axis]! += area[axis]!
  }
  if (length(sum) <= tolerance * tolerance)
    throw new Error("Polygon has zero area")
  return unit(sum)
}

function preparePolygons(polygons: ParasolidPolygons, scale: number) {
  if (polygons.length < 4)
    throw new Error("A closed solid requires at least four polygons")
  const points: Point[] = []
  const inputPoints: Point[] = []
  const bins = new Map<string, number[]>()
  const vertex = (input: ParasolidPoint): number => {
    if (input.length !== 3 || !input.every(Number.isFinite)) {
      throw new Error("Every vertex must contain three finite coordinates")
    }
    const p = input.map((value) => value * scale) as Point
    if (!p.every(Number.isFinite))
      throw new Error("Vertex coordinate is out of range")
    const cell = p.map((value) => Math.floor(value / tolerance)) as Point
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const nearby = bins.get(
            `${cell[0] + x},${cell[1] + y},${cell[2] + z}`,
          )
          for (const index of nearby ?? []) {
            if (length(sub(points[index]!, p)) <= tolerance) return index
          }
        }
      }
    }
    const index = points.length
    points.push(p)
    inputPoints.push([...input])
    const key = cell.join(",")
    const bucket = bins.get(key) ?? []
    bucket.push(index)
    bins.set(key, bucket)
    return index
  }
  let cycles = polygons.map((polygon) => {
    const ids = polygon.map(vertex)
    if (ids.length > 1 && ids[0] === ids[ids.length - 1]) ids.pop()
    if (ids.length < 3 || new Set(ids).size !== ids.length) {
      throw new Error(
        "Polygon must have at least three distinct vertices without repeated edges",
      )
    }
    const normal = normalOf(ids, points)
    const origin = points[ids[0]!]!
    if (
      ids.some(
        (id) => Math.abs(dot(sub(points[id]!, origin), normal)) > tolerance,
      )
    ) {
      throw new Error("Only planar polygons can be written to Parasolid")
    }
    return ids
  })

  // JSCAD boolean operations can leave a vertex on the middle of a neighbour's
  // edge. Both faces must use the same set of topological edges in a B-rep.
  cycles = cycles.map((cycle) =>
    cycle.flatMap((start, i) => {
      const end = cycle[(i + 1) % cycle.length]!
      const a = points[start]!
      const delta = sub(points[end]!, a)
      const squared = dot(delta, delta)
      const edgeLength = Math.sqrt(squared)
      const splits: { index: number; fraction: number }[] = [
        { index: start, fraction: 0 },
      ]
      points.forEach((p, index) => {
        if (index === start || index === end) return
        const relative = sub(p, a)
        const fraction = dot(relative, delta) / squared
        if (
          fraction <= tolerance / edgeLength ||
          fraction >= 1 - tolerance / edgeLength
        )
          return
        const distance = length(cross(relative, delta)) / edgeLength
        if (distance <= tolerance) splits.push({ index, fraction })
      })
      return splits
        .sort((a, b) => a.fraction - b.fraction)
        .map((split) => split.index)
    }),
  )

  return { points, inputPoints, cycles }
}

function inputScale(options: Pick<ParasolidWriteOptions, "units">) {
  if (
    options.units !== undefined &&
    options.units !== "mm" &&
    options.units !== "m"
  ) {
    throw new Error("Input units must be 'mm' or 'm'")
  }
  return options.units === "m" ? 1 : 0.001
}

/**
 * Weld matching vertices and split CSG T-junctions before dividing a mesh into
 * edge-connected shells. Returns fresh coordinates in the original input unit.
 * The welding tolerance is 1e-9 metres (1e-6 millimetres). This checks polygon
 * planarity and degeneracy; full closed-manifold validation happens on write.
 */
export function normalizePolygons(
  polygons: ParasolidPolygons,
  options: Pick<ParasolidWriteOptions, "units"> = {},
): ParasolidPoint[][] {
  const scale = inputScale(options)
  const { inputPoints, cycles } = preparePolygons(polygons, scale)
  return cycles.map((cycle) =>
    cycle.map((index) => [...inputPoints[index]!] as Point),
  )
}

function prepareMesh(polygons: ParasolidPolygons, scale: number) {
  const { points, cycles } = preparePolygons(polygons, scale)

  const uses = new Map<string, { face: number; start: number; end: number }[]>()
  cycles.forEach((cycle, face) => {
    cycle.forEach((start, i) => {
      const end = cycle[(i + 1) % cycle.length]!
      const key = edgeKey(start, end)
      const entries = uses.get(key) ?? []
      entries.push({ face, start, end })
      uses.set(key, entries)
    })
  })
  for (const entries of uses.values()) {
    if (entries.length !== 2 || entries[0]!.face === entries[1]!.face) {
      throw new Error(
        `Mesh is open or non-manifold: an edge has ${entries.length} incident faces (expected two)`,
      )
    }
  }

  // Edge incidence alone misses pinched vertices, where two otherwise closed
  // surface patches touch at a point. The incident faces must form one fan.
  const vertexFaces = points.map(() => new Set<number>())
  const vertexNeighbours = points.map(() => new Map<number, Set<number>>())
  cycles.forEach((cycle, face) => {
    for (const vertex of cycle) vertexFaces[vertex]!.add(face)
  })
  for (const entries of uses.values()) {
    const [a, b] = entries
    for (const vertex of [a!.start, a!.end]) {
      const neighbours = vertexNeighbours[vertex]!
      for (const [face, other] of [
        [a!.face, b!.face],
        [b!.face, a!.face],
      ]) {
        const adjacent = neighbours.get(face!) ?? new Set<number>()
        adjacent.add(other!)
        neighbours.set(face!, adjacent)
      }
    }
  }
  vertexFaces.forEach((faces, vertex) => {
    const first = faces.values().next().value!
    const visited = new Set([first])
    const queue = [first]
    for (let i = 0; i < queue.length; i++) {
      for (const neighbour of vertexNeighbours[vertex]!.get(queue[i]!) ?? []) {
        if (visited.has(neighbour)) continue
        visited.add(neighbour)
        queue.push(neighbour)
      }
    }
    if (visited.size !== faces.size) {
      throw new Error(
        "Mesh is non-manifold: a vertex has disconnected incident face fans",
      )
    }
  })

  // Propagate a consistent orientation. Each shared edge must be traversed in
  // opposite directions by its two faces, regardless of input winding.
  const flips = new Map<number, boolean>([[0, false]])
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    const face = queue[q]!
    const cycle = cycles[face]!
    cycle.forEach((start, i) => {
      const entries = uses.get(edgeKey(start, cycle[(i + 1) % cycle.length]!))!
      const own = entries.find((entry) => entry.face === face)!
      const other = entries.find((entry) => entry.face !== face)!
      const flip = flips.get(face)! !== (own.start === other.start)
      if (!flips.has(other.face)) {
        flips.set(other.face, flip)
        queue.push(other.face)
      } else if (flips.get(other.face) !== flip) {
        throw new Error("Mesh is not orientable")
      }
    })
  }
  if (flips.size !== cycles.length) {
    throw new Error(
      "Disconnected shells are not supported in one body; use createParasolidFromBodies with one connected shell per body",
    )
  }
  cycles.forEach((cycle, face) => {
    if (flips.get(face)) cycle.reverse()
  })
  const origin = points[cycles[0]![0]!]!
  let volume6 = 0
  for (const cycle of cycles) {
    const a = sub(points[cycle[0]!]!, origin)
    for (let i = 1; i < cycle.length - 1; i++) {
      volume6 += dot(
        a,
        cross(
          sub(points[cycle[i]!]!, origin),
          sub(points[cycle[i + 1]!]!, origin),
        ),
      )
    }
  }
  if (Math.abs(volume6) <= tolerance ** 3)
    throw new Error("Mesh encloses zero volume")
  if (volume6 < 0) cycles.forEach((cycle) => cycle.reverse())
  return { points, cycles }
}

/**
 * Write a closed, connected polygon solid as Parasolid text (.x_t).
 *
 * Faces remain planar facets; curved input is not fitted to analytic surfaces.
 * Self-intersecting shells and nested cavity shells are outside this subset.
 */
export function createParasolidFromPolygons(
  polygons: ParasolidPolygons,
  options: ParasolidWriteOptions = {},
): string {
  return createParasolidFromBodies(
    [
      {
        polygons,
        name: options.name,
        color: options.color,
        faceColors: options.faceColors,
      },
    ],
    { units: options.units, mergeCoplanarFaces: options.mergeCoplanarFaces },
  )
}

/** Write several independent polygon solids into one Parasolid text file. */
export function createParasolidFromBodies(
  bodies: readonly ParasolidBodyInput[],
  options: Pick<ParasolidWriteOptions, "units" | "mergeCoplanarFaces"> = {},
): string {
  if (bodies.length === 0)
    throw new Error("At least one solid body is required")
  const scale = inputScale(options)
  const records: RecordNode[] = []
  const add = (type: number, variableCount?: number): RecordNode => {
    const node = {
      type,
      id: records.length + 1,
      variableCount,
      fields: [] as Field[],
    }
    records.push(node)
    return node
  }
  const colorDefinitions = new Map<8001 | 8040, RecordNode>()
  const colorDefinition = (kind: 8001 | 8040): RecordNode => {
    const existing = colorDefinitions.get(kind)
    if (existing) return existing
    const identifier = kind === 8001 ? "SDL/TYSA_COLOUR" : "SDL/TYSA_COLOUR_2"
    const name = add(79, identifier.length)
    name.fields = [identifier]
    const definition = add(80, 1)
    const allowedOwners = Array.from({ length: 14 }, (_, index) =>
      kind === 8001 ? index === 4 || index === 6 : index <= 2,
    )
    definition.fields = [
      0,
      name.id,
      kind,
      0,
      0,
      0,
      0,
      3,
      5,
      0,
      0,
      0,
      ...allowedOwners,
      2,
    ]
    const previous = [...colorDefinitions.values()].at(-1)
    if (previous) previous.fields[0] = definition.id
    colorDefinitions.set(kind, definition)
    return definition
  }
  const validateColor = (color: ParasolidColor | undefined) => {
    if (color === undefined) return
    if (
      !Array.isArray(color) ||
      color.length !== 3 ||
      ![...color].every(
        (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 1,
      )
    ) {
      throw new Error(
        "Color must contain exactly three finite RGB channels in [0, 1]; alpha is not supported",
      )
    }
  }
  const bodyNodes = bodies.map(() => add(12))
  bodies.forEach((input, bodyIndex) => {
    validateColor(input.color)
    if (input.faceColors !== undefined) {
      if (
        !Array.isArray(input.faceColors) ||
        input.faceColors.length !== input.polygons.length
      ) {
        throw new Error("faceColors must have one entry per input polygon")
      }
      input.faceColors.forEach(validateColor)
    }
    const mesh = prepareMesh(input.polygons, scale)
    const regions = mergeCoplanarRegions(
      mesh.points,
      mesh.cycles,
      mesh.cycles.map((_, i) => input.faceColors?.[i] ?? input.color),
      options.mergeCoplanarFaces !== false,
    )
    // Interior vertices no longer belong to topology after merging.
    const used = [...new Set(regions.flatMap((region) => region.loops.flat()))]
    const remap = new Map(used.map((id, index) => [id, index]))
    const points = used.map((id) => mesh.points[id]!)
    const boundaries = regions.map((region) =>
      region.loops.map((loop) => loop.map((id) => remap.get(id)!)),
    )
    const cycles = boundaries.map((loops) => loops[0]!)
    const body = bodyNodes[bodyIndex]!
    const solid = add(19)
    const exterior = add(19)
    const backShell = add(13)
    const frontShell = add(13)
    const vertices = points.map(() => add(18))
    const pointNodes = points.map(() => add(29))
    const faces = cycles.map(() => add(14))
    const loops = boundaries.map((rings) => rings.map(() => add(15)))
    const planes = cycles.map(() => add(50))
    const edges: Edge[] = []
    const edgeMap = new Map<string, Edge>()
    const fins: Fin[] = []
    const vertexFins = points.map(() => [] as number[])
    const faceFins = boundaries.map((rings) =>
      rings.map((cycle) =>
        cycle.map((start, i) => {
          const end = cycle[(i + 1) % cycle.length]!
          const key = edgeKey(start, end)
          let edge = edgeMap.get(key)
          if (!edge) {
            edge = { start, end, fins: [], node: add(16), curve: add(30) }
            edgeMap.set(key, edge)
            edges.push(edge)
          }
          const fin = { start, end, edge, node: add(17) }
          const index = fins.length
          fins.push(fin)
          edge.fins.push(index)
          vertexFins[end]!.push(index)
          return index
        }),
      ),
    )
    const maxId = records.length
    body.fields = [
      maxId,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1e3,
      1e-8,
      0,
      bodyNodes[bodyIndex + 1]?.id ?? 0,
      bodyNodes[bodyIndex - 1]?.id ?? 0,
      1,
      0,
      1,
      0,
      backShell.id,
      planes[0]!.id,
      edges[0]!.curve.id,
      pointNodes[0]!.id,
      0,
      0,
      solid.id,
      edges[0]!.node.id,
      vertices[0]!.id,
      0,
      0,
      0,
      0,
      0,
      body.id,
    ]
    solid.fields = [solid.id, 0, body.id, exterior.id, 0, backShell.id, "S", 0]
    exterior.fields = [
      exterior.id,
      0,
      body.id,
      0,
      solid.id,
      frontShell.id,
      "V",
      0,
    ]
    backShell.fields = [
      backShell.id,
      0,
      body.id,
      0,
      faces[0]!.id,
      0,
      0,
      solid.id,
      0,
    ]
    frontShell.fields = [
      frontShell.id,
      0,
      0,
      0,
      0,
      0,
      0,
      exterior.id,
      faces[0]!.id,
    ]

    points.forEach((position, i) => {
      const vertex = vertices[i]!
      const point = pointNodes[i]!
      vertex.fields = [
        vertex.id,
        0,
        fins[vertexFins[i]![0]!]!.node.id,
        vertices[i - 1]?.id ?? 0,
        vertices[i + 1]?.id ?? 0,
        point.id,
        "?",
        body.id,
      ]
      point.fields = [
        point.id,
        0,
        vertex.id,
        pointNodes[i + 1]?.id ?? 0,
        pointNodes[i - 1]?.id ?? 0,
        ...position,
      ]
    })
    cycles.forEach((cycle, i) => {
      const face = faces[i]!
      const faceLoops = loops[i]!
      const loop = faceLoops[0]!
      const plane = planes[i]!
      const next = faces[i + 1]?.id ?? 0
      const previous = faces[i - 1]?.id ?? 0
      face.fields = [
        face.id,
        0,
        "?",
        next,
        previous,
        loop.id,
        backShell.id,
        plane.id,
        "+",
        0,
        0,
        next,
        previous,
        frontShell.id,
      ]
      const rings = faceFins[i]!
      faceLoops.forEach((loop, j) => {
        loop.fields = [
          loop.id,
          0,
          fins[rings[j]![0]!]!.node.id,
          face.id,
          faceLoops[j + 1]?.id ?? 0,
        ]
      })
      const origin = points[cycle[0]!]!
      plane.fields = [
        plane.id,
        0,
        face.id,
        planes[i + 1]?.id ?? 0,
        planes[i - 1]?.id ?? 0,
        0,
        "+",
        ...origin,
        ...regions[i]!.normal,
        ...unit(sub(points[cycle[1]!]!, origin)),
      ]
      rings.forEach((ring, loopIndex) => {
        const loop = faceLoops[loopIndex]!
        ring.forEach((finIndex, j) => {
          const fin = fins[finIndex]!
          const atVertex = vertexFins[fin.end]!
          const vertexOffset = atVertex.indexOf(finIndex)
          const nextAtVertex = atVertex[vertexOffset + 1]
          const other = fin.edge.fins.find((index) => index !== finIndex)!
          fin.node.fields = [
            0,
            loop.id,
            fins[ring[(j + 1) % ring.length]!]!.node.id,
            fins[ring[(j + ring.length - 1) % ring.length]!]!.node.id,
            vertices[fin.end]!.id,
            fins[other]!.node.id,
            fin.edge.node.id,
            0,
            nextAtVertex === undefined ? 0 : fins[nextAtVertex]!.node.id,
            fin.start === fin.edge.start ? "+" : "-",
          ]
        })
      })
    })
    edges.forEach((edge, i) => {
      edge.node.fields = [
        edge.node.id,
        0,
        "?",
        fins[edge.fins[0]!]!.node.id,
        edges[i - 1]?.node.id ?? 0,
        edges[i + 1]?.node.id ?? 0,
        edge.curve.id,
        0,
        0,
        body.id,
      ]
      edge.curve.fields = [
        edge.curve.id,
        0,
        edge.node.id,
        edges[i + 1]?.curve.id ?? 0,
        edges[i - 1]?.curve.id ?? 0,
        0,
        "+",
        ...points[edge.start]!,
        ...unit(sub(points[edge.end]!, points[edge.start]!)),
      ]
    })

    // Native system attributes are linked both from each colored owner and
    // through the body's per-definition attribute chains. The RGB triple is one
    // real-valued attribute field with three values, not three separate fields.
    const attributeChains = new Map<8001 | 8040, RecordNode[]>()
    const attachColor = (
      owner: RecordNode,
      kind: 8001 | 8040,
      color: ParasolidColor,
    ) => {
      const definition = colorDefinition(kind)
      const values = add(83, 3)
      values.fields = [...color]
      const attribute = add(81, 1)
      attribute.fields = [
        attribute.id,
        definition.id,
        owner.id,
        0,
        0,
        0,
        0,
        values.id,
      ]
      owner.fields[1] = attribute.id
      const chain = attributeChains.get(kind) ?? []
      const previous = chain.at(-1)
      if (previous) {
        previous.fields[5] = attribute.id
        attribute.fields[6] = previous.id
      }
      chain.push(attribute)
      attributeChains.set(kind, chain)
    }
    if (input.color) attachColor(body, 8040, input.color)
    faces.forEach((face, index) => {
      const color = input.faceColors?.[regions[index]!.source] ?? input.color
      if (color) attachColor(face, 8001, color)
    })
    if (attributeChains.size > 0) {
      const heads = [...attributeChains.values()].map((chain) => chain[0]!.id)
      const list = add(70)
      const block = add(74, 20)
      list.fields = [
        0,
        4,
        false,
        body.id,
        0,
        0,
        heads.length,
        20,
        1,
        block.id,
        block.id,
      ]
      block.fields = [
        heads.length,
        0,
        0,
        ...heads,
        ...Array<number>(20 - heads.length).fill(0),
      ]
      body.fields[2] = list.id
      body.fields[0] = records.length
    }
  })

  // Characters and null-real '?' have no separator; numeric fields have one.
  // A single logical line avoids physical-line whitespace ambiguity.
  // Fixed V30 field order follows the published XT format and the MIT-licensed
  // parasolid-kit SCH_3000000_30000 schema, which independently reads this file.
  const version = ": TRANSMIT FILE created by modeller version 3000000"
  const schema = "SCH_3000000_30000"
  const header = `T${version.length} ${version}${schema.length} ${schema}0 `
  return (
    header +
    records
      .map(
        (node) =>
          `${node.type} ${node.variableCount === undefined ? "" : `${node.variableCount} `}${node.id} ` +
          node.fields
            .map((field) => {
              if (typeof field === "number")
                return `${Object.is(field, -0) ? 0 : field} `
              if (typeof field === "boolean") return field ? "T" : "F"
              return field
            })
            .join(""),
      )
      .join("") +
    "1 0\n"
  )
}
