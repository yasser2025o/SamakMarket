<!-- =============================================================
  components/admin/SocialPostAdmin.vue
  Panneau admin — Post Facebook + Instagram des promos
  
  USAGE dans AdminDashboardView.vue :
    import SocialPostAdmin from '../components/admin/SocialPostAdmin.vue'
    <SocialPostAdmin />
============================================================= -->
<template>
  <div class="spa">

    <!-- ── Header ── -->
    <div class="spa-header">
      <div>
        <h2 class="spa-titre">📱 Réseaux Sociaux — Post Promos</h2>
        <p class="spa-sous">Poster les promotions sur Facebook et Instagram</p>
      </div>
      <!-- Statuts connexions -->
      <div class="spa-statuts">
        <div :class="['spa-statut', igStatus.ok ? 'ok' : 'err']">
          <span class="s-dot"></span>
          <span class="s-ico">📸</span>
          {{ igStatus.ok ? igStatus.username || 'Instagram' : 'Token invalide' }}
        </div>
        <div :class="['spa-statut', fbStatus.ok ? 'ok' : 'err']">
          <span class="s-dot"></span>
          <span class="s-ico">📘</span>
          {{ fbStatus.ok ? fbStatus.page_name || 'Facebook' : 'Token invalide' }}
        </div>
      </div>
    </div>

    <!-- ── Stats ── -->
    <div class="spa-stats">
      <div class="spa-stat">
        <span class="spa-stat-n">{{ igStatus.followers_count || '—' }}</span>
        <span class="spa-stat-l">📸 Abonnés IG</span>
      </div>
      <div class="spa-stat">
        <span class="spa-stat-n">{{ igStatus.media_count || '—' }}</span>
        <span class="spa-stat-l">📸 Posts IG</span>
      </div>
      <div class="spa-stat">
        <span class="spa-stat-n">{{ promos.length }}</span>
        <span class="spa-stat-l">🔥 Promos actives</span>
      </div>
      <div class="spa-stat">
        <span class="spa-stat-n">{{ dernierPost || '—' }}</span>
        <span class="spa-stat-l">⏱ Dernier post</span>
      </div>
    </div>

    <!-- ── Tabs FB / IG ── -->
    <div class="spa-tabs">
      <button :class="['spa-tab', onglet === 'ig' && 'tab-on']" @click="onglet = 'ig'">
        📸 Instagram
      </button>
      <button :class="['spa-tab', onglet === 'fb' && 'tab-on']" @click="onglet = 'fb'">
        📘 Facebook
      </button>
    </div>

    <!-- ── Liste promos ── -->
    <div class="spa-section-titre">Produits en promotion</div>

    <div v-if="chargement" class="spa-loading">
      <span class="spin">⟳</span> Chargement...
    </div>

    <div v-else-if="promos.length === 0" class="spa-vide">
      Aucun produit en promo actuellement
    </div>

    <div v-else class="spa-liste">
      <div v-for="p in promos" :key="p.id" class="spa-item">

        <!-- Info produit -->
        <div class="spa-item-left">
          <div class="spa-item-av">{{ p.name.charAt(0) }}</div>
          <div>
            <div class="spa-item-nom">🔥 {{ p.name }}</div>
            <div class="spa-item-det">{{ p.price }} MAD / {{ p.unit }} · {{ p.city || '—' }}</div>
          </div>
        </div>

        <!-- Boutons poster -->
        <div class="spa-item-btns">
          <!-- Instagram -->
          <button
            v-if="onglet === 'ig'"
            @click="posterProduit(p, 'ig')"
            :disabled="enCours[`ig_${p.id}`]"
            :class="['btn-post', 'btn-ig', succes[`ig_${p.id}`] && 'btn-ok']"
          >
            <span v-if="enCours[`ig_${p.id}`]" class="spin">⟳</span>
            <span v-else-if="succes[`ig_${p.id}`]">✅</span>
            <span v-else>📸 Poster</span>
          </button>

          <!-- Facebook -->
          <button
            v-if="onglet === 'fb'"
            @click="posterProduit(p, 'fb')"
            :disabled="enCours[`fb_${p.id}`]"
            :class="['btn-post', 'btn-fb', succes[`fb_${p.id}`] && 'btn-ok']"
          >
            <span v-if="enCours[`fb_${p.id}`]" class="spin">⟳</span>
            <span v-else-if="succes[`fb_${p.id}`]">✅</span>
            <span v-else>📘 Poster</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ── Footer — boutons tout poster ── -->
    <div class="spa-footer">

      <!-- Poster tout sur IG -->
      <button
        v-if="onglet === 'ig'"
        @click="posterTout('ig')"
        :disabled="enCoursGlobal || promos.length === 0 || !igStatus.ok"
        class="btn-tout btn-tout-ig"
      >
        <span v-if="enCoursGlobal" class="spin">⟳</span>
        <span v-else>📸 Poster toutes les promos sur Instagram</span>
      </button>

      <!-- Poster tout sur FB -->
      <button
        v-if="onglet === 'fb'"
        @click="posterTout('fb')"
        :disabled="enCoursGlobal || promos.length === 0 || !fbStatus.ok"
        class="btn-tout btn-tout-fb"
      >
        <span v-if="enCoursGlobal" class="spin">⟳</span>
        <span v-else>📘 Poster toutes les promos sur Facebook</span>
      </button>

      <p class="spa-cron">
        ⏰ Posts automatiques planifiés à <strong>08:00</strong> et <strong>18:00</strong> · Maroc
      </p>
    </div>

    <!-- ── Toast ── -->
    <Transition name="toast">
      <div v-if="toast.visible" :class="['toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const onglet       = ref('ig')
