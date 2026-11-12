// =====================================================================
// INTERFACE EN JEU (HUD)
// Le compteur de lieux visités, l'invite qui apparaît devant une porte et les notifications.
// Ces éléments sont du HTML ordinaire posé par-dessus la scène 3D.
// =====================================================================

const element = (id) => document.getElementById(id);

export function creerHud(nombreDeLieux) {
  const invite = element('invite'), notification = element('notification'), visites = element('visites');
  let minuterie;

  // Affiche "▶ NOM DU LIEU" quand le perso est devant une porte, ou cache l'invite si lieu vaut null.
  function afficherInvite(lieu) {
    if (!lieu) { invite.classList.add('cache'); return; }
    invite.innerHTML = `▶ ${lieu.nom} <small>E / ENTREE</small>`;
    invite.style.boxShadow = `6px 6px 0 ${lieu.accent}`;
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
    visites.textContent = `LIEUX VISITES ${nombre}/${nombreDeLieux}`;
  }

  majCompteur(0);
  return { afficherInvite, notifier, majCompteur };
}
