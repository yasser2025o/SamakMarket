<!-- =============================================================
  components/ProductPromo.vue — SamakMarket
  Slider promo groupé par vendeur
  ✅ Fond photo par ville (avec fallback dégradé)
  ✅ 2 boutons YouTube recettes par type de poisson
  ✅ Slider défilant infini
============================================================= -->
<template>
  <section class="promo-section">

    <!-- En-tête -->
    <div class="promo-header">
      <div class="promo-header-left">
        <span class="fire-ico">🔥</span>
        <div>
          <h2 class="promo-titre">Promotions du jour</h2>
        <span class="fire-ico">🔥</span>
          <p class="promo-sous">Offres directes · Sans intermédiaire</p>
        </div>
      </div>
      <!--<a href="https://www.youtube.com/results?search_query=recette+poisson+marocaine"
        target="_blank" class="yt-header-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
        Recettes vidéo
      </a>-->
    </div>

    <!-- Skeleton -->
    <div v-if="chargement" class="slider-outer">
      <div class="flex gap-5 px-6">
        <div v-for="n in 3" :key="n" class="vendor-card skeleton-card animate-pulse">
          <div class="skeleton-bg"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-white/10 rounded w-3/4"></div>
            <div class="h-3 bg-white/10 rounded w-1/2"></div>
            <div class="h-20 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucune promo -->
    <div v-else-if="vendeurs.length === 0" class="promo-vide">
      <span class="text-3xl">🐟</span>
      <p>Aucune promotion disponible</p>
    </div>

    <!-- ═══ CAROUSEL MANUEL ═══ -->
    <div v-else class="carousel-outer">

      <!-- Flèche gauche -->
      <button @click="prev" class="arrow arrow-left" aria-label="Précédent">‹</button>
      <!-- Flèche droite -->
      <button @click="next" class="arrow arrow-right" aria-label="Suivant">›</button>

      <!-- Carte visible = vendeurs[carteActive] -->
      <div class="carousel-wrap"
        @touchstart="startTouch"
        @touchend="endTouch">

        <transition :name="transDir" mode="out-in">
          <div :key="carteActive"
            v-if="v"
            class="vendor-card"
            :style="cardStyle(v)">

            <!-- variable locale pour lisibilité -->
            <!-- v = vendeur actif -->

          <!-- Overlay sur la photo de fond -->
          <div class="card-overlay"></div>

          <!-- Vagues décoratives -->
          <div class="card-wave w1"></div>
          <div class="card-wave w2"></div>

          <!-- ── HEADER VENDEUR ── -->
          <div class="vendor-head">
            <div class="vendor-av">{{ v.nom.charAt(0).toUpperCase() }}</div>
            <div class="vendor-info">
              <div class="vendor-nom">{{ v.nom }}</div>
              <div class="vendor-ville">📍 {{ v.ville }}</div>
            </div>
            <div class="badge-promo">🔥 PROMO</div>
          </div>

          <!-- ── LISTE PRODUITS ── -->
          <div class="produits-liste">
            <div v-for="p in v.produits" :key="p.id" class="produit-ligne">
              <div class="produit-info">
                <span class="produit-emoji">{{ emojiCat(p.category) }}</span>
                <div>
                  <div class="produit-nom">{{ p.name }}</div>
                  <div class="produit-cat">{{ p.category }}</div>
                </div>
              </div>
              <div class="produit-prix-wrap">
                <span class="produit-prix">{{ Number(p.price).toLocaleString('fr-FR') }}</span>
                <span class="produit-unit">MAD/{{ p.unit }}</span>
              </div>
            </div>
          </div>

          <!-- ── 2 ICÔNES YOUTUBE avec images PNG ── 
          <div class="yt-section">
            <span class="yt-label">🍽️ Recettes pour ce poisson</span>
            <div class="yt-btns">
              <a :href="ytLiens(v.produits[0]?.category).maroc" target="_blank"
                class="yt-btn yt-maroc" title="Recette Marocaine">
                <img src="/images/maroc.png" alt="Maroc" class="yt-img" />
                Marocaine
              </a>
              <a :href="ytLiens(v.produits[0]?.category).med" target="_blank"
                class="yt-btn yt-med" title="Recette Méditerranéenne">
                <img src="/images/med.png" alt="Méditerranée" class="yt-img" />
                Méditerranée
              </a>
           -->
        <div class="yt-section">
  <span class="yt-label">💕 Recettes de Poisson 💕 </span> 
  <div class="flex gap-2 items-center">
    

    <a href="https://www.youtube.com/results?search_query=recette+poisson+marocaine"
      target="_blank"
      class="yt-header-btn flex items-center gap-1">
      
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
      </svg>
