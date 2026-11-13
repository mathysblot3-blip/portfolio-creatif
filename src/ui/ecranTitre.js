// =====================================================================
// ÉCRAN TITRE
// Premier écran du site : le titre, le nom et un bouton « ENTRER », posés sur un fond animé.
//   - Si la vidéo générée existe (assets/ia/titre/fond.mp4), elle tourne en boucle derrière le titre.
//   - Sinon, le fond est la place elle-même, filmée par une caméra qui glisse lentement.
// Le titre et le bouton sont toujours dessinés par le code (jamais incrustés dans la vidéo).
// Le clic sur « ENTRER » sert aussi de premier geste de l'utilisateur, exigé par les navigateurs
// avant de lancer la musique.
// Pour sauter l'écran titre pendant les essais : ajouter ?direct à l'adresse.
// =====================================================================
import { urlAsset } from '../engine/assets.js';
import { TACTILE } from '../engine/rendu.js';

export function creerEcranTitre({ aLEntree }) {
  const ecran = document.getElementById('titre');
  const bouton = ecran.querySelector('.t-entrer');
  const urlVideo = urlAsset('titre/fond', ['mp4', 'webm']);
  let actif = true;
  if (TACTILE) ecran.querySelector('.t-aide').textContent = 'TOUT SE FAIT AU DOIGT';

  if (urlVideo) {
    // Vidéo muette, en boucle, lue directement dans la page (pas de plein écran sur téléphone).
    const video = document.createElement('video');
    Object.assign(video, { src: urlVideo, muted: true, loop: true, autoplay: true, playsInline: true });
    video.className = 't-video';
    ecran.prepend(video);
    ecran.classList.add('avec-video');
  }

  function fermer() {
    if (!actif) return;
    actif = false;
    ecran.classList.add('fermeture');
    document.body.classList.remove('en-titre');
    setTimeout(() => { ecran.classList.add('cache'); ecran.querySelector('.t-video')?.pause(); }, 600);
    aLEntree();
  }

  bouton.addEventListener('click', fermer);
  addEventListener('keydown', (e) => { if (actif && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); fermer(); } });

  if (new URLSearchParams(location.search).has('direct')) {
    // Démarrage direct, sans animation
    actif = false;
    ecran.classList.add('cache');
    document.body.classList.remove('en-titre');
    setTimeout(aLEntree, 0);
  }

  return { estActif: () => actif, avecVideo: Boolean(urlVideo) };
}
