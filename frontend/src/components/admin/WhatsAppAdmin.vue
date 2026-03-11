<!-- =============================================================
  components/admin/WhatsAppAdmin.vue
  Panneau admin — Envoi promos WhatsApp
============================================================= -->
<template>
  <div class="wpa">

    <!-- Header -->
    <div class="wpa-header">
      <div>
        <h2 class="wpa-titre">💬 WhatsApp — Envoi Promos</h2>
        <p class="wpa-sous">Envoie les promotions directement sur WhatsApp</p>
      </div>
      <div :class="['wpa-statut', statut.connecte ? 'ok' : 'err']">
        <span class="s-dot"></span>
        {{ statut.connecte ? `✅ ${statut.nom || 'Connecté'}` : '❌ Non connecté' }}
      </div>
    </div>

    <!-- QR Code si pas connecté -->
    <div v-if="!statut.connecte" class="wpa-qr">
      <div v-if="statut.qrImage" class="qr-wrap">
        <p class="qr-titre">📱 Scanne ce QR code avec WhatsApp</p>
        <img :src="statut.qrImage" alt="QR Code WhatsApp" class="qr-img" />
        <p class="qr-sous">WhatsApp → 3 points → Appareils liés → Lier un appareil</p>
        <button @click="chargerStatut" class="btn-refresh">🔄 Rafraîchir</button>
      </div>
      <div v-else class="qr-attente">
        <span class="spin">⟳</span>
        Génération du QR code...
        <button @click="chargerStatut" class="btn-refresh">🔄 Rafraîchir</button>
      </div>
    </div>

    <!-- Contenu si connecté -->
    <template v-else>

      <!-- Numéros destinataires -->
      <div class="wpa-section">
        <div class="wpa-section-titre">📞 Numéros destinataires</div>
        <div class="wpa-numeros">
          <div v-for="(num, i) in numeros" :key="i" class="wpa-num-item">
            <span class="num-flag">🇲🇦</span>
            <input
              v-model="numeros[i]"
              placeholder="212612345678"
              class="num-input"
            />
            <button @click="numeros.splice(i, 1)" class="btn-del">✕</button>
          </div>
          <button @click="numeros.push('')" class="btn-add-num">
            + Ajouter un numéro
          </button>
        </div>
        <p class="wpa-note">Format : 212612345678 (sans + ni espaces)</p>
      </div>

      <!-- Liste promos -->
      <div class="wpa-section-titre" style="padding:10px 20px 6px">
        🔥 Produits en promotion
      </div>

      <div v-if="chargement" class="wpa-loading">
        <span class="spin">⟳</span> Chargement...
      </div>

      <div v-else-if="promos.length === 0" class="wpa-vide">
        Aucun produit en promo
      </div>

      <div v-else class="wpa-liste">
        <div v-for="p in promos" :key="p.id" class="wpa-item">
          <div class="wpa-item-left">
            <div class="wpa-av">{{ p.name.charAt(0) }}</div>
            <div>
              <div class="wpa-nom">🔥 {{ p.name }}</div>
              <div class="wpa-det">{{ p.price }} MAD / {{ p.unit }} · {{ p.city || '—' }}</div>
            </div>
          </div>
          <button
            @click="envoyerProduit(p)"
            :disabled="enCours[p.id] || numeros.filter(n=>n).length === 0"
            :class="['btn-envoyer', succes[p.id] && 'btn-ok']"
          >
            <span v-if="enCours[p.id]" class="spin">⟳</span>
            <span v-else-if="succes[p.id]">✅ Envoyé</span>
            <span v-else>💬 Envoyer</span>
          </button>
        </div>
      </div>

      <!-- Bouton tout envoyer -->
      <div class="wpa-footer">
        <button
          @click="envoyerTout"
          :disabled="enCoursGlobal || promos.length === 0 || numeros.filter(n=>n).length === 0"
          class="btn-tout"
        >
          <span v-if="enCoursGlobal" class="spin">⟳</span>
          <span v-else>💬 Envoyer toutes les promos WhatsApp</span>
        </button>
        <p class="wpa-note" style="text-align:center">
          {{ numeros.filter(n=>n).length }} numéro(s) sélectionné(s)
        </p>
      </div>

    </template>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.visible" :class="['toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'

const statut       = ref({ connecte: false, qrImage: null, nom: '' })
const promos       = ref([])
const chargement   = ref(true)
const numeros      = ref([''])
const enCours      = ref({})
const succes       = ref({})
const enCoursGlobal = ref(false)
const toast        = ref({ visible: false, message: '', type: 'ok' })

let intervalStatut = null

const afficherToast = (message, type = 'ok') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 4000)
}

