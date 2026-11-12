// =====================================================================
// LUTINS (sprites)
// Un lutin est une image pixel art plaquée sur un rectangle vertical placé dans le décor 3D.
// Contrairement à un sprite classique, il est éclairé par le soleil et projette une vraie ombre
// qui suit sa silhouette. C'est la base du rendu HD-2D.
// =====================================================================
import * as THREE from 'three';
import { TEXELS_PAR_UNITE } from '../engine/reglages.js';
import { texturePixel } from '../engine/textures.js';

export function creerLutin(texture, largeurPx = 32, hauteurPx = 48) {
  const largeur = largeurPx / TEXELS_PAR_UNITE, hauteur = hauteurPx / TEXELS_PAR_UNITE;
  const forme = new THREE.PlaneGeometry(largeur, hauteur);
  forme.translate(0, hauteur / 2, 0); // l'origine est aux pieds : plus simple pour poser le perso au sol

  const lutin = new THREE.Mesh(forme, new THREE.MeshStandardMaterial({
    map: texture,
    alphaTest: 0.5, // les pixels transparents de l'image ne sont pas dessinés
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
  }));
  lutin.castShadow = true;
  lutin.receiveShadow = true;
  // Sans ce matériau, l'ombre serait celle du rectangle entier et non celle de la silhouette.
  lutin.customDepthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: texture,
    alphaTest: 0.5,
  });

  // Change l'image affichée (animation). miroir = true retourne l'image de gauche à droite.
  lutin.userData.afficher = (image, miroir = false) => {
    lutin.material.map = image;
    lutin.customDepthMaterial.map = image;
    lutin.scale.x = miroir ? -1 : 1;
  };
  return lutin;
}

// ---------------------------------------------------------------------
// Personnage provisoire de 32 × 48 px, dessiné par du code. À remplacer par ta planche de sprites.
// Trois directions (face, dos, profil droit), 4 images de marche chacune. Le profil gauche est le miroir du droit.
// ---------------------------------------------------------------------
const C = {
  peau: '#f1c9a0', peauOmbre: '#e0a37a', cheveux: '#4a2e20', veste: '#2f5a9e', vesteOmbre: '#24366e',
  echarpe: '#e0507a', pantalon: '#2b2433', pantalonOmbre: '#14101a', chaussure: '#2a1a14', contour: '#14101a',
};

// pas : 0 = debout, 1 = un pied levé, 2 = l'autre pied levé
function dessinerPerso(g, direction, pas) {
  const r = (couleur, x, y, l, h) => { g.fillStyle = C[couleur]; g.fillRect(x, y, l, h); };
  const saut = pas ? 1 : 0;                 // le corps monte d'un pixel pendant un pas
  const y0 = 1 - saut;                      // décalage vertical de tout le haut du corps
  const leveG = pas === 1 ? 2 : 0, leveD = pas === 2 ? 2 : 0;

  if (direction === 'profil') {
    // jambes : écartées pendant un pas, serrées à l'arrêt
    const ecart = pas === 1 ? 3 : pas === 2 ? -3 : 0;
    r('pantalonOmbre', 14 - ecart, 34, 4, 9 - (pas === 2 ? 2 : 0)); r('chaussure', 14 - ecart, 43 - (pas === 2 ? 2 : 0), 5, 3);
    r('pantalon', 14 + ecart, 34, 4, 9 - (pas === 1 ? 2 : 0)); r('chaussure', 14 + ecart, 43 - (pas === 1 ? 2 : 0), 5, 3);
    r('veste', 12, 19 + y0, 8, 15); r('vesteOmbre', 12, 19 + y0, 2, 15);
    r('vesteOmbre', 15, 21 + y0, 3, 10); r('peau', 15, 31 + y0, 3, 2);   // bras le long du corps
    r('echarpe', 12, 18 + y0, 8, 3); r('echarpe', 9, 20 + y0, 3, 5);      // écharpe qui flotte derrière
    r('peau', 11, 6 + y0, 11, 12); r('peau', 22, 12 + y0, 1, 2);          // tête et nez
    r('cheveux', 10, 3 + y0, 12, 5); r('cheveux', 10, 8 + y0, 5, 7);
    r('contour', 19, 11 + y0, 2, 3);                                       // œil
  } else {
    r('pantalon', 12, 34, 4, 9 - leveG); r('chaussure', 11, 43 - leveG, 5, 3);
    r('pantalon', 16, 34, 4, 9 - leveD); r('chaussure', 16, 43 - leveD, 5, 3);
    r('pantalonOmbre', 15, 36, 2, 5);
    r('veste', 11, 19 + y0, 10, 15); r('vesteOmbre', 18, 19 + y0, 3, 15);
    // bras : ils se balancent à l'opposé des jambes
    r('veste', 9, 20 + y0, 2, 10 - leveD); r('peau', 9, 30 + y0 - leveD, 2, 2);
    r('vesteOmbre', 21, 20 + y0, 2, 10 - leveG); r('peauOmbre', 21, 30 + y0 - leveG, 2, 2);
    r('echarpe', 11, 18 + y0, 10, 3);
    if (direction === 'face') {
      r('echarpe', 18, 21 + y0, 3, 5);
      r('peau', 10, 6 + y0, 12, 12); r('peauOmbre', 19, 8 + y0, 3, 10);
      r('cheveux', 9, 3 + y0, 14, 5); r('cheveux', 9, 8 + y0, 2, 5); r('cheveux', 21, 8 + y0, 2, 4);
      r('contour', 13, 11 + y0, 2, 3); r('contour', 18, 11 + y0, 2, 3);
    } else {
      r('echarpe', 15, 21 + y0, 3, 7);
      r('peau', 10, 14 + y0, 12, 4);
      r('cheveux', 9, 3 + y0, 14, 12);
    }
  }

  // Contour sombre d'un pixel, ajouté automatiquement autour de la silhouette pour la lisibilité.
  const image = g.getImageData(0, 0, 32, 48), d = image.data, bord = [];
  const plein = (x, y) => x >= 0 && x < 32 && y >= 0 && y < 48 && d[(y * 32 + x) * 4 + 3] > 0;
  for (let y = 0; y < 48; y++) for (let x = 0; x < 32; x++) {
    if (!plein(x, y) && (plein(x + 1, y) || plein(x - 1, y) || plein(x, y + 1) || plein(x, y - 1))) bord.push([x, y]);
  }
  g.fillStyle = C.contour;
  bord.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
}

// Renvoie { face: [4 images], dos: [...], profil: [...] }. L'image 0 sert aussi de pose à l'arrêt.
export function imagesPersoProvisoire() {
  const images = {};
  ['face', 'dos', 'profil'].forEach((direction) => {
    images[direction] = [0, 1, 0, 2].map((pas) => texturePixel(32, 48, (g) => dessinerPerso(g, direction, pas), { repetable: false }));
  });
  return images;
}
