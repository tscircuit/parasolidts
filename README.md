# parasolidts

TypeScript entity classes, parser, and serializer for a small documented subset
of Parasolid text (`.x_t`). Author and edit the native topology and geometry
records through a repository of typed entities and references.

This is an initial implementation supporting planar surfaces and straight edges.
Native import in Siemens Parasolid or
Shapr3D has **not** been verified yet.

```sh
bun add parasolidts
```

The npm package ships compiled ES modules and TypeScript declarations. It has
no runtime dependencies.

## Author native entities

Like `stepts`, a `Repository` owns native entities connected by typed references.
Parasolid topology is a graph: bodies reference regions and shells, shells
reference faces, faces reference loops, and loops reference cyclic fins. Fins
share edges and vertices; geometry is held in point, line, and plane entities.
The classes mirror those records and expose their named fields.

For example, this constructs a face with linked outer and inner loops inside a
shell (a topology fragment, not a complete closed solid):

```ts
import { Repository, Body, Region, Shell, Face, Loop, Plane, Vector3 } from "parasolidts"

const repo = new Repository()
const body = repo.add(new Body({ bodyKind: 1 }))
const region = repo.add(new Region({ bodyRef: body, regionKind: "S" }))
const shell = repo.add(new Shell({ regionRef: region }))
const plane = repo.add(new Plane({
  origin: new Vector3([0, 0, 0]),
  normal: new Vector3([0, 0, 1]),
  xDirection: new Vector3([1, 0, 0]),
}))
const face = repo.add(new Face({ backShell: shell, surfaceRef: plane }))
const outer = repo.add(new Loop({ faceRef: face }))
const inner = repo.add(new Loop({ faceRef: face }))
body.resolve(repo).regionHead = region
region.resolve(repo).shellHead = shell
shell.resolve(repo).backFaces = face
face.resolve(repo).loopHead = outer
outer.resolve(repo).nextLoop = inner
plane.resolve(repo).ownerRef = face

// Complete the loops with Fin / Edge / Vertex records and the remaining solid
// topology before importing into a CAD kernel.
const xt = repo.getString()
```

`repo.add(entity)` returns an `EntityReference<T>` and allocates an ID when it is
zero. Constructors accept init objects; properties remain editable. Coordinates
are native Parasolid metres. Serialization preserves the authored topology and
does not infer faces, repair meshes, or merge coplanar regions.

For JSCAD/modelprinter conversion, geometry validation, and coplanar merging, use
[jscad-to-parasolid](https://github.com/tscircuit/jscad-to-parasolid), which builds
this native entity graph. The polygon/body factories and `normalizePolygons`
from version 0.0.2 have been removed from `parasolidts` in 0.0.3; callers should
use that converter or construct native entities directly.

Native RGB attributes use `AttributeIdentifier`, `AttributeDefinition`,
`Attribute`, and `RealArray`. Attribute chains reference owners and values;
`getEntityColor(repository, bodyOrFace)` reads standard attached RGB attributes.

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
and native topology and attribute authoring. A project-authored fixture from the independent
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
