from pathlib import Path

from PIL import Image, ImageOps


root = Path(__file__).parents[1]
source_dir = root / "feature" / "assets" / "images" / "concept-collab"
output_dir = root / "assets" / "thumbs" / "concept-collab"
output_dir.mkdir(parents=True, exist_ok=True)
sizes = []
for source in sorted(source_dir.glob("cc-*.jpg")):
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((108, 108), Image.Resampling.LANCZOS)
    target = output_dir / source.name
    image.save(target, format="JPEG", quality=42, optimize=True, progressive=True)
    sizes.append(target.stat().st_size)
print(f"created={len(sizes)} total_bytes={sum(sizes)} max_bytes={max(sizes)}")
