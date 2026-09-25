# Seville and Seria Art Production Report

Date: 2026-09-13. Status: concrete PNG candidates produced; no production approval or runtime installation.

Continuation: [2026-09-14 bounded art pass and offline interior review](../SevilleSeria_20260914/REPORT.md). The results below remain the historical first pass.

## Tool Availability and Models

- Built-in `image_gen.imagegen` was called six times. All six calls returned actual PNG files. No quota/usage-limit error occurred in this task. Exact quota error: none.
- Coding agent: GPT-6, as identified by the active session model-switch instruction. The exact deployment/variant identifier is not exposed here; no Astra or Luna tier is asserted.
- Image engine: built-in `image_gen.imagegen`. Its responses expose image data and save-location hints, but no underlying image-model identifier. The image backend is therefore **not disclosed**, not assumed to be the coding model or a specific GPT Image version.
- Built-in mode only. No API/CLI fallback, alternate browser, browser bypass, or external service was used.
- Full prompts, call order, reference paths, original generated-image paths, dimensions and SHA-256 hashes are in [provenance.json](provenance.json).

## Instructions and References

Searched for AGENTS.md in the project, Documents tree, each ancestor through filesystem root, and the user Codex root. No AGENTS.md was found, so no local AGENTS content could be read. Read the imagegen skill at `/Users/seol-eunjin/.codex/skills/.system/imagegen/SKILL.md`.

Inspected these original images without changing them:

- `Assets/Resources/Sprites/Game/StartPortArt/reference_13.png`: north-up overhead RPG composition, north civic row, open plaza, side buildings, waterfront/pier.
- `Assets/Resources/Sprites/Game/StartPortArt/reference_12.png`: detailed stone, timber, iron, canvas and cargo materials. Its sunset and street-level camera were deliberately excluded from the daytime generation brief.
- `Assets/Resources/Sprites/Game/V17/Captains/captain_portraits_v17.png`: Seria is the top-center auburn-haired woman, burgundy coat with gold lapels, ivory blouse and brown waistcoat.

Read `Docs/startport_cast.json`, the existing art-progress reports and existing Seria generation/manifest records. Existing Seria drafts already had unresolved walking-phase issues. User-verified scope is **120 start-port floors and 108 pending cast identities**. These counts were not reduced by any work in this pass.

## Files and Inspection

Every new file is staged in this Docs directory, outside Unity Resources, for review. Existing assets, cast data and Web code were not edited.

| File | Actual PNG size | Review |
| --- | --- | --- |
| [seville_day_source_v1_review.png](seville_day_source_v1_review.png) | 1672 x 941 RGB | Superseded: market entrance unclear; stray edge buildings. |
| [seville_day_source_v2_review.png](seville_day_source_v2_review.png) | 1672 x 941 RGB | Best town candidate: market door corrected, main side-edge roof fragments removed, ten principal doors visible. Not production-approved. |
| [seville_foreground_v1_rejected.png](seville_foreground_v1_rejected.png) | 1672 x 941 RGB | Rejected: checkerboard is baked into opaque pixels; not usable foreground transparency. Registration also unapproved. |
| [seria_atlas_v1_rejected.png](seria_atlas_v1_rejected.png) | 1145 x 1374 RGB | Rejected: eleven columns, baked checkerboard, insufficient alternating walk poses. |
| [seria_atlas_v2_rejected.png](seria_atlas_v2_rejected.png) | 1145 x 1374 RGB | Targeted correction did not fix the principal atlas/alpha defects. Rejected. |
| [seria_east_walk_study_v1_review.png](seria_east_walk_study_v1_review.png) | 1024 x 1536 RGB | Six dedicated east-profile poses on explicitly requested magenta matte. Useful pose study only, not a finished six-frame cycle. |

All six outputs were visually inspected. `sips` independently confirmed dimensions and `hasAlpha: no` for each. SHA-256 hashes were recorded after copying the original outputs into this project. No resampling, recoloring, alpha reconstruction, hat overlay, stock-body composite or procedural replacement was applied.

## Seville Findings

The revised town uses clear daylight, readable stone and timber, terracotta roofs, blue water, greenery and distinct civic/working buildings. The cartography guild is identifiable by its large brass armillary; harbor office by its lookout tower; shipyard by timber ribs. The central fountain is dry and the center street visually connects toward the pier.

The following requirements remain unresolved:

- The requested exact 1920 x 1080 export was not honored by either town generation. Native output remains 1672 x 941. No file is mislabeled as a native 1920 x 1080 asset.
- The foreground extraction is opaque RGB and rejected. A usable registered background/foreground pair does not yet exist.
- Some uppermost architectural details still meet or clip the top boundary, especially around the guild. Overall roof-margin compliance is not approved.
- Water begins approximately at source y=806, or logical y=30.84, rather than the intended y=32. The river band is about 14.3% of image height. Integration must use observed geometry or request a further shoreline correction.
- Visual bounding boxes are not collision polygons. Door steps, trees, market clutter, harbor cargo, lamps and pier parapets still need traced collision and reachability checks.
- No runtime test or gameplay visual approval was performed. The new source does not replace the active Seville town.

## Seville Integration Proposal

[seville_integration_proposal.json](seville_integration_proposal.json) separates **prompt intent** from **observed source coordinates**. All coordinates below use top-left origin, x right/y down. Door thresholds are approximate visual estimates, with at least +/-8 source-pixel uncertainty. Approach points are proposed open street positions, not verified spawn/interaction locations.

Footprint intent is `x, y, width, height` in 64 x 36 logical tiles. Actual visual envelopes are separately included in the JSON and must not be treated as exact ground footprints.

