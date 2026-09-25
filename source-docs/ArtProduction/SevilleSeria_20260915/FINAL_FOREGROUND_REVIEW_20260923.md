# Final Foreground Review: Seville Approved Fourteen

Review date: 2026-09-23. Bounded continuation of `BOUNDED_ART_REVIEW_20260920.md` and `foreground_approved14_manifest.json`.

## Decision

**The visible half-size duplicate-tree registration defect is resolved in the two inspected saved captures. Final foreground integration approval remains pending actual-overlap/fade evidence.** The existing fourteen-object asset approval is unchanged. The ten excluded masks and combined 24-object foreground remain unapproved.

The initially supplied player position `[28.25,12.75]` does not overlap `plaza-nw` alpha. Use the existing Ines player at **logical `[28.25,14.5]`, source `[738.03125,379.0138888888889]`**, facing south (`dir:4`), standing (`playerMoving:false`, `playerAnim:0`), for the replacement behind-tree capture. This point is reachable with the current collision data and produces a substantial, measured opaque actor/canopy intersection. No art or collision change is needed to obtain that intersection. The same screenshot paths were replaced during this review; the late replacement subsection below distinguishes those newer views from the initial evidence.

Only this report was written by the reviewer. No runtime JavaScript, tests, manifests, art, saved screenshots, NPC definitions, or saved gameplay state were edited. Browser access was not attempted. Read-only checks used the existing local `offline_html_order_harness.js` and bundled Node/canvas, with ephemeral in-memory game state and image comparisons. This is offline evidence, not a browser or physical-input playthrough. Luna retains pixel-test and systems work.

## Corrected Registration

Inspected the initial versions of both `seville_town_foreground_overlap_1920x1080.png` and `seville_town_foreground_overlap_2880x1620.png` in `Docs/Screenshots/SevilleTown/GameRenderTown/`. The northern plaza trees coincide visually with their baked source objects at full size. The previously reported miniature copies over buildings and roads are absent. No obvious detached/shifted tree silhouette is visible in these views. The player stands above the northwest canopy in both initial images.

The read `sourceToCanvas` implementation now uses the shared contain offset/scale minus camera, with no extra `/2`. All fourteen runtime PNG hashes match the approved manifest, and all fourteen runtime source rectangles and anchors match it. The runtime background SHA-256 still matches the approved source. These checks establish asset identity and the corrected placement formula; they do not establish pixel-perfect registration of every offscreen object or every fractional camera phase.

The reviewed 2880 capture presents the same logical framing at a larger output scale. It is not independent evidence of another camera location. Awning overlap and simultaneous mixed-depth actors are not established by these saved views.

## Findings

1. **P2: the initial saved overlap evidence contains no actual player/tree intersection.** At logical `[28.25,12.75]`, source `[738.03125,333.2708333333333]`, the independently rendered existing player and registered `plaza-nw` PNG share **zero nonzero-alpha pixels** in the 960 x 540 logical raster. The current render log nevertheless reports `masked:true` and `opacity:0.45`. `actorMayOverlap` and the capture selector use rectangular envelopes; entering that branch does not prove that the opaque silhouettes intersect. Preserve this point as a negative control, not the final positive overlap example.

2. **P2: the current offline positive sample does not establish the required fade.** At the recommended `[28.25,14.5]` point, **433 pixels have actor alpha 255 and foreground alpha 255**. Of these, 409 final-frame pixels exactly equal foreground RGB, and zero match the expected `0.45 * foreground + 0.55 * actor` RGB within one channel value. One exact witness is recorded below. The render log says `masked:true`, `opacity:0.45`, with the player sorted before the tree, but that metadata is insufficient. This observation is specific to the inspected offline renderer snapshot; the cause, browser behavior, and any later Luna fix are not determined here. Do not close fade approval from the branch flag or the new coordinate alone.

The original asset silhouettes do not need retracing for these findings. There is no recommendation to add art, add actors, change collision, or expand the approved set.

## Exact Capture Recommendation

