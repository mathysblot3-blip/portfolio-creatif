// =====================================================================
// VUE INTÉRIEURE D'UN LIEU (plan fixe)
// On ne se déplace pas : on voit, en bas au centre, le perso de dos et flou, et devant lui
// un tableau d'affichage propre au lieu, où le contenu (contenu/<lieu>.md) est épinglé en vrac.
// Tout se fait à la souris : survoler un élément le soulève, cliquer l'ouvre en grand.
//
// L'animation d'entrée (caméra qui avance, éléments épinglés un par un, fils tendus à la fin)
// est faite en code. Elle pourra être enrichie plus tard, mais le contenu restera toujours
// une couche séparée, modifiable sans outil de génération.
// =====================================================================
import * as THREE from 'three';
import { planDense } from '../world/formes.js';
import { lireContenu } from '../contenu/lecteur.js';
import { creerElement, disposerEnVrac } from './elementsMur.js';
import { creerTableau, creerFixation, creerFil, LARGEUR_TABLEAU, HAUTEUR_TABLEAU } from './tableaux.js';
import { creerLutin } from '../actors/lutin.js';
import { textureOu } from '../engine/assets.js';

const Y_TABLEAU = 2.55;          // hauteur du centre du tableau
const Z_PERSO = 3.3;             // le perso se tient entre la caméra et le tableau

// Cadrage de la caméra : fixe, légèrement en contre-plongée vers le tableau.
// "visee" négative = la caméra regarde un peu vers le haut.
// proportionMin : sur un écran plus étroit que 1,6 (fenêtre étroite, téléphone), l'angle s'élargit pour que le tableau tienne en entier.
export const CAMERA_INTERIEUR = { fov: 30, y: 1.75, z: 9.0, visee: -5, suiviX: 0, proportionMin: 1.6 };
const RECUL_ENTREE = 3.0;        // la caméra démarre plus loin et avance pendant l'animation d'entrée

// Flou de profondeur des intérieurs : tableau net, perso au premier plan très flou.
export const FLOU_INTERIEUR = { zoneAvant: 0.5, zoneArriere: 3, transition: 2, rayonMax: 0.018 };

const lisser = (t) => 1 - Math.pow(1 - THREE.MathUtils.clamp(t, 0, 1), 3);            // départ rapide, arrivée douce
const rebond = (t) => { const c = 1.6; t = THREE.MathUtils.clamp(t, 0, 1) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };

