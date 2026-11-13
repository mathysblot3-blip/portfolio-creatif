// =====================================================================
// MUSIQUE
// Joue en boucle le thème composé par Mathys sous FL Studio.
// Le fichier se dépose dans assets/audio/ (theme.mp3 ou theme.ogg) : tant qu'il n'existe pas,
// le bouton de musique reste caché et rien n'est demandé au serveur.
// Les navigateurs interdisent le son avant un premier clic : la musique démarre donc
// au clic sur « ENTRER » de l'écran titre. Le choix « son coupé » est mémorisé.
// =====================================================================
const FICHIERS = import.meta.glob('/assets/audio/theme.{mp3,ogg,wav}', { eager: true, query: '?url', import: 'default' });
const URL_THEME = Object.values(FICHIERS)[0] ?? null;
const VOLUME = 0.45;
const CLE_MEMOIRE = 'portfolio-son-coupe';

// Lecture protégée du stockage du navigateur (il peut être bloqué en navigation privée).
function lireMemoire() { try { return localStorage.getItem(CLE_MEMOIRE) === '1'; } catch { return false; } }
function ecrireMemoire(coupe) { try { localStorage.setItem(CLE_MEMOIRE, coupe ? '1' : '0'); } catch { /* sans importance */ } }

export function creerMusique() {
  const bouton = document.getElementById('bouton-son');
  if (!URL_THEME) return { demarrer() {} }; // pas encore de thème : rien à faire

  const audio = new Audio(URL_THEME);
  audio.loop = true;
  audio.volume = 0;
  let coupe = lireMemoire(), demarre = false;

  function afficher() {
    bouton.textContent = coupe ? '♪ SON COUPE' : '♪ MUSIQUE'; // la police pixel n'a pas d'accents
    bouton.classList.toggle('coupe', coupe);
  }

  // Monte le volume progressivement plutôt que d'un coup.
  function fondu(cible, duree = 1200) {
    const depart = audio.volume, debut = performance.now();
    const etape = (t) => {
      const k = Math.min(1, (t - debut) / duree);
      audio.volume = depart + (cible - depart) * k;
      if (k < 1) requestAnimationFrame(etape);
      else if (cible === 0) audio.pause();
    };
    requestAnimationFrame(etape);
  }

  function jouer() { audio.play().then(() => fondu(VOLUME)).catch(() => { /* lecture refusée : on réessaiera au prochain clic */ }); }

  // Appelée au clic sur « ENTRER »
  function demarrer() {
    demarre = true;
    bouton.classList.remove('cache');
    afficher();
    if (!coupe) jouer();
  }

  bouton.addEventListener('click', () => {
    coupe = !coupe;
    ecrireMemoire(coupe);
    afficher();
    if (!demarre) return;
    if (coupe) fondu(0, 400); else jouer();
  });

  return { demarrer };
}
