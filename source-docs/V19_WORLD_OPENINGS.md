# V19 World and Playable Openings

- Save key: `horizon-ledger-v19-slot-*`; V18 slots remain untouched.
- New games begin under direct control in the selected captain's workplace.
- Six openings use three physical interaction points before normal campaign play.
- Towns use three size classes and 120 distinct structural signatures.
- Town and interior actors share the V19 movement and rendering profile.
- V19 remains compatible with the existing sea, battle, economy, treasure and campaign systems.
- Town buildings use collision-safe size templates instead of failed random-placement fallbacks.
- The harbor is always the closest facility to the dock spawn, and every spawn and roaming NPC is checked against buildings, water and landmarks.

## Opening cadence

Each captain completes an ordinary task, receives concrete evidence, confirms it with a responsible person, and only then begins departure preparations. Later chapters retain the career-fame, home-port and facility-trigger rhythm.

## Art rules

The renderer uses original 16-bit top-down forms, culture-specific materials, fixed pixel edges, animated water, room darkness and per-captain visual recipes. Commercial game tiles, maps and dialogue are not included.

## Verification

- 120 distinct towns: no overlapping buildings, blocked spawns or unreachable facilities.
- 1,800 floors: exits, stairs, owners and hotspot perimeters are reachable.
- Six playable openings: ordinary work, witness report and confirmation complete in order while the facility service remains available.
- V18 slots are copied to V19 without deleting the source save.
- DOS sailing, sea navigation, V9 story flow and V16-V18 campaign regressions pass.
- Twelve 960x540 reference renders are stored in `Docs/Screenshots/V19`.
