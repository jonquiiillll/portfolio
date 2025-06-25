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

// 👇 Вот она, отдельно вынесенная функция:
async function loadProjects() {
  const res = await fetch('/api/projects');
  const projects = await res.json();
  const list = document.getElementById('projectsList');
  list.innerHTML = '';

  projects.forEach(project => {
    const div = document.createElement('div');
    div.className = 'admin-project';

    div.innerHTML = `
      <img src="${project.coverImage}" alt="${project.title}" />
      <div>
        <strong>${project.title}</strong><br>
        <small>${project.year || ''} — ${project.category || ''}</small>
      </div>
      <div>
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
}

// Вызываем загрузку проектов после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    loadProjects();
  }
});
