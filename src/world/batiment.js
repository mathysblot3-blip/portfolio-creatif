// =====================================================================
// BÂTIMENTS
// Construit un bâtiment à partir d'une entrée de places.json.
// Tout est décrit dans le repère du bâtiment : le sol est à y = 0, la façade regarde vers +z.
// La ville se charge ensuite de le placer et de le tourner.
//
// Aucun nom n'est écrit sur les bâtiments : on reconnaît chaque lieu à son allure
// (clocher de l'école, colonnes et pièce d'or de la banque, néon de la salle de concert...)
// et à l'écu suspendu qui porte son pictogramme.
// Les textures dessinées par code sont provisoires. Quand un asset existe dans assets/ia/
// (voir assets/assets.json), il les remplace automatiquement :
//   facade/<lieu>   image du mur de façade, posée devant le volume. Les détails plats dessinés
//                   par le code (porte, fenêtres, volets, horloge, affiches, vitrine) sont alors masqués,
//                   les volumes en relief (clocher, colonnes, auvent, enceintes, écu...) restent.
//   mur/<style>, toit/tuiles   textures neutres, colorées par les couleurs de places.json
//   materiau/pierre, materiau/bois
// =====================================================================
import * as THREE from 'three';
import { TEX, nuance } from '../engine/textures.js';
import { textureAsset, textureOu } from '../engine/assets.js';
import { PICTO_DU_LIEU } from '../engine/pictos.js';
import { boiteDense, toitDeuxPans, UNITES_PAR_TUILE } from './formes.js';

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...options });

// Les trois styles de mur disponibles dans places.json, et l'asset neutre qui peut les remplacer
const MURS = { colombage: TEX.mur, pierre: TEX.pierreTaillee, brique: TEX.brique };
const MURS_ASSET = { colombage: 'mur/colombage', pierre: 'mur/pierre' };

// Matériau "teinté" : l'asset neutre coloré par la couleur du lieu, sinon la texture provisoire déjà colorée.
function matTeinte(idAsset, couleur, provisoire) {
  const asset = idAsset ? textureAsset(idAsset, { repetable: true }) : null;
  return asset ? { map: asset, color: couleur } : { map: provisoire() };
}

// Distance entre la façade et le point où le perso "touche" la porte (il entre alors tout seul).
export const AVANCE_PORTE = 0.65;

