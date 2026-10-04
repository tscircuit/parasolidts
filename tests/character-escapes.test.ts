import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { AttributeIdentifier, Repository, parseRepository } from "../lib"

test.each([
  ["parasolid-kit-character-escapes.x_t", "\0\r\n\\"],
  ["parasolid-kit-compressed-spaces.x_t", "         "],
])("independent fixture %s decodes, preserves, and canonically reencodes", (filename, expected) => {
  const source = readFileSync(
    new URL(`./fixtures/${filename}`, import.meta.url),
    "utf8",
  )
  const parsed = parseRepository(source)
  expect(parsed.fullyParsed).toBe(true)
  expect(parsed.get<AttributeIdentifier>(1)?.value).toBe(expected)
  expect(parsed.getString()).toBe(source)
  expect(parsed.getString({ canonical: true }).trimEnd()).toBe(source)
  expect(
    parseRepository(
      parsed.getString({ canonical: true }),
    ).get<AttributeIdentifier>(1)?.value,
  ).toBe(expected)
})

test("escaped backslash uses decoded length and may immediately precede the terminator", () => {
  for (const [length, encoded, expected] of [
    [3, String.raw`a\\b`, "a\\b"],
    [1, String.raw`\\`, "\\"],
  ] as const) {
    const source = new Repository()
      .getString()
      .replace("1 0 ", `79 ${length} 1 ${encoded}1 0 `)
    const parsed = parseRepository(source)
    expect(parsed.get<AttributeIdentifier>(1)?.value).toBe(expected)
    expect(parsed.getString()).toBe(source)
    expect(parsed.getString({ canonical: true })).toBe(source)
  }
})

test("editing an escaped identifier emits native character escapes", () => {
  const repository = new Repository()
  const identifier = new AttributeIdentifier({ value: "a\\b" })
  repository.add(identifier)
  const parsed = parseRepository(repository.getString())
  parsed.get<AttributeIdentifier>(1)!.value = "\0\r\n\\         "
  const encoded = parsed.getString()
  expect(encoded).toContain(String.raw`\0\n\r\\\9`)
  expect(parseRepository(encoded).get<AttributeIdentifier>(1)?.value).toBe(
    "\0\r\n\\         ",
  )
})

test("invalid escapes, truncation, and compressed spaces crossing field boundaries are rejected", () => {
  const prefix = new Repository().getString().slice(0, -4)
  expect(() => parseRepository(prefix + String.raw`79 1 1 \x1 0 `)).toThrow(
    "Invalid XT character escape",
  )
  expect(() => parseRepository(prefix + "79 1 1 \\")).toThrow(
    "Truncated XT character",
  )
  expect(() => parseRepository(prefix + String.raw`79 1 1 \91 0 `)).toThrow(
    "character-array boundary",
  )
  expect(() =>
    parseRepository(prefix + String.raw`79 8 1 \982 1 2 4 1 0 `),
  ).toThrow("character-array boundary")
})
