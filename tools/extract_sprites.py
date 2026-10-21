#!/usr/bin/env python3
"""Recorta as folhas de referência do Notion em sprites com fundo transparente.

    python3 tools/extract_sprites.py characters.png pets.png npcs.png shop.png

A folha dos personagens traz o geneticista em quatro direções na faixa de cima.
O laboratorista reaproveita essa silhueta com os detalhes roxos puxados para o azul,
porque a faixa de baixo é legenda e não um segundo conjunto limpo de corpos.
"""

from __future__ import annotations

import sys
from collections import Counter, deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "sprites"


def dominant_color(im: Image.Image) -> tuple[int, int, int]:
    px = im.load()
    width, height = im.size
    counts: Counter[tuple[int, int, int]] = Counter()
    for y in range(0, height, 3):
        for x in range(0, width, 3):
            red, green, blue = px[x, y][:3]
            counts[(red // 6 * 6, green // 6 * 6, blue // 6 * 6)] += 1
    return counts.most_common(1)[0][0]


def knock_out(im: Image.Image, dist: int = 34) -> Image.Image:
    im = im.convert("RGBA")
    background = dominant_color(im)
    px = im.load()
    width, height = im.size
    for y in range(height):
        for x in range(width):
            red, green, blue, _alpha = px[x, y]
            if abs(red - background[0]) + abs(green - background[1]) + abs(blue - background[2]) < dist:
                px[x, y] = (0, 0, 0, 0)
    return im


def largest_sprite(im: Image.Image, inset: int = 8) -> Image.Image:
    if inset:
        im = im.crop((inset, inset, im.width - inset, im.height - inset))
    im = knock_out(im)
    width, height = im.size
    px = im.load()
    seen = bytearray(width * height)
    best: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            start = y * width + x
            if seen[start] or px[x, y][3] == 0:
                continue
            queue = deque([(x, y)])
            seen[start] = 1
            cells = [(x, y)]
            while queue:
                cx, cy = queue.popleft()
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    index = ny * width + nx
                    if seen[index] or px[nx, ny][3] == 0:
                        continue
                    seen[index] = 1
                    queue.append((nx, ny))
                    cells.append((nx, ny))
            if len(cells) > len(best):
                best = cells
    if not best:
        return im
    keep = set(best)
    for y in range(height):
        for x in range(width):
            if (x, y) not in keep and px[x, y][3]:
                px[x, y] = (0, 0, 0, 0)
    xs = [point[0] for point in best]
    ys = [point[1] for point in best]
    return im.crop((min(xs), min(ys), max(xs) + 1, max(ys) + 1))


def trim_background(im: Image.Image, background: tuple[int, int, int], dist: int = 42) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    width, height = im.size
    for y in range(height):
        for x in range(width):
            red, green, blue, _alpha = px[x, y]
            if abs(red - background[0]) + abs(green - background[1]) + abs(blue - background[2]) < dist:
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def save(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)


def mean_luma(im: Image.Image) -> float:
    total = count = 0
    for red, green, blue, alpha in im.getdata():
        if alpha < 20:
            continue
        total += (red + green + blue) / 3
        count += 1
    return total / max(count, 1)


def tint_laboratorista(im: Image.Image) -> Image.Image:
    """Troca os detalhes roxos por azul para separar o laboratorista."""
    out = im.convert("RGBA").copy()
    px = out.load()
    width, height = out.size
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = px[x, y]
            if alpha < 20:
                continue
            if red > 70 and blue > 70 and red > green + 12 and blue > green:
                px[x, y] = (int(red * 0.45), int(green * 0.75), min(255, int(blue * 1.15 + 30)), alpha)
    return out


def extract_characters(path: Path) -> None:
    sheet = Image.open(path).convert("RGB")
    columns = [(13, 378), (389, 762), (781, 1151), (1161, 1529)]
    directions = ["front", "back", "left", "right"]
    for index, (x0, x1) in enumerate(columns):
        sprite = largest_sprite(sheet.crop((x0, 7, x1, 381)), inset=8)
        save(sprite, OUT / "personagens" / "geneticista" / f"{directions[index]}.png")
        save(tint_laboratorista(sprite), OUT / "personagens" / "laboratorista" / f"{directions[index]}.png")
        print(directions[index], sprite.size)


def extract_pets(path: Path) -> None:
    sheet = Image.open(path).convert("RGB")
    rows = {
        "mendelino": (360, 570),
        "gencko": (578, 793),
        "nibbli": (801, 1011),
    }
    columns = [(17, 508), (523, 1015), (1030, 1520)]
    mendelinos = []
    for name, (y0, y1) in rows.items():
        sprites = []
        for x0, x1 in columns:
            sprites.append(largest_sprite(sheet.crop((x0, y0, x1, y1)), inset=6))
        if name == "mendelino":
            mendelinos = list(enumerate(sprites))
        else:
            for index, sprite in enumerate(sprites, start=1):
                save(sprite, OUT / "pets" / name / f"variante-{index}.png")
                print(name, index, sprite.size)
    mendelinos.sort(key=lambda item: mean_luma(item[1]))
    labeled = list(zip(["preto", "cinza", "branco"], mendelinos))
    for label, (_index, sprite) in labeled:
        save(sprite, OUT / "pets" / "mendelino" / f"{label}.png")
        print("mendelino", label, round(mean_luma(sprite), 1), sprite.size)
    # O pelo branco do nível 1 é o mesmo recorte do preto, só mais claro,
    # para o fenótipo não trocar de espécie.
    dark = labeled[0][1][1].convert("RGBA")
    light = dark.copy()
    pixels = light.load()
    for y in range(light.height):
        for x in range(light.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha < 10:
                continue
            pixels[x, y] = (
                min(255, int(red * 1.55 + 80)),
                min(255, int(green * 1.55 + 80)),
                min(255, int(blue * 1.55 + 80)),
                alpha,
            )
    save(light, OUT / "pets" / "mendelino" / "branco.png")


def extract_npcs(path: Path) -> None:
    sheet = Image.open(path).convert("RGB")
    background = sheet.getpixel((2, 2))
    columns = [(78, 301), (315, 541), (555, 777), (791, 1029), (1043, 1275), (1289, 1514)]
    names = ["estudante-f", "estudante-m", "senhora", "homem", "alternativa", "crianca"]
    directions = ["front", "back", "left", "right"]
    # A primeira faixa de cada cliente já traz as quatro direções lado a lado.
    y0, y1 = 115, 218
    for (x0, x1), name in zip(columns, names):
        strip = sheet.crop((x0, y0, x1, y1))
        width = strip.width
        for index, direction in enumerate(directions):
            slice_box = (int(index * width / 4), 0, int((index + 1) * width / 4), strip.height)
            frame = trim_background(strip.crop(slice_box), background, dist=40)
            save(frame, OUT / "npcs" / name / f"{direction}.png")
            print(name, direction, frame.size)


def extract_shop(path: Path) -> None:
    image = Image.open(path).convert("RGB")
    image = image.resize((1280, 853), Image.Resampling.LANCZOS)
    dest = ROOT / "assets" / "shop" / "cenario-1.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, "PNG", optimize=True)
    print("shop", dest.stat().st_size)


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit("uso: extract_sprites.py characters.png pets.png npcs.png shop.png")
    characters, pets, npcs, shop = map(Path, sys.argv[1:])
    extract_characters(characters)
    extract_pets(pets)
    extract_npcs(npcs)
    extract_shop(shop)


if __name__ == "__main__":
    main()
