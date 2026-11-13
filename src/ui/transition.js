// =====================================================================
// TRANSITION
// Une bande diagonale aux couleurs du lieu balaie l'écran. Pendant qu'elle couvre tout,
// on change de scène (rue vers intérieur, ou l'inverse), puis elle repart de l'autre côté.
// =====================================================================

const DUREE_ENTREE = 380, DUREE_SORTIE = 420; // millisecondes, à garder égales à style.css

export function creerTransition() {
  const volet = document.getElementById('volet');
  let enCours = false;

  // pendant : fonction appelée quand l'écran est entièrement couvert.
  function jouer(accent, pendant) {
    if (enCours) return;
    enCours = true;
    volet.style.setProperty('--acc', accent);
    volet.className = 'entre';
    setTimeout(() => {
      pendant();
      volet.className = 'sort';
      setTimeout(() => { volet.className = ''; enCours = false; }, DUREE_SORTIE);
    }, DUREE_ENTREE);
  }

  return { jouer, enCours: () => enCours };
}
