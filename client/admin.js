// admin.js

let currentGallery = [];           // URLs существующих картинок в редактировании
let createGalleryFiles = [];       // новые файлы в создании
let editNewGalleryFiles = [];      // новые файлы при редактировании

let createCoverBlob = null;
let editCoverBlob = null;

let isSubmittingCreate = false;

// -------------------- helpers: пути/сериализация --------------------
function normalizeImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/uploads/')) return img;
  // считаем, что это имя файла галереи
  return '/uploads/gallery/' + img.replace(/^\/+/, '');
}

function normalizeGallery(list) {
  return Array.isArray(list) ? list.map(normalizeImageUrl) : [];
}

// Превращаем URL обратно в имя файла для сервера (/uploads/gallery/xxx.jpg -> xxx.jpg)
function toFilenames(urls) {
  return (urls || []).map(u => {
    const m = u.match(/\/uploads\/gallery\/(.+)$/);
    return m ? m[1] : u;
  });
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

// -------------------- сеть/авторизация --------------------
async function postJSONToAny(urls, body) {
  let lastErr;
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (r.ok) return r;
    } catch (e) { lastErr = e; }
  }
  if (lastErr) throw lastErr;
  return new Response(null, { status: 500 });
}

async function checkSession() {
  try {
    const r = await fetch('/api/checkSession', { credentials: 'include' });
    if (r.ok) {
      const data = await r.json();
      toggleUI(Boolean(data.sessionExists));
      if (data.sessionExists) loadProjects();
      return;
    }
  } catch (_) {}

  try {
    const probe = await fetch('/api/projects', { credentials: 'include' });
    toggleUI(probe.ok);
    if (probe.ok) loadProjects();
  } catch (e) {
    console.error('checkSession error:', e);
    toggleUI(false);
  }
}

function toggleUI(isAuthed) {
  const loginForm = document.getElementById('loginForm');
  const createBar = document.getElementById('createBar');
  const logoutContainer = document.getElementById('logoutContainer');
  const projectsTitle = document.getElementById('projectsTitle');

  loginForm.style.display = isAuthed ? 'none' : 'block';
  createBar.style.display = isAuthed ? 'block' : 'none';
  logoutContainer.style.display = isAuthed ? 'block' : 'none';
  projectsTitle.style.display = isAuthed ? 'block' : 'none';

  if (!isAuthed) {
    document.getElementById('projectsList').innerHTML = '';
  }
}

// -------------------- превью обложки --------------------
function previewCover(inputId, previewId, clearBlobCb) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    clearBlobCb?.();
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    } else {
      preview.src = '';
      preview.style.display = 'none';
    }
  });
}

// -------------------- модалки --------------------
function openCreateModal() {
  document.getElementById('createModal').style.display = 'flex';
  document.body.classList.add('modal-open');
}
function closeCreateModal() {
  document.getElementById('createModal').style.display = 'none';
  document.body.classList.remove('modal-open');
}
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  document.body.classList.remove('modal-open');
  currentGallery = [];
  editNewGalleryFiles = [];
  editCoverBlob = null;
  document.getElementById('editNewGalleryThumbs').innerHTML = '';
}
function wireModalBasics() {
  document.getElementById('openCreateModal')?.addEventListener('click', openCreateModal);
  document.getElementById('closeCreateModal')?.addEventListener('click', closeCreateModal);

  document.getElementById('closeEditModal')?.addEventListener('click', closeEditModal);
  document.getElementById('editModal')?.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'editModal') closeEditModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const em = document.getElementById('editModal');
    const cm = document.getElementById('createModal');
    if (em && getComputedStyle(em).display !== 'none') closeEditModal();
    if (cm && getComputedStyle(cm).display !== 'none') closeCreateModal();
  });
}

