from pathlib import Path

from PIL import Image, ImageOps


source_dir = Path(r"C:\Users\32862\AppData\Local\Temp")
output_dir = Path(__file__).parents[1] / "feature" / "assets" / "images" / "concept-collab"
output_dir.mkdir(parents=True, exist_ok=True)
files = sorted(source_dir.glob("codex-clipboard-*.jpg"))
sizes = []
for index, source in enumerate(files, 1):
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((640, 640), Image.Resampling.LANCZOS)
    target = output_dir / f"cc-{index:02d}.jpg"
    image.save(target, format="JPEG", quality=78, optimize=True, progressive=True)
    sizes.append(target.stat().st_size)
print(f"optimized={len(sizes)} total_bytes={sum(sizes)} max_bytes={max(sizes)}")
