// =====================================================================
// LA VILLE
// Assemble toute la ville : sol, place, fontaine, les lieux de places.json,
// lampadaires, arbres et décor du premier plan. Enregistre aussi les obstacles.
// Pour ajouter ou retirer un lieu, il suffit de modifier src/data/places.json.
// =====================================================================
import * as THREE from 'three';
import LIEUX from '../data/places.json';
import { TEX, textureCiel } from '../engine/textures.js';
import { textureAsset, textureOu, infoAsset, decouperPlanche } from '../engine/assets.js';
import { jetProvisoire, maisonsFondProvisoires, tourFondProvisoire } from './decorProvisoire.js';
import { creerLutin } from '../actors/lutin.js';
import { boiteDense, planDense, solOvale } from './formes.js';
import { creerBatiment } from './batiment.js';
import { creerCollisions } from './collisions.js';

// Arbre ou buisson en image (asset "vegetation/..."), posé debout comme le perso et éclairé comme lui.
// Renvoie null si l'image n'existe pas encore : la ville garde alors les volumes provisoires.
function vegetationImage(id) {
  const texture = textureAsset(id);
  if (!texture) return null;
  const [l, h] = infoAsset(id).taille;
  return (scene, x, z, taille) => {
    const lutin = creerLutin(texture, l, h);
    lutin.position.set(x, 0, z);
    lutin.scale.setScalar(taille);
    scene.add(lutin);
  };
}

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...options });
const enRadians = (degres) => (degres * Math.PI) / 180;

