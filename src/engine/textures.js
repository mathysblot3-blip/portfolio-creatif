// =====================================================================
// TEXTURES PROVISOIRES
// En attendant tes dessins et les images générées, les textures sont dessinées par du code,
// pixel par pixel, sur de petites toiles. Elles respectent déjà la densité de 32 px par unité :
// une tuile de 64 × 64 px couvre exactement 2 × 2 unités.
// =====================================================================
import * as THREE from 'three';

// Générateur de nombres "au hasard" reproductible : la même graine donne toujours la même texture.
export function alea(graine) {
  return () => {
    graine |= 0;
    graine = (graine + 0x6d2b79f5) | 0;
    let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Éclaircit (facteur > 1) ou assombrit (facteur < 1) une couleur.
export function nuance(hex, facteur) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(facteur);
  return '#' + c.getHexString();
}

// Crée une texture pixel art à partir d'une fonction de dessin.
// "Nearest" = aucun lissage quand on zoome : les pixels restent des carrés nets.
export function texturePixel(largeur, hauteur, dessiner, { repetable = true } = {}) {
  const toile = document.createElement('canvas');
  toile.width = largeur;
  toile.height = hauteur;
  const g = toile.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  dessiner(g, largeur, hauteur);
  const t = new THREE.CanvasTexture(toile);
  t.magFilter = THREE.NearestFilter;
  // Vue de loin, on lisse un peu pour éviter que la texture scintille.
  t.minFilter = repetable ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter;
  t.generateMipmaps = repetable;
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = repetable ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  return t;
}

// Remplit la toile d'une couleur de base avec des pixels légèrement plus clairs ou plus sombres.
function bruit(g, l, h, base, amplitude, graine, densite = 0.35) {
  const r = alea(graine);
  g.fillStyle = base;
  g.fillRect(0, 0, l, h);
  for (let i = 0; i < l * h * densite; i++) {
    g.fillStyle = nuance(base, 1 + (r() - 0.5) * amplitude);
    g.fillRect((r() * l) | 0, (r() * h) | 0, 1, 1);
  }
}

export const TEX = {
  // Pavés de la place : briques de 16 × 8 px en quinconce
  paves: () => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, '#7d7264', 0.2, 1);
    const r = alea(2);
    for (let y = 0; y < h; y += 8) {
      const decalage = (y / 8) % 2 ? 8 : 0;
      for (let x = -16; x < l; x += 16) {
        const c = nuance('#a39685', 0.85 + r() * 0.3);
        g.fillStyle = c; g.fillRect(x + decalage + 1, y + 1, 14, 6);
        g.fillStyle = nuance(c, 1.15); g.fillRect(x + decalage + 1, y + 1, 14, 1);
        g.fillStyle = nuance(c, 0.75); g.fillRect(x + decalage + 1, y + 6, 14, 1);
      }
    }
  }),

  herbe: () => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, '#5f8a4a', 0.3, 3, 0.5);
    const r = alea(4);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = r() > 0.5 ? '#7aa85a' : '#4a7038';
      g.fillRect((r() * l) | 0, (r() * h) | 0, 1, 2 + ((r() * 2) | 0));
    }
  }),

  // Mur à colombages : enduit clair, poutres sombres
  mur: (couleur, graine) => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, couleur, 0.1, graine, 0.5);
    const poutre = '#4a3324';
    g.fillStyle = poutre;
    g.fillRect(0, 0, l, 4);       // poutre horizontale
    g.fillRect(0, 0, 4, h);       // poutre verticale
    g.fillRect(30, 4, 3, h - 4);  // montant intermédiaire
    g.fillStyle = nuance(poutre, 1.35);
    g.fillRect(0, 0, l, 1); g.fillRect(0, 0, 1, h);
    g.fillStyle = nuance(couleur, 0.82);
    g.fillRect(4, 4, l - 4, 2);   // ombre portée sous la poutre
  }),

  // Tuiles du toit : rangées de 8 px
  toit: (couleur, graine) => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, couleur, 0.15, graine);
    const r = alea(graine + 1);
    for (let y = 0; y < h; y += 8) {
      const decalage = (y / 8) % 2 ? 4 : 0;
      g.fillStyle = nuance(couleur, 0.55); g.fillRect(0, y + 7, l, 1);
      for (let x = decalage; x < l; x += 8) {
        g.fillStyle = nuance(couleur, 0.7); g.fillRect(x, y, 1, 7);
        g.fillStyle = nuance(couleur, 0.9 + r() * 0.3); g.fillRect(x + 1, y, 7, 2);
      }
    }
  }),

  pierre: () => texturePixel(32, 32, (g, l, h) => {
    bruit(g, l, h, '#b9b2a6', 0.2, 7);
    g.fillStyle = '#8f887c';
    for (let y = 0; y < h; y += 8) {
      g.fillRect(0, y, l, 1);
      for (let x = ((y / 8) % 2) * 8; x < l; x += 16) g.fillRect(x, y, 1, 8);
    }
  }),

  bois: () => texturePixel(32, 32, (g, l, h) => {
    bruit(g, l, h, '#6b4630', 0.2, 9);
    g.fillStyle = '#3e271a';
    for (let x = 0; x < l; x += 8) g.fillRect(x, 0, 1, h);
  }),

  feuillage: () => texturePixel(32, 32, (g, l, h) => {
    bruit(g, l, h, '#3f6b3a', 0.45, 11, 0.6);
  }),

  // Porte : 40 × 64 px, soit 1,25 × 2 unités
  porte: () => texturePixel(40, 64, (g, l, h) => {
    bruit(g, l, h, '#6b4630', 0.18, 13);
    g.fillStyle = '#3e271a';
    g.fillRect(0, 0, l, 3); g.fillRect(0, 0, 3, h); g.fillRect(l - 3, 0, 3, h);
    for (let x = 11; x < l - 3; x += 9) g.fillRect(x, 3, 1, h);
    g.fillRect(3, 20, l - 6, 2); g.fillRect(3, 46, l - 6, 2);
    g.fillStyle = '#d8b04a'; g.fillRect(29, 33, 4, 4);
  }, { repetable: false }),

  // Fenêtre : 32 × 40 px, soit 1 × 1,25 unité
  fenetre: () => texturePixel(32, 40, (g, l, h) => {
    g.fillStyle = '#3e271a'; g.fillRect(0, 0, l, h);
    g.fillStyle = '#39506b'; g.fillRect(3, 3, l - 6, h - 6);
    g.fillStyle = '#6f8fb0'; g.fillRect(4, 4, 10, 12);
    g.fillStyle = '#3e271a'; g.fillRect(15, 3, 2, h - 6); g.fillRect(3, 19, l - 6, 2);
  }, { repetable: false }),

  // Mur de briques : briques de 16 × 8 px en quinconce
  brique: (couleur, graine) => texturePixel(64, 64, (g, l, h) => {
    g.fillStyle = nuance(couleur, 0.5); g.fillRect(0, 0, l, h);
    const r = alea(graine);
    for (let y = 0; y < h; y += 8) {
      const decalage = (y / 8) % 2 ? 8 : 0;
      for (let x = -16; x < l; x += 16) {
        const c = nuance(couleur, 0.8 + r() * 0.4);
        g.fillStyle = c; g.fillRect(x + decalage, y, 15, 7);
        g.fillStyle = nuance(c, 1.2); g.fillRect(x + decalage, y, 15, 1);
      }
    }
  }),

  // Mur en pierre de taille : gros blocs de 32 × 16 px
  pierreTaillee: (couleur, graine) => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, couleur, 0.12, graine, 0.5);
    const r = alea(graine + 3);
    for (let y = 0; y < h; y += 16) {
      const decalage = (y / 16) % 2 ? 16 : 0;
      for (let x = -32; x < l; x += 32) {
        g.fillStyle = nuance(couleur, 0.9 + r() * 0.2); g.fillRect(x + decalage + 1, y + 1, 30, 14);
        g.fillStyle = nuance(couleur, 1.15); g.fillRect(x + decalage + 1, y + 1, 30, 1);
        g.fillStyle = nuance(couleur, 0.6); g.fillRect(x + decalage, y + 15, 32, 1); g.fillRect(x + decalage, y, 1, 16);
      }
    }
  }),

  // Eau de la fontaine
  eau: () => texturePixel(32, 32, (g, l, h) => {
    bruit(g, l, h, '#2f5a9e', 0.25, 13, 0.5);
    g.fillStyle = '#86c0e4';
    [[5, 6, 6], [19, 12, 7], [9, 22, 5], [24, 27, 5]].forEach(([x, y, n]) => g.fillRect(x, y, n, 1));
  }),

  // Toile rayée de l'auvent du Comptoir
  auvent: (couleur) => texturePixel(32, 32, (g, l, h) => {
    for (let x = 0; x < l; x += 8) {
      g.fillStyle = (x / 8) % 2 ? '#f4ecd8' : couleur;
      g.fillRect(x, 0, 8, h);
    }
    g.fillStyle = 'rgba(20,16,26,0.25)'; g.fillRect(0, h - 3, l, 3);
  }),

  // Cadran d'horloge de l'Académie
  horloge: () => texturePixel(32, 32, (g) => {
    g.fillStyle = '#4a3f52'; g.beginPath(); g.arc(16, 16, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4ecd8'; g.beginPath(); g.arc(16, 16, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#14101a';
    [[15, 5], [15, 25], [5, 15], [25, 15]].forEach(([x, y]) => g.fillRect(x, y, 2, 2));
    g.fillRect(15, 9, 2, 8); g.fillRect(15, 15, 7, 2);
  }, { repetable: false }),

  // Vitrine de l'Atelier : trois silhouettes de mannequins
  vitrine: () => texturePixel(64, 48, (g, l, h) => {
    g.fillStyle = '#2b2433'; g.fillRect(0, 0, l, h);
    g.fillStyle = '#fbe6cc'; g.fillRect(2, 2, l - 4, h - 4);
    [[14, '#9a62c4'], [32, '#e0507a'], [50, '#432664']].forEach(([x, robe]) => {
      g.fillStyle = '#b9ab9f'; g.fillRect(x - 2, 8, 4, 4);          // tête du mannequin
      g.fillStyle = robe; g.fillRect(x - 5, 12, 10, 12); g.fillRect(x - 7, 24, 14, 10); // robe
      g.fillStyle = '#4a3f52'; g.fillRect(x, 34, 1, 9); g.fillRect(x - 4, 43, 9, 1);     // pied
    });
    g.fillStyle = '#2b2433'; g.fillRect(l / 2 - 1, 2, 2, h - 4);
  }, { repetable: false }),

  // Face avant d'une enceinte du Studio
  enceinte: () => texturePixel(24, 36, (g, l, h) => {
    g.fillStyle = '#14101a'; g.fillRect(0, 0, l, h);
    g.fillStyle = '#2b2433'; g.fillRect(1, 1, l - 2, h - 2);
    g.fillStyle = '#4a3f52'; g.beginPath(); g.arc(12, 24, 8, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(12, 8, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#14101a'; g.beginPath(); g.arc(12, 24, 4, 0, Math.PI * 2); g.fill();
  }, { repetable: false }),

  // Bannière de l'Arène
  banniere: (couleur) => texturePixel(16, 48, (g, l, h) => {
    g.fillStyle = couleur; g.fillRect(0, 0, l, h - 6);
    g.fillRect(0, h - 6, 5, 6); g.fillRect(11, h - 6, 5, 6); // bas découpé en deux pointes
    g.fillStyle = '#f8dc78'; g.fillRect(0, 0, l, 2); g.fillRect(5, 14, 6, 6); g.fillRect(7, 20, 2, 8);
  }, { repetable: false }),

  // Blason suspendu : repère coloré de chaque lieu
  blason: (couleur) => texturePixel(16, 20, (g) => {
    g.fillStyle = '#14101a'; g.fillRect(1, 0, 14, 14); g.fillRect(3, 14, 10, 3); g.fillRect(5, 17, 6, 2);
    g.fillStyle = couleur; g.fillRect(2, 1, 12, 12); g.fillRect(4, 13, 8, 3); g.fillRect(6, 16, 4, 2);
    g.fillStyle = '#f4ecd8'; g.fillRect(6, 4, 4, 6);
  }, { repetable: false }),

  // Enseigne avec le nom du lieu. Sa largeur s'adapte à la longueur du texte (8 px par lettre).
  // La police pixel est chargée au démarrage : le texte est redessiné à ce moment-là (voir ville.js).
  enseigne: (texte, couleur) => texturePixel(Math.max(128, Math.ceil((texte.length * 8 + 24) / 8) * 8), 24, (g, l, h) => {
    g.fillStyle = '#2a1a14'; g.fillRect(0, 0, l, h);
    g.fillStyle = couleur; g.fillRect(2, 2, l - 4, h - 4);
    g.fillStyle = '#14101a'; g.fillRect(4, 4, l - 8, h - 8);
    g.fillStyle = '#f4ecd8'; g.font = '8px "Press Start 2P", monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(texte, l / 2, h / 2 + 1);
  }, { repetable: false }),

  // ----- Matières des intérieurs -----

  // Parquet : lames de 8 px de large, décalées
  parquet: (couleur = '#96683f') => texturePixel(64, 64, (g, l, h) => {
    const r = alea(31);
    for (let x = 0; x < l; x += 8) {
      const decalage = ((x / 8) % 3) * 21;
      for (let y = -64; y < h; y += 64) {
        const c = nuance(couleur, 0.85 + r() * 0.3);
        g.fillStyle = c; g.fillRect(x, y + decalage, 8, 64);
        g.fillStyle = nuance(c, 0.65); g.fillRect(x, y + decalage, 1, 64); g.fillRect(x, y + decalage, 8, 1);
        g.fillStyle = nuance(c, 1.12); g.fillRect(x + 3, y + decalage + 10, 1, 18);
      }
    }
  }),

  // Dallage en damier (marbre de la banque, carrelage de l'entreprise)
  damier: (clair, fonce) => texturePixel(64, 64, (g) => {
    const r = alea(29);
    for (let y = 0; y < 64; y += 32) for (let x = 0; x < 64; x += 32) {
      const base = ((x + y) / 32) % 2 ? fonce : clair;
      g.fillStyle = base; g.fillRect(x, y, 32, 32);
      for (let i = 0; i < 120; i++) { g.fillStyle = nuance(base, 0.94 + r() * 0.12); g.fillRect(x + ((r() * 32) | 0), y + ((r() * 32) | 0), 1, 1); }
      g.fillStyle = nuance(base, 0.7); g.fillRect(x, y, 32, 1); g.fillRect(x, y, 1, 32);
    }
  }),

  // Sable de l'arène
  sable: () => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, '#c0935a', 0.22, 37, 0.6);
    const r = alea(38);
    for (let i = 0; i < 30; i++) { g.fillStyle = '#e3c389'; g.fillRect((r() * l) | 0, (r() * h) | 0, 2, 1); }
  }),

  // Papier peint à rayures verticales
  rayures: (fond, trait) => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, fond, 0.06, 41, 0.4);
    g.fillStyle = trait;
    for (let x = 4; x < l; x += 16) { g.fillRect(x, 0, 2, h); g.fillRect(x + 5, 0, 1, h); }
  }),

  // Enduit uni légèrement irrégulier (murs peints)
  enduit: (couleur, graine = 43) => texturePixel(64, 64, (g, l, h) => bruit(g, l, h, couleur, 0.08, graine, 0.5)),

  // Arcades sur deux étages, pour le Colisée : une arche par tuile
  arcades: (couleur) => texturePixel(64, 64, (g, l, h) => {
    bruit(g, l, h, couleur, 0.12, 47, 0.5);
    const sombre = '#2b2433';
    g.fillStyle = nuance(couleur, 0.7); g.fillRect(0, 0, l, 3); g.fillRect(0, 30, l, 3);
    [[6, 36], [6, 4]].forEach(([y0]) => {
      g.fillStyle = sombre;
      g.fillRect(18, y0 + 10, 28, 18);
      g.beginPath(); g.arc(32, y0 + 10, 14, Math.PI, 0); g.fill();
      g.fillStyle = nuance(couleur, 1.15); g.fillRect(14, y0 + 8, 2, 20); g.fillRect(48, y0 + 8, 2, 20);
    });
  }),
};

