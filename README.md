# parasolidts

TypeScript classes, parser, and writer for a small documented subset of Parasolid
text (`.x_t`). Closed polygon models become planar B-Rep solids that can be
validated with an independent reader and OpenCascade.

This is an initial implementation. It writes faceted surfaces: a polygonal
cylinder remains a polygonal cylinder. Native import in Siemens Parasolid or
Shapr3D has **not** been verified yet.

```sh
bun add parasolidts
```

The npm package ships compiled ES modules and TypeScript declarations. It has
no runtime dependencies.

## Write a model

```ts
import { createParasolidFromPolygons } from "parasolidts"

const xt = createParasolidFromPolygons([
  [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]],
  [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
  [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
  [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]],
  [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
  [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
])

await Bun.write("cube.x_t", xt)
```

Inputs use millimetres by default; `{ units: "m" }` accepts metres. The writer
always transmits metre coordinates. Use `createParasolidFromBodies([{ polygons },
...])` for multiple solids. The initial writer does not encode names.

RGB colors are preserved in native Parasolid attributes:

```ts
const xt = createParasolidFromBodies([
  {
    polygons,
    color: [0.1, 0.2, 0.8], // body default, channels in [0, 1]
    faceColors: polygons.map((_, index) => index === 0 ? [1, 0, 0] : undefined),
  },
])
```

`faceColors`, when supplied, must have one entry per input polygon. A face color
overrides the body default. The writer uses the documented `SDL/TYSA_COLOUR_2`
body attribute (8040), and writes the effective color on each face using
`SDL/TYSA_COLOUR` (8001). These are actual X_T attributes, retained through
parsing and editing. Only RGB is exported; alpha/transparency and materials are
outside this release. Color display still depends on the importing CAD program.

Input polygons must form closed, orientable, planar manifold surfaces. Open or
nonmanifold geometry is rejected. Disconnected shells and enclosed cavity shells
must not be combined into a single input body. This is a faceted-solid exporter,
not a curved-surface reconstruction or Boolean modeling kernel.

The writer welds matching vertices and splits T-junctions at a fixed `1e-9 m`
tolerance, then repairs face winding to point outward. `normalizePolygons`
exposes that same welding and edge splitting, preserving input units, for
callers that need to separate connected components before writing.

For JSCAD/modelprinter inputs, use
[jscad-to-parasolid](https://github.com/tscircuit/jscad-to-parasolid).

## Parse and edit

```ts
import { Point, Vector3, parseRepository } from "parasolidts"

const repository = parseRepository(await Bun.file("cube.x_t").text())
for (const [, entity] of repository.entries()) {
  if (entity instanceof Point) {
    entity.position = new Vector3([entity.position.x + 0.001, entity.position.y, entity.position.z])
  }
}
// Point-only edits demonstrate the API; moving an entire solid also requires
// updating the corresponding line and plane geometry.
const modified = repository.getString()
```

`Repository` owns entities and allocates IDs with `add(entity)`.
ID `0` requests allocation only for newly authored entities; transmitted records
must already have positive integer indices. Serialization rejects invalid or
duplicate IDs introduced by editing, without renumbering entities or references.
`EntityReference<T>.resolve(repository)` resolves typed references. Constructors
accept init objects. `Body`, `Region`, `Shell`, `Face`, `Loop`, `Fin`, `Edge`,
`Vertex`, `Point`, `Line`, `Plane`, and `IntegerArray` expose typed properties.
`AttributeIdentifier`, `AttributeDefinition`, `Attribute`, `RealArray`,
`PointerList`, and `PointerListBlock` preserve native attribute records.
`getEntityColor(repository, bodyOrFace)` reads its attached standard RGB attribute.
`getChildren()` and `entries()` support inspection.

Typed decoding covers the fixed-layout `SCH_3000000_30000` schema, zero user
fields, and those entity types. Unmodified source is returned byte-for-byte,
including header fields and physical line wrapping. Unsupported schemas and
unknown record suffixes become `UnknownEntity` data, because unknown record
boundaries cannot be inferred safely. Such documents report `fullyParsed ===
false` and can round-trip, but edits are rejected. Binary `.x_b`, arbitrary
producer schemas, embedded schema changes, unsupported attribute value types, and analytic curved
entities are outside this release's editable subset.

`parseParasolid` is an alias of `parseRepository`; `stringifyParasolid(repo)`
calls `repo.getString()`. The parser is not a geometry validator.
`repo.getString({ canonical: true })` forces canonical serialization through
the typed entities, even when the input was not edited.

## Validation

```sh
bun install
bun test
bun run typecheck
bun run format:check
```

Unit tests cover editing, references, exact source round-trips, unknown data,
and invalid geometry. A project-authored fixture from the independent
`parasolid-kit` project checks format framing without using this writer.

The companion converter's integration tests read the generated `.x_t` with
`parasolid-kit`, construct and validate an OCCT B-Rep, check geometric metrics,
export GLB, and render it with `poppygl` for image snapshots. OpenCascade does
not natively read Parasolid; `parasolid-kit` provides the explicit reader and
adapter. This gives independent structural and geometric evidence, not
Parasolid-kernel or Shapr3D certification.

Format references and upstream license notices are in
[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

MIT license.

## Publishing

Releases use `.github/workflows/npm-publish.yml` on a `v<package-version>` tag
or a manual run on `main`. The workflow validates tests, formatting, and types,
builds the npm tarball, and publishes with GitHub OIDC and provenance. It does
not use an npm token. Increment `package.json` before a new release.

Configure the npm package's trusted publisher with GitHub organization
`tscircuit`, repository `parasolidts`, workflow filename `npm-publish.yml`,
no environment name, and **Allow npm publish** enabled. See
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
A new package must first be created with an authenticated initial publish
before its npm settings can be configured.

With npm 11.15+ and an authenticated maintainer session, configure the publisher
using the CLI (npm may require browser verification):

```sh
npm trust github parasolidts --repo tscircuit/parasolidts --file npm-publish.yml --allow-publish
```

## Coplanar face merging

The polygon writer merges edge-connected coplanar polygons with matching effective
RGB colors into single trimmed planar faces by default. Outer boundaries and hole
loops are preserved, as are shared boundary vertices. This removes triangulation
edges on flat caps without fitting curved surfaces or changing the mesh resolution.
Ambiguous, crossing, or nearly touching boundaries retain their original polygons.
Set `mergeCoplanarFaces: false` in the write options to preserve the input faces.
The distance tolerance is 1e-9 meters; the normal-angle tolerance is 1e-10 radians.
