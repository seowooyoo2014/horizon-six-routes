# Seville Foreground and Seria Standing Review

Review date: 2026-09-20. Reviewed the 2026-09-15 deliverables against the unchanged 2026-09-13 Seville source.

## Decision

**Foreground: 14 cutouts accepted for source-registered integration; 10 rejected as-is. The combined foreground is rejected for wholesale runtime activation because it includes the rejected masks.** All 24 pass the pixel-preservation and registration checks. Acceptance below is an asset art decision for fixed placement over this exact source, subject to runtime depth/route verification; it is not approval of an installed town or permission to reuse these as standalone, movable trees/awnings.

**Seria: eight standing direction views accepted as a design reference; the current RGBA export is rejected for runtime use because of retained magenta-contaminated outline pixels.** This is eight standing views, not an 80-frame animation delivery. No animation was reviewed or credited.

Only this report was added. No active JavaScript, assets, manifests, traces, or existing reports were changed. No image generation, recoloring, fabricated hats/accessories, browser access, or browser-denial workaround was used. Read-only image analysis used the bundled Node runtime and `@napi-rs/canvas`; enlarged comparisons were constructed in memory, with no new image files. Luna retains the town/guild/lodge implementation work. No fresh town capture notification arrived during this pass, so existing `town_inspect_*` and interior comparison images were not used to certify current runtime behavior.

Latest user steering: systems priority is door activation, and the image kit currently has `activeforegroundnull`. This review leaves that state untouched and does not expand into integration or additional assets.

## Findings

1. **P1, incomplete occlusion silhouettes:** `plaza-se` has a visibly separated canopy and trunk; its alpha consists of components of 3,256 and 243 pixels. `shipyard-east-tree` similarly has components of 3,668 and 268 pixels. Source inspection confirms dark trunk/junction pixels exist where extraction removes them. Inspect source regions `[922,667,40,39]` and `[1566,624,43,41]`, respectively. Actors behind those junctions could show through. A zero-difference recomposite onto the original background cannot detect this failure because the background supplies the omitted pixels.
2. **P2, cloth masks end inside the object:** both lodge masks omit the lower burgundy border/skirt and include a pale top wall strip. `market-side-canvas` replaces the source's irregular lower cloth edge with a clipped diagonal and misses the outer right/bottom extent. Their declared rectangles are therefore not accepted full-object bounds. Inspect the lodge west lower edge in `[1400,210,50,24]` and market side in `[355,450,36,30]`; these are inspection regions, not replacement traces.
3. **P2, non-object pixels survive selection:** `market-east-tree` contains a conspicuous terracotta roof wedge along its left canopy; `plaza-ne` retains an isolated eight-pixel patch at source `[925,369,2,5]` beside the lamp. `plaza-east-small` has a conspicuous pale/gray planter or paving cluster attached below its roots. `harbor-east-canvas` includes a vertical roof/wall strip at its left edge, and `shipyard-canvas` includes a sizable gray masonry patch at its upper-left corner. These pixels match the original RGB, but source fidelity alone does not make them part of the intended occluder.
4. **P2, Seria matte remnants:** dark purple/magenta outline pixels remain around faces, hair, coat edges, and boots. For example, frame-local RGBA values include N `(14,66)=[87,12,91,255]`, E `(30,24)=[98,6,101,255]`, S `(17,15)=[147,1,96,255]`, and W `(24,68)=[82,0,89,255]`. The contact sheet makes these visible on blue-gray. The key in `prepare_assets.cjs` requires both red and blue above 100, so darker matte-contaminated pixels survive. The audit confirms these colors were sampled from the source, not introduced by recoloring. Alpha-only edge cleanup needs visual judgment to preserve real auburn hair and burgundy fabric; a broad purple deletion rule would be inappropriate.

## Foreground Coordinate Contract

All coordinates below use the original **1672 x 941** source with top-left origin, positive X right, positive Y down. Rectangles are `[x,y,width,height]`, with right/bottom exclusive. `sourceRect` is the stored PNG extent, including transparent padding. `alpha bounds` is the independently measured tight nonzero-alpha extent in source coordinates. Tight alpha bounds are not proposed replacement crops.

`anchor` is the manifest's ground/sort reference in source pixels. `anchorLocal = anchor - sourceRect.xy` was verified for all objects. It is not necessarily an opaque pixel or an in-image pivot: all nine cloth anchors and both southern plaza tree anchors lie below their image rectangles. Do not clamp these anchors or silently move the artwork to the anchor. Placement is at `sourceRect.xy`; equivalent placement relative to the anchor subtracts `anchorLocal`.

Logical coordinate conversion, exactly as declared in the manifest:

```text
tileX = sourceX * 64 / 1672
tileY = sourceY * 36 / 941
```

The viewed `Web/seville_town.js` uses aspect-preserving contain rendering on the 1920 x 1080 plane. Foreground placement must share that transform and camera sampling:

```text
s = 1080 / 941 = 1.1477151965993624
offset = [(1920 - 1672*s)/2, 0] = [0.5100956429330381, 0]
drawSize = [1918.979808714134, 1080]
targetPoint = offset + sourcePoint*s
```

Do not independently stretch the foreground to 1920 x 1080. Logical tile conversion and contained display placement are related but not numerically identical in X. Keep the existing ground geometry fixed during integration.

Exact mask semantics for a later integration:

```text
mask file: foreground_objects/<accepted-id>.png
PNG dimensions: sourceRect.width x sourceRect.height
source position of local pixel (u,v): (sourceRect.x+u, sourceRect.y+v)
coverage: alpha 255 covers; alpha 0 does not cover
color: retained source RGB, normal source-over at opacity 1
ground sort key in logical units: anchor.y * 36 / 941
image placement in source pixels: anchor - anchorLocal = sourceRect.xy
display placement: shared ground contain transform, then shared camera transform
```

Interleave individual masks with actors by ascending ground Y. An actor with feet above an object's anchor is behind it; below is in front. For an exact Y tie, this review's proposed deterministic rule is object first, actor second. This is a handoff rule, not an assertion that current code implements it. Use actor foot positions, never sprite top edges or PNG bottoms. Preserve original object registration; do not recenter crops, normalize out-of-bounds anchors, use bounding rectangles as coverage, or treat contact-sheet colors as transparency. Match the ground renderer's sampling and rounding, and do not use these masks as collision or door-activation geometry.

### Accepted Cutouts

