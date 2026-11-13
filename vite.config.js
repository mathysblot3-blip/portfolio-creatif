// Configuration de Vite, l'outil qui sert le site en développement et le compile pour la mise en ligne.
import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le site fonctionne quelle que soit l'adresse GitHub Pages
  // (par exemple https://ton-compte.github.io/portfolio-creatif/).
  base: './',
  build: {
    target: 'es2022',
  },
});
