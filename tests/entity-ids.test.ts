import { expect, test } from "bun:test"
import {
  EntityReference,
  IntegerArray,
  Point,
  Repository,
  parseRepository,
} from "../lib"

const stream = (...records: string[]) =>
  new Repository().header.getString() + records.join("") + "1 0 "

test("transmitted zero indices cannot trigger automatic authoring IDs", () => {
  expect(() => parseRepository(stream("82 1 0 42 "))).toThrow(
    "Entity IDs must be positive integers",
  )
  expect(() => parseRepository(stream("82 0 8 ", "82 1 0 42 "))).toThrow(
    "Entity IDs must be positive integers",
  )
  const point = new Point({ id: 7 })
  expect(() =>
    parseRepository(stream(point.toSource().replace(/^29 7 /, "29 0 "))),
  ).toThrow("Entity IDs must be positive integers")
})

test("transmitted negative and duplicate indices are rejected", () => {
  expect(() => parseRepository(stream("82 0 -2 "))).toThrow(
    "Entity IDs must be positive integers",
  )
  expect(() => parseRepository(stream("82 0 7 ", "82 0 7 "))).toThrow(
    "Duplicate Parasolid entity ID 7",
  )
})

test.each([
  0,
  -1,
  1.5,
  NaN,
  Infinity,
  Number.MAX_SAFE_INTEGER + 1,
])("serializing an edited entity ID of %s fails without modifying the entity", (id) => {
  const original = stream("82 1 7 42 ")
  const repository = parseRepository(original)
  const entity = repository.get<IntegerArray>(7)!
  entity.id = id
  for (const canonical of [false, true]) {
    expect(() => repository.getString({ canonical })).toThrow(
      "Entity IDs must be positive integers",
    )
    expect(Object.is(entity.id, id)).toBe(true)
  }
  entity.id = 7
  expect(repository.getString()).toBe(original)
})

test("duplicate IDs introduced by editing cannot be emitted", () => {
  const original = stream("82 1 7 42 ", "82 1 2 9 ")
  const repository = parseRepository(original)
  const second = repository.get<IntegerArray>(2)!
  second.id = 7
  expect(() => repository.getString()).toThrow(
    "Duplicate Parasolid entity ID 7",
  )
  expect(() => repository.getString({ canonical: true })).toThrow(
    "Duplicate Parasolid entity ID 7",
  )
  second.id = 2
  expect(repository.getString()).toBe(original)
})

test("manual authoring still assigns IDs, and sparse out-of-order input retains indices", () => {
  const authored = new Repository()
  authored.add(new IntegerArray({ id: 8 }))
  const automatic = authored.add(new IntegerArray({ values: [42] }))
  expect(automatic.id).toBe(9)
  expect(automatic.resolve(authored).values).toEqual([42])

  const original = stream("82 1 9 42 ", "82 1 2 7 ")
  const parsed = parseRepository(original)
  expect([...parsed.entries()].map(([id]) => id)).toEqual([9, 2])
  expect(parsed.getString()).toBe(original)
  expect(parsed.getString({ canonical: true })).toBe(original)
  parsed.get<IntegerArray>(2)!.values[0] = 11
  const edited = parseRepository(parsed.getString())
  expect(new EntityReference<IntegerArray>(2).resolve(edited).values).toEqual([
    11,
  ])
  expect([...edited.entries()].map(([id]) => id)).toEqual([9, 2])
})
