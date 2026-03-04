<!-- ProductPromo.vue — fond image + badge animé -->
<template>
  <!--
    L'image de fond est mise via :style directement sur la balise
    Car dans <style scoped>, url() avec Vite ne résout pas /public/
    correctement. :style inline = toujours résolu depuis la racine.
  -->
  <section
    class="promo-section py-8 px-4"
    :style="{
      backgroundImage: `linear-gradient(135deg, rgba(2,14,35,0.87) 0%, rgba(10,31,61,0.83) 100%), url('/images/bkg_promo.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }"
  >

    <!-- Titre -->
    <div class="max-w-6xl mx-auto mb-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-400/30"></div>
      <h2 class="text-white font-black text-xl tracking-widest uppercase flex items-center gap-2">
        ✦ Promos Spéciales <span class="text-yellow-400">du Jour</span> ✦
      </h2>
      <div class="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-400/30"></div>
    </div>

    <!-- Skeleton chargement -->
    <div v-if="chargement" class="flex gap-5 max-w-6xl mx-auto overflow-hidden">
      <div v-for="n in 3" :key="n"
        class="carte-vendeur animate-pulse flex-shrink-0"
        style="background:rgba(255,255,255,0.05);">
        <div class="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div v-for="i in 3" :key="i" class="h-10 bg-white/10 rounded mb-2"></div>
        <div class="h-10 bg-white/10 rounded mt-4"></div>
      </div>
    </div>

    <!-- Aucune promo -->
    <div v-else-if="!vendeurs.length" class="text-center text-white/40 py-8">
      Aucune promotion active —
      <code class="text-yellow-400/60 text-xs">UPDATE products SET is_promo=1 WHERE id=X</code>
    </div>

    <!-- Slider vendeurs -->
    <div v-else class="overflow-hidden max-w-6xl mx-auto">
      <div class="slider-track">
        <div v-for="(v, idx) in vendeursDoubles" :key="idx" class="carte-vendeur">

          <!-- En-tête vendeur -->
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-yellow-400/20">
            <div class="avatar-gold">{{ v.nom.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="text-white font-bold text-sm leading-tight">{{ v.nom }}</div>
              <div class="text-yellow-400/70 text-xs">📍 {{ v.ville }}</div>
            </div>
            <!-- Badge 🔥 PROMO — clignote avec élégance -->
            <div class="ml-auto badge-promo">🔥 PROMO</div>
          </div>

          <!-- 3 lignes produits -->
          <div class="space-y-2">
            <div v-for="p in v.produits" :key="p.id" class="ligne-produit">
              <div class="flex-1 min-w-0">
                <div class="text-white text-sm font-semibold truncate">{{ p.name }}</div>
                <div class="text-white/40 text-xs">{{ p.category }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-yellow-400 font-black text-base leading-tight">
                  {{ Number(p.price).toLocaleString('fr-FR') }}
                </div>
                <div class="text-white/40 text-xs">MAD/{{ p.unit }}</div>
              </div>
            </div>
          </div>

          <!-- Bouton WhatsApp -->
          <a :href="waLien(v)" target="_blank" rel="noopener noreferrer" class="wa-btn mt-4">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.852L.057 23.25a.75.75 0 0 0 .916.948l5.604-1.47A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.493-5.178-1.354l-.37-.214-3.827 1.004 1.021-3.73-.228-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Contacter {{ v.nom.split(' ')[0] }}
          </a>

        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const produits   = ref([])
const chargement = ref(true)

const vendeurs = computed(() => {
  const map = {}
  for (const p of produits.value) {
    const sid = p.seller?.id
    if (!sid) continue
    if (!map[sid]) map[sid] = {
      id: sid,
      nom: p.seller.name || 'Vendeur',
      ville: p.seller.city || p.city || 'Maroc',
      whatsapp: p.seller.whatsapp || p.seller.phone || '',
      produits: [],
    }
    if (map[sid].produits.length < 3) map[sid].produits.push(p)
  }
  return Object.values(map)
})

const vendeursDoubles = computed(() => [...vendeurs.value, ...vendeurs.value])

const waLien = (v) => {
  const num  = v.whatsapp.replace(/[\s\-\+\(\)]/g, '')
  const liste = v.produits.map(p => `• ${p.name} ${p.price} MAD/${p.unit}`).join('\n')
  const msg  = encodeURIComponent(`Bonjour ${v.nom} ! Vos promos SamakMarket :\n${liste}\nDisponible ?`)
  return `https://wa.me/${num}?text=${msg}`
}

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
/* NE PAS mettre url() ici avec scoped + Vite → utiliser :style inline */

.promo-section {
  position: relative;
}

/* Carte vendeur */
.carte-vendeur {
  min-width: 300px;
  flex-shrink: 0;
  background: linear-gradient(145deg,
    rgba(255,255,255,0.07) 0%,
    rgba(212,175,55,0.08) 100%
  );
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 0 30px rgba(212,175,55,0.08),
    inset 0 1px 0 rgba(255,255,255,0.06);
  /* Glassmorphism léger */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Avatar or */
.avatar-gold {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23;
  font-weight: 900;
  font-size: .9rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(212,175,55,0.4);
}

/* ── Badge PROMO — clignotement élégant ── */
.badge-promo {
  background: linear-gradient(135deg, #d4af37, #b8960c);
  color: #020e23;
  font-size: .65rem;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 99px;
  letter-spacing: .04em;
  /*
    Deux animations combinées :
    1. glow-pulse = halo doré qui respire (box-shadow)
    2. shimmer    = légère variation de luminosité
    Durées différentes → effet organique, pas mécanique
  */
  animation: glow-pulse 2s ease-in-out infinite,
             shimmer     3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 6px rgba(212,175,55,0.4),
                0 0 12px rgba(212,175,55,0.2);
  }
  50% {
    box-shadow: 0 0 14px rgba(212,175,55,0.9),
                0 0 28px rgba(212,175,55,0.5),
                0 0 40px rgba(212,175,55,0.2);
  }
}

@keyframes shimmer {
  0%, 100% { opacity: 1;    filter: brightness(1); }
  45%       { opacity: 0.85; filter: brightness(0.9); }
  50%       { opacity: 1;    filter: brightness(1.2); }
  55%       { opacity: 0.9;  filter: brightness(1); }
}

/* Ligne produit */
.ligne-produit {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  transition: background .2s;
}
.ligne-produit:hover {
  background: rgba(212,175,55,0.08);
  border-color: rgba(212,175,55,0.2);
}

/* Bouton WhatsApp */
.wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: white;
  font-weight: 700;
  font-size: .85rem;
  padding: 10px 16px;
  border-radius: 12px;
  text-decoration: none;
  transition: opacity .2s, transform .15s;
  box-shadow: 0 4px 16px rgba(37,211,102,0.25);
}
.wa-btn:hover { opacity: .9; transform: translateY(-1px); }

/* Slider */
.slider-track {
  display: flex;
  gap: 20px;
  width: max-content;
  animation: glide 30s linear infinite;
}
.slider-track:hover { animation-play-state: paused; }

@keyframes glide {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>