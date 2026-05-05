<template>
  <div class="page-connexion">
    <LoginMain 
      @login="handleLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserService from '../services/userService';
import LoginMain from '../components/connexion/LoginMain.vue';

const router = useRouter();

// Vérifier si l'utilisateur est déjà connecté
onMounted(async () => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      // Vérifier que l'utilisateur existe toujours
      await UserService.getById(user.id);
      router.push('/attente');
    } catch {
      // L'utilisateur n'existe plus, supprimer du localStorage
      localStorage.removeItem('currentUser');
    }
  }
});

// Gérer la connexion (création automatique d'utilisateur)
const handleLogin = async (credentials: { username: string; user?: any; error?: string }) => {
  try {
    if (credentials.error) {
      console.error('Erreur de création utilisateur:', credentials.error);
      // Pour l'instant, on continue même en cas d'erreur
      // Dans une vraie app, on afficherait un message d'erreur à l'utilisateur
      return;
    }
    
    // Utiliser l'utilisateur créé par le composant ou créer un fallback
    let user = credentials.user;
    
    if (!user) {
      // Fallback : créer l'utilisateur manuellement
      user = await UserService.create({
        username: credentials.username
      });
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    router.push('/attente');
  } catch (err) {
    console.error('Erreur de gestion utilisateur:', err);
    // Pour l'instant, on continue même en cas d'erreur
  }
};
</script>

<style scoped>
/* Le style est maintenant géré par le composant LoginMain */
.page-connexion {
  min-height: 100vh;
  background: #0a0a0f;
}
</style>
