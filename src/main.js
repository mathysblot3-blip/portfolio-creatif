// =====================================================================
// POINT D'ENTRÉE
// Ce fichier assemble les morceaux : rendu, caméra, lumières, décor, personnage,
// puis lance la boucle qui redessine l'image environ 60 fois par seconde.
// Jour 1 : scène de calibrage du rendu HD-2D.
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './engine/reglages.js';
import { creerRendu, plafondPixelRatio } from './engine/rendu.js';
import { creerCamera } from './engine/camera.js';
import { creerLumieres } from './engine/lumieres.js';
import { creerPostTraitement } from './engine/postTraitement.js';
import { construireSceneCalibrage } from './world/calibrage.js';
import { creerLutin, texturePersoProvisoire } from './actors/lutin.js';

const rendu = creerRendu(document.getElementById('vue'));
const scene = new THREE.Scene();
const cam = creerCamera();
const lumieres = creerLumieres(scene);
const post = creerPostTraitement(rendu, scene, cam.camera);
const monde = construireSceneCalibrage(scene);

const joueur = creerLutin(texturePersoProvisoire());
joueur.position.set(0, 0, 2);
scene.add(joueur);

// Relit tous les réglages et les applique. Appelée au démarrage et à chaque mouvement d'un curseur.
function toutAppliquer() {
  cam.appliquerReglages();
  lumieres.appliquerReglages();
  lumieres.definirFinesseOmbres(REGLAGES.qualite === 'haute' ? 2048 : 1024);
  post.appliquerReglages();
  post.redimensionner(plafondPixelRatio(REGLAGES.qualite));
}
toutAppliquer();

// ---------- Clavier ----------
// event.code désigne la position physique de la touche : KeyW est la touche Z d'un clavier AZERTY,
// KeyA la touche Q. ZQSD et WASD fonctionnent donc tous les deux sans réglage.
const touches = new Set();
addEventListener('keydown', (e) => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  touches.add(e.code);
});
addEventListener('keyup', (e) => touches.delete(e.code));
addEventListener('blur', () => touches.clear());

addEventListener('resize', () => {
  cam.redimensionner();
  post.redimensionner(plafondPixelRatio(REGLAGES.qualite));
});

// ---------- Boucle principale ----------
const horloge = new THREE.Clock();
const direction = new THREE.Vector3();
const compteur = document.getElementById('compteur');
let images = 0, chrono = 0;
const VITESSE = 5; // unités par seconde

function boucle() {
  // Fenêtre réduite ou onglet pas encore affiché : rien à dessiner, on attend l'image suivante.
  if (innerWidth === 0 || innerHeight === 0) { requestAnimationFrame(boucle); return; }
  const dt = Math.min(horloge.getDelta(), 0.05);

  // Déplacement provisoire, sans collisions (elles arrivent au jour 3)
  direction.set(0, 0, 0);
  if (touches.has('KeyD') || touches.has('ArrowRight')) direction.x += 1;
  if (touches.has('KeyA') || touches.has('ArrowLeft')) direction.x -= 1;
  if (touches.has('KeyS') || touches.has('ArrowDown')) direction.z += 1;
  if (touches.has('KeyW') || touches.has('ArrowUp')) direction.z -= 1;
  if (direction.lengthSq() > 0) {
    direction.normalize();
    const L = monde.limites;
    joueur.position.x = THREE.MathUtils.clamp(joueur.position.x + direction.x * VITESSE * dt, L.xMin, L.xMax);
    joueur.position.z = THREE.MathUtils.clamp(joueur.position.z + direction.z * VITESSE * dt, L.zMin, L.zMax);
  }

  cam.suivre(joueur.position, direction, dt);
  lumieres.suivre(cam.cible);
  post.definirMiseAuPoint(cam.profondeurDe(joueur.position)); // le perso est toujours net
  monde.animer(horloge.elapsedTime);
  post.rendre();

  // Compteur d'images par seconde, mis à jour deux fois par seconde
  images++; chrono += dt;
  if (chrono >= 0.5) {
    compteur.textContent = `${Math.round(images / chrono)} i/s`;
    images = 0; chrono = 0;
  }
  requestAnimationFrame(boucle);
}

cam.suivre(joueur.position, direction, 0, true); // place la caméra directement, sans glissement au démarrage
boucle();

// Le panneau de réglages n'est chargé qu'en développement (ou avec ?reglages dans l'adresse).
const modeDev = import.meta.env ? import.meta.env.DEV : true;
if (modeDev || new URLSearchParams(location.search).has('reglages')) {
  import('./ui/panneauReglages.js').then((m) => m.creerPanneau(REGLAGES, toutAppliquer));
}

// Accès depuis la console du navigateur, pratique pour déboguer.
window.__quartier = { REGLAGES, toutAppliquer, joueur, cam, scene, rendu, post };
