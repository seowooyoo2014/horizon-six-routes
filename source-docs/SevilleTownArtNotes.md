# Seville Town Source Art

- Asset: Assets/Resources/Sprites/Game/SevilleQuality/seville_town_source.png
- Exact native dimensions: 1672 x 941 pixels (approximately 16:9; no resampling).
- Generated with built-in imagegen; one targeted waterfront revision.
- Style reference inspected: Assets/Resources/Sprites/Game/V21/seville_guild_quality_draft.png. Its material rendering and lighting informed the text prompt; the source reference was not edited.
- Visual inspection: ten distinct principal buildings, ten visible south-facing main entrance doorways. Count matches the requested ten.
- Doors open onto visible connected paving. Small dry central fountain can be bypassed on either side.
- Final sea begins approximately at y=847 (90% of height), so it is confined within the bottom 15%, but fills about 10%, not exactly 15%. Central stone pier remains connected.
- No people, labels, text, or UI observed.
- The top edge clips portions of some upper roof silhouettes; the full playable street network is visible.
- No browser was used. No Web files, existing assets, Unity imports, or collision data were changed.

## Observed Door Coordinates

Coordinates below are approximate visual measurements in the final 1672 x 941 source, not the intended prompt coordinates. Origin is top-left; x increases right; y increases down. Threshold coordinates indicate bottom-center of each doorway at street contact. Allow about +/-5 pixels and inspect before creating collision or interaction bounds. Building function is inferred from intended placement and architectural props.

| Building | Door center (x, y) | Threshold (x, y) |
| --- | --- | --- |
| Bank | (202, 228) | (202, 255) |
| Estate | (488, 229) | (488, 256) |
| Mansion | (836, 235) | (836, 262) |
| Cartography guild | (1182, 230) | (1182, 256) |
| Lodging | (1504, 235) | (1504, 260) |
| Market | (216, 467) | (216, 492) |
| Inn | (501, 481) | (501, 505) |
| Home | (344, 640) | (344, 666) |
| Harbor office | (1325, 474) | (1325, 498) |
| Shipyard | (1176, 648) | (1176, 674) |

For normalized top-left coordinates, divide x by 1672 and y by 941. Convert y direction as required by the parent Unity mapping workflow.

## Initial Generation Prompt

Use case: stylized-concept.
Asset type: ONE original finished Unity RPG outdoor town-map background, landscape 16:9, target 1920x1080 or 2048x1152 pixels. Entire map visible edge to edge as a single continuous scene. High-detail polished 16-bit pixel art, crisp pixel clusters, warm Spanish limestone and white stucco, individually detailed terracotta tiles, intricate woodcraft, teal ceramic accents, orange trees. Match the richly crafted warm material detail of the inspected Seville guild reference: precise carved wood, tiny brass fittings, convincing cobblestone, amber light from upper left. This is a NEW outdoor town, not a depiction of the reference interior.

Camera: classic RPG top-down three-quarter orthographic, north up, roof visible north/above every south/front facade. No isometric diagonal rotation. Legible traversable full town, no people, no text, no labels, no UI, no panels, no collage, no border.

CRITICAL COUNT: EXACTLY TEN separate identifiable buildings and EXACTLY TEN visible accessible exterior entrance doorways, ONE south-facing doorway per building. Closed wooden door leaves are fine. Each doorway must meet open walkable paving directly to its south. No extra ground-floor arches, gates, side doors, open sheds, or dark openings that read as extra doors. Windows must be small, raised above ground, visibly glazed or shuttered. Do not hide any door behind a tree or awning. Buildings must have deliberately different stepped/curved/asymmetric silhouettes and roof structures, not ten simple rectangles. No anonymous background buildings.