These pass bounded visual inspection for fixed registered overlay use. Tree roots retain small source-colored soil/planter edge details; keep the planter footprints nonwalkable and verify actor overlap near their rims. Acceptance does not mean these are clean freestanding sprite extractions. Cloth acceptance covers the visible cloth, not the whole building or its supports. Ground anchors below are exact authored values, not measurements validated by a live crossing test.

| ID | sourceRect | Alpha bounds | Ground anchor | anchorLocal |
| --- | --- | --- | --- | --- |
| plaza-nw | [677,331,69,79] | [679,333,62,76] | [710,406] | [33,75] |
| plaza-east-upper | [1007,340,72,87] | [1011,346,63,80] | [1043,424] | [36,84] |
| plaza-west-middle | [678,464,71,86] | [682,468,66,81] | [712,548] | [34,84] |
| plaza-east-middle | [917,461,77,89] | [921,464,69,85] | [954,548] | [37,87] |
| plaza-east-outer | [1007,469,72,81] | [1010,470,66,79] | [1043,548] | [36,79] |
| plaza-sw | [691,613,83,90] | [693,614,71,88] | [729,708] | [38,95] |
| home-west-tree | [208,567,79,97] | [209,569,74,94] | [245,660] | [37,93] |
| southwest-tree | [47,566,78,92] | [48,567,73,90] | [85,655] | [38,89] |
| harbor-west-tree | [1151,333,69,82] | [1153,334,64,80] | [1185,412] | [34,79] |
| harbor-east-tree | [1484,329,77,91] | [1488,335,70,84] | [1525,416] | [41,87] |
| market-west-canvas | [116,444,79,52] | [116,444,78,51] | [151,520] | [35,76] |
| market-upper-canvas | [201,375,79,46] | [201,375,78,45] | [239,489] | [38,114] |
| market-east-canvas | [282,450,68,45] | [282,450,67,44] | [313,520] | [31,70] |
| market-farwest-canvas | [81,396,30,38] | [81,396,29,37] | [91,479] | [10,83] |

### Rejected Cutouts

These are the exact existing bounds/anchors for locating and correcting the rejected assets. They are not approved replacement bounds or a revised anchor proposal. Allowed remediation is source-preserving alpha retracing, followed by crop/anchor recomputation if needed; no replacement pixels need to be generated.

| ID | sourceRect | Alpha bounds | Ground anchor | anchorLocal | Rejection |
| --- | --- | --- | --- | --- | --- |
| plaza-ne | [924,325,72,87] | [925,330,67,81] | [960,408] | [36,83] | Detached eight-pixel non-canopy patch beside lamp. |
| plaza-east-small | [1019,423,46,52] | [1020,424,43,50] | [1044,473] | [25,50] | Pale/gray ground cluster beneath roots; separate tree from planter. |
| plaza-se | [904,617,81,87] | [906,618,73,85] | [944,708] | [40,91] | Canopy/trunk junction is cut out. |
| market-east-tree | [338,331,73,84] | [339,333,67,81] | [375,413] | [37,82] | Roof wedge retained inside left canopy. |
| shipyard-east-tree | [1547,570,79,91] | [1549,571,74,89] | [1586,657] | [39,87] | Missing trunk/junction pixels disconnect canopy. |
| market-side-canvas | [360,422,23,50] | [360,422,22,49] | [372,490] | [12,68] | Lower/right silhouette clipped; irregular cloth edge omitted. |
| harbor-east-canvas | [1480,399,49,85] | [1480,399,48,84] | [1510,538] | [30,139] | Left roof/wall strip included in fabric mask. |
| shipyard-canvas | [1246,651,106,45] | [1246,651,105,44] | [1300,731] | [54,80] | Gray masonry patch retained at upper-left. |
| lodge-west-canvas | [1405,199,38,20] | [1405,199,37,19] | [1424,263] | [19,64] | Lower border/skirt omitted; pale top wall strip retained. |
| lodge-east-canvas | [1560,199,35,20] | [1560,199,34,19] | [1578,263] | [18,64] | Lower border/skirt omitted; pale top wall strip retained. |

### Integration Limits

- Use accepted individual `foreground_objects/<id>.png` assets for selective integration. The combined image contains all 24 masks and cannot represent the accepted subset unchanged.
- Sort actors and individual occluders in the same coordinate space using their ground references. A single full-map image drawn after every actor would incorrectly cover actors that stand in front of objects. Anchors alone do not specify collision footprints, door access, or a complete sorting implementation.
- The original ground already contains the objects. Omitted foreground pixels remain visible in a static recomposite but fail to cover an intervening actor. Therefore recomposite equality is a preservation test, not an occlusion-completeness test.
- There are 30 shared opaque source positions between object files: seven in `plaza-east-small` / `plaza-east-outer`, bounded by `[1043,470,6,4]`; 23 in `harbor-east-tree` / `harbor-east-canvas`, bounded by `[1511,414,8,5]`. Shared RGB is identical. This is harmless for the binary-alpha static union, but differing sort anchors can assign the same visible pixel to competing depth rules. Resolve ownership while retracing the rejected objects; each pair currently includes one rejected member.
- The manifest explicitly excludes northern building-front planting and nonwalkable boundary vegetation. This review does not certify all town occluders, roof overlaps, lamps, or route coverage. Do not infer new walkable space from a transparent pixel.
- Runtime evidence still needed: actors behind and in front of accepted trees and awnings, near planter rims, through doors, and at differing camera positions/scales. Inspect the actual town capture when notified. This report makes no determination about Luna's current guild/lodge failure or its repair.

## Seria Standing Frames

Reviewed the source, the actual `seria_direction_design_48x72.png`, all eight frame files by pixel audit, and `seria_direction_design_contact_4x.png`. The corrected source visibly supplies N, NE, E, SE, S, SW, W, NW in that order; SW faces front-left and NW back-left. Auburn hair, low bun, burgundy/gold coat, ivory blouse, and brown clothing remain coherent at the design level. The supplied bag-free design has no obvious large satchel or crossing shoulder strap. No hat fabrication was observed. This assesses the supplied bag-free variant and does not silently restore the previous satchel requirement.

The atlas is **192 x 144**, four columns by two rows. Each cell is **48 x 72**, with top-left foot/baseline pivot **[24,69]**. All measured alpha bounds end at y=68 inclusive; y=69 is the baseline immediately below them. Do not bottom-align the frame at y=72. For a renderer anchored at the character's feet, draw the cell at `feet - [24,69] * scale`. Direction-specific width variation is expected; keep the cell and pivot stable.

