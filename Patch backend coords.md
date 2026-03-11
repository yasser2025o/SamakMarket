<template>
  <div class="register-shell">

    <!-- Fond océan animé -->
    <div class="register-bg">
      <div class="wave w1"></div>
      <div class="wave w2"></div>
    </div>

    <div class="register-card">

      <!-- Logo -->
      <div class="text-center mb-6">
        <span class="text-5xl">🐟</span>
        <h1 class="card-titre">Rejoindre SamakMarket</h1>
        <p class="card-sous">Créez votre compte gratuitement</p>
      </div>

      <!-- Erreur / Succès -->
      <div v-if="messageErreur" class="msg-err">❌ {{ messageErreur }}</div>
      <div v-if="messageSucces" class="msg-ok">✅ {{ messageSucces }}</div>

      <div class="space-y-4">

        <!-- Nom -->
        <div class="field">
          <label>Nom complet *</label>
          <input v-model="formulaire.name" type="text"
            placeholder="Mohamed Diallo" required class="inp" />
        </div>

        <!-- Email -->
        <div class="field">
          <label>Email *</label>
          <input v-model="formulaire.email" type="email"
            placeholder="vous@exemple.com" required class="inp" />
        </div>

        <!-- Mot de passe -->
        <div class="field">
          <label>Mot de passe *</label>
          <input v-model="formulaire.password" type="password"
            placeholder="Minimum 6 caractères" required minlength="6" class="inp" />
        </div>

        <!-- Téléphone + WhatsApp -->
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label>Téléphone</label>
            <input v-model="formulaire.phone" type="tel"
              placeholder="0612345678" class="inp" />
          </div>
          <div class="field">
            <label>WhatsApp</label>
            <input v-model="formulaire.whatsapp" type="tel"
              placeholder="212612345678" class="inp" />
          </div>
        </div>

        <!-- Ville -->
        <div class="field">
          <label>Ville</label>
          <input v-model="formulaire.city" type="text"
            placeholder="Tanger, Casablanca, Agadir..." class="inp" />
        </div>

        <!-- ═══ LOCALISATION GPS ═══ -->
        <div class="gps-block">
          <div class="gps-block-header">
            <div>
              <div class="gps-titre">📍 Localisation</div>
              <div class="gps-sous">
                {{ formulaire.role === 'seller'
                  ? 'Obligatoire — les acheteurs vous trouvent sur la carte'
                  : 'Optionnel — pour voir les vendeurs près de vous' }}
              </div>
            </div>
            <!-- Statut coordonnées -->
            <div v-if="formulaire.latitude" class="gps-ok-badge">
              ✓ Géolocalisé
            </div>
          </div>

          <!-- Bouton GPS automatique -->
          <button type="button" @click="geoLocaliser"
            :disabled="chargementGPS"
            class="btn-gps">
            <span v-if="chargementGPS" class="spin">⟳</span>
            <span v-else>📡</span>
            {{ chargementGPS ? 'Détection en cours...' : 'Détecter ma position GPS' }}
          </button>

          <!-- Coordonnées détectées -->
          <div v-if="formulaire.latitude" class="coords-affiche">
            <div class="coord-item">
              <span class="coord-label">Latitude</span>
              <span class="coord-val">{{ formulaire.latitude.toFixed(5) }}</span>
            </div>
            <div class="coord-sep"></div>
            <div class="coord-item">
              <span class="coord-label">Longitude</span>
              <span class="coord-val">{{ formulaire.longitude.toFixed(5) }}</span>
            </div>
            <button type="button" @click="effacerCoords" class="coord-clear">✕</button>
          </div>

          <!-- Saisie manuelle -->
          <div class="manual-row">
            <div class="field flex-1">
              <label>Latitude (optionnel)</label>
              <input v-model.number="formulaire.latitude" type="number"
                step="0.00001" placeholder="Ex: 35.7595" class="inp inp-sm" />
            </div>
            <div class="field flex-1">
              <label>Longitude (optionnel)</label>
              <input v-model.number="formulaire.longitude" type="number"
                step="0.00001" placeholder="Ex: -5.8340" class="inp inp-sm" />
            </div>
          </div>

          <!-- Erreur GPS -->
          <div v-if="erreurGPS" class="gps-err">⚠️ {{ erreurGPS }}</div>
        </div>

        <!-- Rôle -->
        <div class="field">
          <label class="mb-2 block">Je suis un(e) *</label>
          <div class="grid grid-cols-2 gap-3">
            <label :class="['role-card', formulaire.role === 'buyer' && 'role-on']">
              <input type="radio" v-model="formulaire.role" value="buyer" class="sr-only" />
              <div class="text-2xl">🛒</div>
              <div class="role-nom">Acheteur</div>
              <div class="role-desc">Je cherche du poisson</div>
            </label>
            <label :class="['role-card', formulaire.role === 'seller' && 'role-on']">
              <input type="radio" v-model="formulaire.role" value="seller" class="sr-only" />
              <div class="text-2xl">🏪</div>
              <div class="role-nom">Vendeur</div>
              <div class="role-desc">Je vends du poisson</div>
            </label>
          </div>
        </div>

        <!-- Bouton soumettre -->
        <button @click="soumettre" :disabled="chargement" class="btn-submit">
          <span v-if="chargement" class="spin">⟳</span>
          {{ chargement ? 'Création du compte...' : 'Créer mon compte 🎉' }}
        </button>

      </div>

      <p class="text-center text-sm text-gray-500 mt-5">
        Déjà un compte ?
        <RouterLink to="/login" class="text-blue-600 font-semibold hover:underline">
          Se connecter
        </RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const formulaire = ref({
  name: '', email: '', password: '',
  phone: '', whatsapp: '', city: '',
  role: 'buyer',
  latitude:  null,
  longitude: null,
})

