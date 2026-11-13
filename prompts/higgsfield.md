# Prompts Higgsfield

Fichier **généré** par `python outils/assets.py liste` à partir de `assets/assets.json`. Pour changer un prompt, modifier le catalogue puis relancer la commande.
Règles et explications : `prompts/bible-style.md`. Procédure du jour J : `prompts/procedure-jour-j.md`.

## Construction de chaque prompt

| Morceau | Texte |
|---|---|
| Préfixe commun | HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures |
| Vue « reference » | slightly elevated three-quarter view, shallow depth of field, soft bloom |
| Vue « tuile » | orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly |
| Vue « tuile-teinte » | orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly, grayscale only |
| Vue « image » | orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible |
| Vue « sprite » | one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground |
| Vue « animation » | a sprite sheet of animation frames on a strict evenly spaced grid, every frame the same size and framing, smooth looping motion |
| Vue « planche » | on a solid flat pure magenta (#FF00FF) background, strict evenly spaced grid, every frame the same size, no cast shadow on the background, no ground |
| Vue « video » | HD-2D look: highly detailed pixel art sprites and textures in a softly lit 3D miniature diorama, strong tilt-shift depth of field, soft bloom and light glints, floating dust in the sunbeams, slow and smooth motion |
| Interdits | Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures |

Estimation : **256 générations** pour 49 assets.

## Ordre de génération

1. **P0, ancrage de style** : générer `style/ancrage` avec deux ou trois modèles, choisir la meilleure image avec Mathys. Elle devient l'image de référence de toutes les suivantes.
2. **P1** dans l'ordre du tableau : sol, matériaux, façades, végétation, perso, tableaux. Traiter et contrôler chaque asset dès qu'il est choisi.
3. **P2** : murs intérieurs, éléments de décor, chat, vidéo de l'écran titre.

Après chaque asset retenu : `python outils/assets.py traiter <id>`, regarder le résultat dans le site, puis passer au suivant.

## P0

### `style/ancrage`

- Rôle : Image d'ancrage : fixe le style de toutes les autres générations
- Statut : **référence**
- Proportion : **16:9**, variantes : 8, taille finale : 1920×1080 px
- Référence de style : aucune (c’est elle qui sert de référence)

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. slightly elevated three-quarter view, shallow depth of field, soft bloom. a small fantasy town square at golden late afternoon, cobblestone oval plaza with a stone fountain in the center, half-timbered and stone buildings arranged in an arc, cypress trees behind, warm sunlight from the upper left, long soft violet shadows, seen from a slightly elevated three-quarter view. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

## P1

### `sol/paves`

- Rôle : Pavés de la place (2 × 2 unités par tuile)
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of warm grey-beige cobblestones laid in staggered rows, small rounded stones, thin dark joints, viewed straight from above, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `sol/herbe`

- Rôle : Herbe autour de la place
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of short meadow grass with tiny tufts, olive and warm greens, viewed straight from above, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `facade/ecole`

- Rôle : Mur de façade de l'École (7,5 × 6,8 unités). Le clocher, le toit, l'écu et le drapeau restent en 3D
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 8, taille finale : 240×218 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. front wall of a small fantasy school building, pale grey cut stone, two storeys, a central arched wooden double door at the bottom center, two tall windows on the ground floor, three windows upstairs, a round clock face high in the center, blue-grey shutters, carved stone pilasters at both edges. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `facade/entreprise`

- Rôle : Mur de façade de l'Entreprise (7 × 5,6 unités). Auvent, comptoir et caisses restent en 3D
- Statut : **à juger par Mathys**
- Proportion : **4:3**, variantes : 8, taille finale : 224×179 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. front wall of a small fantasy merchant house, half-timbered with cream plaster and dark brown beams, two storeys, a wooden door at the bottom center, a wide ground-floor window on each side, three windows upstairs with ochre shutters. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `facade/banque`

- Rôle : Mur de façade de la Banque, derrière les colonnes (9 × 6,4 unités). Colonnes, fronton et pièce d'or restent en 3D
- Statut : **à juger par Mathys**
- Proportion : **3:2**, variantes : 8, taille finale : 288×205 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. front wall of a small fantasy bank, warm sandstone ashlar blocks, two storeys, a tall heavy bronze-studded double door at the bottom center, two tall windows on the ground floor, four windows upstairs with dark green shutters, a carved stone band between floors. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `facade/concert`

- Rôle : Mur de façade de la Salle de concert (7 × 5,6 unités). Note en néon et enceintes restent en 3D
- Statut : **à juger par Mathys**
- Proportion : **4:3**, variantes : 8, taille finale : 224×179 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. front wall of a small fantasy music hall, half-timbered with ochre plaster and dark beams, two storeys, a wooden door at the bottom center, the right ground-floor area covered with colorful blank torn posters, one window on the left, three windows upstairs with crimson shutters. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `facade/atelier`

- Rôle : Mur de façade de l'Atelier de couture (7 × 5,6 unités). Bobine géante et rouleaux de tissu restent en 3D
- Statut : **à juger par Mathys**
- Proportion : **4:3**, variantes : 8, taille finale : 224×179 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. front wall of a small fantasy tailor shop, half-timbered with very pale peach plaster and dark beams, two storeys, a wooden door at the bottom center, a large shop window on the left showing three dress mannequins, one window on the right, three windows upstairs with purple shutters. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `facade/colisee`

- Rôle : Une travée du mur circulaire du Colisée, répétée 7 fois autour de l'arène (3,6 × 5,2 unités)
- Statut : **à juger par Mathys**
- Proportion : **2:3**, variantes : 8, taille finale : 112×168 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless horizontally tileable section of a roman amphitheatre outer wall, warm sandstone, one bay with two stacked round arches (ground floor and upper floor), dark shadowed openings, a cornice band between floors. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `mur/colombage`

- Rôle : Côtés des bâtiments à colombages (teinte donnée par places.json)
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly, grayscale only. seamless tileable texture of a half-timbered wall, very light neutral grey plaster, darker grey wooden beams forming a frame, desaturated, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `mur/pierre`

- Rôle : Côtés des bâtiments en pierre de taille (teinte donnée par places.json)
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly, grayscale only. seamless tileable texture of large cut stone blocks in staggered courses, very light neutral grey, thin darker joints, desaturated, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `toit/tuiles`

- Rôle : Toits (teinte donnée par places.json)
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly, grayscale only. seamless tileable texture of overlapping clay roof tiles in horizontal rows, very light neutral grey, darker grey shadow lines under each row, desaturated, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `materiau/pierre`

- Rôle : Pierre grise : soubassements, fontaine, muret, linteaux
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 32×32 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of small grey stone bricks in staggered courses, warm grey, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `materiau/bois`

- Rôle : Bois : caisses, tonneaux, comptoir
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 32×32 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of vertical brown wooden planks with dark gaps, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `vegetation/cypres`

- Rôle : Cyprès (2 × 6 unités), posé comme un lutin. Le code l'agrandit selon les arbres
- Statut : **définitif**
- Proportion : **9:16**, variantes : 4, taille finale : 64×192 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a single tall slender cypress tree with a short trunk, dense dark green foliage, lit from the upper left. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `vegetation/feuillu`

- Rôle : Arbre d'automne (4 × 5 unités)
- Statut : **définitif**
- Proportion : **3:4**, variantes : 4, taille finale : 128×160 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a single round deciduous tree with warm orange and golden autumn foliage and a brown trunk, lit from the upper left. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `vegetation/buisson`

- Rôle : Buisson bas du premier plan (2,5 × 1,6 unités)
- Statut : **définitif**
- Proportion : **3:2**, variantes : 4, taille finale : 80×52 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a single low round green bush, lit from the upper left. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `anime/eau`

- Rôle : Surface de l'eau de la fontaine, 4 images en boucle (une image couvre le bassin de 4 × 4 unités)
- Statut : **définitif**
- Proportion : **1:1**, variantes : 6, taille finale : 256×256 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. a sprite sheet of animation frames on a strict evenly spaced grid, every frame the same size and framing, smooth looping motion. 4 animation frames arranged in a 2 by 2 grid (read left to right, top to bottom) of a calm sparkling blue water surface seen from directly above, gentle ripples and small light glints that move slightly between frames, the 4th frame loops back to the 1st. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `anime/jet`

- Rôle : Jet d'eau de la fontaine, 4 images en boucle (2 × 3 unités), posé dans la vasque du haut
- Statut : **définitif**
- Proportion : **2:3**, variantes : 6, taille finale : 128×192 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. a sprite sheet of animation frames on a strict evenly spaced grid, every frame the same size and framing, smooth looping motion. 4 animation frames arranged in a 2 by 2 grid (read left to right, top to bottom) of a small fountain water jet: a thin vertical column of water rising, opening into a crown and falling back down in arcs and droplets on both sides, light blue and white water, each frame slightly different, looping, identical size and position in every frame, on a solid flat pure magenta (#FF00FF) background with no shadow. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `fond/maisons-a`

- Rôle : Groupe de trois maisons d'arrière-plan, aperçu entre les bâtiments (8 × 7 unités, placé plusieurs fois, parfois en miroir)
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 256×224 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a row of three narrow tall fantasy town houses side by side, seen straight from the front, half-timbered and plaster walls in cream, ochre and tan, dark red, brown and blue gable roofs, small windows, no doors in close-up, simple and readable. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `fond/maisons-b`

- Rôle : Second groupe de maisons d'arrière-plan, pour varier
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 256×224 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a row of three fantasy town houses of different heights side by side, seen straight from the front, stone and plaster walls in peach, light grey and ochre, green, purple and crimson gable roofs, a small chimney, small windows, simple and readable. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `fond/tour`

- Rôle : Haute tour de guet aperçue derrière la place (4 × 14 unités)
- Statut : **définitif**
- Proportion : **9:16**, variantes : 4, taille finale : 128×448 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a single tall slender round stone watchtower seen from the front, pale grey stone, a walkway near the top, a pointed dark blue conical roof with a small red pennant on top, a few narrow windows. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `perso/marche`

- Rôle : Perso jouable : 4 images de marche × 3 directions (ligne 1 face, ligne 2 dos, ligne 3 profil droit). Le profil gauche est le miroir
- Statut : **provisoire (redessiné par Mathys)**
- Proportion : **1:1**, variantes : 6, taille finale : 128×144 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. on a solid flat pure magenta (#FF00FF) background, strict evenly spaced grid, every frame the same size, no cast shadow on the background, no ground. sprite sheet of one young man character, short dark brown hair, blue jacket, pink scarf, dark trousers, walking cycle: top row facing the viewer, middle row seen from behind, bottom row walking to the right, 4 frames per row, evenly spaced grid, identical character in every frame. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `tableau/ecole`

- Rôle : Fond du tableau de l'École : ardoise verte (le contenu est ajouté par le code)
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 232×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. a dark green school chalkboard surface seen straight on, faint smudges of erased chalk, a few illegible chalk scribbles, arrows and circles with no letters or numbers. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `tableau/entreprise`

- Rôle : Fond du tableau de l'Entreprise : liège
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 232×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. a cork board surface seen straight on, warm brown speckled cork with a few small old pin holes, empty. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `tableau/banque`

- Rôle : Fond du tableau de la Banque : feutrine verte
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 232×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. a dark green felt surface seen straight on, like a banker's desk, with a thin faint gold inlaid line near the edges, empty. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `tableau/concert`

- Rôle : Fond du tableau de la Salle de concert : panneau noir couvert de vieilles affiches
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 232×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. a black wooden board seen straight on, covered with layers of old torn colorful blank posters with only abstract shapes, no lettering. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `tableau/atelier`

- Rôle : Fond du tableau de l'Atelier : toile de lin
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 232×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. a stretched natural linen fabric surface seen straight on, visible weave, a few dashed sewing pattern lines in red chalk, empty. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `tableau/colisee`

- Rôle : Fond du tableau du Colisée : planches de bois brut
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 232×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic front elevation, perfectly flat and straight-on, no perspective, the subject fills the entire frame edge to edge, no sky, no ground, no roof visible. a wall of rough horizontal wooden planks seen straight on, weathered brown wood with visible grain, empty. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

## P2

### `perso/chat`

- Rôle : Chat qui suit le perso : 4 images de marche × 3 directions (face, dos, profil droit)
- Statut : **définitif**
- Proportion : **4:3**, variantes : 6, taille finale : 96×72 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. on a solid flat pure magenta (#FF00FF) background, strict evenly spaced grid, every frame the same size, no cast shadow on the background, no ground. sprite sheet of one small orange tabby cat, walking cycle: top row facing the viewer, middle row seen from behind, bottom row walking to the right, 4 frames per row, evenly spaced grid, identical cat in every frame. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `interieur/ecole`

- Rôle : Mur intérieur de l'École, autour du tableau
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of a warm ochre painted plaster interior wall, subtle irregularities, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `interieur/entreprise`

- Rôle : Mur intérieur de l'Entreprise
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of a light beige painted plaster office wall, subtle irregularities, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `interieur/banque`

- Rôle : Mur intérieur de la Banque
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of large warm sandstone ashlar blocks of an interior wall, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `interieur/concert`

- Rôle : Mur intérieur de la Salle de concert
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of a dark purple-grey brick wall, staggered bricks, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `interieur/atelier`

- Rôle : Mur intérieur de l'Atelier
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of cream wallpaper with thin vertical pink stripes, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `interieur/colisee`

- Rôle : Mur intérieur du Colisée
- Statut : **définitif**
- Proportion : **1:1**, variantes : 4, taille finale : 64×64 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. orthographic and perfectly flat, seen straight on, no perspective, no vignette, no lighting gradient, the pattern fills the whole frame edge to edge and tiles seamlessly. seamless tileable texture of a warm sandstone wall with two stacked small round arches with dark openings, flat even lighting. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/ecole-tableau-noir`

- Rôle : Élément de décor épinglé : petit tableau noir
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a small framed blackboard on a wooden easel, blank, no writing. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/ecole-globe`

- Rôle : Élément de décor : globe terrestre
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. an antique desk globe on a wooden stand with a brass ring, continents without any labels. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/entreprise-plante`

- Rôle : Élément de décor : plante verte
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a green potted office plant in a terracotta pot. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/entreprise-classeurs`

- Rôle : Élément de décor : armoire à classeurs
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a small wooden shelf holding colorful binders with blank spines. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/banque-coffre`

- Rôle : Élément de décor : coffre-fort
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a heavy dark green iron safe with a brass dial and handle, closed. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/banque-pieces`

- Rôle : Élément de décor : pile de pièces d'or
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a few stacks of shiny gold coins with blank faces. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/concert-guitare`

- Rôle : Élément de décor : guitare
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. an electric guitar with a sunburst body standing upright, no brand marks. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/concert-enceinte`

- Rôle : Élément de décor : enceinte
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a black stage speaker cabinet with two round drivers, no brand marks. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/atelier-mannequin`

- Rôle : Élément de décor : mannequin de couture
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a cream dress form mannequin on a wooden tripod stand with a tape measure draped on it. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/atelier-machine`

- Rôle : Élément de décor : machine à coudre
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a vintage black sewing machine with gold decorations, no brand marks. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/colisee-ratelier`

- Rôle : Élément de décor : râtelier d'armes de gladiateur
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a wooden weapon rack holding a short sword, a spear and a round shield. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `decor/colisee-gants`

- Rôle : Élément de décor : gants de boxe
- Statut : **à juger par Mathys**
- Proportion : **1:1**, variantes : 6, taille finale : 128×128 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. one single isolated object, centered, fully visible with a small margin, side view with a very slight top-down angle, on a solid flat pure magenta (#FF00FF) background, no cast shadow on the background, no ground. a pair of red boxing gloves hanging by their laces, no brand marks. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```

### `titre/fond`

- Rôle : Fond animé de l'écran titre, en boucle. Le titre et le bouton sont dessinés par le code par-dessus
- Statut : **définitif**
- Proportion : **16:9**, variantes : 4, taille finale : 1280×720 px
- Référence de style : image d’ancrage retenue

```
HD-2D art: highly detailed hand-crafted pixel art textures made for a 3D diorama, crisp hard-edged square pixels, rich material detail such as weathered stone, moss in the cracks, worn wood grain and ornate wrought ironwork, cozy fantasy town, warm golden late-afternoon sunlight coming from the upper left, soft cool violet shadows, glinting warm highlights, miniature diorama feel, no outlines on textures. HD-2D look: highly detailed pixel art sprites and textures in a softly lit 3D miniature diorama, strong tilt-shift depth of field, soft bloom and light glints, floating dust in the sunbeams, slow and smooth motion. slow gentle camera drift over a small fantasy town square at golden late afternoon, cobblestone plaza, fountain with sparkling water, half-timbered buildings, floating golden dust, banners moving softly in the wind, calm and cozy, the last frame matches the first frame for a seamless loop. Avoid: any text, letters, numbers, words, signs with writing, logos, brand marks, signatures, watermarks, user interface, borders, frames around the image, people's faces in close-up, photorealism, blur, gradients on textures.
```
