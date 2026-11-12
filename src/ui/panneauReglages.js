// =====================================================================
// PANNEAU DE RÉGLAGES (développement uniquement)
// Des curseurs pour modifier le rendu en direct et le comparer aux captures de référence.
// Il n'apparaît pas sur le site publié, sauf si on ajoute ?reglages à l'adresse.
// =====================================================================
import GUI from 'lil-gui';

export function creerPanneau(REGLAGES, appliquer) {
  const panneau = new GUI({ title: 'Réglages du rendu', width: 300 });
  const maj = () => appliquer();

  panneau.add(REGLAGES, 'qualite', ['haute', 'basse']).name('Qualité').onChange(maj);

  const camera = panneau.addFolder('Caméra');
  camera.add(REGLAGES.camera, 'fov', 10, 45, 0.5).name('Angle de vue').onChange(maj);
  camera.add(REGLAGES.camera, 'distance', 10, 70, 0.5).name('Distance').onChange(maj);
  camera.add(REGLAGES.camera, 'inclinaison', 3, 45, 0.5).name('Hauteur (angle)').onChange(maj);
  camera.add(REGLAGES.camera, 'visee', 0, 45, 0.5).name('Plongée').onChange(maj);
  camera.add(REGLAGES.camera, 'amorti', 0.5, 12, 0.1).name('Vitesse du suivi');
  camera.add(REGLAGES.camera, 'avance', 0, 5, 0.1).name('Avance');

  const flou = panneau.addFolder('Flou de profondeur');
  flou.add(REGLAGES.flou, 'zoneAvant', 0, 30, 0.5).name('Zone nette devant').onChange(maj);
  flou.add(REGLAGES.flou, 'zoneArriere', 0, 60, 0.5).name('Zone nette derrière').onChange(maj);
  flou.add(REGLAGES.flou, 'transition', 1, 60, 0.5).name('Transition').onChange(maj);
  flou.add(REGLAGES.flou, 'rayonMax', 0, 0.03, 0.0005).name('Force du flou').onChange(maj);

  const bloom = panneau.addFolder('Halo (bloom)');
  bloom.add(REGLAGES.bloom, 'force', 0, 1.5, 0.01).name('Force').onChange(maj);
  bloom.add(REGLAGES.bloom, 'rayon', 0, 1, 0.01).name('Étalement').onChange(maj);
  bloom.add(REGLAGES.bloom, 'seuil', 0, 1.5, 0.01).name('Seuil').onChange(maj);

  const lumiere = panneau.addFolder('Lumière');
  lumiere.add(REGLAGES.lumiere, 'soleilIntensite', 0, 8, 0.1).name('Soleil').onChange(maj);
  lumiere.addColor(REGLAGES.lumiere, 'soleilCouleur').name('Couleur du soleil').onChange(maj);
  lumiere.add(REGLAGES.lumiere, 'soleilAzimut', -180, 180, 1).name('Direction').onChange(maj);
  lumiere.add(REGLAGES.lumiere, 'soleilHauteur', 5, 85, 1).name('Hauteur du soleil').onChange(maj);
  lumiere.add(REGLAGES.lumiere, 'cielIntensite', 0, 4, 0.05).name('Ambiance').onChange(maj);
  lumiere.addColor(REGLAGES.lumiere, 'cielCouleur').name('Couleur du ciel').onChange(maj);
  lumiere.addColor(REGLAGES.lumiere, 'solCouleur').name('Couleur du sol').onChange(maj);

  const image = panneau.addFolder('Image');
  image.add(REGLAGES.image, 'exposition', 0.3, 2.5, 0.01).name('Exposition').onChange(maj);
  image.add(REGLAGES.image, 'saturation', 0, 2, 0.01).name('Saturation').onChange(maj);
  image.add(REGLAGES.image, 'chaleur', -0.3, 0.3, 0.005).name('Chaleur').onChange(maj);
  image.add(REGLAGES.image, 'vignette', 0, 1, 0.01).name('Vignette').onChange(maj);

  const brume = panneau.addFolder('Brume du lointain');
  brume.add(REGLAGES.brume, 'debut', 0, 200, 1).name('Début').onChange(maj);
  brume.add(REGLAGES.brume, 'fin', 20, 400, 1).name('Fin').onChange(maj);
  brume.add(REGLAGES.brume, 'densite', 0, 1, 0.01).name('Densité').onChange(maj);
  brume.add(REGLAGES.brume, 'desaturation', 0, 1, 0.01).name('Désaturation').onChange(maj);
  brume.addColor(REGLAGES.brume, 'couleur').name('Couleur').onChange(maj);

  // Copie tous les réglages dans le presse-papiers, prêts à être collés dans reglages.js (ou envoyés à Claude).
  panneau.add({
    copier: () => navigator.clipboard.writeText(JSON.stringify(REGLAGES, null, 2)),
  }, 'copier').name('Copier les réglages');

  [flou, bloom, lumiere, image, brume].forEach((dossier) => dossier.close());
  return panneau;
}
