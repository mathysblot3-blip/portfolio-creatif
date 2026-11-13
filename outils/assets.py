"""Outil des assets générés du Portfolio Créatif.

Source unique : assets/assets.json (le catalogue). Ce script en tire tout le reste.

Commandes (à lancer depuis le dossier du projet, avec  python  et non  py) :

  python outils/assets.py liste
      Écrit ASSETS_A_FAIRE.md et prompts/higgsfield.md à partir du catalogue.

  python outils/assets.py telecharger <id> <adresse>
      Télécharge une génération dans assets/_raw/<id>/ et la note dans prompts/journal.md.

  python outils/assets.py traiter <id> [fichier brut]
      Transforme une image brute en asset prêt pour le jeu (taille exacte, palette, détourage,
      raccord des tuiles), l'enregistre dans assets/ia/<id>.png, puis la contrôle.
      Sans fichier brut : prend assets/_raw/<id>/retenu.* s'il existe, sinon le plus récent.

  python outils/assets.py controle
      Vérifie tous les assets déjà présents (taille, palette, transparence, raccord).

  python outils/assets.py planche
      Fabrique assets/_raw/planche-contact.png : tous les assets présents, agrandis, côte à côte.

  python outils/assets.py etat
      Indique, pour chaque asset du catalogue, s'il est présent ou manquant.

  python outils/assets.py essai [--dans-le-jeu]
      Test complet "à blanc" : fabrique de fausses images brutes, les traite et les contrôle.
      Avec --dans-le-jeu, les résultats sont aussi copiés dans assets/ia/ pour les voir dans le site
      (penser à les retirer ensuite avec  python outils/assets.py essai --retirer).
"""
from __future__ import annotations

import datetime as dt
import json
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

RACINE = Path(__file__).resolve().parent.parent
CATALOGUE = RACINE / "assets" / "assets.json"
DOSSIER_IA = RACINE / "assets" / "ia"
DOSSIER_BRUT = RACINE / "assets" / "_raw"
DOSSIER_PROMPTS = RACINE / "prompts"
EXTENSIONS_IMAGE = (".png", ".webp", ".jpg", ".jpeg")

# Palette commune (voir outils/palette.py, qui en est la source)
sys.path.insert(0, str(Path(__file__).resolve().parent))
from palette import RAMPES, rvb  # noqa: E402

PALETTE = [rvb(code) for rampe in RAMPES.values() for code in rampe]
# Les textures "teintées" sont en niveaux de gris clairs : le jeu les colore ensuite.
GRIS = [(v, v, v) for v in (70, 104, 134, 160, 184, 206, 226, 244)]

# Nombre de variantes à demander par type, pour estimer le total de générations.
VARIANTES = {"reference": 4, "tuile": 4, "tuile-teinte": 4, "image": 4, "sprite": 4, "planche": 6, "video": 3}
# Écart de proportion toléré avant de recadrer au lieu d'étirer (8 %).
TOLERANCE_ETIREMENT = 0.08


# ---------------------------------------------------------------------------------------------
# Catalogue
# ---------------------------------------------------------------------------------------------
def lire_catalogue() -> dict:
    return json.loads(CATALOGUE.read_text(encoding="utf-8"))


def trouver(catalogue: dict, identifiant: str) -> dict:
    for asset in catalogue["assets"]:
        if asset["id"] == identifiant:
            return asset
    raise SystemExit(f"Identifiant inconnu : {identifiant} (voir assets/assets.json)")


def chemin_final(asset: dict) -> Path:
    """Où le jeu attend le fichier traité."""
    if asset.get("sortie"):
        return RACINE / asset["sortie"]
    extension = ".mp4" if asset["type"] == "video" else ".png"
    return DOSSIER_IA / f"{asset['id']}{extension}"


def prompt_complet(catalogue: dict, asset: dict) -> str:
    style = catalogue["style"]
    morceaux = [style["prefixe"], style["vues"][asset["type"]], asset["sujet"], style["interdits"]]
    return ". ".join(m.rstrip(". ") for m in morceaux) + "."


