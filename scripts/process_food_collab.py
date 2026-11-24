"""Analyze and optimize the Ningxia food x Helan mascot collaboration images.

The source ZIP is opened read-only. Extracted originals are kept in a temporary
working directory; optimized assets and an audit report are written separately.
"""

from __future__ import annotations

import argparse
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
COMPACT_STEMS = {"overview_full", "shizuishan"}


def image_files(root: Path) -> list[Path]:
    return sorted(
        (path for path in root.rglob("*") if path.suffix.lower() in IMAGE_SUFFIXES),
        key=lambda path: path.name,
    )


def analyze(paths: list[Path]) -> list[dict]:
    rows = []
    for index, path in enumerate(paths, start=1):
        with Image.open(path) as image:
            width, height = image.size
            rows.append(
                {
                    "index": index,
                    "source_name": path.name,
                    "source_format": image.format,
                    "source_mode": image.mode,
                    "source_width": width,
                    "source_height": height,
                    "source_ratio": round(width / height, 4),
                    "source_bytes": path.stat().st_size,
                    "has_transparency": image.mode in {"RGBA", "LA"}
                    or "transparency" in image.info,
                }
            )
    return rows


def create_contact_sheet(paths: list[Path], output: Path) -> None:
    tile_w, tile_h = 540, 410
    caption_h = 54
    columns = 2
    rows = (len(paths) + columns - 1) // columns
    sheet = Image.new("RGB", (tile_w * columns, (tile_h + caption_h) * rows), "#eee5d9")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=22)

    for index, path in enumerate(paths, start=1):
        with Image.open(path) as image:
            preview = ImageOps.contain(image.convert("RGB"), (tile_w - 20, tile_h - 20))
            x0 = ((index - 1) % columns) * tile_w
            y0 = ((index - 1) // columns) * (tile_h + caption_h)
            x = x0 + (tile_w - preview.width) // 2
            y = y0 + (tile_h - preview.height) // 2
            sheet.paste(preview, (x, y))
            draw.text((x0 + 14, y0 + tile_h + 12), f"{index:02d}  {image.width}x{image.height}", fill="#342b25", font=font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, "JPEG", quality=90, optimize=True)


def corner_color(image: Image.Image) -> tuple[int, int, int]:
    rgb = image.convert("RGB")
    width, height = rgb.size
    sample = max(8, min(width, height) // 20)
    corners = [
        rgb.crop((0, 0, sample, sample)),
        rgb.crop((width - sample, 0, width, sample)),
        rgb.crop((0, height - sample, sample, height)),
        rgb.crop((width - sample, height - sample, width, height)),
    ]
    pixels = [pixel for corner in corners for pixel in corner.getdata()]
    return tuple(sum(pixel[channel] for pixel in pixels) // len(pixels) for channel in range(3))


def enhance(image: Image.Image, target_size: tuple[int, int] = (1920, 1280)) -> tuple[Image.Image, bool, bool]:
    """Apply conservative, non-generative enhancement without cropping."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    resized = width < target_size[0] or height < target_size[1]
    # Contain rather than crop: city headings, mascot faces and dishes all remain visible.
    rgb = ImageOps.pad(
        rgb,
        target_size,
        method=Image.Resampling.LANCZOS,
        color=corner_color(rgb),
        centering=(0.5, 0.5),
    )

    # Small global adjustments retain the original design and avoid halos/noise.
    rgb = ImageEnhance.Contrast(rgb).enhance(1.025)
    rgb = ImageEnhance.Color(rgb).enhance(1.015)
    sharpened = rgb.filter(ImageFilter.UnsharpMask(radius=1.05, percent=105, threshold=3))
    return sharpened, resized, True


def process(paths: list[Path], output_dir: Path, mapping: list[str]) -> list[dict]:
    if len(mapping) != len(paths):
        raise ValueError("Output-name mapping must contain one name per source image")

    output_dir.mkdir(parents=True, exist_ok=True)
    records = []
    for source, stem in zip(paths, mapping):
        with Image.open(source) as image:
            original_size = image.size
            target_size = (320, 213) if stem in COMPACT_STEMS else (1280, 853)
            optimized, super_resized, sharpened = enhance(image, target_size)
            output = output_dir / f"{stem}.jpg"
            quality = 35 if stem in COMPACT_STEMS else (68 if stem in {"yinchuan", "wuzhong", "zhongwei", "guyuan"} else 55)
            optimized.save(output, "JPEG", quality=quality, optimize=True, progressive=True)
            records.append(
                {
                    "source_name": source.name,
                    "source_format": image.format,
                    "source_width": original_size[0],
                    "source_height": original_size[1],
                    "source_bytes": source.stat().st_size,
                    "output_name": output.name,
                    "output_format": "JPEG",
                    "output_width": optimized.width,
                    "output_height": optimized.height,
                    "output_bytes": output.stat().st_size,
                    "super_resolution": False,
                    "lanczos_upscale": super_resized,
                    "light_sharpening": sharpened,
                }
            )
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", required=True, type=Path)
    parser.add_argument("--work", required=True, type=Path)
    parser.add_argument("--contact-sheet", required=True, type=Path)
    parser.add_argument("--analysis-json", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--mapping-json", type=Path)
    parser.add_argument("--report-json", type=Path)
    args = parser.parse_args()

    source_dir = args.work / "source"
    if source_dir.exists():
        work_root = args.work.resolve()
        source_root = source_dir.resolve()
        if source_root.parent != work_root:
            raise ValueError("Refusing to remove a source directory outside the requested work directory")
        shutil.rmtree(source_dir)
    source_dir.mkdir(parents=True)
    # The archive was created by a Windows Chinese locale ZIP tool and stores
    # names in GBK without the UTF-8 flag. Python otherwise decodes them as CP437.
    with zipfile.ZipFile(args.zip, "r", metadata_encoding="gbk") as archive:
        archive.extractall(source_dir)

    paths = image_files(source_dir)
    analysis = analyze(paths)
    args.analysis_json.parent.mkdir(parents=True, exist_ok=True)
    args.analysis_json.write_text(json.dumps(analysis, ensure_ascii=False, indent=2), encoding="utf-8")
    create_contact_sheet(paths, args.contact_sheet)

    if args.output and args.mapping_json:
        mapping = json.loads(args.mapping_json.read_text(encoding="utf-8"))
        records = process(paths, args.output, mapping)
        report_path = args.report_json or (args.output / "processing-report.json")
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({"images": len(paths), "analysis": analysis}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
