// =====================================================================
// POINT D'ENTRÉE
// Ce fichier assemble les morceaux : rendu, caméra, lumières, ville, intérieurs, joueur, interface,
// puis lance la boucle qui redessine l'image environ 60 fois par seconde.
//
// Le jeu a trois états (variable "mode") :
//   'ville'        le perso se promène sur la place ; il entre seul dès qu'il touche une porte
//   'piece'        plan fixe sur le tableau du lieu ; on clique sur les éléments
//   'visionneuse'  un élément du tableau est affiché en grand
// Tout le site se parcourt à la souris seule. Le clavier reste possible en complément.
// =====================================================================
import * as THREE from 'three';
import { REGLAGES } from './engine/reglages.js';
import { creerRendu, plafondPixelRatio } from './engine/rendu.js';
import { creerCamera } from './engine/camera.js';
import { creerLumieres } from './engine/lumieres.js';
import { creerPostTraitement } from './engine/postTraitement.js';
import { construireVille } from './world/ville.js';
import { creerNavigation } from './world/chemin.js';
import { construirePiece, CAMERA_INTERIEUR, FLOU_INTERIEUR } from './interieur/piece.js';
import { creerJoueur } from './actors/joueur.js';
import { creerHud } from './ui/hud.js';
import { creerVisionneuse } from './ui/visionneuse.js';
import { creerTransition } from './ui/transition.js';

const toile = document.getElementById('vue');
const infobulle = document.getElementById('infobulle');
const boutonSortir = document.getElementById('bouton-sortir');
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
let piece = null;              // lieu dans lequel on se trouve
let tempsDansPiece = 0;        // secondes depuis l'entrée (pilote l'animation d'entrée)
let survole = null;            // élément du tableau sous la souris (ou choisi au clavier)
let porteDesarmee = null;      // porte qu'on vient de quitter : elle ne se réactive qu'une fois qu'on s'en éloigne
let entreeEnCours = null;      // le perso est en train de passer la porte
const cadrage = { ...CAMERA_INTERIEUR };
const pieces = new Map();      // pièces déjà construites (on ne les fabrique qu'une fois)
const visites = new Set();
const DISTANCE_PORTE = 0.5;    // le perso entre dès qu'il est à cette distance du point de porte

// ---------- Entrer dans un lieu, en sortir ----------
function entrer(porte) {
  if (mode !== 'ville' || transition.enCours() || entreeEnCours) return;
  touches.clear();
  joueur.arreter();
  // Petit pas dans l'encadrement de la porte, pendant que le volet balaie l'écran
  entreeEnCours = { dx: porte.x - porte.retour.x, dz: porte.z - porte.retour.z };
  const longueur = Math.hypot(entreeEnCours.dx, entreeEnCours.dz) || 1;
  entreeEnCours.dx /= longueur; entreeEnCours.dz /= longueur;
  joueur.regarder('dos');

  transition.jouer(porte.lieu.accent, () => {
    entreeEnCours = null;
    if (!pieces.has(porte.lieu.cle)) pieces.set(porte.lieu.cle, construirePiece(porte.lieu, joueur.imageDos()));
    piece = pieces.get(porte.lieu.cle);
    tempsDansPiece = 0;
    Object.assign(cadrage, CAMERA_INTERIEUR);
    cam.definirCadrage(cadrage);
    post.definirFlou(FLOU_INTERIEUR);
    post.definirScene(piece.scene);
    piece.animer(0, 0, cadrage, 0);
    cam.suivre(joueur.position, new THREE.Vector3(), 0, true);
    mode = 'piece';
    hud.modePiece(porte.lieu);
    boutonSortir.style.setProperty('--acc', porte.lieu.accent);
    boutonSortir.classList.remove('cache');
    visites.add(porte.lieu.cle);
    hud.majCompteur(visites.size);
    porteDesarmee = porte;
  });
}

