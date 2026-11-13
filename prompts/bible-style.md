# Bible de style des assets générés

Ce document fixe les règles communes à toutes les générations Higgsfield. Les textes exacts envoyés au modèle sont dans `assets/assets.json` (clé `style`), et les prompts complets dans `prompts/higgsfield.md`.

## 1. Règle d'or

| Règle | Pourquoi |
|---|---|
| Aucun texte, chiffre, lettre, logo ni visage en gros plan dans une image générée | Tout contenu reste une couche du code, modifiable par Claude Opus seul après la fin de l'accès à Higgsfield |
| Chaque asset a un équivalent provisoire dans le code | Si une génération échoue ou manque, le site reste complet |
| Les originaux vont dans `assets/_raw/<id>/` (non publié), les versions traitées dans `assets/ia/` | On peut retraiter un original sans le régénérer |

## 2. Rendu visé

| Point | Choix |
|---|---|
| Esthétique | Pixel art 16 bits façon jeux de rôle HD-2D récents, ville de fantaisie chaleureuse |
| Lumière | Fin d'après-midi dorée, soleil **en haut à gauche** (comme dans le jeu : azimut -40°, hauteur 30°) |
| Ombres | Froides, vers le violet. Lumières chaudes, vers le jaune (principe de la palette) |
| Palette | Les 48 couleurs de `assets/palette/portfolio-creatif.gpl`. Le script y ramène chaque pixel, sans tramage |
| Densité | 32 px par unité de jeu (1 unité = 1 m). Perso de 32 × 48 px |
| Contours | Pas de contour noir sur les textures. Les sprites peuvent en avoir un, sombre et fin |

## 3. Vue et fond selon le type

| Type | Vue | Fond | Ce que fait le script ensuite |
|---|---|---|---|
| `tuile` | De face (murs) ou de dessus (sol), parfaitement à plat, sans perspective | Le motif remplit tout le cadre | Recadrage, suppression du raccord, réduction, palette |
| `tuile-teinte` | Idem, en niveaux de gris clairs | Idem | Idem, puis 8 niveaux de gris : le jeu colore la texture avec les couleurs de `places.json` |
| `image` | Élévation de face, à plat, le sujet touche les quatre bords, ni ciel ni sol ni toit | Opaque | Étirement léger ou recadrage, réduction, palette |
| `sprite` | Objet seul, centré, vue de côté très légèrement plongeante | **Magenta pur `#FF00FF`** | Détourage, recadrage serré, réduction, pose centrée en bas, palette, transparence tout ou rien |
| `planche` | Grille régulière, même personnage dans chaque case | Magenta pur | Découpe des cases, même échelle pour toutes, réalignement par les pieds |
| `video` | Diorama HD-2D, mouvement lent, dernière image raccord avec la première | Opaque | Compression 1280 × 720 sans son (ffmpeg) |

Pourquoi le magenta : aucune couleur de la palette n'en est proche, le détourage est donc fiable. Si Higgsfield propose son outil de suppression de fond, le script garde la transparence fournie.

## 4. Construction d'un prompt

Ordre fixe, identique pour tous les assets :

1. **Préfixe commun** (style, lumière, palette).
2. **Clause de vue** selon le type (tableau ci-dessus).
3. **Sujet** propre à l'asset.
4. **Interdits** (texte, logos, filigranes, cadres, photoréalisme, flou, dégradés).

Le préfixe est en anglais : les modèles d'image suivent mieux les consignes en anglais.

## 5. Image d'ancrage

| Étape | Détail |
|---|---|
| 1 | Générer `style/ancrage` (place de ville vue de trois quarts) avec deux ou trois modèles différents |
| 2 | Mathys choisit l'image qui ressemble le plus au jeu |
| 3 | Elle est envoyée dans Higgsfield comme **image de référence** de toutes les générations suivantes |
| 4 | Le modèle retenu pour l'ancrage est utilisé pour tout le reste, sauf échec répété sur un type précis |

C'est le seul moyen fiable d'obtenir une série homogène : sans référence, chaque image aurait son propre style.

## 6. Critères pour retenir une variante

| Critère | Refus si |
|---|---|
| Texte | La moindre lettre ou chiffre lisible |
| Vue | Perspective visible sur une tuile ou une façade |
| Cadrage | Façade qui ne touche pas les bords, sprite coupé |
| Lumière | Soleil à droite, lumière de nuit |
| Cohérence | Style trop éloigné de l'image d'ancrage |
| Lisibilité réduite | Méconnaissable une fois réduit (la planche-contact le montre) |

Une variante parfaite à 90 % vaut mieux que trois régénérations : les petits défauts se corrigent dans Aseprite.