Coordinates use the original 1672 x 941 source, top-left origin. Convert source feet to logical tiles using `[sourceX*64/1672, sourceY*36/941]`. These are capture-state recommendations for the existing player, not permanent spawn or actor-definition changes.

| Case | Logical player feet | Source player feet | Relation to `plaza-nw` | Opaque/opaque intersection pixels |
| --- | --- | --- | --- | --- |
| Negative control, initial capture | `[28.25,12.75]` | `[738.03125,333.2708333333333]` | Behind by sort, no alpha intersection | 0 |
| Recommended positive | `[28.25,14.5]` | `[738.03125,379.0138888888889]` | Behind, actual canopy intersection | 433 |
| Front-side control | `[28.25,15.75]` | `[738.03125,411.6875]` | In front, player must render over tree | 331 |

All three points are unblocked at radius 0.28 tiles and belong to the spawn-connected quarter-tile sample component. All three remain unchanged by `ensureSafePosition()`. Counts use only the existing Ines standing south render, `drawActorV19(...,4,false,0,1)`, and the registered tree at 960 x 540 with nearest-neighbor sampling. They count actual alpha intersection, not crop bounds; the positive 433 pixels are fully opaque on both inputs, so the result is not a shadow-only overlap. Counts are not golden expectations for other directions, animation frames, output scales, or rendering backends.

The positive sample overlaps the right canopy with the player's left side. An enlarged in-memory comparison showed that intersection and the front-side player's precedence. This validates the location and depth comparison, not the unresolved fade appearance. No new comparison image was saved.

Relevant fixed object data:

```json
{
  "id": "plaza-nw",
  "sourceRect": [677, 331, 69, 79],
  "anchor": [710, 406],
  "anchorLocal": [33, 75],
  "sortY": 15.532412327311372,
  "capturePlayer": {
    "captainId": "ines",
    "x": 28.25,
    "y": 14.5,
    "dir": 4,
    "playerMoving": false,
    "playerAnim": 0
  },
  "sourceFeet": [738.03125, 379.0138888888889],
  "cameraAt960x540": [368, 165],
  "opaqueIntersectionBoundsAt960x540": [463, 229, 20, 38]
}
```

The intersection bounds are right/bottom exclusive and include transparent gaps; they must not be substituted for the alpha mask. The actual player draw foot is `[479.5,270]` before sprite rounding. Preserve the existing actor `tile*30` placement and shared background contain transform; the logical source conversion does not authorize an independent X alignment correction.

### Exact Alpha and Fade Witness

At logical canvas pixel **`[469,229]`**, with camera `[368,165]`:

| Input/result | RGBA |
| --- | --- |
| Existing player rendered alone | `[56,52,36,255]` |
| Registered `plaza-nw` rendered alone | `[43,56,36,255]` |
| Current final offline frame | `[43,56,36,255]` |
| Expected 0.45 foreground over this opaque actor, rounded | `[50,54,36,255]` |

The canvas pixel center maps through the contain transform to source `[729.2662037037037,343.7263888888889]`. Its sampled source pixel is `[729,343]`, mask-local `[52,12]`, whose stored RGBA is `[43,56,36,255]`. This is a real canopy pixel. The expected blend presumes the contractual fully opaque actor under the 45% foreground; the observed original tree color is not evidence of that blend.

Use the witness to locate the area when reviewing Luna's final capture. At 2x/3x output, inspect the corresponding raster neighborhood and actual output sampling rather than blindly multiplying a single-pixel assertion. Luna owns test implementation.

### Reachability Evidence

The existing quarter-tile, four-neighbor search at radius 0.28 found 9,827 spawn-connected samples. The actual spawn `[31.923444976076556,28.195536663124336]` can move to the grid seed `[32,28.25]` using the current collision mover. A path to the positive sample has these logical corners:

```text
[32,28.25]
 -> [28.75,28.25]
 -> [28.75,18.5]
 -> [28.25,18.5]
 -> [28.25,14.5]
```

