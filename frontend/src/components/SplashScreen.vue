<!-- =============================================================
  components/SplashScreen.vue — SamakMarket
  Splash screen style app mobile — Darija + logo animé

  USAGE dans App.vue :
    import SplashScreen from './components/SplashScreen.vue'
    <SplashScreen v-if="showSplash" @done="showSplash = false" />

  FICHIER REQUIS :
    Copie logo-samak.png dans : frontend/public/logo-samak.png
============================================================= -->
<template>
  <Transition name="splash-out">
    <div v-if="visible" class="splash">

      <!-- ── Fond ocean animé (couleurs du logo : beige/blanc + bleu + or) ── -->
      <div class="splash-bg">
        <div class="bg-radial"></div>
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
        <div v-for="n in 14" :key="n" :class="`particle p${n}`"></div>
      </div>

      <!-- ── Contenu ── -->
      <div class="splash-content">

        <!-- Logo avec anneaux tournants -->
        <div class="logo-vitrine">
          <div class="ring ring1"></div>
          <div class="ring ring2"></div>
          <div class="ring ring3"></div>
          <div class="logo-cercle">
            <img src="/logo-samak.png" alt="SamakMarket" class="logo-img" />
          </div>
          <!-- Petits points dorés sur les anneaux -->
          <div class="ring-dot dot1"></div>
          <div class="ring-dot dot2"></div>
          <div class="ring-dot dot3"></div>
        </div>

        <!-- Nom + slogan -->
        <div class="splash-texte">
          <h1 class="splash-titre">SamakMarket</h1>
          <p class="splash-slogan">🐟 السمك الطازج — من البحر لديك مباشرة</p>
          <p class="splash-sous">Poisson frais · Direct pêcheurs · Maroc 🇲🇦</p>
        </div>

        <!-- Stats live animées -->
        <div class="splash-stats">
          <div class="stat-item">
            <span class="stat-num">{{ stats.vendeurs }}+</span>
            <span class="stat-label">بائعين</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-num">{{ stats.villes }}</span>
            <span class="stat-label">مدن</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-num">{{ stats.produits }}+</span>
            <span class="stat-label">منتجات</span>
          </div>
        </div>

        <!-- Loader -->
        <div class="splash-loader">
          <div class="loader-track">
            <div class="loader-fill" :style="{ width: progression + '%' }"></div>
          </div>
          <span class="loader-msg">{{ message }}</span>
        </div>

      </div>

      <!-- Footer -->
      <p class="splash-footer">صنع في المغرب بكل محبة 🇲🇦</p>

    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['done'])

const visible     = ref(true)
const progression = ref(0)
const stats       = ref({ vendeurs: 0, villes: 0, produits: 0 })

const messages = [
  'جاري التحميل... ⏳',
  'نجيبو ليك السمك الطازج 🐟',
  'كاين البائعين تيستناوك...',
  'مرحبا بيك في SamakMarket! 🎉',
]
const message = ref(messages[0])

