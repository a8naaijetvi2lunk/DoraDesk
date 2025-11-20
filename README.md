# 🐱 DoraDesk - Your Smart Dashboard

<p align="center">
  <img src="./assets/logo.png" alt="DoraDesk Logo" width="200">
</p>

<p align="center">
  <strong>DoraDesk</strong> - Dashboard personnalisé pour navigateur avec gestion de favoris, tâches, notes et outils de développement.
</p>

## ✨ Fonctionnalités

- 📑 **Favoris organisés** par catégories avec icônes personnalisables
- ✅ **Gestion de tâches** avec priorités (urgent, important, normal)
- 📝 **Bloc-notes** avec sauvegarde automatique
- 🛠️ **Outils développeur** : convertisseur PX/REM, générateur de mots de passe
- 💾 **Snippets de code** réutilisables
- 🧮 **Calculatrice** intégrée
- ⏱️ **Timer Pomodoro** avec suivi des sessions
- 📚 **Git Cheatsheet** avec copie rapide
- 😀 **Emoji Picker** avec historique
- 📡 **Flux RSS** avec suggestions et actualisation automatique
- 📊 **Statistiques** avec dashboard complet et tracking d'activité
- 🎨 **Thème personnalisable** (couleur d'accent, fond d'écran)
- 💾 **Export/Import** de toutes vos données
- ⌨️ **Raccourcis clavier** pour navigation rapide
- 📱 **Responsive** - fonctionne sur tous les écrans

---

## 📁 Structure du Projet

```
DoraDesk/
├── index.html                 # Point d'entrée
├── index-backup.html          # Sauvegarde de l'ancienne version
├── assets/
│   └── logo.png              # Logo DoraDesk (ASCII art)
├── styles/
│   └── main.css              # Styles personnalisés
├── js/
│   ├── config.js             # Configuration globale
│   ├── main.js               # Application principale
│   ├── utils/
│   │   ├── sanitize.js       # Sécurité XSS
│   │   ├── validators.js     # Validation des données
│   │   └── toast.js          # Notifications
│   ├── core/
│   │   ├── storage.js        # Gestion localStorage
│   │   ├── statistics.js     # Système de statistiques
│   │   ├── grid.js           # GridStack manager
│   │   └── modal.js          # Système de modales
│   └── widgets/
│       ├── registry.js       # Registre des widgets
│       ├── bookmarks.js      # Widget favoris
│       ├── tasks.js          # Widget tâches
│       ├── notes.js          # Widget notes
│       ├── tools-px.js       # Convertisseur PX/REM
│       ├── tools-pass.js     # Générateur de mots de passe
│       ├── snippets.js       # Snippets de code
│       ├── calculator.js     # Calculatrice
│       ├── pomodoro.js       # Timer Pomodoro
│       ├── git-cheatsheet.js # Git cheatsheet
│       ├── emoji-picker.js   # Sélecteur d'emojis
│       ├── rss-feeds.js      # Flux RSS
│       └── statistics.js     # Statistiques & Dashboard
├── dist/
│   └── index.html            # Build portable (généré)
├── package.json              # Configuration npm
├── vite.config.js            # Configuration Vite
└── .gitignore
```

---

## 🚀 Installation et Développement

### Prérequis

- Node.js 18+ et npm

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

L'application s'ouvre automatiquement dans votre navigateur à `http://localhost:5173`

**Avantages en mode dev :**
- ✅ Hot reload automatique
- ✅ Erreurs affichées clairement
- ✅ Code non minifié (facile à déboguer)

### 3. Build pour production (fichier unique portable)

```bash
npm run build
```

**Résultat :** Un seul fichier `dist/index.html` contenant :
- ✅ Tout le HTML
- ✅ Tout le CSS (inline)
- ✅ Tout le JavaScript (inline et minifié)
- ✅ Portable - fonctionne sans serveur
- ✅ Optimisé pour la performance

### 4. Prévisualiser le build

```bash
npm run preview
```

---

## 🎨 Utilisation comme Page d'Accueil Chrome

### Option 1 : Mode Développement (avec serveur)

1. Lancer `npm run dev`
2. Dans Chrome : **Paramètres** → **Au démarrage** → **Ouvrir une page ou un ensemble de pages spécifiques**
3. Ajouter : `http://localhost:5173`

⚠️ Nécessite que le serveur tourne

### Option 2 : Mode Production (fichier local)

1. Build : `npm run build`
2. Copier `dist/index.html` où vous voulez (ex: Bureau)
3. Dans Chrome : **Paramètres** → **Au démarrage** → **Ouvrir une page ou un ensemble de pages spécifiques**
4. Ajouter : `file:///C:/Users/VotreNom/Bureau/index.html`

