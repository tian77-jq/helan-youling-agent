from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).parents[1] / "feature" / "assets" / "images" / "concept-collab"
files = sorted(root.glob("cc-*.jpg"))
cell = 170
out = Image.new("RGB", (cell * 4, cell * 7), "white")
draw = ImageDraw.Draw(out)
for i, file in enumerate(files):
    image = Image.open(file).convert("RGB")
    image.thumbnail((150, 140), Image.Resampling.LANCZOS)
    x = (i % 4) * cell + 10
    y = (i // 4) * cell + 5
    out.paste(image, (x, y))
    draw.text((x, y + 145), file.stem, fill="black")
out.save(Path(__file__).parents[1] / "concept-docx-contact.jpg", quality=85)