| Direction | Atlas rect | Original source content rect | Target content / measured alpha bounds | Opaque pixels |
| --- | --- | --- | --- | --- |
| N | [0,0,48,72] | [102,44,209,479] | [11,9,26,60] | 948 |
| NE | [48,0,48,72] | [458,40,181,487] | [13,9,22,60] | 884 |
| E | [96,0,48,72] | [803,42,141,485] | [16,9,17,60] | 694 |
| SE | [144,0,48,72] | [1118,40,189,487] | [13,9,23,60] | 915 |
| S | [0,72,48,72] | [97,567,207,482] | [11,9,26,60] | 971 |
| SW | [48,72,48,72] | [444,569,186,485] | [13,9,23,60] | 937 |
| W | [96,72,48,72] | [826,568,136,486] | [16,9,17,60] | 683 |
| NW | [144,72,48,72] | [1138,565,185,489] | [13,9,23,60] | 923 |

Source plane is 1448 x 1086, with eight cells of 362 x 543 in the same four-by-two order. Source-content coordinates above are global to that plane. The contact sheet is a four-times nearest-neighbor presentation, not another atlas layout. All frame RGB samples match their calculated source samples, all frame pixels match their atlas cells, and all pivots/content rectangles match the manifest.

Standing design progression is accepted, including the distinguishable corrected SW view. Runtime standing export remains rejected until matte remnants are cleaned and the result is inspected against contrasting backgrounds and at intended town scale. No stride, gait, idle timing, turn transition, or movement animation can be evaluated from one pose per direction. The manifest's historical `requiredAnimationFrames: 80` is a future requirement, not the scope or completion count of this review; `animationFramesCompleted: 0` and `animationReady: false` remain accurate.

## Verification and Provenance

Independent read-only checks, not merely copied manifest claims:

| Check | Result |
| --- | --- |
| Original Seville dimensions | 1672 x 941 |
| Registered foreground dimensions / offset | 1672 x 941 / [0,0] |
| Actual PNG encoding | RGBA color type 6 for all 24 objects, combined foreground, Seria atlas, and eight frames: 34 files |
| Foreground alpha | 67,104 opaque; 1,506,248 transparent; zero partial-alpha pixels |
| Foreground source RGB mismatches | 0 |
| Individual object source RGB mismatches | 0 across all 24 |
| Individual object dimensions, counts, anchor arithmetic | All match manifest |
| Object alpha union versus combined foreground | 0 mismatches |
| Combined foreground over original source | 0 RGBA channel mismatches |
| Seria atlas alpha | 6,955 opaque; 20,693 transparent; zero partial-alpha pixels |
| Seria sampled RGB / frame-to-atlas mismatches | 0 / 0 |

Hashes identify this review snapshot. Later image or manifest changes require reassessment. The existing `artReview: pending` and `runtimeInstalled: false` manifest fields were not edited; they are producer metadata, not this report's decisions or a new runtime audit.

| File | SHA-256 |
| --- | --- |
| ../SevilleSeria_20260913/seville_day_source_v2_review.png | `e4a320fbfcc0ea3f4be85a90b88a1892f67e3a9008f278839154789bd07bd0e6` |
| foreground_manifest.json | `24980792a09ffc51122dc625bceef67aeadf7ce82d6ff110b4e8bffe73b6845e` |
| seville_foreground_registered_1672x941.png | `07c048ec3239cdf6d9ef4c7a78d2e1db358a79c2872eb98af740b2295c65f224` |
| foreground_object_contact.png | `aaceeb681a7cbdae2c0c135cc96c514d4efbbf744c8f5442896b6bd0198e7e91` |
| foreground_silhouette_review.png | `9b2e6e26874c187cbc085a87e245b3e47a8f092e556fb39276ea752df0001f17` |
| seria_bagfree_design_v2_source.png | `f8e79aefd431b3012afd0ec93bee763094d035657516422255c5fcf3d6222814` |
| seria_design_manifest.json | `2c58163ba1a174b30f9e8550d3d00cfe4fc1e7b6a07ddcd4b1b887399b0c5bc2` |
| seria_direction_design_48x72.png | `d43891e02f05a12e01ba471cbf25e74e6e751d4d70e87f13d9ef230b6242b5ac` |
| seria_direction_design_contact_4x.png | `9bd208048ff72712f6564df5ecf91d7f59565ae3b5c63553fb26b39d7bafae52` |
| prepare_assets.cjs (read, not executed) | `89bb18ad4ae871c89673e4aa2649cf29d37fea9ad24de189ba58d38a7e7a6c49` |

## Bounded Adjacency Addendum

Latest handoff: the parent reports the town gate passes, while negative-wall review remains pending and Luna is correcting `buildingSolids`. This is not a new runtime approval. The foreground decisions above remain unchanged, and this review leaves active foreground/visual bindings untouched.

Inspected the source at enlarged scale around the guild/lodge fronts, harbor tower, harbor entrance, and the street immediately south of the harbor. The following coordinates are source-pixel visual guides, not newly traced collision masks. Existing door anchors are exact manifest/proposal values; road/contact edge measurements are approximate and need actor-radius checks.

| Door | Source anchor / existing approach | Source-ground interpretation |
| --- | --- | --- |
| Guild | [1176,259] / [1176,296] | The center doorway opens onto visible steps around y=255..270, then sidewalk to about y=289 and paved road below. Approach from the west/plaza along roughly y=305, then north on x=1176. This does not require crossing the harbor roof. The harbor's huge visual extent beginning at x=1170,y=284 must not erase this clearly visible road. |
| Lodge | [1480,257] / [1480,296] | Center steps around y=255..268 lead to the same sidewalk/road. Approach from the east along roughly y=305, then north on x=1480. The tower lies west of this direct approach. Keep the flanking planters and facade solid; the burgundy window awnings are not door passages. |
| Harbor | [1280,525] / [1280,559] | The central door has steps around y=526..540 and a visible paved apron/sidewalk through roughly y=558. The south approach is visibly plausible between the flanking barrels. A narrow lateral connection follows the apron around y=548..551; trace cargo boundaries and the shipyard roof intrusion instead of opening the whole harbor facade. |