// Dégradé du ciel de fin d'après-midi (du haut vers l'horizon). Lissé volontairement : ce n'est pas du pixel art.
export function textureCiel() {
  const toile = document.createElement('canvas');
  toile.width = 2; toile.height = 256;
  const g = toile.getContext('2d');
  const degrade = g.createLinearGradient(0, 0, 0, 256);
  degrade.addColorStop(0, '#5d8fc9');
  degrade.addColorStop(0.55, '#cdd3c2');
  degrade.addColorStop(1, '#f7dcae');
  g.fillStyle = degrade; g.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(toile);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Silhouette de collines pour le paysage lointain (transparent au-dessus de la crête).
export function textureCollines(couleur, graine) {
  return texturePixel(256, 64, (g, l, h) => {
    const r = alea(graine);
    const a = 4 + r() * 6, b = 2 + r() * 4, p1 = r() * 6, p2 = r() * 6;
    for (let x = 0; x < l; x++) {
      // La crête est la somme de deux ondulations, calculées pour se raccorder aux deux bords.
      const u = (x / l) * Math.PI * 2;
      const crete = Math.round(26 + Math.sin(u * 2 + p1) * a + Math.sin(u * 5 + p2) * b);
      g.fillStyle = couleur; g.fillRect(x, crete, 1, h - crete);
      g.fillStyle = nuance(couleur, 1.15); g.fillRect(x, crete, 1, 1);
    }
  });
}
