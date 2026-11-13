// =====================================================================
// INTERFACE EN JEU (HUD)
// Le cartouche en haut à gauche (nom du lieu), l'invite qui apparaît devant une porte ou un élément,
// l'aide des commandes et les notifications. Ces éléments sont du HTML posé par-dessus la scène 3D.
// =====================================================================

const element = (id) => document.getElementById(id);

const AIDES = {
  ville: 'ZQSD / FLECHES : SE DEPLACER<br>CLIC : ALLER ICI · E / ENTREE : ENTRER',
  piece: 'ZQSD / FLECHES : SE DEPLACER · E : REGARDER<br>CLIC : REGARDER · ECHAP : SORTIR',
  visionneuse: '&lt; &gt; : ELEMENT PRECEDENT / SUIVANT<br>ECHAP : FERMER',
};

export function creerHud(nombreDeLieux) {
  const invite = element('invite'), notification = element('notification');
  const titre = element('cartouche').querySelector('b'), sousTitre = element('visites');
  let minuterie, nombreVisites = 0;

  // Affiche un message court en bas (devant une porte, un élément...), ou le cache si texte vaut null.
  function afficherInvite(texte, accent = '#e0507a', touche = 'E / ENTREE') {
    if (!texte) { invite.classList.add('cache'); return; }
    invite.innerHTML = `▶ ${texte} <small>${touche}</small>`;
    invite.style.boxShadow = `6px 6px 0 ${accent}`;
    invite.classList.remove('cache');
  }

  // Petit message temporaire en haut de l'écran.
  function notifier(message, duree = 2600) {
    notification.innerHTML = message;
    notification.classList.add('visible');
    clearTimeout(minuterie);
    minuterie = setTimeout(() => notification.classList.remove('visible'), duree);
  }

  function majCompteur(nombre) {
    nombreVisites = nombre;
    if (titre.dataset.mode !== 'piece') sousTitre.textContent = `LIEUX VISITES ${nombre}/${nombreDeLieux}`;
  }

  // Ville : titre du site et compteur. Pièce : nom du lieu et section.
  function modeVille() {
    titre.dataset.mode = 'ville';
    titre.textContent = 'PORTFOLIO CRÉATIF';
    element('cartouche').style.borderBottomColor = '';
    majCompteur(nombreVisites);
    element('aide').innerHTML = AIDES.ville;
  }

  function modePiece(lieu) {
    titre.dataset.mode = 'piece';
    titre.textContent = lieu.nom;
    sousTitre.textContent = lieu.section.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    element('cartouche').style.borderBottomColor = lieu.accent;
    element('aide').innerHTML = AIDES.piece;
  }

  function aideVisionneuse(ouverte) {
    element('aide').innerHTML = ouverte ? AIDES.visionneuse : AIDES.piece;
  }

  modeVille();
  return { afficherInvite, notifier, majCompteur, modeVille, modePiece, aideVisionneuse };
}