**All three have plausible individual ground approaches. A direct guild-to-lodge crossing of the entire upper street is not approved with the current masks.** The harbor tower/finial projects into the road near x=1408,y=284, and its roof occupies roughly x=1368..1447,y=298..350. The north-side strip between the upper sidewalk/props and that projection is visually pinched; the nominal y=293..330 road rectangle is not continuously clear at the tower. None of the 24 current foreground masks covers the tower, finial, or roof. Do not classify those roof pixels as exposed paving or claim the existing accepted tree/cloth masks solve that occlusion.

For a route wholly on visible ground, connect the guild branch through the plaza west of the harbor and the lodge branch around the harbor's east side. The south-side connection needs a specific clearance check: harbor cargo ends around y=538..545 while the shipyard roof rises into the street near y=555..575, leaving locally tight pavement. The inspected collision radius of 0.28 tiles is about 7.32 source pixels, so a centerline requires about 14.64 pixels of usable width before rasterization tolerance. A plausible line in the image is not proof of that clearance. If this detour fails the actual radius/negative-wall checks, the current asset set does not establish an acceptable all-ground connection; do not compensate with facade-wide openings. A later source-preserving roof/overhang mask could address an explicitly modeled route behind that projection, but no such asset was created or approved in this bounded pass.

Ground footprints must follow the feet of walls, planters, barrels, and cargo. On the upper buildings, visible front contacts/props end around y=260..275 outside the center stair openings. On the harbor, the front wall/steps and cargo meet the apron around y=526..545; the tower apex at y=284 is an elevated visual projection, not a ground-contact line. The single source image does not reveal an exact hidden rear foundation under the roof, so this report does not invent a complete physical footprint polygon. Keep building interiors blocked, trace visible frontage/prop contacts, and carve only the actual central entrance/steps. Neither a full visual bounding box nor `doorY - constant` alone is an adequate ground footprint.

The `buildingSolids` snapshot read during this review confirms the parent's arithmetic concern: `groundH` is measured from `groundY`, but side/bottom clipping uses `y + h`. With the inspected values, guild and lodge side rectangles collapse to zero height and their full-width top solids stop at y=219 and y=217; harbor side rectangles likewise disappear below y=485. That opens lower facade bands, not just door gaps. This observation is about the read snapshot, not a claim that Luna's subsequent fix still has the bug.

Negative checks to retain alongside positive door connectivity: wall/pillar points beside the guild doorway near [1145,245] and [1205,245]; lodge sides near [1450,245] and [1510,245]; harbor facade near [1250,480] and [1320,480]. These should remain blocked. Sweep the surrounding wall bands as well as sampling points. Positive checks should use the narrow center stair corridors, with actor-radius clearance and distinct interaction/return positions, rather than accepting the whole lower facade as walkable. Roof-projection crossings require a separate visual/occlusion decision and are not automatically physical-wall tests.

No collision edit, runtime test, fresh town capture, or new mask was performed for this addendum. The tangible deliverable remains this reviewed asset selection, exact mask/anchor contract, and bounded source-ground guidance for the parent and Luna to apply.

## Saved Runtime Capture Verification

Follow-up on 2026-09-20: inspected the two requested saved 1920 x 1080 captures. The parent reports an independent runtime PASS with `committed:true`, 9,944 reachable samples, ten doors, and passing round trips. That result was not rerun in this visual review.

**Decision: blocking render mismatch; corrected guild/lodge/harbor ground routes, tower projection, roof walking, and wall alignment are NOT VISUALLY VERIFIED.** Both supplied captures display the legacy, simple tile-art town instead of the detailed Seville source reviewed above. The guild/lodge/harbor adjacency and tower needed for this check are not visible. The collision overlay puts large red rectangles over legacy open paving/props and does not establish alignment with the detailed buildings. These are not acceptable visual proof of the corrected town, despite the reported logic-test PASS.

### Concrete Blocking Finding

**P1: subsequent committed frames fall back to the old renderer.** In the inspected `Web/seville_town.js:197`, `activate()` returns false when `asset.committed` is already true. At `Web/seville_town.js:237`, the wrapper calls `oldTown` whenever `activate()` returns false. The first successful commit can draw the new source, while later frames draw the legacy town with the committed map data. This directly explains the saved visual mismatch and the overlay's lack of agreement with the displayed art.

Bounded implementation guidance for Luna: after readiness, an already committed asset should continue to `drawSeville`; only an uncommitted asset needs the activation attempt. Preserve actual load/validation/failure handling. This report does not modify that JavaScript.

The test's capture loop at `Web/tests/seville_town_runtime.js:81` renders additional frames after the successful commit. Its check at line 82 only establishes nonzero alpha, so a fully drawn legacy frame passes. Keep the existing connectivity/round-trip checks, but add a source-render assertion on repeated post-commit frames; `committed:true` and nonblank output alone cannot detect this regression. Then save views centered on the upper guild/lodge/harbor street as well as the spawn view; even a correct spawn-centered crop may not include the route being reviewed.

### Accepted Progress and Limits

- The inspected arithmetic correction at `Web/seville_town.js:55` now uses `groundBottom = groundY + groundH`, and the side/bottom rectangles reference it. This addresses the specific mixed-origin calculation recorded in the earlier addendum.
- The inspected test includes blocked interior/frontage samples and explicit guild/lodge facade checks. The parent's reported PASS is accepted as supplied test evidence, not as an independently rerun or exhaustive negative-wall result.
- The physical/source-ground interpretation in the adjacency addendum remains applicable. These incorrect captures provide no new basis to approve walking through the tower projection or to approve facade/collision alignment.
- Foreground selection remains 14 accepted and 10 rejected; the combined layer and magenta-fringed Seria runtime export remain rejected. No asset installation is implied by this capture review.

Capture evidence, exact inspected snapshots:

| Capture | SHA-256 |
| --- | --- |
| /private/tmp/seville_town_runtime_captures/seville_town_1920x1080.png | `ad9ce5060e4375283332c72a323e0cad8bf695f2c1f55f14e4c41cfd2bdbf2d4` |
| /private/tmp/seville_town_runtime_captures/seville_town_collision_overlay_1920x1080.png | `8ce7d263d8b922f842792021af3de8ca0ac982ee8511612e068d105332e31d4d` |

Only this report was updated. No JavaScript, capture, or asset was modified; no browser access or art generation was used.

### Replacement Capture Follow-up

Replacement files arrived during the bounded wait and were inspected. This subsection supersedes the stale-capture rendering decision above for these new hashes; the earlier false-positive evidence is preserved as history.