// Matériaux communs à tous les bâtiments, créés une seule fois.
let commun = null;
function materiauxCommuns() {
  if (commun) return commun;
  const pierre = textureOu('materiau/pierre', TEX.pierre, { repetable: true }); pierre.repeat.set(2, 2);
  const bois = textureOu('materiau/bois', TEX.bois, { repetable: true }); bois.repeat.set(2, 2);
  commun = {
    pierre: mat({ map: pierre }),
    bois: mat({ map: bois }),
    fer: mat({ color: '#2b2433' }),
    or: mat({ color: '#f0c040', roughness: 0.35, metalness: 0.6 }),
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
  const picto = PICTO_DU_LIEU[lieu.cle] ?? 'livre';
  const rond = lieu.forme === 'ronde';
  const imageFacade = rond ? null : textureAsset(`facade/${lieu.cle}`);

  // detail = true : élément plat dessiné sur la façade, masqué quand l'image de façade existe.
  const poser = (forme, materiau, x, y, z, { ombre = true, clic = true, detail = false } = {}) => {
    const objet = new THREE.Mesh(forme, materiau);
    objet.position.set(x, y, z);
    objet.castShadow = ombre;
    objet.receiveShadow = true;
    groupe.add(objet);
    if (detail && imageFacade) { objet.visible = false; return objet; }
    // Tout le bâtiment est cliquable : un clic y envoie le perso, qui entre en touchant la porte.
    if (clic) { objet.userData.lieu = lieu; cliquables.push(objet); }
    return objet;
  };
  const facade = p / 2; // position de la façade le long de l'axe z

  // ---------- Volume principal ----------
  const toit = mat(matTeinte('toit/tuiles', lieu.toit, () => TEX.toit(lieu.toit, 40 + index)));
  toit.map.repeat.set(1 / UNITES_PAR_TUILE, 1 / UNITES_PAR_TUILE);
  let mur;

  if (rond) {
    // Arène circulaire ouverte vers le ciel : façade à arcades, gradins et sable à l'intérieur.
    const r = l / 2, tour = 2 * Math.PI * r;
    const travee = textureAsset('facade/colisee', { repetable: true });
    const arcades = travee ?? TEX.arcades(lieu.mur);
    // L'asset est une travée sur toute la hauteur, répétée 7 fois ; la texture provisoire fait 2,2 × 2,6 unités.
    if (travee) arcades.repeat.set(7, 1); else arcades.repeat.set(Math.round(tour / 2.2), h / 2.6);
    mur = mat({ map: arcades, side: THREE.DoubleSide });
    poser(new THREE.CylinderGeometry(r + 0.2, r + 0.25, 0.5, 32), M.pierre, 0, 0.25, 0);
    poser(new THREE.CylinderGeometry(r, r, h, 32, 1, true), mur, 0, h / 2, 0);
    poser(new THREE.CylinderGeometry(r + 0.15, r + 0.15, 0.3, 32, 1, true), M.pierre, 0, h, 0);
    poser(new THREE.CylinderGeometry(r - 0.7, r - 0.2, 2.2, 32, 1, true), mat({ color: nuance(lieu.mur, 0.6), side: THREE.DoubleSide }), 0, 1.1, 0); // gradins
    const sable = poser(new THREE.CircleGeometry(r - 0.6, 32), mat({ map: TEX.sable() }), 0, 0.3, 0, { ombre: false });
    sable.rotation.x = -Math.PI / 2;
  } else {
    mur = mat(matTeinte(MURS_ASSET[lieu.style], lieu.mur, () => MURS[lieu.style](lieu.mur, 20 + index)));
    poser(boiteDense(l + 0.3, 0.5, p + 0.3), M.pierre, 0, 0.25, 0);     // soubassement en pierre
    poser(boiteDense(l, h, p), mur, 0, h / 2, 0);
    // Image de façade : posée juste devant le soubassement, elle couvre tout le mur avant.
    if (imageFacade) poser(new THREE.PlaneGeometry(l, h), mat({ map: imageFacade }), 0, h / 2, facade + 0.16, { ombre: false });
    if (lieu.fronton) {
      // Toit tourné d'un quart de tour : le triangle (fronton) est en façade et déborde au-dessus des colonnes.
      const fronton = poser(toitDeuxPans(p + 2.2, l, 2.4), [M.pierre, toit], 0, h, 1.1);
      fronton.rotation.y = Math.PI / 2;
    } else {
      poser(toitDeuxPans(l, p, 2.8), [mur, toit], 0, h, 0);
    }
  }

  // ---------- Porte, linteau, lanterne ----------
  poser(new THREE.PlaneGeometry(1.75, 2.35), M.pierre, 0, 1.175, facade + 0.015, { ombre: false, detail: true });
  poser(new THREE.PlaneGeometry(1.25, 2), M.porte, 0, 1, facade + 0.03, { ombre: false, detail: true });
  poser(boiteDense(2.2, 0.16, 0.7), M.pierre, 0, 0.08, facade + 0.35);
  poser(boiteDense(2.1, 0.3, 0.2), M.pierre, 0, 2.5, facade + 0.08, { detail: true });     // linteau sculpté
  poser(new THREE.BoxGeometry(0.26, 0.34, 0.2), M.lampe, -1.3, 2.25, facade + 0.3, { ombre: false });

  // ---------- Écu suspendu à une potence, avec le pictogramme du lieu ----------
  const xEcu = rond ? 1.9 : l / 2 - 0.7;
  poser(new THREE.BoxGeometry(0.08, 0.08, 1.1), M.fer, xEcu, 4.0, facade + 0.55);
  const ecu = poser(new THREE.PlaneGeometry(1.15, 1.44), mat({ map: TEX.blason(lieu.accent, picto), alphaTest: 0.5, side: THREE.DoubleSide }), xEcu, 3.2, facade + 0.95);
  ecu.rotation.y = 0.35; // légèrement tourné vers la place, comme une enseigne qu'on voit de biais

  // ---------- Fenêtres et volets ----------
  const volet = mat({ color: nuance(lieu.accent, 0.55) });
  const fenetre = (x, y) => {
    poser(new THREE.PlaneGeometry(1, 1.25), M.fenetre, x, y, facade + 0.02, { ombre: false, detail: true });
    poser(new THREE.BoxGeometry(1.2, 0.1, 0.18), M.pierre, x, y - 0.68, facade + 0.08, { detail: true });
    [-1, 1].forEach((cote) => poser(new THREE.BoxGeometry(0.38, 1.25, 0.06), volet, x + cote * 0.72, y, facade + 0.03, { detail: true }));
  };
  const xCote = l / 2 - 1.7;
  if (!rond && lieu.signature !== 'atelier') fenetre(-xCote, 1.85); // l'Atelier a une vitrine à cet endroit
  if (!rond && lieu.signature !== 'concert') fenetre(xCote, 1.85);  // la salle de concert a des affiches
  if (!rond && h >= 5.2) {
    const nombre = l >= 8 ? 4 : 3;
    for (let i = 0; i < nombre; i++) fenetre((i - (nombre - 1) / 2) * ((l - 2.4) / (nombre - 1)), 4.45);
  }

  // ---------- Petits objets ----------
  const caisse = (x, z, taille = 0.9) => {
    poser(boiteDense(taille, taille, taille), M.bois, x, taille / 2, z);
    obstacles.push({ x, z, r: taille * 0.62 });
  };

  // ---------- Ce qui rend chaque lieu reconnaissable ----------
  if (lieu.signature === 'ecole') {
    // Clocher sur le toit, cloche dorée, grande horloge, pilastres, drapeau
    const yToit = h + 2.2;
    poser(boiteDense(1.3, 1.6, 1.3), M.pierre, 0, yToit + 0.8, 0);
    poser(new THREE.BoxGeometry(0.9, 0.9, 1.35), M.fer, 0, yToit + 0.95, 0, { ombre: false });              // ouverture sombre
    poser(new THREE.CylinderGeometry(0.18, 0.32, 0.45, 10), M.or, 0, yToit + 0.85, 0.3);                    // cloche
    const fleche = poser(new THREE.ConeGeometry(1.15, 1.5, 4), mat({ color: nuance(lieu.toit, 1.1) }), 0, yToit + 2.35, 0);
    fleche.rotation.y = Math.PI / 4;
    poser(new THREE.PlaneGeometry(1.5, 1.5), mat({ map: TEX.horloge(), alphaTest: 0.5 }), 0, 5.65, facade + 0.03, { ombre: false, detail: true });
    [-1, 1].forEach((cote) => poser(boiteDense(0.55, h, 0.35), M.pierre, cote * (l / 2 - 0.27), h / 2, facade + 0.1, { detail: true }));
    poser(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), M.fer, 0, yToit + 4.0, 0);
    const drapeau = poser(new THREE.PlaneGeometry(0.9, 0.55), mat({ color: lieu.accent, side: THREE.DoubleSide }), 0.47, yToit + 4.75, 0);
    drapeau.userData.flotte = true;
  }

  if (lieu.signature === 'entreprise') {
    // Maison de commerce : auvent rayé au-dessus d'un comptoir couvert de dossiers, caisses de marchandises
    const toile = poser(new THREE.PlaneGeometry(2.6, 1.7), mat({ map: TEX.auvent(nuance(lieu.accent, 0.9)), side: THREE.DoubleSide }), xCote + 0.2, 2.15, facade + 0.75);
    toile.rotation.x = -1.15;
    poser(boiteDense(2.2, 0.9, 0.7), M.bois, xCote + 0.2, 0.45, facade + 0.65);                            // comptoir
    ['#f4ecd8', '#e3c389', '#f4ecd8'].forEach((c, i) => poser(new THREE.BoxGeometry(0.5, 0.08 + i * 0.06, 0.38), mat({ color: c }), xCote - 0.5 + i * 0.6, 0.95 + i * 0.03, facade + 0.65)); // piles de dossiers
    obstacles.push({ x: xCote + 0.2, z: facade + 0.65, r: 1.0 });
    caisse(-(l / 2 - 0.9), facade + 0.7);
    caisse(-(l / 2 - 1.1), facade + 0.7 + 0.05, 0.6);
  }

  if (lieu.signature === 'banque') {
    // Quatre colonnes, un entablement, un perron et une grande pièce d'or au fronton
    [-3.7, -1.75, 1.75, 3.7].forEach((x) => {
      poser(new THREE.CylinderGeometry(0.3, 0.36, h - 0.5, 10), M.pierre, x, (h - 0.5) / 2, facade + 1.5);
      obstacles.push({ x, z: facade + 1.5, r: 0.45 });
    });
    poser(boiteDense(l + 0.2, 0.5, 2.3), M.pierre, 0, h - 0.25, facade + 1.0);
    poser(boiteDense(l, 0.1, 2.2), M.pierre, 0, 0.05, facade + 1.1);
    const piece = poser(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), M.or, 0, h + 0.85, facade + 2.25);
    piece.rotation.x = Math.PI / 2;
    poser(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 24), mat({ color: '#a8741c', metalness: 0.5, roughness: 0.4 }), 0, h + 0.85, facade + 2.27).rotation.x = Math.PI / 2;
  }

  if (lieu.signature === 'concert') {
    // Grande note de musique en néon au-dessus de la porte, affiches collées, enceintes, lumière rose
    const neon = TEX.pictoSeul('note');
    poser(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: neon, emissive: lieu.accent, emissiveMap: neon, emissiveIntensity: 4, alphaTest: 0.5, color: lieu.accent }), 0, 3.55, facade + 0.06, { ombre: false });
    [['#4c8cc8', '#f0c040'], ['#e0507a', '#14101a'], ['#9a62c4', '#a4cf62']].forEach(([fond, motif], i) => {
      const affiche = poser(new THREE.PlaneGeometry(0.75, 1.0), mat({ map: TEX.affiche(fond, motif, 60 + i) }), xCote - 0.45 + i * 0.85, 1.75 + (i % 2) * 0.15, facade + 0.025, { ombre: false, detail: true });
      affiche.rotation.z = (i - 1) * 0.06;
    });
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
    // Grande vitrine avec mannequins, bobine de fil géante, rouleaux de tissu
    const vitrine = TEX.vitrine();
    poser(new THREE.PlaneGeometry(2.4, 1.8), mat({ map: vitrine, emissive: '#ffffff', emissiveMap: vitrine, emissiveIntensity: 0.25 }), -xCote + 0.3, 1.45, facade + 0.03, { ombre: false, detail: true });
    ['#9a62c4', '#e0507a', '#4c8cc8'].forEach((couleur, i) => {
      const rouleau = poser(new THREE.CylinderGeometry(0.2, 0.2, 1.3, 8), mat({ color: couleur }), l / 2 - 1.2, 0.2 + i * 0.36, facade + 0.6 + (i % 2) * 0.12);
      rouleau.rotation.z = Math.PI / 2;
    });
    obstacles.push({ x: l / 2 - 1.2, z: facade + 0.6, r: 0.7 });
    // Bobine géante accrochée au-dessus de la porte, en guise d'enseigne
    const bobine = new THREE.Group();
    [-0.5, 0.5].forEach((y) => { const disque = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16), M.bois); disque.position.y = y; disque.castShadow = true; bobine.add(disque); });
    const fil = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), mat({ color: lieu.accent }));
    fil.castShadow = true; bobine.add(fil);
    bobine.rotation.z = Math.PI / 2;
    bobine.position.set(0, 3.35, facade + 0.45);
    bobine.traverse((o) => { if (o.isMesh) { o.userData.lieu = lieu; cliquables.push(o); } });
    groupe.add(bobine);
  }

  if (lieu.signature === 'colisee') {
    // Deux mâts portant des bannières de part et d'autre de l'entrée, et du matériel entreposé
    const banniere = mat({ map: TEX.banniere(lieu.accent), alphaTest: 0.5, side: THREE.DoubleSide });
    [-1, 1].forEach((cote) => {
      const x = cote * 2.4, z = facade + 0.4;
      poser(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 6), M.fer, x, 2.3, z);
      poser(new THREE.PlaneGeometry(0.8, 2.4), banniere, x, 3.2, z + 0.08);
      obstacles.push({ x, z, r: 0.3 });
    });
    caisse(-3.2, facade - 0.2);
    caisse(-3.6, facade - 1.2, 0.7);
  }

  // Point où le perso touche la porte (entrée automatique) et point où il réapparaît en sortant.
  const avance = lieu.signature === 'banque' ? 1.25 : AVANCE_PORTE; // la banque : derrière les colonnes
  const porte = { x: 0, z: facade + avance };
  const retour = { x: 0, z: facade + (lieu.signature === 'banque' ? 3.4 : 2.4) };
  return { groupe, cliquables, obstacles, porte, retour };
}
