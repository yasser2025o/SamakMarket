<!-- =============================================================
  components/ChatBot.vue
  Chatbot flottant avec envoi vers webhook n8n (self-hosted)
  =============================================================
  Fonctionnement :
    1. Bouton flottant en bas à droite (toujours visible)
    2. Clic → ouvre une fenêtre de chat
    3. L'utilisateur envoie un message
    4. Le message est envoyé en POST vers ton webhook n8n
    5. n8n répond (ou pas) → on affiche la réponse

  Pour connecter ton n8n :
    - Dans n8n : crée un workflow avec le nœud "Webhook"
    - Copie l'URL du webhook
    - Colle-la dans la variable WEBHOOK_URL ci-dessous
  ============================================================= -->

<template>

  <!-- ── Bouton flottant (toujours visible) ── -->
  <button
    @click="ouvert = !ouvert"
    class="chat-fab"
    :title="ouvert ? 'Fermer le chat' : 'Discuter avec nous'"
  >
    <!-- Icône chat fermé -->
    <span v-if="!ouvert" class="text-2xl">💬</span>
    <!-- Icône fermer -->
    <span v-else class="text-xl font-bold">✕</span>

    <!-- Badge rouge si messages non lus -->
    <span v-if="!ouvert && messagesNonLus > 0" class="notif-badge">
      {{ messagesNonLus }}
    </span>
  </button>

  <!-- ── Fenêtre de chat ── -->
  <!--
    v-show = affiche/cache sans détruire le DOM (garde l'historique)
    Différence avec v-if : v-if détruit et recrée, v-show juste cache
  -->
  <div v-show="ouvert" class="chat-window">

    <!-- En-tête du chat -->
    <div class="chat-header">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-xl">
          🐟
        </div>
        <div>
          <div class="font-bold text-white text-sm">Assistant SamakMarket</div>
          <!-- Point vert = "en ligne" -->
          <div class="flex items-center gap-1 text-xs text-green-400">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            En ligne
          </div>
        </div>
      </div>
      <button @click="ouvert = false" class="text-white/50 hover:text-white text-lg">✕</button>
    </div>

    <!-- Zone des messages -->
    <!--
      ref="zoneMessages" = référence DOM pour pouvoir scroller vers le bas
      automatiquement après chaque nouveau message
    -->
    <div class="chat-messages" ref="zoneMessages">

      <!-- Message de bienvenue automatique -->
      <div class="msg-bot">
        <span class="msg-avatar">🐟</span>
        <div class="msg-bubble-bot">
          Bonjour ! Je suis l'assistant de SamakMarket. 👋<br>
          Comment puis-je vous aider ?
          <div class="msg-time">{{ heureActuelle }}</div>
        </div>
      </div>

      <!-- Boucle sur tous les messages de la conversation -->
      <!--
        message.type = 'user' (envoyé par le visiteur)
                     = 'bot'  (réponse du webhook n8n)
                     = 'erreur' (si le webhook ne répond pas)
      -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="message.type === 'user' ? 'msg-user' : 'msg-bot'"
      >
        <!-- Avatar bot -->
        <span v-if="message.type !== 'user'" class="msg-avatar">🐟</span>

        <!-- Bulle de message -->
        <div :class="message.type === 'user' ? 'msg-bubble-user' : 'msg-bubble-bot'">
          {{ message.texte }}
          <div class="msg-time">{{ message.heure }}</div>
        </div>
      </div>

      <!-- Indicateur "en train d'écrire..." pendant l'appel au webhook -->
      <div v-if="chargement" class="msg-bot">
        <span class="msg-avatar">🐟</span>
        <div class="msg-bubble-bot typing">
          <span></span><span></span><span></span>
        </div>
      </div>

    </div>

    <!-- Suggestions rapides (raccourcis de questions fréquentes) -->
    <div v-if="messages.length === 0" class="chat-suggestions">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        @click="envoyerSuggestion(suggestion)"
        class="suggestion-btn"
      >
        {{ suggestion }}
      </button>
    </div>

    <!-- Zone de saisie -->
    <div class="chat-input-zone">
      <input
        v-model="messageEnCours"
        @keydown.enter="envoyerMessage"
        placeholder="Votre message..."
        :disabled="chargement"
        class="chat-input"
        maxlength="500"
      />
      <!-- Bouton envoyer -->
      <button
        @click="envoyerMessage"
        :disabled="!messageEnCours.trim() || chargement"
        class="chat-send-btn"
      >
        ➤
      </button>
    </div>

  </div>

</template>


<script setup>
import { ref, nextTick, onMounted } from 'vue'

// =============================================================
// ⚙️ CONFIGURATION — À MODIFIER SELON TON INSTALLATION n8n
// =============================================================
/*
  WEBHOOK_URL = l'URL de ton webhook n8n self-hosted.

  Comment l'obtenir dans n8n :
    1. Crée un nouveau workflow
    2. Ajoute le nœud "Webhook" (trigger)
    3. Méthode : POST
    4. Copie l'URL affichée (ex: http://ton-serveur:5678/webhook/samakmarket)
    5. Colle-la ici

  n8n recevra un JSON comme ceci :
    {
      "message":   "Où trouver des sardines ?",
      "timestamp": "2024-01-15T10:30:00",
      "source":    "SamakMarket chatbot",
      "page":      "marketplace"
    }

  n8n peut ensuite :
    - Répondre directement (webhook répond avec { "reponse": "..." })
    - Envoyer vers un LLM (OpenAI, Ollama...)
    - Notifier le vendeur sur WhatsApp
    - Sauvegarder dans une DB
*/
const WEBHOOK_URL = 'https://kase-prejudiciable-undistrustfully.ngrok-free.dev/webhook/samakAi'
// =============================================================

// ── State du chatbot ─────────────────────────────────────────

// true = fenêtre ouverte, false = réduite au bouton flottant
const ouvert = ref(false)

// Tableau des messages affichés dans le chat
// Chaque message : { type: 'user'|'bot'|'erreur', texte: '...', heure: '...' }
const messages = ref([])

// Texte en cours de frappe dans l'input
const messageEnCours = ref('')

// true = requête vers n8n en cours → affiche les "..."
const chargement = ref(false)

// Compteur de messages non lus (affiché sur le bouton FAB)
const messagesNonLus = ref(1) // 1 = message de bienvenue

// Référence vers la div des messages (pour auto-scroll)
const zoneMessages = ref(null)

// Suggestions de questions rapides
const suggestions = [
  '🐟 Sardines disponibles ?',
  '📍 Où livrez-vous ?',
  '💰 Comment publier un produit ?',
  '📞 Contacter le support',
]

// Heure actuelle formatée pour le message de bienvenue
const heureActuelle = new Date().toLocaleTimeString('fr-FR', {
  hour:   '2-digit',
  minute: '2-digit',
})

// Quand on ouvre le chat → remettre les non-lus à 0
import { watch } from 'vue'
watch(ouvert, (valeur) => {
  if (valeur) messagesNonLus.value = 0
})

// ── Scroll automatique vers le bas ───────────────────────────
/*
  nextTick() = attendre que Vue ait mis à jour le DOM
  avant de scroller. Sans ça, on scrollerait avant
  que le nouveau message soit rendu dans le HTML.
*/
const scrollerEnBas = async () => {
  await nextTick()
  if (zoneMessages.value) {
    zoneMessages.value.scrollTop = zoneMessages.value.scrollHeight
  }
}

// ── Envoyer une suggestion rapide ────────────────────────────
const envoyerSuggestion = (texte) => {
  messageEnCours.value = texte
  envoyerMessage()
}

// ── Fonction principale : envoyer un message au webhook n8n ──
const envoyerMessage = async () => {

  const texte = messageEnCours.value.trim()

  // Ne rien faire si le message est vide
  if (!texte || chargement.value) return

  // 1. Ajouter le message de l'utilisateur dans l'interface
  const heure = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })

  messages.value.push({
    type:  'user',
    texte: texte,
    heure: heure,
  })

  // Vider l'input
  messageEnCours.value = ''
  chargement.value = true
  await scrollerEnBas()

  try {
    // 2. Envoyer les données au webhook n8n via POST
    /*
      On envoie un objet JSON avec :
      - message   : ce que l'utilisateur a tapé
      - timestamp : date/heure pour n8n
      - source    : identifier d'où vient la requête
      - page      : page du site (utile si plusieurs pages ont le chatbot)

      n8n peut utiliser ces données pour personnaliser la réponse,
      les logger, les envoyer à un LLM, etc.
    */
    // En dehors de la fonction envoyerMessage, dans le <script setup>
    // Génère un ID une seule fois au démarrage du composant
    const sessionId = 'samak_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)

    const reponse = await fetch(WEBHOOK_URL, {
  method: 'POST',
   mode: 'cors', 
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // ← AJOUTE CETTE LIGNE
    
  },
  //body: JSON.stringify({ message: texte })
  body: JSON.stringify({
    message: texte,
    timestamp: new Date().toISOString(),
    source: 'SamakMarket chatbot',
    page: window.location.pathname,
    sessionId: sessionId,
    
  }),
});


    // 3. Lire la réponse de n8n
    /*
      n8n doit retourner un JSON avec une clé "reponse" ou "message" :
        { "reponse": "Bonjour ! Voici les sardines disponibles..." }

      Dans ton workflow n8n, utilise le nœud "Respond to Webhook"
      avec ce format de réponse.
    */
    if (reponse.ok) {
      const data = await reponse.json()

      // Cherche "reponse" ou "message" ou "output" selon ce que renvoie n8n
      const texteReponse = data.reponse
        || data.message
        || data.output
        || data.text
        || '✅ Message reçu ! Un conseiller vous contactera bientôt.'

      messages.value.push({
        type:  'bot',
        texte: texteReponse,
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      })

    } else {
      // Le webhook a répondu mais avec une erreur HTTP
      throw new Error(`HTTP ${reponse.status}`)
    }

  } catch (erreur) {
    // 4. Erreur réseau ou webhook inaccessible
    /*
      Causes possibles :
      - n8n n'est pas démarré
      - WEBHOOK_URL incorrecte
      - Erreur CORS (si n8n est sur un autre domaine)
      Pour le CORS dans n8n : Settings → Enable CORS → Add ton domaine
    */
    console.error('Erreur webhook n8n :', erreur)

    messages.value.push({
      type:  'erreur',
      texte: '⚠️ Service temporairement indisponible. Contactez-nous via WhatsApp.',
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  chargement.value = false
  messagesNonLus.value++
  await scrollerEnBas()
}
</script>


<style scoped>
/* ── Bouton flottant (FAB) ── */
.chat-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0077b6, #00b4d8);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(0, 119, 182, 0.5);
  transition: transform .2s, box-shadow .2s;
}
.chat-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 32px rgba(0, 119, 182, 0.65);
}

