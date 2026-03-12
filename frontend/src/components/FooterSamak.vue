<!-- =============================================================
  components/FooterSamak.vue
  Footer principal de SamakMarket
  =============================================================
  Contient :
  - Logo + description du site
  - Liens utiles (marketplace, vendeurs, contact)
  - Infos pour les vendeurs (comment publier)
  - Réseaux sociaux + contact WhatsApp
  - Copyright
  ============================================================= -->

<template>
  <footer class="footer-ocean">

    <!-- Vague décorative en haut du footer -->
    <div class="wave-top">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="#0a1628"/>
      </svg>
    </div>

    <div class="max-w-6xl mx-auto px-6 pt-12 pb-6">

      <!-- ── Grille principale 4 colonnes ── -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

        <!-- Colonne 1 : Logo + description -->
        <div class="lg:col-span-1">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-4">
            <span class="text-4xl">🐟</span>
            <div>
              <div class="text-white font-black text-xl tracking-tight">SamakMarket</div>
              <div class="text-blue-400 text-xs tracking-widest uppercase">Tanger · Maroc</div>
            </div>
          </div>

          <!-- Description courte du site -->
          <p class="text-blue-200/60 text-sm leading-relaxed mb-4">
            La marketplace de poisson frais de Tanger.
            Contact direct entre pêcheurs et acheteurs —
            sans intermédiaire, sans commission.
          </p>

          <!-- Bouton WhatsApp général du site -->
          <!--
            Ce lien ouvre WhatsApp avec un message de contact général.
            Remplace le numéro par celui de l'administrateur du site.
          -->
          <a
            href="https://wa.me/212600000000?text=Bonjour%20SamakMarket%2C%20je%20voudrais%20plus%20d%27informations"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-500/30 transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.852L.057 23.25a.75.75 0 0 0 .916.948l5.604-1.47A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.493-5.178-1.354l-.37-.214-3.827 1.004 1.021-3.73-.228-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Nous contacter
          </a>
        </div>

        <!-- Colonne 2 : Navigation du site -->
        <div>
          <h4 class="footer-title">🌊 Le site</h4>
          <ul class="space-y-2">
            <!--
              RouterLink = navigation Vue sans rechargement de page.
              to="/" = lien vers la route nommée dans router/index.js
            -->
            <li><RouterLink to="/"          class="footer-link">Marketplace</RouterLink></li>
            <li><RouterLink to="/register"  class="footer-link">Devenir vendeur</RouterLink></li>
            <li><RouterLink to="/login"     class="footer-link">Mon compte</RouterLink></li>
            <li><RouterLink to="/dashboard" class="footer-link">Dashboard vendeur</RouterLink></li>
            <li>
              <!-- Lien externe vers WhatsApp pour signaler un problème -->
              <a href="https://wa.me/212600000000" target="_blank" class="footer-link">
                Signaler un problème
              </a>
            </li>
          </ul>
        </div>

        <!-- Colonne 3 : Infos pour les vendeurs -->
        <div>
          <h4 class="footer-title">🏪 Vendeurs</h4>

          <!-- Explication du fonctionnement pour attirer des vendeurs -->
          <div class="space-y-3 text-sm text-blue-200/60 leading-relaxed">
            <div class="flex items-start gap-2">
              <span class="text-amber-400 mt-0.5">①</span>
              <span>Créez votre compte vendeur gratuitement</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-amber-400 mt-0.5">②</span>
              <span>Publiez vos produits avec photos et prix</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-amber-400 mt-0.5">③</span>
              <span>Les acheteurs vous contactent directement</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-amber-400 mt-0.5">④</span>
              <span>0% de commission sur vos ventes</span>
            </div>
          </div>

          <!-- CTA vendeur -->
          <RouterLink
            to="/register"
            class="inline-block mt-4 bg-amber-400 hover:bg-amber-300 text-amber-900 text-xs font-bold px-4 py-2 rounded-full transition"
          >
            Publier mon poisson →
          </RouterLink>
        </div>

        <!-- Colonne 4 : Publicité + contact annonceurs -->
        <div>
          <h4 class="footer-title">📢 Publicité</h4>

          <!-- Section pour les annonceurs qui veulent une bannière pub -->
          <p class="text-blue-200/60 text-sm leading-relaxed mb-3">
            Mettez en avant votre activité auprès des acheteurs de poisson à Tanger et au Maroc.
          </p>

          <!-- Options de pub disponibles -->
          <div class="space-y-2 mb-4">
            <!--
              is_featured = produit sponsorisé (s'affiche en premier)
              ads = bannière publicitaire sur la homepage
            -->
            <div class="flex items-center gap-2 text-xs text-blue-300/70">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Produit sponsorisé (en tête de liste)
            </div>
            <div class="flex items-center gap-2 text-xs text-blue-300/70">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Bannière homepage
            </div>
            <div class="flex items-center gap-2 text-xs text-blue-300/70">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Profil vendeur certifié ✓
            </div>
          </div>

          <!-- Contact annonceurs via WhatsApp -->
          <a
            href="https://wa.me/212600000000?text=Bonjour%2C%20je%20voudrais%20publier%20une%20publicit%C3%A9%20sur%20SamakMarket"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 border border-amber-400/40 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full hover:bg-amber-400/10 transition"
          >
            Demander un devis pub
          </a>
        </div>

      </div>

      <!-- ── Séparateur ── -->
      <div class="border-t border-white/8 pt-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">

          <!-- Copyright -->
          <p class="text-blue-300/40 text-xs text-center">
            © {{ new Date().getFullYear() }} SamakMarket — Tanger, Maroc.
            Tous droits réservés.
          </p>

          <!-- Mentions légales -->
          <div class="flex gap-4 text-xs text-blue-300/40">
            <a 
            href="/samakmarket-legal.pdf"
             target="_blank" 
             class="hover:text-blue-300 transition">Conditions d'utilisation</a>
            <a href="#" class="hover:text-blue-300 transition">Confidentialité</a>
            <a href="#" class="hover:text-blue-300 transition">Cookies</a>
          </div>

        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
// Pas de logique dynamique dans le footer
// RouterLink est disponible automatiquement via vue-router
</script>

<style scoped>
/* Fond océan profond, cohérent avec la NavBar */
.footer-ocean {
  background: #0a1628;
  position: relative;
  margin-top: 40px;
}

/* Vague SVG en haut qui raccorde avec la page */
.wave-top {
  line-height: 0;
  margin-bottom: -2px;
}
.wave-top svg {
  width: 100%;
  height: 60px;
  display: block;
}

/* Titre de colonne dans le footer */
.footer-title {
  color: white;
  font-weight: 700;
  font-size: .85rem;
  letter-spacing: .05em;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

/* Liens du footer */
.footer-link {
  display: block;
  color: rgba(147, 197, 253, 0.6);
  font-size: .85rem;
  padding: 3px 0;
  transition: color .2s;
  text-decoration: none;
}
.footer-link:hover {
  color: rgba(147, 197, 253, 1);
}
</style>
