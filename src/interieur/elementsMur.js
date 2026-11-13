// =====================================================================
// ÉLÉMENTS DU TABLEAU
// Fabrique l'objet 3D de chaque élément du contenu (photo, diplôme, affiche, note, écran vidéo,
// élément de décor) et calcule leur disposition "en vrac" sur le tableau.
// Si le fichier n'existe pas encore, une carte "à fournir" s'affiche à sa place :
// dès que le fichier est déposé au bon endroit, la vraie image la remplace, sans toucher au code.
// =====================================================================
import * as THREE from 'three';
import { alea } from '../engine/textures.js';

// Taille de base de chaque forme, en unités (largeur, hauteur), avant le réglage "taille".
const TAILLES = {
  cadre: [1.5, 1.15], diplome: [1.6, 1.15], affiche: [1.25, 1.7], note: [1.2, 1.2], ecran: [1.9, 1.25], objet: [0.95, 0.95],
};
const NOMS = { cadre: 'PHOTO', diplome: 'DIPLOME', affiche: 'AFFICHE', note: 'NOTE', ecran: 'VIDEO', objet: 'DECOR' };
const sansAccent = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const chargeur = new THREE.TextureLoader();

// Toile de dessin lisible (texte net) : pas de pixel art strict ici, il faut pouvoir lire.
function toile(largeur, hauteur, dessiner) {
  const c = document.createElement('canvas');
  c.width = largeur; c.height = hauteur;
  const g = c.getContext('2d');
  dessiner(g, largeur, hauteur);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Coupe un texte en lignes qui tiennent dans une largeur donnée.
function couperLignes(g, texte, largeurMax, nombreMax) {
  const mots = texte.split(/\s+/), lignes = [];
  let ligne = '';
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (g.measureText(essai).width > largeurMax && ligne) { lignes.push(ligne); ligne = mot; } else ligne = essai;
  }
  if (ligne) lignes.push(ligne);
  if (lignes.length > nombreMax) { lignes.length = nombreMax; lignes[nombreMax - 1] += '…'; }
  return lignes;
}

// Carte "à fournir" : hachures, type d'élément, titre et nom du fichier attendu.
function carteAFournir(element, accent) {
  return toile(256, 192, (g, l, h) => {
    g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, l, h);
    g.strokeStyle = 'rgba(20,16,26,0.07)'; g.lineWidth = 10;
    for (let x = -h; x < l; x += 22) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
    g.strokeStyle = '#14101a'; g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(8, 8, l - 16, h - 16); g.setLineDash([]);
    g.fillStyle = accent; g.fillRect(8, 8, l - 16, 30);
    g.fillStyle = '#f4ecd8'; g.font = '12px "Press Start 2P", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(element.video ? 'VIDEO' : NOMS[element.forme], l / 2, 24);
    g.fillStyle = '#14101a';
    if (element.forme === 'ecran') { g.beginPath(); g.moveTo(116, 52); g.lineTo(146, 68); g.lineTo(116, 84); g.fill(); }
    g.font = '600 19px "Space Grotesk", sans-serif';
    couperLignes(g, element.titre, l - 40, 2).forEach((t, i) => g.fillText(t, l / 2, 108 + i * 22 - (element.forme === 'ecran' ? 0 : 12)));
    g.font = '9px "Press Start 2P", monospace'; g.fillStyle = '#7d7080';
    g.fillText(`A FOURNIR : ${sansAccent(element.nomFichier || 'aucun fichier')}`.slice(0, 30), l / 2, 166);
  });
}

// Note de papier : titre et texte écrits directement dessus.
function carteNote(element, accent) {
  return toile(256, 256, (g, l, h) => {
    g.fillStyle = '#fbe6cc'; g.fillRect(0, 0, l, h);
    g.fillStyle = 'rgba(20,16,26,0.08)'; g.fillRect(0, h - 10, l, 10);
    g.fillStyle = accent; g.fillRect(0, 0, l, 8);
    g.fillStyle = '#14101a'; g.font = '10px "Press Start 2P", monospace'; g.textAlign = 'left'; g.textBaseline = 'top';
    couperLignes(g, sansAccent(element.titre.toUpperCase()), l - 36, 3).forEach((t, i) => g.fillText(t, 18, 30 + i * 16));
    g.font = '600 16px "Space Grotesk", sans-serif'; g.fillStyle = '#2b2433';
    couperLignes(g, element.texte.replace(/\n/g, ' '), l - 36, 8).forEach((t, i) => g.fillText(t, 18, 92 + i * 20));
  });
}

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...options });

