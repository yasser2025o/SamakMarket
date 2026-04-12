const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // On stocke dans le dossier 'uploads' que tu as déjà dans ton arborescence
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // On récupère le vendeur_id depuis l'auth et on génère un timestamp pour le produit
    // Format : vendeurID-timestamp.jpg
    const vendeurId = req.user.id; 
    const uniqueSuffix = Date.now();
    cb(null, `${vendeurId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 2 } // Limite à 2Mo max par sécurité
});

module.exports = upload;