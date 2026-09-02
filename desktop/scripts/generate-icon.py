from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
OUTPUT = BUILD / "icon.ico"


def build_icon():
    BUILD.mkdir(parents=True, exist_ok=True)
    size = 512
    image = Image.new("RGBA", (size, size), (12, 18, 30, 255))
    draw = ImageDraw.Draw(image)

    # RUSH brand tile: clean office-blue mark with an original geometric R.
    pad = 42
    draw.rounded_rectangle(
        (pad, pad, size - pad, size - pad),
        radius=110,
        fill=(37, 99, 235, 255),
    )

    white = (255, 255, 255, 255)
    x0, y0 = 150, 125
    stem_w = 54
    draw.rounded_rectangle((x0, y0, x0 + stem_w, 390), radius=24, fill=white)
    draw.rounded_rectangle((x0 + 26, y0, 350, 195), radius=35, fill=white)
    draw.rounded_rectangle((x0 + 26, 210, 350, 280), radius=35, fill=white)
    draw.rounded_rectangle((300, 150, 370, 260), radius=34, fill=white)
    draw.polygon([(240, 260), (302, 260), (378, 390), (310, 390)], fill=white)

    # Small document/page accent to distinguish RUSH Office Suite.
    draw.rounded_rectangle((344, 318, 414, 404), radius=12, fill=(219, 234, 254, 255))
    draw.rectangle((358, 339, 400, 347), fill=(37, 99, 235, 255))
    draw.rectangle((358, 359, 394, 367), fill=(37, 99, 235, 255))
    draw.rectangle((358, 379, 386, 387), fill=(37, 99, 235, 255))

    image.save(
        OUTPUT,
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(f"Generated Windows icon: {OUTPUT}")


if __name__ == "__main__":
    build_icon()
