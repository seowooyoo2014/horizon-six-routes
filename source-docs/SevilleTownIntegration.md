# Seville Town Integration

Date: 2026-09-21

Status: bounded town ground integration is passing offline runtime, layout, and fallback checks. The foreground is not integrated.

## Source and Registration

The supplied source was inspected directly at `Assets/Resources/Sprites/Game/SevilleQuality/seville_town_source_v2.png`.

- Native source: 1672 x 941 PNG, RGB, no alpha channel.
- Preserved source copy: `Assets/Resources/Sprites/Game/SevilleQuality/seville_town_source_v2.png`.
- Source and copied asset SHA-256: `e4a320fbfcc0ea3f4be85a90b88a1892f67e3a9008f278839154789bd07bd0e6`.
- Display contract: 1920 x 1080 target plane with aspect-preserving contain transform; no resampling or source processing was performed.
- Runtime footprint: 64 x 36 logical tiles at 30 pixels per tile.

The source remains in the ArtProduction directory. The existing `seville_town_source.png` was not overwritten.

## Atomic Runtime Gate

`Web/seville_town.js` constructs a candidate map without mutating the live Seville map. The old map remains the active visual, collision, door, NPC, and actor state while the versioned source is loading. The candidate is committed only after image load and decode both complete. Decode or load failure leaves the complete old town active.

The commit assigns the candidate visual, 64 x 36 map footprint, water and dock bounds, buildings and doors, collision, NPC positions, quality geometry, and structural hash together. It does not call save, change the game version, change a save slot, or modify the other town definitions.

The renderer uses the contained source-to-target transform on the 1920 x 1080 plane. No foreground image is bound, and no fake alpha or checkerboard interpretation is used.

## Pixel Geometry

Geometry is authored in source pixels and converted once to logical tiles using `[x * 64 / 1672, y * 36 / 941]`.

- River boundary is source `y=806`, observed from the supplied source, instead of the old `y=846` boundary.
- Ten source-observed building envelopes have individual door thresholds and explicit door gaps.
- Building ground footprints use absolute source coordinates: the lower wall and side strips end at `groundY + groundH`, so the source envelope cannot be bypassed through a dropped lower façade.
- The main paved route follows the observed source road at `y=293..330`; its collision mask expands only for actor-radius clearance and the upper door landings. The harbor projection splits the upper road into west/east branches, forcing the guild/lodge connection around the southern visible ground route.
- The harbor roof overhang begins visually at `y=284`, but its ground collision begins at the traced road edge `y=293`, leaving the narrow visible frontage usable without removing the harbor building solid.
- The harbor apron now includes only the reviewed ground-contact cargo: blue crates `[1340,523,28,18]`, brown crates `[1418,526,23,16]`, and the barrel polygon `[[1307,523],[1324,523],[1329,530],[1328,536],[1323,541],[1313,542],[1307,538],[1304,531]]`. The central harbor steps remain open; the tight strip directly beneath the cargo is intentionally not described as walkable because the shipyard roof closes actor-radius clearance.
- Door approach corridors are source-pixel clearances through the authored visual envelopes, including the guild approach beside the harbor roof; they are validated against the real collision radius and are not unconditional tunnels.
- The central fountain, planted trees, lamps, market clutter, crates, harbor cargo, and shipyard cargo are collision solids.
- The central plaza remains connected around those solids.
- The visible pier is the only walkable path through the water band; water away from that pier remains blocked.
- The rejected RGB foreground is not used as a walkable or occluding layer. No occlusion path is enabled pending foreground approval.

NPC anchors are placed on the connected component rooted at the new spawn. On the first atomic commit, the live player, NPCs, and follower history are relocated to safe points in that same component. Subsequent safe-position checks use the committed map only.

## Tests

Runtime command:

```text
NODE_PATH=/Users/seol-eunjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/seol-eunjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node Web/tests/seville_town_runtime.js
```

Result: PASS. The offline HTML-order harness uses `Game.renderTown` with `@napi-rs/canvas`; it verified loading retains the old map, decoded commit switches atomically, all 10 doors and return landings are connected, 9,827 walk samples are reachable after the reviewed harbor cargo footprints, the three cargo centers are blocked, the harbor return steps remain open, the harbor projection blocks the direct upper crossing, water and pier behavior match the authored geometry, NPCs and follower history are safe, and save version 21 / slot 73 are unchanged. Every 1280x720, 1920x1080, 2880x1620, guild-upper, lodge-upper, and harbor-upper frame is checked against a same-camera render of the committed source image. The visual frames and collision overlays are persisted under `Docs/Screenshots/SevilleTown/GameRenderTown/`.

Evidence paths:

- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_1280x720.png`
- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_1920x1080.png`
- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_2880x1620.png`
- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_collision_overlay_1920x1080.png`
- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_guild_upper_1920x1080.png` and its `_collision_overlay.png`
- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_lodge_upper_1920x1080.png` and its `_collision_overlay.png`
- `Docs/Screenshots/SevilleTown/GameRenderTown/seville_town_harbor_upper_1920x1080.png` and its `_collision_overlay.png`

Additional checks:

- `Web/tests/seville_town_layout.js`: PASS, ten source doors and source/target dimensions.
- `Web/tests/seville_town_fallback.js`: PASS, decode-error fallback keeps the old visual and collision active.
- `Web/tests/seville_town_postcommit.js`: PASS, a walked version-21 save is loaded into a second `Game` instance, then a forced draw failure restores the pristine baseline map and an exact safe old-map position without rewriting storage or campaign/resource fields; the draw wrapper also restores the canvas context.
- `Web/tests/seville_quality_layout.js`: PASS.
- `Web/tests/startport_interiors.js`: PASS, 11 layouts and reciprocal stairs.

## Remaining Unverified

Browser HTML visual approval and physical-input playthrough were not run. Verification is the existing offline HTML-order harness using the real `Game.renderTown` path and `@napi-rs/canvas` captures. The runtime test preserves both object identity and JSON deep snapshots for all other 119 town definitions, plus the save-slot map. Astra's 2026-09-20 final northern review identified and is now satisfied by the three source-accurate harbor cargo footprints; its 14 accepted / 10 rejected foreground decision remains unchanged. `foreground:null` remains intentional, and no foreground or Seria runtime art is integrated.