/* Badge notifications rouges */
.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: .65rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* ── Fenêtre de chat ── */
.chat-window {
  position: fixed;
  bottom: 96px;
  right: 28px;
  z-index: 999;
  width: 340px;
  max-height: 500px;
  background: #0f1f3d;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* En-tête du chat */
.chat-header {
  background: linear-gradient(135deg, #0077b6, #0096c7);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

/* Zone des messages (scrollable) */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Scrollbar discrète */
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.1) transparent;
}

/* ── Bulles de messages ── */

/* Message utilisateur : aligné à droite */
.msg-user {
  display: flex;
  justify-content: flex-end;
}
.msg-bubble-user {
  background: linear-gradient(135deg, #0077b6, #00b4d8);
  color: white;
  padding: 10px 14px;
  border-radius: 18px 18px 4px 18px;
  font-size: .84rem;
  max-width: 80%;
  line-height: 1.5;
}

/* Message bot : aligné à gauche */
.msg-bot {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.msg-avatar {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.msg-bubble-bot {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.9);
  padding: 10px 14px;
  border-radius: 18px 18px 18px 4px;
  font-size: .84rem;
  max-width: 80%;
  line-height: 1.5;
}

/* Heure sous le message */
.msg-time {
  font-size: .65rem;
  opacity: .45;
  margin-top: 4px;
  text-align: right;
}

/* Animation "en train d'écrire" (3 points qui clignotent) */
.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 16px;
}
.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,.5);
  animation: bounce 1.2s infinite;
}
.typing span:nth-child(2) { animation-delay: .2s; }
.typing span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%            { transform: translateY(-6px); }
}

