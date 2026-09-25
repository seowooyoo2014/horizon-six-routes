# Seville / Seria Bounded Art Pass

Date: 2026-09-14. Continues [the previous report](../SevilleSeria_20260913/REPORT.md).
Scope: image generation and design review only. No active JS, existing art, cast data or runtime bindings edited.

## Actual Tool Result

**Three built-in imagegen calls, three actual PNG results, no quota error, zero production-approved outputs.**

1. Reused the existing Seville v2 candidate for a foreground extraction.
2. Generated an eight-direction Seria standing design from the original portrait.
3. Made one targeted Seria accessory-continuity correction.

The bounded pass stopped after the targeted correction also failed. No 80-frame atlas, additional town or floor was generated. No browser, browser bypass, API fallback or different engine was used.

Model assignment, explicitly confirmed by the user: **Astra / high (`gpt-6-astra`)**. This assignment is recorded from the user's instruction; this tool session does not independently expose its current runtime model ID, and this task did not perform a model switch. Image engine: **built-in `image_gen.imagegen`**, underlying image-backend identifier not returned. The agent assignment and image backend are separate.

The imagegen skill was re-read. See [provenance.json](provenance.json) for exact full prompts, references, original generation paths, hashes, actual dimensions and capture-review evidence.

## Accepted / Rejected

**Production-accepted new assets: none.**

| Asset | Result | Reason |
| --- | --- | --- |
| Existing [Seville day v2](../SevilleSeria_20260913/seville_day_source_v2_review.png) | Retained working source candidate | Re-inspected; file preserved exactly. Prior export/collision limitations remain. No new approval of integrated town behavior. |
| [Foreground v2](seville_foreground_v2_rejected.png) | Rejected | Actual 1672 x 941 RGB PNG, no alpha. Baked checkerboard; new awning support poles and extra crane content show that this is not a faithful extraction. |
| [Seria eight-direction design v1](seria_eight_direction_design_v1_review.png) | Reference-only, incomplete design | Exactly eight standing views in correct reading order; portrait hair/costume broadly retained. Satchel switches anatomical sides across front/back views. |
| [Seria design correction v2](seria_eight_direction_design_v2_rejected.png) | Rejected correction | Targeted edit still places the north-view satchel on screen-right, and the west-view near-side bag remains absent. |

Both Seria files are 1322 x 1190 RGB. Their solid magenta background was explicitly requested for **design review**, not presented as transparency. These are neither 48 x 72 game frames nor accepted animation atlases.

Accepted design observations, not asset approval: the auburn low bun and loose curls, burgundy coat with gold lapels, ivory blouse and brown waistcoat are consistent with the top-center portrait. All eight requested facing views are visually identifiable. Original portrait-based generation was used; no recolor, hat composite, stock-body assembly or reuse of rejected atlas frames was applied.

## Seville Foreground Handoff

The unchanged source SHA-256 remains:
`e4a320fbfcc0ea3f4be85a90b88a1892f67e3a9008f278839154789bd07bd0e6`.

**There is no genuine transparent registered foreground to integrate.** Do not treat the checkerboard background as transparency or activate this generated layer. Both the alpha contract and retained-object fidelity failed.

[design_coordinates.json](design_coordinates.json) contains source-relative regions for the market, lodge, harbor and shipyard canvas, and eight central plaza trees. These are approximate tracing guides, not finished masks or collision footprints. The existing [door/landmark proposal](../SevilleSeria_20260913/seville_integration_proposal.json) remains the coordinate reference.

- Source plane: 1672 x 941, top-left origin.
- Logical map: 64 x 36.
- Conversion: `tileX = sourceX * 64 / 1672`, `tileY = sourceY * 36 / 941`.
- Intended display plane: 1920 x 1080. No new exact-size export was produced.
- Final extracted foreground must retain source colors and registration, with actual zero-alpha background and object-specific ground anchors.
- Do not move map geometry or doors to follow altered objects in the generated foreground.
- Remaining boundary planting/cypresses need tracing wherever they overlap a permitted actor route.
- Town integration remains owned by Luna task `01a09ffe-1df0-78d1-8316-1a266cda920a` per user. Coordination is through the user; no direct task message was sent.

## Seria Design Gate

Required direction order: N, NE, E, SE, S, SW, W, NW.
Current concept layout: four columns by two rows. Its fractional cell width of 330.5 pixels is a **review region**, not a valid sprite slicing instruction.

The satchel continuity rule is anatomical: LEFT hip, strap from RIGHT shoulder. Thus the north/back view bag must be screen-left, south/front screen-right, east-profile mostly hidden on the far side, west-profile visible on the near side. Both new sheets fail this continuity gate. The camera and detail also need to be reduced to the intended elevated RPG pixel scale.

Do not generate the complete animation atlas from this unaccepted turnaround. Required final export remains 48 x 72 per frame, top-left foot pivot [24,69], eight rows, four idle and six walk frames per row, total 480 x 576. None of those frames is claimed complete in this pass.

## Offline Interior Visual Review

These are **offline captures from the actual rendering path**, not browser screenshots or keyboard/gamepad play verification. Image hashes are saved in provenance so findings can be matched to these exact captures.

### Guild 1F, 1920 x 1080

Reviewed `Docs/Screenshots/StartPortArt/GameRenderInterior/seville_guild_1f_1920x1080.png`.

- P2: NPC near the upper-right side of the reception counter, approximate region [1214,225,61,142], appears washed-out/gray with weak separation from the detailed blue floor. This is an appearance mismatch; exact alpha/rendering cause is not established by the still.
- P2: flat beige rectangles near [1200,290,24,30] and [980,865,23,32] look detached from the actors and stylistically unfinished. They may be intended paper/prop marks, so their role should be checked before removal.
- Large chart table, rear counter, left measurement room and right archive remain visually readable. The visible entrance actor is not obviously clipped by the entrance walls.
- No actor is shown passing behind the table/counter or staircase railing. Their occlusion cannot be approved from this image.

### Lodge 2F, 1280 x 720

Reviewed `Docs/Screenshots/StartPortArt/GameRenderInterior/seville_lodge_2f_1280x720.png`.

- P2: companion southeast of the bed, approximate region [437,289,39,69], is faint/washed-out against the floor; the actor beside the bed also reads much coarser than the room art.
- P2: a small beige rectangle beside the bed-side actor, around [409,265,25,24], does not match the surrounding detailed rendering and appears visually detached.
- Bed, chest, desk, open floor and stairs are recognizable. Neither visible actor establishes a clear furniture-overlap defect: both are standing beside the bed.
- Bed-edge and staircase-railing occlusion remain unverified. A still with actors on open floor cannot establish correct depth sorting or collision.

## Verification and Remaining Work

File inspection confirms all three new PNGs have no alpha channel. Their stored copies were checked against original generated files, PNG dimensions and SHA-256 hashes. Seville v2 was checked against its previous provenance hash and preserved.

New files remain under Docs for review. No rejected asset was installed. No cast entry is marked completed. Seville verification remains the gate before work on the other five towns.

Remaining blockers: a real registered alpha foreground, a consistent low-resolution Seria eight-direction design, then verified animation frames; plus runtime appearance and furniture-depth checks assigned to integration. This is an honest partial art result, not a quota block or a completed Seville asset package.

