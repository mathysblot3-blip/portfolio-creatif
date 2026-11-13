// =====================================================================
// PICTOGRAMMES PIXEL ART (24 × 24 px)
// Ils remplacent les noms écrits sur les bâtiments : on reconnaît chaque lieu à son symbole,
// comme les enseignes suspendues des boutiques dans les RPG.
// Provisoires : à remplacer par tes dessins (voir ASSETS_A_FAIRE.md quand il existera).
// =====================================================================

// Dessine le pictogramme "nom" dans le carré de 24 px dont le coin haut gauche est (x0, y0).
export function dessinerPicto(g, nom, x0, y0) {
  const p = (couleur, x, y, l = 1, h = 1) => { g.fillStyle = couleur; g.fillRect(x0 + x, y0 + y, l, h); };
  const C = { encre: '#14101a', papier: '#f4ecd8', or: '#f0c040', orSombre: '#a8741c', bois: '#6b4630', boisClair: '#96683f', acier: '#b9ab9f', acierSombre: '#7d7080', rouge: '#b8324f', vert: '#3f7a42' };

  if (nom === 'livre') {
    // Livre ouvert, vu de face
    p(C.encre, 1, 6, 22, 14); p(C.papier, 2, 7, 9, 11); p(C.papier, 13, 7, 9, 11);
    p(C.encre, 11, 6, 2, 14);
    for (let y = 9; y <= 15; y += 2) { p(C.acierSombre, 4, y, 6, 1); p(C.acierSombre, 14, y, 6, 1); }
    p(C.rouge, 16, 3, 2, 6); // marque-page
  }
  if (nom === 'mallette') {
    // Mallette de travail
    p(C.encre, 8, 3, 8, 2); p(C.encre, 8, 3, 2, 5); p(C.encre, 14, 3, 2, 5);
    p(C.encre, 1, 7, 22, 15); p(C.bois, 2, 8, 20, 13); p(C.boisClair, 2, 8, 20, 3);
    p(C.encre, 2, 13, 20, 1); p(C.or, 10, 12, 4, 3);
  }
  if (nom === 'piece') {
    // Pièce d'or avec un relief en forme d'étoile
    g.fillStyle = C.encre; g.beginPath(); g.arc(x0 + 12, y0 + 12, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.orSombre; g.beginPath(); g.arc(x0 + 12, y0 + 12, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.or; g.beginPath(); g.arc(x0 + 11, y0 + 11, 8, 0, Math.PI * 2); g.fill();
    p(C.orSombre, 11, 6, 2, 12); p(C.orSombre, 6, 11, 12, 2); p(C.orSombre, 8, 8, 2, 2); p(C.orSombre, 14, 8, 2, 2); p(C.orSombre, 8, 14, 2, 2); p(C.orSombre, 14, 14, 2, 2);
    p('#fff4b8', 6, 7, 2, 2);
  }
  if (nom === 'note') {
    // Double croche
    p(C.encre, 7, 4, 13, 3); p(C.encre, 7, 4, 3, 13); p(C.encre, 17, 4, 3, 13); p(C.encre, 7, 9, 13, 2);
    g.fillStyle = C.encre; g.beginPath(); g.ellipse(x0 + 6, y0 + 18, 4, 3, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x0 + 16, y0 + 18, 4, 3, -0.4, 0, Math.PI * 2); g.fill();
  }
  if (nom === 'ciseaux') {
    // Ciseaux de couturière, ouverts
    for (let i = 0; i < 12; i++) { p(C.acier, 6 + i, 2 + i, 2, 2); p(C.acier, 16 - i, 2 + i, 2, 2); }
    p(C.acierSombre, 11, 11, 2, 2);
    g.strokeStyle = C.rouge; g.lineWidth = 2;
    g.beginPath(); g.arc(x0 + 5, y0 + 18, 4, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(x0 + 19, y0 + 18, 4, 0, Math.PI * 2); g.stroke();
  }
  if (nom === 'epees') {
    // Deux glaives croisés et une couronne de laurier
    for (let i = 0; i < 15; i++) { p(C.acier, 4 + i, 3 + i, 2, 2); p(C.acier, 18 - i, 3 + i, 2, 2); }
    p(C.bois, 2, 18, 4, 4); p(C.bois, 18, 18, 4, 4); p(C.or, 4, 16, 4, 2); p(C.or, 16, 16, 4, 2);
    for (let i = 0; i < 5; i++) { p(C.vert, 1 + i, 9 - i, 2, 2); p(C.vert, 21 - i, 9 - i, 2, 2); }
  }
}

// Pictogramme de chaque lieu, d'après sa clé dans places.json
export const PICTO_DU_LIEU = { ecole: 'livre', entreprise: 'mallette', banque: 'piece', concert: 'note', atelier: 'ciseaux', colisee: 'epees' };
