# Third-party notices and format provenance

The field order and names in `lib/entities.ts` adapt the reviewed fixed-layout
V30 definitions from [parasolid-kit sch30000.rs](https://github.com/monozukuri-ai/parasolid-kit/blob/9aa9dfca890820728a2860548846705990d8435e/crates/parasolid-core/src/schema/profiles/sch30000.rs).
The test fixture `tests/fixtures/parasolid-kit-values.x_t` is its project-authored
synthetic framing fixture. Both are pinned to commit
`9aa9dfca890820728a2860548846705990d8435e` and covered by the original
implementation's MIT license below. No Apache-licensed partial-reader code
from that project is included here.

The documented record geometry and wire framing are described in the
[Parasolid XT Format Reference, April 2008](https://ww3.cad.de/foren/ubb/uploads/schulze/XT_Format_April_2008_tcm73-62642.pdf),
particularly printed pages 5–19, 31–32, 54–55, 77–78, and 87–110.
That PDF and proprietary schema catalogs are not redistributed.

Native RGB uses the standard attributes documented in Appendix A.1.1–A.1.2
(printed page 121): `SDL/TYSA_COLOUR` (8001, faces/edges), and
`SDL/TYSA_COLOUR_2` (8040, bodies/instances/assemblies). Attribute records and
their chains follow §§5.4.1–5.4.8. The public worked example in §2.1.4.5
demonstrates the same identifier/definition/attribute/real-array representation.

Independent integration validation uses the separately installed
`parasolid-kit` Python distribution (MIT AND Apache-2.0) and OCCT. Those are
optional development tools, not bundled runtime dependencies. Passing that
adapter does not establish compatibility with the Siemens Parasolid kernel.

## parasolid-kit original implementation

MIT License

Copyright (c) 2026 parasolid-kit contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
