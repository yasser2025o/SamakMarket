<!-- =============================================================
  components/ChatBot.vue
  Chatbot flottant — SamakMarket
  Proxy backend : POST /api/chat → n8n webhook
  ============================================================= -->

<template>

  <!-- ── Bouton flottant ── -->
  <button
    @click="ouvert = !ouvert"
    class="chat-fab"
    :title="ouvert ? 'Fermer le chat' : 'Discuter avec nous'"
  >
    <span v-if="!ouvert" class="text-2xl">💬</span>
    <span v-else class="text-xl font-bold">✕</span>
    <span v-if="!ouvert && messagesNonLus > 0" class="notif-badge">
      {{ messagesNonLus }}
    </span>
  </button>

  <!-- ── Fenêtre de chat ── -->
  <div v-show="ouvert" class="chat-window">

    <!-- En-tête -->
    <div class="chat-header">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-xl">🐟</div>
        <div>
          <div class="font-bold text-white text-sm">Assistant SamakMarket</div>
          <div class="flex items-center gap-1 text-xs text-green-400">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            En ligne
          </div>
        </div>
      </div>
      <button @click="ouvert = false" class="text-white/50 hover:text-white text-lg">✕</button>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="zoneMessages">

      <!-- Message de bienvenue -->
      <div class="msg-bot">
        <span class="msg-avatar">🐟</span>
        <div class="msg-bubble-bot">
          Bonjour ! Je suis l'assistant de SamakMarket. 👋<br>
          Comment puis-je vous aider ?
          <div class="msg-time">{{ heureActuelle }}</div>
        </div>
      </div>

      <!-- Historique messages -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="message.type === 'user' ? 'msg-user' : 'msg-bot'"
      >
        <span v-if="message.type !== 'user'" class="msg-avatar">🐟</span>
        <div :class="message.type === 'user' ? 'msg-bubble-user' : 'msg-bubble-bot'">
          {{ message.texte }}
          <div class="msg-time">{{ message.heure }}</div>
        </div>
      </div>

      <!-- Indicateur chargement -->
      <div v-if="chargement" class="msg-bot">
        <span class="msg-avatar">🐟</span>
        <div class="msg-bubble-bot typing">
          <span></span><span></span><span></span>
        </div>
      </div>

    </div>

    <!-- Suggestions rapides -->
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
      <button
        @click="envoyerMessage"
        :disabled="!messageEnCours.trim() || chargement"
        class="chat-send-btn"
      >➤</button>
    </div>

  </div>

</template>


<script setup>
import { ref, nextTick, watch } from 'vue'

// =============================================================
// PROXY BACKEND — plus besoin de l'URL n8n directe
// Le frontend appelle /api/chat → backend forward vers n8n
// =============================================================
const PROXY_URL = '/api/chat'

// ── State ────────────────────────────────────────────────────
const ouvert          = ref(false)
const messages        = ref([])
const messageEnCours  = ref('')
const chargement      = ref(false)
const messagesNonLus  = ref(1)
const zoneMessages    = ref(null)

const sessionId = 'samak_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)

const heureActuelle = new Date().toLocaleTimeString('fr-FR', {
  hour: '2-digit', minute: '2-digit'
})

const suggestions = [
  '🐟 Sardines disponibles ?',
  '📍 Où livrez-vous ?',
  '💰 Comment publier un produit ?',
  '📞 Contacter le support',
]

watch(ouvert, (v) => { if (v) messagesNonLus.value = 0 })

const scrollerEnBas = async () => {
  await nextTick()
  if (zoneMessages.value) {
    zoneMessages.value.scrollTop = zoneMessages.value.scrollHeight
  }
}

const envoyerSuggestion = (texte) => {
  messageEnCours.value = texte
  envoyerMessage()
}