شهيوات مغربية
  </a>

    <a href="https://www.youtube.com/results?search_query=recette+poisson+marocaine"
      target="_blank"
      class="yt-header-btn flex items-center gap-1">
      
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
      </svg>

      Méditerranée
    </a>
     </div>
          </div>
          <!-- ── BOUTON WHATSAPP ── -->
          <a :href="waLien(v)" target="_blank" class="btn-wa">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.852L.057 23.25a.75.75 0 0 0 .916.948l5.604-1.47A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.493-5.178-1.354l-.37-.214-3.827 1.004 1.021-3.73-.228-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Contacter {{ v.nom.split(' ')[0] }}
          </a>

          </div><!-- /vendor-card -->
        </transition>

      </div><!-- /carousel-wrap -->

      <!-- ── POINTS DE NAVIGATION ── -->
      <div class="dots">
        <button
          v-for="(v, i) in vendeurs"
          :key="i"
          @click="allerA(i)"
          :class="['dot', i === carteActive ? 'dot-actif' : '']"
          :aria-label="`Vendeur ${i+1}`">
        </button>
      </div>

    </div><!-- /carousel-outer -->

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const produits   = ref([])
const chargement = ref(true)

// ── Fonds photo par ville (tes photos dans public/images/Villes/) ──
// Fallback = dégradé si la photo n'existe pas encore
const bgVilles = {
  'Tanger':     '/images/Villes/tanger.jpg',
  'Casablanca': '/images/Villes/casablanca.jpg',
  'Agadir':     '/images/Villes/agadir.jpg',
  'Rabat':      '/images/Villes/rabat.jpg',
  'Dakhla':     '/images/Villes/dakhla.jpg',
}

// Dégradés de secours par ville si pas de photo
const gradientVilles = {
  'Tanger':     'linear-gradient(145deg, #0d2b4e, #0a1f3a)',
  'Casablanca': 'linear-gradient(145deg, #1a0e2e, #0d0820)',
  'Agadir':     'linear-gradient(145deg, #1a2e0d, #0d200a)',
  'Rabat':      'linear-gradient(145deg, #2e1a0d, #200d0a)',
  'Dakhla':     'linear-gradient(145deg, #0d2e2e, #0a2020)',
}

