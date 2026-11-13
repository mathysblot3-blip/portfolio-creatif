// =====================================================================
// DÉCOR PROVISOIRE DESSINÉ PAR LE CODE
// Versions de secours du jet d'eau et des éléments d'arrière-plan, affichées tant que
// les assets générés correspondants (anime/jet, fond/maisons-a, fond/maisons-b, fond/tour)
// n'ont pas été déposés dans assets/ia/.
// =====================================================================
import { texturePixel, alea, nuance } from '../engine/textures.js';

// Jet d'eau : 4 images de 64 × 96 px. Une colonne d'eau monte, s'ouvre en couronne et retombe en gouttes.
export function jetProvisoire() {
  return [0, 1, 2, 3].map((k) => texturePixel(64, 96, (g) => {
    const r = alea(100 + k);
    const point = (x, y, c, l = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), l, h); };
    // Colonne centrale qui ondule légèrement d'une image à l'autre
    for (let y = 20; y < 96; y++) {
      const dx = Math.sin(y * 0.3 + k * 1.6) * 0.8;
      point(30 + dx, y, '#86c0e4', 4); point(31 + dx, y, '#c8e8f4', 2);
    }
    // Couronne : deux nappes qui retombent de chaque côté en arc
    [-1, 1].forEach((cote) => {
      for (let t = 0; t <= 1; t += 0.02) {
        const x = 32 + cote * t * 26, y = 20 - 14 * Math.sin(t * Math.PI * 0.85) + t * t * 60;
        point(x, y, t < 0.5 ? '#c8e8f4' : '#86c0e4', 2, 2);
      }
    });
    // Gouttes qui tombent, décalées d'une image à l'autre pour donner le mouvement
    for (let i = 0; i < 26; i++) {
      const cote = i % 2 ? 1 : -1, t = r();
      const y = ((r() * 70 + k * 18) % 70) + 14;
      point(32 + cote * (8 + t * 20), y, r() > 0.6 ? '#f4ecd8' : '#86c0e4');
    }
    point(30, 6 + (k % 2), '#f4ecd8', 4, 3); // écume au sommet
  }, { repetable: false }));
}

// Une maison vue de face : mur, toit à deux pans, fenêtres. Dessinée dans la toile g à partir de x (bas à y = h).
function maison(g, x, largeur, hauteur, mur, toit, r, h) {
  const base = h - hauteur;
  g.fillStyle = mur; g.fillRect(x, base, largeur, hauteur);
  g.fillStyle = nuance(mur, 0.75); g.fillRect(x + largeur - 4, base, 4, hauteur);           // côté à l'ombre
  // Toit triangulaire, une rangée de pixels à la fois
  const pointe = Math.round(largeur * 0.55);
  for (let i = 0; i < pointe; i++) {
    const l = Math.round((largeur + 8) * (1 - i / pointe));
    g.fillStyle = i % 4 === 0 ? nuance(toit, 0.7) : toit;
    g.fillRect(x + largeur / 2 - l / 2, base - i, l, 1);
  }
  // Fenêtres sur une grille, certaines éclairées par le soleil
  for (let fy = base + 10; fy < h - 20; fy += 22) {
    for (let fx = x + 8; fx < x + largeur - 14; fx += 18) {
      g.fillStyle = '#2b2433'; g.fillRect(fx, fy, 8, 11);
      g.fillStyle = r() > 0.5 ? '#86c0e4' : '#4c8cc8'; g.fillRect(fx + 1, fy + 1, 6, 9);
    }
  }
  g.fillStyle = '#4a2e20'; g.fillRect(x + largeur / 2 - 6, h - 18, 12, 18); // porte
}

// Deux groupes de maisons d'arrière-plan, 256 × 224 px (8 × 7 unités), fond transparent.
export function maisonsFondProvisoires() {
  const groupes = [
    [[4, 80, 150, '#e3c389', '#96683f'], [86, 90, 120, '#fbe6cc', '#7e1e3c'], [178, 74, 170, '#c0935a', '#24366e']],
    [[2, 96, 128, '#f1c9a0', '#24503a'], [100, 70, 176, '#b9ab9f', '#432664'], [172, 82, 138, '#e3c389', '#b8324f']],
  ];
  return groupes.map((groupe, i) => texturePixel(256, 224, (g, l, h) => {
    const r = alea(200 + i);
    groupe.forEach(([x, largeur, hauteur, mur, toit]) => maison(g, x, largeur, hauteur, mur, toit, r, h));
  }, { repetable: false }));
}

// Tour de guet lointaine : 128 × 448 px (4 × 14 unités), toit conique et drapeau.
export function tourFondProvisoire() {
  return texturePixel(128, 448, (g, l, h) => {
    const r = alea(300);
    g.fillStyle = '#b9ab9f'; g.fillRect(24, 110, 80, h - 110);
    g.fillStyle = '#7d7080'; g.fillRect(92, 110, 12, h - 110);
    for (let y = 116; y < h; y += 12) for (let x = 24 + ((y / 12) % 2) * 10; x < 104; x += 20) { g.fillStyle = nuance('#b9ab9f', 0.8 + r() * 0.15); g.fillRect(x, y, 18, 1); }
    g.fillStyle = '#9a8f86'; g.fillRect(16, 100, 96, 14);                                    // chemin de ronde
    for (let i = 0; i < 70; i++) { const lc = Math.round(104 * (1 - i / 70)); g.fillStyle = i % 5 ? '#24366e' : '#141c3c'; g.fillRect(64 - lc / 2, 100 - i, lc, 1); } // toit conique
    g.fillStyle = '#2b2433'; g.fillRect(63, 4, 2, 28);
    g.fillStyle = '#b8324f'; g.fillRect(65, 6, 18, 10);                                       // drapeau
    [[44, 160], [56, 240], [44, 320]].forEach(([x, y]) => { g.fillStyle = '#14101a'; g.fillRect(x, y, 10, 18); });
  }, { repetable: false });
}
