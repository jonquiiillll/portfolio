document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Нет токена. Залогиньтесь сначала.');
    return;
  }

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert('Проект успешно добавлен!');
      form.reset();
      loadProjects();
    } else {
      alert('Ошибка: ' + data.error);
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    alert('Произошла ошибка при отправке запроса');
  }
});

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
          <a href="edit-project.html?id=${project._id}">✏️ Редактировать</a>
          <button data-id="${project._id}" class="delete-btn">🗑 Удалить</button>
        </div>
      `;
      list.appendChild(div);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Удалить проект?')) {
          await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          loadProjects();
        }
      });
    });
  } catch (err) {
    console.error('Ошибка загрузки проектов:', err);
  }
}

async function checkSession() {
  const res = await fetch('/api/checkSession', { credentials: 'include' });
  const data = await res.json();

  const loginForm = document.getElementById('loginForm');
  const projectForm = document.getElementById('projectForm');
  const userInfo = document.getElementById('userInfo');
  const projectsTitle = document.getElementById('projectsTitle');

  if (data.sessionExists) {
    loginForm.style.display = 'none';
    projectForm.style.display = 'block';
    userInfo.style.display = 'block';
    projectsTitle.style.display = 'block'; // показать заголовок
    document.getElementById('welcome').textContent = `Здравствуйте, ${data.username || 'Ольга'}`;
    loadProjects();
  } else {
    loginForm.style.display = 'block';
    projectForm.style.display = 'none';
    userInfo.style.display = 'none';
    projectsTitle.style.display = 'none'; // скрыть заголовок
    document.getElementById('projectsList').innerHTML = '';
  }
}


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
    await checkSession(); // ✅ сразу загружаем после входа
  } else {
    alert('Ошибка входа');
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  await checkSession();
});

// 🔥 При загрузке страницы
window.addEventListener('DOMContentLoaded', checkSession);
