<!-- =============================================================
  components/admin/FbPostAdmin.vue
  Panneau admin — Post Facebook manuel des promos
  
  USAGE dans AdminDashboardView.vue :
    import FbPostAdmin from '../components/admin/FbPostAdmin.vue'
    <FbPostAdmin />
============================================================= -->
<template>
  <div class="fba">

    <!-- Header -->
    <div class="fba-header">
      <div>
        <h2 class="fba-titre">📘 Facebook — Post Promos</h2>
        <p class="fba-sous">Poster les promotions du jour sur la page SamakMarket</p>
      </div>
      <!-- Statut connexion FB -->
      <div :class="['fba-status', fbStatus.ok ? 'status-ok' : 'status-err']">
        <span class="status-dot"></span>
        {{ fbStatus.ok ? fbStatus.page_name : 'Token invalide' }}
      </div>
    </div>

    <!-- Stats FB -->
    <div v-if="fbStatus.ok" class="fba-stats">
      <div class="fba-stat">
        <span class="fba-stat-n">{{ fbStatus.fans || 0 }}</span>
        <span class="fba-stat-l">Abonnés</span>
      </div>
      <div class="fba-stat">
        <span class="fba-stat-n">{{ promos.length }}</span>
        <span class="fba-stat-l">Promos actives</span>
      </div>
      <div class="fba-stat">
        <span class="fba-stat-n">{{ dernierPost || '—' }}</span>
        <span class="fba-stat-l">Dernier post</span>
      </div>
    </div>

    <!-- Liste promos -->
    <div class="fba-section-titre">Produits en promotion</div>

    <div v-if="chargement" class="fba-loading">⟳ Chargement...</div>

    <div v-else-if="promos.length === 0" class="fba-vide">
      Aucun produit en promo actuellement
    </div>

    <div v-else class="fba-liste">
      <div v-for="p in promos" :key="p.id" class="fba-item">
        <div class="fba-item-info">
          <div class="fba-item-nom">🔥 {{ p.name }}</div>
          <div class="fba-item-details">
            {{ p.price }} MAD / {{ p.unit }} · {{ p.city || '—' }}
          </div>
        </div>
        <!-- Bouton poster ce produit -->
        <button
          @click="posterProduit(p)"
          :disabled="enCours[p.id]"
          :class="['btn-poster', succes[p.id] && 'btn-ok']"
        >
          <span v-if="enCours[p.id]" class="spin">⟳</span>
          <span v-else-if="succes[p.id]">✅ Posté</span>
          <span v-else>📘 Poster</span>
        </button>
      </div>
    </div>

    <!-- Bouton poster TOUS les promos -->
    <div class="fba-footer">
      <button
        @click="posterTousLesPromos"
        :disabled="enCoursGlobal || promos.length === 0"
        class="btn-poster-tout"
      >
        <span v-if="enCoursGlobal" class="spin">⟳</span>
        <span v-else>📘 Poster toutes les promos maintenant</span>
      </button>
      <p class="fba-cron-info">
        ⏰ Posts automatiques planifiés à <strong>08:00</strong> et <strong>18:00</strong> (Casablanca)
      </p>
    </div>

    <!-- Toast -->
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

const promos       = ref([])
const chargement   = ref(true)
const enCours      = ref({})
const succes       = ref({})
const enCoursGlobal = ref(false)
const dernierPost  = ref(null)
const fbStatus     = ref({ ok: false, page_name: '', fans: 0 })
const toast        = ref({ visible: false, message: '', type: 'ok' })

const afficherToast = (message, type = 'ok') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 4000)
}

