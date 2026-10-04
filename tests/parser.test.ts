import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import {
  Body,
  EntityReference,
  IntegerArray,
  Point,
  Repository,
  UnknownEntity,
  Vector3,
  parseRepository,
} from "../lib"

test("independent parasolid-kit fixture parses typed arrays and round-trips byte-identically", () => {
  const source = readFileSync(
    new URL("./fixtures/parasolid-kit-values.x_t", import.meta.url),
    "utf8",
  )
  const repository = parseRepository(source)
  expect(repository.fullyParsed).toBe(true)
  expect(repository.get<IntegerArray>(1)).toBeInstanceOf(IntegerArray)
  expect(repository.get<IntegerArray>(1)?.values).toEqual([0, null, 2147483647])
  expect(repository.get<IntegerArray>(91)?.values).toEqual([])
  expect(repository.getString()).toBe(source)
})

test("editing a parsed property is reflected in the serialized file", () => {
  const source = readFileSync(
    new URL("./fixtures/parasolid-kit-values.x_t", import.meta.url),
    "utf8",
  )
  const repository = parseRepository(source)
  const values = repository.get<IntegerArray>(1)
  if (!values) throw new Error("Missing fixture array")
  values.values[0] = 42
  expect(repository.getString()).not.toBe(source)
  expect(
    parseRepository(repository.getString()).get<IntegerArray>(1)?.values[0],
  ).toBe(42)
})

test("typed entities and references support manual authoring", () => {
  const repository = new Repository()
  const body = repository.add(new Body({ bodyKind: 1 }))
  const point = repository.add(
    new Point({ position: new Vector3([1, 2, 3]), ownerRef: body }),
  )
  expect(point.resolve(repository).position.toArray()).toEqual([1, 2, 3])
  expect(body.resolve(repository)).toBeInstanceOf(Body)
  expect(repository.bodies).toHaveLength(1)
  const parsed = parseRepository(repository.getString())
  expect(parsed.get<Point>(point.id)?.position.toArray()).toEqual([1, 2, 3])
  expect(parsed.get<Point>(point.id)?.ownerRef?.resolve(parsed)).toBeInstanceOf(
    Body,
  )
  expect(() => new EntityReference(500).resolve(parsed)).toThrow("Unresolved")
})

test("physical line wrapping and common header fields are preserved", () => {
  const repository = new Repository()
  repository.add(new IntegerArray({ values: [12345, -3, null] }))
  const common =
    "**PART1;FORMAT=text;CUSTOM=future;\n**PART2;SCH=ignored;\n**PART3;\n**END_OF_HEADER***\n"
  const input = common + repository.getString().replace("12345", "12  \n345")
  const parsed = parseRepository(input)
  expect(parsed.get<IntegerArray>(1)?.values).toEqual([12345, -3, null])
  expect(parsed.getString()).toBe(input)
  expect(parsed.header.commonHeader).toContain("CUSTOM=future")
})

test("unknown records preserve the whole unsupported suffix and refuse unsafe edits", () => {
  const source = new Repository()
    .getString()
    .replace("1 0 ", "999 4 arbitrary future data 1 0 ")
  const parsed = parseRepository(source)
  expect(parsed.fullyParsed).toBe(false)
  expect(parsed.getChildren()[0]).toBeInstanceOf(UnknownEntity)
  expect(parsed.getString()).toBe(source)
  parsed.add(new Point())
  expect(() => parsed.getString()).toThrow("opaque")
})

test("unknown schemas remain lossless without assigning known fields", () => {
  const source = new Repository().getString().replaceAll("30000", "39999")
  const parsed = parseRepository(source)
  expect(parsed.fullyParsed).toBe(false)
  expect(parsed.getString()).toBe(source)
})

test("malformed supported records and truncation are rejected", () => {
  expect(() => parseRepository("not XT")).toThrow()
  const repository = new Repository()
  repository.add(new Point({ position: new Vector3([1, 2, 3]) }))
  expect(() =>
    parseRepository(repository.getString().replace("1 0 ", "")),
  ).toThrow()
  expect(() =>
    parseRepository(repository.getString().replace("1 2 3 ", "NaN 2 3 ")),
  ).toThrow()
  expect(() => repository.add(new Body({ id: 1 }))).toThrow("Duplicate")
})