**Accepted: the replacement 1920 x 1080 town capture now displays the detailed Seville source, not the procedural fallback.** Its overlay is also drawn over that detailed source. The current code snapshot includes `if(asset.committed)return true` in activation, and the capture test now compares a rendered source pixel instead of relying exclusively on nonblank alpha. Those observations support the correction of the specific fallback problem; this reviewer did not rerun the test or certify every subsequent frame.

**Still NOT VERIFIED: corrected guild/lodge/harbor route, tower/roof crossing, and local facade collision alignment.** Both replacement images remain centered on the southern plaza/pier. The guild/lodge doors and harbor tower are outside the captured viewport. After an additional bounded wait, no upper-street capture was present in the supplied directory. No source-alignment judgment for that offscreen area is inferred from the southern view or the reported connectivity PASS.

| Replacement capture | SHA-256 |
| --- | --- |
| /private/tmp/seville_town_runtime_captures/seville_town_1920x1080.png | `41fb2167ac2fad78c00e69eb828d862c5527deebc60c3f35810bc38a2850f1b3` |
| /private/tmp/seville_town_runtime_captures/seville_town_collision_overlay_1920x1080.png | `eccd584684097327cb8eb1ba1cc81cfd7b65f54ffa27ec4358b207a5ced6b9e8` |

The next relevant evidence is an upper-street capture and matching collision overlay containing both upper doors and the harbor tower projection. Foreground decisions remain unchanged. This follow-up modified only this report.

## Seria Alpha-only Standing Derivative

Date: 2026-09-21. The user expressly authorized deterministic code postprocessing of the dark magenta fringe while preserving originals, with no design, accessory, or recolor changes and no runtime integration. Created a separate `seria_standing_alpha_v1/` derivative and the reproducible `clean_seria_standing_alpha.cjs` processing script inside this ArtProduction directory. No image-generation backend was used.

**Result: accepted as a cleaned eight-standing-view design derivative after black/white visual inspection. This is not runtime approval and not an animation delivery.** The original export and its historical rejection remain unchanged; this decision applies only to the derivative identified below.

- Atlas: `seria_standing_alpha_v1/seria_direction_design_48x72_alpha_v1.png`.
- Eight individual frames: `seria_standing_alpha_v1/{N,NE,E,SE,S,SW,W,NW}.png`.
- Audit manifest: `seria_standing_alpha_v1/manifest.json`, including every removed pixel's local coordinate and original RGBA value, original/derivative hashes, and source/frame geometry.
- Black comparison: `seria_standing_alpha_v1/before_after_black_4x.png`.
- White comparison: `seria_standing_alpha_v1/before_after_white_4x.png`.

The comparison sheets place the unchanged original on the left and the cleaned derivative on the right, at four-times nearest-neighbor scale. Inspected both backgrounds: the obvious purple specks around boots, faces, hair, and coat edges are reduced/removed without an obvious change to the eight poses, clothing, or direction readability. Natural dark brown/burgundy contours remain. This is conservative edge cleanup, not a claim to reconstruct an ideal outline from the matte-contaminated source.

Processing considers only opaque pixels adjacent to the original exterior-connected transparency. Candidates require `B >= 28`, `B-G >= 18`, `B >= 0.5*R`, `R > 1.6*G`, and `B > 1.6*G`. The exterior uses four-connected flood fill; candidate adjacency uses eight neighbors. It performs one pass, without repeated inward erosion or blanket removal from internal clothing/hair. Selected alpha changes from 255 to 0; every RGB byte is preserved, including hidden RGB beneath transparent pixels. No resampling, frame movement, recolor, or accessory modification occurs.

| Direction | Removed alpha pixels | Remaining opaque pixels | Unchanged local alpha bounds |
| --- | --- | --- | --- |
| N | 11 | 937 | [11,9,26,60] |
| NE | 11 | 873 | [13,9,22,60] |
| E | 15 | 679 | [16,9,17,60] |
| SE | 23 | 892 | [13,9,23,60] |
| S | 17 | 954 | [11,9,26,60] |
| SW | 14 | 923 | [13,9,23,60] |
| W | 13 | 670 | [16,9,17,60] |
| NW | 8 | 915 | [13,9,23,60] |

Independent decoded-PNG verification confirmed **112 alpha removals, zero RGB channel changes, zero alpha additions, zero partial-alpha pixels, and zero frame/atlas mismatches**. The new atlas has 6,843 opaque and 20,805 transparent pixels. Original source, manifest, atlas, and eight frame hashes were checked unchanged (11 files). The atlas remains 192 x 144, cells remain 48 x 72, order remains N/NE/E/SE/S/SW/W/NW, and all pivots remain [24,69]. The original source-content sampling rectangles remain applicable. No original art file or original manifest was overwritten.

| Derivative evidence | SHA-256 |
| --- | --- |
| seria_direction_design_48x72_alpha_v1.png | `c2d9d38d7fb13d3e3307db2e748be5295eebf4521c35d2cbf75fe84cc6125e18` |
| before_after_black_4x.png | `f013b3e3d24e599b8c52d1482f75147cd677812f00db4123ab7302465c92f9ad` |
| before_after_white_4x.png | `0fe73c995415bb0335c0f39b5ae9602c10c32df5fd817477489c503673ed98fc` |

Scope remains **eight standing views, zero completed animation frames, `animationReady:false`, `runtimeInstalled:false`**. No active JavaScript or town/foreground asset changed. Luna's corrected route captures remain a separate verification to perform when notified.

## Final Northern Street Visual Review

Date: 2026-09-21. Read all six saved guild/lodge/harbor upper-view PNGs and their collision overlays in `Docs/Screenshots/SevilleTown/GameRenderTown/`. Compared them with the unchanged source and inspected the relevant current geometry read-only. No tool/quota failure occurred in this pass. This section supersedes the earlier offscreen/not-verified status for these specific northern-street captures.

**Decision: correct source rendering and the three immediate doorway landings are accepted with limits; overall geometry approval remains blocked by walkable harbor cargo footprints.** The earlier procedural-render mismatch is absent. The tower projection is blocked at the sampled finial/roof points, and no roof-standing actor is shown. The screenshots are stills, not an exhaustive movement or occlusion test.

### Blocking Geometry Finding

**P2: the harbor's lower cargo frontage is still walkable.** In `seville_town_harbor_upper_1920x1080_collision_overlay.png`, the red harbor facade coverage ends above the visible bases of the barrels and crates. The source shows real ground-contact cargo in the untinted strip; it is not merely an elevated roof silhouette.