const promos       = ref([])
const chargement   = ref(true)
const enCours      = ref({})
const succes       = ref({})
const enCoursGlobal = ref(false)
const dernierPost  = ref(null)
const igStatus     = ref({ ok: false })
const fbStatus     = ref({ ok: false })
const toast        = ref({ visible: false, message: '', type: 'ok' })

const afficherToast = (message, type = 'ok') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 4500)
}

// ── Poster un produit ────────────────────────────────────────
const posterProduit = async (produit, reseau) => {
  const key = `${reseau}_${produit.id}`
  enCours.value[key] = true
  try {
    const endpoint = reseau === 'ig'
      ? `/instagram/post-produit/${produit.id}`
      : `/facebook/post-produit/${produit.id}`
    const { data } = await api.post(endpoint)
    succes.value[key] = true
    dernierPost.value = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    afficherToast(`✅ "${produit.name}" posté sur ${reseau === 'ig' ? 'Instagram' : 'Facebook'} !`, 'ok')
    setTimeout(() => { delete succes.value[key] }, 8000)
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  } finally {
    delete enCours.value[key]
  }
}

// ── Poster toutes les promos ─────────────────────────────────
const posterTout = async (reseau) => {
  enCoursGlobal.value = true
  try {
    const endpoint = reseau === 'ig'
      ? '/instagram/post-toutes-promos'
      : '/facebook/post-toutes-promos'
    const { data } = await api.post(endpoint)
    dernierPost.value = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    afficherToast(`✅ ${data.message}`, 'ok')
    promos.value.forEach(p => { succes.value[`${reseau}_${p.id}`] = true })
    setTimeout(() => { succes.value = {} }, 10000)
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  } finally {
    enCoursGlobal.value = false
  }
}