Precise intended arrangement in normalized map coordinates (not text to render):
UPPER ROW contains FIVE clearly separated buildings, spanning roughly y=0.04 to 0.32. Their entrances align near y=0.33, all opening south onto a broad east-west street occupying y=0.34 to 0.43. From left to right:
1 BANK centered x=.10: compact ornate limestone bank, octagonal corner turret joined to a stepped hipped roof, metal-studded single front doorway at (.10,.33).
2 ESTATE x=.29: white stucco L-shaped residence with a private planted orange garden, no gate or extra entrance, one front doorway at (.29,.33).
3 MANSION x=.49: tallest elegant scalloped Spanish gable, carved projecting balcony and staggered roof wings, one front doorway at (.49,.33).
4 CARTOGRAPHY GUILD x=.69: asymmetrical double-gabled chart workshop, brass rooftop armillary sphere, small rolled nautical charts displayed beside glazed windows, one front doorway at (.69,.33).
5 LODGING x=.90: tall narrow stepped terracotta roofs and a projecting glazed wooden upper gallery, one front doorway at (.90,.33).

OTHER FIVE buildings arranged along left and right sides, preserving a broad open central north-south street from the upper cross street to the central stone pier:
6 MARKET at left-middle x=.11, y=.45-.59, entrance near (.11,.59). Distinct low curved tiled roof and striped fabric awning, produce baskets against wall away from doorway. This is ONE enclosed market building with ONE unmistakable wooden entrance.
7 INN at left-middle x=.30, y=.45-.61, entrance near (.30,.61). Broad asymmetric hip roof, substantial chimney, upper balcony and barrels tucked beside wall.
8 HOME at lower-left x=.20, y=.67-.78, entrance near (.20,.78). Small white stucco cottage with offset lean-to roof and flower window boxes, one front door.
9 HARBOR OFFICE at right-middle x=.82, y=.46-.63, entrance near (.82,.63). Irregular limestone customs house with attached short square lookout tower and teal shutters, one front door.
10 SHIPYARD at lower-right x=.81, y=.68-.79, entrance near (.81,.79). Long low sawtooth timber-and-stucco roof with short offset wing, ONE south doorway, ship timber ribs, coiled ropes and workbench outside against its east wall, no additional shed or gate.

All roof/footprint shapes fully distinct and separated by actual visible connected paving. Keep doorway scales consistent and legible. Wide pedestrian lanes south of all ten doorways connect to central street, streets form a connected network. One SMALL dry central stone fountain, visibly empty basin with NO water, around (.50,.54), easy walking room on BOTH sides. A few orange trees in small beds at outer edges and beside buildings without blocking any entrances or route. Detailed warm limestone paving with restrained inlays, avoid clutter.

WATER GEOMETRY: Land and all streets occupy the upper 85% of the image. Straight continuous horizontal stone waterfront edge at y=.85. Blue-green seawater ONLY in bottom 15%, absolutely no channels, canals, pools, water courtyards, or water elsewhere. Central broad stone pier at x=.47-.53 extends south from the land across this bottom waterfront band. Nothing blocks the pier approach. Tiny sea ripples and clear masonry edge; no boats obscuring playable paths.

Prioritize ten readable doorways and separate buildings, believable hand-crafted architectural detail, generous connected streets, crisp pixel art and strong overhead map readability. No writing or symbols resembling letters anywhere. Render exactly ONE full-map image.

## Targeted Waterfront Edit Prompt

Edit this single town map with ONE targeted geometry correction. Preserve the exact ten buildings, all ten existing south-facing wooden entrance doors, their positions, roofs, paving style, colors, lighting, orange trees, dry central fountain and detailed 16-bit pixel-art style. Preserve 16:9 full-map composition and original resolution or increase to 1920x1080 / 2048x1152. Change only the bottom waterfront geometry: extend dry stone promenade land southward so that the first seawater pixels begin at exactly 85% of image height (y=800 for 941-height image). Current sea begins around y=762 and is too tall. Move the horizontal quay wall down about 40 pixels, fill the vacated area with matching walkable warm stone paving. Water must occupy ONLY the last/bottom 15% of image, blue-green seawater below y=.85, no water elsewhere. Maintain the central stone pier joined continuously to the central street and projecting south into the now shallower water band. Preserve all 10 existing doors exactly; do not add any doors, buildings, people, labels, text, or UI. One seamless complete map.

