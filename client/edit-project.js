
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const form = document.getElementById('editForm');
  const coverInput = document.getElementById('coverInput');
  const imageToCrop = document.getElementById('imageToCrop');
  const cropContainer = document.getElementById('cropContainer');
  const cropBtn = document.getElementById('cropBtn');
  const croppedPreview = document.getElementById('croppedPreview');

  let cropper = null;
  let croppedBlob = null;

  async function loadProject() {
    const res = await fetch(`/api/projects/${projectId}`);
    if (!res.ok) {
      alert('Проект не найден');
      return;
    }
    const project = await res.json();

    form.title.value = project.title || '';
    form.description.value = project.description || '';
    form.category.value = project.category || '';
    form.year.value = project.year || '';
  }

  coverInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    imageToCrop.src = url;
    cropContainer.style.display = 'block';

    if (cropper) cropper.destroy();
    cropper = new Cropper(imageToCrop, {
      aspectRatio: 3 / 4,
      viewMode: 1,
      autoCropArea: 1,
    });
  });

cropBtn.addEventListener('click', () => {
  if (!cropper) {
    alert('Сначала выбери изображение для обрезки.');
    return;
  }

  // Делаем небольшую задержку, чтобы cropper успел отрендерить canvas
  setTimeout(() => {
    const canvas = cropper.getCroppedCanvas({
      width: 600,
      height: 800,
      imageSmoothingQuality: 'high'
    });

    if (!canvas) {
      alert('Ошибка обрезки изображения.');
      return;
    }

    canvas.toBlob((blob) => {
      croppedBlob = blob;

      const ctx = croppedPreview.getContext('2d');
      croppedPreview.width = canvas.width;
      croppedPreview.height = canvas.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(canvas, 0, 0);
      croppedPreview.style.display = 'block';
      cropContainer.style.display = 'none';
    }, 'image/jpeg', 0.95);
  }, 100); // подождём 100мс на отрисовку
});


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Вы не авторизованы.');
      return;
    }

    if (croppedBlob) {
      formData.append('coverImage', croppedBlob, 'cover.jpg');
    }

    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert('Проект обновлён!');
      window.location.href = 'admin.html';
    } else {
      alert('Ошибка при обновлении проекта');
    }
  });

  loadProject();
});
