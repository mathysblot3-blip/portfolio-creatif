// =====================================================================
// ÉLÉMENTS DU MUR
// Fabrique l'objet 3D de chaque élément du contenu (photo encadrée, diplôme, affiche, note,
// écran vidéo, objet de décor) et calcule leur disposition sur le mur.
// Si le fichier n'existe pas encore, une carte "à fournir" s'affiche à sa place :
// dès que tu déposes le fichier au bon endroit, la vraie image la remplace, sans toucher au code.
// =====================================================================
import * as THREE from 'three';

// Taille de base de chaque forme, en unités (largeur, hauteur), avant le réglage "taille".
const TAILLES = {
  cadre: [1.5, 1.15], diplome: [1.6, 1.15], affiche: [1.25, 1.7], note: [1.2, 1.2], ecran: [1.9, 1.25],
};
const HAUTEUR_PLAQUE = 0.26; // petite plaque portant le titre, sous chaque élément
const ESPACE = 0.45;         // espace entre deux éléments

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

// Carte "à fournir" : hachures, type d'élément et nom du fichier attendu.
function carteAFournir(element, accent) {
  return toile(256, 192, (g, l, h) => {
    g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, l, h);
    g.strokeStyle = 'rgba(20,16,26,0.07)'; g.lineWidth = 10;
    for (let x = -h; x < l; x += 22) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
    g.strokeStyle = '#14101a'; g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(8, 8, l - 16, h - 16); g.setLineDash([]);
    g.fillStyle = accent; g.fillRect(8, 8, l - 16, 30);
    g.fillStyle = '#f4ecd8'; g.font = '12px "Press Start 2P", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(element.video ? 'VIDEO' : NOMS[element.forme], l / 2, 24);
    if (element.forme === 'ecran') { g.fillStyle = '#14101a'; g.beginPath(); g.moveTo(112, 70); g.lineTo(150, 92); g.lineTo(112, 114); g.fill(); }
    g.fillStyle = '#14101a'; g.font = '9px "Press Start 2P", monospace';
    g.fillText('A FOURNIR', l / 2, element.forme === 'ecran' ? 140 : 96);
    g.font = '600 15px "Space Grotesk", sans-serif';
    g.fillText(element.nomFichier || 'aucun fichier', l / 2, element.forme === 'ecran' ? 164 : 126);
  });
}

// Note de papier : titre et texte écrits directement dessus.
function carteNote(element, accent) {
  return toile(256, 256, (g, l, h) => {
    g.fillStyle = '#fbe6cc'; g.fillRect(0, 0, l, h);
    g.fillStyle = 'rgba(20,16,26,0.08)'; g.fillRect(0, h - 10, l, 10);
    g.fillStyle = accent; g.fillRect(l / 2 - 9, 6, 18, 18); // punaise
    g.fillStyle = '#14101a'; g.font = '10px "Press Start 2P", monospace'; g.textAlign = 'left'; g.textBaseline = 'top';
    couperLignes(g, sansAccent(element.titre.toUpperCase()), l - 36, 3).forEach((t, i) => g.fillText(t, 18, 36 + i * 16));
    g.font = '600 16px "Space Grotesk", sans-serif'; g.fillStyle = '#2b2433';
    couperLignes(g, element.texte.replace(/\n/g, ' '), l - 36, 7).forEach((t, i) => g.fillText(t, 18, 100 + i * 20));
  });
}

// Plaque portant le titre, sous l'élément.
function plaque(titre, largeur) {
  const texture = toile(512, 52, (g, l, h) => {
    g.fillStyle = '#14101a'; g.fillRect(0, 0, l, h);
    g.fillStyle = '#c0935a'; g.fillRect(0, 0, l, 3); g.fillRect(0, h - 3, l, 3);
    g.fillStyle = '#f4ecd8'; g.font = '14px "Press Start 2P", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(couperLignes(g, sansAccent(titre.toUpperCase()), l - 24, 1)[0], l / 2, h / 2 + 1);
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(largeur, HAUTEUR_PLAQUE), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 }));
}

const mat = (options) => new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...options });