function sortir() {
  if (mode !== 'piece' || transition.enCours()) return;
  const porte = ville.portes.find((p) => p.lieu === piece.lieu);
  definirSurvol(null);
  boutonSortir.classList.add('cache');
  transition.jouer(piece.lieu.accent, () => {
    joueur.placer(sceneVille, ville.collisions, navigationVille, porte.retour.x, porte.retour.z, 'face');
    cam.definirCadrage(null);
    post.definirFlou(null);
    post.definirScene(sceneVille);
    cam.suivre(joueur.position, new THREE.Vector3(), 0, true);
    mode = 'ville';
    piece = null;
    hud.modeVille();
  });
}

// Ouvre la visionneuse sur une preuve du tableau.
function regarder(element) {
  if (mode !== 'piece') return;
  const index = piece.preuves.indexOf(element);
  if (index < 0) return;
  mode = 'visionneuse';
  definirSurvol(null);
  hud.aideVisionneuse(true);
  boutonSortir.classList.add('cache');
  visionneuse.ouvrir(piece.preuves, index, piece.lieu.accent, () => {
    mode = 'piece';
    hud.aideVisionneuse(false);
    boutonSortir.classList.remove('cache');
  });
}

// Met en avant un élément (souris ou clavier) et affiche son titre près du curseur.
function definirSurvol(element, x, y) {
  survole = element;
  if (piece) piece.survoler(element);
  toile.style.cursor = element ? 'pointer' : '';
  if (!element) { infobulle.classList.add('cache'); return; }
  infobulle.textContent = element.titre;
  infobulle.style.boxShadow = `4px 4px 0 ${piece.lieu.accent}`;
  if (x !== undefined) { infobulle.style.left = `${x}px`; infobulle.style.top = `${y}px`; }
  infobulle.classList.remove('cache');
}
boutonSortir.addEventListener('click', sortir);

// ---------- Clavier (en complément de la souris) ----------
// event.code désigne la position physique de la touche : KeyW est la touche Z d'un clavier AZERTY,
// KeyA la touche Q. ZQSD et WASD fonctionnent donc tous les deux sans réglage.
const touches = new Set();
addEventListener('keydown', (e) => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (transition.enCours()) return;

  if (mode === 'visionneuse') {
    if (e.code === 'Escape' || e.code === 'Backspace') visionneuse.fermer();
    if (e.code === 'ArrowRight' || e.code === 'KeyD') visionneuse.suivant();
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') visionneuse.precedent();
    return;
  }
  if (mode === 'piece') {
    if (e.code === 'Escape' || e.code === 'Backspace') { sortir(); return; }
    // Flèches : passer d'une preuve à l'autre. Entrée : l'ouvrir.
    if (['ArrowRight', 'ArrowDown', 'KeyD', 'KeyS', 'ArrowLeft', 'ArrowUp', 'KeyA', 'KeyW'].includes(e.code)) {
      const sens = ['ArrowRight', 'ArrowDown', 'KeyD', 'KeyS'].includes(e.code) ? 1 : -1;
      const liste = piece.preuves, n = liste.length;
      let i = liste.indexOf(survole);
      i = i < 0 ? (sens > 0 ? 0 : n - 1) : (i + sens + n) % n; // on boucle d'un bout à l'autre
      definirSurvol(liste[i]);
      infobulle.classList.add('cache');
    }
    if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') && survole) regarder(survole);
    return;
  }
  touches.add(e.code);
});
addEventListener('keyup', (e) => touches.delete(e.code));
addEventListener('blur', () => touches.clear());

// ---------- Souris ----------
const rayon = new THREE.Raycaster(), pointeur = new THREE.Vector2();
function viser(e) {
  pointeur.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  rayon.setFromCamera(pointeur, cam.camera);
}

toile.addEventListener('pointermove', (e) => {
  if (transition.enCours() || mode === 'visionneuse') return;
  viser(e);
  if (mode === 'piece') {
    const touche = rayon.intersectObjects(piece.cliquables, false)[0];
    definirSurvol(touche ? touche.object.userData.element : null, e.clientX, e.clientY);
  } else {
    // En ville, la main indique qu'un bâtiment est cliquable
    toile.style.cursor = rayon.intersectObjects(ville.cliquables, false).length ? 'pointer' : '';
  }
});