export function construirePiece(lieu, imageDos) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#14101a');
  const graine = [...lieu.cle].reduce((s, c) => s + c.charCodeAt(0), 0);

  // ---------- Mur, sol, tableau ----------
  const { groupe: tableau, style } = creerTableau(lieu.cle, graine);
  tableau.position.set(0, Y_TABLEAU, 0);
  scene.add(tableau);
  const textureMur = textureOu(`interieur/${lieu.cle}`, style.mur, { repetable: true }); // asset généré ou texture provisoire
  // Mur assez haut pour remplir l'écran même en téléphone tenu en hauteur (angle de vue élargi)
  const mur = new THREE.Mesh(planDense(22, 18), new THREE.MeshStandardMaterial({ map: textureMur, roughness: 0.95 }));
  mur.position.set(0, 8, -0.1);
  mur.receiveShadow = true;
  scene.add(mur);
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(22, 12), new THREE.MeshStandardMaterial({ color: '#4a2e20', roughness: 1 }));
  sol.rotation.x = -Math.PI / 2; sol.position.z = 5; sol.receiveShadow = true;
  scene.add(sol);

  // ---------- Lumières ----------
  scene.add(new THREE.HemisphereLight('#fff1d8', '#4a2e20', 0.85));
  const principale = new THREE.DirectionalLight('#ffe2b8', 2.1);
  principale.position.set(-3, 7, 7);
  principale.target.position.set(0, Y_TABLEAU, 0);
  principale.castShadow = true;
  principale.shadow.mapSize.set(1024, 1024);
  Object.assign(principale.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5, near: 1, far: 20 });
  principale.shadow.bias = -0.0005;
  principale.shadow.normalBias = 0.02;
  scene.add(principale, principale.target);

  const torches = [];
  [-1, 1].forEach((cote, i) => {
    const couleur = i && style.lampe2 ? style.lampe2 : style.lampe;
    const x = cote * (LARGEUR_TABLEAU / 2 + 0.9);
    const applique = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: couleur, emissive: couleur, emissiveIntensity: 1.4 }));
    applique.position.set(x, Y_TABLEAU + 1.2, 0.05);
    scene.add(applique);
    const lumiere = new THREE.PointLight(couleur, style.lampe2 ? 9 : 4.5, 8, 2);
    lumiere.position.set(x, Y_TABLEAU + 1.2, 0.8);
    scene.add(lumiere);
    if (style.torches) torches.push({ lumiere, base: 4.5, phase: i * 2.1 });
  });

  // ---------- Le perso, de dos, au premier plan ----------
  const perso = creerLutin(imageDos);
  perso.position.set(0, 0, Z_PERSO);
  scene.add(perso);

  // ---------- Contenu épinglé ----------
  const { elements } = lireContenu(lieu.cle);
  const preuves = elements.filter((e) => e.role === 'preuve');
  // Les éléments de décor sont glissés entre les preuves, à des places tirées au hasard (toujours les mêmes).
  const r = (() => { let s = graine; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
  const ordre = [...preuves];
  elements.filter((e) => e.role === 'deco').forEach((d) => ordre.splice(Math.floor(r() * (ordre.length + 1)), 0, d));

  const fabriques = ordre.map((element) => ({ element, ...creerElement(element, lieu.accent) }));
  const positions = disposerEnVrac(fabriques, LARGEUR_TABLEAU - 0.4, HAUTEUR_TABLEAU - 0.35, graine);
  const cliquables = [];
  const epingles = fabriques.map((f, i) => {
    const pos = positions[i];
    const support = new THREE.Group(); // porte l'élément et sa fixation, c'est lui qu'on anime
    support.add(f.groupe);
    const fixation = creerFixation(style, style.couleursFixation[i % style.couleursFixation.length], f.largeur);
    support.add(fixation);
    const placerFixation = () => fixation.position.set(0, (f.groupe.userData.hautRelatif ?? f.hauteur / 2) - 0.1, 0.03);
    placerFixation();
    f.groupe.userData.surRedimension = placerFixation; // une vraie image peut changer la hauteur de l'élément
    support.position.set(pos.x, Y_TABLEAU + pos.y, 0.07 + i * 0.006); // léger décalage pour éviter les superpositions
    support.rotation.z = pos.angle;
    support.scale.setScalar(pos.echelle);
    scene.add(support);
    cliquables.push(...f.cliquables);
    return {
      element: f.element, support, fixation,
      cible: { x: pos.x, y: Y_TABLEAU + pos.y, z: support.position.z, echelle: pos.echelle },
      delai: 0.45 + i * 0.09, survol: 0,
      indexPreuve: preuves.indexOf(f.element),
    };
  });
  const epinglesPreuves = epingles.filter((e) => e.indexPreuve >= 0).sort((a, b) => a.indexPreuve - b.indexPreuve);

  // ---------- Fils tendus entre les preuves, dans l'ordre du fichier (style tableau d'enquêteur) ----------
  const fils = [];
  if (style.fil) {
    const point = (e) => new THREE.Vector3(e.cible.x, e.cible.y + 0.45 * e.cible.echelle, 0.16);
    for (let i = 0; i + 1 < epinglesPreuves.length; i++) {
      const fil = creerFil(point(epinglesPreuves[i]), point(epinglesPreuves[i + 1]), style.fil);
      fil.visible = false;
      scene.add(fil);
      fils.push(fil);
    }
  }
  const finEpinglage = epingles.length ? epingles[epingles.length - 1].delai + 0.4 : 0.4;

  // ---------- Animation ----------
  // t : secondes écoulées depuis l'entrée dans le lieu. cadrage : objet du cadrage caméra à faire avancer.
  function animer(t, dt, cadrage, temps) {
    // Caméra qui avance vers le tableau
    cadrage.z = CAMERA_INTERIEUR.z + RECUL_ENTREE * (1 - lisser(t / 1.2));
    cadrage.y = CAMERA_INTERIEUR.y + 0.35 * (1 - lisser(t / 1.2));
    // Le perso entre par le bas de l'image
    perso.position.y = -0.9 * (1 - lisser((t - 0.1) / 0.6));

    // Chaque élément arrive un peu plus grand et décollé du tableau, puis vient se plaquer avec un petit rebond.
    for (const e of epingles) {
      const k = (t - e.delai) / 0.32;
      e.support.visible = k > 0;
      const arrivee = rebond(k);
      e.survol += ((e.estSurvole ? 1 : 0) - e.survol) * Math.min(1, dt * 12);
      e.support.position.z = e.cible.z + (1 - arrivee) * 0.9 + e.survol * 0.12;
      e.support.position.y = e.cible.y + (1 - arrivee) * 0.25;
      e.support.scale.setScalar(e.cible.echelle * (1 + (1 - arrivee) * 0.35 + e.survol * 0.07));
      // La fixation apparaît juste après que l'élément touche le tableau
      e.fixation.scale.setScalar(rebond((t - e.delai - 0.25) / 0.2) || 0.0001);
    }
    // Les fils se tendent une fois tout épinglé
    fils.forEach((fil, i) => {
      const k = lisser((t - finEpinglage - i * 0.12) / 0.3);
      fil.visible = k > 0;
      fil.scale.y = Math.max(0.0001, fil.userData.longueur * k);
    });
    torches.forEach((l) => { l.lumiere.intensity = l.base * (0.85 + 0.15 * Math.sin(temps * 9 + l.phase) * Math.sin(temps * 5.3 + l.phase)); });
  }

  // Met en avant un élément (survol de la souris ou sélection au clavier), ou aucun.
  function survoler(element) {
    for (const e of epingles) e.estSurvole = e.element === element;
  }

  return {
    lieu, scene, cliquables, preuves, animer, survoler,
    centreTableau: new THREE.Vector3(0, Y_TABLEAU, 0),
  };
}