// -------------------- dropzones --------------------
function wireDropzone(dropzoneId, inputId) {
  const dz = document.getElementById(dropzoneId);
  const input = document.getElementById(inputId);
  if (!dz || !input) return;

  dz.querySelector('.dz-browse')?.addEventListener('click', () => input.click());

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); })
  );
  ['dragenter', 'dragover'].forEach(ev =>
    dz.addEventListener(ev, () => dz.classList.add('is-dragover'))
  );
  ['dragleave', 'drop'].forEach(ev =>
    dz.addEventListener(ev, () => dz.classList.remove('is-dragover'))
  );

  dz.addEventListener('drop', (e) => {
    if (!e.dataTransfer?.files?.length) return;
    const newFiles = Array.from(e.dataTransfer.files);
    if (input.multiple) {
      const all = [...Array.from(input.files || []), ...newFiles];
      const dt = new DataTransfer();
      all.forEach(f => dt.items.add(f));
      input.files = dt.files;
    } else {
      input.files = newFiles;
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// -------------------- кроппер --------------------
const cropModal = document.getElementById('cropModal');
const cropImg = document.getElementById('cropImage');
const cropSave = document.getElementById('cropSave');
const cropCancel = document.getElementById('cropCancel');
const closeCropModal = document.getElementById('closeCropModal');

let cropper = null;
let cropContext = null;

function openCropper(file, context, previewId) {
  cropContext = { context, previewId };
  if (cropper) { cropper.destroy(); cropper = null; }
  cropImg.onload = () => {
    cropper = new window.Cropper(cropImg, {
      aspectRatio: 3 / 4,
      viewMode: 1,
      autoCropArea: 1
    });
  };
  cropImg.src = URL.createObjectURL(file);
  cropModal.style.display = 'flex';
  document.body.classList.add('modal-open');
}
function closeCrop() {
  cropModal.style.display = 'none';
  document.body.classList.remove('modal-open');
  if (cropper) { cropper.destroy(); cropper = null; }
  cropImg.src = '';
  cropImg.onload = null;
}
cropCancel?.addEventListener('click', closeCrop);
closeCropModal?.addEventListener('click', closeCrop);
cropSave?.addEventListener('click', () => {
  if (!cropper) return closeCrop();
  cropper.getCroppedCanvas().toBlob((blob) => {
    if (!blob) return closeCrop();
    if (cropContext.context === 'create') createCoverBlob = blob;
    else editCoverBlob = blob;

    const preview = document.getElementById(cropContext.previewId);
    if (preview) {
      preview.src = URL.createObjectURL(blob);
      preview.style.display = 'block';
    }
    closeCrop();
  }, 'image/jpeg', 0.92);
});

// -------------------- ГАЛЕРЕЯ: рендер + удаление + dnd reorder --------------------
function updateExistingGalleryField() {
  const hidden = document.getElementById('existingGallery');
  if (hidden) hidden.value = JSON.stringify(toFilenames(currentGallery));
}

function renderEditGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  currentGallery.forEach((src, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'gallery-thumb';
    thumb.setAttribute('draggable', 'true');
    thumb.dataset.index = index;

    const img = document.createElement('img');
    img.src = normalizeImageUrl(src);
    thumb.appendChild(img);

    const removeBtn = document.createElement('span');
    removeBtn.className = 'remove-thumb';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentGallery.splice(index, 1);
      renderEditGallery(containerId);
      updateExistingGalleryField();
    });
    thumb.appendChild(removeBtn);

    thumb.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('fromIndex', index);
    });
    thumb.addEventListener('dragover', (e) => {
      e.preventDefault();
      thumb.classList.add('drag-over');
    });
    thumb.addEventListener('dragleave', () => {
      thumb.classList.remove('drag-over');
    });
    thumb.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData('fromIndex'));
      const to = index;
      if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;
      const [moved] = currentGallery.splice(from, 1);
      currentGallery.splice(to, 0, moved);
      renderEditGallery(containerId);
      updateExistingGalleryField();
    });

    container.appendChild(thumb);
  });
}

