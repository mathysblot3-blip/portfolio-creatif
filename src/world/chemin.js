// =====================================================================
// RECHERCHE DE CHEMIN (algorithme A*)
// Quand on clique quelque part, le perso doit contourner la fontaine et les bâtiments.
// On découpe la place en petites cases de 0,5 unité, on note lesquelles sont bloquées,
// puis A* trouve le plus court trajet de case en case.
// =====================================================================

export function creerNavigation(collisions, pas = 0.5) {
  const { xMin, xMax, zMin, zMax } = collisions.limites;
  const colonnes = Math.floor((xMax - xMin) / pas) + 1;
  const lignes = Math.floor((zMax - zMin) / pas) + 1;

  // Le décor ne bouge pas : la grille est calculée une seule fois. 1 = case bloquée.
  const grille = new Uint8Array(colonnes * lignes);
  for (let j = 0; j < lignes; j++) for (let i = 0; i < colonnes; i++) {
    grille[j * colonnes + i] = collisions.bloque(xMin + i * pas, zMin + j * pas) ? 1 : 0;
  }

  const libre = (i, j) => i >= 0 && j >= 0 && i < colonnes && j < lignes && grille[j * colonnes + i] === 0;
  const versCase = (x, z) => [Math.round((x - xMin) / pas), Math.round((z - zMin) / pas)];
  const versMonde = (i, j) => ({ x: xMin + i * pas, z: zMin + j * pas });

  // Si le point visé est dans un obstacle, on prend la case libre la plus proche.
  function caseLibreProche(i, j) {
    if (libre(i, j)) return [i, j];
    for (let rayon = 1; rayon < 24; rayon++) {
      let meilleure = null, distance = Infinity;
      for (let dj = -rayon; dj <= rayon; dj++) for (let di = -rayon; di <= rayon; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== rayon || !libre(i + di, j + dj)) continue;
        const d = di * di + dj * dj;
        if (d < distance) { distance = d; meilleure = [i + di, j + dj]; }
      }
      if (meilleure) return meilleure;
    }
    return null;
  }

  // Vrai si on peut aller de a à b en ligne droite sans rien toucher.
  function ligneLibre(a, b) {
    const longueur = Math.hypot(b.x - a.x, b.z - a.z), etapes = Math.ceil(longueur / 0.2);
    for (let k = 1; k < etapes; k++) {
      const t = k / etapes;
      if (collisions.bloque(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false;
    }
    return true;
  }

  // Renvoie une liste de points à suivre, ou null si aucun trajet n'existe.
  function trouverChemin(x0, z0, x1, z1) {
    const depart = caseLibreProche(...versCase(x0, z0));
    const arrivee = caseLibreProche(...versCase(x1, z1));
    if (!depart || !arrivee) return null;
    const cle = (i, j) => j * colonnes + i;
    const but = cle(...arrivee);

    const cout = new Float32Array(colonnes * lignes).fill(Infinity); // distance parcourue depuis le départ
    const parent = new Int32Array(colonnes * lignes).fill(-1);
    const ferme = new Uint8Array(colonnes * lignes);
    const estime = (i, j) => Math.hypot(i - arrivee[0], j - arrivee[1]); // distance à vol d'oiseau jusqu'au but
    const ouverts = [cle(...depart)];
    cout[ouverts[0]] = 0;

    while (ouverts.length) {
      // On explore toujours la case la plus prometteuse : distance parcourue + distance estimée restante.
      let rang = 0, meilleur = Infinity;
      for (let k = 0; k < ouverts.length; k++) {
        const c = ouverts[k], score = cout[c] + estime(c % colonnes, Math.floor(c / colonnes));
        if (score < meilleur) { meilleur = score; rang = k; }
      }
      const courant = ouverts.splice(rang, 1)[0];
      if (courant === but) break;
      if (ferme[courant]) continue;
      ferme[courant] = 1;
      const i = courant % colonnes, j = Math.floor(courant / colonnes);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = i + di, nj = j + dj;
        if (!libre(ni, nj)) continue;
        if (di && dj && (!libre(i + di, j) || !libre(i, j + dj))) continue; // pas de diagonale qui frôle un coin
        const voisin = cle(ni, nj), nouveau = cout[courant] + (di && dj ? 1.4142 : 1);
        if (nouveau < cout[voisin]) { cout[voisin] = nouveau; parent[voisin] = courant; ouverts.push(voisin); }
      }
    }
    if (parent[but] === -1 && but !== cle(...depart)) return null;

    // On remonte du but vers le départ pour reconstituer le trajet.
    const points = [];
    for (let c = but; c !== -1; c = parent[c]) points.unshift(versMonde(c % colonnes, Math.floor(c / colonnes)));
    points[0] = { x: x0, z: z0 };
    if (!collisions.bloque(x1, z1)) points.push({ x: x1, z: z1 });

    // Lissage : on supprime les points intermédiaires dès qu'une ligne droite suffit.
    const lisse = [points[0]];
    let i = 0;
    while (i < points.length - 1) {
      let j = points.length - 1;
      while (j > i + 1 && !ligneLibre(points[i], points[j])) j--;
      lisse.push(points[j]);
      i = j;
    }
    return lisse.slice(1);
  }

  return { trouverChemin };
}
