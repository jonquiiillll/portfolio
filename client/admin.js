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
    } else {
      alert('Ошибка: ' + data.error);
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    alert('Произошла ошибка при отправке запроса');
  }
});