// Fabrique l'objet 3D d'un élément de preuve. Renvoie le groupe et la surface cliquable.
export function creerElementMural(element, accent) {
  const [l0, h0] = TAILLES[element.forme] ?? TAILLES.cadre;
  const largeur = l0 * element.taille, hauteur = h0 * element.taille;
  const groupe = new THREE.Group();

  // Cadre (fond) selon la forme
  const bord = { cadre: 0.09, diplome: 0.11, ecran: 0.12, affiche: 0, note: 0 }[element.forme];
  const couleurCadre = { cadre: '#4a2e20', diplome: '#d89c2a', ecran: '#14101a' }[element.forme];
  let cadre = null;
  if (bord) {
    cadre = new THREE.Mesh(new THREE.BoxGeometry(largeur, hauteur, 0.08), mat({ color: couleurCadre, roughness: element.forme === 'diplome' ? 0.4 : 0.9, metalness: element.forme === 'diplome' ? 0.3 : 0 }));
    cadre.position.z = 0.04;
    cadre.castShadow = true;
    groupe.add(cadre);
  }

  // Surface qui porte l'image
  const lInt = largeur - bord * 2, hInt = hauteur - bord * 2;
  const image = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({ map: null }));
  image.position.z = bord ? 0.085 : 0.02;
  groupe.add(image);

  // Ajuste l'image à la place disponible en gardant ses proportions (et le cadre autour d'elle).
  const ajuster = (largeurImage, hauteurImage) => {
    const echelle = Math.min(lInt / largeurImage, hInt / hauteurImage);
    image.scale.set(largeurImage * echelle, hauteurImage * echelle, 1);
    if (cadre) cadre.scale.set((largeurImage * echelle + bord * 2) / largeur, (hauteurImage * echelle + bord * 2) / hauteur, 1);
  };

  const montrer = (texture, l, h) => { image.material.map = texture; image.material.needsUpdate = true; ajuster(l, h); };
  if (element.forme === 'note') {
    montrer(carteNote(element, accent), 1, 1);
  } else {
    montrer(carteAFournir(element, accent), 4, 3);
    // Pour une vidéo, on montre sa vignette sur le mur (la vidéo elle-même se lit dans la visionneuse).
    const source = element.video ? element.vignette : element.fichier;
    if (source) {
      chargeur.load(source, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        montrer(texture, texture.image.width, texture.image.height);
      }, undefined, () => { /* fichier absent : la carte "à fournir" reste affichée */ });
    }
  }

  // Punaises pour les affiches
  if (element.forme === 'affiche') {
    [-1, 1].forEach((cote) => {
      const punaise = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), mat({ color: accent }));
      punaise.position.set(cote * (lInt / 2 - 0.12), hInt / 2 - 0.12, 0.05);
      groupe.add(punaise);
    });
  }

  // Plaque de titre
  const etiquette = plaque(element.titre, Math.min(largeur, 1.8));
  etiquette.position.set(0, -hauteur / 2 - 0.08 - HAUTEUR_PLAQUE / 2, 0.02);
  groupe.add(etiquette);

  image.userData.element = element;
  if (cadre) cadre.userData.element = element;
  return { groupe, cliquables: cadre ? [image, cadre] : [image], largeur, hauteur: hauteur + 0.08 + HAUTEUR_PLAQUE };
}

// Objet de décor : un panneau vertical posé au sol, avec sa propre ombre.
export function creerObjetDecor(element) {
  const hauteur = 1.7 * element.taille, largeur = 1.3 * element.taille;
  const forme = new THREE.PlaneGeometry(1, 1);
  forme.translate(0, 0.5, 0);
  const materiau = mat({ map: carteAFournir(element, '#7d7080'), side: THREE.DoubleSide, alphaTest: 0.5 });
  const objet = new THREE.Mesh(forme, materiau);
  objet.scale.set(largeur, largeur * 0.75, 1);
  objet.castShadow = true;
  if (element.fichier) {
    chargeur.load(element.fichier, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter; // les objets de décor sont du pixel art
      materiau.map = texture; materiau.needsUpdate = true;
      const proportion = texture.image.width / texture.image.height;
      objet.scale.set(hauteur * proportion, hauteur, 1);
      objet.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: texture, alphaTest: 0.5 });
    }, undefined, () => {});
  }
  return objet;
}

// ---------------------------------------------------------------------
// DISPOSITION AUTOMATIQUE
// On essaie de répartir les éléments sur 1, 2, 3 ou 4 rangées, et on garde la répartition
// qui permet de les afficher le plus grand possible dans la surface du mur.
// Renvoie, pour chaque élément, sa position (x, y) au centre de l'objet et son échelle.
// ---------------------------------------------------------------------
export function disposer(blocs, largeurDispo, yBas, yHaut) {
  const n = blocs.length;
  if (!n) return [];
  const hauteurDispo = yHaut - yBas;
  let meilleur = null;
  for (let rangees = 1; rangees <= Math.min(4, n); rangees++) {
    const parRangee = Math.ceil(n / rangees), lignes = [];
    for (let i = 0; i < n; i += parRangee) lignes.push(blocs.slice(i, i + parRangee));
    const largeurMax = Math.max(...lignes.map((r) => r.reduce((s, b) => s + b.largeur, 0) + ESPACE * (r.length - 1)));
    const hauteurTotale = lignes.reduce((s, r) => s + Math.max(...r.map((b) => b.hauteur)), 0) + ESPACE * (lignes.length - 1);
    const echelle = Math.min(1.7, largeurDispo / largeurMax, hauteurDispo / hauteurTotale);
    if (!meilleur || echelle > meilleur.echelle + 0.01) meilleur = { echelle, lignes, hauteurTotale };
  }

  const { echelle, lignes, hauteurTotale } = meilleur;
  const positions = [];
  let y = yBas + hauteurDispo / 2 + (hauteurTotale * echelle) / 2; // haut de la première rangée
  for (const ligne of lignes) {
    const hRangee = Math.max(...ligne.map((b) => b.hauteur)) * echelle;
    const lRangee = (ligne.reduce((s, b) => s + b.largeur, 0) + ESPACE * (ligne.length - 1)) * echelle;
    let x = -lRangee / 2;
    for (const b of ligne) {
      const l = b.largeur * echelle;
      // y désigne le centre de l'élément lui-même, plaque de titre exclue
      positions.push({ x: x + l / 2, y: y - hRangee / 2 + (HAUTEUR_PLAQUE + 0.08) * echelle / 2, echelle });
      x += l + ESPACE * echelle;
    }
    y -= hRangee + ESPACE * echelle;
  }
  return positions;
}
