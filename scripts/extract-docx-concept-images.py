from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from PIL import Image


source = Path(r"C:\Users\32862\OneDrive\xwechat_files\wxid_zlmr84qnbaqt22_9066\msg\file\2026-08\文创图片(1).docx")
root = Path(__file__).parents[1]
outputs = {
    root / "feature" / "assets" / "images" / "concept-collab": 640,
    root / "assets" / "thumbs" / "concept-collab": 108,
}
for folder in outputs:
    folder.mkdir(parents=True, exist_ok=True)

with ZipFile(source) as archive:
    media = []
    for name in archive.namelist():
        if not name.startswith("word/media/") or not name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        try:
            image = Image.open(BytesIO(archive.read(name))).convert("RGB")
        except Exception:
            continue
        media.append((name, image))

media.sort(key=lambda item: item[0].lower())
if len(media) < 28:
    raise SystemExit(f"expected at least 28 raster images, found {len(media)}")

# The document is grouped by visual category, while the gallery IDs are grouped
# by the original concept records. Keep the records stable and remap the source
# images so each mug/card/book/phone-case entry receives its matching visual.
source_for_gallery = [27, 16, 17, 13, 14, 25, 18, 2, 21, 8, 26, 20, 1, 6, 23, 7, 19, 3, 24, 22, 28, 4, 5, 10, 15, 11, 9, 12]
for index, source_index in enumerate(source_for_gallery, 1):
    image = media[source_index - 1][1]
    for folder, limit in outputs.items():
        current = image.copy()
        current.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        quality = 78 if limit > 200 else 42
        current.save(folder / f"cc-{index:02d}.jpg", format="JPEG", quality=quality, optimize=True, progressive=True)
print(f"extracted={len(media[:28])} source_images={len(media)}")
