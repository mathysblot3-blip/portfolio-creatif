// =====================================================================
// CAMÉRA HD-2D
// Longue focale, placée loin et bas, toujours face aux façades (aucune rotation libre).
// Elle suit le personnage avec un amorti et regarde un peu en avant dans le sens de la marche.
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './reglages.js';

const enRadians = (degres) => (degres * Math.PI) / 180;

export function creerCamera() {
  const R = REGLAGES.camera;
  const camera = new THREE.PerspectiveCamera(R.fov, innerWidth / innerHeight, 4, 400);
  const cible = new THREE.Vector3();  // point réellement suivi (lissé)
  const voulu = new THREE.Vector3();  // point que la caméra cherche à atteindre

  function appliquerReglages() {
    camera.fov = R.fov;
    camera.updateProjectionMatrix();
  }

  // position : où se trouve le perso. direction : sens de sa marche (vecteur nul s'il est immobile).
  // dt : temps écoulé depuis l'image précédente, en secondes.
  function suivre(position, direction, dt, immediat = false) {
    voulu.copy(position).addScaledVector(direction, R.avance);
    // Interpolation exponentielle : le résultat est le même à 30 ou à 144 images par seconde.
    const k = immediat ? 1 : 1 - Math.exp(-R.amorti * dt);
    cible.lerp(voulu, k);

    const inclinaison = enRadians(R.inclinaison);
    camera.position.set(
      cible.x,
      cible.y + Math.sin(inclinaison) * R.distance,
      cible.z + Math.cos(inclinaison) * R.distance,
    );
    // Seule rotation autorisée : la plongée vers le sol.
    camera.rotation.set(-enRadians(R.visee), 0, 0);
    camera.updateMatrixWorld();
  }

  function redimensionner() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }

  // Distance entre la caméra et un point, mesurée dans l'axe de visée (sert à la mise au point du flou).
  const tampon = new THREE.Vector3();
  function profondeurDe(point) {
    return -tampon.copy(point).applyMatrix4(camera.matrixWorldInverse).z;
  }

  return { camera, cible, suivre, appliquerReglages, redimensionner, profondeurDe };
}
