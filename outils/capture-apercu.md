# Refaire l'image d'aperçu (public/og.png)

L'image qui s'affiche quand on partage le lien du site est une vraie capture du jeu, avec le titre ajouté par-dessus. À refaire quand le décor change (par exemple après l'arrivée des assets générés).

1. Lancer `npm run dev` et ouvrir `http://localhost:5173/?direct` dans une fenêtre de **1200 × 630** (Claude peut régler cette taille dans son navigateur intégré).
2. Coller le code ci-dessous dans la console du navigateur (F12, onglet Console), puis Entrée.
3. Le fichier `public/og.png` est écrit par le serveur de développement (fonction `capture-apercu` dans `vite.config.js`, qui n'existe pas sur le site en ligne).

```js
const P = window.__portfolio;
document.querySelectorAll('.lil-gui').forEach((e) => e.remove());
const pos = P.joueur.position; pos.set(-1.5, 0, 6.2);      // perso devant la fontaine
P.cam.suivre(pos, new pos.constructor(), 0, true);         // caméra placée directement sur lui
P.post.definirMiseAuPoint(P.cam.profondeurDe(pos));
P.post.rendre();
const c = Object.assign(document.createElement('canvas'), { width: 1200, height: 630 });
const g = c.getContext('2d');
g.drawImage(document.getElementById('vue'), 0, 0, 1200, 630);
const voile = g.createLinearGradient(0, 0, 0, 630);
voile.addColorStop(0, 'rgba(13,11,26,0.7)'); voile.addColorStop(0.45, 'rgba(13,11,26,0)');
g.fillStyle = voile; g.fillRect(0, 0, 1200, 630);
g.save(); g.translate(600, 120); g.transform(1, 0, -0.14, 1, 0, 0);
g.font = '104px Anton'; g.textAlign = 'center'; g.textBaseline = 'middle';
g.fillStyle = '#e0507a'; g.fillText('PORTFOLIO CRÉATIF', 10, 10);
g.fillStyle = '#0d0b1a'; g.fillText('PORTFOLIO CRÉATIF', 6, 6);
g.fillStyle = '#f4ecd8'; g.fillText('PORTFOLIO CRÉATIF', 0, 0);
g.restore();
g.font = '600 34px "Space Grotesk"'; g.textAlign = 'center'; g.fillStyle = '#e8c46a';
g.fillText('Mathys Blot', 600, 215);
const image = await new Promise((r) => c.toBlob(r, 'image/png'));
console.log(await (await fetch('/__capture', { method: 'POST', body: image })).text());
```
