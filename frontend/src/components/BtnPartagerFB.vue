<!-- =============================================================
  components/BtnPartagerFB.vue
  Bouton partage Facebook pour les visiteurs ET bouton admin
  
  USAGE sur ProductCard :
    <BtnPartagerFB :produit="produit" />
    
  USAGE sur ProductDetail (admin peut aussi poster sur la page) :
    <BtnPartagerFB :produit="produit" :show-admin-post="true" />
============================================================= -->
<template>
  <div class="fb-wrap">

    <!-- ── Bouton partage visiteur (Share Dialog) ── -->
    <button @click="partagerVisiteur" class="btn-fb-share" title="Partager sur Facebook">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      Partager
    </button>

    <!-- ── Bouton poster sur la page (admin/vendeur seulement) ── -->
    <button
      v-if="showAdminPost && peutPoster"
      @click="posterSurPage"
      :disabled="enCours"
      :class="['btn-fb-page', etat]"
    >
      <span v-if="enCours" class="spin">⟳</span>
      <span v-else-if="etat === 'ok'">✅ Posté!</span>
      <span v-else-if="etat === 'err'">❌ Erreur</span>
      <span v-else>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right:4px">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Poster sur la page
      </span>
    </button>

    <!-- Toast feedback -->
    <Transition name="toast">
      <div v-if="toast.visible" :class="['fb-toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  produit:       { type: Object, required: true },
  showAdminPost: { type: Boolean, default: false },
})

const authStore = useAuthStore()
const enCours   = ref(false)
const etat      = ref('idle') // idle | ok | err
const toast     = ref({ visible: false, message: '', type: 'ok' })

// Peut poster = admin ou vendeur propriétaire
const peutPoster = computed(() => {
  const user = authStore.user
  if (!user) return false
  return user.role === 'admin' || user.id === props.produit.sellerId
})

const afficherToast = (message, type = 'ok') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 3500)
}

// ── Partage visiteur via Facebook Share Dialog ──────────────
const partagerVisiteur = () => {
  const url = encodeURIComponent(
    `${window.location.origin}/products/${props.produit.id}`
  )
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
  window.open(fbUrl, '_blank', 'width=600,height=400,scrollbars=yes')
}

// ── Poster sur la page Facebook (admin/vendeur) ─────────────
const posterSurPage = async () => {
  enCours.value = true
  etat.value    = 'idle'
  try {
    const { data } = await api.post(`/facebook/post-produit/${props.produit.id}`)
    etat.value = 'ok'
    afficherToast(`✅ ${data.message}`, 'ok')
    setTimeout(() => { etat.value = 'idle' }, 5000)
  } catch (err) {
    etat.value = 'err'
    const msg = err.response?.data?.message || 'Erreur Facebook'
    afficherToast(`❌ ${msg}`, 'err')
    setTimeout(() => { etat.value = 'idle' }, 4000)
  } finally {
    enCours.value = false
  }
}
</script>

<style scoped>
.fb-wrap {
  display: flex; gap: 8px; align-items: center;
  position: relative; flex-wrap: wrap;
}

/* Bouton partage visiteur */
.btn-fb-share {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  background: #f6f7f8; color: rgb(10, 10, 10);
  border: none; font-size: .78rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.btn-fb-share:hover { background: #1666d4; transform: translateY(-1px); }

/* Bouton poster sur la page */
.btn-fb-page {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 8px;
  background: rgba(24,119,242,.1); color: #1877F2;
  border: 1px solid rgba(24,119,242,.3);
  font-size: .78rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.btn-fb-page:hover:not(:disabled) {
  background: rgba(24,119,242,.18);
  border-color: rgba(24,119,242,.5);
}
.btn-fb-page:disabled { opacity: .6; cursor: not-allowed; }
.btn-fb-page.ok  { background: rgba(52,211,153,.1); color:#34d399; border-color:rgba(52,211,153,.3); }
.btn-fb-page.err { background: rgba(248,113,113,.1); color:#f87171; border-color:rgba(248,113,113,.3); }

.spin { animation: sp .8s linear infinite; display: inline-block; }
@keyframes sp { to { transform: rotate(360deg); } }

/* Toast */
.fb-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  padding: 11px 18px; border-radius: 10px;
  font-size: .82rem; font-weight: 700;
  box-shadow: 0 8px 24px rgba(0,0,0,.3);
}
.toast-ok  { background: #052e16; border:1px solid #166534; color: #4ade80; }
.toast-err { background: #1c0a0a; border:1px solid #991b1b; color: #f87171; }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity:0; transform:translateY(10px); }
</style>
