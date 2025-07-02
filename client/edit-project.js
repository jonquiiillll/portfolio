
// ...весь код как был до...
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const form = document.getElementById('editForm');
  const coverInput = document.getElementById('coverInput');
  const imageToCrop = document.getElementById('imageToCrop');
  const cropBtn = document.getElementById('cropBtn');
  const cancelCrop = document.getElementById('cancelCrop');
  const croppedPreview = document.getElementById('croppedPreview');
  const overlay = document.getElementById('overlay');

  const currentCover = document.getElementById('currentCover');
  const changeCoverBtn = document.getElementById('changeCoverBtn');
  const uploadNewCoverBtn = document.getElementById('uploadNewCoverBtn');
  const galleryList = document.getElementById('galleryList');
  const galleryInput = document.getElementById('galleryInput');

  let cropper = null;
  let croppedBlob = null;
  let existingGallery = [];
  let newGalleryImages = [];
  let originalCoverUrl = "";

  changeCoverBtn.addEventListener('click', () => {
    if (originalCoverUrl) {
      imageToCrop.src = originalCoverUrl;
      overlay.style.display = 'flex';
      if (cropper) cropper.destroy();
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 3 / 4,
        viewMode: 1,
        autoCropArea: 1,
      });
    }
  });

  uploadNewCoverBtn.addEventListener('click', () => {
    coverInput.click();
  });

  coverInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    imageToCrop.src = url;
    overlay.style.display = 'flex';

    if (cropper) cropper.destroy();
    cropper = new Cropper(imageToCrop, {
      aspectRatio: 3 / 4,
      viewMode: 1,
      autoCropArea: 1,
    });
  });

  cancelCrop.addEventListener('click', () => {
    overlay.style.display = 'none';
    if (cropper) cropper.destroy();
    cropper = null;
  });

  cropBtn.addEventListener('click', () => {
    if (!cropper) return;

    setTimeout(() => {
      const canvas = cropper.getCroppedCanvas({
        width: 600,
        height: 800,
        imageSmoothingQuality: 'high'
      });

      canvas.toBlob((blob) => {
        croppedBlob = blob;

        const url = URL.createObjectURL(blob);
        currentCover.src = url;

        cropper.destroy();
        cropper = null;
        overlay.style.display = 'none';
      }, 'image/jpeg', 0.95);
    }, 100);
  });

  galleryInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      addGalleryImage(url, null, file);
    });
  });

  function addGalleryImage(src, id, file) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const img = document.createElement('img');
    img.src = src.startsWith('blob:') || src.startsWith('/uploads') ? src : '/uploads/gallery/' + src;
    img.style.maxWidth = '100px';
    img.style.borderRadius = '4px';

    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.style.position = 'absolute';
    btn.style.top = '0';
    btn.style.right = '0';
    btn.style.background = 'red';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';

    btn.onclick = () => {
      galleryList.removeChild(wrapper);
      if (id) {
        existingGallery = existingGallery.filter(existingId => existingId !== id);
      }
    };

    wrapper.appendChild(img);
    wrapper.appendChild(btn);
    galleryList.appendChild(wrapper);

    if (!id && file) {
      newGalleryImages.push(file);
    }
  }

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

    originalCoverUrl = project.coverImage.startsWith('/uploads') 
      ? project.coverImage 
      : '/uploads/covers/' + project.coverImage;

    currentCover.src = originalCoverUrl;

    existingGallery = [...project.galleryImages];
    existingGallery.forEach(fullPath => {
      addGalleryImage(fullPath, fullPath, null);
    });
  }

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

    for (let file of newGalleryImages) {
      formData.append('galleryImages', file);
    }

    formData.append('existingGallery', JSON.stringify(existingGallery));

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