/* ── Suggestions rapides ── */
.chat-suggestions {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid rgba(255,255,255,.06);
}
.suggestion-btn {
  background: rgba(0, 180, 216, .12);
  border: 1px solid rgba(0, 180, 216, .25);
  color: #90e0ef;
  font-size: .75rem;
  padding: 5px 10px;
  border-radius: 99px;
  cursor: pointer;
  transition: background .2s;
  white-space: nowrap;
}
.suggestion-btn:hover {
  background: rgba(0, 180, 216, .25);
}

/* ── Zone de saisie ── */
.chat-input-zone {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.08);
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: .84rem;
  outline: none;
  transition: border-color .2s;
}
.chat-input::placeholder { color: rgba(255,255,255,.3); }
.chat-input:focus { border-color: rgba(0,180,216,.5); }
.chat-input:disabled { opacity: .5; }

.chat-send-btn {
  background: linear-gradient(135deg, #0077b6, #00b4d8);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .2s;
  flex-shrink: 0;
}
.chat-send-btn:disabled { opacity: .4; cursor: not-allowed; }
.chat-send-btn:not(:disabled):hover { opacity: .85; }

/* Responsive mobile */
@media (max-width: 420px) {
  .chat-window {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 88px;
  }
  .chat-fab {
    right: 16px;
    bottom: 20px;
  }
}
</style>
