// =====================================================================
// BÂTIMENTS
// Construit un bâtiment à partir d'une entrée de places.json.
// Tout est décrit dans le repère du bâtiment : le sol est à y = 0, la façade regarde vers +z.
// Le quartier se charge ensuite de le placer et de le tourner.
// Les formes et textures sont provisoires : elles seront remplacées par tes dessins.
// =====================================================================
import * as THREE from 'three';
import { TEX, nuance } from '../engine/textures.js';
import { boiteDense, toitDeuxPans, UNITES_PAR_TUILE } from './formes.js';

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...options });
const sansAccent = (texte) => texte.normalize('NFD').replace(/[̀-ͯ]/g, '');

// Les trois styles de mur disponibles dans places.json
const MURS = { colombage: TEX.mur, pierre: TEX.pierreTaillee, brique: TEX.brique };

// Matériaux communs à tous les bâtiments, créés une seule fois.
let commun = null;
function materiauxCommuns() {
  if (commun) return commun;
  const pierre = TEX.pierre(); pierre.repeat.set(2, 2);
  const bois = TEX.bois(); bois.repeat.set(2, 2);
  commun = {
    pierre: mat({ map: pierre }),
    bois: mat({ map: bois }),
    fer: mat({ color: '#2b2433' }),
    porte: mat({ map: TEX.porte() }),
    fenetre: mat({ map: TEX.fenetre() }),
    lampe: new THREE.MeshStandardMaterial({ color: '#f8dc78', emissive: '#f0c040', emissiveIntensity: 1.6 }),
  };
  return commun;
}

