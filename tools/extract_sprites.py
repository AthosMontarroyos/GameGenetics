#!/usr/bin/env python3
"""Recorta as folhas do Notion em sprites com fundo transparente.

    python3 tools/extract_sprites.py characters.png pets.png npcs.png

As legendas das folhas mandam no nome. Nada é recolorido nem clareado.
"""

from __future__ import annotations

import shutil
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "sprites"

DIRECTIONS = ("front", "back", "left", "right")


def sheet_array(path: Path) -> tuple[np.ndarray, tuple[int, int, int]]:
    image = Image.open(path).convert("RGB")
    pixels = np.asarray(image)
    background = tuple(int(channel) for channel in pixels[2, 2])
    return pixels, background


def components(
    cell: np.ndarray,
    background: tuple[int, int, int],
    dist: int,
    dilate: int,
    min_w: int,
    min_h: int,
    max_w: int,
    max_h: int,
    min_area: int,
) -> list[tuple[int, int, int, int]]:
    delta = np.abs(cell.astype(np.int16) - np.array(background)).sum(axis=2)
    foreground = delta >= dist
    if dilate:
        grown = foreground.copy()
        for dy in range(-dilate, dilate + 1):
            for dx in range(-dilate, dilate + 1):
                if dx == 0 and dy == 0:
                    continue
                grown |= np.roll(np.roll(foreground, dy, axis=0), dx, axis=1)
        grown[:dilate, :] = False
        grown[-dilate:, :] = False
        grown[:, :dilate] = False
        grown[:, -dilate:] = False
        foreground = grown
    height, width = foreground.shape
    seen = np.zeros((height, width), dtype=np.uint8)
    boxes: list[tuple[int, int, int, int, int]] = []
    for y in range(height):
        for x in range(width):
            if not foreground[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = 1
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            while queue:
                cx, cy = queue.popleft()
                area += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    if seen[ny, nx] or not foreground[ny, nx]:
                        continue
                    seen[ny, nx] = 1
                    queue.append((nx, ny))
            box_w = max_x - min_x + 1
            box_h = max_y - min_y + 1
            if area >= min_area and min_w <= box_w <= max_w and min_h <= box_h <= max_h:
                boxes.append((min_x, min_y, max_x, max_y, area))
    boxes.sort(key=lambda box: box[0])
    return [(box[0], box[1], box[2], box[3]) for box in boxes]


def slots(cell: np.ndarray, count: int, background: tuple[int, int, int], dist: int = 50) -> list[tuple[int, int, int, int]]:
    delta = np.abs(cell.astype(np.int16) - np.array(background)).sum(axis=2)
    foreground = delta >= dist
    xs = np.flatnonzero(foreground.any(axis=0))
    if len(xs) < count:
        raise RuntimeError(f"faixa sem {count} sprites")
    centers = np.linspace(float(xs[0]), float(xs[-1]), count)
    labels = None
    for _ in range(30):
        labels = np.argmin(np.abs(xs[:, None] - centers[None, :]), axis=1)
        updated = centers.copy()
        for index in range(count):
            chosen = labels == index
            if np.any(chosen):
                updated[index] = xs[chosen].mean()
        if np.allclose(updated, centers):
            break
        centers = updated
    order = np.argsort(centers)
    bounds = [int(xs[0])]
    for left, right in zip(order[:-1], order[1:]):
        bounds.append(int((centers[left] + centers[right]) / 2))
    bounds.append(int(xs[-1]) + 1)
    found: list[tuple[int, int, int, int]] = []
    for index in range(count):
        x0, x1 = bounds[index], bounds[index + 1]
        region = foreground[:, x0:x1]
        cols = np.flatnonzero(region.any(axis=0))
        rows = np.flatnonzero(region.any(axis=1))
        if len(cols) == 0 or len(rows) == 0:
            raise RuntimeError("sprite vazio dentro da faixa")
        found.append((x0 + int(cols[0]), int(rows[0]), x0 + int(cols[-1]), int(rows[-1])))
    return found


def cut(sheet: np.ndarray, origin: tuple[int, int], box: tuple[int, int, int, int], background: tuple[int, int, int], dist: int = 42) -> Image.Image:
    ox, oy = origin
    x0, y0, x1, y1 = box
    x0 = max(0, ox + x0 - 1)
    y0 = max(0, oy + y0 - 1)
    x1 = min(sheet.shape[1] - 1, ox + x1 + 1)
    y1 = min(sheet.shape[0] - 1, oy + y1 + 1)
    crop = sheet[y0 : y1 + 1, x0 : x1 + 1]
    delta = np.abs(crop.astype(np.int16) - np.array(background)).sum(axis=2)
    alpha = np.where(delta >= dist, 255, 0).astype(np.uint8)
    rows, cols = np.where(alpha > 0)
    if len(cols) == 0:
        raise RuntimeError("recorte sem pixels")
    crop = crop[rows.min() : rows.max() + 1, cols.min() : cols.max() + 1]
    alpha = alpha[rows.min() : rows.max() + 1, cols.min() : cols.max() + 1]
    return Image.fromarray(np.dstack([crop, alpha]), "RGBA")


def save(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)


def save_frames(frames: list[Image.Image], folder: Path, direction: str) -> None:
    if len(frames) != 3:
        raise RuntimeError(f"{folder.name}/{direction}: esperava 3 quadros, veio {len(frames)}")
    for index, frame in enumerate(frames, start=1):
        save(frame, folder / f"{direction}-{index}.png")
    save(frames[1], folder / f"{direction}.png")


def extract_characters(path: Path) -> None:
    sheet, background = sheet_array(path)
    names = ("geneticista-m", "geneticista-f", "laboratorista-m", "laboratorista-f")
    portrait_columns = ((40, 360), (415, 735), (790, 1130), (1170, 1505))
    for name, (x0, x1) in zip(names, portrait_columns):
        cell = sheet[24:360, x0:x1]
        boxes = components(cell, background, dist=42, dilate=0, min_w=180, min_h=200, max_w=340, max_h=340, min_area=12000)
        if len(boxes) != 1:
            raise RuntimeError(f"retrato {name}: {len(boxes)} blocos")
        portrait = cut(sheet, (x0, 24), boxes[0], background, dist=36)
        save(portrait, OUT / "personagens" / name / "retrato.png")
        print("retrato", name, portrait.size)

    columns = ((28, 372), (398, 752), (772, 1148), (1152, 1522))
    rows = {"front": (388, 548), "back": (548, 722), "left": (700, 875), "right": (850, 1010)}
    for name, (x0, x1) in zip(names, columns):
        folder = OUT / "personagens" / name
        for direction, (y0, y1) in rows.items():
            cell = sheet[y0:y1, x0:x1]
            boxes = components(cell, background, dist=46, dilate=0, min_w=40, min_h=90, max_w=120, max_h=160, min_area=2500)
            frames = [cut(sheet, (x0, y0), box, background, dist=40) for box in boxes]
            save_frames(frames, folder, direction)
            print(name, direction, [frame.size for frame in frames])
        if name == "geneticista-m":
            mirror(folder, OUT / "personagens" / "geneticista")
        if name == "laboratorista-m":
            mirror(folder, OUT / "personagens" / "laboratorista")


def mirror(source: Path, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    for image in source.glob("*.png"):
        shutil.copyfile(image, dest / image.name)


def extract_pets(path: Path) -> None:
    sheet, background = sheet_array(path)
    species = {
        "mendelino": {
            "x": (36, 478),
            "cores": ("branco", "cinza", "preto", "marrom"),
            "tracos": ("orelha-grande", "orelha-pequena"),
            "olhos": ("olho-azul", "olho-verde", "olho-amarelo", "olho-roxo"),
        },
        "gencko": {
            "x": (540, 986),
            "cores": ("azul", "verde", "vermelho", "amarelo"),
            "tracos": ("liso", "manchas", "listras", "pontos"),
            "olhos": ("olho-azul", "olho-verde", "olho-amarelo", "olho-vermelho"),
        },
        "nibbli": {
            "x": (1046, 1488),
            "cores": ("branco", "cinza", "marrom", "rosa"),
            "tracos": ("orelha-longa", "orelha-curta"),
            "olhos": ("olho-azul", "olho-verde", "olho-amarelo", "olho-roxo"),
        },
    }
    bands = {
        "direcao": (186, 312),
        "cor": (404, 530),
        "traco": (618, 756),
        "olho": (842, 972),
    }
    pet_directions = ("frente", "costas", "esquerda", "direita")
    for name, spec in species.items():
        x0, x1 = spec["x"]
        folder = OUT / "pets" / name
        y0, y1 = bands["direcao"]
        boxes = slots(sheet[y0:y1, x0:x1], 4, background)
        for direction, box in zip(pet_directions, boxes):
            sprite = cut(sheet, (x0, y0), box, background)
            save(sprite, folder / f"{direction}.png")
            print(name, direction, sprite.size)
        for key, names in (("cor", spec["cores"]), ("traco", spec["tracos"]), ("olho", spec["olhos"])):
            y0, y1 = bands[key]
            boxes = slots(sheet[y0:y1, x0:x1], len(names), background)
            for label, box in zip(names, boxes):
                sprite = cut(sheet, (x0, y0), box, background)
                save(sprite, folder / f"{label}.png")
                print(name, label, sprite.size, "luma", round(luma(sprite), 1))


def extract_npcs(path: Path) -> None:
    sheet, background = sheet_array(path)
    names = ("estudante-f", "estudante-m", "senhora", "homem", "alternativa", "crianca")
    columns = ((70, 310), (305, 550), (545, 790), (780, 1040), (1030, 1285), (1275, 1525))
    # A margem da folha nomeia as faixas de cima para baixo.
    rows = {"front": (100, 230), "left": (218, 348), "right": (332, 458), "back": (442, 568)}
    for name, (x0, x1) in zip(names, columns):
        folder = OUT / "npcs" / name
        for direction, (y0, y1) in rows.items():
            cell = sheet[y0:y1, x0:x1]
            boxes = components(cell, background, dist=38, dilate=1, min_w=32, min_h=60, max_w=90, max_h=140, min_area=900)
            frames = [cut(sheet, (x0, y0), box, background, dist=36) for box in boxes]
            save_frames(frames, folder, direction)
            print(name, direction, [frame.size for frame in frames])


def luma(image: Image.Image) -> float:
    pixels = np.asarray(image)
    mask = pixels[..., 3] > 20
    if not np.any(mask):
        return 0.0
    return float(pixels[..., :3][mask].mean())


def assert_distinct(path_a: Path, path_b: Path) -> None:
    first = np.asarray(Image.open(path_a).convert("RGBA"))
    second = np.asarray(Image.open(path_b).convert("RGBA").resize(Image.open(path_a).size))
    if first.shape != second.shape:
        second = np.asarray(Image.open(path_b).convert("RGBA").resize((first.shape[1], first.shape[0])))
    delta = np.abs(first.astype(np.int16) - second.astype(np.int16)).mean()
    if delta < 8:
        raise RuntimeError(f"{path_a.name} e {path_b.name} saíram iguais ({delta:.2f})")


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("uso: extract_sprites.py characters.png pets.png npcs.png")
    characters, pets, npcs = map(Path, sys.argv[1:])
    if OUT.exists():
        shutil.rmtree(OUT)
    extract_characters(characters)
    extract_pets(pets)
    extract_npcs(npcs)
    assert_distinct(OUT / "personagens/geneticista/front.png", OUT / "personagens/laboratorista/front.png")
    assert_distinct(OUT / "pets/mendelino/branco.png", OUT / "pets/mendelino/preto.png")
    white = luma(Image.open(OUT / "pets/mendelino/branco.png"))
    black = luma(Image.open(OUT / "pets/mendelino/preto.png"))
    if white <= black:
        raise RuntimeError(f"pelo branco ({white:.1f}) não ficou mais claro que o preto ({black:.1f})")
    print("ok", white, black)


if __name__ == "__main__":
    main()
