// =====================================================================
// ASSETS GÉNÉRÉS (images et vidéo)
// Chaque asset a un identifiant (par exemple "facade/ecole") décrit dans assets/assets.json.
// Son fichier traité se trouve dans assets/ia/<identifiant>.png (ou .webp, .mp4).
//
// Règle d'or : si le fichier n'existe pas, le jeu garde la version provisoire dessinée par le code.
// Remplacer un asset = déposer le fichier au bon nom, sans toucher au code.
// =====================================================================
import * as THREE from 'three';
import CATALOGUE from '../../assets/assets.json';

// Vite liste ici, au moment de la compilation, tous les fichiers réellement présents dans assets/ia/.
// Un fichier absent n'est donc jamais demandé au serveur (aucune erreur 404).
const FICHIERS = import.meta.glob('/assets/ia/**/*.{png,webp,mp4,webm}', { eager: true, query: '?url', import: 'default' });

const INFOS = new Map(CATALOGUE.assets.map((a) => [a.id, a]));
const chargeur = new THREE.TextureLoader();
const sources = new Map(); // une seule image téléchargée par asset, partagée par toutes ses copies

// Adresse du fichier d'un asset, ou null s'il n'a pas encore été produit.
export function urlAsset(id, extensions = ['png', 'webp']) {
  for (const ext of extensions) {
    const url = FICHIERS[`/assets/ia/${id}.${ext}`];
    if (url) return url;
  }
  return null;
}

// Fiche de l'asset dans le catalogue (taille, type, rôle...).
export function infoAsset(id) {
  return INFOS.get(id) ?? null;
}

// Texture pixel art d'un asset, ou null s'il manque.
// Chaque appel renvoie une copie indépendante (réglages de répétition propres),
// mais l'image elle-même n'est téléchargée qu'une fois.
export function textureAsset(id, { repetable = false } = {}) {
  const url = urlAsset(id);
  if (!url) return null;
  if (!sources.has(id)) sources.set(id, chargeur.load(url));
  const t = sources.get(id).clone();
  t.magFilter = THREE.NearestFilter;                 // pixels nets de près
  t.minFilter = repetable ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter;
  t.generateMipmaps = repetable;
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = repetable ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}

// Raccourci : l'asset s'il existe, sinon la texture provisoire fabriquée par la fonction donnée.
export function textureOu(id, provisoire, options = {}) {
  return textureAsset(id, options) ?? provisoire();
}

// Découpe une planche de sprites (grille colonnes × lignes) en une texture par case.
// Renvoie un tableau de lignes, chaque ligne étant un tableau d'images, ou null si la planche manque.
export function decouperPlanche(id) {
  const info = infoAsset(id);
  const base = textureAsset(id);
  if (!base || !info?.grille) return null;
  const [colonnes, lignes] = info.grille;
  const resultat = [];
  for (let l = 0; l < lignes; l++) {
    const ligne = [];
    for (let c = 0; c < colonnes; c++) {
      const t = base.clone();
      t.repeat.set(1 / colonnes, 1 / lignes);
      // Dans three.js, l'axe vertical des textures part du bas : la ligne 0 (en haut) a le plus grand décalage.
      t.offset.set(c / colonnes, 1 - (l + 1) / lignes);
      ligne.push(t);
    }
    resultat.push(ligne);
  }
  return resultat;
}

// Bilan affiché dans la console en développement : quels assets sont déjà là, lesquels manquent.
export function bilanAssets() {
  const presents = [], manquants = [];
  for (const a of CATALOGUE.assets) {
    if (a.type === 'reference' || a.sortie) continue; // non utilisés directement par le jeu
    (urlAsset(a.id, ['png', 'webp', 'mp4', 'webm']) ? presents : manquants).push(a.id);
  }
  return { presents, manquants };
}
