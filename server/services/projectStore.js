// server/services/projectStore.js
'use strict';

const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'projects.json');

async function ensureStore() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readAll() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeAll(list) {
  const tmp = DATA_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE); // атомарная запись
}

// Нормализуем относительные URL вида "/uploads/covers/xxx.jpg"
function normalizeRel(p) {
  if (!p) return null;
  const safe = '/' + String(p).replace(/\\/g, '/').replace(/^\/+/, '');
  if (safe.includes('..')) return null; // защита от выхода из каталога
  return safe;
}

module.exports = {
  async list() {
    const all = await readAll();
    // сортировка: сначала по year убыв., потом по createdAt убыв.
    return all.sort((a, b) => {
      const byYear = (b.year || 0) - (a.year || 0);
      if (byYear) return byYear;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  },

  async get(id) {
    const all = await readAll();
    return all.find(p => p.id === id) || null;
  },

  async create({ title, description = '', category, year, coverImage, galleryImages, tags }) {
    const all = await readAll();
    const now = new Date().toISOString();

    const item = {
      id: randomUUID(),
      title: String(title || '').trim(),
      description: String(description || ''),
      category: category ?? null,
      year: year == null ? null : (typeof year === 'string' ? parseInt(year) : year),
      coverImage: normalizeRel(coverImage),
      galleryImages: Array.isArray(galleryImages)
        ? galleryImages.map(normalizeRel).filter(Boolean)
        : [],
      tags: Array.isArray(tags) ? tags.slice(0, 50) : [],
      createdAt: now,
      updatedAt: now
    };

    all.push(item);
    await writeAll(all);
    return item;
  },

  async update(id, patch) {
    const all = await readAll();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const prev = all[idx];
    const next = {
      ...prev,
      ...patch,
      year: patch.year !== undefined
        ? (typeof patch.year === 'string' ? parseInt(patch.year) : patch.year)
        : prev.year,
      coverImage: patch.coverImage !== undefined
        ? normalizeRel(patch.coverImage)
        : prev.coverImage,
      galleryImages: patch.galleryImages !== undefined
        ? (Array.isArray(patch.galleryImages)
            ? patch.galleryImages.map(normalizeRel).filter(Boolean)
            : prev.galleryImages)
        : prev.galleryImages,
      tags: patch.tags !== undefined
        ? (Array.isArray(patch.tags) ? patch.tags.slice(0,50) : prev.tags)
        : prev.tags,
      updatedAt: new Date().toISOString()
    };

    all[idx] = next;
    await writeAll(all);
    return next;
  },

  async remove(id) {
    const all = await readAll();
    const next = all.filter(p => p.id !== id);
    if (next.length === all.length) return false;
    await writeAll(next);
    return true;
  }
};
