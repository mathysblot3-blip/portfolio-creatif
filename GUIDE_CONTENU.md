# Guide : ajouter ou modifier le contenu du Portfolio Créatif

Ce guide explique comment changer une photo, une vidéo ou un texte sur le mur d'un bâtiment.
**Aucune ligne de code à toucher, aucun outil d'IA nécessaire.**

## Où se trouve quoi

| Lieu | Texte du mur | Dossier des photos et vidéos |
|---|---|---|
| L'École | `contenu/ecole.md` | `public/medias/ecole/` |
| L'Entreprise | `contenu/entreprise.md` | `public/medias/entreprise/` |
| La Banque | `contenu/banque.md` | `public/medias/banque/` |
| La Salle de concert | `contenu/concert.md` | `public/medias/concert/` |
| L'Atelier | `contenu/atelier.md` | `public/medias/atelier/` |
| Le Colisée | `contenu/colisee.md` | `public/medias/colisee/` |

Le site lit ces fichiers tout seul. Un élément dont la photo n'existe pas encore affiche une carte « À FOURNIR » avec le nom du fichier attendu : il suffit de déposer ce fichier pour qu'elle disparaisse.

## Format d'un fichier de contenu

```
# PREUVES

## Titre de l'élément
forme: cadre
fichier: ma-photo.jpg
date: 2025
taille: grand
lien: https://...
Texte de la légende, sur une ou plusieurs lignes.

# DÉCOR

## Guitare
forme: objet
fichier: guitare.png
```

| Ligne | Rôle |
|---|---|
| `# PREUVES` | Les éléments qui suivent prouvent quelque chose (diplômes, photos, réalisations). Ils sont accrochés au mur, et on peut les regarder en grand |
| `# DÉCOR` | Les éléments qui suivent sont purement visuels. Ils sont posés au sol, sur les côtés de la pièce |
| `## Titre` | Commence un nouvel élément. Le titre s'affiche sur sa plaque et dans la visionneuse |
| `forme:` | Aspect sur le mur : `cadre` (photo encadrée), `diplome` (cadre doré), `affiche` (papier punaisé), `note` (texte écrit sur un papier, sans fichier), `ecran` (vidéo), `objet` (décor) |
| `fichier:` | Nom du fichier déposé dans le dossier du lieu. Photo : `.jpg`, `.png` ou `.webp`. Vidéo : `.mp4` ou `.webm` |
| `vignette:` | Pour une vidéo seulement : image affichée sur l'écran du mur |
| `date:` | Facultatif, affiché dans la visionneuse |
| `taille:` | Facultatif : `petit` ou `grand` |
| `lien:` | Facultatif : adresse web complète (commençant par `https://`), affichée en bouton |
| Autres lignes | La légende |

Les éléments sont **rangés automatiquement** sur le mur, dans l'ordre du fichier. Pour changer l'ordre, déplace le bloc `## ...` plus haut ou plus bas.

Les marques `[CONTENU]` et `[À CONFIRMER]` apparaissent surlignées dans la visionneuse : remplace-les par ton texte.

## Méthode 1 : directement sur le site de GitHub (la plus simple)

**Changer ou ajouter une photo**
1. Ouvre https://github.com/mathysblot3-blip/portfolio-creatif et va dans `public/medias/` puis dans le dossier du lieu.
2. Clique sur **Add file**, puis **Upload files**, et glisse ta photo. Donne-lui exactement le nom écrit après `fichier:` dans le fichier de contenu (ou change ce nom dans le fichier de contenu).
3. En bas, clique sur **Commit changes**.

**Changer un texte**
1. Ouvre le fichier `contenu/<lieu>.md`, puis clique sur l'icône crayon (**Edit this file**).
2. Modifie le texte, puis clique sur **Commit changes**.

Le site se met à jour tout seul en une à deux minutes (onglet **Actions** du dépôt pour suivre la publication).

## Méthode 2 : sur ton ordinateur

1. Dépose le fichier dans `public/medias/<lieu>/` et modifie `contenu/<lieu>.md` avec n'importe quel éditeur de texte.
2. Pour vérifier avant de publier, ouvre un terminal dans le dossier du projet et lance `npm run dev`, puis ouvre l'adresse affichée.
3. Pour publier, lance ces trois commandes l'une après l'autre :

```
git add -A
git commit -m "Mise à jour du contenu"
git push
```

`git add -A` prépare tous les fichiers modifiés, `git commit` les enregistre avec un message, `git push` les envoie sur GitHub, qui republie le site.

## Règles à respecter

| Règle | Pourquoi |
|---|---|
| Photos : moins de 1 Mo chacune, largeur d'environ 1600 px | Le site se charge vite |
| Vidéos : MP4, 720p, courtes, quelques dizaines de Mo au maximum | GitHub refuse les fichiers de plus de 100 Mo et limite un site à 1 Go |
| Noms de fichiers sans espaces, sans accents, en minuscules (`ma-photo.jpg`) | Évite les fichiers introuvables une fois en ligne |
| Floute les noms, adresses et données de clients sur les captures d'entreprise | Confidentialité de ton employeur et de ses clients |
| Pas de visage d'enfant reconnaissable (animation, association) sans autorisation écrite des parents | Droit à l'image des mineurs |
| Date et période pour toute performance financière, aucune formulation de conseil | Exactitude et prudence |