✅ Fonctionne sans serveur, totalement portable

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + K` | Ouvrir la recherche rapide |
| `Ctrl + S` | Sauvegarder la disposition |
| `Échap` | Fermer les modales |

---

## 🔧 Configuration

### Couleur d'accent

1. Cliquer sur l'icône ⚙️ (Paramètres)
2. Choisir une couleur ou entrer un code hex
3. Cliquer sur "OK"

### Image de fond

1. Paramètres → Image de fond
2. Entrer l'URL d'une image
3. Cliquer sur "OK"

### Export/Import des données

**Export :**
1. Paramètres → Export
2. Un fichier JSON est téléchargé avec toutes vos données

**Import :**
1. Paramètres → Import
2. Sélectionner un fichier JSON exporté précédemment
3. La page se recharge avec les données importées

---

## 🎯 Widgets Disponibles

### Favoris (Bookmarks)
- Gérer vos sites web préférés
- Organisation par catégories
- Icônes et couleurs personnalisables
- Édition et suppression faciles

### Tâches (Tasks)
- Créer des tâches avec priorités
- 3 niveaux : Normal, Important, Urgent
- Cocher pour marquer comme terminé
- Suppression rapide

### Bloc-notes (Notes)
- Éditeur de texte simple
- Sauvegarde manuelle ou automatique
- Parfait pour notes temporaires

### Convertisseur PX ↔ REM
- Conversion bidirectionnelle
- Base 16px
- Utile pour le développement web

### Générateur de Mots de Passe
- Longueur configurable (8-32 caractères)
- Options : majuscules, chiffres, symboles
- Copie en un clic
- Génération automatique au chargement

### Snippets de Code
- Sauvegarder des morceaux de code
- Titre et code
- Copie rapide

### Calculatrice
- Opérations basiques (+, -, *, /)
- Interface simple
- Bouton Clear

### Pomodoro Timer
- 25 min travail, 5 min pause courte, 15 min pause longue
- Suivi des sessions quotidiennes
- Notification sonore
- Animation de progression

### Git Cheatsheet
- Commandes Git essentielles
- 5 catégories : Config, Bases, Branches, Historique, Annulation
- Copie en un clic

### Emoji Picker
- Plus de 500 emojis
- 10 catégories
- Recherche (à venir)
- Historique des emojis récents

### Flux RSS
- Ajouter des flux RSS personnalisés
- 10 flux suggérés depuis Atlas Flux :
  - Actualités Tech (Journal du Hacker, Le Figaro High-Tech)
  - Open Source (LinuxFr, Atlas Logiciel Libre)
  - Cybersécurité (Atlas Cybersécurité)
  - Data Science (Atlas Data)
  - Intelligence Artificielle (Le Monde IA, France Info IA)
  - Programmation (Human Coders Python & JavaScript)
- Nombre d'articles personnalisable par flux (3, 5, 10, 15, 20)
- Actualisation manuelle ou automatique (toutes les 30 minutes)
- Édition complète des flux (nom, URL, catégorie, nb d'articles)
- Organisation par catégories
- Suppression facile des flux
- Utilise l'API rss2json.com pour le parsing

### Statistiques
- **Vue Compacte** :
  - Statistiques du jour (tâches, Pomodoros, clics)
  - Barres de progression des objectifs quotidiens
  - Top 3 sites les plus visités
  - Bouton d'accès au dashboard complet
- **Dashboard Full-Screen** :
  - 3 KPIs principaux avec comparaison vs hier
  - Graphique d'activité des 7 derniers jours
  - Top 5 widgets les plus utilisés
  - Top 10 sites favoris avec nombre de clics
  - Objectifs personnalisables (Pomodoro, Tâches)
  - Statistiques générales (sessions totales, streaks)
- **Tracking Automatique** :
  - Sessions DoraDesk
  - Clics sur favoris (par URL)
  - Activité quotidienne par widget
  - Historique conservé 90 jours
- **Export & Paramètres** :
  - Export JSON des statistiques
  - Configuration des objectifs quotidiens
  - Réinitialisation complète
- **Gamification** :
  - Streaks Pomodoro
  - Comparaisons avec jour/semaine précédente
  - Pourcentages de progression

---

## 🔒 Sécurité

### Protections implémentées

✅ **Sanitization XSS** : Toutes les entrées utilisateur sont nettoyées
✅ **Validation des URLs** : Seuls http:// et https:// sont autorisés
✅ **Validation des données** : Import vérifié avant application
✅ **Backup automatique** : Sauvegarde avant import
✅ **Pas de eval()** : Calculatrice utilise Function() de manière sécurisée

### Données stockées

Toutes vos données sont stockées **localement** dans votre navigateur (localStorage).

- ✅ Aucune donnée envoyée sur Internet
- ✅ Accessible seulement sur votre machine
- ✅ Pas de tracking externe
- ✅ Confidentialité totale

**Note** : Les statistiques sont trackées localement uniquement pour votre usage personnel. Aucune donnée n'est partagée.

---

## 🐛 Dépannage

### Le serveur de dev ne démarre pas

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur "Cannot find module"

Vérifier que tous les fichiers sont présents dans `js/` :
```bash
ls js/widgets/
# Devrait afficher tous les widgets
```

### Le build ne fonctionne pas

```bash
# Nettoyer et rebuilder
rm -rf dist
npm run build
```

### Les données ne se sauvegardent pas

1. Vérifier la console JavaScript (F12)
2. Vérifier que localStorage est activé
3. Vérifier l'espace disponible (localStorage limité à ~10MB)

---

## 🆕 Nouveautés v2.0

### Architecture

✅ **Code modulaire** - Fichiers séparés par responsabilité
✅ **ES6 Modules** - Import/export natifs
✅ **Build système** - Vite pour développement et production
✅ **Hot reload** - Modifications instantanées en dev

### Sécurité

✅ **Sanitization complète** - Protection XSS
✅ **Validation stricte** - URLs et données
✅ **Backup automatique** - Avant imports

### Performance

✅ **Optimisé** - Build minifié et inline
✅ **Portable** - Un seul fichier en production
✅ **Léger** - ~80KB minifié

---

## 📝 Licence

Projet personnel - Utilisation libre

---

## 🤝 Contribution

Ce projet est un dashboard personnel. Si vous souhaitez l'utiliser :

1. Fork le projet
2. Personnalisez à votre guise
3. Profitez ! 😊

---

## 📞 Support

Pour toute question, vérifier :
1. Ce README
2. Les fichiers de documentation dans le projet
3. La console JavaScript (F12) pour les erreurs

---

**Bon codage ! 🚀**
