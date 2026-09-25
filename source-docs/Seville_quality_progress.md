# Seville Quality Pass, Updated 2026-09-13

For the subsequent eleven-image integration, recovery fixes and remaining work,
see `StartPortArt_progress.md`. That report supersedes this file's integration scope.

## Current Status (supersedes the historical notes below)

- Active: generated Seville town, guild 1F/2F/B1 and lodging bedroom backgrounds,
  authored collision, stairs, foreground masks and interaction points.
- Active: ordered ordinary-work opening, repeat-action protection, save restore,
  trade quote confirmation, cancel and stale-price rejection.
- Fixed absent-cargo subtraction producing NaN on multi-ship sales.
- Save version remains 21; browser saves and original assets are preserved.
- Full Assets/Web/Tools/Docs backup: `Backups/HorizonLedger_v21_before_seville_town_20260912.zip`.
  Archive integrity passed; SHA-256:
  `f39340723863f10a2e50d5f97280ab04743a9959bdb3c9fe85fbc1a3347bd55a`.
- Integrated opening tests load quality, town and trade together: seven groups PASS.
  Four interior layouts, ten town facility entry/exit round trips, six NPC access
  points and trade confirmation tests PASS. Tests use in-memory saves.
- Offline canvas renders are under `Docs/Screenshots/SevilleQuality/`, including
  three scaled resolutions. These are NOT actual browser gameplay screenshots.
- Astra subagents produced town art, opening work and a Seria sprite draft;
  Luna ran routine QA. Parent integrated and reviewed results. Built-in image
  generation produced the artwork.
- New Seria draft remains inactive: walking frames lack consistent alternating
  strides; verification says `integrationReady: false`. Its agent hit a usage limit.
- Dedicated NPC artwork, animated town water and actual keyboard/gamepad journey
  remain unfinished. Roof and furniture occlusion need additional gameplay review.
- File URL navigation was denied by browser security policy; no workaround was used.

## Historical Notes (2026-09-12)

Status: partial implementation, not approved for visual completion.

## Preserved files

Before editing, the four affected V21 source/generator files were archived in
`Backups/Seville_before_quality_20260912.zip`. This is a scoped source snapshot,
not a full V21 recovery archive. Existing full backups and browser saves were
not modified.

SHA-256: `3d4203d4417c2c65825db281a082e057236bdf1d8b81b6d7274b3f3d97405861`.

## Implemented

- Correct trade mode parsing: `buy` and `sell` are no longer truncated.
- Daily work must precede news; repeated opening actions do not advance twice.
- Repeating the caller conversation preserves progress and current objective.
- Current V21 interior saves preserve coordinates during migration. Runtime
  safe-position checks still apply on resume.
- Added focused regression tests with isolated in-memory save storage.

## Artwork

Built-in image generation produced `Assets/Resources/Sprites/Game/V21/seville_guild_quality_draft.png`.
Inspected the complete image: central chart table, north reception counter,
western measurement room, eastern archive and southern entrance are readable.
The large table, telescope, stairs and black exterior still require authored
collision and foreground masks. The draft is deliberately NOT active in game.

Prompt: Create a production game background: Seville nautical cartographer guild ground floor, original exquisite 16-bit top-down pixel art, warm amber lamps and upper-left window light, crisp pixel clusters, rich carved walnut wood, teal stone floor, burgundy rugs, convincing contact shadows. 16:9 landscape. No people, no text, no UI. Layout for playable RPG: black outside a rectangular cutaway building; bottom center entrance; central large world map worktable occupying center 38%-62% width and 45%-65% height; north counter; left room with brass telescope and chart scrolls; right archive with bookshelves; stairs at bottom right; generous continuous walking passages around all furniture and between rooms. Beautiful detailed purposeful objects rather than geometric boxes. Flat top-down game perspective with visible front faces, not isometric or 3D. Deliver single full scene.

## Verification

- `Web/tests/seville_quality_regression.js`: PASS, including six-captain boot.
- `Web/tests/v21_rebuild.js`: PASS. These are structural/model checks, not visual approval.
- Actual file URL browser navigation was denied by browser security policy.
  No alternate browser or indirect navigation was attempted.
- Keyboard journey, gamepad, three-resolution gameplay captures, new Seria/NPC
  sheets, town/bedroom/upper/basement artwork and artwork integration remain undone.
- No Astra/Luna handoff or model switch was performed; the task's current model
  performed this work. Image generation used the built-in image tool.
