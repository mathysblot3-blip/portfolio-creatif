// =====================================================================
// VUE INTÉRIEURE D'UN LIEU
// Une pièce vue de face : sol, murs, et au fond le mur qui porte le contenu du lieu
// (lu dans contenu/<lieu>.md). Le perso s'y promène et regarde les éléments un par un.
// Chaque lieu a son ambiance : école, entreprise, banque, salle de concert, atelier, colisée.
// =====================================================================
import * as THREE from 'three';
import { TEX, nuance } from '../engine/textures.js';
import { planDense, boiteDense } from '../world/formes.js';
import { creerCollisions } from '../world/collisions.js';
import { creerNavigation } from '../world/chemin.js';
import { lireContenu } from '../contenu/lecteur.js';
import { creerElementMural, creerObjetDecor, disposer } from './elementsMur.js';

export const LARGEUR = 16, PROFONDEUR = 9, HAUTEUR = 6.2;
const Z_MUR = -PROFONDEUR / 2;

// Cadrage de la caméra dans les pièces : fixe, face au mur, elle suit seulement un peu le perso de côté.
export const CAMERA_INTERIEUR = { fov: 26, y: 7, z: 19, visee: 14, suiviX: 0.25 };

// Ambiance de chaque pièce : matières du mur, du soubassement et du sol, couleur des lumières.
const STYLES = {
  ecole:      { mur: () => TEX.enduit('#e3c389'), bas: () => TEX.parquet('#6b4630'), sol: () => TEX.parquet('#96683f'), lampe: '#ffd7a0' },
  entreprise: { mur: () => TEX.enduit('#dcd6c8'), bas: () => TEX.enduit('#4a3f52'), sol: () => TEX.damier('#b9ab9f', '#7d7080'), lampe: '#fff1d8' },
  banque:     { mur: () => TEX.pierreTaillee('#e3c389', 51), bas: () => TEX.pierreTaillee('#24503a', 52), sol: () => TEX.damier('#f4ecd8', '#24503a'), lampe: '#ffe2a8' },
  concert:    { mur: () => TEX.brique('#4a3f52', 53), bas: () => TEX.enduit('#14101a'), sol: () => TEX.parquet('#4a2e20'), lampe: '#f08a9c' },
  atelier:    { mur: () => TEX.rayures('#fbe6cc', '#f08a9c'), bas: () => TEX.parquet('#6b4630'), sol: () => TEX.parquet('#c0935a'), lampe: '#ffd7a0' },
  colisee:    { mur: () => TEX.arcades('#c0935a'), bas: () => TEX.pierreTaillee('#96683f', 54), sol: () => TEX.sable(), lampe: '#ff9a40' },
};

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, ...options });