const chargerStatut = async () => {
  try {
    const { data } = await api.get('/whatsapp/status')
    statut.value = data
  } catch {}
}

const envoyerProduit = async (produit) => {
  const nums = numeros.value.filter(n => n.trim())
  if (nums.length === 0) return afficherToast('Ajoute au moins un numéro !', 'err')

  enCours.value[produit.id] = true
  try {
    await api.post(`/whatsapp/send-promo/${produit.id}`, { numeros: nums })
    succes.value[produit.id] = true
    afficherToast(`✅ Promo "${produit.name}" envoyée !`, 'ok')
    setTimeout(() => { delete succes.value[produit.id] }, 6000)
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  } finally {
    delete enCours.value[produit.id]
  }
}

const envoyerTout = async () => {
  const nums = numeros.value.filter(n => n.trim())
  if (nums.length === 0) return afficherToast('Ajoute au moins un numéro !', 'err')

  enCoursGlobal.value = true
  try {
    const { data } = await api.post('/whatsapp/send-toutes-promos', { numeros: nums })
    afficherToast(`✅ ${data.message}`, 'ok')
  } catch (err) {
    afficherToast(`❌ ${err.response?.data?.message || 'Erreur'}`, 'err')
  } finally {
    enCoursGlobal.value = false
  }
}

onMounted(async () => {
  await chargerStatut()
  // Rafraîchit le statut toutes les 5s si pas connecté
  intervalStatut = setInterval(() => {
    if (!statut.value.connecte) chargerStatut()
  }, 5000)

  try {
    const { data } = await api.get('/admin/produits')
    promos.value = data.filter(p => p.is_promo)
  } catch {} finally {
    chargement.value = false
  }
})

onUnmounted(() => clearInterval(intervalStatut))
</script>

<style scoped>
.wpa { background:#040f20; border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; position:relative; }

.wpa-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px; border-bottom:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.02); flex-wrap:wrap; gap:10px;
}
.wpa-titre { color:white; font-size:1rem; font-weight:800; }
.wpa-sous  { color:rgba(255,255,255,.3); font-size:.75rem; margin-top:3px; }
.wpa-statut {
  display:flex; align-items:center; gap:6px;
  padding:5px 14px; border-radius:99px; font-size:.75rem; font-weight:700;
}
.wpa-statut.ok  { background:rgba(37,211,102,.1); color:#25d366; border:1px solid rgba(37,211,102,.2); }
.wpa-statut.err { background:rgba(248,113,113,.1); color:#f87171; border:1px solid rgba(248,113,113,.2); }
.s-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* QR */
.wpa-qr { padding:32px; display:flex; justify-content:center; }
.qr-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; }
.qr-titre { color:white; font-size:.9rem; font-weight:700; margin:0; }
.qr-img   { width:220px; height:220px; border-radius:12px; border:3px solid rgba(37,211,102,.3); }
.qr-sous  { color:rgba(255,255,255,.3); font-size:.72rem; text-align:center; margin:0; }
.qr-attente { display:flex; align-items:center; gap:10px; color:rgba(255,255,255,.3); font-size:.85rem; flex-direction:column; padding:20px; }
.btn-refresh { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.4); padding:7px 16px; border-radius:8px; cursor:pointer; font-size:.78rem; transition:all .2s; }
.btn-refresh:hover { background:rgba(255,255,255,.1); color:white; }

