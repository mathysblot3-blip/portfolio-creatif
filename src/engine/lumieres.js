// =====================================================================
// LUMIÈRES
// Un soleil bas et chaud qui projette les ombres, plus une lumière d'ambiance
// à deux couleurs (ciel en haut, sol en bas) qui teinte les zones à l'ombre.
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './reglages.js';

const enRadians = (degres) => (degres * Math.PI) / 180;

export function creerLumieres(scene) {
  const R = REGLAGES.lumiere;

  const ambiance = new THREE.HemisphereLight(R.cielCouleur, R.solCouleur, R.cielIntensite);
  scene.add(ambiance);

  const soleil = new THREE.DirectionalLight(R.soleilCouleur, R.soleilIntensite);
  soleil.castShadow = true;
  soleil.shadow.mapSize.set(2048, 2048);
  // Zone couverte par les ombres : un carré de 64 unités centré sur le perso.
  Object.assign(soleil.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 });
  // Ces deux valeurs évitent les rayures parasites sur les surfaces éclairées.
  soleil.shadow.bias = -0.0004;
  soleil.shadow.normalBias = 0.04;
  scene.add(soleil);
  scene.add(soleil.target);

  const direction = new THREE.Vector3(); // du sol vers le soleil

  function appliquerReglages() {
    ambiance.color.set(R.cielCouleur);
    ambiance.groundColor.set(R.solCouleur);
    ambiance.intensity = R.cielIntensite;
    soleil.color.set(R.soleilCouleur);
    soleil.intensity = R.soleilIntensite;
    const azimut = enRadians(R.soleilAzimut), hauteur = enRadians(R.soleilHauteur);
    direction.set(Math.sin(azimut) * Math.cos(hauteur), Math.sin(hauteur), Math.cos(azimut) * Math.cos(hauteur));
  }

  // Le soleil accompagne la caméra pour que les ombres restent précises autour du perso.
  // On arrondit la position pour éviter que le bord des ombres tremble pendant la marche.
  function suivre(cible) {
    const x = Math.round(cible.x), z = Math.round(cible.z);
    soleil.target.position.set(x, 0, z);
    soleil.position.set(x, 0, z).addScaledVector(direction, 60);
    soleil.target.updateMatrixWorld();
  }

  // Taille de la texture d'ombre : plus elle est grande, plus les ombres sont fines (et coûteuses).
  function definirFinesseOmbres(taille) {
    if (soleil.shadow.mapSize.x === taille) return;
    soleil.shadow.mapSize.set(taille, taille);
    if (soleil.shadow.map) { soleil.shadow.map.dispose(); soleil.shadow.map = null; }
  }

  appliquerReglages();
  return { soleil, ambiance, appliquerReglages, suivre, definirFinesseOmbres };
}