All 70 quarter-tile transitions on this path also reached their requested endpoints using `CollisionWorld.move(..., .28)`, including its internal substeps. The front control lies on the last vertical segment. This establishes current collision reachability, not an art approval of every surface along that route, precise planter/lamp collision, dynamic NPC clearance, or full town navigation.

## Final Capture Handoff

Use the existing player and approved assets at the positive position above, with the stated direction and idle frame. Set and verify that actual state immediately before each 1920 x 1080 and 2880 x 1620 capture; preceding registration/control renders can leave the game at a different position. Retain existing NPC definitions and art; no synthetic actor is needed for this tree example.

The replacement positive evidence should show the left-side canopy intersection with the selected foreground-only fade, while the player's drawing alpha remains 1. Retain the negative and front-side controls so no-alpha overlap and correct front ordering are distinguishable. The old capture can demonstrate resolved duplicate-tree registration but cannot serve as positive fade evidence. The prior handoff's awning and existing-actor mixed-depth evidence remains outstanding; this report neither adds new requirements nor certifies those cases.

## Late Replacement Captures

Before closing the report, both screenshot paths changed independently. Inspected those newer 1920 x 1080 and 2880 x 1620 files as well. They now show the southern plaza/pier, with the player visually over the lower/right area of the southwest tree's planter. The miniature duplicate-tree defect remains absent. These are different views from the initial northern pair, not evidence that the original `[28.25,12.75]` point acquired canopy overlap.

The newer stills do not establish the exact player state, isolated actor/foreground pixel colors, or successful 45% blending. They also do not approve standing inside the planter's ground footprint. No new collision finding or geometry change is proposed in this bounded review. The runtime file and approved manifest still have the hashes below; the `[28.25,14.5]` intersection/fade witness therefore remains relevant. Luna's test file changed during the review and was not run by this reviewer. The final fade decision remains pending, with no further wait or capture regeneration performed here.

| Late replacement file in `Docs/Screenshots/SevilleTown/GameRenderTown/` | SHA-256 |
| --- | --- |
| `seville_town_foreground_overlap_1920x1080.png` | `f913330e3e3c5ef6121f9bb131fc52aaf313b1a8789a03c764c662e224425c32` |
| `seville_town_foreground_overlap_2880x1620.png` | `8a40f8c16b7a64c801ff40124d54a25a11352b1cb90288415c46502d8f4074e2` |

## Initial Snapshot Identity

Hashes identify the files actually inspected, not later replacements from the independently running systems work. The test was read but not executed; its earlier hash below is not a claim about Luna's final test revision.

| File, project-relative | SHA-256 |
| --- | --- |
| `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_foreground_overlap_1920x1080.png` | `93e4c7351bd314c133e4a9603778d01ae2d636129ea45113fe774ee374999d45` |
| `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_foreground_overlap_2880x1620.png` | `bfa3b035e084d8c82c015c1af27437f406c49276a360a1c1deaa85527ddd063d` |
| `Web/seville_town.js` | `fbeabc83f04fb3bda1eaf05c7134a26d224c5840a81707e5464359a9081b82b4` |
| `Web/tests/seville_town_foreground.js` | `02ad6f51cd0514692735f5723e0469260301663be83b3ef7406716b8335370fb` |
| `Docs/ArtProduction/SevilleSeria_20260915/foreground_approved14_manifest.json` | `2f7c3d79b02ab7b1c6ab76c14c4f1f06d768bdbd6b5ce57976d94fd073cbd60a` |
| `Assets/Resources/Sprites/Game/SevilleQuality/seville_town_source_v2.png` | `e4a320fbfcc0ea3f4be85a90b88a1892f67e3a9008f278839154789bd07bd0e6` |
| `Assets/Resources/Sprites/Game/V20/Captains/ines_town_v20.png` | `d86f70bc6a13d96ee79a0e236991d3af962662305527af545468380dba6487da` |

No further assets or actors are requested. Registration correction is accepted only to the bounded extent described above; final runtime appearance remains pending the corrected overlap evidence and Luna's independent pixel checks.
