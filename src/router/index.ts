import { createRouter, createWebHistory } from 'vue-router';
import PageConnexion from '../pages/PageConnexion.vue';
import PageAttenteJoueur from '../pages/PageAttenteJoueur.vue';
import PageJeu from '../pages/PageJeu.vue';

const routes = [
  {
    path: '/',
    name: 'Connexion',
    component: PageConnexion,
    meta: {
      title: 'Connexion - Morpion'
    }
  },
  {
    path: '/attente',
    name: 'Attente',
    component: PageAttenteJoueur,
    meta: {
      title: 'Salle d\'attente - Morpion',
      requiresAuth: true
    }
  },
  {
    path: '/jeu/:id',
    name: 'Jeu',
    component: PageJeu,
    props: true,
    meta: {
      title: 'Jeu - Morpion',
      requiresAuth: true
    }
  },
  {
    // Redirection des routes non trouvées vers la page de connexion
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard pour vérifier l'authentification
router.beforeEach((to, _from, next) => {
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      // Rediriger vers la page de connexion si non authentifié
      next('/');
      return;
    }
    
    // Optionnel: vérifier que l'utilisateur existe toujours dans la base de données
    // Ceci peut être fait dans les composants individuellement pour éviter trop de requêtes
  }

  next();
});

export default router;
