import { expect, test } from "bun:test"
import {
  Repository,
  Body,
  Face,
  Attribute,
  AttributeDefinition,
  AttributeIdentifier,
  RealArray,
  getEntityColor,
  parseRepository,
} from "../lib"

test("native RGB attributes are authored, parsed, and edited through entity references", () => {
  const repo = new Repository()
  const body = repo.add(new Body())
  const face = repo.add(new Face())
  const identifier = repo.add(
    new AttributeIdentifier({ value: "SDL/TYSA_COLOUR" }),
  )
  const definition = repo.add(
    new AttributeDefinition({
      identifierRef: identifier,
      kindId: 8001,
      valueKinds: [2],
      allowedOwners: Array.from({ length: 14 }, (_, i) => i === 4 || i === 6),
    }),
  )
  const values = repo.add(new RealArray({ values: [0.1, 0.2, 0.8] }))
  const attribute = repo.add(
    new Attribute({
      definitionRef: definition,
      ownerRef: face,
      valueArrays: [values],
    }),
  )
  face.resolve(repo).annotations = attribute

  const source = repo.getString()
  const parsed = parseRepository(source)
  expect(parsed.getString()).toBe(source)
  expect(getEntityColor(parsed, parsed.get<Face>(face.id)!)).toEqual([
    0.1, 0.2, 0.8,
  ])
  expect(getEntityColor(parsed, parsed.bodies[0]!)).toBeUndefined()
  parsed.get<RealArray>(values.id)!.values = [1, 0, 0]
  const edited = parseRepository(parsed.getString())
  expect(getEntityColor(edited, edited.get<Face>(face.id)!)).toEqual([1, 0, 0])
  expect(edited.get<Attribute>(attribute.id)!.ownerRef!.id).toBe(face.id)
  expect(edited.get<Body>(body.id)).toBeInstanceOf(Body)
})

test("malformed RGB attributes and annotation cycles return no color", () => {
  const repo = new Repository()
  const face = repo.add(new Face())
  const definition = repo.add(
    new AttributeDefinition({
      kindId: 8001,
      valueKinds: [2],
      identifierRef: repo.add(
        new AttributeIdentifier({ value: "SDL/TYSA_COLOUR" }),
      ),
    }),
  )
  const values = repo.add(new RealArray({ values: [1.1, 0, 0] }))
  const attribute = repo.add(
    new Attribute({
      definitionRef: definition,
      ownerRef: face,
      valueArrays: [values],
    }),
  )
  face.resolve(repo).annotations = attribute
  attribute.resolve(repo).nextAnnotation = attribute
  expect(getEntityColor(repo, face.resolve(repo))).toBeUndefined()
  values.resolve(repo).values = [1, 0]
  expect(getEntityColor(repo, face.resolve(repo))).toBeUndefined()
})
