<!-- =============================================================
  components/admin/ResetPasswordAdmin.vue
  Composant admin — Réinitialisation mot de passe vendeur
  
  USAGE dans AdminDashboardView.vue :
    import ResetPasswordAdmin from '../components/admin/ResetPasswordAdmin.vue'
    <ResetPasswordAdmin />
============================================================= -->
<template>
  <div class="rpa">

    <!-- ── Header ── -->
    <div class="rpa-header">
      <div>
        <h2 class="rpa-titre">🔐 Réinitialisation des mots de passe</h2>
        <p class="rpa-sous">Envoyez un nouveau mot de passe temporaire par email au vendeur</p>
      </div>
      <!-- Barre de recherche vendeur -->
      <div class="rpa-search">
        <span class="rpa-search-ico">🔍</span>
        <input
          v-model="recherche"
          placeholder="Chercher un vendeur..."
          class="rpa-search-input"
        />
      </div>
    </div>

    <!-- ── Chargement ── -->
    <div v-if="chargement" class="rpa-loading">
      <div class="rpa-spinner">⟳</div>
      <span>Chargement des vendeurs...</span>
    </div>

    <!-- ── Liste vendeurs ── -->
    <div v-else class="rpa-table-wrap">
      <table class="rpa-table">
        <thead>
          <tr>
            <th>Vendeur</th>
            <th>Email</th>
            <th>Ville</th>
            <th>Statut</th>
            <th>Dernière connexion</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vendeursLimites" :key="v.id" class="rpa-row">


            <!-- Avatar + nom -->
            <td class="rpa-cell-vendeur">
              <div class="rpa-av">{{ v.name.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="rpa-nom">{{ v.name }}</div>
                <div class="rpa-phone">{{ v.phone || '—' }}</div>
              </div>
            </td>

            <!-- Email -->
            <td class="rpa-email">{{ v.email }}</td>

            <!-- Ville -->
            <td class="rpa-ville">{{ v.city || '—' }}</td>

            <!-- Statut -->
            <td>
              <span :class="['rpa-statut', v.is_active ? 'statut-on' : 'statut-off']">
                {{ v.is_active ? '● Actif' : '○ Inactif' }}
              </span>
            </td>

            <!-- Dernière connexion -->
            <td class="rpa-lastlogin">{{ formatDate(v.last_login) }}</td>

            <!-- Bouton reset -->
            <td>
              <button
                @click="demanderConfirmation(v)"
                :disabled="enCours[v.id]"
                class="btn-reset"
              >
                <span v-if="enCours[v.id]" class="spin">⟳</span>
                <span v-else-if="succes[v.id]">✅ Envoyé</span>
                <span v-else>📧 Réinitialiser</span>
              </button>
            </td>

          </tr>

          <!-- Aucun résultat -->
          <tr v-if="vendeursFiltres.length === 0">
            <td colspan="6" class="rpa-vide">
              Aucun vendeur trouvé
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══ MODAL DE CONFIRMATION ══ -->
    <Transition name="modal">
      <div v-if="vendeurChoisi" class="modal-backdrop" @click.self="vendeurChoisi = null">
        <div class="modal-box">

          <div class="modal-icon">🔐</div>
          <h3 class="modal-titre">Confirmer la réinitialisation</h3>
          <p class="modal-txt">
            Un nouveau mot de passe <strong>temporaire</strong> sera généré et
            envoyé à l'adresse email de :
          </p>

          <div class="modal-vendeur-card">
            <div class="modal-av">{{ vendeurChoisi.name.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="modal-vendeur-nom">{{ vendeurChoisi.name }}</div>
              <div class="modal-vendeur-email">{{ vendeurChoisi.email }}</div>
            </div>
          </div>

          <p class="modal-warn">
            ⚠️ Le vendeur devra changer ce mot de passe dès sa prochaine connexion.
          </p>

          <div class="modal-actions">
            <button @click="vendeurChoisi = null" class="btn-annuler">
              Annuler
            </button>
            <button @click="confirmerReset" class="btn-confirmer">
              📧 Envoyer le nouveau mot de passe
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- ══ TOAST NOTIFICATION ══ -->
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

// ── Données ─────────────────────────────────────────────────
const vendeurs      = ref([])
const chargement    = ref(true)
const recherche     = ref('')
const vendeurChoisi = ref(null)
const enCours       = ref({})  // { vendeurId: true } pendant l'envoi
const succes        = ref({})  // { vendeurId: true } après succès

const toast = ref({ visible: false, message: '', type: 'ok' })
const vendeursLimites = computed(() => vendeursFiltres.value.slice(0, 10));



// ── Filtrage ─────────────────────────────────────────────────
const vendeursFiltres = computed(() => {
  const q = recherche.value.toLowerCase().trim()
  if (!q) return vendeurs.value
  return vendeurs.value.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.email.toLowerCase().includes(q) ||
    (v.city || '').toLowerCase().includes(q)
  )
})
// ── Limite à 10 vendeurs ─────────────────────────────────────
//const vendeursLimites = computed(() => vendeursFiltres.value.slice(0, 10));
// ── Format date ──────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return 'Jamais connecté'
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / 60000) // minutes
  if (diff < 2)   return 'À l\'instant'
  if (diff < 60)  return `Il y a ${diff} min`
  if (diff < 1440) return `Il y a ${Math.floor(diff/60)}h`
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
}

// ── Afficher toast ────────────────────────────────────────────
const afficherToast = (message, type = 'ok') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 4000)
}

