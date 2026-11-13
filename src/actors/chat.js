// =====================================================================
// LE CHAT (easter egg)
// Un chat roux attend près de la fontaine. Quand le perso passe tout près, il se met à le suivre
// partout sur la place, en gardant une petite distance.
// Image : la planche générée (assets/ia/perso/chat.png, 4 images × 3 directions) si elle existe,
// sinon un chat de 24 × 24 px dessiné par le code.
// =====================================================================
import { creerLutin } from './lutin.js';
import { texturePixel } from '../engine/textures.js';
import { decouperPlanche } from '../engine/assets.js';

const TAILLE = 24;              // px
const DISTANCE_REVEIL = 2.2;    // le chat se lève quand le perso passe à moins de cette distance
const DISTANCE_SUIVI = 1.3;     // distance qu'il garde derrière le perso
const VITESSE_MAX = 6.5;        // un peu plus vite que le perso, pour ne pas se faire distancer
const DUREE_IMAGE = 0.11;

// ---------- Chat provisoire dessiné par le code ----------
const C = { poil: '#e09040', ombre: '#a8741c', clair: '#f8dc78', nez: '#e0507a', oeil: '#14101a', contour: '#2b2433' };

function dessinerChat(g, direction, pas) {
  const r = (c, x, y, l, h) => { g.fillStyle = C[c]; g.fillRect(x, y, l, h); };
  const lever = (n) => (pas === n ? 1 : 0);
  if (direction === 'profil') {
    r('poil', 5, 12, 13, 6); r('ombre', 5, 16, 13, 2);                       // corps
    r('poil', 15, 7, 7, 7); r('poil', 16, 5, 2, 2); r('poil', 20, 5, 2, 2);   // tête et oreilles
    r('oeil', 19, 9, 1, 2); r('nez', 21, 11, 1, 1);
    r('ombre', 7, 18, 2, 4 - lever(1)); r('ombre', 15, 18, 2, 4 - lever(2)); // pattes
    r('poil', 9, 18, 2, 4 - lever(2)); r('poil', 13, 18, 2, 4 - lever(1));
    r('poil', 2, 9, 3, 2); r('poil', 1, 6, 2, 4);                             // queue dressée
    r('clair', 9, 13, 2, 2); r('clair', 13, 13, 2, 2);                        // rayures
  } else {
    r('poil', 7, 13, 10, 6); r('ombre', 7, 17, 10, 2);
    r('ombre', 8, 19, 2, 3 - lever(1)); r('ombre', 14, 19, 2, 3 - lever(2));
    r('poil', 7, 5, 10, 9); r('poil', 7, 3, 2, 2); r('poil', 15, 3, 2, 2);
    if (direction === 'face') {
      r('clair', 9, 10, 6, 4); r('oeil', 9, 8, 1, 2); r('oeil', 14, 8, 1, 2); r('nez', 11, 10, 2, 1);
    } else {
      r('ombre', 9, 6, 1, 4); r('ombre', 12, 6, 1, 4); r('ombre', 15, 6, 1, 3);
      r('poil', 11, 9 - lever(1), 2, 4); r('poil', 11, 6 - lever(1), 2, 3);  // queue vue de dos
    }
  }
  // Contour sombre d'un pixel autour de la silhouette
  const image = g.getImageData(0, 0, TAILLE, TAILLE), d = image.data, bord = [];
  const plein = (x, y) => x >= 0 && x < TAILLE && y >= 0 && y < TAILLE && d[(y * TAILLE + x) * 4 + 3] > 0;
  for (let y = 0; y < TAILLE; y++) for (let x = 0; x < TAILLE; x++) {
    if (!plein(x, y) && (plein(x + 1, y) || plein(x - 1, y) || plein(x, y + 1) || plein(x, y - 1))) bord.push([x, y]);
  }
  g.fillStyle = C.contour;
  bord.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
}

function imagesChat() {
  const planche = decouperPlanche('perso/chat');
  if (planche) return { face: planche[0], dos: planche[1], profil: planche[2] };
  const images = {};
  ['face', 'dos', 'profil'].forEach((direction) => {
    images[direction] = [0, 1, 0, 2].map((pas) => texturePixel(TAILLE, TAILLE, (g) => dessinerChat(g, direction, pas), { repetable: false }));
  });
  return images;
}

export function creerChat(scene, x, z) {
  const images = imagesChat();
  const lutin = creerLutin(images.face[0], TAILLE, TAILLE);
  lutin.position.set(x, 0, z);
  scene.add(lutin);
  let reveille = false, orientation = 'face', miroir = false, image = 0, chrono = 0;

  // Appelée à chaque image quand on est sur la place.
  function mettreAJour(dt, cible, collisions) {
    const p = lutin.position, dx = cible.x - p.x, dz = cible.z - p.z, distance = Math.hypot(dx, dz);
    if (!reveille) {
      if (distance < DISTANCE_REVEIL) reveille = true;
      else return;
    }
    // Retour d'un bâtiment : le perso a "sauté" loin, le chat le rejoint directement.
    if (distance > 12) { p.set(cible.x - 1, 0, cible.z + 0.4); return; }

    if (distance > DISTANCE_SUIVI) {
      const vitesse = Math.min(VITESSE_MAX, (distance - DISTANCE_SUIVI) * 4 + 1.5);
      const pasX = (dx / distance) * vitesse * dt, pasZ = (dz / distance) * vitesse * dt;
      if (!collisions.bloque(p.x + pasX, p.z)) p.x += pasX;
      if (!collisions.bloque(p.x, p.z + pasZ)) p.z += pasZ;
      if (Math.abs(dx) > Math.abs(dz)) { orientation = 'profil'; miroir = dx < 0; } else { orientation = dz < 0 ? 'dos' : 'face'; miroir = false; }
      chrono += dt;
      if (chrono > DUREE_IMAGE) { chrono = 0; image = (image + 1) % 4; }
    } else {
      image = 0;
    }
    lutin.userData.afficher(images[orientation][image], miroir);
  }

  return { lutin, mettreAJour, estReveille: () => reveille };
}