/* Numéros */
.wpa-section { padding:16px 20px; border-bottom:1px solid rgba(255,255,255,.05); }
.wpa-section-titre { color:rgba(255,255,255,.25); font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
.wpa-numeros { display:flex; flex-direction:column; gap:8px; }
.wpa-num-item { display:flex; align-items:center; gap:8px; }
.num-flag { font-size:1.1rem; }
.num-input {
  flex:1; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
  border-radius:8px; padding:8px 12px; color:white; font-size:.82rem; outline:none;
}
.num-input:focus { border-color:rgba(37,211,102,.3); }
.btn-del { background:rgba(248,113,113,.1); border:1px solid rgba(248,113,113,.2); color:#f87171; width:28px; height:28px; border-radius:6px; cursor:pointer; font-size:.75rem; }
.btn-add-num { background:rgba(37,211,102,.07); border:1px dashed rgba(37,211,102,.2); color:rgba(37,211,102,.6); padding:8px; border-radius:8px; cursor:pointer; font-size:.78rem; transition:all .2s; }
.btn-add-num:hover { background:rgba(37,211,102,.12); color:#25d366; }
.wpa-note { color:rgba(255,255,255,.2); font-size:.68rem; margin:6px 0 0; }

/* Liste */
.wpa-loading, .wpa-vide { padding:28px; text-align:center; color:rgba(255,255,255,.2); font-size:.85rem; display:flex; align-items:center; justify-content:center; gap:8px; }
.wpa-liste { max-height:300px; overflow-y:auto; }
.wpa-liste::-webkit-scrollbar { width:3px; }
.wpa-liste::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); }
.wpa-item { display:flex; align-items:center; justify-content:space-between; padding:11px 20px; border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s; gap:12px; }
.wpa-item:hover { background:rgba(255,255,255,.02); }
.wpa-item-left { display:flex; align-items:center; gap:10px; flex:1; min-width:0; }
.wpa-av { width:32px; height:32px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#25d366,#128c7e); color:white; font-weight:900; font-size:.82rem; display:flex; align-items:center; justify-content:center; }
.wpa-nom { color:white; font-size:.82rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wpa-det { color:rgba(255,255,255,.3); font-size:.7rem; }
.btn-envoyer { padding:6px 14px; border-radius:8px; font-size:.75rem; font-weight:700; cursor:pointer; transition:all .2s; white-space:nowrap; background:rgba(37,211,102,.1); color:#25d366; border:1px solid rgba(37,211,102,.25); }
.btn-envoyer:hover:not(:disabled) { background:rgba(37,211,102,.2); }
.btn-envoyer:disabled { opacity:.5; cursor:not-allowed; }
.btn-envoyer.btn-ok { background:rgba(52,211,153,.1); color:#34d399; border-color:rgba(52,211,153,.2); }

/* Footer */
.wpa-footer { padding:16px 20px; border-top:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.02); display:flex; flex-direction:column; gap:8px; }
.btn-tout { width:100%; padding:12px; background:linear-gradient(135deg,#25d366,#128c7e); color:white; border:none; border-radius:10px; font-weight:800; font-size:.88rem; cursor:pointer; transition:all .2s; box-shadow:0 4px 16px rgba(37,211,102,.25); }
.btn-tout:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
.btn-tout:disabled { opacity:.5; cursor:not-allowed; transform:none; }

.spin { animation:sp .8s linear infinite; display:inline-block; }
@keyframes sp { to { transform:rotate(360deg); } }
.toast { position:fixed; bottom:28px; right:28px; z-index:9999; padding:13px 22px; border-radius:12px; font-size:.85rem; font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,.4); }
.toast-ok  { background:#052e16; border:1px solid #166534; color:#4ade80; }
.toast-err { background:#1c0a0a; border:1px solid #991b1b; color:#f87171; }
.toast-enter-active, .toast-leave-active { transition:all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