// Anime un compteur de 0 → cible
const animerCompteur = (cible, clef, duree = 1200) => {
  const debut = Date.now()
  const tick  = () => {
    const pct = Math.min((Date.now() - debut) / duree, 1)
    const ease = 1 - Math.pow(1 - pct, 3) // easeOutCubic
    stats.value[clef] = Math.round(ease * cible)
    if (pct < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(async () => {
  // Charge stats réelles ou fallback démo
  try {
    const token = localStorage.getItem('token')
    const res   = await fetch('/api/admin/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      animerCompteur(data.totalVendeurs || 12, 'vendeurs')
      animerCompteur(data.totalProduits || 80, 'produits', 1400)
    } else throw new Error()
  } catch {
    animerCompteur(12, 'vendeurs')
    animerCompteur(80, 'produits', 1400)
  }
  animerCompteur(8, 'villes', 1100)

  // Barre de progression + messages (3.5 secondes total)
  const DUREE  = 3500
  const debut  = Date.now()

  const tick = () => {
    const elapsed = Date.now() - debut
    const pct     = Math.min((elapsed / DUREE) * 100, 100)
    progression.value = pct

    if      (pct < 25)  message.value = messages[0]
    else if (pct < 55)  message.value = messages[1]
    else if (pct < 85)  message.value = messages[2]
    else                message.value = messages[3]

    if (pct < 100) {
      requestAnimationFrame(tick)
    } else {
      setTimeout(() => {
        visible.value = false
        setTimeout(() => emit('done'), 700)
      }, 350)
    }
  }
  requestAnimationFrame(tick)
})
</script>

<style scoped>
/* ══ PAGE ════════════════════════════════════════════════ */
.splash {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column;
  align-items: center; justify-content: space-between;
  padding: 48px 24px 28px;
  overflow: hidden;
}

/* ══ FOND ════════════════════════════════════════════════ */
.splash-bg {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}

/* Fond : reprend les couleurs du logo — beige chaud en haut, bleu ocean en bas */
.bg-radial {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, #f5f0e8 0%, transparent 55%),
    radial-gradient(ellipse 100% 60% at 50% 100%, #0a2744 0%, transparent 60%),
    linear-gradient(180deg, #1a3a5c 0%, #0d2340 40%, #071828 100%);
}

/* Vagues bleu ocean */
.wave {
  position: absolute; left: -20%; width: 140%; border-radius: 50%;
  animation: waveMove ease-in-out infinite;
}
.wave1 { height: 3px; bottom: 30%; background: rgba(180,210,240,.2); animation-duration: 7s; }
.wave2 { height: 2px; bottom: 20%; background: rgba(180,210,240,.12); animation-duration: 11s; animation-delay: 2s; }
.wave3 { height: 3px; bottom: 10%; background: rgba(180,210,240,.18); animation-duration: 9s;  animation-delay: 4s; }
@keyframes waveMove {
  0%,100% { transform: translateX(0); }
  50%     { transform: translateX(6%); }
}

/* Particules dorées */
.particle {
  position: absolute; border-radius: 50%;
  background: #c9a227; opacity: 0;
  animation: floatUp ease-in infinite;
}
.p1  { left:5%;  bottom:8%;  width:4px; height:4px; animation-duration:3.5s; animation-delay:0s; }
.p2  { left:12%; bottom:4%;  width:3px; height:3px; animation-duration:4.2s; animation-delay:.5s; }
.p3  { left:22%; bottom:12%; width:4px; height:4px; animation-duration:3.8s; animation-delay:1s; }
.p4  { left:33%; bottom:6%;  width:5px; height:5px; animation-duration:4.5s; animation-delay:1.5s; }
.p5  { left:48%; bottom:3%;  width:3px; height:3px; animation-duration:3.2s; animation-delay:.3s; }
.p6  { left:58%; bottom:10%; width:4px; height:4px; animation-duration:4.1s; animation-delay:.8s; }
.p7  { left:70%; bottom:5%;  width:3px; height:3px; animation-duration:3.9s; animation-delay:1.3s; }
.p8  { left:80%; bottom:15%; width:4px; height:4px; animation-duration:4.3s; animation-delay:.2s; }
.p9  { left:90%; bottom:4%;  width:3px; height:3px; animation-duration:3.6s; animation-delay:1.8s; }
.p10 { left:42%; bottom:18%; width:2px; height:2px; animation-duration:5s;   animation-delay:.4s; }
.p11 { left:18%; bottom:22%; width:3px; height:3px; animation-duration:4.8s; animation-delay:2s; }
.p12 { left:75%; bottom:20%; width:4px; height:4px; animation-duration:4s;   animation-delay:1.1s; }
.p13 { left:55%; bottom:25%; width:2px; height:2px; animation-duration:3.3s; animation-delay:.7s; }
.p14 { left:28%; bottom:30%; width:3px; height:3px; animation-duration:4.6s; animation-delay:1.6s; }
@keyframes floatUp {
  0%   { opacity:0;  transform:translateY(0) scale(0); }
  15%  { opacity:.9; transform:translateY(-10px) scale(1); }
  80%  { opacity:.3; }
  100% { opacity:0;  transform:translateY(-100px) scale(.5); }
}

/* ══ CONTENU ══════════════════════════════════════════════ */
.splash-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: 28px; flex: 1; justify-content: center;
  width: 100%; max-width: 360px;
}

/* ── Logo vitrine ── */
.logo-vitrine {
  position: relative;
  width: 220px; height: 220px;
  display: flex; align-items: center; justify-content: center;
}

/* Anneaux tournants — couleur or du logo */
.ring {
  position: absolute; border-radius: 50%;
  border: 2px solid transparent;
  animation: ringTurn linear infinite;
}
.ring1 {
  width: 200px; height: 200px;
  border-top-color: rgba(201,162,39,.8);
  border-right-color: rgba(201,162,39,.3);
  animation-duration: 3s;
}
.ring2 {
  width: 218px; height: 218px;
  border-top-color: rgba(29,100,160,.6);
  border-left-color: rgba(29,100,160,.2);
  animation-duration: 5s; animation-direction: reverse;
}
.ring3 {
  width: 236px; height: 236px;
  border-bottom-color: rgba(201,162,39,.35);
  border-right-color: rgba(201,162,39,.1);
  animation-duration: 8s;
}
@keyframes ringTurn { to { transform: rotate(360deg); } }

/* Points lumineux sur les anneaux */
.ring-dot {
  position: absolute; width: 8px; height: 8px; border-radius: 50%;
  background: #c9a227;
  box-shadow: 0 0 8px rgba(201,162,39,.8), 0 0 16px rgba(201,162,39,.4);
  animation: ringTurn linear infinite;
}
.dot1 { width:222px; height:222px; background:transparent; box-shadow:none;
        border:none; animation-duration:3s;
        /* Positionne un point sur l'anneau */
}
/* Simplification — dots fixes autour */
.ring-dot { animation: dotOrbit linear infinite; }
.dot1 { width:8px; height:8px; background:#c9a227;
        offset-path: none;
        top: calc(50% - 110px); left: 50%; transform-origin: 0 110px;
        animation-duration: 3s; }
.dot2 { width:6px; height:6px; background:#1d64a0;
        top: calc(50% - 119px); left: 50%; transform-origin: 0 119px;
        animation-duration: 5s; animation-direction:reverse; }
.dot3 { width:6px; height:6px; background:#c9a227; opacity:.6;
        top: calc(50% - 128px); left: 50%; transform-origin: 0 128px;
        animation-duration: 8s; }
@keyframes dotOrbit { to { transform: rotate(360deg); } }

/* Cercle logo */
.logo-cercle {
  width: 176px; height: 176px; border-radius: 50%; overflow: hidden;
  border: 3px solid rgba(201,162,39,.5);
  box-shadow:
    0 0 0 6px rgba(201,162,39,.08),
    0 0 40px rgba(201,162,39,.25),
    0 0 80px rgba(10,60,120,.4),
    inset 0 0 20px rgba(201,162,39,.1);
  animation: logoBreath 3s ease-in-out infinite;
  background: #f5f0e8;
}
@keyframes logoBreath {
  0%,100% { transform:scale(1);    box-shadow: 0 0 0 6px rgba(201,162,39,.08), 0 0 40px rgba(201,162,39,.25), 0 0 80px rgba(10,60,120,.4); }
  50%     { transform:scale(1.04); box-shadow: 0 0 0 8px rgba(201,162,39,.12), 0 0 60px rgba(201,162,39,.4),  0 0 100px rgba(10,60,120,.5); }
}
.logo-img {
  width: 100%; height: 100%; object-fit: cover; object-position: center top;
}

/* ── Texte ── */
.splash-texte { text-align: center; }
.splash-titre {
  font-size: 2rem; font-weight: 900; letter-spacing: .04em; margin: 0 0 8px;
  background: linear-gradient(135deg, #c9a227, #f0d060, #c9a227);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: goldShimmer 2.5s linear infinite;
}
@keyframes goldShimmer { to { background-position: 200% center; } }

.splash-slogan {
  color: rgba(255,255,255,.8); font-size: .95rem; margin: 0 0 5px;
  direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  line-height: 1.6;
}
.splash-sous {
  color: rgba(255,255,255,.35); font-size: .72rem; margin: 0;
  text-transform: uppercase; letter-spacing: .08em;
}

/* ── Stats ── */
.splash-stats {
  display: flex; align-items: center; gap: 0;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(201,162,39,.18);
  border-radius: 16px; padding: 12px 0; width: 100%;
  backdrop-filter: blur(6px);
}
.stat-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.stat-num {
  color: #f0d060; font-size: 1.2rem; font-weight: 900;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 12px rgba(201,162,39,.5);
}
.stat-label {
  color: rgba(255,255,255,.35); font-size: .7rem;
  direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
}
.stat-sep {
  width: 1px; height: 32px;
  background: rgba(255,255,255,.08);
  flex-shrink: 0;
}

/* ── Loader ── */
.splash-loader {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 9px;
}
.loader-track {
  width: 100%; height: 3px;
  background: rgba(255,255,255,.08); border-radius: 99px; overflow: hidden;
}
.loader-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #1d64a0, #c9a227, #f0d060);
  transition: width .08s linear;
  box-shadow: 0 0 10px rgba(201,162,39,.5);
}
.loader-msg {
  color: rgba(255,255,255,.3); font-size: .75rem;
  direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  min-height: 18px; transition: opacity .3s;
}

/* ══ FOOTER ══════════════════════════════════════════════ */
.splash-footer {
  position: relative; z-index: 1;
  color: rgba(255,255,255,.15); font-size: .72rem;
  direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  margin: 0;
}

/* ══ TRANSITION SORTIE ═══════════════════════════════════ */
.splash-out-leave-active {
  transition: opacity .6s ease, transform .6s cubic-bezier(.4,0,.2,1);
}
.splash-out-leave-to {
  opacity: 0; transform: scale(1.04);
}
</style>
