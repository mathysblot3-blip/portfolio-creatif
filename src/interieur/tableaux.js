// =====================================================================
// TABLEAUX D'AFFICHAGE
// Chaque lieu a son propre support, accordé à son ambiance, comme un tableau d'enquêteur :
//   École       ardoise verte, éléments tenus par des aimants, traits de craie
//   Entreprise  liège, punaises colorées, fil rouge
//   Banque      feutrine verte dans un cadre doré, punaises dorées, fil d'or
//   Concert     panneau noir couvert d'affiches, éléments scotchés
//   Atelier     toile de lin, épingles de couture, fil à coudre
//   Colisée     planches de bois brut, clous, corde
// Les textures sont dessinées par du code en pixel art (32 px par unité) et seront
// remplaçables par des images (voir la règle des assets dans CLAUDE.md).
// =====================================================================
import * as THREE from 'three';
import { TEX, texturePixel, alea, nuance } from '../engine/textures.js';
import { textureAsset } from '../engine/assets.js';

export const LARGEUR_TABLEAU = 7.25, HAUTEUR_TABLEAU = 4.0;
const PX_L = 232, PX_H = 128; // taille de la texture : 32 px par unité

export const STYLES_TABLEAU = {
  ecole: {
    mur: () => TEX.enduit('#e3c389'), cadre: '#6b4630', fixation: 'aimant', couleursFixation: ['#e0507a', '#f0c040', '#4c8cc8'],
    fil: '#f4ecd8', lampe: '#ffd7a0',
    fond: (g, l, h, r) => {
      remplir(g, l, h, '#24302a', 0.12, r);
      // Traces de craie : flèches, cercles et gribouillis d'équations (illisibles exprès)
      g.fillStyle = 'rgba(244,236,216,0.35)';
      for (let i = 0; i < 9; i++) {
        const x = (r() * (l - 30)) | 0, y = (r() * (h - 12)) | 0, n = 6 + ((r() * 14) | 0);
        for (let k = 0; k < n; k += 2) g.fillRect(x + k, y + ((Math.sin(k) * 2) | 0), 1 + ((r() * 2) | 0), 1);
      }
      g.strokeStyle = 'rgba(244,236,216,0.3)'; g.beginPath(); g.arc(l * 0.8, h * 0.25, 9, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(244,236,216,0.12)'; g.fillRect(10, h - 22, 60, 9); // coup d'éponge
    },
  },
  entreprise: {
    mur: () => TEX.enduit('#dcd6c8'), cadre: '#96683f', fixation: 'punaise', couleursFixation: ['#b8324f', '#f0c040', '#2f5a9e'],
    fil: '#b8324f', lampe: '#fff1d8',
    fond: (g, l, h, r) => {
      remplir(g, l, h, '#c0935a', 0.3, r, 0.8);
      for (let i = 0; i < l * h * 0.08; i++) { g.fillStyle = r() > 0.5 ? '#96683f' : '#e3c389'; g.fillRect((r() * l) | 0, (r() * h) | 0, 1, 1); }
      // Trous de punaises laissés par d'anciennes notes
      g.fillStyle = '#4a2e20'; for (let i = 0; i < 18; i++) g.fillRect((r() * l) | 0, (r() * h) | 0, 1, 1);
    },
  },
  banque: {
    mur: () => TEX.pierreTaillee('#e3c389', 51), cadre: '#d89c2a', fixation: 'punaise', couleursFixation: ['#f0c040'],
    fil: '#f0c040', lampe: '#ffe2a8',
    fond: (g, l, h, r) => {
      remplir(g, l, h, '#24503a', 0.1, r, 0.6);
      g.fillStyle = 'rgba(240,192,64,0.18)'; g.fillRect(4, 4, l - 8, 1); g.fillRect(4, h - 5, l - 8, 1); g.fillRect(4, 4, 1, h - 8); g.fillRect(l - 5, 4, 1, h - 8);
    },
  },
  concert: {
    mur: () => TEX.brique('#4a3f52', 53), cadre: '#14101a', fixation: 'scotch', couleursFixation: ['#7d7080'],
    fil: null, lampe: '#f08a9c', lampe2: '#4c8cc8',
    fond: (g, l, h, r) => {
      remplir(g, l, h, '#14101a', 0.15, r);
      // Vieilles affiches déchirées collées les unes sur les autres
      const couleurs = ['#e0507a', '#4c8cc8', '#f0c040', '#9a62c4', '#a4cf62', '#b8324f'];
      for (let i = 0; i < 26; i++) {
        const x = (r() * l) | 0, y = (r() * h) | 0, w = 14 + ((r() * 22) | 0), hh = 18 + ((r() * 24) | 0);
        g.fillStyle = nuance(couleurs[i % couleurs.length], 0.45 + r() * 0.2); g.fillRect(x - w / 2, y - hh / 2, w, hh);
        g.fillStyle = 'rgba(20,16,26,0.5)'; g.fillRect(x - w / 2, y + hh / 2 - 3, w, 3);
      }
    },
  },
  atelier: {
    mur: () => TEX.rayures('#fbe6cc', '#f08a9c'), cadre: '#c0935a', fixation: 'epingle', couleursFixation: ['#e0507a', '#4c8cc8', '#a4cf62', '#f0c040'],
    fil: '#9a62c4', lampe: '#ffd7a0',
    fond: (g, l, h, r) => {
      remplir(g, l, h, '#e3d4b8', 0.06, r);
      // Trame du tissu, puis lignes de patron en pointillés
      g.fillStyle = 'rgba(150,104,63,0.12)';
      for (let x = 0; x < l; x += 2) g.fillRect(x, 0, 1, h);
      for (let y = 0; y < h; y += 2) g.fillRect(0, y, l, 1);
      g.fillStyle = 'rgba(184,50,79,0.35)';
      for (let x = 8; x < l - 8; x += 4) { g.fillRect(x, 20, 2, 1); g.fillRect(x, h - 20, 2, 1); }
    },
  },
  colisee: {
    mur: () => TEX.arcades('#c0935a'), cadre: '#4a2e20', fixation: 'clou', couleursFixation: ['#2b2433'],
    fil: '#c0935a', lampe: '#ff9a40', torches: true,
    fond: (g, l, h, r) => {
      // Planches horizontales de bois brut
      for (let y = 0; y < h; y += 16) {
        const base = nuance('#96683f', 0.8 + r() * 0.35);
        g.fillStyle = base; g.fillRect(0, y, l, 16);
        for (let i = 0; i < 70; i++) { g.fillStyle = nuance(base, 0.85 + r() * 0.3); g.fillRect((r() * l) | 0, y + ((r() * 15) | 0), 3 + ((r() * 8) | 0), 1); }
        g.fillStyle = nuance(base, 0.55); g.fillRect(0, y + 15, l, 1);
      }
    },
  },
};

// Aplat de couleur légèrement bruité
function remplir(g, l, h, couleur, amplitude, r, densite = 0.4) {
  g.fillStyle = couleur; g.fillRect(0, 0, l, h);
  for (let i = 0; i < l * h * densite; i++) { g.fillStyle = nuance(couleur, 1 + (r() - 0.5) * amplitude); g.fillRect((r() * l) | 0, (r() * h) | 0, 1, 1); }
}

// Fabrique le tableau (surface + cadre) pour un lieu.
export function creerTableau(cle, graine = 7) {
  const style = STYLES_TABLEAU[cle] ?? STYLES_TABLEAU.entreprise;
  const groupe = new THREE.Group();
  // Fond généré (assets/ia/tableau/<lieu>.png) s'il existe, sinon le fond dessiné par le code.
  const texture = textureAsset(`tableau/${cle}`) ?? texturePixel(PX_L, PX_H, (g, l, h) => style.fond(g, l, h, alea(graine)), { repetable: false });
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(LARGEUR_TABLEAU, HAUTEUR_TABLEAU), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95 }));
  surface.receiveShadow = true;
  surface.position.z = 0.06;
  groupe.add(surface);

  // Cadre : quatre baguettes en relief autour de la surface (et non une plaque derrière,
  // qui viendrait se mélanger à la surface et en changer la couleur).
  const doré = style.cadre === '#d89c2a';
  const matCadre = new THREE.MeshStandardMaterial({ color: style.cadre, roughness: doré ? 0.4 : 0.85, metalness: doré ? 0.4 : 0 });
  const e = 0.16, lT = LARGEUR_TABLEAU, hT = HAUTEUR_TABLEAU;
  [[0, hT / 2 + e / 2, lT + 2 * e, e], [0, -hT / 2 - e / 2, lT + 2 * e, e], [-lT / 2 - e / 2, 0, e, hT], [lT / 2 + e / 2, 0, e, hT]].forEach(([x, y, l, h]) => {
    const baguette = new THREE.Mesh(new THREE.BoxGeometry(l, h, 0.16), matCadre);
    baguette.position.set(x, y, 0.06);
    baguette.castShadow = true; baguette.receiveShadow = true;
    groupe.add(baguette);
  });
  return { groupe, style };
}

