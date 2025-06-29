
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  let galleryImages = [];
  let currentIndex = 0;
  let isDragging = false;
  let startX, scrollLeft, dragged;

  async function loadProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const project = await res.json();

      document.getElementById('title').textContent = project.title;
      // document.getElementById('year').textContent = `Год: ${project.year}`;
      document.getElementById('description').textContent = project.description;

      const gallery = document.getElementById('gallery');
      galleryImages = project.galleryImages;

      galleryImages.forEach((imgUrl, index) => {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.dataset.index = index;

        img.addEventListener('click', (e) => {
          if (!dragged) openLightbox(index);
        });

        gallery.appendChild(img);
      });

      setupDragScroll(gallery);
    } catch (err) {
      console.error('Ошибка загрузки проекта:', err);
      document.body.innerHTML = '<p>Ошибка загрузки проекта</p>';
    }
  }

  loadProject();

  function scrollGallery(direction) {
    const gallery = document.getElementById('gallery');
    const firstImage = gallery.querySelector('img');
    if (!firstImage) return;

    const scrollAmount = firstImage.offsetWidth + 20;
    gallery.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  function openLightbox(index) {
    currentIndex = index;
    const overlay = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-image');
    img.src = galleryImages[currentIndex];
    overlay.classList.add('visible');
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('visible');
  }

  function navigateLightbox(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = galleryImages.length - 1;
    if (currentIndex >= galleryImages.length) currentIndex = 0;
    const img = document.getElementById('lightbox-image');
    img.src = galleryImages[currentIndex];
  }

  function setupDragScroll(container) {
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragged = false;
      startX = e.pageX;
      scrollLeft = container.scrollLeft;
      container.classList.add('dragging');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.pageX;
      const walk = x - startX;
      if (Math.abs(walk) > 5) dragged = true;
      container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('mouseup', () => {
      isDragging = false;
      container.classList.remove('dragging');
      setTimeout(() => dragged = false, 50);
    });

    container.addEventListener('mouseleave', () => {
      isDragging = false;
      container.classList.remove('dragging');
    });

    container.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox.classList.contains('visible')) return;

  if (e.key === 'ArrowRight') {
    navigateLightbox(1);
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1);
  } else if (e.key === 'Escape') {
    closeLightbox();
  }
});
  }
