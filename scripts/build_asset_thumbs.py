from pathlib import Path
from PIL import Image

SOURCE = Path('assets/images')
TARGET = Path('assets/thumbs')

for source in SOURCE.rglob('*'):
    if source.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        continue
    relative = source.relative_to(SOURCE)
    target = TARGET / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert('RGB')
        if relative.parts[0] == 'food-collab':
            limit = 640
            quality = 68
        elif relative.parts[0] == 'products':
            limit = 360
            quality = 70
        else:
            limit = 620
            quality = 70
        image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        image.save(target, format='JPEG', quality=quality, optimize=True, progressive=True)
        print(f'{source} -> {target} ({target.stat().st_size} bytes)')
