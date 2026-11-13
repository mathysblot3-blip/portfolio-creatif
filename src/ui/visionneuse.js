// =====================================================================
// VISIONNEUSE
// Quand on regarde un élément du mur, il s'affiche en grand dans un panneau au style "anime"
// (bandes diagonales, titre massif), avec sa photo ou sa vidéo, sa date, sa légende et son lien.
// Flèches gauche et droite : élément précédent ou suivant. Échap : fermer.
// =====================================================================
import { echapper } from '../contenu/lecteur.js';

const NOMS_FORMES = { cadre: 'PHOTO', diplome: 'DIPLOME', affiche: 'AFFICHE', note: 'NOTE', ecran: 'VIDEO', objet: 'DECOR' };

// N'accepte que les vrais liens web, jamais un lien qui exécuterait du code.
const lienSur = (lien) => (/^https?:\/\//i.test(lien || '') ? lien : null);

export function creerVisionneuse() {
  const racine = document.getElementById('visionneuse');
  let elements = [], index = 0, ouverte = false, surFermeture = null;

  function afficher() {
    const e = elements[index];
    const lien = lienSur(e.lien);
    let media;
    if (e.fichier && e.video) {
      media = `<video src="${echapper(e.fichier)}" ${e.vignette ? `poster="${echapper(e.vignette)}"` : ''} controls autoplay playsinline></video>`;
    } else if (e.fichier) {
      media = `<img src="${echapper(e.fichier)}" alt="${echapper(e.titre)}">`;
    } else {
      media = '';
    }
    // Si le fichier n'existe pas encore, un encadré "à fournir" prend sa place.
    const aFournir = `<div class="a-fournir"><div>${e.nomFichier ? `A FOURNIR<br><b>${echapper(e.nomFichier)}</b>` : 'PAS DE FICHIER<br>POUR CET ELEMENT'}</div></div>`;

    racine.querySelector('.v-num').textContent = `${NOMS_FORMES[e.forme]} ${index + 1} / ${elements.length}`;
    racine.querySelector('.v-titre').textContent = e.titre;
    racine.querySelector('.v-titre').classList.toggle('long', e.titre.length > 20); // titre long : police plus petite
    racine.querySelector('.v-media').innerHTML = media || aFournir;
    racine.querySelector('.v-date').textContent = e.date || '';
    racine.querySelector('.v-date').classList.toggle('cache', !e.date);
    racine.querySelector('.v-texte').innerHTML = echapper(e.texte).replace(/\n/g, '<br>')
      .replace(/\[(CONTENU|À CONFIRMER)\]/g, '<mark>[$1]</mark>');
    const bouton = racine.querySelector('.v-lien');
    bouton.classList.toggle('cache', !lien);
    if (lien) bouton.href = lien;

    // Photo ou vidéo introuvable : on remplace par l'encadré "à fournir".
    const balise = racine.querySelector('.v-media img, .v-media video');
    if (balise) balise.addEventListener('error', () => { racine.querySelector('.v-media').innerHTML = aFournir; }, { once: true });
  }

  function couperVideo() {
    const video = racine.querySelector('video');
    if (video) video.pause();
  }

  function ouvrir(liste, depart, accent, quandFerme) {
    elements = liste; index = depart; ouverte = true; surFermeture = quandFerme;
    racine.style.setProperty('--acc', accent);
    afficher();
    racine.classList.remove('cache', 'fermeture');
    // Relance les animations d'entrée à chaque ouverture
    [...racine.children].forEach((enfant) => { enfant.style.animation = 'none'; void enfant.offsetHeight; enfant.style.animation = ''; });
  }

  function fermer() {
    if (!ouverte) return;
    ouverte = false;
    couperVideo();
    racine.classList.add('fermeture');
    setTimeout(() => { racine.classList.add('cache'); racine.querySelector('.v-media').innerHTML = ''; }, 220);
    if (surFermeture) surFermeture();
  }

  function decaler(sens) {
    couperVideo();
    index = (index + sens + elements.length) % elements.length;
    afficher();
  }

  racine.querySelector('.v-fermer').addEventListener('click', fermer);
  racine.querySelector('.v-prec').addEventListener('click', () => decaler(-1));
  racine.querySelector('.v-suiv').addEventListener('click', () => decaler(1));
  racine.querySelector('.v-fond').addEventListener('click', fermer);

  return { ouvrir, fermer, suivant: () => decaler(1), precedent: () => decaler(-1), estOuverte: () => ouverte };
}