const chargement    = ref(false)
const chargementGPS = ref(false)
const messageErreur = ref('')
const messageSucces = ref('')
const erreurGPS     = ref('')

// ── GPS ────────────────────────────────────────────────────
const geoLocaliser = () => {
  if (!navigator.geolocation) {
    erreurGPS.value = 'Géolocalisation non supportée par votre navigateur'
    return
  }
  chargementGPS.value = true
  erreurGPS.value     = ''

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      formulaire.value.latitude  = pos.coords.latitude
      formulaire.value.longitude = pos.coords.longitude
      chargementGPS.value = false
    },
    (err) => {
      chargementGPS.value = false
      const msgs = {
        1: 'Accès refusé — autorisez la localisation dans votre navigateur',
        2: 'Position indisponible',
        3: 'Délai dépassé — réessayez',
      }
      erreurGPS.value = msgs[err.code] || 'Erreur de localisation'
    },
    { timeout: 10000, enableHighAccuracy: true }
  )
}

const effacerCoords = () => {
  formulaire.value.latitude  = null
  formulaire.value.longitude = null
}

// ── Inscription ────────────────────────────────────────────
const soumettre = async () => {
  chargement.value    = true
  messageErreur.value = ''
  messageSucces.value = ''

  // Nettoie les coords null avant envoi
  const payload = { ...formulaire.value }
  if (!payload.latitude)  delete payload.latitude
  if (!payload.longitude) delete payload.longitude

  const resultat = await auth.sInscrire(payload)

  if (resultat.succes) {
    messageSucces.value = 'Compte créé ! Redirection...'
    setTimeout(() => {
      router.push(formulaire.value.role === 'seller' ? '/dashboard' : '/')
    }, 1500)
  } else {
    messageErreur.value = resultat.message
  }

  chargement.value = false
}
</script>

<style scoped>
/* ── Shell ── */
.register-shell {
  min-height: 100vh;
  background: linear-gradient(160deg, #020c1b 0%, #040f20 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 32px 16px; position: relative; overflow: hidden;
}

/* Fond vagues */
.register-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.wave {
  position: absolute; left: -50%; width: 200%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,180,216,.15), transparent);
  animation: wv 10s ease-in-out infinite;
}
.w1 { top: 30%; }
.w2 { top: 60%; animation-delay: 4s; animation-duration: 14s; }
@keyframes wv { 0%,100%{transform:translateX(0)} 50%{transform:translateX(10%)} }

