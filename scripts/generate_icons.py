from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "icons"
SIZES = [16, 32, 48, 128]
SCALE = 4


def draw_marker(size: int) -> Image.Image:
  scale = size / 128

  def p(value: float) -> int:
    return round(value * scale)

  marker = Image.new("RGBA", (p(58), p(92)), (0, 0, 0, 0))
  draw = ImageDraw.Draw(marker)

  draw.rounded_rectangle([p(10), p(0), p(48), p(60)], radius=p(10), fill="#2DD4BF")
  draw.line([(p(16), p(14)), (p(42), p(14))], fill="#DFFCF8", width=max(1, p(5)))
  draw.polygon([(p(14), p(55)), (p(44), p(55)), (p(36), p(74)), (p(22), p(74))], fill="#F8FAFC")
  draw.polygon([(p(22), p(74)), (p(36), p(74)), (p(29), p(84))], fill="#172033")

  return marker.rotate(24, expand=True, resample=Image.Resampling.BICUBIC)


def draw_sparkle(draw: ImageDraw.ImageDraw, scale: float) -> None:
  def p(value: float) -> int:
    return round(value * scale)

  points = [
    (91, 23),
    (95, 35),
    (107, 39),
    (95, 43),
    (91, 55),
    (87, 43),
    (75, 39),
    (87, 35),
  ]
  draw.polygon([(p(x), p(y)) for x, y in points], fill="#A78BFA")


def draw_icon(size: int) -> Image.Image:
  canvas_size = size * SCALE
  scale = canvas_size / 128

  def p(value: float) -> int:
    return round(value * scale)

  image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
  draw = ImageDraw.Draw(image)

  draw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=p(28), fill="#0F172A")
  draw.line(
    [(p(28), p(94)), (p(45), p(89)), (p(63), p(88)), (p(82), p(90)), (p(104), p(91))],
    fill="#FFE66D",
    width=max(1, p(10)),
    joint="curve",
  )

  marker = draw_marker(canvas_size)
  image.alpha_composite(marker, (p(36), p(18)))
  draw_sparkle(draw, scale)

  return image.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
  OUT.mkdir(parents=True, exist_ok=True)
  for size in SIZES:
    draw_icon(size).save(OUT / f"icon-{size}.png")


if __name__ == "__main__":
  main()
