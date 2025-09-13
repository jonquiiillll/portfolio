// 📄 admin.js

// Добавление нового проекта
document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

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
      loadProjects();
    } else {
      alert('Ошибка: ' + (data.error || 'Не удалось добавить проект'));
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    alert('Произошла ошибка при отправке запроса');
  }
});

// Загрузка списка проектов
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

    // Удаление проекта
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Удалить проект?')) {
          const res = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (res.ok) {
            loadProjects();
          } else {
            alert('Ошибка при удалении проекта');
          }
        }
      });
    });

    // Редактирование проекта
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) return alert('Ошибка загрузки проекта');
        const project = await res.json();

        // Заполняем форму модалки
        document.getElementById('edit-id').value = project.id;
        document.getElementById('edit-title').value = project.title || '';
        document.getElementById('edit-description').value = project.description || '';
        document.getElementById('edit-category').value = project.category || '';
        document.getElementById('edit-year').value = project.year || '';

        document.getElementById('editModal').style.display = 'block';
      });
    });
  } catch (err) {
    console.error('Ошибка загрузки проектов:', err);
  }
}

// Закрытие модального окна
document.getElementById('closeEditModal').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

// Сохранение изменений в проекте
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    if (res.ok) {
      alert('Проект обновлен');
      document.getElementById('editModal').style.display = 'none';
      loadProjects();
    } else {
      alert('Ошибка при обновлении проекта');
    }
  } catch (err) {
    console.error('Ошибка редактирования:', err);
  }
});

// Проверка сессии
async function checkSession() {
  const res = await fetch('/api/checkSession', { credentials: 'include' });
  const data = await res.json();
  console.log('checkSession:', data);
  const loginForm = document.getElementById('loginForm');
  const projectForm = document.getElementById('projectForm');
  const logoutContainer = document.getElementById('logoutContainer');
  const projectsTitle = document.getElementById('projectsTitle');

  if (data.sessionExists) {
    loginForm.style.display = 'none';
    projectForm.style.display = 'block';
    logoutContainer.style.display = 'block';
    projectsTitle.style.display = 'block';
    loadProjects();
  } else {
    loginForm.style.display = 'block';
    projectForm.style.display = 'none';
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

  if (res.ok && data.ok) {
    await checkSession();
  } else {
    alert('Ошибка входа');
  }
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