Read-only checks used the existing `bootHtmlOrder()` harness and the current candidate map with `HL.CollisionWorld(.28)`. No captures were regenerated, no files were written by this probe, and no gameplay state was saved. Conversion was exactly `[sourceX*64/1672, sourceY*36/941]`.

| Source point | Source-observed surface | Current blocked result | Required interpretation |
| --- | --- | --- | --- |
| [1350,530] | Blue stacked-crate footprint east of harbor door | false | Cargo must block feet. |
| [1430,529] | Brown crate footprint farther east | false | Cargo must block feet. |
| [1315,525] | Barrel immediately right of harbor door | false | Barrel must block feet. |

For both x=1350 and x=1430, every one-pixel source-Y sample from y=547 through y=529 was unblocked at radius 0.28 tiles. Thus the crate interiors are reachable directly north from the visible apron, not just isolated unwalkable-in-practice holes. The source region `[1300,505,150,42]` shows the right barrel and representative cargo bases. The harbor capture itself shows the door and these objects together, and its overlay confirms the omitted lower footprints.

The inspected `buildingSolids` now fixes the earlier mixed-origin arithmetic, but `groundBottom` still resolves to `doorY-18`: harbor 525-18=507. Its broad facade rectangles therefore stop at y=507, while the visible cargo contacts continue to approximately y=538..543. The listed `sourceProps` do not cover the three points above. Door connectivity and upper-facade negative samples can pass while these lower-footprint collisions remain absent.

Required bounded correction for the integration owner: trace the actual barrel/crate ground footprints at the harbor frontage, retain the central doorway/steps and narrow southern apron, and add negative checks for the three coordinates above plus approach sweeps into the cargo. Do not fix this by declaring the entire apron blocked or opening a wider facade band. No art generation or new roof mask is needed to address these missing ground-contact solids. This review made no implementation change.

### Accepted With Limits

| Source point | Bounded check | Result |
| --- | --- | --- |
| [1176,278] | Guild return/step landing | Unblocked; visibly on the entrance steps/sidewalk. |
| [1480,276] | Lodge return/step landing | Unblocked; visibly on the entrance steps/sidewalk. |
| [1280,544] | Harbor return/apron landing | Unblocked; visibly on the entrance apron. |
| [1145,245] | Guild pillar beside entrance | Blocked. |
| [1510,245] | Lodge facade beside entrance | Blocked. |
| [1408,284] | Harbor tower finial projection | Blocked. |
| [1408,320] | Harbor tower roof projection | Blocked. |

The source-matching guild/lodge screenshots establish that the actors at the reviewed landings stand on steps or sidewalk, not on roofs. The matching overlays preserve narrow entrance openings and block the adjacent sampled facade. The harbor upper view similarly places the actor on its central apron. These findings accept the immediate doorway placement and specific wall/roof exclusions, not every facade pixel or the entire inter-door walking route.

The upper street is conservatively split around the harbor visual envelope. The overlay also blocks visibly paved areas north/west of the tower, so it should not be described as a precise physical ground-footprint trace. This is an overblocking limitation, distinct from the confirmed missing cargo solids. The broad north-road closure prevents a direct tower crossing at the tested points; it does not demonstrate a fully traced, source-faithful detour. Retain the parent's reported connectivity evidence as separate logic evidence, with the lower cargo issue above still requiring correction.

Foreground remains inactive for this approval. These stills do not establish moving-actor occlusion behind tree canopies, awnings, or other elevated artwork. The prior 14 accepted / 10 rejected foreground decisions, combined-mask rejection, and no-runtime-integration status for Seria remain unchanged. No broader actor/art review was performed.

### Reviewed Capture Hashes

All names below are relative to `Docs/Screenshots/SevilleTown/GameRenderTown/`.

| File | SHA-256 |
| --- | --- |
| seville_town_guild_upper_1920x1080.png | `422a1c5b99262474081a8944dbf23e0cde2c909c3533ee940d49b4fca15df220` |
| seville_town_guild_upper_1920x1080_collision_overlay.png | `6c6373a472862ba346aa6685770b9e67fe16171bc5364978b2e912b5b94243bb` |
| seville_town_lodge_upper_1920x1080.png | `bcd1683c6c94435def3d2292a26946d620a6f025c9f06ff9e1b5bc2be6c592a3` |
| seville_town_lodge_upper_1920x1080_collision_overlay.png | `72b18208a86263f0d5bdeb60a243a81be911578b47b097aa48ab35c780d6caa5` |
| seville_town_harbor_upper_1920x1080.png | `6988e10fb5c632f7a057be6a0ac6a2fd97d2015f76c54a47eb9be6fea9c3f9fd` |
| seville_town_harbor_upper_1920x1080_collision_overlay.png | `a506dd1a3e6578e5bb00686b249d2c9b423022803e5253aa195e13d29ecf4206` |

Only this report was updated in this final review. No JavaScript, assets, or screenshots were modified; no generation or browser access was used.

## Three Harbor Ground Footprints

Date: 2026-09-21. Follow-up requested exact bounded recommendations for the two crate stacks and the barrel identified above. Inspected the unchanged source at eight-times nearest-neighbor scale with a source-coordinate grid. These are recommended collision inputs, not a claim to recover hidden 3D geometry exactly. Confidence is sufficient for the bounded fix: visible side/front contacts are within approximately two source pixels; rear ground edges are inferred from the lower body/base of each painted prop.

Coordinates use the 1672 x 941 source, top-left origin. Rectangles are `[x,y,width,height]`; right/bottom are exclusive for image indexing. Polygon vertices are continuous source-pixel boundary coordinates, supplied clockwise. These are compact lower ground footprints, not whole vertical sprite silhouettes or a combined cargo-row bounding box.

| Prop | Recommended geometry | Extent |
| --- | --- | --- |
| Blue crate stack at [1350,530] | Rectangle `[1340,523,28,18]` | x=1340..1368, y=523..541 |
| Brown crate stack at [1430,529] | Rectangle `[1418,526,23,16]` | x=1418..1441, y=526..542 |
| Barrel right of door at [1315,525] | Eight-vertex polygon below | Bounding extent x=1304..1329, y=523..542 |

```json
{
  "blueCrateGroundRect": [1340, 523, 28, 18],
  "brownCrateGroundRect": [1418, 526, 23, 16],
  "rightBarrelGroundPolygon": [
    [1307, 523],
    [1324, 523],
    [1329, 530],
    [1328, 536],
    [1323, 541],
    [1313, 542],
    [1307, 538],
    [1304, 531]
  ]
}
```

