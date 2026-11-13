# Procédure du jour J : génération avec Higgsfield

Tout ce qui précède la génération est prêt (système d'assets, catalogue, prompts, script de traitement testé à blanc). Ce document décrit la journée elle-même, dans l'ordre.

Les informations sur l'offre viennent de recherches du 13 novembre 2026 (détail et sources dans les notes privées du projet). L'interface de Higgsfield ou de l'application Claude peut avoir changé : en cas de doute, on s'arrête et on vérifie ensemble.

## 1. Avant de commencer (Claude, 5 minutes)

| Vérification | Commande ou action | Attendu |
|---|---|---|
| Le script fonctionne | `python outils/assets.py essai` puis `python outils/assets.py essai --retirer` | 6/6 sans problème |
| ffmpeg est installé (pour la vidéo de l'écran titre) | `ffmpeg -version` | Un numéro de version |
| Le site tourne | `npm run dev` | Le site s'ouvre sans erreur |
| Liste à jour | `python outils/assets.py liste` | 44 assets, environ 179 générations |

## 2. Branchement (Mathys, une dizaine de minutes)

| # | Action | Point d'attention |
|---|---|---|
| 1 | Ouvrir https://higgsfield.ai/mcp et se connecter à son compte Higgsfield | Mot de passe tapé par toi seul |
| 2 | Démarrer l'essai | **Si une carte bancaire est demandée : on s'arrête** (règle 0 €) et tu me le dis |
| 3 | **Annuler tout de suite le renouvellement automatique** dans les réglages d'abonnement du compte | Sans ça, l'essai devient un abonnement payant à la fin des 72 h. Faire une capture d'écran de la confirmation |
| 4 | Noter l'heure exacte de fin de l'essai | Je m'en sers pour prioriser |
| 5 | Ajouter le connecteur dans l'application Claude : réglages, Connecteurs, ajouter un connecteur personnalisé, adresse `https://mcp.higgsfield.ai/mcp`, puis accepter la connexion dans la page Higgsfield qui s'ouvre | Si le connecteur n'apparaît pas dans l'onglet Code, je peux l'ajouter à Claude Code avec une commande (je te la montrerai avant de la lancer) |
| 6 | Passer cette session sur le modèle **Fable** (sélecteur de modèle de l'application) | Vérifier qu'il est bien disponible dans ton offre |
| 7 | Me dire « c'est branché » | |

## 3. Vérification du connecteur (Claude, sans rien générer)

| Action | Attendu |
|---|---|
| Lister les outils Higgsfield disponibles | Génération d'images, de vidéos, suppression de fond |
| Lister les modèles et les proportions acceptées | Les proportions du catalogue (1:1, 4:3, 3:2, 2:3, 3:4, 9:16, 16:9) sont disponibles. Sinon, j'ajuste le catalogue avant de générer |
| Vérifier si une image générée peut servir de référence aux suivantes | Indispensable pour l'image d'ancrage |

## 4. Génération, dans l'ordre

Prompts complets : `prompts/higgsfield.md`. Règles : `prompts/bible-style.md`.

| Étape | Qui | Détail |
|---|---|---|
| A. Ancrage de style (P0) | Claude génère, **Mathys choisit** | `style/ancrage` avec deux ou trois modèles. Le modèle de l'image retenue sert ensuite pour tout |
| B. P1 | Claude | Sol, matériaux, façades, végétation, perso, tableaux. Chaque fois avec l'image d'ancrage en référence |
| C. Choix | **Mathys** | Je montre les variantes de chaque asset, tu choisis (ou « aucune ») |
| D. Traitement | Claude | `python outils/assets.py telecharger <id> <adresse>`, puis `python outils/assets.py traiter <id>`, puis vérification dans le site |
| E. P2 | Claude, puis Mathys pour les choix | Murs intérieurs, éléments de décor, chat, vidéo de l'écran titre |

Règles pendant la génération :

| Règle | Pourquoi |
|---|---|
| Un asset traité et vérifié dans le site avant de passer à beaucoup d'autres du même type | Un défaut de prompt se corrige une fois, pas vingt |
| Toute variante avec du texte lisible est refusée | Règle d'or : rien d'incrusté |
| Planche-contact régulière (`python outils/assets.py planche`) | Juger l'ensemble, pas chaque image seule |
| Journal tenu automatiquement dans `prompts/journal.md` | Savoir quel prompt et quel modèle ont donné quoi |
| Si l'essai approche de la fin, on finit les P1 et on laisse les P2 | Les P2 ont tous une version provisoire correcte |

## 5. Après la génération

| # | Action | Qui |
|---|---|---|
| 1 | `python outils/assets.py controle` : tous les assets passent | Claude |
| 2 | Refaire l'image d'aperçu des réseaux (`outils/capture-apercu.md`) | Claude |
| 3 | Publier : `git add -A`, `git commit`, `git push` | Claude, avec ton accord |
| 4 | Revenir sur le modèle Opus | Mathys |
| 5 | Vérifier dans le compte Higgsfield que l'abonnement est bien annulé, et retirer le connecteur | Mathys |

Après ça, tout reste modifiable sans Higgsfield : chaque image se remplace en déposant un fichier au même nom dans `assets/ia/`, et chaque retouche peut se faire dans Aseprite avec la palette du projet.
