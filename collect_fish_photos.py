"""
=============================================================
collect_fish_photos.py — SamakMarket
Photos poissons 20+ types : marché frais + cuisine
Sources : Unsplash + Wikimedia Commons (libres de droits)
=============================================================
INSTALLER : pip install requests
LANCER    : python collect_fish_photos.py
            (depuis la racine du projet SamakMarket/)
RÉSULTAT  : frontend/public/images/poissons/{type}/
=============================================================
"""

import requests, os, time

DOSSIER = "frontend/public/images/poissons"

# =============================================================
# 20+ TYPES DE POISSONS
# Chaque type a 2 URLs :
#   [0] = photo marché / poisson frais entier
#   [1] = photo cuisine / plat préparé
# Sources : Unsplash (libre commercial) + Wikimedia Commons
# =============================================================
PHOTOS = {

    # ── Poissons ronds ──────────────────────────────────────

    "sardine": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Sardines.jpg/640px-Sardines.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Sardinella_aurita_Sardine.jpg/640px-Sardinella_aurita_Sardine.jpg",
            "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&q=80",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80",
            "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=500&q=80",
        ],
    },

    "thon": {
        "emoji": "🐠",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bluefin-big.jpg/640px-Bluefin-big.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Thunnus_albacares.jpg/640px-Thunnus_albacares.jpg",
            "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=500&q=80",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&q=80",
            "https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80",
        ],
    },

    "merou": {
        "emoji": "🐡",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Epinephelus_marginatus.jpg/640px-Epinephelus_marginatus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Epinephelus_coioides.jpg/640px-Epinephelus_coioides.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
        ],
    },

    "dorade": {
        "emoji": "🐠",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sparus_aurata.jpg/640px-Sparus_aurata.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Dorade_royale_Sparus_aurata.jpg/640px-Dorade_royale_Sparus_aurata.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80",
            "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=500&q=80",
        ],
    },

    "bar": {  # Loup de mer / Bar
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Dicentrarchus_labrax.jpg/640px-Dicentrarchus_labrax.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Striped_bass.jpg/640px-Striped_bass.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=500&q=80",
            "https://images.unsplash.com/photo-1548940740-204726a19be3?w=500&q=80",
        ],
    },

    "rouget": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mullus_surmuletus.jpg/640px-Mullus_surmuletus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mullus_barbatus_Trieste.jpg/640px-Mullus_barbatus_Trieste.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&q=80",
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80",
        ],
    },

    "saumon": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Salmo_salar_GLERL_1.jpg/640px-Salmo_salar_GLERL_1.jpg",
            "https://images.unsplash.com/photo-1601001815894-4bb6c34a3132?w=500&q=80",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=500&q=80",
            "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80",
        ],
    },

    "maquereau": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Scomber_scombrus.jpg/640px-Scomber_scombrus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Makrelen.jpg/640px-Makrelen.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&q=80",
            "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80",
        ],
    },

    "mulet": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mugil_cephalus.jpg/640px-Mugil_cephalus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Chelon_labrosus.jpg/640px-Chelon_labrosus.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
            "https://images.unsplash.com/photo-1548940740-204726a19be3?w=500&q=80",
        ],
    },

    "capitaine": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Caranx_hippos.jpg/640px-Caranx_hippos.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Lates_niloticus.jpg/640px-Lates_niloticus.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&q=80",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80",
        ],
    },

    # ── Fruits de mer ────────────────────────────────────────

    "crevette": {
        "emoji": "🦐",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shrimps.jpg/640px-Shrimps.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Penaeus_monodon_2.jpg/640px-Penaeus_monodon_2.jpg",
            "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&q=80",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80",
            "https://images.unsplash.com/photo-1559742811-822873691df8?w=500&q=80",
        ],
    },

    "homard": {
        "emoji": "🦞",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lobster_USDA_ARS.jpg/640px-Lobster_USDA_ARS.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Palinurus_elephas.jpg/640px-Palinurus_elephas.jpg",
            "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=500&q=80",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=500&q=80",
            "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=500&q=80",
        ],
    },

    "calamar": {
        "emoji": "🦑",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Loligo_vulgaris.jpg/640px-Loligo_vulgaris.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Calamari.jpg/640px-Calamari.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80",
            "https://images.unsplash.com/photo-1602253057119-44d745d9b860?w=500&q=80",
        ],
    },

    "pieuvre": {
        "emoji": "🐙",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Octopus_vulgaris_2.jpg/640px-Octopus_vulgaris_2.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Octopus2.jpg/640px-Octopus2.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=500&q=80",
            "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&q=80",
        ],
    },

    "moule": {
        "emoji": "🦪",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Mussel_hammock.jpg/640px-Mussel_hammock.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mussels_-_types.jpg/640px-Mussels_-_types.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1548940740-204726a19be3?w=500&q=80",
            "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&q=80",
        ],
    },

    "huitre": {
        "emoji": "🦪",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/OysterGrossePierreSarlat.jpg/640px-OysterGrossePierreSarlat.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Oysters_on_the_half_shell.jpg/640px-Oysters_on_the_half_shell.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1606731219412-3b2b5af9d2c7?w=500&q=80",
            "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80",
        ],
    },

    "seiche": {
        "emoji": "🦑",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Cuttlefish_%28Sepia_officinalis%29.jpg/640px-Cuttlefish_%28Sepia_officinalis%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Sepia_apama_2.jpg/640px-Sepia_apama_2.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80",
            "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80",
        ],
    },

    "langouste": {
        "emoji": "🦞",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Palinurus_elephas_Banyuls.jpg/640px-Palinurus_elephas_Banyuls.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Langouste_commune.jpg/640px-Langouste_commune.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=500&q=80",
            "https://images.unsplash.com/photo-1548940740-204726a19be3?w=500&q=80",
        ],
    },

    "palourde": {
        "emoji": "🦪",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Clams_casino.jpg/640px-Clams_casino.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Venerupis_corrugata.jpg/640px-Venerupis_corrugata.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&q=80",
            "https://images.unsplash.com/photo-1548940740-204726a19be3?w=500&q=80",
        ],
    },

    # ── Poissons plats ────────────────────────────────────────

    "sole": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solea_solea_1.jpg/640px-Solea_solea_1.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Solea_vulgaris.jpg/640px-Solea_vulgaris.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
        ],
    },

    "turbot": {
        "emoji": "🐟",
        "marche": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Scophthalmus_maximus.jpg/640px-Scophthalmus_maximus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Psetta_maxima_Luc_Viatour.jpg/640px-Psetta_maxima_Luc_Viatour.jpg",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80",
            "https://images.unsplash.com/photo-1548940740-204726a19be3?w=500&q=80",
        ],
    },

    # ── Image générique ──────────────────────────────────────
    "default": {
        "emoji": "🐟",
        "marche": [
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
            "https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=500&q=80",
        ],
        "cuisine": [
            "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80",
            "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=500&q=80",
        ],
    },
}

