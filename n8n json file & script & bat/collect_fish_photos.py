"""
collect_fish_photos.py — Photos poissons pour SamakMarket
Sources : Unsplash + Wikimedia Commons (libres de droits)
INSTALLER : pip install requests
LANCER    : python collect_fish_photos.py
"""

import requests, os, time

DOSSIER = "frontend/public/images/poissons"

PHOTOS = {
    "sardine": [
        "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Sardines.jpg/640px-Sardines.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Sardinella_aurita_Sardine.jpg/640px-Sardinella_aurita_Sardine.jpg",
    ],
    "thon": [
        "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=500&q=80",
        "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&q=80",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bluefin-big.jpg/640px-Bluefin-big.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Thunnus_albacares.jpg/640px-Thunnus_albacares.jpg",
    ],
    "crevette": [
        "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&q=80",
        "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shrimps.jpg/640px-Shrimps.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Penaeus_monodon_2.jpg/640px-Penaeus_monodon_2.jpg",
    ],
    "merou": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Epinephelus_marginatus.jpg/640px-Epinephelus_marginatus.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Mero_Atlántico.jpg/640px-Mero_Atl%C3%A1ntico.jpg",
        "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
    ],
    "homard": [
        "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=500&q=80",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lobster_USDA_ARS.jpg/640px-Lobster_USDA_ARS.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Lobster_0907.jpg/640px-Lobster_0907.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Palinurus_elephas.jpg/640px-Palinurus_elephas.jpg",
    ],
    "capitaine": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Caranx_hippos.jpg/640px-Caranx_hippos.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Caranx_sexfasciatus_1.jpg/640px-Caranx_sexfasciatus_1.jpg",
        "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&q=80",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80",
    ],
    "dorade": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sparus_aurata.jpg/640px-Sparus_aurata.jpg",
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80",
        "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=500&q=80",
    ],
    "calamar": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Loligo_vulgaris.jpg/640px-Loligo_vulgaris.jpg",
        "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80",
        "https://images.unsplash.com/photo-1602253057119-44d745d9b860?w=500&q=80",
    ],
    "default": [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
        "https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=500&q=80",
    ],
}

def telecharger(url, chemin):
    try:
        r = requests.get(url, timeout=15, headers={
            "User-Agent": "SamakMarket/1.0",
            "Referer": "https://unsplash.com",
        })
        r.raise_for_status()
        if "image" not in r.headers.get("Content-Type",""):
            return False
        with open(chemin,"wb") as f: f.write(r.content)
        print(f"   ✅ {os.path.basename(chemin)} ({len(r.content)//1024}KB)")
        return True
    except Exception as e:
        print(f"   ❌ {os.path.basename(chemin)} — {e}")
        return False

emojis = {"sardine":"🐟","thon":"🐠","crevette":"🦐","merou":"🐡",
          "homard":"🦞","capitaine":"🐟","dorade":"🐠","calamar":"🦑","default":"🌊"}

total = 0
print("="*50)
print("🐟 SamakMarket — Collecte photos poissons")
print("="*50)

for cat, urls in PHOTOS.items():
    print(f"\n{emojis.get(cat,'🐟')} {cat.upper()}")
    os.makedirs(os.path.join(DOSSIER, cat), exist_ok=True)
    for i, url in enumerate(urls, 1):
        nom    = f"{cat}_{i}.jpg"
        chemin = os.path.join(DOSSIER, cat, nom)
        if os.path.exists(chemin):
            print(f"   ⏭️  {nom} (déjà présent)")
            total += 1
            continue
        if telecharger(url, chemin): total += 1
        time.sleep(0.3)

print(f"\n{'='*50}")
print(f"✅ {total} photos dans {DOSSIER}/")
print(f"{'='*50}")
print("""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE À AJOUTER dans ProductCard.vue <script setup>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const photosDefaut = {
  'Sardine':   '/images/poissons/sardine/sardine_1.jpg',
  'Thon':      '/images/poissons/thon/thon_1.jpg',
  'Crevette':  '/images/poissons/crevette/crevette_1.jpg',
  'Mérou':     '/images/poissons/merou/merou_1.jpg',
  'Homard':    '/images/poissons/homard/homard_1.jpg',
  'Capitaine': '/images/poissons/capitaine/capitaine_1.jpg',
  'Dorade':    '/images/poissons/dorade/dorade_1.jpg',
  'Calamar':   '/images/poissons/calamar/calamar_1.jpg',
}

const imageAffichee = computed(() =>
  props.produit.images?.[0] ||
  photosDefaut[props.produit.category] ||
  null
)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""")
