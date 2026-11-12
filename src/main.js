// =====================================================================
// POINT D'ENTRÉE
// Ce fichier assemble les morceaux : rendu, caméra, lumières, quartier, joueur, interface,
// puis lance la boucle qui redessine l'image environ 60 fois par seconde.
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './engine/reglages.js';
import { creerRendu, plafondPixelRatio } from './engine/rendu.js';
import { creerCamera } from './engine/camera.js';
import { creerLumieres } from './engine/lumieres.js';
import { creerPostTraitement } from './engine/postTraitement.js';
import { construireQuartier } from './world/quartier.js';
import { creerNavigation } from './world/chemin.js';
import { creerJoueur } from './actors/joueur.js';
import { creerHud } from './ui/hud.js';

const toile = document.getElementById('vue');
const rendu = creerRendu(toile);
const scene = new THREE.Scene();
const cam = creerCamera();
const lumieres = creerLumieres(scene);
const post = creerPostTraitement(rendu, scene, cam.camera);
const monde = construireQuartier(scene);
const navigation = creerNavigation(monde.collisions);
const joueur = creerJoueur(scene, monde.collisions, navigation);
const hud = creerHud(monde.lieux.length);

// Les enseignes utilisent la police pixel : on les redessine dès qu'elle est chargée.
document.fonts.load('8px "Press Start 2P"').then(() => monde.redessinerEnseignes()).catch(() => {});

// Relit tous les réglages et les applique. Appelée au démarrage et à chaque mouvement d'un curseur.
function toutAppliquer() {
  cam.appliquerReglages();
  lumieres.appliquerReglages();
  lumieres.definirFinesseOmbres(REGLAGES.qualite === 'haute' ? 2048 : 1024);
  post.appliquerReglages();
  post.redimensionner(plafondPixelRatio(REGLAGES.qualite));
}
toutAppliquer();

// ---------- Lieux visités et entrée dans un lieu ----------
const visites = new Set();
let porteProche = null; // porte devant laquelle se trouve le perso, s'il y en a une

function entrer(lieu) {
  visites.add(lieu.cle);
  hud.majCompteur(visites.size);
  // Provisoire : la vue intérieure (mur du fond avec le contenu) reste à construire.
  hud.notifier(`${lieu.nom}<br>${lieu.section} · intérieur à venir`);
}

// ---------- Clavier ----------
// event.code désigne la position physique de la touche : KeyW est la touche Z d'un clavier AZERTY,
// KeyA la touche Q. ZQSD et WASD fonctionnent donc tous les deux sans réglage.
const touches = new Set();
addEventListener('keydown', (e) => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if ((e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') && porteProche && !e.repeat) {
    entrer(porteProche.lieu);
    return;
  }
  touches.add(e.code);
});
addEventListener('keyup', (e) => touches.delete(e.code));
addEventListener('blur', () => touches.clear());

// ---------- Souris : clic pour se déplacer ----------
const rayon = new THREE.Raycaster(), pointeur = new THREE.Vector2();
toile.addEventListener('pointerdown', (e) => {
  pointeur.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  rayon.setFromCamera(pointeur, cam.camera);
  // Clic sur un bâtiment : le perso va jusqu'à sa porte, puis entre.
  const touche = rayon.intersectObjects(monde.cliquables, false)[0];
  if (touche) {
    const porte = monde.portes.find((p) => p.lieu === touche.object.userData.lieu);
    joueur.allerVers(porte.x, porte.z, () => entrer(porte.lieu));
    return;
  }
  // Clic sur le sol : le perso s'y rend.
  const auSol = rayon.intersectObject(monde.sol)[0];
  if (auSol) joueur.allerVers(auSol.point.x, auSol.point.z);
});

addEventListener('resize', () => {
  cam.redimensionner();
  post.redimensionner(plafondPixelRatio(REGLAGES.qualite));
});

// ---------- Boucle principale ----------
const horloge = new THREE.Clock();
const compteur = document.getElementById('compteur');
let images = 0, chrono = 0;

function boucle() {
  // Fenêtre réduite ou onglet pas encore affiché : rien à dessiner, on attend l'image suivante.
  if (innerWidth === 0 || innerHeight === 0) { requestAnimationFrame(boucle); return; }
  const dt = Math.min(horloge.getDelta(), 0.05);

  const direction = joueur.mettreAJour(dt, touches);

  // Porte la plus proche du perso (à moins de 1,6 unité)
  let proche = null, meilleure = 1.6;
  for (const porte of monde.portes) {
    const d = Math.hypot(porte.x - joueur.position.x, porte.z - joueur.position.z);
    if (d < meilleure) { meilleure = d; proche = porte; }
  }
  if (proche !== porteProche) { porteProche = proche; hud.afficherInvite(proche ? proche.lieu : null); }

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

cam.suivre(joueur.position, new THREE.Vector3(), 0, true); // place la caméra directement, sans glissement au démarrage
boucle();
setTimeout(() => hud.notifier('Bienvenue dans le quartier.<br>Chaque bâtiment est une section.'), 500);

// Le panneau de réglages n'est chargé qu'en développement (ou avec ?reglages dans l'adresse).
if (import.meta.env.DEV || new URLSearchParams(location.search).has('reglages')) {
  compteur.classList.remove('cache');
  import('./ui/panneauReglages.js').then((m) => m.creerPanneau(REGLAGES, toutAppliquer));
}

// Accès depuis la console du navigateur, pratique pour déboguer.
window.__quartier = { REGLAGES, toutAppliquer, joueur, cam, scene, rendu, post, monde, navigation, entrer };