const envoyerMessage = async () => {
  const texte = messageEnCours.value.trim()
  if (!texte || chargement.value) return

  const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  messages.value.push({ type: 'user', texte, heure })
  messageEnCours.value = ''
  chargement.value = true
  await scrollerEnBas()

  try {
    // Appel vers le proxy backend (pas n8n directement)
    const reponse = await fetch(PROXY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message:   texte,
        timestamp: new Date().toISOString(),
        source:    'SamakMarket chatbot',
        page:      window.location.pathname,
        sessionId,
      }),
    })

    if (reponse.ok) {
      const data = await reponse.json()
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
      throw new Error(`HTTP ${reponse.status}`)
    }

  } catch (err) {
    console.error('Erreur chatbot:', err)
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
.chat-fab {
  position: fixed; bottom: 28px; right: 28px; z-index: 1000;
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, #0077b6, #00b4d8);
  border: none; color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 24px rgba(0,119,182,.5);
  transition: transform .2s, box-shadow .2s;
}
.chat-fab:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,119,182,.65); }

.notif-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: white; font-size: .65rem; font-weight: 700;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

.chat-window {
  position: fixed; bottom: 96px; right: 28px; z-index: 999;
  width: 340px; max-height: 500px;
  background: #0f1f3d; border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.4);
  display: flex; flex-direction: column; overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #0077b6, #0096c7);
  padding: 14px 16px; display: flex; align-items: center;
  justify-content: space-between; flex-shrink: 0;
}

.chat-messages {
  flex: 1; overflow-y: auto; padding: 14px;
  display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.1) transparent;
}

.msg-user { display: flex; justify-content: flex-end; }
.msg-bubble-user {
  background: linear-gradient(135deg, #0077b6, #00b4d8);
  color: white; padding: 10px 14px;
  border-radius: 18px 18px 4px 18px;
  font-size: .84rem; max-width: 80%; line-height: 1.5;
}

.msg-bot { display: flex; align-items: flex-end; gap: 8px; }
.msg-avatar { font-size: 1.3rem; flex-shrink: 0; }
.msg-bubble-bot {
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.9); padding: 10px 14px;
  border-radius: 18px 18px 18px 4px;
  font-size: .84rem; max-width: 80%; line-height: 1.5;
}

.msg-time { font-size: .65rem; opacity: .45; margin-top: 4px; text-align: right; }

.typing { display: flex; gap: 4px; align-items: center; padding: 12px 16px; }
.typing span {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,.5); animation: bounce 1.2s infinite;
}
.typing span:nth-child(2) { animation-delay: .2s; }
.typing span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%            { transform: translateY(-6px); }
}

.chat-suggestions {
  padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 6px;
  border-top: 1px solid rgba(255,255,255,.06);
}
.suggestion-btn {
  background: rgba(0,180,216,.12); border: 1px solid rgba(0,180,216,.25);
  color: #90e0ef; font-size: .75rem; padding: 5px 10px;
  border-radius: 99px; cursor: pointer; transition: background .2s; white-space: nowrap;
}
.suggestion-btn:hover { background: rgba(0,180,216,.25); }

.chat-input-zone {
  display: flex; gap: 8px; padding: 12px;
  border-top: 1px solid rgba(255,255,255,.08); flex-shrink: 0;
}
.chat-input {
  flex: 1; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  color: white; padding: 10px 14px; border-radius: 12px; font-size: .84rem;
  outline: none; transition: border-color .2s;
}
.chat-input::placeholder { color: rgba(255,255,255,.3); }
.chat-input:focus { border-color: rgba(0,180,216,.5); }
.chat-input:disabled { opacity: .5; }

.chat-send-btn {
  background: linear-gradient(135deg, #0077b6, #00b4d8);
  border: none; color: white; width: 40px; height: 40px;
  border-radius: 10px; cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: opacity .2s; flex-shrink: 0;
}
.chat-send-btn:disabled { opacity: .4; cursor: not-allowed; }
.chat-send-btn:not(:disabled):hover { opacity: .85; }

@media (max-width: 420px) {
  .chat-window { right: 12px; left: 12px; width: auto; bottom: 88px; }
  .chat-fab    { right: 16px; bottom: 20px; }
}
</style>