// ── Ouvre la modale ──────────────────────────────────────────
const demanderConfirmation = (vendeur) => {
  if (succes.value[vendeur.id]) return // déjà envoyé
  vendeurChoisi.value = vendeur
}

// ── Confirme et envoie ───────────────────────────────────────
const confirmerReset = async () => {
  const v = vendeurChoisi.value
  vendeurChoisi.value = null
  enCours.value[v.id] = true

  try {
    await api.post(`/admin/reset-password/${v.id}`)
    succes.value[v.id] = true
    afficherToast(`✅ Nouveau mot de passe envoyé à ${v.email}`, 'ok')

    // Remet le bouton à l'état normal après 8 secondes
    setTimeout(() => { delete succes.value[v.id] }, 8000)
  } catch (err) {
    const msg = err.response?.data?.message || 'Erreur lors de l\'envoi'
    afficherToast(`❌ ${msg}`, 'err')
  } finally {
    delete enCours.value[v.id]
  }
}

// ── Charge la liste des vendeurs ─────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get('/admin/vendeurs')
    vendeurs.value = data
  } catch (e) {
    afficherToast('Impossible de charger les vendeurs', 'err')
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
/* ══ Container ═══════════════════════════════════════════ */
.rpa {
  background: #040f20;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px; overflow: hidden;
  position: relative;
}

/* ── Header ── */
.rpa-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
  padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.02);
}
.rpa-titre { color: white; font-size: 1rem; font-weight: 800; }
.rpa-sous  { color: rgba(255,255,255,.3); font-size: .75rem; margin-top: 3px; }

.rpa-search {
  position: relative; display: flex; align-items: center;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px; padding: 0 12px; min-width: 220px;
}
.rpa-search-ico   { color: rgba(255,255,255,.3); font-size: .85rem; flex-shrink: 0; }
.rpa-search-input {
  background: transparent; border: none; outline: none;
  color: white; font-size: .85rem; padding: 9px 10px;
  width: 100%;
}
.rpa-search-input::placeholder { color: rgba(255,255,255,.2); }

/* ── Loading ── */
.rpa-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 48px; color: rgba(255,255,255,.3); font-size: .85rem;
}
.rpa-spinner { animation: sp 1s linear infinite; display: inline-block; font-size: 1.2rem; }
@keyframes sp { to { transform: rotate(360deg); } }