export function construirePiece(lieu) {
  const style = STYLES[lieu.cle] ?? STYLES.ecole;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#14101a');

  const ajouter = (forme, materiau, x, y, z, ombre = true) => {
    const objet = new THREE.Mesh(forme, materiau);
    objet.position.set(x, y, z);
    objet.castShadow = ombre;
    objet.receiveShadow = true;
    scene.add(objet);
    return objet;
  };

  // ---------- Murs et sol ----------
  const sol = ajouter(planDense(LARGEUR, PROFONDEUR + 2), mat({ map: style.sol() }), 0, 0, 1, false);
  sol.rotation.x = -Math.PI / 2;
  const murTex = mat({ map: style.mur() });
  ajouter(planDense(LARGEUR, HAUTEUR), murTex, 0, HAUTEUR / 2, Z_MUR, false);                    // mur du fond
  [-1, 1].forEach((cote) => {                                                                    // murs de côté
    const mur = ajouter(planDense(PROFONDEUR + 2, HAUTEUR), murTex, cote * LARGEUR / 2, HAUTEUR / 2, 1, false);
    mur.rotation.y = -cote * Math.PI / 2;
  });
  ajouter(boiteDense(LARGEUR, 1.0, 0.12), mat({ map: style.bas() }), 0, 0.5, Z_MUR + 0.06);      // soubassement
  ajouter(new THREE.BoxGeometry(LARGEUR, 0.25, 0.3), mat({ color: nuance(lieu.accent, 0.45) }), 0, HAUTEUR - 0.12, Z_MUR + 0.15); // corniche
  ajouter(new THREE.BoxGeometry(LARGEUR, 0.08, 0.16), mat({ color: nuance(lieu.accent, 0.7) }), 0, 1.04, Z_MUR + 0.14);           // cimaise

  // Tapis de sortie, à l'avant de la pièce
  const sortie = { x: 0, z: PROFONDEUR / 2 - 0.4 };
  const tapis = ajouter(new THREE.PlaneGeometry(2.6, 1.4), mat({ color: nuance(lieu.accent, 0.6) }), sortie.x, 0.015, sortie.z, false);
  tapis.rotation.x = -Math.PI / 2;

  // ---------- Lumières ----------
  scene.add(new THREE.HemisphereLight('#fff1d8', '#4a2e20', 0.8));
  const principale = new THREE.DirectionalLight('#ffe2b8', 2.0);
  principale.position.set(-5, 14, 9);
  principale.target.position.set(0, 0, -2);
  principale.castShadow = true;
  principale.shadow.mapSize.set(2048, 2048);
  Object.assign(principale.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
  principale.shadow.bias = -0.0004;
  principale.shadow.normalBias = 0.03;
  scene.add(principale, principale.target);

  const lumieresAnimees = []; // torches qui vacillent
  const appliques = lieu.cle === 'concert' ? ['#e0507a', '#4c8cc8'] : [style.lampe, style.lampe];
  [-1, 1].forEach((cote, i) => {
    const x = cote * (LARGEUR / 2 - 0.9);
    ajouter(new THREE.BoxGeometry(0.3, 0.42, 0.22), new THREE.MeshStandardMaterial({ color: appliques[i], emissive: appliques[i], emissiveIntensity: 1.2 }), x, 3.9, Z_MUR + 0.15, false);
    const lumiere = new THREE.PointLight(appliques[i], lieu.cle === 'concert' ? 12 : 5, 10, 2);
    lumiere.position.set(x, 3.9, Z_MUR + 0.8);
    scene.add(lumiere);
    if (lieu.cle === 'colisee') lumieresAnimees.push({ lumiere, base: 5, phase: i * 2.1 });
  });

  // ---------- Accessoires propres à chaque lieu ----------
  if (lieu.cle === 'banque') {
    [-1, 1].forEach((cote) => ajouter(new THREE.CylinderGeometry(0.35, 0.42, HAUTEUR - 0.3, 12), mat({ map: TEX.pierre() }), cote * (LARGEUR / 2 - 0.45), (HAUTEUR - 0.3) / 2, Z_MUR + 0.45));
  }
  if (lieu.cle === 'concert') {
    ajouter(boiteDense(LARGEUR, 0.18, 1.0), mat({ map: TEX.parquet('#2a1a14') }), 0, 0.09, Z_MUR + 0.5); // bord de scène
  }

  // ---------- Contenu ----------
  const { elements } = lireContenu(lieu.cle);
  const preuves = elements.filter((e) => e.role === 'preuve');
  const decor = elements.filter((e) => e.role === 'deco');
  const collisions = creerCollisions({ xMin: -LARGEUR / 2 + 0.7, xMax: LARGEUR / 2 - 0.7, zMin: Z_MUR + 0.95, zMax: PROFONDEUR / 2 - 0.2 });

  // Objets de décor posés au sol, le long des murs de côté
  decor.forEach((element, i) => {
    const cote = i % 2 ? 1 : -1, rang = Math.floor(i / 2);
    const x = cote * (LARGEUR / 2 - 1.3), z = Z_MUR + 1.3 + rang * 2.4;
    const objet = creerObjetDecor(element);
    objet.position.set(x, 0, z);
    scene.add(objet);
    collisions.ajouterCercle(x, z, 0.55);
  });

  // Éléments de preuve accrochés au mur du fond, disposés automatiquement
  const largeurMur = LARGEUR - (decor.length ? 5.2 : 2.4);
  const fabriques = preuves.map((element) => ({ element, ...creerElementMural(element, lieu.accent) }));
  const positions = disposer(fabriques, largeurMur, 1.35, HAUTEUR - 0.45);
  const cliquables = [];
  const accroches = fabriques.map((f, i) => {
    const { x, y, echelle } = positions[i];
    f.groupe.position.set(x, y, Z_MUR + 0.12);
    f.groupe.scale.setScalar(echelle);
    scene.add(f.groupe);
    cliquables.push(...f.cliquables);
    return { element: f.element, index: i, x, y, demiLargeur: (f.largeur * echelle) / 2 };
  });

  // Élément le plus proche du perso, quand il se tient près du mur
  function elementProche(position) {
    if (position.z > Z_MUR + 3.2) return null;
    let meilleur = null, ecart = Infinity;
    for (const a of accroches) {
      const d = Math.abs(a.x - position.x) - a.demiLargeur;
      if (d < 0.5 && d < ecart) { ecart = d; meilleur = a; }
    }
    return meilleur;
  }

  // Point où le perso se place pour regarder un élément
  const pointDeVue = (accroche) => ({ x: THREE.MathUtils.clamp(accroche.x, collisions.limites.xMin, collisions.limites.xMax), z: Z_MUR + 1.3 });

  const navigation = creerNavigation(collisions);

  function animer(temps) {
    lumieresAnimees.forEach((l) => { l.lumiere.intensity = l.base * (0.85 + 0.15 * Math.sin(temps * 9 + l.phase) * Math.sin(temps * 5.3 + l.phase)); });
  }

  return {
    lieu, scene, sol, collisions, navigation, cliquables, animer,
    preuves, accroches, elementProche, pointDeVue,
    entree: { x: 0, z: PROFONDEUR / 2 - 2.3 }, sortie,
  };
}