// Petit objet qui tient un élément au tableau. Renvoie un groupe placé à l'origine (haut de l'élément).
export function creerFixation(style, couleur, largeurElement) {
  const groupe = new THREE.Group();
  const m = (c, options = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1, ...options });
  const ajouter = (forme, materiau, x, y, z, rx = 0) => { const o = new THREE.Mesh(forme, materiau); o.position.set(x, y, z); o.rotation.x = rx; o.castShadow = true; groupe.add(o); return o; };

  if (style.fixation === 'punaise') {
    ajouter(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), m(couleur), 0, 0, 0.06, Math.PI / 2);
    ajouter(new THREE.SphereGeometry(0.05, 8, 6), m(couleur), 0, 0, 0.1);
  } else if (style.fixation === 'aimant') {
    ajouter(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 14), m(couleur, { roughness: 0.3 }), 0, 0, 0.05, Math.PI / 2);
  } else if (style.fixation === 'epingle') {
    ajouter(new THREE.SphereGeometry(0.055, 8, 6), m(couleur, { roughness: 0.25 }), 0, 0, 0.09);
    ajouter(new THREE.CylinderGeometry(0.008, 0.008, 0.25, 4), m('#b9ab9f', { metalness: 0.8 }), 0.08, -0.05, 0.05).rotation.z = 1.1;
  } else if (style.fixation === 'clou') {
    ajouter(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), m(couleur, { metalness: 0.6 }), 0, 0, 0.05, Math.PI / 2);
  } else if (style.fixation === 'scotch') {
    // Deux bandes de ruban adhésif aux coins supérieurs
    const ruban = m('#b9ab9f', { transparent: true, opacity: 0.85, roughness: 0.8 });
    [-1, 1].forEach((cote) => {
      const bande = ajouter(new THREE.PlaneGeometry(0.42, 0.14), ruban, cote * (largeurElement / 2 - 0.05), 0, 0.05);
      bande.rotation.z = cote * -0.7;
      bande.castShadow = false;
    });
  }
  return groupe;
}

// Fil tendu entre deux points (cylindre très fin), légèrement en avant du tableau.
export function creerFil(a, b, couleur) {
  const longueur = a.distanceTo(b);
  const fil = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.7 }));
  fil.position.copy(a).add(b).multiplyScalar(0.5);
  fil.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  fil.userData.longueur = longueur;
  fil.scale.set(1, longueur, 1);
  fil.castShadow = true;
  return fil;
}
