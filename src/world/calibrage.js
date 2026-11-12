// =====================================================================
// SCÈNE DE CALIBRAGE (jour 1)
// Un petit décor de test, pas encore le vrai quartier. Il contient tout ce qu'il faut
// pour régler le rendu face aux captures de référence : un sol, trois façades,
// des objets au premier plan (pour juger le flou), des arbres et des collines au loin.
// =====================================================================
import * as THREE from 'three';
import { TEX, textureCiel, textureCollines } from '../engine/textures.js';

const UNITES_PAR_TUILE = 2; // une tuile de 64 px couvre 2 unités, soit 32 px par unité

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, ...options });

// Boîte dont la texture garde la même densité sur toutes les faces, quelle que soit sa taille.
function boiteDense(largeur, hauteur, profondeur) {
  const forme = new THREE.BoxGeometry(largeur, hauteur, profondeur);
  const uv = forme.attributes.uv;
  // Dimensions réelles de chaque face, dans l'ordre de three.js : droite, gauche, dessus, dessous, avant, arrière.
  const faces = [[profondeur, hauteur], [profondeur, hauteur], [largeur, profondeur], [largeur, profondeur], [largeur, hauteur], [largeur, hauteur]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i;
    uv.setXY(k, (uv.getX(k) * faces[f][0]) / UNITES_PAR_TUILE, (uv.getY(k) * faces[f][1]) / UNITES_PAR_TUILE);
  }
  return forme;
}

// Rectangle plat (sol) avec la même règle de densité.
function planDense(largeur, longueur) {
  const forme = new THREE.PlaneGeometry(largeur, longueur);
  const uv = forme.attributes.uv;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) * largeur) / UNITES_PAR_TUILE, (uv.getY(k) * longueur) / UNITES_PAR_TUILE);
  return forme;
}

// Toit à deux pans : un triangle étiré sur toute la largeur du bâtiment.
function toitDeuxPans(largeur, profondeur, hauteur) {
  const debord = 0.45, triangle = new THREE.Shape();
  triangle.moveTo(-(profondeur / 2 + debord), 0);
  triangle.lineTo(profondeur / 2 + debord, 0);
  triangle.lineTo(0, hauteur);
  triangle.closePath();
  const forme = new THREE.ExtrudeGeometry(triangle, { depth: largeur + 0.6, bevelEnabled: false });
  forme.rotateY(Math.PI / 2);
  forme.translate(-(largeur + 0.6) / 2, 0, 0);
  return forme;
}

