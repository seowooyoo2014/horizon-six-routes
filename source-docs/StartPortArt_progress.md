# Start-Port Interior Integration

Updated 2026-09-21. Save version remains 21.

## Latest Independent Recheck

- Follow-up on 2026-09-21: Astra resumed northern-street inspection and found
  two harbor crate footprints and one barrel that allowed player passage. Luna
  added the source-reviewed rectangles and barrel polygon. Independent runtime
  rerun passed all ten doors/return landings, cargo negative checks, repeated
  source renders and deep snapshots of the other 119 towns (9,827 connected
  samples). The tight gap immediately beneath the crates is intentionally not
  traversable at the current actor radius; overall connectivity remains intact.
- Extended post-commit failure test now walks, saves, resumes in a second Game
  instance, then forces a draw failure. It passed pristine-map rollback, keeping
  the current safe position, NPC/follower safety, unchanged saved bytes and
  campaign/resource preservation. Initial decode-failure fallback also passed.
- Northern doorway/selected wall/roof checks were accepted by Astra with limits.
  Exact full-route fidelity and moving-actor foreground occlusion remain open;
  conservative overblocking must not be described as a complete ground trace.
- Re-ran the actual `Game.renderInterior()` capture test: eleven supplied
  backgrounds, 33 scaled captures, source-image comparisons and render-failure
  recovery passed. Delayed decode, rejected decode and save/re-entry also passed.
- Re-ran eleven-layout accessibility, reciprocal stairs and six opening action
  sequences through departure. These are automated calls, not keyboard gameplay.
- Seville town's first runtime PASS was rejected on visual inspection: its saved
  capture still showed procedural art. A committed flag and nonblank alpha were
  insufficient evidence. The replacement capture now shows the detailed source;
  repeated rendering must also assert source drawing, not only activation.
- Independent town rechecks passed ten door/return routes, 9,907 connected samples,
  initial decode-failure fallback and post-commit draw-failure rollback. Northern
  street/roof alignment still requires the separate Astra visual review.
- Trade quote, cancellation, confirmation, replay and stale-quote checks passed.
- No real browser storage was used by these tests. Browser, physical keyboard,
  gamepad and responsive HUD/dialog verification remain unperformed.
- Luna high owns runtime fixes; Astra owns source/mask and character review.
  New Seria animation and town foreground are not installed or marked complete.
- Final town captures now live under
  `Docs/Screenshots/SevilleTown/GameRenderTown/`, including three output sizes
  and separate guild/lodge/harbor views with collision overlays. Repeated frames
  assert source rendering; the parent independently reran this final test.
- Astra cleaned 112 fringe pixels in a separate Seria standing atlas through
  alpha only (zero RGB edits, unchanged frame bounds/pivots). This is eight
  standing views, not the required 80-frame animation, and remains uninstalled.
- Astra's final northern-street review attempt returned a usage-limit error
  on 2026-09-21. No substitute model was used. The detailed southern source was
  reviewed, but the new northern captures are not approved by Astra yet.

## Current Verification Boundary

- The HTML-order offline capture harness now calls `Game.renderInterior()`;
  its output is under `Docs/Screenshots/StartPortArt/GameRenderInterior/`.
  This does not establish successful browser/file-URL gameplay.
- Further bitmap-content and delayed-decode render checks are in progress.
  Older direct-render captures are supplementary evidence only.
- Seville's new town candidate and dedicated Seria sprites are separate work:
  an existing image candidate is not evidence of runtime installation or approval.
- System work is assigned to `gpt-5.6-luna` with `high` reasoning; art work is
  assigned to `gpt-6-astra`. These are agent assignments, not image-engine IDs.
- On 2026-09-14 the preserved backup SHA-256 below and all thirteen reference
  PNG hashes were checked again and matched their recorded values.

## Implemented and Tested

- Eleven supplied interior images now resolve to valid port IDs: Seville,
  `lume` (Antwerp), London, Venice, `bella` (Lisbon), and `constantinople` (Istanbul).
- Reference images 1-3 are upper floors; 4-11 are ground floors. Reference 2 is
  Seville market 2F, not the guild basement. The old V21 guild basement is retained.
- Fixed the twice-scaled Seville guild exit and authored connecting door passages
  for the market, guilds and mansion. All eleven layouts pass target accessibility.
- Recovery uses the entrance/stair-connected component, not just an empty tile.
  Late activation resets player velocity and follower path history safely.
- Invalid scene definitions fail independently. Loading/error/decoding failure
  retains the previous scene as one object, including graphics, collision and stairs.
- Existing sprite-frame alpha is normalized in the new interior renderer without
  changing the source sheets. Shadows remain separately rendered. Readback failure
  preserves the original frame and is exposed in `opacityErrors` for diagnosis.
- Removed the unnecessary market-service hotspot at the upper-floor stair.
- The merchant's NEW-GAME crew is 10 instead of 8, matching the cog's minimum.
  Starting money remains 10. Existing saves retain their stored crew count.
  Kemal still needs recruitment and pays the existing 50-gold fee during tests.

## Verification

- `Web/tests/startport_interiors.js`: eleven layouts, reciprocal stairs,
  reachable recovery, follower reset, save position and fleet preservation;
  six opening action sequences through first departure and sea-save restoration.
- `Web/tests/startport_assets.js`: delayed load, load error, decode rejection,
  and isolated invalid definition. No browser storage is used.
- `Web/tests/seville_opening.js`: seven groups with the new renderer layer loaded.
- Trade confirmation, existing Seville regression, town doors and V21 rebuild
  are checked separately. They are model/structural checks, not manual play.
- `Web/tests/render_startport_interiors.js`: HTML script-order boot with decoded
  source images and calls through `Game.renderInterior()`. Produces captures
  scaled from the internal canvas to 1280x720 / 1920x1080 / 2880x1620.
  Scaling these captures does not test responsive browser HUD/dialog layout.
- Outputs: `Docs/Screenshots/StartPortArt/`. These are offline canvas captures,
  NOT actual browser gameplay screenshots.
- Browser file-URL access was previously denied. No alternate browser, local
  server or indirect navigation was used to bypass that policy.

## Preservation

Backup: `Backups/HorizonLedger_v21_before_startport_art_20260913.zip`.
Archive integrity passed. SHA-256:
`cf47578c573b25f30c5e17488b925aeb262f42c07e863d80b7bb306c2a408c70`.
Copied originals and hashes are in
`Assets/Resources/Sprites/Game/StartPortArt/provenance.json`.

## Not Completed

- New town paintings for the six starting ports, remaining corresponding floors,
  and the 108 individually designed actor sheets are not complete.
- The previous art-production report records six successful image-generation
  calls, but rejected sprite/foreground output. Agent usage limits and image
  quality failures are distinct; neither implies an accepted asset. No alternate
  model or palette/accessory substitution counts as individual art completion.
- Existing character artwork remains in use. Opacity correction does not imply
  that faces, clothing or animation quality have been approved.
- Keyboard/gamepad gameplay, file-URL pixel readback, and gameplay UI at three
  resolutions remain unverified. Furniture silhouettes need further live review.