export function construireVille(scene) {
  // Zone où le perso peut marcher
  const limites = { xMin: -24, xMax: 24, zMin: -7, zMax: 9.5 };
  const collisions = creerCollisions(limites);
  const cliquables = [];
  const portes = [];     // { lieu, x, z, retour } : point où l'on touche la porte, et point où l'on réapparaît en sortant
  const drapeaux = [];   // tissus qui flottent au vent

  const ajouter = (forme, materiau, x, y, z, ombre = true) => {
    const objet = new THREE.Mesh(forme, materiau);
    objet.position.set(x, y, z);
    objet.castShadow = ombre;
    objet.receiveShadow = true;
    scene.add(objet);
    return objet;
  };

  scene.background = textureCiel();

  // ---------- Sol : herbe partout, grande place pavée ovale ----------
  const sol = ajouter(planDense(260, 200), mat({ map: textureOu('sol/herbe', TEX.herbe, { repetable: true }) }), 0, 0, -20, false);
  sol.rotation.x = -Math.PI / 2;
  ajouter(solOvale(30, 15), mat({ map: textureOu('sol/paves', TEX.paves, { repetable: true }) }), 0, 0.02, 1, false);

  // ---------- Les lieux ----------
  LIEUX.forEach((lieu, index) => {
    const batiment = creerBatiment(lieu, index);
    const angle = enRadians(lieu.rotation);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    batiment.groupe.position.set(lieu.x, 0, lieu.z);
    batiment.groupe.rotation.y = angle;
    scene.add(batiment.groupe);

    // Passe un point du repère du bâtiment au repère du monde.
    const versMonde = (x, z) => ({ x: lieu.x + x * cos + z * sin, z: lieu.z - x * sin + z * cos });

    if (lieu.forme === 'ronde') collisions.ajouterCercle(lieu.x, lieu.z, lieu.largeur / 2 + 0.2);
    else collisions.ajouterRectangle(lieu.x, lieu.z, lieu.largeur + 0.3, lieu.profondeur + 0.3, angle);
    batiment.obstacles.forEach((o) => { const m = versMonde(o.x, o.z); collisions.ajouterCercle(m.x, m.z, o.r); });
    portes.push({ lieu, ...versMonde(batiment.porte.x, batiment.porte.z), retour: versMonde(batiment.retour.x, batiment.retour.z) });
    cliquables.push(...batiment.cliquables);
    batiment.groupe.traverse((o) => { if (o.userData.flotte) drapeaux.push(o); });
  });

  // ---------- Fontaine centrale ----------
  const pierreTex = textureOu('materiau/pierre', TEX.pierre, { repetable: true }); pierreTex.repeat.set(6, 1);
  const pierre = mat({ map: pierreTex });
  const xF = 0, zF = 2.5;
  ajouter(new THREE.CylinderGeometry(2.3, 2.5, 0.7, 20), pierre, xF, 0.35, zF);
  // Surface de l'eau : animation générée (anime/eau, 4 images en grille 2 × 2) si elle existe, sinon texture qui glisse.
  const imagesEau = decouperPlanche('anime/eau')?.flat() ?? null;
  const eau = ajouter(new THREE.CylinderGeometry(2.0, 2.0, 0.05, 20), mat({ map: imagesEau ? imagesEau[0] : TEX.eau(), emissive: '#24366e', emissiveIntensity: 0.3, roughness: 0.3 }), xF, 0.68, zF, false);
  if (!imagesEau) eau.material.map.repeat.set(2, 2);
  ajouter(new THREE.CylinderGeometry(0.32, 0.5, 2.0, 10), pierre, xF, 1.4, zF);
  ajouter(new THREE.CylinderGeometry(1.0, 0.5, 0.3, 14), pierre, xF, 2.4, zF);
  ajouter(new THREE.CylinderGeometry(0.16, 0.24, 0.8, 8), pierre, xF, 2.9, zF);
  collisions.ajouterCercle(xF, zF, 2.6);
  const fontaine = { x: xF, z: zF };

  // Jet d'eau animé, posé dans la vasque du haut (anime/jet, 4 images, sinon dessiné par le code)
  const imagesJet = decouperPlanche('anime/jet')?.flat() ?? jetProvisoire();
  const [lJet, hJet] = infoAsset('anime/jet').case;
  const jet = creerLutin(imagesJet[0], lJet, hJet);
  jet.position.set(xF, 2.5, zF + 0.05);
  jet.castShadow = false;
  jet.material.emissive = new THREE.Color('#24366e'); // l'eau garde un peu d'éclat même à l'ombre
  scene.add(jet);

  // ---------- Arrière-plan : maisons et tour aperçues entre les bâtiments ----------
  const maisons = [textureAsset('fond/maisons-a'), textureAsset('fond/maisons-b')];
  const maisonsProvisoires = maisonsFondProvisoires();
  const [lM, hM] = infoAsset('fond/maisons-a').taille;
  // x, z, variante (0 ou 1), retournée en miroir, échelle
  [[-20.5, -13, 0, false, 1], [-10.5, -14.5, 1, true, 1.1], [0.2, -15, 0, true, 1.15], [11, -14.5, 1, false, 1.1], [20.5, -13, 0, false, 1]].forEach(([x, z, v, miroir, e]) => {
    const fond = creerLutin(maisons[v] ?? maisonsProvisoires[v], lM, hM);
    fond.position.set(x, 0, z);
    fond.scale.set(miroir ? -e : e, e, e);
    scene.add(fond);
  });
  const [lT, hT] = infoAsset('fond/tour').taille;
  const tour = creerLutin(textureAsset('fond/tour') ?? tourFondProvisoire(), lT, hT);
  tour.position.set(-4.5, 0, -19);
  tour.scale.setScalar(1.2);
  scene.add(tour);

  // ---------- Lampadaires (seules vraies sources de lumière, sans ombre pour rester fluide) ----------
  const fer = mat({ color: '#2b2433' });
  const verre = new THREE.MeshStandardMaterial({ color: '#f8dc78', emissive: '#f0c040', emissiveIntensity: 2.2 });
  [[-9.5, -1], [9.5, -1], [-13, 7], [13, 7]].forEach(([x, z]) => {
    ajouter(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 8), fer, x, 0.25, z);
    ajouter(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 6), fer, x, 1.5, z);
    ajouter(new THREE.BoxGeometry(0.36, 0.46, 0.36), verre, x, 3.2, z, false);
    const lumiere = new THREE.PointLight('#f0c040', 7, 10, 2);
    lumiere.position.set(x, 3.2, z);
    scene.add(lumiere);
    collisions.ajouterCercle(x, z, 0.25);
  });

  // ---------- Arbres (volumes provisoires, à remplacer par des sprites) ----------
  const tronc = mat({ color: '#4a2e20' });
  const feuillages = { cypres: mat({ map: TEX.feuillage(), color: '#8fb08a' }), automne: mat({ map: TEX.feuillage(), color: '#f0a050' }) };
  const images = { cypres: vegetationImage('vegetation/cypres'), feuillu: vegetationImage('vegetation/feuillu'), buisson: vegetationImage('vegetation/buisson') };
  const cypres = (x, z, taille = 1) => {
    collisions.ajouterCercle(x, z, 0.5 * taille);
    if (images.cypres) return images.cypres(scene, x, z, taille);
    ajouter(new THREE.CylinderGeometry(0.16 * taille, 0.24 * taille, 1.0 * taille, 6), tronc, x, 0.5 * taille, z);
    ajouter(new THREE.ConeGeometry(1.0 * taille, 5.2 * taille, 7), feuillages.cypres, x, 3.4 * taille, z);
  };
  const feuillu = (x, z, taille = 1) => {
    collisions.ajouterCercle(x, z, 0.5 * taille);
    if (images.feuillu) return images.feuillu(scene, x, z, taille);
    ajouter(new THREE.CylinderGeometry(0.22 * taille, 0.32 * taille, 2.2 * taille, 6), tronc, x, 1.1 * taille, z);
    ajouter(new THREE.IcosahedronGeometry(1.7 * taille, 0), feuillages.automne, x, 3.3 * taille, z);
    ajouter(new THREE.IcosahedronGeometry(1.2 * taille, 0), feuillages.automne, x + 0.9 * taille, 2.7 * taille, z + 0.3);
  };
  // Rideau d'arbres derrière les bâtiments
  for (let x = -44; x <= 44; x += 4) cypres(x + Math.sin(x) * 1.2, -18 + Math.cos(x * 1.7) * 2.5, 1.3 + Math.abs(Math.sin(x * 3)) * 0.6);
  for (let x = -60; x <= 60; x += 6) cypres(x + Math.cos(x) * 2, -29 + Math.sin(x * 1.3) * 4, 1.9);
  // Sur les côtés et sur la place
  [[-30, 4], [-29, 9], [30, 5], [29, 10], [-33, -1], [33, 0]].forEach(([x, z]) => cypres(x, z, 1.5));
  feuillu(-28.5, -6, 1.3);
  feuillu(29, -5.5, 1.2);

  // ---------- Premier plan : muret, pots et buissons, volontairement flous à l'écran ----------
  const pierreMuret = textureOu('materiau/pierre', TEX.pierre, { repetable: true }); pierreMuret.repeat.set(2, 2);
  const muret = mat({ map: pierreMuret });
  for (let x = -26; x <= 26; x += 4) {
    if (Math.abs(x) < 3) continue; // ouverture au centre, comme une entrée de la place
    ajouter(boiteDense(0.7, 1.3, 0.7), muret, x, 0.65, 11.4);
    ajouter(boiteDense(0.9, 0.2, 0.9), muret, x, 1.4, 11.4);
    if (x < 26 && Math.abs(x + 2) >= 3) ajouter(boiteDense(3.3, 0.7, 0.35), muret, x + 2, 0.45, 11.4);
  }
  const bois = textureOu('materiau/bois', TEX.bois, { repetable: true }); bois.repeat.set(2, 2);
  [[-7, 13.2], [-6.1, 13.8], [9, 13.5]].forEach(([x, z]) => ajouter(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 10), mat({ map: bois }), x, 0.55, z));
  ajouter(boiteDense(1.3, 1.3, 1.3), mat({ map: bois }), 10.4, 0.65, 14.2);
  // Buissons bas : ils habillent le bas de l'écran sans jamais cacher le perso
  [[-15, 13.6, 1.0], [-13.4, 14.4, 0.8], [15.5, 14, 1.1], [17, 13.4, 0.8], [24, 14, 1.2], [-24, 14.2, 1.1], [1.5, 15.5, 0.9]].forEach(([x, z, t]) => {
    if (images.buisson) images.buisson(scene, x, z, t);
    else ajouter(new THREE.IcosahedronGeometry(1.1 * t, 1), feuillages.cypres, x, 0.7 * t, z);
  });

  // ---------- Poussière dorée en suspension ----------
  const N = 220, positions = new Float32Array(N * 3), phases = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = 0.5 + Math.random() * 7;
    positions[i * 3 + 2] = -12 + Math.random() * 26;
    phases[i] = Math.random() * 100;
  }
  const nuage = new THREE.BufferGeometry();
  nuage.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(nuage, new THREE.PointsMaterial({
    color: '#fff4b8', size: 0.09, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  // Appelée à chaque image : poussière qui flotte, eau qui glisse.
  function animer(temps) {
    for (let i = 0; i < N; i++) {
      positions[i * 3 + 1] += Math.sin(temps * 0.8 + phases[i]) * 0.004;
      positions[i * 3] += Math.cos(temps * 0.5 + phases[i]) * 0.003;
    }
    nuage.attributes.position.needsUpdate = true;
    // Eau et jet : on change d'image toutes les 0,12 s (animation image par image, comme un dessin animé)
    const image = Math.floor(temps / 0.12) % 4;
    if (imagesEau) eau.material.map = imagesEau[image];
    else eau.material.map.offset.set(temps * 0.03, temps * 0.02);
    jet.userData.afficher(imagesJet[image]);
    drapeaux.forEach((d, i) => { d.rotation.y = Math.sin(temps * 2.4 + i) * 0.35; });
  }

  return { lieux: LIEUX, collisions, limites, cliquables, portes, sol, fontaine, animer };
}