toile.addEventListener('pointerdown', (e) => {
  if (transition.enCours() || mode === 'visionneuse' || entreeEnCours) return;
  viser(e);
  if (mode === 'piece') {
    const touche = rayon.intersectObjects(piece.cliquables, false)[0];
    if (touche) regarder(touche.object.userData.element);
    return;
  }
  // Clic sur un bâtiment : le perso va jusqu'à sa porte (il entrera tout seul en la touchant).
  const touche = rayon.intersectObjects(ville.cliquables, false)[0];
  if (touche) {
    const porte = ville.portes.find((p) => p.lieu === touche.object.userData.lieu);
    if (porteDesarmee === porte) porteDesarmee = null; // on veut y retourner : la porte se réactive
    joueur.allerVers(porte.x, porte.z);
    return;
  }
  const auSol = rayon.intersectObject(ville.sol)[0];
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
const AUCUNE = new THREE.Vector3();
let images = 0, chrono = 0;

function boucle() {
  // Fenêtre réduite ou onglet pas encore affiché : rien à dessiner, on attend l'image suivante.
  if (innerWidth === 0 || innerHeight === 0) { requestAnimationFrame(boucle); return; }
  const dt = Math.min(horloge.getDelta(), 0.05);

  if (mode === 'ville') {
    let direction = AUCUNE;
    if (entreeEnCours) {
      // Le perso avance dans l'encadrement de la porte
      joueur.position.x += entreeEnCours.dx * 1.6 * dt;
      joueur.position.z += entreeEnCours.dz * 1.6 * dt;
    } else {
      direction = joueur.mettreAJour(dt, transition.enCours() ? immobile : touches);
      // Entrée automatique dès que le perso touche une porte
      for (const porte of ville.portes) {
        const d = Math.hypot(porte.x - joueur.position.x, porte.z - joueur.position.z);
        if (porte === porteDesarmee) { if (d > 1.4) porteDesarmee = null; continue; }
        if (d < DISTANCE_PORTE && !transition.enCours()) { entrer(porte); break; }
      }
    }
    cam.suivre(joueur.position, direction, dt);
    lumieres.suivre(cam.cible);
    post.definirMiseAuPoint(cam.profondeurDe(joueur.position)); // le perso est toujours net
    ville.animer(horloge.elapsedTime);
  } else {
    tempsDansPiece += dt;
    piece.animer(tempsDansPiece, dt, cadrage, horloge.elapsedTime);
    cam.suivre(joueur.position, AUCUNE, dt, true);
    post.definirMiseAuPoint(cam.profondeurDe(piece.centreTableau)); // le tableau est net, le perso flou
  }
  post.rendre();

  // Compteur d'images par seconde, mis à jour deux fois par seconde
  images++; chrono += dt;
  if (chrono >= 0.5) {
    compteur.textContent = `${Math.round(images / chrono)} i/s`;
    images = 0; chrono = 0;
  }
  requestAnimationFrame(boucle);
}

cam.suivre(joueur.position, AUCUNE, 0, true); // place la caméra directement, sans glissement au démarrage
boucle();
setTimeout(() => hud.notifier('Bienvenue.<br>Chaque bâtiment est une section : marche jusqu\'à sa porte.'), 500);

// Le panneau de réglages n'est chargé qu'en développement (ou avec ?reglages dans l'adresse).
if (import.meta.env.DEV || new URLSearchParams(location.search).has('reglages')) {
  compteur.classList.remove('cache');
  import('./ui/panneauReglages.js').then((m) => m.creerPanneau(REGLAGES, toutAppliquer));
}

// Accès depuis la console du navigateur, pratique pour déboguer.
window.__portfolio = { REGLAGES, toutAppliquer, joueur, cam, rendu, post, ville, entrer, sortir, regarder, etat: () => ({ mode, piece, tempsDansPiece }) };
