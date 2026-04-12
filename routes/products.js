const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isSeller } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- 1. ROUTES STATIQUES (Toujours en premier) ---
router.get('/promos', productController.getPromos);
router.get('/count-by-city', productController.getCountByCity);
// Cette ligne DOIT être avant /:id
router.get('/mine', auth, isSeller, productController.getMyProducts); 
router.get('/', productController.getAllProducts);

// --- 2. ROUTES DE CRÉATION/MODIF (Avec images) ---
router.post('/', auth, upload.single('image'), productController.createProduct);
router.put('/:id', auth, upload.single('image'), productController.updateProduct);

// --- 3. ROUTES DYNAMIQUES (Toujours en dernier) ---
router.get('/:id', productController.getProduct);
router.delete('/:id', auth, isSeller, productController.deleteProduct);
router.patch('/:id', auth, productController.updateProduct)
module.exports = router;