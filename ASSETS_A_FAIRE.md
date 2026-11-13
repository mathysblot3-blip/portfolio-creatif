# Assets à faire

Fichier **généré** par `python outils/assets.py liste` à partir de `assets/assets.json`. Ne pas le modifier à la main.

## 1. Ce que génère Higgsfield

Chaque ligne a un emplacement prêt dans le jeu : tant que le fichier final manque, le site affiche la version provisoire dessinée par le code.

| Priorité | Identifiant | Type | Fichier final | Taille (px) | Proportion à demander | Fond | Rôle | État |
|---|---|---|---|---|---|---|---|---|
| P0 | `style/ancrage` | reference | `assets/_raw/style/ancrage/` | 1920×1080 | 16:9 | opaque | Image d'ancrage : fixe le style de toutes les autres générations | non utilisé par le jeu |
| P1 | `facade/atelier` | image | `assets/ia/facade/atelier.png` | 224×179 | 4:3 | opaque | Mur de façade de l'Atelier de couture (7 × 5,6 unités). Bobine géante et rouleaux de tissu restent en 3D | manquant |
| P1 | `facade/banque` | image | `assets/ia/facade/banque.png` | 288×205 | 3:2 | opaque | Mur de façade de la Banque, derrière les colonnes (9 × 6,4 unités). Colonnes, fronton et pièce d'or restent en 3D | manquant |
| P1 | `facade/colisee` | tuile | `assets/ia/facade/colisee.png` | 112×168 | 2:3 | opaque, sans raccord | Une travée du mur circulaire du Colisée, répétée 7 fois autour de l'arène (3,6 × 5,2 unités) | manquant |
| P1 | `facade/concert` | image | `assets/ia/facade/concert.png` | 224×179 | 4:3 | opaque | Mur de façade de la Salle de concert (7 × 5,6 unités). Note en néon et enceintes restent en 3D | manquant |
| P1 | `facade/ecole` | image | `assets/ia/facade/ecole.png` | 240×218 | 1:1 | opaque | Mur de façade de l'École (7,5 × 6,8 unités). Le clocher, le toit, l'écu et le drapeau restent en 3D | manquant |
| P1 | `facade/entreprise` | image | `assets/ia/facade/entreprise.png` | 224×179 | 4:3 | opaque | Mur de façade de l'Entreprise (7 × 5,6 unités). Auvent, comptoir et caisses restent en 3D | manquant |
| P1 | `materiau/bois` | tuile | `assets/ia/materiau/bois.png` | 32×32 | 1:1 | opaque, sans raccord | Bois : caisses, tonneaux, comptoir | manquant |
| P1 | `materiau/pierre` | tuile | `assets/ia/materiau/pierre.png` | 32×32 | 1:1 | opaque, sans raccord | Pierre grise : soubassements, fontaine, muret, linteaux | manquant |
| P1 | `mur/colombage` | tuile-teinte | `assets/ia/mur/colombage.png` | 64×64 | 1:1 | opaque, gris, sans raccord | Côtés des bâtiments à colombages (teinte donnée par places.json) | manquant |
| P1 | `mur/pierre` | tuile-teinte | `assets/ia/mur/pierre.png` | 64×64 | 1:1 | opaque, gris, sans raccord | Côtés des bâtiments en pierre de taille (teinte donnée par places.json) | manquant |
| P1 | `perso/marche` | planche | `assets/ia/perso/marche.png` | 128×144 (4×3 cases de 32×48) | 1:1 | magenta à détourer | Perso jouable : 4 images de marche × 3 directions (ligne 1 face, ligne 2 dos, ligne 3 profil droit). Le profil gauche est le miroir | manquant |
| P1 | `sol/herbe` | tuile | `assets/ia/sol/herbe.png` | 64×64 | 1:1 | opaque, sans raccord | Herbe autour de la place | manquant |
| P1 | `sol/paves` | tuile | `assets/ia/sol/paves.png` | 64×64 | 1:1 | opaque, sans raccord | Pavés de la place (2 × 2 unités par tuile) | manquant |
| P1 | `tableau/atelier` | image | `assets/ia/tableau/atelier.png` | 232×128 | 16:9 | opaque | Fond du tableau de l'Atelier : toile de lin | manquant |
| P1 | `tableau/banque` | image | `assets/ia/tableau/banque.png` | 232×128 | 16:9 | opaque | Fond du tableau de la Banque : feutrine verte | manquant |
| P1 | `tableau/colisee` | image | `assets/ia/tableau/colisee.png` | 232×128 | 16:9 | opaque | Fond du tableau du Colisée : planches de bois brut | manquant |
| P1 | `tableau/concert` | image | `assets/ia/tableau/concert.png` | 232×128 | 16:9 | opaque | Fond du tableau de la Salle de concert : panneau noir couvert de vieilles affiches | manquant |
| P1 | `tableau/ecole` | image | `assets/ia/tableau/ecole.png` | 232×128 | 16:9 | opaque | Fond du tableau de l'École : ardoise verte (le contenu est ajouté par le code) | manquant |
| P1 | `tableau/entreprise` | image | `assets/ia/tableau/entreprise.png` | 232×128 | 16:9 | opaque | Fond du tableau de l'Entreprise : liège | manquant |
| P1 | `toit/tuiles` | tuile-teinte | `assets/ia/toit/tuiles.png` | 64×64 | 1:1 | opaque, gris, sans raccord | Toits (teinte donnée par places.json) | manquant |
| P1 | `vegetation/buisson` | sprite | `assets/ia/vegetation/buisson.png` | 80×52 | 3:2 | magenta à détourer | Buisson bas du premier plan (2,5 × 1,6 unités) | manquant |
| P1 | `vegetation/cypres` | sprite | `assets/ia/vegetation/cypres.png` | 64×192 | 9:16 | magenta à détourer | Cyprès (2 × 6 unités), posé comme un lutin. Le code l'agrandit selon les arbres | manquant |
| P1 | `vegetation/feuillu` | sprite | `assets/ia/vegetation/feuillu.png` | 128×160 | 3:4 | magenta à détourer | Arbre d'automne (4 × 5 unités) | manquant |
| P2 | `decor/atelier-machine` | sprite | `public/medias/atelier/machine.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : machine à coudre | manquant |
| P2 | `decor/atelier-mannequin` | sprite | `public/medias/atelier/mannequin.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : mannequin de couture | manquant |
| P2 | `decor/banque-coffre` | sprite | `public/medias/banque/coffre.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : coffre-fort | manquant |
| P2 | `decor/banque-pieces` | sprite | `public/medias/banque/pieces.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : pile de pièces d'or | manquant |
| P2 | `decor/colisee-gants` | sprite | `public/medias/colisee/gants.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : gants de boxe | manquant |
| P2 | `decor/colisee-ratelier` | sprite | `public/medias/colisee/ratelier.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : râtelier d'armes de gladiateur | manquant |
| P2 | `decor/concert-enceinte` | sprite | `public/medias/concert/enceinte.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : enceinte | manquant |
| P2 | `decor/concert-guitare` | sprite | `public/medias/concert/guitare.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : guitare | manquant |
| P2 | `decor/ecole-globe` | sprite | `public/medias/ecole/globe.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : globe terrestre | manquant |
| P2 | `decor/ecole-tableau-noir` | sprite | `public/medias/ecole/tableau-noir.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor épinglé : petit tableau noir | manquant |
| P2 | `decor/entreprise-classeurs` | sprite | `public/medias/entreprise/classeurs.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : armoire à classeurs | manquant |
| P2 | `decor/entreprise-plante` | sprite | `public/medias/entreprise/plante.png` | 128×128 | 1:1 | magenta à détourer | Élément de décor : plante verte | manquant |
| P2 | `interieur/atelier` | tuile | `assets/ia/interieur/atelier.png` | 64×64 | 1:1 | opaque, sans raccord | Mur intérieur de l'Atelier | manquant |
| P2 | `interieur/banque` | tuile | `assets/ia/interieur/banque.png` | 64×64 | 1:1 | opaque, sans raccord | Mur intérieur de la Banque | manquant |
| P2 | `interieur/colisee` | tuile | `assets/ia/interieur/colisee.png` | 64×64 | 1:1 | opaque, sans raccord | Mur intérieur du Colisée | manquant |
| P2 | `interieur/concert` | tuile | `assets/ia/interieur/concert.png` | 64×64 | 1:1 | opaque, sans raccord | Mur intérieur de la Salle de concert | manquant |
| P2 | `interieur/ecole` | tuile | `assets/ia/interieur/ecole.png` | 64×64 | 1:1 | opaque, sans raccord | Mur intérieur de l'École, autour du tableau | manquant |
| P2 | `interieur/entreprise` | tuile | `assets/ia/interieur/entreprise.png` | 64×64 | 1:1 | opaque, sans raccord | Mur intérieur de l'Entreprise | manquant |
| P2 | `perso/chat` | planche | `assets/ia/perso/chat.png` | 96×72 (4×3 cases de 24×24) | 4:3 | magenta à détourer | Chat qui suit le perso : 4 images de marche × 3 directions (face, dos, profil droit) | manquant |
| P2 | `titre/fond` | video | `assets/ia/titre/fond.mp4` | 1280×720 | 16:9 | opaque | Fond animé de l'écran titre, en boucle. Le titre et le bouton sont dessinés par le code par-dessus | manquant |

Total : 44 assets, environ **179 générations** en comptant les variantes (reference : 4, tuile : 4, tuile-teinte : 4, image : 4, sprite : 4, planche : 6, video : 3 par asset).

## 2. Ce que fournit Mathys (jamais généré)

| Quoi | Où le déposer | Comment |
|---|---|---|
| Photos et vidéos des preuves | `public/medias/<lieu>/` | Noms attendus dans `contenu/<lieu>.md` (voir `GUIDE_CONTENU.md`) |
| Thème musical (FL Studio) | `assets/audio/theme.mp3` | MP3 ou OGG, en boucle, 1 à 3 Mo. Le bouton de musique apparaît tout seul |
| Textes, dates, liens | `contenu/<lieu>.md` | Remplacer les marques `[CONTENU]` et `[À CONFIRMER]` |

## 3. Ce que fait le code (aucune génération)

| Quoi | Où |
|---|---|
| Titre, textes, boutons, infobulles | `src/ui/` |
| Contenu épinglé sur les tableaux (photos, notes, cartes « À FOURNIR ») | `src/interieur/elementsMur.js` |
| Volumes 3D en relief (clocher, colonnes, auvent, enceintes, écus, fixations, fils) | `src/world/batiment.js`, `src/interieur/tableaux.js` |
| Icône d'onglet | `python outils/favicon.py` → `public/favicon.png` |
| Image d'aperçu des réseaux (capture du jeu + titre) | `outils/capture-apercu.md` → `public/og.png` (à refaire après les assets) |
| Perso et chat provisoires (tant que les planches manquent) | `src/actors/lutin.js`, `src/actors/chat.js` |
