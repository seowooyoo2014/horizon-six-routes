NAMES=['index.html', 'Web', 'Assets']
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'dist'
if DEST.exists():shutil.rmtree(DEST)
DEST.mkdir()
for name in NAMES:
 source=ROOT/name
 if not source.exists():raise FileNotFoundError(source)
 target=DEST/name
 if source.is_dir():shutil.copytree(source,target,ignore=shutil.ignore_patterns('.DS_Store','*.blend','*.blend1','*.zip','*.sha256','source','renders','design_v2','fallback_v1'))
 else:target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
(DEST/'.nojekyll').write_text('')
print('built', len(NAMES), 'paths')
