<!-- =============================================================
  components/admin/FlashAdmin.vue
  Panneau admin — Créer/gérer les offres flash

  USAGE dans AdminDashboardView.vue :
    import FlashAdmin from '../components/admin/FlashAdmin.vue'
    <FlashAdmin />
============================================================= -->
<template>
  <div class="fla">

    <!-- Header -->
    <div class="fla-header">
      <div>
        <h2 class="fla-titre">⚡ Offres Flash</h2>
        <p class="fla-sous">Créer des offres à durée limitée avec prix spécial</p>
      </div>
      <div class="fla-badge">
        {{ offresActives.length }} active(s)
      </div>
    </div>

    <!-- Formulaire création -->
    <div class="fla-form">
      <div class="fla-form-titre">➕ Nouvelle offre flash</div>

      <div class="fla-row">
        <!-- Sélection produit -->
        <div class="fla-field">
          <label>Produit</label>
          <select v-model="form.produit_id" class="fla-select">
            <option value="">— Choisir un produit —</option>
            <option v-for="p in produits" :key="p.id" :value="p.id">
              {{ p.name }} ({{ p.price }} MAD) — {{ p.city }}
            </option>
          </select>
        </div>

        <!-- Prix flash -->
        <div class="fla-field">
          <label>Prix flash (MAD)</label>
          <input
            v-model="form.flash_price"
            type="number" min="1" step="0.5"
            placeholder="ex: 18.00"
            class="fla-input"
          />
        </div>

        <!-- Durée -->
        <div class="fla-field">
          <label>Durée</label>
          <select v-model="form.duree_minutes" class="fla-select">
            <option :value="30">30 minutes</option>
            <option :value="60">1 heure</option>
            <option :value="120">2 heures</option>
            <option :value="180">3 heures</option>
            <option :value="360">6 heures</option>
            <option :value="720">12 heures</option>
            <option :value="1440">24 heures</option>
          </select>
        </div>
      </div>

      <!-- Aperçu réduction -->
      <div v-if="form.produit_id && form.flash_price && produitSelectionne" class="fla-apercu">
        <span class="apercu-label">Réduction :</span>
        <span class="apercu-valeur">
          {{ formaterPrix(produitSelectionne.price) }} →
          <strong style="color:#fbbf24">{{ formaterPrix(form.flash_price) }} MAD</strong>
          <span class="apercu-pct">-{{ pourcentageReduction }}%</span>
        </span>
      </div>

      <button
        @click="creerFlash"
        :disabled="!form.produit_id || !form.flash_price || enCours"
        class="btn-creer"
      >
        <span v-if="enCours" class="spin">⟳</span>
        <span v-else>⚡ Lancer l'offre flash</span>
      </button>
    </div>

    <!-- Offres actives -->
    <div class="fla-section-titre">Offres en cours</div>

    <div v-if="offresActives.length === 0" class="fla-vide">
      Aucune offre flash active
    </div>

    <div v-else class="fla-liste">
      <div v-for="o in offresActives" :key="o.id" class="fla-item">
        <div class="fla-item-info">
          <div class="fla-item-nom">⚡ {{ o.name }}</div>
          <div class="fla-item-prix">
            <span class="prix-barre">{{ formaterPrix(o.price) }}</span>
            → <span class="prix-flash">{{ formaterPrix(o.flash_price) }} MAD</span>
            / {{ o.unit }}
          </div>
          <div class="fla-item-timer">
            ⏳ Expire : {{ formaterDate(o.flash_end) }}
          </div>
        </div>
        <button @click="annulerFlash(o.id)" class="btn-annuler">
          Annuler
        </button>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const produits      = ref([])
const offresActives = ref([])
const enCours       = ref(false)
const toast         = ref({ visible: false, message: '', type: 'ok' })

const form = ref({
  produit_id:    '',
  flash_price:   '',
  duree_minutes: 120,
})

const afficherToast = (message, type = 'ok') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 4000)
}

const formaterPrix = (p) => Number(p).toLocaleString('fr-FR')
const formaterDate = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const produitSelectionne = computed(() =>
  produits.value.find(p => p.id === form.value.produit_id)
)

const pourcentageReduction = computed(() => {
  if (!produitSelectionne.value || !form.value.flash_price) return 0
  const reduction = ((produitSelectionne.value.price - form.value.flash_price) / produitSelectionne.value.price) * 100
  return Math.round(Math.max(0, reduction))
})

const creerFlash = async () => {
  enCours.value = true
  try {
    const { data } = await api.post(`/flash/${form.value.produit_id}`, {
      flash_price:    parseFloat(form.value.flash_price),
      duree_minutes:  form.value.duree_minutes,
    })
    afficherToast(`✅ ${data.message}`, 'ok')
    form.value = { produit_id: '', flash_price: '', duree_minutes: 120 }
    await chargerOffresActives()
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  } finally {
    enCours.value = false
  }
}