const formatHeure = () => {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Poster un seul produit
const posterProduit = async (produit) => {
  enCours.value[produit.id] = true
  try {
    const { data } = await api.post(`/facebook/post-produit/${produit.id}`)
    succes.value[produit.id] = true
    dernierPost.value = formatHeure()
    afficherToast(`✅ "${produit.name}" posté sur Facebook !`, 'ok')
    setTimeout(() => { delete succes.value[produit.id] }, 8000)
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur Facebook'}`, 'err')
  } finally {
    delete enCours.value[produit.id]
  }
}

// Poster toutes les promos (appel le scheduler manuellement)
const posterTousLesPromos = async () => {
  enCoursGlobal.value = true
  try {
    const { data } = await api.post('/facebook/post-toutes-promos')
    dernierPost.value = formatHeure()
    afficherToast(`✅ ${data.message}`, 'ok')
    // Marque tous comme postés
    promos.value.forEach(p => { succes.value[p.id] = true })
    setTimeout(() => { succes.value = {} }, 10000)
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  } finally {
    enCoursGlobal.value = false
  }
}

onMounted(async () => {
  // Vérifie statut FB
  try {
    const { data } = await api.get('/facebook/status')
    fbStatus.value = data
  } catch { fbStatus.value = { ok: false } }

  // Charge les promos
  try {
    const { data } = await api.get('/admin/produits')
    promos.value = data.filter(p => p.is_promo)
  } catch (e) {
    afficherToast('Erreur chargement promos', 'err')
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
.fba {
  background: #040f20; border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px; overflow: hidden; position: relative;
}
.fba-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.02); flex-wrap: wrap; gap: 10px;
}
.fba-titre { color: white; font-size: 1rem; font-weight: 800; }
.fba-sous  { color: rgba(255,255,255,.3); font-size: .75rem; margin-top: 3px; }

.fba-status {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 99px; font-size: .75rem; font-weight: 700;
}
.status-ok  { background: rgba(52,211,153,.1); color: #34d399; border: 1px solid rgba(52,211,153,.2); }
.status-err { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.2); }
.status-dot {
  width: 7px; height: 7px; border-radius: 50%; background: currentColor;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

.fba-stats {
  display: flex; gap: 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
.fba-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 14px; border-right: 1px solid rgba(255,255,255,.05);
}
.fba-stat:last-child { border-right: none; }
.fba-stat-n { color: #f5d57a; font-size: 1.2rem; font-weight: 900; }
.fba-stat-l { color: rgba(255,255,255,.25); font-size: .68rem; margin-top: 2px; }

.fba-section-titre {
  padding: 12px 24px 8px;
  color: rgba(255,255,255,.25); font-size: .7rem;
  text-transform: uppercase; letter-spacing: .08em;
}
.fba-loading, .fba-vide {
  padding: 32px; text-align: center;
  color: rgba(255,255,255,.2); font-size: .85rem;
}

.fba-liste { max-height: 340px; overflow-y: auto; }
.fba-liste::-webkit-scrollbar { width: 3px; }
.fba-liste::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); }

.fba-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,.04);
  transition: background .15s;
}
.fba-item:hover { background: rgba(255,255,255,.02); }
.fba-item-nom     { color: white; font-size: .85rem; font-weight: 700; }
.fba-item-details { color: rgba(255,255,255,.3); font-size: .72rem; margin-top: 2px; }

.btn-poster {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 8px; font-size: .78rem; font-weight: 700;
  background: rgba(24,119,242,.1); color: #5b9bf8;
  border: 1px solid rgba(24,119,242,.25); cursor: pointer; transition: all .2s;
  white-space: nowrap;
}
.btn-poster:hover:not(:disabled) { background: rgba(24,119,242,.2); border-color: rgba(24,119,242,.4); }
.btn-poster:disabled { opacity: .5; cursor: not-allowed; }
.btn-poster.btn-ok { background: rgba(52,211,153,.1); color:#34d399; border-color:rgba(52,211,153,.2); }

.fba-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.02);
  display: flex; flex-direction: column; gap: 10px;
}
.btn-poster-tout {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #1877F2, #1666d4);
  color: white; border: none; border-radius: 10px;
  font-weight: 800; font-size: .88rem; cursor: pointer;
  transition: all .2s; box-shadow: 0 4px 16px rgba(24,119,242,.3);
}
.btn-poster-tout:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(24,119,242,.45); }
.btn-poster-tout:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.fba-cron-info { color: rgba(255,255,255,.2); font-size: .72rem; text-align: center; margin: 0; }

.spin { animation: sp .8s linear infinite; display: inline-block; }
@keyframes sp { to { transform: rotate(360deg); } }

.toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  padding: 13px 22px; border-radius: 12px; font-size: .85rem; font-weight: 700;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.toast-ok  { background:#052e16; border:1px solid #166534; color:#4ade80; }
.toast-err { background:#1c0a0a; border:1px solid #991b1b; color:#f87171; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
