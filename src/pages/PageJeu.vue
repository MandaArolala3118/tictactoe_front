<template>
  <div class="page-jeu">
    <div class="jeu-container">
      <header class="jeu-header">
        <div class="game-info">
          <h1>Morpion</h1>
          <span class="game-id">Partie #{{ gameId?.slice(-6) }}</span>
        </div>
        <div class="header-actions">
          <button @click="quitterPartie" class="btn-danger">Quitter</button>
          <button @click="rafraichir" :disabled="refreshing" class="btn-secondary">
            <span v-if="refreshing">...</span>
            <span v-else>↻</span>
          </button>
        </div>
      </header>

      <main class="jeu-main">
        <!-- Informations joueurs -->
        <section class="players-section">
          <div class="player" :class="{ active: game?.current_turn === 'X', current: currentUser?.id === game?.player_x_id }">
            <div class="player-avatar">X</div>
            <div class="player-info">
              <span class="player-name">{{ getPlayerName(game?.player_x_id) }}</span>
              <span class="player-symbol">Joueur X</span>
            </div>
          </div>
          
          <div class="vs">VS</div>
          
          <div class="player" :class="{ active: game?.current_turn === 'O', current: currentUser?.id === game?.player_o_id }">
            <div class="player-avatar">O</div>
            <div class="player-info">
              <span class="player-name">{{ getPlayerName(game?.player_o_id) }}</span>
              <span class="player-symbol">Joueur O</span>
            </div>
          </div>
        </section>

        <!-- Plateau de jeu -->
        <section class="board-section">
          <div class="game-status" v-if="game">
            <span v-if="game.isWaiting" class="status-waiting">En attente d'un joueur...</span>
            <span v-else-if="game.isPlaying" class="status-playing">
              Tour du joueur <strong>{{ game.current_turn }}</strong>
            </span>
            <span v-else-if="game.isFinished" class="status-finished">
              <span v-if="game.winner">🎉 Victoire du joueur {{ game.winner }} !</span>
              <span v-else>🤝 Match nul !</span>
            </span>
          </div>
          
          <div class="board" :class="{ disabled: !canPlay }">
            <div
              v-for="(cell, index) in board"
              :key="index"
              class="cell"
              :class="{ 
                x: cell === 'X', 
                o: cell === 'O',
                winning: winningCells?.includes(index),
                clickable: canPlay && cell === null
              }"
              @click="jouerCoup(index)"
            >
              <span v-if="cell" class="cell-content">{{ cell }}</span>
            </div>
          </div>
        </section>

        <!-- Historique des coups -->
        <section class="moves-section">
          <h3>Historique des coups</h3>
          <div class="moves-list">
            <div
              v-for="move in moves"
              :key="move.id"
              class="move-item"
              :class="{ current: move.player_id === currentUser?.id }"
            >
              <span class="move-number">{{ move.move_number }}</span>
              <span class="move-player">{{ move.playerSymbol }}</span>
              <span class="move-position">Position {{ move.position + 1 }}</span>
              <span class="move-time">{{ formatTime(move.played_at) }}</span>
            </div>
            <div v-if="moves.length === 0" class="empty-moves">
              Aucun coup joué pour le moment
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal de fin de partie -->
    <div v-if="showEndModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>Partie terminée !</h2>
        <div class="result">
          <span v-if="game?.winner">🎉 Le joueur {{ game.winner }} a gagné !</span>
          <span v-else>🤝 Match nul !</span>
        </div>
        <div class="modal-actions">
          <button @click="nouvellePartie" class="btn-primary">Nouvelle partie</button>
          <button @click="retourAttente" class="btn-secondary">Retour à l'attente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UserModel, GameModel, MoveModel } from '../models';
import UserService from '../services/userService';
import GameService from '../services/gameService';
import MoveService from '../services/moveService';

const router = useRouter();
const route = useRoute();

// Réactifs
const gameId = ref<string>(route.params.id as string);
const currentUser = ref<UserModel | null>(null);
const game = ref<GameModel | null>(null);
const moves = ref<MoveModel[]>([]);
const board = ref<(string | null)[]>(Array(9).fill(null));
const refreshing = ref(false);
const showEndModal = ref(false);
const winningCells = ref<number[] | null>(null);

// Intervalle pour rafraîchir le jeu
let refreshInterval: NodeJS.Timeout | null = null;

// Computed
const canPlay = computed(() => {
  if (!game.value || !currentUser.value) return false;
  if (!game.value.isPlaying) return false;
  
  const isPlayerXTurn = game.value.current_turn === 'X' && currentUser.value.id === game.value.player_x_id;
  const isPlayerOTurn = game.value.current_turn === 'O' && currentUser.value.id === game.value.player_o_id;
  
  return isPlayerXTurn || isPlayerOTurn;
});