// Style inline de chaque carte = photo de fond de la ville du vendeur
const cardStyle = (v) => {
  const photo = bgVilles[v.ville]
  if (photo) {
    return {
      backgroundImage: `url('${photo}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  // Pas de photo → dégradé selon la ville
  return { background: gradientVilles[v.ville] || 'linear-gradient(145deg, #0d1f3c, #071428)' }
}

// ── Vendeur actif (alias pour le template) ───────────────────
// "v" = le vendeur affiché dans le carousel
// Utilisé directement dans le template : v.nom, v.produits, etc.
// computed() = se met à jour automatiquement quand carteActive change

// Note: carteActive est défini plus bas dans le script
// Vue 3 avec <script setup> : l'ordre de déclaration n'a pas d'importance

// ── Grouper les produits par vendeur ──────────────────────────
const vendeurs = computed(() => {
  const map = {}
  produits.value.forEach(p => {
    const id = p.seller?.id || p.seller_id
    if (!map[id]) {
      map[id] = {
        id,
        nom:     p.seller?.name  || 'Vendeur',
        ville:   p.city || p.seller?.city || '',
        tel:     p.seller?.whatsapp || p.seller?.phone || '',
        produits: [],
      }
    }
    map[id].produits.push(p)
  })
  return Object.values(map)
})

// Vendeur actif = alias "v" pour simplifier le template
const carteActive = ref(0)
const v = computed(() => vendeurs.value[carteActive.value] || null)

// ── Emoji par catégorie ────────────────────────────────────────
const emojiCat = (cat) => ({
  Sardine:'🐟', Thon:'🐠', Crevette:'🦐', Mérou:'🐡',
  Homard:'🦞', Capitaine:'🐟', Calamar:'🦑', Pieuvre:'🐙',
  Dorade:'🐠', Bar:'🐟', Sole:'🐟', Moule:'🦪',
})[cat] || '🐟'

// ── YouTube par catégorie ──────────────────────────────────────
// TOUJOURS affiché, même si vendeur n'a pas ce type
const ytLiens = (cat) => ({
  Sardine:   { maroc:'https://www.youtube.com/results?search_query=recette+sardine+marocaine+chermoula',         med:'https://www.youtube.com/results?search_query=sardines+grillees+recette+mediterraneenne' },
  Thon:      { maroc:'https://www.youtube.com/results?search_query=tajine+thon+marocain',                        med:'https://www.youtube.com/results?search_query=thon+recette+italienne+sicilienne' },
  Crevette:  { maroc:'https://www.youtube.com/results?search_query=crevettes+chermoula+marocaine',               med:'https://www.youtube.com/results?search_query=crevettes+gambas+recette+espagnole+mediterranee' },
  Mérou:     { maroc:'https://www.youtube.com/results?search_query=merou+tajine+marocain',                       med:'https://www.youtube.com/results?search_query=merou+grille+recette+grecque' },
  Homard:    { maroc:'https://www.youtube.com/results?search_query=homard+recette+marocaine',                    med:'https://www.youtube.com/results?search_query=homard+thermidor+mediterraneen' },
  Capitaine: { maroc:'https://www.youtube.com/results?search_query=capitaine+poisson+recette+marocaine',         med:'https://www.youtube.com/results?search_query=capitaine+poisson+recette+mediterraneenne' },
  Calamar:   { maroc:'https://www.youtube.com/results?search_query=calamar+farci+marocain',                      med:'https://www.youtube.com/results?search_query=calamari+grilles+recette+italienne' },
  Dorade:    { maroc:'https://www.youtube.com/results?search_query=dorade+chermoula+four+marocaine',             med:'https://www.youtube.com/results?search_query=daurade+royale+recette+grecque' },
  Bar:       { maroc:'https://www.youtube.com/results?search_query=bar+loup+recette+marocaine',                  med:'https://www.youtube.com/results?search_query=loup+bar+recette+provencale' },
  Pieuvre:   { maroc:'https://www.youtube.com/results?search_query=poulpe+chermoula+marocaine',                  med:'https://www.youtube.com/results?search_query=poulpe+grille+recette+grecque' },
  Moule:     { maroc:'https://www.youtube.com/results?search_query=moules+recette+marocaine',                    med:'https://www.youtube.com/results?search_query=moules+mariniere+mediterranee' },
})[cat] || {
  maroc: 'https://www.youtube.com/results?search_query=recette+poisson+marocaine',
  med:   'https://www.youtube.com/results?search_query=recette+poisson+mediterraneenne',
}

// ── WhatsApp avec liste des promos ─────────────────────────────
const waLien = (v) => {
  const num = v.tel.replace(/[\s\-\+\(\)]/g, '')
  const liste = v.produits.map(p => `• ${p.name} — ${p.price} MAD/${p.unit}`).join('\n')
  const msg = encodeURIComponent(`Bonjour ${v.nom.split(' ')[0]} ! 🐟\nJe suis intéressé par vos promos SamakMarket :\n${liste}\nDisponible ?`)
  return num ? `https://wa.me/${num}?text=${msg}` : 'https://wa.me/'
}

// ── Carousel : navigation par index ──────────────────────────
const transDir    = ref('slide-left')  // direction de la transition

const next = () => {
  transDir.value = 'slide-left'
  carteActive.value = (carteActive.value + 1) % vendeurs.value.length
}
const prev = () => {
  transDir.value = 'slide-right'
  carteActive.value = (carteActive.value - 1 + vendeurs.value.length) % vendeurs.value.length
}
const allerA = (i) => {
  transDir.value = i > carteActive.value ? 'slide-left' : 'slide-right'
  carteActive.value = i
}

// Swipe touch mobile
let touchX = 0
const startTouch = (e) => { touchX = e.touches[0].clientX }
const endTouch   = (e) => {
  const dx = e.changedTouches[0].clientX - touchX
  if (dx < -40) next()
  if (dx >  40) prev()
}

// ── Chargement API ─────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get('/products/promos')
    produits.value = data.produits
  } catch (e) {
    console.error('Erreur promos:', e)
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
/* ══ Section ══════════════════════════════════════════════════ */
.promo-section {
  background: #020c1b;
  padding: 20px 0 24px;
  overflow: hidden;
}

/* ══ Header ═══════════════════════════════════════════════════ */
.promo-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px 16px;
}
.promo-header-left { display: flex; align-items: center; gap: 10px; }
.fire-ico   { font-size: 1.5rem; animation: fp 1.5s ease-in-out infinite; }
@keyframes fp { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
.promo-titre { color: white; font-size: 1rem; font-weight: 800; }
.promo-sous  {  color: rgba(255,255,255,.3); font-size: .7rem;align-items: center }

.yt-header-btn {
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,0,0,.1); border: 1px solid rgba(255,0,0,.2);
  color: #ff6b6b; font-size: .72rem; font-weight: 700;
  padding: 5px 12px; border-radius: 99px; text-decoration: none;
  transition: all .2s;
}
.yt-header-btn:hover { background: rgba(255,0,0,.2); }

/* ══ Slider ═══════════════════════════════════════════════════ */
/* ══ CAROUSEL ══════════════════════════════════════════════ */
.carousel-outer {
  position: relative;
  padding: 4px 50px 0;   /* espace pour les flèches */
}

/* Conteneur de la carte visible */
.carousel-wrap {
  width: 100%; max-width: 360px;
  margin: 0 auto;
  overflow: hidden;
}

/* Flèches avec animation swipe */
.arrow {
  position: absolute; top: 45%; transform: translateY(-50%);
  z-index: 10; width: 38px; height: 38px; border-radius: 50%;
  background: rgba(212,175,55,.15); border: 1px solid rgba(212,175,55,.3);
  color: #f5d57a; font-size: 1.5rem; font-weight: 300;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.arrow:hover { background: rgba(212,175,55,.35); transform: translateY(-50%) scale(1.1); }
.arrow-left  { left: 4px;  animation: swipeHintLeft  2.4s ease-in-out 1.5s 3; }
.arrow-right { right: 4px; animation: swipeHintRight 2.4s ease-in-out 1.5s 3; }

/* Démarre après 1.5s, se répète 3 fois puis s'arrête */
@keyframes swipeHintLeft {
  0%          { transform: translateY(-50%) translateX(0)    scale(1);    opacity: 1; }
  20%         { transform: translateY(-50%) translateX(-10px) scale(1.15); opacity: 1;
                background: rgba(212,175,55,.5); box-shadow: 0 0 18px rgba(212,175,55,.5); }
  40%         { transform: translateY(-50%) translateX(0)    scale(1);    opacity: 1; }
  60%         { transform: translateY(-50%) translateX(-6px)  scale(1.08); opacity: .9; }
  80%,100%    { transform: translateY(-50%) translateX(0)    scale(1);    opacity: 1; }
}
@keyframes swipeHintRight {
  0%          { transform: translateY(-50%) translateX(0)    scale(1);    opacity: 1; }
  20%         { transform: translateY(-50%) translateX(10px)  scale(1.15); opacity: 1;
                background: rgba(212,175,55,.5); box-shadow: 0 0 18px rgba(212,175,55,.5); }
  40%         { transform: translateY(-50%) translateX(0)    scale(1);    opacity: 1; }
  60%         { transform: translateY(-50%) translateX(6px)   scale(1.08); opacity: .9; }
  80%,100%    { transform: translateY(-50%) translateX(0)    scale(1);    opacity: 1; }
}
/* ── POINTS DE NAVIGATION ── */
.dots {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; margin-top: 16px; padding-bottom: 4px;
}
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,.2); border: none; cursor: pointer;
  transition: all .3s; padding: 0;
}
.dot-actif {
  background: #d4af37;
  width: 22px; border-radius: 99px;   /* s'étire pour indiquer la position */
  box-shadow: 0 0 8px rgba(212,175,55,.5);
}
.dot:hover:not(.dot-actif) { background: rgba(255,255,255,.4); }