onMounted(async () => {
  // Vérifie statuts
  try {
    const [ig, fb] = await Promise.allSettled([
      api.get('/instagram/status'),
      api.get('/facebook/status'),
    ])
    if (ig.status === 'fulfilled') igStatus.value = ig.value.data
    if (fb.status === 'fulfilled') fbStatus.value = fb.value.data
  } catch {}

  // Charge promos
  try {
    const { data } = await api.get('/admin/produits')
    promos.value = data.filter(p => p.is_promo)
  } catch {
    afficherToast('Erreur chargement promos', 'err')
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
.spa {
  background: #040f20; border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px; overflow: hidden; position: relative;
}

/* Header */
.spa-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.02); flex-wrap: wrap; gap: 12px;
}
.spa-titre { color: white; font-size: 1rem; font-weight: 800; }
.spa-sous  { color: rgba(255,255,255,.3); font-size: .75rem; margin-top: 3px; }

.spa-statuts { display: flex; gap: 8px; flex-wrap: wrap; }
.spa-statut {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 99px; font-size: .72rem; font-weight: 700;
}
.spa-statut.ok  { background: rgba(52,211,153,.1); color:#34d399; border:1px solid rgba(52,211,153,.2); }
.spa-statut.err { background: rgba(248,113,113,.1); color:#f87171; border:1px solid rgba(248,113,113,.2); }
.s-dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* Stats */
.spa-stats {
  display: flex; border-bottom: 1px solid rgba(255,255,255,.05);
}
.spa-stat {
  flex:1; display:flex; flex-direction:column; align-items:center;
  padding:12px 8px; border-right:1px solid rgba(255,255,255,.05);
}
.spa-stat:last-child { border-right:none; }
.spa-stat-n { color:#f5d57a; font-size:1.1rem; font-weight:900; }
.spa-stat-l { color:rgba(255,255,255,.2); font-size:.65rem; margin-top:2px; text-align:center; }

/* Tabs */
.spa-tabs {
  display: flex; border-bottom: 1px solid rgba(255,255,255,.07);
}
.spa-tab {
  flex:1; padding:12px; background:transparent;
  border:none; color:rgba(255,255,255,.3); font-size:.82rem; font-weight:700;
  cursor:pointer; transition:all .2s; border-bottom:2px solid transparent;
}
.spa-tab:hover { color:rgba(255,255,255,.6); }
.tab-on { color:white !important; border-bottom-color:#d4af37 !important; background:rgba(212,175,55,.04); }

/* Section titre */
.spa-section-titre {
  padding:10px 24px 6px; color:rgba(255,255,255,.2);
  font-size:.68rem; text-transform:uppercase; letter-spacing:.08em;
}

.spa-loading, .spa-vide {
  padding:32px; text-align:center; color:rgba(255,255,255,.2); font-size:.85rem;
  display:flex; align-items:center; justify-content:center; gap:8px;
}

/* Liste */
.spa-liste { max-height:320px; overflow-y:auto; }
.spa-liste::-webkit-scrollbar { width:3px; }
.spa-liste::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); }

.spa-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:11px 20px; border-bottom:1px solid rgba(255,255,255,.04);
  transition:background .15s; gap:12px;
}
.spa-item:hover { background:rgba(255,255,255,.02); }

.spa-item-left { display:flex; align-items:center; gap:10px; flex:1; min-width:0; }
.spa-item-av {
  width:32px; height:32px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#d4af37,#f5d57a);
  color:#020e23; font-weight:900; font-size:.82rem;
  display:flex; align-items:center; justify-content:center;
}
.spa-item-nom { color:white; font-size:.82rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.spa-item-det { color:rgba(255,255,255,.3); font-size:.7rem; }

.spa-item-btns { display:flex; gap:6px; flex-shrink:0; }

/* Boutons poster */
.btn-post {
  padding:6px 14px; border-radius:8px; font-size:.75rem; font-weight:700;
  cursor:pointer; transition:all .2s; white-space:nowrap; border:1px solid;
}
.btn-ig {
  background:rgba(131,58,180,.1); color:#c77dff;
  border-color:rgba(131,58,180,.25);
}
.btn-ig:hover:not(:disabled) { background:rgba(131,58,180,.2); border-color:rgba(131,58,180,.4); }
.btn-fb {
  background:rgba(24,119,242,.1); color:#5b9bf8;
  border-color:rgba(24,119,242,.25);
}
.btn-fb:hover:not(:disabled) { background:rgba(24,119,242,.2); border-color:rgba(24,119,242,.4); }
.btn-post.btn-ok { background:rgba(52,211,153,.1); color:#34d399; border-color:rgba(52,211,153,.2); }
.btn-post:disabled { opacity:.5; cursor:not-allowed; }

/* Footer */
.spa-footer {
  padding:16px 20px; border-top:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.02); display:flex; flex-direction:column; gap:10px;
}
.btn-tout {
  width:100%; padding:12px; border:none; border-radius:10px;
  font-weight:800; font-size:.88rem; cursor:pointer; transition:all .2s;
}
.btn-tout-ig {
  background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);
  color:white; box-shadow:0 4px 16px rgba(131,58,180,.3);
}
.btn-tout-fb {
  background:linear-gradient(135deg,#1877F2,#1666d4);
  color:white; box-shadow:0 4px 16px rgba(24,119,242,.3);
}
.btn-tout:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
.btn-tout:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.spa-cron { color:rgba(255,255,255,.15); font-size:.7rem; text-align:center; margin:0; }

.spin { animation:sp .8s linear infinite; display:inline-block; }
@keyframes sp { to { transform:rotate(360deg); } }

/* Toast */
.toast {
  position:fixed; bottom:28px; right:28px; z-index:9999;
  padding:13px 22px; border-radius:12px; font-size:.85rem; font-weight:700;
  box-shadow:0 8px 24px rgba(0,0,0,.4);
}
.toast-ok  { background:#052e16; border:1px solid #166534; color:#4ade80; }
.toast-err { background:#1c0a0a; border:1px solid #991b1b; color:#f87171; }
.toast-enter-active, .toast-leave-active { transition:all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
