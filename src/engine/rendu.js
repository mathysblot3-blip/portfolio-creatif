// =====================================================================
// MOTEUR DE RENDU
// Crée l'objet three.js qui dessine la scène 3D dans la toile de la page.
// =====================================================================
import * as THREE from 'three';

export function creerRendu(toile) {
  const rendu = new THREE.WebGLRenderer({
    canvas: toile,
    antialias: false, // l'anticrénelage est fait plus loin, dans le post-traitement
    powerPreference: 'high-performance',
  });
  rendu.setSize(innerWidth, innerHeight);

  // Ombres portées douces
  rendu.shadowMap.enabled = true;
  rendu.shadowMap.type = THREE.PCFSoftShadowMap;

  // Conversion finale des couleurs "cinéma" (appliquée par la dernière passe du post-traitement)
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  return rendu;
}

// Plafond du "pixel ratio" : sur un écran très dense, on ne calcule pas tous les pixels pour rester fluide.
export function plafondPixelRatio(qualite) {
  return Math.min(window.devicePixelRatio || 1, qualite === 'haute' ? 1.5 : 1);
}