// -------------------- Загрузка проектов + открытие редактирования --------------------
async function loadProjects() {
  try {
    const res = await fetch('/api/projects', { credentials: 'include' });
    if (!res.ok) throw new Error('Не удалось получить проекты');
    const projects = await res.json();
    const list = document.getElementById('projectsList');
    list.innerHTML = '';

    projects.forEach(project => {
      const id = project.id || project._id;
      const div = document.createElement('div');
      div.className = 'admin-project';

      const cat = project.category || '';
      const yr = project.year || '';
      const title = project.title || '';
      const cover = project.coverImage || '';

      div.innerHTML = `
        <div class="left_part">
          <img src="${cover}" alt="${title}" />
          <div class="text_project">
            <strong>${title}</strong><br>
            <small>${yr} ${cat ? '— ' + cat : ''}</small>
          </div>
        </div>
        <div class="right_part">
          <button data-id="${id}" class="edit-btn">✏️ Редактировать</button>
          <button data-id="${id}" class="delete-btn">🗑 Удалить</button>
        </div>
      `;
      list.appendChild(div);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!id) return;
        if (!confirm('Удалить проект?')) return;
        const r = await fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) loadProjects();
        else alert('Ошибка при удалении проекта');
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const r = await fetch(`/api/projects/${id}`, { credentials: 'include' });
        if (!r.ok) return alert('Ошибка загрузки проекта');
        const project = await r.json();

        document.getElementById('edit-id').value = project.id || project._id || '';
        document.getElementById('edit-title').value = project.title || '';
        document.getElementById('edit-description').value = project.description || '';
        document.getElementById('edit-year').value = project.year || '';

        const sel = document.getElementById('edit-category');
        sel.value = project.category || '';

        const preview = document.getElementById('editCoverPreview');
        preview.src = project.coverImage || '';
        preview.style.display = project.coverImage ? 'block' : 'none';

        currentGallery = normalizeGallery(project.galleryImages);
        renderEditGallery('galleryThumbs');
        updateExistingGalleryField();

        document.getElementById('editNewGalleryThumbs').innerHTML = '';

        document.getElementById('editModal').style.display = 'flex';
        document.body.classList.add('modal-open');
      });
    });
  } catch (err) {
    console.error('Ошибка загрузки проектов:', err);
  }
}

