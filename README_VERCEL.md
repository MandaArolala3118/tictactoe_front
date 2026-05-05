# Déploiement du frontend sur Vercel

## Configuration effectuée

1. **vercel.json** : Configuration du déploiement statique avec Vite
2. **vite.config.ts** : Configuration optimisée pour le build de production
3. **.vercelignore** : Fichiers à ignorer lors du déploiement
4. **.env.example** : Variables d'environnement pour développement et production

## Variables d'environnement

Configurez ces variables dans le dashboard Vercel :

- `VITE_API_BASE_URL` : URL de votre backend déployé sur Vercel
- `VITE_SOCKET_URL` : URL WebSocket de votre backend

## Déploiement

1. Connectez-vous à Vercel : `vercel login`
2. Déployez depuis le dossier frontend : `vercel`
3. Suivez les instructions pour lier le projet

## Build

Le projet utilise Vite pour le build :
- Commande de build : `npm run build`
- Sortie : dossier `dist/`
- Le build est automatiquement géré par Vercel

## Important

Après avoir déployé le backend, mettez à jour les URLs dans les variables d'environnement du frontend pour pointer vers votre backend déployé.