export function creerBatiment(lieu, index) {
  const M = materiauxCommuns();
  const { largeur: l, hauteur: h, profondeur: p } = lieu;
  const groupe = new THREE.Group();
  const cliquables = []; // surfaces sur lesquelles un clic envoie le perso vers la porte
  const obstacles = [];  // petits objets posés devant le bâtiment : { x, z, r } dans le repère du bâtiment
  const enseignes = [];  // textures à redessiner quand la police pixel est chargée

  const poser = (forme, materiau, x, y, z, { ombre = true, clic = false } = {}) => {
    const objet = new THREE.Mesh(forme, materiau);
    objet.position.set(x, y, z);
    objet.castShadow = ombre;
    objet.receiveShadow = true;
    if (clic) { objet.userData.lieu = lieu; cliquables.push(objet); }
    groupe.add(objet);
    return objet;
  };
  const facade = p / 2; // position de la façade le long de l'axe z

  // ---------- Volume principal ----------
  const mur = mat({ map: MURS[lieu.style](lieu.mur, 20 + index) });
  const tuiles = TEX.toit(lieu.toit, 40 + index);
  tuiles.repeat.set(1 / UNITES_PAR_TUILE, 1 / UNITES_PAR_TUILE);
  const toit = mat({ map: tuiles });
  poser(boiteDense(l + 0.3, 0.5, p + 0.3), M.pierre, 0, 0.25, 0);     // soubassement en pierre
  poser(boiteDense(l, h, p), mur, 0, h / 2, 0, { clic: true });

  if (lieu.fronton) {
    // Toit tourné d'un quart de tour : le triangle (fronton) est en façade et déborde au-dessus des colonnes.
    const fronton = poser(toitDeuxPans(p + 2.2, l, 2.4), [M.pierre, toit], 0, h, 1.1);
    fronton.rotation.y = Math.PI / 2;
  } else {
    poser(toitDeuxPans(l, p, 2.8), [mur, toit], 0, h, 0);
  }

  // ---------- Porte, marche, lanterne ----------
  poser(new THREE.PlaneGeometry(1.75, 2.35), M.pierre, 0, 1.175, facade + 0.015, { ombre: false, clic: true });
  poser(new THREE.PlaneGeometry(1.25, 2), M.porte, 0, 1, facade + 0.03, { ombre: false, clic: true });
  poser(boiteDense(2.2, 0.16, 0.7), M.pierre, 0, 0.08, facade + 0.35);
  poser(new THREE.BoxGeometry(0.26, 0.34, 0.2), M.lampe, -1.3, 2.25, facade + 0.12, { ombre: false });

  // ---------- Enseigne au-dessus de la porte ----------
  const texteEnseigne = TEX.enseigne(sansAccent(lieu.nom), lieu.accent);
  enseignes.push({ texture: texteEnseigne, texte: sansAccent(lieu.nom), couleur: lieu.accent });
  const faceEnseigne = mat({ map: texteEnseigne });
  // Une boîte a 6 faces : seule la face avant (la 5e) porte le texte.
  poser(new THREE.BoxGeometry(4, 0.75, 0.12), [M.bois, M.bois, M.bois, M.bois, faceEnseigne, M.bois], 0, 2.9, facade + 0.1);

  // ---------- Blason suspendu à une potence ----------
  const xBlason = l / 2 - 0.7;
  poser(new THREE.BoxGeometry(0.08, 0.08, 1.0), M.fer, xBlason, 4.0, facade + 0.5);
  poser(new THREE.PlaneGeometry(0.8, 1.0), mat({ map: TEX.blason(lieu.accent), alphaTest: 0.5, side: THREE.DoubleSide }), xBlason, 3.4, facade + 0.85);

  // ---------- Fenêtres et volets ----------
  const volet = mat({ color: nuance(lieu.accent, 0.55) });
  const fenetre = (x, y) => {
    poser(new THREE.PlaneGeometry(1, 1.25), M.fenetre, x, y, facade + 0.02, { ombre: false });
    poser(new THREE.BoxGeometry(1.2, 0.1, 0.18), M.pierre, x, y - 0.68, facade + 0.08);
    [-1, 1].forEach((cote) => poser(new THREE.BoxGeometry(0.38, 1.25, 0.06), volet, x + cote * 0.72, y, facade + 0.03));
  };
  const xCote = l / 2 - 1.7;
  if (lieu.signature !== 'atelier') fenetre(-xCote, 1.85); // l'Atelier a une vitrine à cet endroit
  fenetre(xCote, 1.85);
  if (lieu.etage !== false && h >= 5.2) {
    const nombre = l >= 8 ? 4 : 3;
    for (let i = 0; i < nombre; i++) fenetre((i - (nombre - 1) / 2) * ((l - 2.4) / (nombre - 1)), 4.45);
  }

  // ---------- Élément distinctif de chaque lieu ----------
  const tonneau = (x, z) => {
    poser(new THREE.CylinderGeometry(0.42, 0.42, 1, 10), M.bois, x, 0.5, z);
    obstacles.push({ x, z, r: 0.5 });
  };
  const caisse = (x, z, taille = 0.9) => {
    poser(boiteDense(taille, taille, taille), M.bois, x, taille / 2, z);
    obstacles.push({ x, z, r: taille * 0.62 });
  };

  if (lieu.signature === 'comptoir') {
    // Auvent rayé au-dessus d'un étal, tonneaux et caisse
    const toile = poser(new THREE.PlaneGeometry(2.6, 1.7), mat({ map: TEX.auvent(nuance(lieu.accent, 0.9)), side: THREE.DoubleSide }), xCote + 0.2, 2.15, facade + 0.75);
    toile.rotation.x = -1.15;
    tonneau(l / 2 - 0.7, facade + 0.75);
    tonneau(l / 2 - 1.6, facade + 1.0);
    caisse(l / 2 - 2.1, facade + 0.6, 0.7);
  }

  if (lieu.signature === 'academie') {
    // Horloge sous le toit et deux pilastres de pierre
    poser(new THREE.PlaneGeometry(1.4, 1.4), mat({ map: TEX.horloge(), alphaTest: 0.5 }), 0, 5.95, facade + 0.03, { ombre: false });
    [-1, 1].forEach((cote) => poser(boiteDense(0.55, h, 0.35), M.pierre, cote * (l / 2 - 0.27), h / 2, facade + 0.1));
  }

  if (lieu.signature === 'bourse') {
    // Quatre colonnes, un entablement et un perron
    [-3.7, -1.75, 1.75, 3.7].forEach((x) => {
      poser(new THREE.CylinderGeometry(0.3, 0.36, h - 0.5, 10), M.pierre, x, (h - 0.5) / 2, facade + 1.5);
      obstacles.push({ x, z: facade + 1.5, r: 0.45 });
    });
    poser(boiteDense(l + 0.2, 0.5, 2.3), M.pierre, 0, h - 0.25, facade + 1.0);
    poser(boiteDense(l, 0.1, 2.2), M.pierre, 0, 0.05, facade + 1.1);
  }

  if (lieu.signature === 'studio') {
    // Néon rose, deux enceintes et une lumière colorée
    const neon = new THREE.MeshStandardMaterial({ color: lieu.accent, emissive: lieu.accent, emissiveIntensity: 3 });
    poser(new THREE.BoxGeometry(3.4, 0.1, 0.06), neon, 0, 3.42, facade + 0.14, { ombre: false });
    const avant = mat({ map: TEX.enceinte() }), cote = mat({ color: '#14101a' });
    [-2.1, 2.1].forEach((x) => {
      poser(new THREE.BoxGeometry(0.75, 1.15, 0.6), [cote, cote, cote, cote, avant, cote], x, 0.575, facade + 0.5);
      obstacles.push({ x, z: facade + 0.5, r: 0.55 });
    });
    const lueur = new THREE.PointLight(lieu.accent, 7, 8, 2);
    lueur.position.set(0, 2.6, facade + 1.4);
    groupe.add(lueur);
  }

  if (lieu.signature === 'atelier') {
    // Grande vitrine avec mannequins et rouleaux de tissu
    const vitrine = TEX.vitrine();
    poser(new THREE.PlaneGeometry(2.4, 1.8), mat({ map: vitrine, emissive: '#ffffff', emissiveMap: vitrine, emissiveIntensity: 0.25 }), -xCote + 0.3, 1.45, facade + 0.03, { ombre: false, clic: true });
    ['#9a62c4', '#e0507a', '#4c8cc8'].forEach((couleur, i) => {
      const rouleau = poser(new THREE.CylinderGeometry(0.2, 0.2, 1.3, 8), mat({ color: couleur }), l / 2 - 1.2, 0.2 + i * 0.36, facade + 0.6 + (i % 2) * 0.12);
      rouleau.rotation.z = Math.PI / 2;
    });
    obstacles.push({ x: l / 2 - 1.2, z: facade + 0.6, r: 0.7 });
  }

  if (lieu.signature === 'arene') {
    // Deux bannières et du matériel entreposé
    const banniere = mat({ map: TEX.banniere(lieu.accent), alphaTest: 0.5, side: THREE.DoubleSide });
    [-1, 1].forEach((cote) => poser(new THREE.PlaneGeometry(0.8, 2.4), banniere, cote * (l / 2 - 0.6), h - 1.3, facade + 0.08));
    caisse(-(l / 2 - 0.8), facade + 0.75);
    caisse(-(l / 2 - 1.9), facade + 0.7, 0.7);
  }

  // Point devant la porte où le perso s'arrête pour entrer (dans le repère du bâtiment).
  const porte = { x: 0, z: facade + (lieu.porteAvance ?? 1.1) };
  return { groupe, cliquables, obstacles, enseignes, porte };
}
