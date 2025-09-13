// server/routes/projects.js
'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const store = require('../services/projectStore');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

const coversDir = path.join(__dirname, '..', 'uploads', 'covers');
const galleryDir = path.join(__dirname, '..', 'uploads', 'gallery');

[coversDir, galleryDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') cb(null, coversDir);
    else if (file.fieldname === 'galleryImages') cb(null, galleryDir);
    else cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

const upload = multer({ storage });

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let projects = await store.list();
    if (category && category !== 'все') {
      projects = projects.filter(p => p.category === category);
    }
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await store.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении проекта' });
  }
});

// POST /api/projects
router.post('/', auth, upload.any(), async (req, res) => {
  try {
    const { title, description = '', category, year } = req.body;

    const cover = req.files.find(f => f.fieldname === 'coverImage');
    const gallery = req.files.filter(f => f.fieldname === 'galleryImages');

    const newProject = await store.create({
      title,
      description,
      category,
      year,
      coverImage: cover ? `/uploads/covers/${cover.filename}` : null,
      galleryImages: gallery.map(f => `/uploads/gallery/${f.filename}`)
    });

    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании проекта' });
  }
});

// PUT /api/projects/:id
router.put('/:id', auth, upload.any(), async (req, res) => {
  try {
    const { title, description = '', category, year, existingGallery } = req.body;

    const cover = req.files.find(f => f.fieldname === 'coverImage');
    const gallery = req.files.filter(f => f.fieldname === 'galleryImages');

    const existing = existingGallery ? JSON.parse(existingGallery) : [];
    const newGallery = gallery.map(f => `/uploads/gallery/${f.filename}`);

    const updated = await store.update(req.params.id, {
      title,
      description,
      category,
      year,
      coverImage: cover ? `/uploads/covers/${cover.filename}` : undefined,
      galleryImages: [...existing, ...newGallery]
    });

    if (!updated) return res.status(404).json({ message: 'Проект не найден' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении проекта' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await store.get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Проект не найден' });

    // удалить файлы изображений
    const files = [existing.coverImage, ...(existing.galleryImages || [])].filter(Boolean);
    for (const rel of files) {
      const abs = path.join(__dirname, '..', rel);
      fs.existsSync(abs) && fs.unlink(abs, () => {});
    }

    const ok = await store.remove(req.params.id);
    res.json({ ok });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении проекта' });
  }
});

module.exports = router;
