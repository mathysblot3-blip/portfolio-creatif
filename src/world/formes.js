// =====================================================================
// FORMES DE BASE
// Volumes simples dont la texture garde partout la même densité (32 px par unité) :
// une tuile de 64 px couvre toujours 2 unités, que l'objet soit grand ou petit.
// =====================================================================
import * as THREE from 'three';

export const UNITES_PAR_TUILE = 2;

// Boîte : chaque face reçoit la texture à la bonne échelle selon ses dimensions réelles.
export function boiteDense(largeur, hauteur, profondeur) {
  const forme = new THREE.BoxGeometry(largeur, hauteur, profondeur);
  const uv = forme.attributes.uv;
  // Ordre des faces dans three.js : droite, gauche, dessus, dessous, avant, arrière.
  const faces = [[profondeur, hauteur], [profondeur, hauteur], [largeur, profondeur], [largeur, profondeur], [largeur, hauteur], [largeur, hauteur]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i;
    uv.setXY(k, (uv.getX(k) * faces[f][0]) / UNITES_PAR_TUILE, (uv.getY(k) * faces[f][1]) / UNITES_PAR_TUILE);
  }
  return forme;
}

// Rectangle vertical (façade, panneau) avec la même règle de densité.
export function planDense(largeur, hauteur) {
  const forme = new THREE.PlaneGeometry(largeur, hauteur);
  const uv = forme.attributes.uv;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) * largeur) / UNITES_PAR_TUILE, (uv.getY(k) * hauteur) / UNITES_PAR_TUILE);
  return forme;
}

// Sol en forme d'ovale, posé à plat.
export function solOvale(rayonX, rayonZ, segments = 64) {
  const forme = new THREE.CircleGeometry(1, segments);
  forme.scale(rayonX, rayonZ, 1);
  const position = forme.attributes.position, uv = forme.attributes.uv;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, position.getX(k) / UNITES_PAR_TUILE, position.getY(k) / UNITES_PAR_TUILE);
  forme.rotateX(-Math.PI / 2);
  return forme;
}

// Toit à deux pans : un triangle étiré sur toute la largeur du bâtiment.
// Les triangles (pignons) se trouvent sur les côtés gauche et droit.
export function toitDeuxPans(largeur, profondeur, hauteur) {
  const debord = 0.45, triangle = new THREE.Shape();
  triangle.moveTo(-(profondeur / 2 + debord), 0);
  triangle.lineTo(profondeur / 2 + debord, 0);
  triangle.lineTo(0, hauteur);
  triangle.closePath();
  const forme = new THREE.ExtrudeGeometry(triangle, { depth: largeur + 0.6, bevelEnabled: false });
  forme.rotateY(Math.PI / 2);
  forme.translate(-(largeur + 0.6) / 2, 0, 0);
  return forme;
}
