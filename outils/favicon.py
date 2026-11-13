"""Icône d'onglet du Portfolio Créatif : une petite maison à colombages en pixel art, 32 × 32 px.

Lancer :  python outils/favicon.py
Produit public/favicon.png (et une version 180 × 180 pour les écrans d'accueil des téléphones).
Les couleurs viennent de la palette commune (outils/palette.py).
"""
from pathlib import Path

from PIL import Image, ImageDraw

from palette import rvb

RACINE = Path(__file__).resolve().parent.parent

# Dessin ligne par ligne : chaque caractère est un pixel, "." est transparent.
DESSIN = [
    "................................",
    "...............kk...............",
    ".............kkrrkk.............",
    "...........kkrrRRrrkk...........",
    ".........kkrrRRrrRRrrkk.........",
    ".......kkrrRRrrRRrrRRrrkk.......",
    ".....kkrrRRrrRRrrRRrrRRrrkk.....",
    "...kkrrRRrrRRrrRRrrRRrrRRrrkk...",
    "..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..",
    "...kbbbbbbbbbbbbbbbbbbbbbbbbk...",
    "...kbmmmmmmmbmmmmmmbmmmmmmmbk...",
    "...kbmmmmmmmbmmmmmmbmmmmmmmbk...",
    "...kbmkkkkmmbmmmmmmbmmkkkkmbk...",
    "...kbmkcnkmmbmmmmmmbmmkcnkmbk...",
    "...kbmkcckmmbmmmmmmbmmkcckmbk...",
    "...kbmkkkkmmbmmmmmmbmmkkkkmbk...",
    "...kbbbbbbbbbbbbbbbbbbbbbbbbk...",
    "...kbmmmmmmmbmkkkkmbmmmmmmmbk...",
    "...kbmmmmmmmbkddddkbmmmmmmmbk...",
    "...kbmkkkkmmbkddddkbmmkkkkmbk...",
    "...kbmkcckmmbkddddkbmmkcckmbk...",
    "...kbmkcckmmbkddodkbmmkcckmbk...",
    "...kbmkkkkmmbkddddkbmmkkkkmbk...",
    "...kbmmmmmmmbkddddkbmmmmmmmbk...",
    "...kbbbbbbbbbkddddkbbbbbbbbbk...",
    "..kppppppppppkddddkppppppppppk..",
    "..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
]
COULEURS = {
    "k": "2b2433",  # contour
    "r": "b8324f",  # tuiles
    "R": "e0507a",  # tuiles éclairées
    "b": "4a2e20",  # poutres
    "m": "e3c389",  # enduit
    "c": "86c0e4",  # vitre
    "n": "c8e8f4",  # reflet
    "d": "6b4630",  # porte
    "o": "f0c040",  # poignée
    "p": "b9ab9f",  # soubassement
}


def main():
    image = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    for y, ligne in enumerate(DESSIN):
        for x, c in enumerate(ligne):
            if c in COULEURS:
                image.putpixel((x, y + 2), (*rvb(COULEURS[c]), 255))  # +2 : centré verticalement
    sortie = RACINE / "public"
    sortie.mkdir(exist_ok=True)
    image.save(sortie / "favicon.png")
    # Agrandissement sans lissage pour l'icône des téléphones, sur fond sombre (iOS n'aime pas la transparence)
    grande = Image.new("RGBA", (180, 180), (*rvb("14101a"), 255))
    grande.alpha_composite(image.resize((160, 160), Image.Resampling.NEAREST), (10, 10))
    grande.save(sortie / "apple-touch-icon.png")
    print("public/favicon.png et public/apple-touch-icon.png écrits")


if __name__ == "__main__":
    main()
