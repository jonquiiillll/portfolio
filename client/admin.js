// admin.js

// ====================== Создание проекта ======================
document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const hidden = document.getElementById('existingGallery');
  if (hidden) hidden.value = JSON.stringify(currentGallery);
  const formData = new FormData(form);

  // если обложка была обрезана кроппером
  if (createCoverBlob) {
    formData.set('coverImage', createCoverBlob, 'cover.jpg');
  }

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      alert('Проект успешно добавлен!');
      form.reset();
      createCoverBlob = null;
      loadProjects();
      document.getElementById('createModal').style.display = 'none';
    } else {
      alert('Ошибка: ' + (data.error || 'Не удалось добавить проект'));
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    alert('Произошла ошибка при отправке запроса');
  }
});

// ====================== Галерея ======================
let currentGallery = [];

// ... (оставил renderGalleryThumbs как был у тебя, он рабочий)

// ====================== Загрузка проектов ======================
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    const list = document.getElementById('projectsList');
    list.innerHTML = '';

    projects.forEach(project => {
      const div = document.createElement('div');
      div.className = 'admin-project';

      div.innerHTML = `
        <div class="left_part">
          <img src="${project.coverImage}" alt="${project.title}" />
          <div class="text_project">
            <strong>${project.title}</strong><br>
            <small>${project.year || ''} — ${project.category || ''}</small>
          </div>
        </div>
        <div class="right_part">
          <button data-id="${project.id}" class="edit-btn">✏️ Редактировать</button>
          <button data-id="${project.id}" class="delete-btn">🗑 Удалить</button>
        </div>
      `;
      list.appendChild(div);
    });

    // Удаление
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Удалить проект?')) {
          const res = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (res.ok) loadProjects();
          else alert('Ошибка при удалении проекта');
        }
      });
    });

    // Редактирование
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) return alert('Ошибка загрузки проекта');
        const project = await res.json();

        document.getElementById('edit-id').value = project.id;
        document.getElementById('edit-title').value = project.title || '';
        document.getElementById('edit-description').value = project.description || '';
        document.getElementById('edit-year').value = project.year || '';

        // категория
        document.getElementById('edit-category-hidden').value = project.category || '';

        currentGallery = Array.isArray(project.galleryImages) ? [...project.galleryImages] : [];
        renderGalleryThumbs();

        document.getElementById('editModal').style.display = 'flex';
        document.body.classList.add('modal-open');
      });
    });
  } catch (err) {
    console.error('Ошибка загрузки проектов:', err);
  }
}

// ====================== Редактирование проекта ======================
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const form = e.target;
  const formData = new FormData(form);

  if (editCoverBlob) {
    formData.set('coverImage', editCoverBlob, 'cover.jpg');
  }

  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    if (res.ok) {
      alert('Проект обновлён');
      closeEditModal();
      editCoverBlob = null;
      loadProjects();
    } else {
      alert('Ошибка при обновлении проекта');
    }
  } catch (err) {
    console.error('Ошибка редактирования:', err);
  }
});

// ====================== Модалки ======================
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  document.body.classList.remove('modal-open');
  currentGallery = [];
}

document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target && e.target.id === 'editModal') closeEditModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('editModal').style.display !== 'none') {
    closeEditModal();
  }
});

// ====================== Сессия ======================
async function checkSession() {
  const res = await fetch('/api/checkSession', { credentials: 'include' });
  const data = await res.json();

  const loginForm = document.getElementById('loginForm');
  const createBar = document.getElementById('createBar');
  const logoutContainer = document.getElementById('logoutContainer');
  const projectsTitle = document.getElementById('projectsTitle');

  if (data.sessionExists) {
    loginForm.style.display = 'none';
    createBar.style.display = 'block';
    logoutContainer.style.display = 'block';
    projectsTitle.style.display = 'block';
    loadProjects();
  } else {
    loginForm.style.display = 'block';
    createBar.style.display = 'none';
    logoutContainer.style.display = 'none';
    projectsTitle.style.display = 'none';
    document.getElementById('projectsList').innerHTML = '';
  }
}

// Логин
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok && data.ok) await checkSession();
  else alert('Ошибка входа');
});

// Логаут
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  await checkSession();
});

window.addEventListener('DOMContentLoaded', checkSession);

// ====================== Кроппер ======================
const cropModal = document.getElementById('cropModal');
const cropImg = document.getElementById('cropImage');
const cropSave = document.getElementById('cropSave');
const cropCancel = document.getElementById('cropCancel');
const closeCropModal = document.getElementById('closeCropModal');

let cropper = null;
let cropContext = null;
let createCoverBlob = null;
let editCoverBlob = null;

function openCropper(file, context) {
  cropContext = context;
  const url = URL.createObjectURL(file);
  cropImg.src = url;
  if (cropper) cropper.destroy();
  cropper = new window.Cropper(cropImg, { aspectRatio: 3 / 4, viewMode: 1, autoCropArea: 1 });
  cropModal.style.display = 'flex';
  document.body.classList.add('modal-open');
}

function closeCrop() {
  cropModal.style.display = 'none';
  document.body.classList.remove('modal-open');
  if (cropper) { cropper.destroy(); cropper = null; }
  cropImg.src = '';
}

cropCancel?.addEventListener('click', closeCrop);
closeCropModal?.addEventListener('click', closeCrop);
cropSave?.addEventListener('click', () => {
  if (!cropper) return closeCrop();
  cropper.getCroppedCanvas().toBlob((blob) => {
    if (!blob) return closeCrop();
    if (cropContext === 'create') createCoverBlob = blob;
    else editCoverBlob = blob;
    closeCrop();
  }, 'image/jpeg', 0.92);
});

// Кнопки кропера
document.getElementById('createCropBtn')?.addEventListener('click', () => {
  const f = document.getElementById('createCoverInput')?.files?.[0];
  if (!f) return alert('Сначала выберите обложку');
  openCropper(f, 'create');
});
document.getElementById('editCropBtn')?.addEventListener('click', () => {
  const f = document.getElementById('editCoverInput')?.files?.[0];
  if (!f) return alert('Нет изображения для обрезки');
  openCropper(f, 'edit');
});