const annulerFlash = async (id) => {
  try {
    await api.delete(`/flash/${id}`)
    afficherToast('✅ Offre flash annulée', 'ok')
    await chargerOffresActives()
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  }
}

const chargerOffresActives = async () => {
  try {
    const { data } = await api.get('/flash/active')
    offresActives.value = data
  } catch {}
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/produits')
    produits.value = data
  } catch {}
  await chargerOffresActives()
})
</script>

<style scoped>
.fla { background:#040f20; border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; position:relative; }

.fla-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px; border-bottom:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.02);
}
.fla-titre { color:white; font-size:1rem; font-weight:800; }
.fla-sous  { color:rgba(255,255,255,.3); font-size:.75rem; margin-top:3px; }
.fla-badge {
  background:rgba(231,76,60,.15); border:1px solid rgba(231,76,60,.3);
  color:#f87171; font-size:.75rem; font-weight:700;
  padding:4px 12px; border-radius:99px;
}

/* Formulaire */
.fla-form { padding:20px 24px; border-bottom:1px solid rgba(255,255,255,.07); }
.fla-form-titre { color:rgba(255,255,255,.4); font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
.fla-row { display:flex; gap:12px; flex-wrap:wrap; }
.fla-field { display:flex; flex-direction:column; gap:5px; flex:1; min-width:140px; }
.fla-field label { color:rgba(255,255,255,.3); font-size:.7rem; text-transform:uppercase; letter-spacing:.06em; }
.fla-input, .fla-select {
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
  border-radius:8px; padding:9px 12px; color:white; font-size:.82rem; outline:none;
  transition:border-color .2s;
}
.fla-input:focus, .fla-select:focus { border-color:rgba(231,76,60,.4); }
.fla-select option { background:#0d1f3c; color:white; }

.fla-apercu {
  display:flex; align-items:center; gap:8px; margin-top:12px;
  padding:8px 14px; background:rgba(251,191,36,.07);
  border:1px solid rgba(251,191,36,.15); border-radius:8px;
}
.apercu-label { color:rgba(255,255,255,.3); font-size:.75rem; }
.apercu-valeur { color:white; font-size:.82rem; }
.apercu-pct {
  background:rgba(251,191,36,.15); color:#fbbf24;
  font-size:.72rem; font-weight:700; padding:2px 7px; border-radius:4px; margin-left:6px;
}

.btn-creer {
  margin-top:14px; width:100%; padding:12px;
  background:linear-gradient(135deg,#c0392b,#e74c3c);
  color:white; border:none; border-radius:10px;
  font-weight:800; font-size:.88rem; cursor:pointer;
  transition:all .2s; box-shadow:0 4px 16px rgba(231,76,60,.3);
}
.btn-creer:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
.btn-creer:disabled { opacity:.5; cursor:not-allowed; transform:none; }

/* Liste */
.fla-section-titre { padding:10px 24px 6px; color:rgba(255,255,255,.2); font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; }
.fla-vide { padding:24px; text-align:center; color:rgba(255,255,255,.2); font-size:.85rem; }
.fla-liste { max-height:280px; overflow-y:auto; }
.fla-liste::-webkit-scrollbar { width:3px; }
.fla-liste::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); }

.fla-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 24px; border-bottom:1px solid rgba(255,255,255,.04);
  gap:12px;
}
.fla-item-nom   { color:white; font-size:.85rem; font-weight:700; }
.fla-item-prix  { color:rgba(255,255,255,.4); font-size:.75rem; margin-top:3px; }
.fla-item-timer { color:rgba(255,255,255,.25); font-size:.7rem; margin-top:2px; }
.prix-barre     { text-decoration:line-through; color:rgba(255,255,255,.3); }
.prix-flash     { color:#fbbf24; font-weight:700; }

.btn-annuler {
  padding:6px 14px; border-radius:8px; font-size:.75rem; font-weight:700;
  background:rgba(231,76,60,.1); color:#f87171;
  border:1px solid rgba(231,76,60,.25); cursor:pointer; transition:all .2s;
  white-space:nowrap; flex-shrink:0;
}
.btn-annuler:hover { background:rgba(231,76,60,.2); }

.spin { animation:sp .8s linear infinite; display:inline-block; }
@keyframes sp { to { transform:rotate(360deg); } }

.toast { position:fixed; bottom:28px; right:28px; z-index:9999; padding:13px 22px; border-radius:12px; font-size:.85rem; font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,.4); }
.toast-ok  { background:#052e16; border:1px solid #166534; color:#4ade80; }
.toast-err { background:#1c0a0a; border:1px solid #991b1b; color:#f87171; }
.toast-enter-active, .toast-leave-active { transition:all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
