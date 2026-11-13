// =====================================================================
// POINT D'ENTRÉE
// Ce fichier assemble les morceaux : rendu, caméra, lumières, ville, intérieurs, joueur, interface,
// puis lance la boucle qui redessine l'image environ 60 fois par seconde.
//
// Le jeu a trois états (variable "mode") :
//   'ville'        le perso se promène sur la place
//   'piece'        le perso est dans un lieu, face au mur de contenu
//   'visionneuse'  un élément du mur est affiché en grand
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './engine/reglages.js';
import { creerRendu, plafondPixelRatio } from './engine/rendu.js';
import { creerCamera } from './engine/camera.js';
import { creerLumieres } from './engine/lumieres.js';
import { creerPostTraitement } from './engine/postTraitement.js';
import { construireVille } from './world/ville.js';
import { creerNavigation } from './world/chemin.js';
import { construirePiece, CAMERA_INTERIEUR } from './interieur/piece.js';
import { creerJoueur } from './actors/joueur.js';
import { creerHud } from './ui/hud.js';
import { creerVisionneuse } from './ui/visionneuse.js';
import { creerTransition } from './ui/transition.js';

const toile = document.getElementById('vue');
const rendu = creerRendu(toile);
const sceneVille = new THREE.Scene();
const cam = creerCamera();
const lumieres = creerLumieres(sceneVille);
const post = creerPostTraitement(rendu, sceneVille, cam.camera);
const ville = construireVille(sceneVille);
const navigationVille = creerNavigation(ville.collisions);
const joueur = creerJoueur(sceneVille, ville.collisions, navigationVille);
const hud = creerHud(ville.lieux.length);
const visionneuse = creerVisionneuse();
const transition = creerTransition();

// Les enseignes utilisent la police pixel : on les redessine dès qu'elle est chargée.
document.fonts.load('8px "Press Start 2P"').then(() => ville.redessinerEnseignes()).catch(() => {});

// Relit tous les réglages et les applique. Appelée au démarrage et à chaque mouvement d'un curseur.
function toutAppliquer() {
  cam.appliquerReglages();
  lumieres.appliquerReglages();
  lumieres.definirFinesseOmbres(REGLAGES.qualite === 'haute' ? 2048 : 1024);
  post.appliquerReglages();
  post.redimensionner(plafondPixelRatio(REGLAGES.qualite));
}
toutAppliquer();

// ---------- État du jeu ----------
let mode = 'ville';
let piece = null;            // pièce dans laquelle se trouve le perso
let porteProche = null;      // en ville : porte devant laquelle se tient le perso
let elementProche = null;    // dans une pièce : élément du mur que le perso peut regarder
let prochesortie = false;    // dans une pièce : le perso se tient sur le tapis de sortie
const pieces = new Map();    // pièces déjà construites (on ne les fabrique qu'une fois)
const visites = new Set();

// ---------- Entrer dans un lieu, en sortir ----------
function entrer(lieu) {
  if (mode !== 'ville' || transition.enCours()) return;
  touches.clear();
  transition.jouer(lieu.accent, () => {
    if (!pieces.has(lieu.cle)) pieces.set(lieu.cle, construirePiece(lieu));
    piece = pieces.get(lieu.cle);
    joueur.placer(piece.scene, piece.collisions, piece.navigation, piece.entree.x, piece.entree.z, 'dos');
    cam.definirCadrage(CAMERA_INTERIEUR);
    post.appliquerReglages();
    post.definirScene(piece.scene);
    cam.suivre(joueur.position, new THREE.Vector3(), 0, true);
    mode = 'piece';
    porteProche = null;
    hud.afficherInvite(null);
    hud.modePiece(lieu);
    visites.add(lieu.cle);
    hud.majCompteur(visites.size);
  });
}

function sortir() {
  if (mode !== 'piece' || transition.enCours()) return;
  touches.clear();
  const porte = ville.portes.find((p) => p.lieu === piece.lieu);
  transition.jouer(piece.lieu.accent, () => {
    joueur.placer(sceneVille, ville.collisions, navigationVille, porte.x, porte.z, 'face');
    cam.definirCadrage(null);
    post.appliquerReglages();
    post.definirScene(sceneVille);
    cam.suivre(joueur.position, new THREE.Vector3(), 0, true);
    mode = 'ville';
    piece = null; elementProche = null; prochesortie = false;
    hud.afficherInvite(null);
    hud.modeVille();
  });
}

// Ouvre la visionneuse sur un élément du mur.
function regarder(accroche) {
  if (mode !== 'piece') return;
  joueur.arreter();
  joueur.regarder('dos');
  touches.clear();
  mode = 'visionneuse';
  hud.afficherInvite(null);
  hud.aideVisionneuse(true);
  visionneuse.ouvrir(piece.preuves, accroche.index, piece.lieu.accent, () => {
    mode = 'piece';
    elementProche = null; // force la réapparition de l'invite
    hud.aideVisionneuse(false);
  });
}

