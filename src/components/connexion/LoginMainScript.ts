import { ref, reactive } from 'vue'

interface LoginData {
  username: string;
  user?: any;
  error?: string;
}

export function useLoginMain(emit: (event: 'login', data: LoginData) => void) {
  // ── Fond décoratif ─────────────────────────────────────
  const bgSymbols = (['X', 'O', null, 'O', 'X', 'O', null, 'X', 'O'] as const)

  // ── Formulaire ────────────────────────────────────────
  const form = reactive({ username: '' })
  const errors = reactive({ username: '' })
  const focused = ref<'username' | null>(null)
  const isLoading = ref(false)
  const isSuccess = ref(false)
  const shaking = ref(false)

  // ── Validation ────────────────────────────────────────
  function validateField() {
    errors.username = ''
    if (!form.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis'
      return false
    }
    if (form.username.trim().length < 2) {
      errors.username = '2 caractères minimum'
      return false
    }
    if (form.username.trim().length > 255) {
      errors.username = '255 caractères maximum'
      return false
    }
    return true
  }

  function validateAll(): boolean {
    return validateField()
  }

  // ── Soumission ────────────────────────────────────────
  async function submit() {
    if (!validateAll()) {
      triggerShake()
      return
    }
    
    isLoading.value = true
    
    try {
      // Créer l'utilisateur via le service
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username.trim()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const userData = await response.json();
      
      isLoading.value = false
      isSuccess.value = true
      
      // Émettre l'événement avec l'utilisateur créé
      emit('login', { 
        username: form.username.trim(),
        user: userData
      })
      
      // Réinitialiser le succès après 2 secondes
      setTimeout(() => {
        isSuccess.value = false
      }, 2000)
      
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      isLoading.value = false;
      
      // Gérer les erreurs spécifiques
      let errorMessage = 'Erreur de création';
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('duplicate key') || message.includes('users_username_key')) {
          errorMessage = 'Ce nom d\'utilisateur est déjà pris';
          errors.username = errorMessage;
          triggerShake();
        } else if (message.includes('HTTP error')) {
          errorMessage = 'Erreur serveur, veuillez réessayer';
        } else {
          errorMessage = message;
        }
      }
      
      emit('login', { 
        username: form.username.trim(),
        error: errorMessage
      });
    }
  }

  function triggerShake() {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 500)
  }

  return {
    // État
    form,
    errors,
    focused,
    isLoading,
    isSuccess,
    shaking,
    bgSymbols,
    
    // Méthodes
    validateField,
    validateAll,
    submit,
    triggerShake
  }
}
