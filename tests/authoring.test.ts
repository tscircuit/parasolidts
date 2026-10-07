import { expect, test } from "bun:test"
import {
  Repository,
  Body,
  Region,
  Shell,
  Face,
  Loop,
  Fin,
  Edge,
  Vertex,
  Point,
  Plane,
  Line,
  Vector3,
  parseRepository,
} from "../lib"

// A topology fragment exercises native references without geometry inference.
test("authors and edits a native body/region/shell/face/loop graph", () => {
  const repo = new Repository()
  const body = repo.add(new Body({ bodyKind: 1 }))
  const region = repo.add(new Region({ regionKind: "S", bodyRef: body }))
  const shell = repo.add(new Shell({ regionRef: region }))
  const plane = repo.add(new Plane({ normal: new Vector3([0, 0, 1]) }))
  const face = repo.add(new Face({ backShell: shell, surfaceRef: plane }))
  const outer = repo.add(new Loop({ faceRef: face }))
  const inner = repo.add(new Loop({ faceRef: face }))
  body.resolve(repo).regionHead = region
  region.resolve(repo).shellHead = shell
  shell.resolve(repo).backFaces = face
  face.resolve(repo).loopHead = outer
  outer.resolve(repo).nextLoop = inner
  plane.resolve(repo).ownerRef = face

  const parsed = parseRepository(repo.getString())
  const parsedFace = parsed.bodies[0]!.regionHead!.resolve(parsed)
    .shellHead!.resolve(parsed)
    .backFaces!.resolve(parsed)
  expect(parsedFace).toBeInstanceOf(Face)
  expect(parsedFace.surfaceRef!.resolve(parsed)).toBeInstanceOf(Plane)
  const outerLoop = parsedFace.loopHead!.resolve(parsed)
  expect(outerLoop.nextLoop!.resolve(parsed).faceRef!.resolve(parsed)).toBe(
    parsedFace,
  )
  expect(outerLoop.nextLoop!.resolve(parsed).nextLoop).toBeNull()
  // The serializer preserves an explicitly edited topology without merging it.
  outerLoop.nextLoop = null
  const edited = parseRepository(parsed.getString())
  expect(edited.get<Loop>(outer.id)!.nextLoop).toBeNull()
  expect(edited.get<Loop>(inner.id)).toBeInstanceOf(Loop)
})

test("fins retain cyclic links, shared edges, and point/line geometry", () => {
  const repo = new Repository()
  const face = repo.add(new Face())
  const loop = repo.add(new Loop({ faceRef: face }))
  const point = repo.add(new Point({ position: new Vector3([0.001, 0, 0]) }))
  const vertex = repo.add(new Vertex({ pointRef: point }))
  const line = repo.add(new Line({ tangent: new Vector3([1, 0, 0]) }))
  const edge = repo.add(new Edge({ curveRef: line }))
  const a = repo.add(
    new Fin({
      loopRef: loop,
      endVertex: vertex,
      edgeRef: edge,
      orientation: "+",
    }),
  )
  const b = repo.add(new Fin({ edgeRef: edge, orientation: "-", radialFin: a }))
  face.resolve(repo).loopHead = loop
  loop.resolve(repo).finRef = a
  edge.resolve(repo).finRef = a
  a.resolve(repo).forwardFin = a
  a.resolve(repo).backwardFin = a
  a.resolve(repo).radialFin = b
  vertex.resolve(repo).finHead = a
  point.resolve(repo).ownerRef = vertex
  line.resolve(repo).ownerRef = edge

  const parsed = parseRepository(repo.getString())
  const fin = parsed.get<Fin>(a.id)!
  expect(fin.forwardFin!.resolve(parsed)).toBe(fin)
  expect(fin.backwardFin!.resolve(parsed)).toBe(fin)
  expect(fin.radialFin!.resolve(parsed).edgeRef!.id).toBe(fin.edgeRef!.id)
  expect(
    fin.endVertex!.resolve(parsed).pointRef!.resolve(parsed).position.toArray(),
  ).toEqual([0.001, 0, 0])
  expect(
    (
      fin.edgeRef!.resolve(parsed).curveRef!.resolve(parsed) as Line
    ).tangent.toArray(),
  ).toEqual([1, 0, 0])
})