# =============================================================
# TÉLÉCHARGEMENT
# =============================================================
def dl(url, chemin):
    try:
        r = requests.get(url, timeout=15, headers={
            "User-Agent": "SamakMarket/1.0",
            "Referer":    "https://unsplash.com",
        })
        r.raise_for_status()
        if "image" not in r.headers.get("Content-Type",""):
            return False
        with open(chemin, "wb") as f: f.write(r.content)
        print(f"   ✅ {os.path.basename(chemin)} ({len(r.content)//1024}KB)")
        return True
    except Exception as e:
        print(f"   ❌ {os.path.basename(chemin)} — {e}")
        return False

# =============================================================
# MAIN
# =============================================================
total = 0
mapping_vue = {}  # Pour générer le code Vue automatiquement

print("="*55)
print("🐟 SamakMarket — 20+ types de poissons")
print("   Marché frais + Cuisine · Libres de droits")
print("="*55)

for cat, config in PHOTOS.items():
    emoji = config["emoji"]
    print(f"\n{emoji} {cat.upper()}")

    # Dossier pour ce type
    dossier_marche  = os.path.join(DOSSIER, cat, "marche")
    dossier_cuisine = os.path.join(DOSSIER, cat, "cuisine")
    os.makedirs(dossier_marche,  exist_ok=True)
    os.makedirs(dossier_cuisine, exist_ok=True)

    premiere_marche  = None
    premiere_cuisine = None

    # Photos marché
    for i, url in enumerate(config["marche"], 1):
        nom    = f"marche_{i}.jpg"
        chemin = os.path.join(dossier_marche, nom)
        url_locale = f"/images/poissons/{cat}/marche/{nom}"
        if os.path.exists(chemin):
            print(f"   ⏭️  {nom}")
            if not premiere_marche: premiere_marche = url_locale
            total += 1
            continue
        if dl(url, chemin):
            if not premiere_marche: premiere_marche = url_locale
            total += 1
        time.sleep(0.3)

    # Photos cuisine
    for i, url in enumerate(config["cuisine"], 1):
        nom    = f"cuisine_{i}.jpg"
        chemin = os.path.join(dossier_cuisine, nom)
        url_locale = f"/images/poissons/{cat}/cuisine/{nom}"
        if os.path.exists(chemin):
            print(f"   ⏭️  {nom}")
            if not premiere_cuisine: premiere_cuisine = url_locale
            total += 1
            continue
        if dl(url, chemin):
            if not premiere_cuisine: premiere_cuisine = url_locale
            total += 1
        time.sleep(0.3)

    mapping_vue[cat] = {
        "marche":  premiere_marche  or "",
        "cuisine": premiere_cuisine or "",
    }

# =============================================================
# AFFICHER LE CODE VUE À COPIER
# =============================================================
print(f"\n{'='*55}")
print(f"✅ {total} photos dans {DOSSIER}/")
print(f"{'='*55}")

# Générer le code photosDefaut automatiquement
lignes = []
for cat, urls in mapping_vue.items():
    nom_vue = cat.capitalize()
    lignes.append(f"  '{nom_vue}': '{urls['marche']}',")

print("""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 COPIE CE CODE dans ProductCard.vue <script setup>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Photo par défaut selon la catégorie (marché frais)
const photosDefaut = {""")
for l in lignes:
    print(l)
print("""}

// Si pas de photo vendeur → photo par défaut catégorie
const imageAffichee = computed(() =>
  props.produit.images?.[0] ||
  photosDefaut[props.produit.category] ||
  '/images/poissons/default/marche/marche_1.jpg'
)

// Dans le <template>, zone image :
// <img :src="imageAffichee" :alt="produit.name" class="w-full h-full object-cover" />
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")
