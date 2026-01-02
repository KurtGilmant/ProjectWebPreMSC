# ProjectWebPreMSC

Bienvenue sur le nouveau Jobboard à la mode : Jobly ! Ce README va vous aider à démarrer correctement les serveurs et le site !

##  NOUVEAU : Analyseur de CV ATS

Jobly intègre maintenant un **analyseur de CV intelligent** qui évalue la compatibilité de votre CV avec les systèmes ATS (Applicant Tracking System) utilisés par 75% des entreprises.

### Installation rapide de l'analyseur

```bash
npm install
docker compose down -v
docker-compose up --build
```

### Accès à l'analyseur

Une fois connecté, cliquez sur **"Analyseur CV"** dans la navigation ou accédez directement à :
`http://localhost:5500/pages/cv-analyzer.html`

### Documentation complète

-  **Guide complet** : `CV_ANALYZER_GUIDE.md`
-  **Installation** : `INSTALLATION_CV_ANALYZER.md`
-  **Schémas** : `SCHEMA_FONCTIONNEMENT.md`
-  **Tests** : `GUIDE_TESTS.md`
-  **Résumé rapide** : `RESUME_RAPIDE.md`

---

## Variable dans le .env
Avant de pouvoir démarrer le docker et tous les serveur vous devez configurer le .env :

#### ACESS_TOKEN_SECRET et REFRESH_TOKEN_SECRET
dans le terminal : 
```bash
node # Ouvre le terminal de node
```
```node
require('crypto').randomBytes(64).toString('hex') // Génère votre token
```
Vous copiez-collez ensuite le token dans le .env pour ACESS_TOKEN_SECRET
Répétez une deuxième fois la commande pour avoir un autre token et le coller dans le .env mais cette fois-ci pour REFRESH_TOKEN_SECRET
```bash
# Exemple : 
ACESS_TOKEN_SECRET = 6d17a7b1b77a9b1fe2f6ea008bc0d0c271efee0182d1e392444c8794e4c193c30275f69fb9b8953e2eb2f3d6e5519b94578ff8a84dbf6d95ff2c48204cfe5
REFRESH_TOKEN = a9bf8bebf4708b66bbb1457bfde5cea2e41e71f02eb2504ac5d29cc11856b0ffa335a4b2f4771e6d7366751cf6c30deb48eb942482468666a51ccc9aeadde1b6b
```

#### VARIABLES POUR DEMARRER LE DOCKER, LA BDD ET LE SERVEUR API
```bash
DB_HOST = # Nom de l'host (de base = db)
DB_USER = # Nom de l'user (de base = root)
DB_PASSWORD = # MDP de l'user (de base = root)
DB_NAME = # Nom de la table qui contient toutes les autres tables (de base = monapp)
MYSQL_ROOT_PASSWORD = # MDP de l'admin (de base = root)
MYSQL_DATABASE = # Nom de la base de donnée (de base = monapp)
PORT = # Port sur lequel tourne l'API (de base = 3000)
```

#### ALLOWED_ORIGINS
```bash
ALLOWED_ORIGINS = # Mettez toutes les urls qui vont communiquer dans ce projet. Elles doivent être séparé seulement par ","
# Exemple : ALLOWED_ORIGINS=http://localhost:5500,http://localhost:3000
```

## Commandes utiles
Maintenant que le .env est configuré, vous pouvez démarrer le docker :

#### Premier lancement du docker :
```bash
docker-compose up --build   # Build le docker (il faut kill le terminal quand il a finit de démarrer)
```

#### Commmande pour lancer et arrêter le docker :
```bash
docker compose up -d     # Démarre le docker
docker compose down -v   # Arrête le docker
```

#### Au cas-où MySQL fait des siennes ou que le port 3306 est occupé :
```bash
npx kill-port 3306  # Si vous n'avez jamais utilisé une commande npx, y a des chances que le pc vous demande de l'installer avant de lancer la commande
```

## Démarrer le site internet
Une fois le docker, la bdd et le serveur API de up, vous pouvez démarrer votre site. Pour le faire fonctionner, nous avons utilisé l'extension VS Code : Live Server qui permet de faire tourner un fichier html en local et tout ça en deux clics !
1. Ouvrez le projet dans VS Code 
2. Clic droit sur "index.html" puis clickez sur "Open with Live Server"
3. Pour éviter les bugs dans votre navigateur changez le "http://127.0.0.1:5500/index.html" en "http://localhost:5500/index.html"

## Commande API
Maintenant que votre site et le docker sont up, vous pouvez utiliser le site à votre guise !

Vous pouvez aller voir la doc de toutes les routes/commandes API ici : http://localhost:3000/api-docs/#/
Attention ! Le docker doit être démarré pour que ce lien fonctionne !