/* ── Transitions entrée/sortie carte ── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all .35s cubic-bezier(.22,1,.36,1);
}
.slide-left-enter-from  { opacity: 0; transform: translateX(60px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-60px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-60px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(60px); }

/* ══ Carte vendeur ════════════════════════════════════════════ */
.vendor-card {
  width: 280px; flex-shrink: 0; border-radius: 18px; overflow: hidden;
  position: relative; padding: 16px;
  border: 1px solid rgba(212,175,55,.2);
  box-shadow: 0 8px 32px rgba(0,0,0,.5);
  /* Transition douce au hover */
  transition: transform .3s, box-shadow .3s;
}
.vendor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 48px rgba(0,0,0,.6), 0 0 24px rgba(212,175,55,.12);
}

/* Overlay foncé sur la photo pour lisibilité du texte */
.card-overlay {
  position: absolute; inset: 0; border-radius: 18px;
  background: linear-gradient(
    160deg,
    rgba(2,14,35,0.82) 0%,
    rgba(4,20,50,0.75) 50%,
    rgba(2,14,35,0.88) 100%
  );
  pointer-events: none; z-index: 0;
}

/* Vagues décoratives */
.card-wave {
  position: absolute; left: -10%; width: 120%; height: 1px;
  border-radius: 50%; opacity: .08;
  background: linear-gradient(90deg, transparent, #0dcaf0, transparent);
  pointer-events: none; z-index: 1;
  animation: wv 8s ease-in-out infinite;
}
.w1 { top: 55%; }
.w2 { top: 75%; animation-delay: 3s; animation-duration: 11s; opacity: .05; }
@keyframes wv { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(3)} }

