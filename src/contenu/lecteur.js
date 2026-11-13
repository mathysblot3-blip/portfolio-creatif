// =====================================================================
// LECTEUR DE CONTENU
// Lit les fichiers contenu/*.md (un par lieu) et les transforme en liste d'éléments à accrocher au mur.
// Format d'un fichier (voir GUIDE_CONTENU.md) :
//   # PREUVES            -> les éléments qui suivent sont des preuves (contenu factuel)
//   # DÉCOR              -> les éléments qui suivent sont purement décoratifs
//   ## Titre             -> un nouvel élément
//   forme: cadre         -> réglages de l'élément, sous la forme "nom: valeur"
//   Texte libre          -> toute autre ligne devient la légende
// Les commentaires <!-- ... --> sont ignorés.
// =====================================================================

// Vite lit tous les fichiers .md du dossier contenu au moment de la compilation.
const FICHIERS = import.meta.glob('../../contenu/*.md', { query: '?raw', import: 'default', eager: true });

// Réglages reconnus dans un élément. Toute autre ligne "mot: texte" reste dans la légende.
const REGLAGES_CONNUS = ['forme', 'fichier', 'vignette', 'date', 'lien', 'taille'];
const FORMES = ['cadre', 'diplome', 'affiche', 'note', 'ecran', 'objet'];
const EXTENSIONS_VIDEO = ['mp4', 'webm', 'mov', 'm4v'];

// Dossier public des médias. BASE_URL vaut "./" : le site fonctionne quelle que soit son adresse.
const dossierMedias = (cle) => `${import.meta.env.BASE_URL}medias/${cle}/`;

// Un réglage vide ou encore à remplir ne doit pas être utilisé comme vrai fichier ou lien.
const estRempli = (valeur) => valeur && !/^\[.*\]$/.test(valeur.trim()) && !valeur.includes('[CONTENU]');

export function lireContenu(cle) {
  const chemin = Object.keys(FICHIERS).find((c) => c.endsWith(`/${cle}.md`));
  if (!chemin) return { elements: [], manquant: true };
  return { elements: analyser(FICHIERS[chemin], cle), manquant: false };
}

function analyser(texte, cle) {
  const sansCommentaires = texte.replace(/<!--[\s\S]*?-->/g, '');
  const elements = [];
  let role = 'preuve', courant = null;

  for (const ligneBrute of sansCommentaires.split(/\r?\n/)) {
    const ligne = ligneBrute.trim();
    if (!ligne) continue;

    if (/^#\s/.test(ligne)) {                       // titre de partie : PREUVES ou DÉCOR
      role = /D[ÉE]COR/i.test(ligne) ? 'deco' : 'preuve';
      courant = null;
      continue;
    }
    if (/^##\s/.test(ligne)) {                      // nouvel élément
      courant = { titre: ligne.replace(/^##\s+/, ''), role, forme: role === 'deco' ? 'objet' : 'cadre', texte: [] };
      elements.push(courant);
      continue;
    }
    if (!courant) continue;                         // texte placé avant le premier élément : ignoré

    const reglage = ligne.match(/^([a-zA-Zéè]+)\s*:\s*(.*)$/);
    if (reglage && REGLAGES_CONNUS.includes(reglage[1].toLowerCase())) {
      courant[reglage[1].toLowerCase()] = reglage[2].trim();
    } else {
      courant.texte.push(ligne);
    }
  }

  // Mise en forme finale de chaque élément
  return elements.map((e, index) => {
    const forme = FORMES.includes(e.forme) ? e.forme : 'cadre';
    const fichier = estRempli(e.fichier) ? dossierMedias(cle) + e.fichier : null;
    const extension = (e.fichier || '').split('.').pop().toLowerCase();
    return {
      id: `${cle}-${index}`,
      titre: e.titre,
      role: e.role,
      forme,
      fichier,
      nomFichier: e.fichier || null,
      video: EXTENSIONS_VIDEO.includes(extension),
      vignette: estRempli(e.vignette) ? dossierMedias(cle) + e.vignette : null,
      date: e.date || null,
      lien: estRempli(e.lien) ? e.lien : null,
      taille: { petit: 0.75, grand: 1.35 }[e.taille] ?? 1,
      texte: e.texte.join('\n'),
    };
  });
}

// Échappe le texte avant de l'insérer dans la page (évite qu'un caractère < casse l'affichage).
export function echapper(texte) {
  return String(texte ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
