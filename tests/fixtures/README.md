`parasolid-kit-values.x_t` is the unmodified project-authored synthetic framing
fixture from parasolid-kit, commit `9aa9dfca890820728a2860548846705990d8435e`:

https://github.com/monozukuri-ai/parasolid-kit/blob/9aa9dfca890820728a2860548846705990d8435e/corpus/generated/synthetic/release-v1/values.x_t

Its generator is tracked at `tests/support/release_fixture.py` in that commit.
The fixture covers independent field framing, unset values and empty arrays;
it is not a CAD-exported solid or proof of Parasolid-kernel compatibility.
The upstream MIT license is reproduced in `THIRD_PARTY_NOTICES.md`.

`parasolid-kit-character-escapes.x_t` and `parasolid-kit-compressed-spaces.x_t`
are exact text payloads produced by that same commit's independent
[`text_escapes_and_space_compression_preserve_array_lengths` test](https://github.com/monozukuri-ai/parasolid-kit/blob/9aa9dfca890820728a2860548846705990d8435e/crates/parasolid-core/tests/builtin_sch30000.rs)
using the test's [`pair` framing helper](https://github.com/monozukuri-ai/parasolid-kit/blob/9aa9dfca890820728a2860548846705990d8435e/crates/parasolid-core/tests/support/sch30000.rs).
The type-79 cases contain the four native character escapes and the nine-space
escape respectively. Their decoded values were also checked with the separately
installed `parasolid-kit` Python reader. They contain no CAD geometry.