/* ── Card ── */
.register-card {
  position: relative; z-index: 1;
  background: rgba(255,255,255,.97);
  border-radius: 20px; padding: 36px 32px;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 60px rgba(0,0,0,.4);
}
.card-titre { font-size: 1.4rem; font-weight: 800; color: #020e23; margin-top: 8px; }
.card-sous  { color: #6b7280; font-size: .875rem; margin-top: 2px; }

/* Messages */
.msg-err { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 10px 14px; border-radius: 10px; margin-bottom: 12px; font-size: .85rem; }
.msg-ok  { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; padding: 10px 14px; border-radius: 10px; margin-bottom: 12px; font-size: .85rem; }

/* Champs */
.field label { display: block; font-size: .82rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
.inp {
  width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
  padding: 11px 14px; font-size: .9rem; transition: border .2s; outline: none;
  background: #fafafa;
}
.inp:focus { border-color: #3b82f6; background: white; }
.inp-sm    { padding: 8px 12px; font-size: .82rem; }

/* ── GPS Block ── */
.gps-block {
  background: linear-gradient(135deg, #eff6ff, #f0f9ff);
  border: 1.5px solid #bfdbfe;
  border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.gps-block-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.gps-titre  { font-size: .88rem; font-weight: 700; color: #1e40af; }
.gps-sous   { font-size: .72rem; color: #6b7280; margin-top: 2px; line-height: 1.4; }
.gps-ok-badge {
  background: #dcfce7; border: 1px solid #86efac; color: #16a34a;
  font-size: .65rem; font-weight: 700; padding: 3px 8px; border-radius: 99px;
  white-space: nowrap; flex-shrink: 0;
}

.btn-gps {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 10px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white; font-weight: 700; font-size: .85rem;
  border: none; border-radius: 10px; cursor: pointer; transition: all .2s;
}
.btn-gps:hover    { background: linear-gradient(135deg, #1e40af, #1d4ed8); }
.btn-gps:disabled { opacity: .6; cursor: not-allowed; }

/* Coords affichées */
.coords-affiche {
  display: flex; align-items: center; gap: 8px;
  background: white; border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px 12px;
}
.coord-item   { display: flex; flex-direction: column; flex: 1; }
.coord-label  { font-size: .62rem; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; }
.coord-val    { font-size: .88rem; font-weight: 700; color: #1d4ed8; }
.coord-sep    { width: 1px; height: 30px; background: #e5e7eb; }
.coord-clear  { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; padding: 0 4px; }
.coord-clear:hover { color: #ef4444; }

/* Saisie manuelle */
.manual-row { display: flex; gap: 10px; }

/* Erreur GPS */
.gps-err {
  background: #fef2f2; border: 1px solid #fca5a5;
  color: #dc2626; font-size: .75rem; padding: 7px 10px; border-radius: 8px;
}

/* Rôle */
.role-card {
  border: 2px solid #e5e7eb; border-radius: 12px; padding: 12px;
  text-align: center; cursor: pointer; transition: all .2s;
}
.role-card:hover { border-color: #93c5fd; }
.role-on { border-color: #2563eb !important; background: #eff6ff; }
.role-nom  { font-weight: 700; font-size: .85rem; color: #111827; margin-top: 4px; }
.role-desc { font-size: .72rem; color: #6b7280; }

/* Bouton submit */
.btn-submit {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #1e3a5f, #1d4ed8);
  color: white; font-weight: 800; font-size: .95rem;
  border: none; border-radius: 12px; cursor: pointer; transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 4px 16px rgba(29,78,216,.3);
  margin-top: 4px;
}
.btn-submit:hover    { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,78,216,.4); }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.spin { animation: sp .8s linear infinite; display: inline-block; }
@keyframes sp { to { transform: rotate(360deg); } }
</style>