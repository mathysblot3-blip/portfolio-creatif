// =====================================================================
// RÉGLAGES DU RENDU
// Tous les nombres qui définissent "le look" du site sont ici.
// En développement, le panneau à droite de l'écran modifie ces valeurs en direct.
// Quand un réglage te plaît, clique sur "Copier les réglages" puis colle le résultat ici.
// =====================================================================

// Densité de texels : nombre de pixels de texture par unité 3D (1 unité = environ 1 mètre).
// Un sprite de 32 × 48 px mesure donc 1 × 1,5 unité.
export const TEXELS_PAR_UNITE = 32;

export const REGLAGES = {
  // 'haute' : flou de profondeur, bloom et ombres fines. 'basse' : tout coupé pour les machines faibles.
  qualite: 'haute',

  camera: {
    fov: 22,          // angle de vue vertical en degrés. Petit = longue focale, peu de déformation
    distance: 32,    // distance entre la caméra et le personnage, en unités
    inclinaison: 30,  // hauteur de la caméra : angle au-dessus du sol, vu depuis le personnage
    visee: 27,        // angle de plongée de la caméra. Plus petit que l'inclinaison = perso plus bas à l'écran, plus de ciel
    amorti: 4,        // vitesse du suivi. Grand = caméra nerveuse, petit = caméra molle
    avance: 1.5,      // la caméra regarde un peu devant le perso, dans le sens de la marche (en unités)
  },

  flou: {
    zoneAvant: 3,     // distance devant le perso qui reste nette (en unités)
    zoneArriere: 16,  // distance derrière le perso qui reste nette
    transition: 10,   // distance sur laquelle le flou monte de zéro à son maximum
    rayonMax: 0.02,   // taille maximale du flou, en fraction de la hauteur de l'écran
  },

  bloom: {
    force: 0.28,      // intensité du halo autour des zones lumineuses
    rayon: 0.7,       // étalement du halo
    seuil: 0.9,       // luminosité à partir de laquelle une zone produit un halo
  },

  lumiere: {
    soleilIntensite: 3.6,
    soleilCouleur: '#ffd7a0',
    soleilAzimut: -40,   // direction du soleil en degrés : négatif = il vient de la gauche
    soleilHauteur: 30,   // hauteur du soleil au-dessus de l'horizon. Bas = ombres longues
    cielIntensite: 0.7,
    cielCouleur: '#b8c8ff', // lumière d'ambiance venant du ciel (teinte les zones à l'ombre)
    solCouleur: '#b98a5e',  // lumière d'ambiance renvoyée par le sol
  },

  image: {
    exposition: 0.9,
    saturation: 1.1,
    chaleur: 0.05,    // 0 = neutre. Positif = image plus dorée
    vignette: 0.65,   // assombrissement des coins de l'écran
  },

  brume: {
    debut: 55,        // distance à partir de laquelle la brume apparaît
    fin: 170,         // distance où elle est maximale
    densite: 0.6,
    desaturation: 0.6, // la brume retire aussi de la couleur au lointain
    couleur: '#f1d9b0',
  },
};
