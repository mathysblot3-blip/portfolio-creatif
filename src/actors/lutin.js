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
  return lutin;
}

// Personnage provisoire de 32 × 48 px, vu de face. À remplacer par ton sprite.
export function texturePersoProvisoire() {
  const C = {
    peau: '#f1c9a0', peauOmbre: '#d9a57c', cheveux: '#3b2a20', veste: '#2f4b7c', vesteOmbre: '#243a61',
    echarpe: '#e0507a', pantalon: '#2b2b38', pantalonOmbre: '#1e1e28', chaussure: '#1a1418', contour: '#14101a',
  };
  return texturePixel(32, 48, (g) => {
    const r = (couleur, x, y, l, h) => { g.fillStyle = C[couleur]; g.fillRect(x, y, l, h); };
    // jambes et chaussures
    r('pantalon', 11, 33, 10, 10); r('pantalonOmbre', 15, 35, 2, 8);
    r('chaussure', 10, 43, 6, 3); r('chaussure', 16, 43, 6, 3);
    // buste et bras
    r('veste', 10, 18, 12, 15); r('vesteOmbre', 19, 18, 3, 15);
    r('veste', 7, 19, 3, 11); r('vesteOmbre', 22, 19, 3, 11);
    r('peau', 7, 30, 3, 2); r('peauOmbre', 22, 30, 3, 2);
    // écharpe
    r('echarpe', 10, 17, 12, 3); r('echarpe', 18, 20, 3, 5);
    // tête et cheveux
    r('peau', 9, 5, 14, 12); r('peauOmbre', 20, 7, 3, 10);
    r('cheveux', 8, 2, 16, 6); r('cheveux', 8, 8, 2, 6); r('cheveux', 22, 8, 2, 5);
    // yeux
    r('contour', 12, 11, 2, 3); r('contour', 18, 11, 2, 3);

    // Contour sombre d'un pixel, ajouté automatiquement autour de la silhouette pour la lisibilité.
    const image = g.getImageData(0, 0, 32, 48), d = image.data, bord = [];
    const plein = (x, y) => x >= 0 && x < 32 && y >= 0 && y < 48 && d[(y * 32 + x) * 4 + 3] > 0;
    for (let y = 0; y < 48; y++) for (let x = 0; x < 32; x++) {
      if (!plein(x, y) && (plein(x + 1, y) || plein(x - 1, y) || plein(x, y + 1) || plein(x, y - 1))) bord.push([x, y]);
    }
    g.fillStyle = C.contour;
    bord.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  }, { repetable: false });
}
