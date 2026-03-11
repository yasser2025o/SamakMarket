<!-- =============================================================
  views/LoginView.vue — SamakMarket
  
  LOGIQUE DE REDIRECTION APRÈS LOGIN :
    role = 'admin'  → /admin   (AdminDashboardView)
    role = 'seller' → /dashboard (DashboardView vendeur)
    role = 'buyer'  → /         (Marketplace)
  
  DESIGN : thème ocean nuit · carte glassmorphism · accents or
============================================================= -->
<template>
  <div class="login-page">

    <!-- Fond animé océan -->
    <div class="ocean-bg">
      <div class="wave w1"></div>
      <div class="wave w2"></div>
      <div class="wave w3"></div>
    </div>

    <!-- Carte de connexion -->
    <div class="login-card">

      <!-- Logo + titre -->
      <div class="login-header">
        <div class="logo-ring">
          <span class="logo-fish">🐟</span>
        </div>
        <h1 class="login-title">SamakMarket</h1>
        <p class="login-sub">Connectez-vous à votre espace</p>
      </div>

      <!-- Erreur -->
      <div v-if="erreur" class="erreur-box">
        ❌ {{ erreur }}
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="soumettre" class="login-form">

        <!-- Email -->
        <div class="champ">
          <label class="champ-label">Email</label>
          <div class="champ-input-wrap">
            <span class="champ-ico">✉️</span>
            <input v-model="email" type="email" placeholder="vous@exemple.com" required
              class="champ-input" autocomplete="email" />
          </div>
        </div>

        <!-- Mot de passe -->
        <div class="champ">
          <label class="champ-label">Mot de passe</label>
          <div class="champ-input-wrap">
            <span class="champ-ico">🔒</span>
            <input v-model="password" :type="voirMdp ? 'text' : 'password'"
              placeholder="••••••••" required class="champ-input" autocomplete="current-password" />
            <button type="button" @click="voirMdp = !voirMdp" class="champ-eye">
              {{ voirMdp ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Bouton connexion -->
        <button type="submit" :disabled="chargement" class="btn-login">
          <span v-if="chargement" class="btn-spinner">⟳</span>
          <span v-else>Se connecter →</span>
        </button>

      </form>

      <!-- 
        Accès rapide démo — montre les 3 rôles disponibles
        Utile pour tester rapidement sans retaper les identifiants
        RETIRE ce bloc en production
      -->
      <div class="demo-section">
        <div class="demo-titre">Accès rapide (démo)</div>
        <div class="demo-btns">

          <!-- Admin -->
          <button @click="loginDemo('admin')" class="demo-btn demo-admin">
            <span class="demo-ico">🛡️</span>
            <div>
              <div class="demo-role">Admin</div>
              <div class="demo-desc">Dashboard complet</div>
            </div>
            <span class="demo-arrow">→</span>
          </button>

          <!-- Vendeur -->
          <button @click="loginDemo('seller')" class="demo-btn demo-seller">
            <span class="demo-ico">🐟</span>
            <div>
              <div class="demo-role">Vendeur</div>
              <div class="demo-desc">Gérer mes produits</div>
            </div>
            <span class="demo-arrow">→</span>
          </button>

          <!-- Acheteur -->
          <button @click="loginDemo('buyer')" class="demo-btn demo-buyer">
            <span class="demo-ico">🛒</span>
            <div>
              <div class="demo-role">Acheteur</div>
              <div class="demo-desc">Parcourir le marché</div>
            </div>
            <span class="demo-arrow">→</span>
          </button>

        </div>
      </div>

      <!-- Liens bas -->
      <div class="login-footer">
        <RouterLink to="/register" class="footer-link">Créer un compte vendeur →</RouterLink>
        <RouterLink to="/" class="footer-link-soft">← Retour à la marketplace</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const email    = ref('')
const password = ref('')
const chargement = ref(false)
const erreur     = ref('')
const voirMdp    = ref(false)

// ── Redirection selon le rôle ─────────────────────────────────
// C'est ici que la magie opère :
//   admin  → /admin      (AdminDashboardView)
//   seller → /dashboard  (DashboardView vendeur)
//   buyer  → /           (Marketplace)
const redirigerSelonRole = (role) => {
  if (role === 'admin')  return router.push('/admin')
  if (role === 'seller') return router.push('/dashboard')
  return router.push('/')
}

// ── Connexion réelle (API) ────────────────────────────────────
const soumettre = async () => {
  chargement.value = true
  erreur.value     = ''
 try {
    const res = await auth.seConnecter(email.value, password.value)
    if (res.succes) {
      redirigerSelonRole(auth.user?.role)
    } else {
      erreur.value = res.message  // ← affiche l'erreur
    }
  } catch (e) {
    erreur.value = 'Erreur de connexion. Réessayez.'
  } finally {
    chargement.value = false  // ← TOUJOURS remis à false
  }

  if (res.succes) {
    // Redirige vers le bon espace selon le rôle de l'utilisateur
    redirigerSelonRole(auth.user?.role)
  } else {
    erreur.value = res.message
  }

  chargement.value = false
}

// ── Connexion démo rapide (sans API) ─────────────────────────
// Simule une session pour tester l'interface
// À retirer en production !
const loginDemo = (role) => {
  const comptes = {
    admin:  { id:1, name:'Admin SamakMarket', email:'admin@samakmarket.ma',  role:'admin',  city:'Casablanca' },
    seller: { id:2, name:'Mohamed Diallo',    email:'m.diallo@samak.ma',     role:'seller', city:'Tanger'     },
    buyer:  { id:3, name:'Visiteur',          email:'visiteur@samak.ma',     role:'buyer',  city:''           },
  }
  // Simule la session sans appel API
  localStorage.setItem('token', `demo-token-${role}`)
  localStorage.setItem('user',  JSON.stringify(comptes[role]))
  
  // Force la mise à jour du store
  auth.token = `demo-token-${role}`
  auth.user  = comptes[role]

  redirigerSelonRole(role)
}
</script>

<style scoped>
/* ── Page ── */
.login-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(160deg, #020c1b 0%, #040f20 50%, #020a16 100%);
  position: relative; overflow: hidden; padding: 24px;
}

/* ── Vagues de fond ── */
.ocean-bg { position: absolute; inset: 0; pointer-events: none; }
.wave {
  position: absolute; left: -10%; width: 120%;
  border-radius: 50%; opacity: .05;
  background: linear-gradient(90deg, transparent, #0dcaf0, transparent);
  animation: waveMove 10s ease-in-out infinite;
}
.w1 { height: 2px; top: 30%; animation-duration: 9s; }
.w2 { height: 1px; top: 55%; animation-duration: 13s; animation-delay: 2s; opacity: .03; }
.w3 { height: 2px; top: 72%; animation-duration: 11s; animation-delay: 4s; }
@keyframes waveMove {
  0%,100% { transform: translateX(0) scaleY(1); }
  50%     { transform: translateX(5%) scaleY(3); }
}

/* ── Carte principale ── */
.login-card {
  width: 100%; max-width: 420px;
  background: linear-gradient(145deg, rgba(255,255,255,.06), rgba(212,175,55,.03));
  border: 1px solid rgba(212,175,55,.15);
  border-radius: 24px; padding: 36px 32px;
  backdrop-filter: blur(20px);
  box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04);
  animation: cardIn .6s cubic-bezier(.22,1,.36,1);
}
@keyframes cardIn {
  from { opacity:0; transform: translateY(24px) scale(.97); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}

/* ── Header ── */
.login-header { text-align: center; margin-bottom: 28px; }
.logo-ring {
  width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 12px;
  background: linear-gradient(135deg, rgba(212,175,55,.2), rgba(212,175,55,.05));
  border: 1px solid rgba(212,175,55,.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 0 30px rgba(212,175,55,.15);
}
.login-title { color: white; font-size: 1.5rem; font-weight: 800; letter-spacing: .02em; }
.login-sub   { color: rgba(255,255,255,.3); font-size: .82rem; margin-top: 4px; }

/* ── Erreur ── */
.erreur-box {
  background: rgba(255,80,80,.08); border: 1px solid rgba(255,80,80,.2);
  color: #ff8080; padding: 10px 14px; border-radius: 10px;
  font-size: .84rem; margin-bottom: 16px;
}

/* ── Formulaire ── */
.login-form  { display: flex; flex-direction: column; gap: 14px; }
.champ       { display: flex; flex-direction: column; gap: 5px; }
.champ-label { color: rgba(255,255,255,.45); font-size: .78rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
.champ-input-wrap {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px; padding: 0 14px;
  transition: border-color .2s;
}
.champ-input-wrap:focus-within { border-color: rgba(212,175,55,.4); }
.champ-ico   { font-size: .9rem; opacity: .5; flex-shrink: 0; }
.champ-input {
  flex: 1; background: none; border: none; outline: none;
  color: white; font-size: .9rem; padding: 13px 0;
}
.champ-input::placeholder { color: rgba(255,255,255,.2); }
.champ-eye   { background: none; border: none; cursor: pointer; font-size: .85rem; opacity: .5; padding: 0; transition: opacity .2s; }
.champ-eye:hover { opacity: 1; }

/* ── Bouton connexion ── */
.btn-login {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #d4af37, #f5d57a);
  color: #020e23; font-weight: 800; font-size: .95rem;
  border: none; border-radius: 12px; cursor: pointer;
  transition: all .2s;
  box-shadow: 0 4px 20px rgba(212,175,55,.3);
  margin-top: 4px;
}
.btn-login:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(212,175,55,.45); }
.btn-login:disabled { opacity: .6; cursor: not-allowed; }
.btn-spinner { display: inline-block; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Section démo ── */
.demo-section { margin-top: 24px; }
.demo-titre {
  text-align: center; color: rgba(255,255,255,.2);
  font-size: .7rem; text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 10px; position: relative;
}
.demo-titre::before, .demo-titre::after {
  content: ''; position: absolute; top: 50%; width: 28%; height: 1px;
  background: rgba(255,255,255,.07);
}
.demo-titre::before { left: 0; }
.demo-titre::after  { right: 0; }

.demo-btns { display: flex; flex-direction: column; gap: 8px; }
.demo-btn  {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 10px 14px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,.07); cursor: pointer;
  transition: all .2s; background: rgba(255,255,255,.03);
}
.demo-btn:hover { transform: translateX(3px); }
.demo-ico  { font-size: 1.3rem; flex-shrink: 0; }
.demo-role { color: white; font-size: .85rem; font-weight: 700; text-align: left; }
.demo-desc { color: rgba(255,255,255,.3); font-size: .72rem; text-align: left; }
.demo-arrow { margin-left: auto; color: rgba(255,255,255,.2); font-size: .85rem; }

/* Couleurs par rôle */
.demo-admin  { border-color: rgba(212,175,55,.2); }
.demo-admin:hover  { background: rgba(212,175,55,.08); border-color: rgba(212,175,55,.35); }
.demo-admin  .demo-role { color: #f5d57a; }

.demo-seller { border-color: rgba(13,202,240,.15); }
.demo-seller:hover { background: rgba(13,202,240,.06); border-color: rgba(13,202,240,.3); }
.demo-seller .demo-role { color: #0dcaf0; }

.demo-buyer  { border-color: rgba(37,211,102,.12); }
.demo-buyer:hover  { background: rgba(37,211,102,.06); border-color: rgba(37,211,102,.25); }
.demo-buyer  .demo-role { color: #25d366; }

/* ── Footer ── */
.login-footer { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; align-items: center; }
.footer-link      { color: rgba(212,175,55,.7); font-size: .82rem; text-decoration: none; transition: color .2s; }
.footer-link:hover { color: #f5d57a; }
.footer-link-soft { color: rgba(255,255,255,.2); font-size: .78rem; text-decoration: none; transition: color .2s; }
.footer-link-soft:hover { color: rgba(255,255,255,.5); }
</style>
