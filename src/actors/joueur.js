// =====================================================================
// LE JOUEUR
// Gère le déplacement du personnage : au clavier, ou en suivant un chemin après un clic.
// Choisit aussi l'image à afficher selon la direction et l'avancée du pas.
// =====================================================================
import * as THREE from 'three';
import { creerLutin, imagesPersoProvisoire } from './lutin.js';

const VITESSE = 5;          // unités par seconde
const DUREE_IMAGE = 0.14;   // durée d'une image de marche, en secondes

export function creerJoueur(scene, collisions, navigation) {
  const images = imagesPersoProvisoire();
  const lutin = creerLutin(images.face[0]);
  lutin.position.set(0, 0, 6.5);
  scene.add(lutin);

  const direction = new THREE.Vector3(); // sens de la marche à l'image courante (nul à l'arrêt)
  let orientation = 'face', miroir = false, image = 0, chrono = 0;
  let chemin = [];        // points restant à atteindre après un clic
  let arrivee = null;     // fonction à appeler une fois le chemin terminé (ouvrir un lieu, par exemple)

  // Demande au perso d'aller au point (x, z) en contournant les obstacles.
  function allerVers(x, z, unefoisArrive = null) {
    const trajet = navigation.trouverChemin(lutin.position.x, lutin.position.z, x, z);
    chemin = trajet ?? [];
    arrivee = trajet ? unefoisArrive : null;
  }

  function arreter() { chemin = []; arrivee = null; }

  function mettreAJour(dt, touches) {
    direction.set(0, 0, 0);
    if (touches.has('KeyD') || touches.has('ArrowRight')) direction.x += 1;
    if (touches.has('KeyA') || touches.has('ArrowLeft')) direction.x -= 1;
    if (touches.has('KeyS') || touches.has('ArrowDown')) direction.z += 1;
    if (touches.has('KeyW') || touches.has('ArrowUp')) direction.z -= 1;

    const p = lutin.position;
    if (direction.lengthSq() > 0) {
      arreter(); // le clavier reprend toujours la main sur le clic
    } else if (chemin.length) {
      const cible = chemin[0], dx = cible.x - p.x, dz = cible.z - p.z, distance = Math.hypot(dx, dz);
      if (distance < 0.12) {
        chemin.shift();
        if (!chemin.length && arrivee) { const action = arrivee; arrivee = null; action(); }
      } else {
        direction.set(dx / distance, 0, dz / distance);
      }
    }

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const pas = VITESSE * dt;
      // On teste chaque axe séparément : contre un mur, le perso glisse au lieu de rester collé.
      let bouge = false;
      if (!collisions.bloque(p.x + direction.x * pas, p.z)) { p.x += direction.x * pas; bouge = true; }
      if (!collisions.bloque(p.x, p.z + direction.z * pas)) { p.z += direction.z * pas; bouge = true; }
      if (!bouge) arreter();

      if (Math.abs(direction.x) > Math.abs(direction.z)) { orientation = 'profil'; miroir = direction.x < 0; }
      else { orientation = direction.z < 0 ? 'dos' : 'face'; miroir = false; }
      chrono += dt;
      if (chrono > DUREE_IMAGE) { chrono = 0; image = (image + 1) % 4; }
    } else {
      image = 0; chrono = 0;
    }
    lutin.userData.afficher(images[orientation][image], miroir);
    return direction;
  }

  return { lutin, position: lutin.position, allerVers, arreter, mettreAJour };
}
