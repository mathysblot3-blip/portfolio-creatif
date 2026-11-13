// =====================================================================
// POST-TRAITEMENT HD-2D
// L'image passe par quatre étapes avant d'arriver à l'écran :
//   1. la scène est dessinée, avec sa "carte de profondeur" (distance de chaque pixel à la caméra) ;
//      un flou de profondeur et une brume sont calculés à partir de cette carte ;
//   2. le bloom ajoute un halo autour des zones très lumineuses ;
//   3. l'étalonnage réchauffe les couleurs et assombrit les coins (vignette) ;
//   4. la conversion finale adapte les couleurs à l'écran.
// =====================================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { REGLAGES } from './reglages.js';

const SOMMETS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ---------- Étape 1 : flou de profondeur et brume ----------
// Principe du flou : pour chaque pixel, on regarde 40 voisins répartis en spirale.
// Un voisin "bave" sur le pixel seulement s'il est lui-même assez flou pour l'atteindre.
// Résultat : le perso reste net, le premier plan et le lointain deviennent flous, sans halo autour du perso.
const FRAGMENTS_FLOU = /* glsl */ `
  #include <packing>
  uniform sampler2D tCouleur;
  uniform sampler2D tProfondeur;
  uniform vec2 resolution;
  uniform float proche, loin;
  uniform float miseAuPoint, zoneAvant, zoneArriere, transition, rayonMax, flouActif;
  uniform vec3 brumeCouleur;
  uniform float brumeDebut, brumeFin, brumeDensite, brumeDesaturation;
  varying vec2 vUv;

  const int ECHANTILLONS = 40;
  const float ANGLE_OR = 2.39996323;

  // Couleur d'un pixel avec la brume appliquée, et sa distance à la caméra.
  vec3 echantillon(vec2 uv, out float eloignement) {
    float z = texture2D(tProfondeur, uv).x;
    eloignement = -perspectiveDepthToViewZ(z, proche, loin);
    vec3 c = texture2D(tCouleur, uv).rgb;
    if (z < 0.99999) { // le ciel n'a pas de brume, il est déjà peint
      float b = smoothstep(brumeDebut, brumeFin, eloignement);
      float gris = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(c, vec3(gris), b * brumeDesaturation);
      c = mix(c, brumeCouleur, b * brumeDensite);
    }
    return c;
  }

  // Rayon du flou en pixels pour une distance donnée : nul dans la zone nette autour du perso.
  float tailleFlou(float eloignement) {
    float ecart = eloignement - miseAuPoint;
    float zone = ecart < 0.0 ? zoneAvant : zoneArriere;
    return clamp((abs(ecart) - zone) / transition, 0.0, 1.0) * rayonMax * resolution.y;
  }

  void main() {
    float distanceCentre;
    vec3 couleurCentre = echantillon(vUv, distanceCentre);
    if (flouActif < 0.5) { gl_FragColor = vec4(couleurCentre, 1.0); return; }

    float tailleCentre = tailleFlou(distanceCentre);
    float rayon = rayonMax * resolution.y;
    vec2 texel = 1.0 / resolution;
    // Petite rotation différente pour chaque pixel : transforme les motifs réguliers en grain discret.
    float hasard = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));

    vec3 somme = couleurCentre;
    float total = 1.0;
    for (int i = 0; i < ECHANTILLONS; i++) {
      float r = sqrt((float(i) + 0.5) / float(ECHANTILLONS)) * rayon;
      float a = float(i) * ANGLE_OR + hasard * 6.2831853;
      vec2 uv = vUv + vec2(cos(a), sin(a)) * r * texel;
      float distanceVoisin;
      vec3 couleurVoisin = echantillon(uv, distanceVoisin);
      float tailleVoisin = tailleFlou(distanceVoisin);
      // Un voisin situé derrière ne doit pas baver sur un pixel net situé devant lui.
      if (distanceVoisin > distanceCentre) tailleVoisin = clamp(tailleVoisin, 0.0, tailleCentre * 2.0);
      float poids = smoothstep(r - 0.5, r + 0.5, tailleVoisin);
      somme += mix(somme / total, couleurVoisin, poids);
      total += 1.0;
    }
    gl_FragColor = vec4(somme / total, 1.0);
  }
`;

