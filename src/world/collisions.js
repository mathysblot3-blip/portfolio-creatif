// =====================================================================
// COLLISIONS
// Le monde est décrit par deux sortes d'obstacles vus du dessus :
//   - des cercles (fontaine, tonneaux, arbres) ;
//   - des rectangles qui peuvent être tournés (bâtiments).
// Le perso est lui-même un petit cercle de rayon RAYON_PERSO.
// =====================================================================

export const RAYON_PERSO = 0.38;

export function creerCollisions(limites) {
  const cercles = [];
  const rectangles = [];

  function ajouterCercle(x, z, rayon) {
    cercles.push({ x, z, r: rayon });
  }

  // rotation en radians, dans le même sens que la rotation du bâtiment.
  function ajouterRectangle(x, z, largeur, profondeur, rotation = 0) {
    rectangles.push({ x, z, demiL: largeur / 2, demiP: profondeur / 2, cos: Math.cos(rotation), sin: Math.sin(rotation) });
  }

  // Vrai si le perso ne peut pas se tenir au point (x, z).
  function bloque(x, z) {
    if (x < limites.xMin || x > limites.xMax || z < limites.zMin || z > limites.zMax) return true;
    for (const c of cercles) {
      if (Math.hypot(x - c.x, z - c.z) < c.r + RAYON_PERSO) return true;
    }
    for (const r of rectangles) {
      // On ramène le point dans le repère du rectangle : le test redevient un simple test de bornes.
      const dx = x - r.x, dz = z - r.z;
      const local_x = dx * r.cos - dz * r.sin;
      const local_z = dx * r.sin + dz * r.cos;
      if (Math.abs(local_x) < r.demiL + RAYON_PERSO && Math.abs(local_z) < r.demiP + RAYON_PERSO) return true;
    }
    return false;
  }

  return { ajouterCercle, ajouterRectangle, bloque, limites };
}