// -------------------- Создание проекта --------------------
function wireCreateForm() {
  const form = document.getElementById('createForm');
  const coverInput = document.getElementById('createCoverInput');

  previewCover('createCoverInput', 'createCoverPreview', () => { createCoverBlob = null; });

  wireDropzone('createCoverDropzone', 'createCoverInput');
  wireDropzone('createGalleryDropzone', 'createGalleryInput');

  document.getElementById('createGalleryInput')?.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files || []);
    createGalleryFiles = [...createGalleryFiles, ...newFiles];
    renderGalleryThumbs('createGalleryThumbs', createGalleryFiles, (idx) => {
      createGalleryFiles.splice(idx, 1);
      renderGalleryThumbs('createGalleryThumbs', createGalleryFiles, arguments.callee);
    });
    e.target.value = "";
  });

  document.getElementById('createCropBtn')?.addEventListener('click', () => {
    const f = coverInput?.files?.[0];
    if (!f) return alert('Сначала выберите обложку');
    openCropper(f, 'create', 'createCoverPreview');
  });

  document.getElementById('createReset')?.addEventListener('click', () => {
    form.reset();
    createCoverBlob = null;
    createGalleryFiles = [];
    document.getElementById('createCoverPreview').style.display = 'none';
    document.getElementById('createGalleryThumbs').innerHTML = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmittingCreate) return;
    isSubmittingCreate = true;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const sel = document.getElementById('create-category');
    if (!sel.value) {
      sel.reportValidity();
      isSubmittingCreate = false;
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const formData = new FormData(form);
    if (createCoverBlob) formData.set('coverImage', createCoverBlob, 'cover.jpg');
    for (const f of createGalleryFiles) formData.append('galleryImages', f);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        alert('Проект успешно добавлен!');
        form.reset();
        createCoverBlob = null;
        createGalleryFiles = [];
        document.getElementById('createCoverPreview').style.display = 'none';
        document.getElementById('createGalleryThumbs').innerHTML = '';
        closeCreateModal();
        loadProjects();
      } else {
        const data = await safeJson(response);
        alert('Ошибка: ' + (data?.error || 'Не удалось добавить проект'));
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
      alert('Произошла ошибка при отправке запроса');
    } finally {
      isSubmittingCreate = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// вспомогательная для превью галереи при создании
function renderGalleryThumbs(containerId, files, onRemove) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  files.forEach((file, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-thumb';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    wrap.appendChild(img);

    const rm = document.createElement('span');
    rm.className = 'remove-thumb';
    rm.textContent = '×';
    rm.addEventListener('click', () => {
      onRemove(i);
    });
    wrap.appendChild(rm);

    container.appendChild(wrap);
  });
}

// -------------------- Редактирование проекта --------------------
function wireEditForm() {
  const form = document.getElementById('editForm');
  const coverInput = document.getElementById('editCoverInput');

  previewCover('editCoverInput', 'editCoverPreview', () => { editCoverBlob = null; });

  wireDropzone('editCoverDropzone', 'editCoverInput');
  wireDropzone('editGalleryDropzone', 'editGalleryInput');

  document.getElementById('editGalleryInput')?.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files || []);
    editNewGalleryFiles = [...editNewGalleryFiles, ...newFiles];
    const container = document.getElementById('editNewGalleryThumbs');
    container.innerHTML = '';

    editNewGalleryFiles.forEach((file, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'gallery-thumb';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      wrap.appendChild(img);

      const rm = document.createElement('span');
      rm.className = 'remove-thumb';
      rm.textContent = '×';
      rm.addEventListener('click', () => {
        editNewGalleryFiles.splice(i, 1);
        const dt = new DataTransfer();
        editNewGalleryFiles.forEach(f => dt.items.add(f));
        const input = document.getElementById('editGalleryInput');
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      wrap.appendChild(rm);

      container.appendChild(wrap);
    });
    e.target.value = "";
  });

  document.getElementById('editCropBtn')?.addEventListener('click', () => {
    const f = coverInput?.files?.[0];
    if (!f) return alert('Нет изображения для обрезки');
    openCropper(f, 'edit', 'editCoverPreview');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    if (!id) return;

    updateExistingGalleryField();

    const formData = new FormData(form);
    if (editCoverBlob) formData.set('coverImage', editCoverBlob, 'cover.jpg');
    for (const f of editNewGalleryFiles) formData.append('galleryImages', f);

    try {
      const r = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });
      if (r.ok) {
        alert('Проект обновлён');
        closeEditModal();
        loadProjects();
      } else {
        const data = await safeJson(r);
        alert('Ошибка при обновлении проекта: ' + (data?.error || 'unknown'));
      }
    } catch (err) {
      console.error('Ошибка редактирования:', err);
      alert('Ошибка сети при обновлении проекта');
    }
  });
}

// -------------------- Логин/Логаут --------------------
function wireAuth() {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await postJSONToAny(
        ['/api/login', '/api/auth/login'],
        { username, password }
      );
      const data = await safeJson(res);
      if (res.ok && (data?.ok ?? res.ok)) {
        await checkSession();
      } else {
        alert('Ошибка входа');
      }
    } catch (err) {
      console.error('login error:', err);
      alert('Ошибка входа');
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
      await postJSONToAny(['/api/logout', '/api/auth/logout'], {});
    } catch (_) {}
    await checkSession();
  });
}

// -------------------- init --------------------
window.addEventListener('DOMContentLoaded', () => {
  wireModalBasics();
  wireCreateForm();
  wireEditForm();
  wireAuth();
  checkSession();
});