/* ── Table ── */
.rpa-table-wrap { overflow-x: auto; }
.rpa-table {
  width: 100%; border-collapse: collapse;
}
.rpa-table thead tr {
  background: rgba(255,255,255,.03);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.rpa-table th {
  padding: 11px 16px; text-align: left;
  color: rgba(255,255,255,.3); font-size: .7rem;
  text-transform: uppercase; letter-spacing: .08em; font-weight: 600;
  white-space: nowrap;
}
.rpa-row {
  border-bottom: 1px solid rgba(255,255,255,.04);
  transition: background .15s;
}
.rpa-row:hover { background: rgba(255,255,255,.025); }
.rpa-row td    { padding: 12px 16px; vertical-align: middle; }

/* Cellule vendeur */
.rpa-cell-vendeur { display: flex; align-items: center; gap: 10px; }
.rpa-av {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 900; font-size: .85rem;
  display: flex; align-items: center; justify-content: center;
}
.rpa-nom   { color: white; font-size: .85rem; font-weight: 700; }
.rpa-phone { color: rgba(255,255,255,.3); font-size: .7rem; }

.rpa-email     { color: rgba(255,255,255,.5); font-size: .8rem; }
.rpa-ville     { color: rgba(255,255,255,.4); font-size: .8rem; }
.rpa-lastlogin { color: rgba(255,255,255,.3); font-size: .75rem; white-space: nowrap; }

/* Statut */
.rpa-statut  { font-size: .72rem; font-weight: 700; padding: 3px 10px; border-radius: 99px; white-space: nowrap; }
.statut-on   { background: rgba(52,211,153,.1); color: #34d399; border: 1px solid rgba(52,211,153,.2); }
.statut-off  { background: rgba(255,255,255,.05); color: rgba(255,255,255,.3); border: 1px solid rgba(255,255,255,.08); }

/* Bouton reset */
.btn-reset {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 8px; white-space: nowrap;
  font-size: .78rem; font-weight: 700; cursor: pointer;
  border: 1px solid rgba(212,175,55,.25);
  background: rgba(212,175,55,.08); color: #f5d57a;
  transition: all .2s;
}
.btn-reset:hover:not(:disabled) {
  background: rgba(212,175,55,.18);
  border-color: rgba(212,175,55,.4);
  transform: translateY(-1px);
}
.btn-reset:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.spin { animation: sp 1s linear infinite; display: inline-block; }

/* Vide */
.rpa-vide {
  text-align: center; padding: 40px;
  color: rgba(255,255,255,.2); font-size: .85rem;
}

/* ══ MODALE ══════════════════════════════════════════════ */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 999;
  background: rgba(0,0,0,.7); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: linear-gradient(145deg, #0d1f3c, #071428);
  border: 1px solid rgba(212,175,55,.2);
  border-radius: 20px; padding: 32px 28px;
  max-width: 440px; width: 100%;
  box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 40px rgba(212,175,55,.05);
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  text-align: center;
}
.modal-icon  { font-size: 2.5rem; }
.modal-titre { color: white; font-size: 1.1rem; font-weight: 800; }
.modal-txt   { color: rgba(255,255,255,.4); font-size: .85rem; line-height: 1.6; }
.modal-txt strong { color: rgba(255,255,255,.7); }

.modal-vendeur-card {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px; padding: 12px 16px; width: 100%; text-align: left;
}
.modal-av {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 900;
  display: flex; align-items: center; justify-content: center; font-size: .9rem;
}
.modal-vendeur-nom   { color: white; font-weight: 700; font-size: .9rem; }
.modal-vendeur-email { color: rgba(255,255,255,.35); font-size: .78rem; margin-top: 2px; }

.modal-warn {
  background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.15);
  border-radius: 10px; padding: 10px 14px;
  color: rgba(245,213,122,.7); font-size: .78rem; line-height: 1.5;
  width: 100%;
}

.modal-actions { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
.btn-annuler {
  flex: 1; padding: 11px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.4); border-radius: 10px;
  font-weight: 700; font-size: .85rem; cursor: pointer; transition: all .2s;
}
.btn-annuler:hover { background: rgba(255,255,255,.1); color: white; }
.btn-confirmer {
  flex: 2; padding: 11px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  border: none; color: white; border-radius: 10px;
  font-weight: 800; font-size: .85rem; cursor: pointer; transition: all .2s;
  box-shadow: 0 4px 16px rgba(29,78,216,.35);
}
.btn-confirmer:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,78,216,.5); }

/* ══ TOAST ══════════════════════════════════════════════ */
.toast {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  padding: 13px 22px; border-radius: 12px;
  font-size: .85rem; font-weight: 700;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.toast-ok  { background: #052e16; border: 1px solid #166534; color: #4ade80; }
.toast-err { background: #1c0a0a; border: 1px solid #991b1b; color: #f87171; }

/* ══ TRANSITIONS ═════════════════════════════════════════ */
.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(.95) translateY(10px); }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(12px); }
</style>
