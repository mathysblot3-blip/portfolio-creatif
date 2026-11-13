// Configuration de Vite, l'outil qui sert le site en développement et le compile pour la mise en ligne.
import { defineConfig } from 'vite';
import { writeFileSync } from 'node:fs';

// Outil de développement uniquement : reçoit une capture de l'écran envoyée par la page
// (voir outils/capture-apercu.md) et l'enregistre dans public/. N'existe pas sur le site en ligne.
const capture = {
  name: 'capture-apercu',
  apply: 'serve',
  configureServer(serveur) {
    serveur.middlewares.use('/__capture', (requete, reponse) => {
      if (requete.method !== 'POST') { reponse.statusCode = 405; reponse.end(); return; }
      const morceaux = [];
      requete.on('data', (m) => morceaux.push(m));
      requete.on('end', () => {
        writeFileSync('public/og.png', Buffer.concat(morceaux));
        reponse.end('public/og.png enregistré');
      });
    });
  },
};

export default defineConfig({
  // Chemins relatifs : le site fonctionne quelle que soit l'adresse GitHub Pages
  // (par exemple https://ton-compte.github.io/portfolio-creatif/).
  base: './',
  build: {
    target: 'es2022',
  },
  plugins: [capture],
});
