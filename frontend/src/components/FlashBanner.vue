<!-- =============================================================
  components/FlashBanner.vue
  Bandeau offre flash en haut du site avec countdown

  USAGE dans App.vue ou MarketplaceView.vue :
    import FlashBanner from './components/FlashBanner.vue'
    <FlashBanner />
============================================================= -->
<template>
  <Transition name="flash-banner">
    <div v-if="offre && visible" class="flash-banner" @click="allerAuProduit">

      <!-- Fond animé -->
      <div class="flash-bg"></div>

      <!-- Contenu -->
      <div class="flash-content">

        <!-- Icône flash -->
        <div class="flash-icon">⚡</div>

        <!-- Texte offre -->
        <div class="flash-texte">
          <span class="flash-label">OFFRE FLASH</span>
          <span class="flash-nom">{{ offre.name }}</span>
          <span class="flash-prix">
            <span class="prix-ancien">{{ formaterPrix(offre.price) }}</span>
            <span class="prix-flash">{{ formaterPrix(offre.flash_price) }} MAD</span>
            <span class="prix-unit">/ {{ offre.unit }}</span>
          </span>
        </div>

        <!-- Countdown -->
        <div class="flash-countdown">
          <div class="countdown-label">Expire dans</div>
          <div class="countdown-blocs">
            <div class="countdown-bloc">
              <span class="countdown-n">{{ temps.heures }}</span>
              <span class="countdown-l">h</span>
            </div>
            <span class="countdown-sep">:</span>
            <div class="countdown-bloc">
              <span class="countdown-n">{{ temps.minutes }}</span>
              <span class="countdown-l">m</span>
            </div>
            <span class="countdown-sep">:</span>
            <div class="countdown-bloc">
              <span class="countdown-n">{{ temps.secondes }}</span>
              <span class="countdown-l">s</span>
            </div>
          </div>
        </div>

        <!-- Bouton -->
        <div class="flash-cta">
          <span>Voir l'offre</span>
          <span>→</span>
        </div>

        <!-- Fermer -->
        <button class="flash-close" @click.stop="visible = false">✕</button>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router  = useRouter()
const offre   = ref(null)
const visible = ref(true)
let interval  = null
let fetchInterval = null

// Temps restant calculé
const tempsRestant = ref(0)

const temps = computed(() => {
  const total = Math.max(0, tempsRestant.value)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return {
    heures:   String(h).padStart(2, '0'),
    minutes:  String(m).padStart(2, '0'),
    secondes: String(s).padStart(2, '0'),
  }
})

const formaterPrix = (p) => Number(p).toLocaleString('fr-FR')

const allerAuProduit = () => {
  if (offre.value) router.push(`/products/${offre.value.id}`)
}

// Charger l'offre flash active
const chargerFlash = async () => {
  try {
    const { data } = await api.get('/flash/active')
    if (data.length > 0) {
      offre.value   = data[0] // prend la première (expire bientôt)
      visible.value = true
      // Calcule temps restant en secondes
      const fin = new Date(offre.value.flash_end).getTime()
      tempsRestant.value = Math.floor((fin - Date.now()) / 1000)
    } else {
      offre.value = null
    }
  } catch {}
}

// Tick countdown chaque seconde
const tick = () => {
  if (tempsRestant.value <= 0) {
    offre.value = null
    chargerFlash() // vérifie s'il y a une nouvelle offre
    return
  }
  tempsRestant.value--
}

onMounted(async () => {
  await chargerFlash()
  interval      = setInterval(tick, 1000)
  fetchInterval = setInterval(chargerFlash, 60000) // recheck toutes les 60s
})

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(fetchInterval)
})
</script>

<style scoped>
.flash-banner {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #7f0000, #c0392b, #e74c3c);
  cursor: pointer; z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,.15);
}

/* Fond animé rayures diagonales */
.flash-bg {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0,0,0,.04) 10px,
    rgba(0,0,0,.04) 20px
  );
  animation: slide-bg 3s linear infinite;
}
@keyframes slide-bg { to { background-position: 40px 0; } }

.flash-content {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 16px; padding: 10px 48px 10px 16px;
  flex-wrap: wrap;
}

/* Icône flash pulsante */
.flash-icon {
  font-size: 1.4rem;
  animation: pulse-flash 1s ease-in-out infinite alternate;
  flex-shrink: 0;
}
@keyframes pulse-flash { from { transform: scale(1); } to { transform: scale(1.3); } }

/* Texte */
.flash-texte {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.flash-label {
  background: rgba(255,255,255,.2); color: white;
  font-size: .65rem; font-weight: 900; letter-spacing: .12em;
  padding: 2px 8px; border-radius: 4px;
}
.flash-nom {
  color: white; font-weight: 800; font-size: .9rem;
}
.flash-prix {
  display: flex; align-items: baseline; gap: 6px;
}
.prix-ancien {
  color: rgba(255,255,255,.5); font-size: .78rem;
  text-decoration: line-through;
}
.prix-flash {
  color: #ffd700; font-size: 1.1rem; font-weight: 900;
  text-shadow: 0 0 12px rgba(255,215,0,.5);
}
.prix-unit { color: rgba(255,255,255,.6); font-size: .75rem; }

/* Countdown */
.flash-countdown { display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0; }
.countdown-label { color: rgba(255,255,255,.6); font-size: .6rem; text-transform: uppercase; letter-spacing: .08em; }
.countdown-blocs { display: flex; align-items: center; gap: 4px; }
.countdown-bloc {
  background: rgba(0,0,0,.25); border-radius: 6px;
  padding: 4px 8px; display: flex; align-items: baseline; gap: 2px;
  min-width: 36px; justify-content: center;
}
.countdown-n { color: white; font-size: 1.1rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.countdown-l { color: rgba(255,255,255,.5); font-size: .65rem; }
.countdown-sep { color: rgba(255,255,255,.4); font-size: 1rem; font-weight: 900; }

/* CTA */
.flash-cta {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3);
  color: white; font-size: .78rem; font-weight: 700;
  padding: 6px 14px; border-radius: 99px;
  transition: background .2s;
  flex-shrink: 0;
}
.flash-banner:hover .flash-cta { background: rgba(255,255,255,.25); }

/* Bouton fermer */
.flash-close {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,.2); border: none; color: rgba(255,255,255,.7);
  width: 24px; height: 24px; border-radius: 50%; font-size: .7rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.flash-close:hover { background: rgba(0,0,0,.4); color: white; }

/* Transition apparition/disparition */
.flash-banner-enter-active, .flash-banner-leave-active { transition: all .4s ease; }
.flash-banner-enter-from, .flash-banner-leave-to { opacity: 0; transform: translateY(-100%); }

/* Mobile */
@media (max-width: 640px) {
  .flash-content { gap: 10px; padding: 8px 36px 8px 10px; }
  .flash-texte   { gap: 6px; }
  .flash-cta     { display: none; }
  .flash-nom     { font-size: .82rem; }
  .prix-flash    { font-size: .95rem; }
}
</style>
