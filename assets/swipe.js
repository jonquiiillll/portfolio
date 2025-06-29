  const gallery = document.getElementById('gallery');

  gallery.addEventListener('mousedown', () => {
    gallery.style.cursor = 'grabbing';
  });

  gallery.addEventListener('mouseup', () => {
    gallery.style.cursor = 'grab';
  });

  gallery.addEventListener('mouseleave', () => {
    gallery.style.cursor = 'grab';
  });