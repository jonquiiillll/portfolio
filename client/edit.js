// client/edit.js

let cropper, uploadedBlob;

const query = new URLSearchParams(location.search);
const editId = query.get('id');

if (editId) {
  fetch(`/api/projects/${editId}`)
    .then(res => res.json())
    .then(data => {
      document.querySelector('[name="title"]').value = data.title;
      document.querySelector('[name="year"]').value = data.year;
      document.querySelector('[name="category"]').value = data.category;
    });
}

document.getElementById('coverInput').onchange = e => {
  const file = e.target.files[0];
  const img = document.getElementById('crop-image');
  const modal = document.getElementById('crop-modal');
  img.src = URL.createObjectURL(file);
  modal.style.display = 'block';
  cropper = new Cropper(img, { aspectRatio: 2/3, viewMode:1, autoCropArea:1 });

  document.getElementById('crop-confirm').onclick = () => {
    cropper.getCroppedCanvas({ width:800, height:1200 }).toBlob(blob => {
      uploadedBlob = blob;
      cropper.destroy();
      modal.style.display = 'none';
      URL.revokeObjectURL(img.src);
    }, 'image/jpeg');
  };

  document.getElementById('crop-cancel').onclick = () => {
    cropper.destroy();
    modal.style.display = 'none';
    URL.revokeObjectURL(img.src);
  };
};

document.getElementById('projectForm').onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData();
  fd.append('title', e.target.title.value);
  fd.append('year', e.target.year.value);
  fd.append('category', e.target.category.value);
  if (uploadedBlob) {
    fd.append('coverImage', uploadedBlob, 'cover.jpg');
  }

  const url = editId ? `/api/projects/${editId}` : '/api/projects';
  const method = editId ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    credentials: 'include',
    body: fd
  });

  location.href = '/admin.html';
};