// Fabrique l'objet 3D d'un élément. Renvoie le groupe, ses surfaces cliquables et sa taille.
export function creerElement(element, accent) {
  const [l0, h0] = TAILLES[element.forme] ?? TAILLES.cadre;
  const largeur = l0 * element.taille, hauteur = h0 * element.taille;
  const groupe = new THREE.Group();
  const deco = element.role === 'deco';

  // Cadre (fond) selon la forme. Les éléments de décor n'en ont pas : ce sont des découpes.
  const bord = deco ? 0 : { cadre: 0.08, diplome: 0.1, ecran: 0.11, affiche: 0, note: 0 }[element.forme] ?? 0;
  const couleurCadre = { cadre: '#f4ecd8', diplome: '#d89c2a', ecran: '#14101a' }[element.forme];
  let cadre = null;
  if (bord) {
    cadre = new THREE.Mesh(new THREE.BoxGeometry(largeur, hauteur, 0.05), mat({ color: couleurCadre, roughness: element.forme === 'diplome' ? 0.4 : 0.9, metalness: element.forme === 'diplome' ? 0.3 : 0 }));
    cadre.position.z = 0.025;
    cadre.castShadow = true;
    groupe.add(cadre);
  }

  // Surface qui porte l'image
  const lInt = largeur - bord * 2, hInt = hauteur - bord * 2;
  const image = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({ map: null, alphaTest: deco ? 0.5 : 0, side: THREE.DoubleSide }));
  image.position.z = bord ? 0.052 : 0.02;
  image.castShadow = true;
  groupe.add(image);

  // Ajuste l'image à la place disponible en gardant ses proportions (et le cadre autour d'elle).
  const ajuster = (largeurImage, hauteurImage) => {
    const echelle = Math.min(lInt / largeurImage, hInt / hauteurImage);
    image.scale.set(largeurImage * echelle, hauteurImage * echelle, 1);
    if (cadre) cadre.scale.set((largeurImage * echelle + bord * 2) / largeur, (hauteurImage * echelle + bord * 2) / hauteur, 1);
    groupe.userData.hautRelatif = (hauteurImage * echelle) / 2 + bord; // où placer la fixation
  };

  const montrer = (texture, l, h) => { image.material.map = texture; image.material.needsUpdate = true; ajuster(l, h); };
  if (element.forme === 'note') {
    montrer(carteNote(element, accent), 1, 1);
  } else {
    montrer(carteAFournir(element, deco ? '#7d7080' : accent), 4, 3);
    // Pour une vidéo, on montre sa vignette au tableau (la vidéo elle-même se lit dans la visionneuse).
    const source = element.video ? element.vignette : element.fichier;
    if (source) {
      chargeur.load(source, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        if (deco) texture.magFilter = THREE.NearestFilter; // le décor est du pixel art
        montrer(texture, texture.image.width, texture.image.height);
        if (groupe.userData.surRedimension) groupe.userData.surRedimension();
      }, undefined, () => { /* fichier absent : la carte "à fournir" reste affichée */ });
    }
  }

  if (!deco) { image.userData.element = element; if (cadre) cadre.userData.element = element; }
  return { groupe, cliquables: deco ? [] : (cadre ? [image, cadre] : [image]), largeur, hauteur };
}

// ---------------------------------------------------------------------
// DISPOSITION "EN VRAC"
// 1. On cherche le nombre de rangées (1 à 4) qui permet d'afficher les éléments le plus grand possible.
// 2. On décale ensuite chaque élément au hasard (un peu de côté, un peu en hauteur, légèrement penché),
//    comme des papiers punaisés à la main. Le hasard est "reproductible" : même lieu, même disposition.
// Renvoie, pour chaque élément : x, y (centre), echelle, angle.
// ---------------------------------------------------------------------
export function disposerEnVrac(blocs, largeurDispo, hauteurDispo, graine) {
  const n = blocs.length;
  if (!n) return [];
  const ESPACE = 0.3;
  let meilleur = null;
  for (let rangees = 1; rangees <= Math.min(4, n); rangees++) {
    const parRangee = Math.ceil(n / rangees), lignes = [];
    for (let i = 0; i < n; i += parRangee) lignes.push(blocs.slice(i, i + parRangee).map((b, k) => ({ ...b, index: i + k })));
    const largeurMax = Math.max(...lignes.map((r) => r.reduce((s, b) => s + b.largeur, 0) + ESPACE * (r.length - 1)));
    const hauteurTotale = lignes.reduce((s, r) => s + Math.max(...r.map((b) => b.hauteur)), 0) + ESPACE * (lignes.length - 1);
    const echelle = Math.min(1.5, (largeurDispo * 0.94) / largeurMax, (hauteurDispo * 0.92) / hauteurTotale);
    if (!meilleur || echelle > meilleur.echelle + 0.01) meilleur = { echelle, lignes, hauteurTotale };
  }

  const r = alea(graine);
  const { echelle, lignes, hauteurTotale } = meilleur;
  const positions = new Array(n);
  let y = (hauteurTotale * echelle) / 2;
  lignes.forEach((ligne, numero) => {
    const hRangee = Math.max(...ligne.map((b) => b.hauteur)) * echelle;
    const lRangee = (ligne.reduce((s, b) => s + b.largeur, 0) + ESPACE * (ligne.length - 1)) * echelle;
    const marge = Math.max(0, (largeurDispo - lRangee) / 2);
    let x = -lRangee / 2 + (numero % 2 ? 1 : -1) * marge * 0.5 * r(); // rangées décalées
    for (const b of ligne) {
      const l = b.largeur * echelle, h = b.hauteur * echelle;
      const dx = (r() - 0.5) * ESPACE * echelle * 0.9;
      const dy = (r() - 0.5) * Math.max(0, hRangee - h + ESPACE * echelle * 0.8);
      positions[b.index] = {
        x: THREE.MathUtils.clamp(x + l / 2 + dx, -largeurDispo / 2 + l / 2, largeurDispo / 2 - l / 2),
        y: y - hRangee / 2 + dy,
        echelle: echelle * (0.94 + r() * 0.1),
        angle: (r() - 0.5) * 0.17,
      };
      x += l + ESPACE * echelle;
    }
    y -= hRangee + ESPACE * echelle;
  });
  return positions;
}