The barrel polygon follows the narrower lower cask rather than its top rim or cast shadow. The blue rectangle covers the lower blue-framed crate and its bottom rail, stopping before the separate forward brown crate to its right. The brown rectangle covers the lower brown crate beside the blue stair/ladder, excluding that stair/ladder and the separate crate stack farther right. These three shapes do not certify or fix other harbor props.

Pass the two rectangles through the existing source-to-logical rectangle conversion. Convert every barrel vertex using `[x*64/1672, y*36/941]` and use polygon collision. Do not preinflate these shapes: the existing `CollisionWorld(.28)` applies actor-radius clearance. The barrel's bounding extent is metadata, not a separately verified rectangle substitute.

### In-memory Clearance Check

Added the recommendations only to a cloned collision scene in an ephemeral read-only harness invocation. Used the current map, radius 0.28 tiles, and the existing 0.25-tile four-neighbor reachability convention. No live candidate, source file, saved state, screenshot, or JavaScript was modified.

- All three reported prop points become blocked.
- All ten door thresholds and all ten `doorY + 0.72` return positions remain unblocked; all ten doors remain connected to the spawn component using the existing near-door criterion. The proposed scene has 9,777 reachable samples in this check.
- Harbor center-apron points `[1280,544]` and `[1280,547]` remain unblocked. The new shapes exclude the central door and steps and do not create one large solid across the apron.
- **The local apron centerline at `[1350,547]` and `[1430,547]` becomes blocked by actor-radius clearance.** At those X values the new crate front edges at y=541/542 face the existing shipyard exclusion beginning at y=555. The 14/13-source-pixel raw gap is narrower than the approximately 14.64-source-pixel actor diameter. Therefore this recommendation preserves the current overall door graph, not a continuous straight passage immediately beneath these crates. Do not claim that the narrow southern crossing remains usable.

If preserving that exact local apron crossing is a requirement, its clearance is unresolved with the present shipyard exclusion: the integration owner must reconcile the adjacent footprint geometry against the source. Do not shave away visible crate bases or reduce actor radius just to force this line open. Existing global connectivity can use another route; the graph check is not visual approval of every alternate segment.

Luna can apply these three exact shapes as the bounded cargo fix, retain the doorway positives, and add negative tests at the three cited prop points. A saved overlay after applying them is still needed before claiming their runtime visual integration. This follow-up changed only this review document.

## Final Cargo Blocker Closure

Date: 2026-09-21. Luna applied the supplied cargo geometry and regenerated the saved harbor overlay. **The specific three-prop cargo blocker is CLOSED.** This supersedes the open cargo finding above, without expanding approval to other geometry or occlusion.

Verified in the current read-only harness scene:

- Exact source crate rectangles `[1340,523,28,18]` and `[1418,526,23,16]` are present in the authored source solids. Runtime represents them as rasterized horizontal strips; checking every interior source-pixel center found zero uncovered pixels.
- The exact eight-vertex barrel polygon is present in runtime polygon collision after source-to-logical conversion.
- At the current actor radius of 0.28 tiles, `[1350,530]`, `[1430,529]`, and `[1315,525]` all return `blocked:true`.
- Central harbor apron points `[1280,544]` and `[1280,547]` still return `blocked:false`.

Inspected the regenerated `seville_town_harbor_upper_1920x1080_collision_overlay.png`: the new crate rectangles visibly cover the intended lower crate bases, with the center doorway/steps and apron opening retained. **The diagnostic overlay draws rectangle solids only, so it does not display the barrel polygon.** The barrel's closure is established by exact polygon comparison and the collision probe, not by a red shape in that image. This is a limitation of the overlay evidence, not a remaining cargo-collision failure.

The parent reports the final runtime suite PASS with 9,827 reachable samples, all ten doors, and deep preservation of 119 other floors. Those broader results are recorded as supplied evidence and were not rerun in this closure check. This pass did not repeat full reachability, door round trips, or the preservation suite.

Final inspected harbor evidence:

| File in Docs/Screenshots/SevilleTown/GameRenderTown/ | SHA-256 |
| --- | --- |
| seville_town_harbor_upper_1920x1080.png | `6988e10fb5c632f7a057be6a0ac6a2fd97d2015f76c54a47eb9be6fea9c3f9fd` |
| seville_town_harbor_upper_1920x1080_collision_overlay.png | `6ccb24817406915bfb1b16103813406c6b6269974064f010b40cc169d3f7e05d` |

Remaining limits are unchanged: overblocking/precise route fidelity is unverified; the narrow local crossing directly below the crates is not approved; full moving-actor occlusion and browser/physical-input playthrough are unverified. Other cargo, other map geometry, combined foreground activation, and Seria runtime integration are outside this closure. The 14 accepted / 10 rejected foreground selection remains unchanged.

Only this report was appended. No JavaScript, art, screenshot, saved state, or runtime binding was changed by the reviewer.

## Approved Fourteen-object Integration Handoff

Date: 2026-09-22. The user authorized bounded integration of only the fourteen approved registered cutouts, with no new art or actors and foreground-only overlap fading. Created `foreground_approved14_manifest.json` in this ArtProduction directory. It is a handoff allowlist, not active runtime JavaScript or a combined foreground image. The original production manifest and all PNGs remain unchanged.

**No new asset-level blocker was found for this fourteen-object integration.** Final integrated appearance remains pending Luna's screenshots. The original complete 24-object foreground remains rejected and must not be used as the layer or as a fallback.

Reconfirmed approved IDs:

```text
plaza-nw
plaza-east-upper
plaza-west-middle
plaza-east-middle
plaza-east-outer
plaza-sw
home-west-tree
southwest-tree
harbor-west-tree
harbor-east-tree
market-west-canvas
market-upper-canvas
market-east-canvas
market-farwest-canvas
```

The new manifest copies each approved object's exact `sourceRect`, `anchor`, `anchorLocal`, `anchorTile`, filename, and opaque count from the original manifest, and adds explicit source-pixel `anchorY = anchor[1]` and a per-PNG SHA-256. It lists all ten excluded IDs separately. Filenames resolve relative to the new manifest; `runtimeSourceProjectRelative` is explicitly relative to the project root.

### Exact Placement and Depth Contract