/* Tout le contenu au-dessus de l'overlay */
.vendor-head, .produits-liste, .yt-section, .btn-wa { position: relative; z-index: 2; }

/* ── Header vendeur ── */
.vendor-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.vendor-av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 900; font-size: .9rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 12px rgba(212,175,55,.4);
}
.vendor-info  { flex: 1; min-width: 0; }
.vendor-nom   { color: white; font-weight: 800; font-size: .88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vendor-ville { color: rgba(255,255,255,.4); font-size: .7rem; }

.badge-promo {
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-size: .6rem; font-weight: 900;
  padding: 3px 7px; border-radius: 99px; white-space: nowrap;
  animation: glow 2s ease-in-out infinite;
}
@keyframes glow {
  0%,100% { box-shadow: 0 0 6px rgba(212,175,55,.3); }
  50%     { box-shadow: 0 0 14px rgba(212,175,55,.7); }
}

/* ── Liste produits ── */
.produits-liste {
  background: rgba(0,0,0,.3); border-radius: 10px;
  border: 1px solid rgba(255,255,255,.06);
  margin-bottom: 10px; overflow: hidden;
}
.produit-ligne {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,.05);
}
.produit-ligne:last-child { border-bottom: none; }
.produit-ligne:hover { background: rgba(255,255,255,.04); }

.produit-info  { display: flex; align-items: center; gap: 7px; }
.produit-emoji { font-size: 1rem; }
.produit-nom   { color: white; font-size: .8rem; font-weight: 600; }
.produit-cat   { color: rgba(255,255,255,.3); font-size: .65rem; }

.produit-prix-wrap { text-align: right; }
.produit-prix { color: #f5d57a; font-weight: 900; font-size: .95rem; display: block; }
.produit-unit { color: rgba(255,255,255,.3); font-size: .62rem; }

/* ══ YouTube ═══════════════════════════════════════════════════ */
.yt-section  { margin-bottom: 10px; }
.yt-label    { display: block;text-align: center; color: rgba(168, 212, 8, 0.25); font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 5px; }
.yt-btns     { display: flex; gap: 6px; }

.yt-btn {
  display: flex; align-items: center; gap: 6px; flex: 1;
  padding: 6px 10px; border-radius: 10px; font-size: .68rem; font-weight: 700;
  text-decoration: none; transition: all .2s; border: 1px solid transparent;
  white-space: nowrap;
}
/* Image PNG dans le bouton */
.yt-img {
  width: 22px; height: 22px; object-fit: contain;
  border-radius: 4px; flex-shrink: 0;
}
/* Marocaine */
.yt-maroc {
  background: rgba(212,120,30,.12); border-color: rgba(212,120,30,.25); color: #f5a442;
}
.yt-maroc:hover { background: rgba(212,120,30,.22); transform: translateY(-1px); }
/* Méditerranéenne */
.yt-med {
  background: rgba(13,202,240,.08); border-color: rgba(13,202,240,.18); color: #0dcaf0;
}
.yt-med:hover { background: rgba(13,202,240,.15); transform: translateY(-1px); }

/* ══ WhatsApp ══════════════════════════════════════════════════ */
.btn-wa {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 9px;
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: white; font-weight: 700; font-size: .82rem;
  border-radius: 10px; text-decoration: none; transition: all .2s;
  box-shadow: 0 4px 12px rgba(37,211,102,.2);
}
.btn-wa:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,211,102,.35); }

/* ══ Skeleton ══════════════════════════════════════════════════ */
.skeleton-card { width: 280px; flex-shrink: 0; border-radius: 18px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); }
.skeleton-bg   { height: 60px; background: rgba(255,255,255,.06); }

/* ══ Vide ══════════════════════════════════════════════════════ */
.promo-vide {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 32px; color: rgba(255,255,255,.25);
}
</style>
