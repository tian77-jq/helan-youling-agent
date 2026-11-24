from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).parents[1]
TARGET = (ROOT / "assets" / "thumbs" / "scenic-docx").resolve()
assert TARGET.is_relative_to(ROOT.resolve())

before = 0
after = 0
changed = 0

for source in sorted(TARGET.glob("*.jpg")):
    original = source.read_bytes()
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((640, 640), Image.Resampling.LANCZOS)
    output = BytesIO()
    image.save(output, format="JPEG", quality=72, optimize=True, progressive=True)
    optimized = output.getvalue()
    before += len(original)
    if len(optimized) < len(original):
        source.write_bytes(optimized)
        changed += 1
        after += len(optimized)
    else:
        after += len(original)

print({"target": str(TARGET), "changed": changed, "before": before, "after": after, "saved": before - after})