| Landmark / facility ID | Intended footprint, tiles | Intended door, tiles | Observed threshold, source px | Proposed approach, source px |
| --- | --- | --- | --- | --- |
| bank | 2, 1, 8, 9 | 6, 10 | 181, 257 | 181, 296 |
| estate | 13, 1, 10, 9 | 18, 10 | 529, 263 | 529, 296 |
| mansion | 26, 1, 10, 9 | 31, 10 | 834, 248 | 834, 296 |
| guild | 39, 1, 10, 9 | 44, 10 | 1176, 259 | 1176, 296 |
| lodge | 53, 1, 9, 9 | 57, 10 | 1480, 257 | 1480, 296 |
| market | 2, 15, 9, 7 | 6, 22 | 236, 528 | 236, 560 |
| inn | 14, 15, 9, 7 | 18, 22 | 531, 530 | 531, 560 |
| home | 8, 25, 10, 4 | 13, 29 | 402, 738 | 402, 767 |
| harbor | 49, 15, 12, 7 | 55, 22 | 1280, 525 | 1280, 559 |
| shipyard | 44, 25, 16, 4 | 50, 29 | 1194, 730 | 1194, 767 |

Coordinate conversions:

- Source to logical tile: `[x * 64 / 1672, y * 36 / 941]`.
- Source to intended 1920 x 1080 display plane: `[x * 1920 / 1672, y * 1080 / 941]`. This is an integration transform, not evidence of an exported file.
- Target display scale is 30 pixels per logical tile.
- A bottom-left Unity implementation must invert y once: `36 - sourceY * 36 / 941`.

Additional observed/proposed landmarks:

- Dry fountain visual envelope: `[782, 403, 109, 115]` source pixels. Trace basin/pedestal collision; leave both side routes open.
- Main east-west road candidate: `[28, 293, 1609, 37]`. Door approaches join from the north; trace the nearby lamps and planting beds.
- Central southbound route candidate: `[784, 532, 94, 230]`; suggested town spawn `[834, 737]`. Neither is collision-tested.
- Central pier visual envelope: `[759, 764, 154, 165]`; conservative interior walking core `[785, 818, 100, 72]`; proposed landing `[834, 854]`.
- River is blocked except for the independently traced pier. Do not make all pixels below the quay walkable.
- Intended foreground objects are tree canopies/trunks and market/lodge/shipyard awnings. Their ground footprints and y-sort anchors must be separate from the opaque silhouette. The rejected foreground must not be bound to a renderer.
- Keep roofs in the base where the ground beneath is blocked. Trace any roof overhang separately if a walkable route passes beneath it. An always-on full-building overlay is not approved.

## Seria Contract and Findings

Identity: `ines`, display name Seria Allen / 세리아 알렌. The full sheets directly used the existing portrait atlas as an identity reference. The pose study also directly referenced that portrait, not another character's sprite.

Required final format remains 48 x 72 pixels per frame, 8 directions, 4 idle + 6 walk frames per direction: **80 frames**, conventionally a 480 x 576 atlas. Intended row order is N, NE, E, SE, S, SW, W, NW; idle columns 0-3, walk columns 4-9; top-left local foot pivot `[24, 69]`. Character pixels should be opaque with genuinely transparent exterior/gutters.

The generated full sheets preserve the auburn tied-back hair and broad costume identity, but contain **11 columns x 8 rows** rather than the requested 10 x 8. The last walking poses repeatedly extend the same leg; idle differences are also too subtle to approve. Actual PNGs have no alpha channel. No frame slicing or animation-ready manifest is fabricated for those files.

The six-pose east-facing study improves silhouette variety: wide stance, bent-knee stance and raised-knee passing poses are visibly different. However, the raised knee is exaggerated for normal walking, alternate-leg/arm phases remain uncertain and the two rows look too similar. It has variable figure scale and magenta matte, not production transparency or 48 x 72 cells. It is not an accepted full walk loop and supplies no idle or other seven-direction frames.

**No cast identity is marked complete or dedicated-art approved.** Further work should establish one physically convincing six-frame walk loop before scaling it to all directions and idle poses.

## Floor Preparation and Scope

No new floor art was generated in this pass. Following the user's latest steering, generation stayed on concrete Seville and Seria work; the other five towns were not attempted and the 108 cast identities were not individually designed.

A focused floor queue was prepared from the existing integration definitions:

| Priority | Scene | Existing evidence | Preparation needed |
| --- | --- | --- | --- |
| 1 | Seville guild B1 | Existing report says the old V21 basement is retained; reference_02 is market 2F, not guild B1. | Inspect retained basement, then create dedicated storage/repair art with reciprocal stair landing. Do not reuse reference_02 as B1. |
| 2 | Seville market 1F | Supplied detailed art binds market 2F; no market 1F replacement in the eleven-reference binding list. | Inspect current market 1F; prepare connected ground-floor trading room matching its upper floor. |
| 3 | Seville lodge 1F | Supplied detailed art binds lodge 2F; no lodge 1F replacement in that binding list. | Inspect current ground floor and prepare reception/stair counterpart to existing bedroom. |

These are gaps in the supplied detailed-art bindings, **not claims that no existing floor graphics exist**. Before floor generation, inspect the relevant current image and reciprocal stairs; retain old art until the new source, foreground, dimensions and access points pass review.

## Handoff

Concrete result: two Seville town source PNGs, one rejected foreground attempt, two rejected Seria full-sheet attempts, one Seria pose-study PNG, full generation provenance, and a proposed Seville landmark/door mapping. Production-approved new assets: **zero**.

Remaining: exact-size town export, accepted foreground/occlusion, collision verification, Seria animation/alpha/frame-grid correction, the other five towns and the uncompleted floor/cast art. This task encountered quality/output-contract failures, not an image quota block.