1. Use the original 1672 x 941 source plane and the same background contain/camera transform. Draw each cropped PNG at `sourceRect.xy`; equivalently, `anchor - anchorLocal`. Destination size is `sourceRect.wh * containScale`. Do not place the crop at its ground anchor, independently stretch it, recenter it, or round its origin differently from the background sampling phase.
2. Preserve anchors outside the image extent. For example, `plaza-sw` is 90 pixels high but its local anchor Y is 95; `market-upper-canvas` is 46 high but its local anchor Y is 114. These are valid ground references, not errors to clamp.
3. Draw the existing background first. Merge individual foreground objects with existing actors in ascending ground Y. Foreground key is `anchorY * 36 / 941`; actor key is existing actor foot Y in logical tiles. At equal depth, draw the foreground before the actor and retain stable actor ordering. Thus an occluder follows actors behind it and precedes actors in front. A single blanket pass after all actors is not equivalent and is not approved.
4. Use only nonzero source alpha for coverage. Transparent crop padding is not a mask. Keep collision, doors, cargo footprints, route restrictions, and actor positions unchanged by this layer integration.

### Foreground-only Overlap Fade

The new handoff contract limits fading to the intersection between an eligible foreground object's nonzero alpha and a behind-actor's rendered nonzero alpha. Bounding boxes may reject obvious non-overlap cheaply, but transparent padding alone must not trigger fading. Keep non-overlap foreground pixels at opacity 1. An actor in front does not need foreground fading because depth order already places that actor last.

The opacity selected for intersecting foreground pixels may be less than 1; its exact value remains an implementation choice for final visual review. Never modify actor alpha, tint, animation, or sprite selection. Isolate foreground alpha/clipping/compositing state with save/restore, including failures, so it cannot leak into subsequent actors or UI.

**The baked source objects are not an obstacle to revealing an intervening actor, but they limit what fading means.** With the same object RGB in both the background and the registered overlay, fading an overlay above an actor reveals that actor. At an opaque actor pixel the result is `foregroundOpacity * objectRGB + (1 - foregroundOpacity) * actorRGB`. At a pixel with no actor in between, fading the duplicate overlay leaves the same background object visible. It cannot erase the tree/awning or reveal an unobstructed ground plate. Do not fade or erase the background, and do not alter actors to simulate the effect.

### Integrity and Remaining Review

The fourteen PNGs were rechecked against the original source: **44,286 opaque pixels, zero RGB channel mismatches, zero partial-alpha pixels, and zero shared opaque positions between approved objects.** All dimensions, opaque counts, and anchor arithmetic match the original manifest. The runtime source copy at `Assets/Resources/Sprites/Game/SevilleQuality/seville_town_source_v2.png` also matches source SHA-256 `e4a320fbfcc0ea3f4be85a90b88a1892f67e3a9008f278839154789bd07bd0e6`.

Enable the optional foreground subset only after all fourteen approved images decode with the expected dimensions. A foreground load/decode failure should leave this layer off while preserving the committed town; it must not substitute the rejected combined mask or roll back working door/collision data. Retained root/soil edge details still require the existing blocked planter footprints. No new walkability is justified by foreground transparency.

Final screenshot review after Luna implements should show a tree and an awning with existing actors behind/in front, a simultaneous mixed-depth case, overlap fading while actor draw alpha stays unchanged, and an unobstructed view confirming no duplicate-edge shift. Check source registration at different camera positions and viewport scales; non-integer scaling must not create seams from independent crop rounding. This is a bounded appearance check, not approval of full town occlusion, overblocking, other ports, new actors, or browser playthrough. No new images, actors, runtime bindings, or JavaScript were produced in this handoff.

## Initial Foreground Runtime Rejection

Date: 2026-09-22. Inspected `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_foreground_overlap_1920x1080.png` after the parent reported initial foreground integration blockers. **This initial runtime result is REJECTED.** It does not change approval of the fourteen source assets themselves.

**P1: foreground registration is visibly wrong.** The capture contains miniature duplicate trees floating over upper-building doors, open road, and an inn roof. They do not coincide with the full-size trees already painted into the background. The read snapshot of `Web/seville_town.js:265` divides foreground destination X, Y, width, and height by two, while `drawContain` uses the full 960 x 540 logical viewport and the capture applies its output scaling separately. This both halves each cutout's dimensions and pulls its screen position toward the viewport origin.

The required destination before the outer capture/display scale remains:

```text
dx = containOffset.x + sourceRect.x*containScale - camera.x
dy = containOffset.y + sourceRect.y*containScale - camera.y
dw = sourceRect.width*containScale
dh = sourceRect.height*containScale
```

No additional `/2` belongs in those values. The 1920 x 1080 capture already scales the 960 x 540 drawing context by two. Correct image dimensions in the loader do not prove correct on-screen dimensions or registration.

The parent also reported a hardcoded actor rectangle and first-behind-actor-only fade in the initial implementation. A still cannot establish whether every actor's alpha contributes. **The current file read during this review already contains work-in-progress changes:** it filters all eligible behind-actors and renders them into an alpha-mask canvas. The hardcoded envelope remains as an overlap prefilter. Therefore the first-actor-only limitation is recorded as the parent's initial finding, not falsely asserted to remain in that newer source snapshot. The regenerated alpha/all-actors result has not been reviewed. A conservative bounds prefilter may reject obvious misses, but it cannot serve as final alpha coverage or exclude valid pixels from an existing actor's actual rendered silhouette.

The inspected `Web/tests/seville_town_foreground.js` checks draw calls, opacity, order, and a split fade path. Those checks can pass while cutouts are visibly displaced and half-size. They do not establish source registration, actual alpha intersection, or simultaneous multi-actor coverage. This is another concrete rendering-test false positive; do not promote the initial PASS to art approval.

For the bounded corrected result, retain the approved allowlist and actor-opacity checks, then verify pixels/placement: non-overlap foreground must coincide with its baked source object under the shared camera transform; overlap must follow actual actor alpha for all eligible behind-actors; actors in front must remain on top; and transparent crop padding must not cause a rectangular fade. Offscreen mask/foreground canvases must also match the intended sampling rather than silently introducing filtered edges. Review regenerated evidence after the fix. No runtime test or capture generation was performed by this reviewer during this rejection check.

Initial rejected capture SHA-256: `bc713c54648e03514b0979d1e39ed6a77be517ca48cf5993731cf8ae375d183f`.

Only this report was appended. Runtime JavaScript, the approved manifest, all art assets, and screenshots were left untouched. Final foreground integration approval remains pending.
