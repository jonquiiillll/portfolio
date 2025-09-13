// 📄 project.js

async function loadProject() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    document.querySelector('.project-container').innerHTML = '<p>❌ Проект не найден</p>';
    return;
  }

  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) {
      document.querySelector('.project-container').innerHTML = '<p>❌ Ошибка загрузки проекта</p>';
      return;
    }
    const project = await res.json();

    // Заполняем данные
    document.getElementById('title').textContent = project.title || 'Без названия';
    document.getElementById('description').textContent = project.description || '';

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    (project.galleryImages || []).forEach((src, idx) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = project.title || `Изображение ${idx + 1}`;
      img.className = 'gallery-image';
      img.addEventListener('click', () => openLightbox(idx, project.galleryImages));
      gallery.appendChild(img);
    });

    // сохраняем текущие картинки для лайтбокса
    window._galleryImages = project.galleryImages || [];
    window._currentIndex = 0;
  } catch (err) {
    console.error('Ошибка загрузки проекта:', err);
  }
}

function openLightbox(index, images) {
  window._currentIndex = index;
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-image');
  img.src = images[index];
  lightbox.style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}

function navigateLightbox(dir) {
  if (!window._galleryImages || window._galleryImages.length === 0) return;
  window._currentIndex =
    (window._currentIndex + dir + window._galleryImages.length) % window._galleryImages.length;
  document.getElementById('lightbox-image').src = window._galleryImages[window._currentIndex];
}

// для стрелок под галереей
function scrollGallery(dir) {
  const container = document.getElementById('gallery');
  container.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

window.addEventListener('DOMContentLoaded', loadProject);

// экспортируем функции в глобал, чтобы кнопки из HTML их видели
window.closeLightbox = closeLightbox;
window.navigateLightbox = navigateLightbox;
window.scrollGallery = scrollGallery;