// Initialisation
onMounted(async () => {
  await loadCurrentUser();
  await loadGameData();
  
  // Rafraîchir toutes les 5 secondes pendant le jeu
  refreshInterval = setInterval(async () => {
    await loadGameData();
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Charger l'utilisateur courant
const loadCurrentUser = async () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      currentUser.value = await UserService.getById(user.id);
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Erreur chargement utilisateur:', error);
    localStorage.removeItem('currentUser');
    router.push('/');
  }
};

// Charger les données du jeu
const loadGameData = async () => {
  if (!gameId.value || !currentUser.value) return;
  
  try {
    // Charger le jeu
    game.value = await GameService.getById(gameId.value);
    
    // Charger les mouvements
    moves.value = await MoveService.getByGame(gameId.value);
    
    // Reconstruire le plateau
    board.value = await MoveService.reconstructBoard(gameId.value);
    
    // Vérifier si la partie est terminée
    if (game.value.isFinished && !showEndModal.value) {
      checkWinCondition();
      showEndModal.value = true;
    }
  } catch (error) {
    console.error('Erreur chargement jeu:', error);
    if (error instanceof Error && error.message === 'Game not found') {
      router.push('/attente');
    }
  }
};

// Jouer un coup
const jouerCoup = async (position: number) => {
  if (!canPlay.value || !game.value || !currentUser.value) return;
  if (board.value[position] !== null) return;
  
  try {
    await MoveService.playMove(gameId.value, currentUser.value.id, position);
    await loadGameData();
  } catch (error) {
    console.error('Erreur jouer coup:', error);
  }
};

// Vérifier la condition de victoire
const checkWinCondition = () => {
  if (!board.value) return;
  
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
    [0, 4, 8], [2, 4, 6] // Diagonales
  ];
  
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      winningCells.value = pattern;
      return;
    }
  }
  
  winningCells.value = null;
};

// Obtenir le nom du joueur
const getPlayerName = (playerId: string | null | undefined): string => {
  if (!playerId) return 'En attente...';
  if (currentUser.value?.id === playerId) return currentUser.value.username;
  return `Adversaire ${playerId.slice(-4)}`;
};

// Formater l'heure
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Rafraîchir manuellement
const rafraichir = async () => {
  refreshing.value = true;
  try {
    await loadGameData();
  } finally {
    refreshing.value = false;
  }
};

// Quitter la partie
const quitterPartie = async () => {
  if (!game.value || !currentUser.value) return;
  
  try {
    // Si on est joueur O, on peut quitter
    if (currentUser.value.id === game.value.player_o_id) {
      await GameService.leaveGame(gameId.value, currentUser.value.id);
    }
    // Si on est joueur X, on abandonne la partie
    else if (currentUser.value.id === game.value.player_x_id) {
      await GameService.update(gameId.value, { status: 'abandoned' });
    }
  } catch (error) {
    console.error('Erreur quitter partie:', error);
  }
  
  router.push('/attente');
};

// Nouvelle partie
const nouvellePartie = async () => {
  try {
    if (currentUser.value) {
      const newGame = await GameService.create({
        player_x_id: currentUser.value.id
      });
      router.push(`/jeu/${newGame.id}`);
    }
  } catch (error) {
    console.error('Erreur nouvelle partie:', error);
  }
};

// Retour à l'attente
const retourAttente = () => {
  router.push('/attente');
};

// Fermer la modal
const closeModal = () => {
  showEndModal.value = false;
};
</script>

<style scoped>
.page-jeu {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.jeu-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.jeu-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-info h1 {
  margin: 0;
  font-size: 1.5rem;
}

.game-id {
  opacity: 0.8;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.jeu-main {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.players-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.player {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.player.active {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border: 2px solid #667eea;
}

.player.current {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}

.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 500;
  color: #333;
}

.player-symbol {
  font-size: 0.875rem;
  color: #666;
}

.vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
}

.board-section {
  text-align: center;
}

.game-status {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 500;
}

.status-waiting {
  color: #ffc107;
}

.status-playing {
  color: #28a745;
}

.status-finished {
  color: #dc3545;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 300px;
  margin: 0 auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.board.disabled {
  opacity: 0.7;
}

.cell {
  aspect-ratio: 1;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cell.clickable:hover {
  background: #f8f9fa;
  border-color: #667eea;
  transform: scale(1.05);
}

.cell.x {
  color: #667eea;
}

.cell.o {
  color: #764ba2;
}

.cell.winning {
  background: #28a74520;
  border-color: #28a745;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.moves-section {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1.5rem;
}

.moves-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.moves-list {
  max-height: 200px;
  overflow-y: auto;
}

.move-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.move-item.current {
  background: #667eea10;
  border-radius: 4px;
}

.move-number {
  font-weight: bold;
  color: #666;
  min-width: 30px;
}

.move-player {
  font-weight: bold;
  min-width: 20px;
}

.move-position {
  color: #666;
}

.move-time {
  color: #999;
  font-size: 0.875rem;
}

.empty-moves {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  margin: 0 20px;
}

.modal h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.result {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .jeu-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .jeu-main {
    padding: 1rem;
  }
  
  .players-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .board {
    max-width: 250px;
  }
  
  .cell {
    font-size: 1.5rem;
  }
  
  .move-item {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }
}
</style>
