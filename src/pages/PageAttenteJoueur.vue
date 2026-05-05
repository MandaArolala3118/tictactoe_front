<template>
  <div class="page-attente">
    <WaitingMain 
      :username="username"
      :room-code="roomCode"
      :duration="duration"
      :user-id="currentUserId"
      @cancel="handleCancel"
      @expired="handleExpired"
      @invite="handleInvite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WaitingMain from '../components/waitingPlayer/WaitingMain.vue'

const router = useRouter()

// Props pour le composant WaitingMain
const username = ref('') // Sera récupéré depuis la connexion
const roomCode = ref('XO-7F3K')
const duration = ref(3600) // 1 heure en secondes
const currentUserId = ref('') // Sera récupéré depuis la connexion

// Récupérer les infos utilisateur depuis la connexion existante
onMounted(() => {
  // Récupérer l'utilisateur connecté depuis localStorage
  const storedUser = localStorage.getItem('currentUser');
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      username.value = user.displayName || user.username;
      currentUserId.value = user.id;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      // Rediriger vers la page de connexion si les données sont invalides
      router.push('/');
    }
  } else {
    // Rediriger vers la page de connexion si aucun utilisateur n'est trouvé
    router.push('/');
  }
  
  // Génération d'un code de room aléatoire
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'XO-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  roomCode.value = code
})

// Gestion des événements
function handleCancel() {
  console.log('Annulation de la recherche')
  router.push('/')
}

function handleExpired() {
  console.log('Session expirée')
  router.push('/')
}

function handleInvite(code: string) {
  console.log('Invitation envoyée avec le code:', code)
  // Implémenter la logique de partage (Web Share API, clipboard, etc.)
  if (navigator.share) {
    navigator.share({
      title: 'Rejoins ma partie de Morpion !',
      text: `Utilise le code ${code} pour rejoindre ma partie.`,
      url: window.location.href
    })
  } else {
    // Fallback: copier dans le presse-papiers
    navigator.clipboard.writeText(code)
    alert(`Code ${code} copié dans le presse-papiers !`)
  }
}
</script>

<style scoped>
.page-attente {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>