// Passe "maison" : dessine la scène dans une image hors écran, puis applique le flou et la brume.
class PasseSceneFlou extends Pass {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.cible = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType, // couleurs en haute précision, nécessaires pour un bloom propre
      samples: 4,                // anticrénelage des bords de la géométrie
      depthTexture: new THREE.DepthTexture(1, 1),
    });
    this.materiau = new THREE.ShaderMaterial({
      uniforms: {
        tCouleur: { value: this.cible.texture },
        tProfondeur: { value: this.cible.depthTexture },
        resolution: { value: new THREE.Vector2(1, 1) },
        proche: { value: camera.near },
        loin: { value: camera.far },
        miseAuPoint: { value: 30 },
        zoneAvant: { value: 4 },
        zoneArriere: { value: 12 },
        transition: { value: 12 },
        rayonMax: { value: 0.012 },
        flouActif: { value: 1 },
        brumeCouleur: { value: new THREE.Color() },
        brumeDebut: { value: 55 },
        brumeFin: { value: 170 },
        brumeDensite: { value: 0.6 },
        brumeDesaturation: { value: 0.6 },
      },
      vertexShader: SOMMETS,
      fragmentShader: FRAGMENTS_FLOU,
      depthTest: false,
      depthWrite: false,
    });
    this.plein = new FullScreenQuad(this.materiau);
  }

  setSize(largeur, hauteur) {
    this.cible.setSize(largeur, hauteur);
    this.materiau.uniforms.resolution.value.set(largeur, hauteur);
  }

  render(renderer, writeBuffer) {
    renderer.setRenderTarget(this.cible);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.plein.render(renderer);
  }

  dispose() {
    this.cible.dispose();
    this.materiau.dispose();
    this.plein.dispose();
  }
}

// ---------- Étape 3 : étalonnage et vignette ----------
const ETALONNAGE = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1 },
    chaleur: { value: 0 },
    vignette: { value: 0.3 },
  },
  vertexShader: SOMMETS,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float saturation, chaleur, vignette;
    varying vec2 vUv;
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float gris = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(gris), c, saturation);
      c *= vec3(1.0 + chaleur, 1.0, 1.0 - chaleur);           // plus de rouge, moins de bleu
      float d = length((vUv - 0.5) * vec2(1.0, 0.85));
      c *= mix(1.0, 1.0 - vignette, smoothstep(0.3, 0.8, d)); // coins assombris
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

export function creerPostTraitement(rendu, scene, camera) {
  const composeur = new EffectComposer(rendu);
  const passeScene = new PasseSceneFlou(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.7, 0.9);
  const etalonnage = new ShaderPass(ETALONNAGE);
  composeur.addPass(passeScene);
  composeur.addPass(bloom);
  composeur.addPass(etalonnage);
  composeur.addPass(new OutputPass());

  function appliquerReglages() {
    const u = passeScene.materiau.uniforms;
    const F = REGLAGES.flou, B = REGLAGES.brume, I = REGLAGES.image, H = REGLAGES.bloom;
    const haute = REGLAGES.qualite === 'haute';
    u.zoneAvant.value = F.zoneAvant;
    u.zoneArriere.value = F.zoneArriere;
    u.transition.value = F.transition;
    u.rayonMax.value = F.rayonMax;
    u.flouActif.value = haute ? 1 : 0;
    u.brumeCouleur.value.set(B.couleur);
    u.brumeDebut.value = B.debut;
    u.brumeFin.value = B.fin;
    u.brumeDensite.value = B.densite;
    u.brumeDesaturation.value = B.desaturation;
    u.proche.value = camera.near;
    u.loin.value = camera.far;
    bloom.enabled = haute;
    bloom.strength = H.force;
    bloom.radius = H.rayon;
    bloom.threshold = H.seuil;
    etalonnage.uniforms.saturation.value = I.saturation;
    etalonnage.uniforms.chaleur.value = I.chaleur;
    etalonnage.uniforms.vignette.value = I.vignette;
    rendu.toneMappingExposure = I.exposition;
  }

  function redimensionner(pixelRatio) {
    if (innerWidth === 0 || innerHeight === 0) return; // fenêtre réduite : on garde la taille précédente
    rendu.setPixelRatio(pixelRatio);
    rendu.setSize(innerWidth, innerHeight);
    composeur.setPixelRatio(pixelRatio);
    composeur.setSize(innerWidth, innerHeight);
  }

  // Distance à laquelle l'image est parfaitement nette (celle du perso).
  function definirMiseAuPoint(distance) {
    passeScene.materiau.uniforms.miseAuPoint.value = distance;
  }

  // Change la scène dessinée (ville ou intérieur d'un lieu). La caméra reste la même.
  function definirScene(nouvelle) {
    passeScene.scene = nouvelle;
  }

  appliquerReglages();
  return { composeur, appliquerReglages, redimensionner, definirMiseAuPoint, definirScene, rendre: () => composeur.render() };
}
