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
