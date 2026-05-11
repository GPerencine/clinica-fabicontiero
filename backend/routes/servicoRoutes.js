const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('node:path');
const servicoController = require('../controllers/servicoController');
const verificarToken = require('../middleware/authMiddleware');

// Tipos de imagem permitidos (previne upload de arquivos maliciosos)
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Sanitiza a extensão para garantir que seja segura
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  }
});

// fileFilter: rejeita qualquer arquivo que não seja imagem válida
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Use JPEG, PNG ou WebP.`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

router.get('/', servicoController.listarServicos);

// Rota unificada para Criar/Editar
router.post('/', verificarToken, upload.single('imagem'), (req, res, next) => {
  if (req.body.id) {
    return servicoController.atualizarServico(req, res, next);
  }
  return servicoController.criarServico(req, res, next);
});

router.delete('/:id', verificarToken, servicoController.deletarServico);

module.exports = router;
