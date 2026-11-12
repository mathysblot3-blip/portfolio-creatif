"""Palette commune du Quartier : 48 couleurs, 8 rampes de 6 teintes (de la plus sombre à la plus claire).

Ce script est la source unique de la palette. Il fabrique :
  - assets/palette/le-quartier.gpl : à importer dans Aseprite
  - assets/palette/le-quartier.png : une image de 48 pixels (1 pixel par couleur), importable aussi
  - assets/palette/apercu.png      : la même chose en grand, pour la regarder

Pour changer une couleur : modifie son code ci-dessous, puis lance  python outils/palette.py

Principe des rampes : en s'assombrissant, une couleur glisse vers le violet (ombres froides) ;
en s'éclaircissant, elle glisse vers le jaune (lumière dorée de fin d'après-midi).
"""
from pathlib import Path

from PIL import Image, ImageDraw

RAMPES = {
    "Encre et papier": ["14101a", "2b2433", "4a3f52", "7d7080", "b9ab9f", "f4ecd8"],
    "Peau":            ["5c2e2a", "8f4a3a", "c27a55", "e0a37a", "f1c9a0", "fbe6cc"],
    "Bois et terre":   ["2a1a14", "4a2e20", "6b4630", "96683f", "c0935a", "e3c389"],
    "Or":              ["6e4a14", "a8741c", "d89c2a", "f0c040", "f8dc78", "fff4b8"],
    "Rouge et rose":   ["4a1428", "7e1e3c", "b8324f", "e0507a", "f08a9c", "fbc4c4"],
    "Vert":            ["16302a", "24503a", "3f7a42", "6ba84e", "a4cf62", "dcec9a"],
    "Bleu":            ["141c3c", "24366e", "2f5a9e", "4c8cc8", "86c0e4", "c8e8f4"],
    "Violet":          ["22143a", "432664", "6c3f96", "9a62c4", "c496e0", "e8ccf2"],
}

DOSSIER = Path(__file__).resolve().parent.parent / "assets" / "palette"


def rvb(code):
    """Convertit 'e0507a' en (224, 80, 122)."""
    return tuple(int(code[i:i + 2], 16) for i in (0, 2, 4))


def main():
    DOSSIER.mkdir(parents=True, exist_ok=True)
    couleurs = [(nom, i, code) for nom, rampe in RAMPES.items() for i, code in enumerate(rampe)]

    # 1. Fichier .gpl (format texte des palettes GIMP, lu par Aseprite)
    lignes = ["GIMP Palette", "Name: Le Quartier", "Columns: 6", "#"]
    for nom, i, code in couleurs:
        r, v, b = rvb(code)
        lignes.append(f"{r:3d} {v:3d} {b:3d}\t{nom} {i + 1}")
    (DOSSIER / "le-quartier.gpl").write_text("\n".join(lignes) + "\n", encoding="utf-8")

    # 2. Image d'un pixel par couleur : 6 colonnes (teintes), 8 lignes (rampes)
    image = Image.new("RGB", (6, len(RAMPES)))
    for ligne, rampe in enumerate(RAMPES.values()):
        for colonne, code in enumerate(rampe):
            image.putpixel((colonne, ligne), rvb(code))
    image.save(DOSSIER / "le-quartier.png")

    # 3. Aperçu agrandi avec le code de chaque couleur
    case, marge = 96, 150
    apercu = Image.new("RGB", (marge + 6 * case, len(RAMPES) * case), rvb("14101a"))
    dessin = ImageDraw.Draw(apercu)
    for ligne, (nom, rampe) in enumerate(RAMPES.items()):
        dessin.text((10, ligne * case + case // 2 - 6), nom, fill=rvb("f4ecd8"))
        for colonne, code in enumerate(rampe):
            x, y = marge + colonne * case, ligne * case
            dessin.rectangle([x, y, x + case - 1, y + case - 1], fill=rvb(code))
            dessin.text((x + 6, y + case - 18), "#" + code, fill=rvb("f4ecd8" if colonne < 3 else "14101a"))
    apercu.save(DOSSIER / "apercu.png")

    print(f"{len(couleurs)} couleurs écrites dans {DOSSIER}")


if __name__ == "__main__":
    main()