export function construireSceneCalibrage(scene) {
  const ajouter = (forme, materiau, x, y, z, ombre = true) => {
    const objet = new THREE.Mesh(forme, materiau);
    objet.position.set(x, y, z);
    objet.castShadow = ombre;
    objet.receiveShadow = true;
    scene.add(objet);
    return objet;
  };

  scene.background = textureCiel();

  // ---------- Sol ----------
  const herbe = ajouter(planDense(300, 220), mat({ map: TEX.herbe() }), 0, 0, -30, false);
  herbe.rotation.x = -Math.PI / 2;
  const place = ajouter(planDense(44, 22), mat({ map: TEX.paves() }), 0, 0.02, 2, false);
  place.rotation.x = -Math.PI / 2;

  // ---------- Trois façades de test ----------
  const porte = TEX.porte(), fenetre = TEX.fenetre();
  const batiments = [
    { x: -11, l: 7, h: 5.0, p: 6, mur: '#e3cfa6', toit: '#6b4a2e' },
    { x: 0,   l: 8, h: 6.5, p: 6, mur: '#ece2c8', toit: '#46597e' },
    { x: 11,  l: 7, h: 5.5, p: 6, mur: '#caa27e', toit: '#8a3b3b' },
  ];
  batiments.forEach((b, i) => {
    const z = -9;
    const mur = mat({ map: TEX.mur(b.mur, 20 + i) });
    ajouter(boiteDense(b.l, b.h, b.p), mur, b.x, b.h / 2, z);
    const tuiles = TEX.toit(b.toit, 40 + i);
    tuiles.repeat.set(1 / UNITES_PAR_TUILE, 1 / UNITES_PAR_TUILE);
    // Deux matériaux : les pignons (triangles des côtés) reprennent le mur, les pans portent les tuiles.
    ajouter(toitDeuxPans(b.l, b.p, 2.4), [mur, mat({ map: tuiles })], b.x, b.h, z);
    const facade = z + b.p / 2 + 0.02;
    ajouter(new THREE.PlaneGeometry(1.25, 2), mat({ map: porte }), b.x, 1, facade, false);
    [-1, 1].forEach((cote) => {
      ajouter(new THREE.PlaneGeometry(1, 1.25), mat({ map: fenetre }), b.x + cote * (b.l / 2 - 1.3), 2.6, facade, false);
    });
  });

  // ---------- Mobilier ----------
  const bois = mat({ map: TEX.bois() });
  ajouter(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 10), bois, -4.6, 0.5, -5.2);
  ajouter(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 10), bois, -3.8, 0.5, -4.6);
  ajouter(boiteDense(0.9, 0.9, 0.9), bois, 5.2, 0.45, -5.0);

  // Lanterne : un poteau, un bloc lumineux et une lumière ponctuelle chaude (sans ombre, pour rester fluide).
  const lanterne = (x, z) => {
    ajouter(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), mat({ color: '#2a2230' }), x, 1.3, z);
    const verre = new THREE.MeshStandardMaterial({ color: '#ffcf7a', emissive: '#ffb347', emissiveIntensity: 2.2 });
    ajouter(new THREE.BoxGeometry(0.32, 0.4, 0.32), verre, x, 2.75, z, false);
    const lumiere = new THREE.PointLight('#ffb560', 6, 9, 2);
    lumiere.position.set(x, 2.75, z + 0.25);
    scene.add(lumiere);
  };
  lanterne(4.4, -5.4);
  lanterne(-15.5, -5.4);

  // ---------- Arbres (volumes provisoires) ----------
  const feuilles = mat({ map: TEX.feuillage() }), tronc = mat({ color: '#5a3d2a' });
  const arbre = (x, z, taille = 1) => {
    ajouter(new THREE.CylinderGeometry(0.18 * taille, 0.26 * taille, 1.6 * taille, 6), tronc, x, 0.8 * taille, z);
    ajouter(new THREE.ConeGeometry(1.5 * taille, 2.8 * taille, 7), feuilles, x, 2.6 * taille, z);
    ajouter(new THREE.ConeGeometry(1.1 * taille, 2.2 * taille, 7), feuilles, x, 3.9 * taille, z);
  };
  // Derrière les bâtiments
  for (let x = -40; x <= 40; x += 4.5) arbre(x + Math.sin(x) * 1.2, -17 + Math.cos(x * 1.7) * 2, 1.2 + Math.abs(Math.sin(x * 3)) * 0.5);
  for (let x = -60; x <= 60; x += 7) arbre(x + Math.cos(x) * 2, -34 + Math.sin(x * 1.3) * 5, 1.6);
  // Au premier plan, entre la caméra et le perso : ils doivent apparaître flous
  arbre(-9.5, 13, 1.1);
  arbre(11, 15, 0.9);
  ajouter(boiteDense(1.2, 1.2, 1.2), bois, 7.5, 0.6, 11);

  // ---------- Paysage lointain : deux rangées de collines peintes ----------
  const collines = (couleur, graine, z, y, hauteur) => {
    const texture = textureCollines(couleur, graine);
    texture.repeat.set(3, 1);
    const plan = new THREE.Mesh(
      new THREE.PlaneGeometry(520, hauteur),
      new THREE.MeshBasicMaterial({ map: texture, alphaTest: 0.5 }),
    );
    plan.position.set(0, y, z);
    scene.add(plan);
  };
  collines('#6f8a6a', 5, -90, 12, 40);
  collines('#8296a0', 9, -150, 22, 60);

  // ---------- Poussière dorée en suspension ----------
  const N = 140, positions = new Float32Array(N * 3), phases = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = 0.5 + Math.random() * 6;
    positions[i * 3 + 2] = -8 + Math.random() * 22;
    phases[i] = Math.random() * 100;
  }
  const nuage = new THREE.BufferGeometry();
  nuage.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(nuage, new THREE.PointsMaterial({
    color: '#fff1c8', size: 0.09, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  // Appelée à chaque image : fait flotter la poussière.
  function animer(temps) {
    for (let i = 0; i < N; i++) {
      positions[i * 3 + 1] += Math.sin(temps * 0.8 + phases[i]) * 0.004;
      positions[i * 3] += Math.cos(temps * 0.5 + phases[i]) * 0.003;
    }
    nuage.attributes.position.needsUpdate = true;
  }

  // Zone où le perso peut marcher pendant le calibrage (les vraies collisions arrivent au jour 3).
  const limites = { xMin: -20, xMax: 20, zMin: -5, zMax: 11 };
  return { animer, limites };
}