# ---------------------------------------------------------------------------------------------
# Commande "liste" : ASSETS_A_FAIRE.md et prompts/higgsfield.md
# ---------------------------------------------------------------------------------------------
FOND = {"reference": "opaque", "tuile": "opaque, sans raccord", "tuile-teinte": "opaque, gris, sans raccord",
        "image": "opaque", "sprite": "magenta à détourer", "planche": "magenta à détourer", "video": "opaque"}


def commande_liste() -> None:
    catalogue = lire_catalogue()
    assets = catalogue["assets"]
    total = sum(VARIANTES[a["type"]] for a in assets)

    # ----- ASSETS_A_FAIRE.md -----
    lignes = [
        "# Assets à faire",
        "",
        "Fichier **généré** par `python outils/assets.py liste` à partir de `assets/assets.json`. Ne pas le modifier à la main.",
        "",
        "## 1. Ce que génère Higgsfield",
        "",
        "Chaque ligne a un emplacement prêt dans le jeu : tant que le fichier final manque, le site affiche la version provisoire dessinée par le code.",
        "",
        "| Priorité | Identifiant | Type | Fichier final | Taille (px) | Proportion à demander | Fond | Rôle | État |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for a in sorted(assets, key=lambda a: (a["priorite"], a["id"])):
        final = chemin_final(a).relative_to(RACINE).as_posix()
        taille = "×".join(map(str, a["taille"]))
        if a.get("grille"):
            taille += f" ({a['grille'][0]}×{a['grille'][1]} cases de {a['case'][0]}×{a['case'][1]})"
        etat = "présent" if chemin_final(a).exists() else "manquant"
        if a["type"] == "reference":
            final, etat = "assets/_raw/style/ancrage/", "non utilisé par le jeu"
        lignes.append(f"| {a['priorite']} | `{a['id']}` | {a['type']} | `{final}` | {taille} | {a['ratio']} | {FOND[a['type']]} | {a['role']} | {etat} |")

    lignes += [
        "",
        f"Total : {len(assets)} assets, environ **{total} générations** en comptant les variantes "
        f"({', '.join(f'{t} : {n}' for t, n in VARIANTES.items())} par asset).",
        "",
        "## 2. Ce que fournit Mathys (jamais généré)",
        "",
        "| Quoi | Où le déposer | Comment |",
        "|---|---|---|",
        "| Photos et vidéos des preuves | `public/medias/<lieu>/` | Noms attendus dans `contenu/<lieu>.md` (voir `GUIDE_CONTENU.md`) |",
        "| Thème musical (FL Studio) | `assets/audio/theme.mp3` | MP3 ou OGG, en boucle, 1 à 3 Mo. Le bouton de musique apparaît tout seul |",
        "| Textes, dates, liens | `contenu/<lieu>.md` | Remplacer les marques `[CONTENU]` et `[À CONFIRMER]` |",
        "",
        "## 3. Ce que fait le code (aucune génération)",
        "",
        "| Quoi | Où |",
        "|---|---|",
        "| Titre, textes, boutons, infobulles | `src/ui/` |",
        "| Contenu épinglé sur les tableaux (photos, notes, cartes « À FOURNIR ») | `src/interieur/elementsMur.js` |",
        "| Volumes 3D en relief (clocher, colonnes, auvent, enceintes, écus, fixations, fils) | `src/world/batiment.js`, `src/interieur/tableaux.js` |",
        "| Icône d'onglet | `python outils/favicon.py` → `public/favicon.png` |",
        "| Image d'aperçu des réseaux (capture du jeu + titre) | `outils/capture-apercu.md` → `public/og.png` (à refaire après les assets) |",
        "| Perso et chat provisoires (tant que les planches manquent) | `src/actors/lutin.js`, `src/actors/chat.js` |",
        "",
    ]
    (RACINE / "ASSETS_A_FAIRE.md").write_text("\n".join(lignes), encoding="utf-8")

    # ----- prompts/higgsfield.md -----
    style = catalogue["style"]
    p = [
        "# Prompts Higgsfield",
        "",
        "Fichier **généré** par `python outils/assets.py liste` à partir de `assets/assets.json`. Pour changer un prompt, modifier le catalogue puis relancer la commande.",
        "Règles et explications : `prompts/bible-style.md`. Procédure du jour J : `prompts/procedure-jour-j.md`.",
        "",
        "## Construction de chaque prompt",
        "",
        "| Morceau | Texte |",
        "|---|---|",
        f"| Préfixe commun | {style['prefixe']} |",
    ]
    p += [f"| Vue « {t} » | {v} |" for t, v in style["vues"].items()]
    p += [
        f"| Interdits | {style['interdits']} |",
        "",
        f"Estimation : **{total} générations** pour {len(assets)} assets.",
        "",
        "## Ordre de génération",
        "",
        "1. **P0, ancrage de style** : générer `style/ancrage` avec deux ou trois modèles, choisir la meilleure image avec Mathys. Elle devient l'image de référence de toutes les suivantes.",
        "2. **P1** dans l'ordre du tableau : sol, matériaux, façades, végétation, perso, tableaux. Traiter et contrôler chaque asset dès qu'il est choisi.",
        "3. **P2** : murs intérieurs, éléments de décor, chat, vidéo de l'écran titre.",
        "",
        "Après chaque asset retenu : `python outils/assets.py traiter <id>`, regarder le résultat dans le site, puis passer au suivant.",
        "",
    ]
    for priorite in ("P0", "P1", "P2"):
        p += [f"## {priorite}", ""]
        for a in [a for a in assets if a["priorite"] == priorite]:
            p += [
                f"### `{a['id']}`",
                "",
                f"- Rôle : {a['role']}",
                f"- Proportion : **{a['ratio']}**, variantes : {VARIANTES[a['type']]}, taille finale : {'×'.join(map(str, a['taille']))} px",
                f"- Référence de style : {'aucune (c’est elle qui sert de référence)' if a['type'] == 'reference' else 'image d’ancrage retenue'}",
                "",
                "```",
                prompt_complet(catalogue, a),
                "```",
                "",
            ]
    DOSSIER_PROMPTS.mkdir(exist_ok=True)
    (DOSSIER_PROMPTS / "higgsfield.md").write_text("\n".join(p), encoding="utf-8")
    print(f"ASSETS_A_FAIRE.md et prompts/higgsfield.md écrits : {len(assets)} assets, environ {total} générations.")


# ---------------------------------------------------------------------------------------------
# Commande "telecharger" et journal
# ---------------------------------------------------------------------------------------------
def noter_journal(texte: str) -> None:
    journal = DOSSIER_PROMPTS / "journal.md"
    if not journal.exists():
        journal.write_text("# Journal des générations\n\nUne ligne par génération téléchargée ou traitée.\n\n"
                           "| Date | Asset | Action | Détail |\n|---|---|---|---|\n", encoding="utf-8")
    with journal.open("a", encoding="utf-8") as f:
        f.write(texte + "\n")


def commande_telecharger(identifiant: str, adresse: str) -> None:
    trouver(lire_catalogue(), identifiant)
    dossier = DOSSIER_BRUT / identifiant
    dossier.mkdir(parents=True, exist_ok=True)
    horodatage = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    requete = urllib.request.Request(adresse, headers={"User-Agent": "portfolio-creatif-outil"})
    with urllib.request.urlopen(requete, timeout=120) as reponse:
        donnees = reponse.read()
        type_mime = reponse.headers.get("Content-Type", "")
    extension = ".mp4" if "video" in type_mime else ".webp" if "webp" in type_mime else ".jpg" if "jpeg" in type_mime else ".png"
    fichier = dossier / f"{horodatage}{extension}"
    fichier.write_bytes(donnees)
    noter_journal(f"| {horodatage} | `{identifiant}` | téléchargé | `{fichier.relative_to(RACINE).as_posix()}` depuis {adresse} |")
    print(f"Enregistré : {fichier.relative_to(RACINE)} ({len(donnees) // 1024} Ko)")


# ---------------------------------------------------------------------------------------------
# Traitement des images
# ---------------------------------------------------------------------------------------------
def image_palette(couleurs: list[tuple[int, int, int]]) -> Image.Image:
    """Image en mode palette pour Pillow. On complète jusqu'à 256 couleurs en répétant la dernière
    (compléter avec du noir ajouterait une couleur parasite)."""
    plate = [c for couleur in couleurs for c in couleur]
    plate += list(couleurs[-1]) * (256 - len(couleurs))
    pal = Image.new("P", (1, 1))
    pal.putpalette(plate)
    return pal


def quantifier(image: Image.Image, couleurs) -> Image.Image:
    """Ramène chaque pixel à la couleur la plus proche de la palette, sans tramage (pixel art propre)."""
    alpha = image.getchannel("A") if image.mode == "RGBA" else None
    rvb_seul = image.convert("RGB").quantize(palette=image_palette(couleurs), dither=Image.Dither.NONE).convert("RGB")
    if alpha is None:
        return rvb_seul
    rvb_seul.putalpha(alpha)
    return rvb_seul


def recadrer_proportion(image: Image.Image, largeur: int, hauteur: int) -> Image.Image:
    """Recadre au centre pour obtenir la proportion largeur/hauteur."""
    l, h = image.size
    cible = largeur / hauteur
    if l / h > cible:
        nl = round(h * cible)
        return image.crop(((l - nl) // 2, 0, (l - nl) // 2 + nl, h))
    nh = round(l / cible)
    return image.crop((0, (h - nh) // 2, l, (h - nh) // 2 + nh))


def ajuster(image: Image.Image, largeur: int, hauteur: int) -> Image.Image:
    """Étire légèrement si la proportion est proche, sinon recadre d'abord au centre."""
    l, h = image.size
    if abs((l / h) / (largeur / hauteur) - 1) > TOLERANCE_ETIREMENT:
        image = recadrer_proportion(image, largeur, hauteur)
    return image


def reduire(image: Image.Image, largeur: int, hauteur: int) -> Image.Image:
    """Réduction par moyenne des pixels (filtre BOX) : chaque gros "faux pixel" du modèle devient un vrai pixel.
    Les images transparentes sont réduites en alpha prémultiplié pour éviter les bords sombres."""
    if image.mode == "RGBA":
        return image.convert("RGBa").resize((largeur, hauteur), Image.Resampling.BOX).convert("RGBA")
    return image.resize((largeur, hauteur), Image.Resampling.BOX)


def rendre_raccordable(image: Image.Image, bande: float = 0.25) -> Image.Image:
    """Supprime le raccord visible d'une tuile.
    On mélange l'image avec sa copie décalée d'une demi-tuile : la copie n'a aucun raccord sur les bords,
    l'original n'en a aucun au centre. Près des bords on prend la copie, au centre l'original."""
    a = np.asarray(image.convert("RGB"), dtype=np.float32)
    h, l = a.shape[:2]
    decale = np.roll(a, (h // 2, l // 2), axis=(0, 1))

    def rampe(n: int) -> np.ndarray:
        d = np.minimum(np.arange(n), np.arange(n)[::-1]) / (n * bande)
        return np.clip(d, 0, 1)

    poids = np.outer(rampe(h), rampe(l))[..., None]  # 1 au centre, 0 sur les bords
    return Image.fromarray((a * poids + decale * (1 - poids)).round().astype(np.uint8))


def detourer(image: Image.Image) -> Image.Image:
    """Rend transparent le fond magenta (#FF00FF), y compris les bords adoucis qui virent au violet.
    Si l'image a déjà une vraie transparence (outil de suppression de fond), on la garde."""
    image = image.convert("RGBA")
    a = np.asarray(image).astype(np.int16)
    if (a[..., 3] < 250).mean() > 0.05:
        return image  # déjà détourée
    r, v, b = a[..., 0], a[..., 1], a[..., 2]
    magenta = np.minimum(r, b) - v              # 255 pour un magenta pur, proche de 0 pour une couleur normale
    alpha = np.where(magenta > 90, 0, 255).astype(np.uint8)
    # Pixels de bord encore teintés de magenta : on retire la teinte (on rabaisse rouge et bleu vers le vert).
    teinte = (magenta > 30) & (alpha > 0)
    sortie = a.copy()
    sortie[..., 0] = np.where(teinte, np.minimum(r, v + 40), r)
    sortie[..., 2] = np.where(teinte, np.minimum(b, v + 40), b)
    sortie[..., 3] = alpha
    return Image.fromarray(sortie.clip(0, 255).astype(np.uint8), "RGBA")


def alpha_net(image: Image.Image) -> Image.Image:
    """Transparence tout ou rien (le jeu utilise alphaTest = 0,5)."""
    alpha = image.getchannel("A").point(lambda x: 255 if x >= 128 else 0)
    image.putalpha(alpha)
    return image


def poser_en_bas(objet: Image.Image, largeur: int, hauteur: int) -> Image.Image:
    """Réduit un objet détouré pour qu'il tienne dans la case, en gardant ses proportions,
    et le pose centré en bas (le jeu place l'origine des lutins à leurs pieds)."""
    boite = objet.getchannel("A").getbbox()
    if not boite:
        raise SystemExit("Image vide après détourage : le fond n'était peut-être pas magenta.")
    objet = objet.crop(boite)
    echelle = min(largeur / objet.width, hauteur / objet.height)
    nl, nh = max(1, round(objet.width * echelle)), max(1, round(objet.height * echelle))
    objet = reduire(objet, nl, nh)
    case = Image.new("RGBA", (largeur, hauteur), (0, 0, 0, 0))
    case.alpha_composite(objet, ((largeur - nl) // 2, hauteur - nh))
    return case


def traiter_image(asset: dict, brut: Image.Image) -> Image.Image:
    """Applique la chaîne de traitement adaptée au type de l'asset."""
    largeur, hauteur = asset["taille"]
    t = asset["type"]
    if t in ("tuile", "tuile-teinte"):
        image = rendre_raccordable(recadrer_proportion(brut.convert("RGB"), largeur, hauteur))
        image = reduire(image, largeur, hauteur)
        image = rendre_raccordable(image, bande=0.15)  # second passage à la taille finale, pour les derniers pixels
        if t == "tuile-teinte":
            return quantifier(image.convert("L").convert("RGB"), GRIS)
        return quantifier(image, PALETTE)
    if t == "image":
        return quantifier(reduire(ajuster(brut.convert("RGB"), largeur, hauteur), largeur, hauteur), PALETTE)
    if t == "sprite":
        return alpha_net(quantifier(poser_en_bas(detourer(brut), largeur, hauteur), PALETTE))
    if t == "planche":
        return traiter_planche(asset, detourer(brut))
    raise SystemExit(f"Type « {t} » : pas de traitement d'image (référence ou vidéo).")


def traiter_planche(asset: dict, image: Image.Image) -> Image.Image:
    """Découpe la planche en cases égales, détoure chaque personnage et les réaligne tous à la même échelle."""
    colonnes, lignes = asset["grille"]
    cl, ch = asset["case"]
    image = recadrer_proportion(image, colonnes * 2, lignes * 3) if asset["id"] == "perso/marche" else image
    pl, ph = image.width / colonnes, image.height / lignes
    cases, boites = [], []
    for y in range(lignes):
        for x in range(colonnes):
            case = image.crop((round(x * pl), round(y * ph), round((x + 1) * pl), round((y + 1) * ph)))
            boite = case.getchannel("A").getbbox()
            if not boite:
                raise SystemExit(f"Case {x + 1},{y + 1} vide : la grille de la planche ne correspond pas.")
            cases.append(case.crop(boite))
            boites.append(boite)
    # Même échelle pour toutes les cases : le perso ne doit pas changer de taille d'une image à l'autre.
    echelle = min(min(cl / c.width, ch / c.height) for c in cases)
    planche = Image.new("RGBA", (colonnes * cl, lignes * ch), (0, 0, 0, 0))
    for i, c in enumerate(cases):
        nl, nh = max(1, round(c.width * echelle)), max(1, round(c.height * echelle))
        petit = reduire(c, nl, nh)
        x, y = i % colonnes, i // colonnes
        planche.alpha_composite(petit, (x * cl + (cl - nl) // 2, y * ch + ch - nh))
    return alpha_net(quantifier(planche, PALETTE))


def traiter_video(asset: dict, brut: Path, sortie: Path) -> None:
    """Compresse la vidéo pour le web : 1280 × 720, H.264, sans son, démarrage rapide. Nécessite ffmpeg."""
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg n'est pas installé : impossible de traiter la vidéo (voir prompts/procedure-jour-j.md).")
    largeur, hauteur = asset["taille"]
    commande = ["ffmpeg", "-y", "-i", str(brut), "-an", "-vf",
                f"scale={largeur}:{hauteur}:force_original_aspect_ratio=increase,crop={largeur}:{hauteur},fps=30",
                "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(sortie)]
    subprocess.run(commande, check=True)


# ---------------------------------------------------------------------------------------------
# Contrôles automatiques
# ---------------------------------------------------------------------------------------------
def controler(asset: dict, image: Image.Image) -> list[str]:
    """Renvoie la liste des problèmes trouvés (vide si tout va bien)."""
    problemes = []
    if list(image.size) != list(asset["taille"]):
        problemes.append(f"taille {image.size} au lieu de {tuple(asset['taille'])}")
    attendu = set(GRIS if asset["type"] == "tuile-teinte" else PALETTE)
    pixels = np.asarray(image.convert("RGBA")).reshape(-1, 4)
    hors = {tuple(int(c) for c in p[:3]) for p in np.unique(pixels[pixels[:, 3] > 0], axis=0)} - attendu
    if hors:
        problemes.append(f"{len(hors)} couleurs hors palette")
    if asset["type"] in ("sprite", "planche"):
        alphas = set(np.unique(pixels[:, 3]).tolist())
        if not alphas <= {0, 255}:
            problemes.append("transparence partielle (doit être tout ou rien)")
        if 0 not in alphas:
            problemes.append("aucun pixel transparent : détourage raté")
    if asset["type"] in ("tuile", "tuile-teinte"):
        score = score_raccord(image)
        if score > 1.6:
            problemes.append(f"raccord visible (écart {score:.2f} fois plus fort sur les bords qu'à l'intérieur)")
    return problemes


def score_raccord(image: Image.Image) -> float:
    """Compare l'écart entre la dernière et la première colonne (ou ligne) à l'écart moyen entre deux colonnes voisines."""
    a = np.asarray(image.convert("RGB"), dtype=np.float32)
    interieur = (np.abs(np.diff(a, axis=1)).mean() + np.abs(np.diff(a, axis=0)).mean()) / 2
    bords = (np.abs(a[:, 0] - a[:, -1]).mean() + np.abs(a[0] - a[-1]).mean()) / 2
    return float(bords / max(interieur, 1e-6))


# ---------------------------------------------------------------------------------------------
# Commandes "traiter", "controle", "planche", "etat"
# ---------------------------------------------------------------------------------------------
def brut_par_defaut(identifiant: str) -> Path:
    dossier = DOSSIER_BRUT / identifiant
    fichiers = [f for f in dossier.glob("*") if f.is_file()] if dossier.exists() else []
    retenus = [f for f in fichiers if f.stem == "retenu"]
    if retenus:
        return retenus[0]
    if not fichiers:
        raise SystemExit(f"Aucun fichier brut dans {dossier.relative_to(RACINE)}")
    return max(fichiers, key=lambda f: f.stat().st_mtime)


def commande_traiter(identifiant: str, brut: str | None = None, sortie: Path | None = None, journal: bool = True) -> list[str]:
    catalogue = lire_catalogue()
    asset = trouver(catalogue, identifiant)
    source = Path(brut) if brut else brut_par_defaut(identifiant)
    sortie = sortie or chemin_final(asset)
    sortie.parent.mkdir(parents=True, exist_ok=True)
    if asset["type"] == "video":
        traiter_video(asset, source, sortie)
        problemes = []
    else:
        resultat = traiter_image(asset, Image.open(source))
        resultat.save(sortie, optimize=True)
        problemes = controler(asset, resultat)
    etat = "OK" if not problemes else "À REVOIR : " + " ; ".join(problemes)
    print(f"{identifiant} -> {sortie.relative_to(RACINE).as_posix()} : {etat}")
    if journal:
        noter_journal(f"| {dt.datetime.now():%Y%m%d-%H%M%S} | `{identifiant}` | traité | `{source.name}` → {etat} |")
    return problemes


def commande_controle() -> None:
    catalogue = lire_catalogue()
    nombre = 0
    for asset in catalogue["assets"]:
        fichier = chemin_final(asset)
        if asset["type"] in ("reference", "video") or not fichier.exists():
            continue
        nombre += 1
        problemes = controler(asset, Image.open(fichier))
        print(f"{asset['id']} : {'OK' if not problemes else ' ; '.join(problemes)}")
    print(f"{nombre} assets contrôlés.")


def planche_contact(fichiers: list[tuple[str, Path]], sortie: Path, zoom: int = 3) -> None:
    """Assemble les images côte à côte, agrandies sans lissage, sur un fond en damier (pour voir la transparence)."""
    vignettes = []
    for nom, f in fichiers:
        im = Image.open(f).convert("RGBA")
        im = im.resize((im.width * zoom, im.height * zoom), Image.Resampling.NEAREST)
        fond = Image.new("RGBA", im.size, (60, 52, 70, 255))
        damier = ImageDraw.Draw(fond)
        for y in range(0, im.height, 12):
            for x in range((y // 12) % 2 * 12, im.width, 24):
                damier.rectangle([x, y, x + 11, y + 11], fill=(80, 72, 90, 255))
        fond.alpha_composite(im)
        vignettes.append((nom, fond))
    largeur_max = 1600
    x = y = hauteur_ligne = 0
    positions = []
    for nom, v in vignettes:
        if x + v.width > largeur_max and x > 0:
            x, y, hauteur_ligne = 0, y + hauteur_ligne + 24, 0
        positions.append((nom, v, x, y))
        x += v.width + 16
        hauteur_ligne = max(hauteur_ligne, v.height)
    feuille = Image.new("RGBA", (largeur_max, y + hauteur_ligne + 24), (20, 16, 26, 255))
    dessin = ImageDraw.Draw(feuille)
    for nom, v, x, y in positions:
        feuille.alpha_composite(v, (x, y + 14))
        dessin.text((x, y), nom, fill=(244, 236, 216, 255))
    sortie.parent.mkdir(parents=True, exist_ok=True)
    feuille.save(sortie)
    print(f"Planche-contact : {sortie.relative_to(RACINE)}")


def commande_planche() -> None:
    catalogue = lire_catalogue()
    fichiers = [(a["id"], chemin_final(a)) for a in catalogue["assets"]
                if a["type"] not in ("reference", "video") and chemin_final(a).exists()]
    if not fichiers:
        raise SystemExit("Aucun asset présent pour l'instant.")
    planche_contact(fichiers, DOSSIER_BRUT / "planche-contact.png")


def commande_etat() -> None:
    catalogue = lire_catalogue()
    for a in catalogue["assets"]:
        if a["type"] == "reference":
            continue
        print(f"{'présent ' if chemin_final(a).exists() else 'manquant'}  {a['priorite']}  {a['id']}")


# ---------------------------------------------------------------------------------------------
# Commande "essai" : test à blanc avec de fausses images brutes
# ---------------------------------------------------------------------------------------------
ESSAIS = ["sol/paves", "mur/colombage", "facade/ecole", "vegetation/cypres", "perso/marche", "tableau/banque"]


def faux_pixel_art(largeur: int, hauteur: int, gros_pixel: int, couleurs, graine: int) -> np.ndarray:
    """Imite la sortie d'un modèle : de gros "faux pixels" un peu bruités et adoucis."""
    rng = np.random.default_rng(graine)
    gl, gh = largeur // gros_pixel + 1, hauteur // gros_pixel + 1
    choix = rng.integers(0, len(couleurs), (gh, gl))
    petite = np.array(couleurs, dtype=np.float32)[choix]
    grande = petite.repeat(gros_pixel, 0).repeat(gros_pixel, 1)[:hauteur, :largeur]
    return np.clip(grande + rng.normal(0, 6, grande.shape), 0, 255)


def fabriquer_brut(identifiant: str) -> Image.Image:
    rng = np.random.default_rng(7)
    if identifiant in ("sol/paves", "mur/colombage"):
        # Tuile avec un raccord volontairement mauvais (dégradé de gauche à droite)
        a = faux_pixel_art(1024, 1024, 16, [(150, 140, 125), (120, 110, 100), (170, 160, 140)], 1)
        a += np.linspace(-40, 40, 1024)[None, :, None]
        return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if identifiant in ("facade/ecole", "tableau/banque"):
        l, h = (1024, 1024) if identifiant == "facade/ecole" else (1344, 768)
        a = faux_pixel_art(l, h, 12, [(185, 171, 159), (125, 112, 128), (76, 140, 200)], 2)
        im = Image.fromarray(a.astype(np.uint8))
        ImageDraw.Draw(im).rectangle([l // 2 - 80, h - 260, l // 2 + 80, h], fill=(107, 70, 48))  # une "porte"
        return im
    if identifiant == "vegetation/cypres":
        im = Image.new("RGB", (768, 1365), (255, 0, 255))
        d = ImageDraw.Draw(im)
        d.rectangle([364, 1150, 404, 1300], fill=(74, 46, 32))
        d.polygon([(384, 120), (520, 1180), (248, 1180)], fill=(63, 107, 58))
        # Bord adouci comme le ferait un modèle : le vert déborde sur le magenta
        return im.resize((384, 682), Image.Resampling.BILINEAR).resize((768, 1365), Image.Resampling.BILINEAR)
    if identifiant == "perso/marche":
        im = Image.new("RGB", (1024, 1152), (255, 0, 255))
        d = ImageDraw.Draw(im)
        for y in range(3):
            for x in range(4):
                cx, base = x * 256 + 128 + int(rng.integers(-20, 20)), y * 384 + 340
                d.rectangle([cx - 40, base - 200, cx + 40, base - 60], fill=(47, 90, 158))   # veste
                d.ellipse([cx - 45, base - 300, cx + 45, base - 200], fill=(241, 201, 160))  # tête
                d.rectangle([cx - 35, base - 60, cx + 35, base], fill=(43, 36, 51))          # jambes
        return im
    raise SystemExit(identifiant)


def commande_essai(dans_le_jeu: bool = False, retirer: bool = False) -> None:
    catalogue = lire_catalogue()
    if retirer:
        for identifiant in ESSAIS:
            f = chemin_final(trouver(catalogue, identifiant))
            if f.exists():
                f.unlink()
                print(f"retiré : {f.relative_to(RACINE).as_posix()}")
        return
    dossier = DOSSIER_BRUT / "_essai"
    if dossier.exists():
        shutil.rmtree(dossier)
    resultats, echecs = [], 0
    for identifiant in ESSAIS:
        brut = dossier / "brut" / f"{identifiant.replace('/', '-')}.png"
        brut.parent.mkdir(parents=True, exist_ok=True)
        fabriquer_brut(identifiant).save(brut)
        sortie = dossier / "ia" / f"{identifiant}.png"
        problemes = commande_traiter(identifiant, str(brut), sortie, journal=False)
        echecs += bool(problemes)
        resultats.append((identifiant, sortie))
        if dans_le_jeu:
            final = chemin_final(trouver(catalogue, identifiant))
            final.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(sortie, final)
    planche_contact(resultats, dossier / "planche-contact.png", zoom=4)
    print(f"Essai terminé : {len(ESSAIS) - echecs}/{len(ESSAIS)} assets sans problème.")


# ---------------------------------------------------------------------------------------------
def main(arguments: list[str]) -> None:
    if not arguments:
        print(__doc__)
        return
    commande, reste = arguments[0], arguments[1:]
    if commande == "liste":
        commande_liste()
    elif commande == "telecharger" and len(reste) == 2:
        commande_telecharger(*reste)
    elif commande == "traiter" and reste:
        commande_traiter(reste[0], reste[1] if len(reste) > 1 else None)
    elif commande == "controle":
        commande_controle()
    elif commande == "planche":
        commande_planche()
    elif commande == "etat":
        commande_etat()
    elif commande == "essai":
        commande_essai("--dans-le-jeu" in reste, "--retirer" in reste)
    else:
        print(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
