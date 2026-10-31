import { expect, test } from "bun:test"
import {
  Attribute,
  AttributeDefinition,
  AttributeIdentifier,
  Body,
  EntityReference,
  Face,
  getEntityColor,
  PointerList,
  PointerListBlock,
  parseRepository,
  RealArray,
  Repository,
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
  attribute.resolve(repo).definitionRef = new EntityReference(999)
  expect(getEntityColor(repo, face.resolve(repo))).toBeUndefined()
})

test("PointerList and PointerListBlock support full constructor initialization and round-trip", () => {
  const repo = new Repository()
  const body = repo.add(new Body())
  const attr = repo.add(new Attribute())
  const block = repo.add(
    new PointerListBlock({
      indexOrigin: 1,
      entries: [attr, null],
    }),
  )
  const list = repo.add(
    new PointerList({
      localId: 2,
      entryKind: 4,
      transmissionFlag: true,
      ownerRef: body,
      entryCount: 1,
      blockCapacity: 2,
      cursorIndex: 1,
      cursorBlock: block,
      firstBlock: block,
    }),
  )
  body.resolve(repo).attributeLists = list

  const parsed = parseRepository(repo.getString())
  const parsedList = parsed.get<PointerList>(list.id)!
  const parsedBlock = parsed.get<PointerListBlock>(block.id)!
  expect(parsedList.localId).toBe(2)
  expect(parsedList.ownerRef?.id).toBe(body.id)
  expect(parsedList.entryCount).toBe(1)
  expect(parsedList.blockCapacity).toBe(2)
  expect(parsedList.firstBlock?.id).toBe(block.id)
  expect(parsedBlock.usedCount).toBe(1)
  expect(parsedBlock.indexOrigin).toBe(1)
  expect(parsedBlock.entries.map((entry) => entry?.id ?? null)).toEqual([
    attr.id,
    null,
  ])
  expect(() =>
    parseRepository(
      "T51 : TRANSMIT FILE created by modeller version 300000017 SCH_3000000_30000-1 1 0 ",
    ),
  ).toThrow("Invalid XT user field size")
})
