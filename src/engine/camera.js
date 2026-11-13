// =====================================================================
// CAMÉRA HD-2D
// Dans la ville : longue focale, placée loin et en hauteur, toujours face aux façades
// (aucune rotation libre). Elle suit le personnage avec un amorti et regarde un peu en avant.
// Dans une pièce : cadrage fixe face au mur du fond, qui suit seulement un peu le perso de côté.
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './reglages.js';

const enRadians = (degres) => (degres * Math.PI) / 180;

// Écran plus étroit que cette proportion (téléphone tenu en hauteur, fenêtre étroite) :
// on élargit l'angle de vue pour garder assez de largeur visible.
const PROPORTION_MIN_VILLE = 0.8;

// Angle vertical qui montre au moins la largeur qu'aurait un écran de proportion "proportionMin".
function angleAdapte(fov, proportion, proportionMin) {
  if (!proportionMin || proportion >= proportionMin) return fov;
  return (2 * Math.atan(Math.tan(enRadians(fov) / 2) * proportionMin / proportion) * 180) / Math.PI;
}

export function creerCamera() {
  const R = REGLAGES.camera;
  const camera = new THREE.PerspectiveCamera(R.fov, innerWidth / innerHeight, 4, 400);
  const cible = new THREE.Vector3();  // point réellement suivi (lissé)
  const voulu = new THREE.Vector3();  // point que la caméra cherche à atteindre
  let fixe = null;                    // cadrage fixe d'une pièce, ou null dans la ville

  function appliquerReglages() {
    camera.fov = fixe ? angleAdapte(fixe.fov, camera.aspect, fixe.proportionMin) : angleAdapte(R.fov, camera.aspect, PROPORTION_MIN_VILLE);
    camera.near = fixe ? 1 : 4;
    camera.updateProjectionMatrix();
  }

  // Passe en cadrage fixe (pièce) ou revient au suivi de la ville (profil = null).
  function definirCadrage(profil) {
    fixe = profil;
    appliquerReglages();
  }

  // position : où se trouve le perso. direction : sens de sa marche (vecteur nul s'il est immobile).
  // dt : temps écoulé depuis l'image précédente, en secondes.
  function suivre(position, direction, dt, immediat = false) {
    // Interpolation exponentielle : le résultat est le même à 30 ou à 144 images par seconde.
    const k = immediat ? 1 : 1 - Math.exp(-(fixe ? 3 : R.amorti) * dt);

    if (fixe) {
      voulu.set(position.x * fixe.suiviX, 0, 0);
      cible.lerp(voulu, k);
      camera.position.set(cible.x, fixe.y, fixe.z);
      camera.rotation.set(-enRadians(fixe.visee), 0, 0);
    } else {
      voulu.copy(position).addScaledVector(direction, R.avance);
      cible.lerp(voulu, k);
      const inclinaison = enRadians(R.inclinaison);
      camera.position.set(
        cible.x,
        cible.y + Math.sin(inclinaison) * R.distance,
        cible.z + Math.cos(inclinaison) * R.distance,
      );
      // Seule rotation autorisée : la plongée vers le sol.
      camera.rotation.set(-enRadians(R.visee), 0, 0);
    }
    camera.updateMatrixWorld();
  }

  function redimensionner() {
    camera.aspect = innerWidth / innerHeight;
    appliquerReglages(); // l'angle de vue dépend de la proportion de l'écran
  }

  // Distance entre la caméra et un point, mesurée dans l'axe de visée (sert à la mise au point du flou).
  const tampon = new THREE.Vector3();
  function profondeurDe(point) {
    return -tampon.copy(point).applyMatrix4(camera.matrixWorldInverse).z;
  }

  return { camera, cible, suivre, appliquerReglages, definirCadrage, redimensionner, profondeurDe };
}