// ---------- Clavier ----------
// event.code désigne la position physique de la touche : KeyW est la touche Z d'un clavier AZERTY,
// KeyA la touche Q. ZQSD et WASD fonctionnent donc tous les deux sans réglage.
const touches = new Set();
const ACTION = ['KeyE', 'Enter', 'NumpadEnter', 'Space'];
addEventListener('keydown', (e) => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (transition.enCours() || e.repeat && ACTION.includes(e.code)) return;

  if (mode === 'visionneuse') {
    if (e.code === 'Escape' || e.code === 'Backspace') visionneuse.fermer();
    if (e.code === 'ArrowRight' || e.code === 'KeyD') visionneuse.suivant();
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') visionneuse.precedent();
    return;
  }
  if (mode === 'piece') {
    if (e.code === 'Escape' || e.code === 'Backspace') { sortir(); return; }
    if (ACTION.includes(e.code)) {
      if (elementProche) { regarder(elementProche); return; }
      if (prochesortie) { sortir(); return; }
    }
  }
  if (mode === 'ville' && ACTION.includes(e.code) && porteProche) { entrer(porteProche.lieu); return; }
  touches.add(e.code);
});
addEventListener('keyup', (e) => touches.delete(e.code));
addEventListener('blur', () => touches.clear());

// ---------- Souris : clic pour se déplacer ----------
const rayon = new THREE.Raycaster(), pointeur = new THREE.Vector2();
toile.addEventListener('pointerdown', (e) => {
  if (transition.enCours() || mode === 'visionneuse') return;
  pointeur.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  rayon.setFromCamera(pointeur, cam.camera);

  if (mode === 'ville') {
    // Clic sur un bâtiment : le perso va jusqu'à sa porte, puis entre.
    const touche = rayon.intersectObjects(ville.cliquables, false)[0];
    if (touche) {
      const porte = ville.portes.find((p) => p.lieu === touche.object.userData.lieu);
      joueur.allerVers(porte.x, porte.z, () => entrer(porte.lieu));
      return;
    }
    const auSol = rayon.intersectObject(ville.sol)[0];
    if (auSol) joueur.allerVers(auSol.point.x, auSol.point.z);
    return;
  }

  // Dans une pièce : clic sur un élément du mur, le perso s'en approche puis le regarde.
  const touche = rayon.intersectObjects(piece.cliquables, false)[0];
  if (touche) {
    const accroche = piece.accroches.find((a) => a.element === touche.object.userData.element);
    const point = piece.pointDeVue(accroche);
    joueur.allerVers(point.x, point.z, () => regarder(accroche));
    return;
  }
  const auSol = rayon.intersectObject(piece.sol)[0];
  if (auSol) joueur.allerVers(auSol.point.x, auSol.point.z);
});

addEventListener('resize', () => {
  cam.redimensionner();
  post.redimensionner(plafondPixelRatio(REGLAGES.qualite));
});

// ---------- Boucle principale ----------
const horloge = new THREE.Clock();
const compteur = document.getElementById('compteur');
const immobile = new Set();
let images = 0, chrono = 0;

function boucle() {
  // Fenêtre réduite ou onglet pas encore affiché : rien à dessiner, on attend l'image suivante.
  if (innerWidth === 0 || innerHeight === 0) { requestAnimationFrame(boucle); return; }
  const dt = Math.min(horloge.getDelta(), 0.05);
  const actif = mode !== 'visionneuse' && !transition.enCours();
  const direction = joueur.mettreAJour(dt, actif ? touches : immobile);

  if (mode === 'ville' && !transition.enCours()) {
    // Porte la plus proche du perso (à moins de 1,6 unité)
    let proche = null, meilleure = 1.6;
    for (const porte of ville.portes) {
      const d = Math.hypot(porte.x - joueur.position.x, porte.z - joueur.position.z);
      if (d < meilleure) { meilleure = d; proche = porte; }
    }
    if (proche !== porteProche) { porteProche = proche; hud.afficherInvite(proche ? proche.lieu.nom : null, proche?.lieu.accent); }
  }

  if (mode === 'piece' && !transition.enCours()) {
    const proche = piece.elementProche(joueur.position);
    const surSortie = Math.hypot(joueur.position.x - piece.sortie.x, joueur.position.z - piece.sortie.z) < 1.5;
    if (proche !== elementProche || surSortie !== prochesortie) {
      elementProche = proche; prochesortie = surSortie;
      if (proche) hud.afficherInvite(proche.element.titre, piece.lieu.accent, 'E : REGARDER');
      else if (surSortie) hud.afficherInvite('SORTIR', piece.lieu.accent, 'E / ECHAP');
      else hud.afficherInvite(null);
    }
  }

  cam.suivre(joueur.position, direction, dt);
  if (mode === 'ville') lumieres.suivre(cam.cible);
  post.definirMiseAuPoint(cam.profondeurDe(joueur.position)); // le perso est toujours net
  if (mode === 'ville') ville.animer(horloge.elapsedTime);
  else piece.animer(horloge.elapsedTime);
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
setTimeout(() => hud.notifier('Bienvenue.<br>Chaque bâtiment est une section.'), 500);

// Le panneau de réglages n'est chargé qu'en développement (ou avec ?reglages dans l'adresse).
if (import.meta.env.DEV || new URLSearchParams(location.search).has('reglages')) {
  compteur.classList.remove('cache');
  import('./ui/panneauReglages.js').then((m) => m.creerPanneau(REGLAGES, toutAppliquer));
}

// Accès depuis la console du navigateur, pratique pour déboguer.
window.__portfolio = { REGLAGES, toutAppliquer, joueur, cam, rendu, post, ville, entrer, sortir, regarder, etat: () => ({ mode, piece }) };
