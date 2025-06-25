document.addEventListener('DOMContentLoaded', () => {
  let current = 0;
  const slides = document.querySelectorAll('.slides img');
  const total = slides.length;
  const dots = document.querySelectorAll('.dot');
  const burger = document.getElementById('burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMenu = document.getElementById('closeMenu');
  const links = document.querySelectorAll('a[href]');

  function showSlide(index) {
    slides.forEach((img, i) => {
      img.classList.remove('active');
      if (i === index) img.classList.add('active');
    });
    updateIndicators(index);
  }

  function nextSlide() {
    current = (current + 1) % total;
    showSlide(current);
  }

  function prevSlide() {
    current = (current - 1 + total) % total;
    showSlide(current);
  }

  function updateIndicators(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  document.querySelector('.next')?.addEventListener('click', nextSlide);
  document.querySelector('.prev')?.addEventListener('click', prevSlide);

  showSlide(current);
  setInterval(nextSlide, 4000);

  // fade-переходы между страницами
  links.forEach(link => {
    const url = link.getAttribute('href');
    if (url && !url.startsWith('#')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = url;
        }, 300);
      });
    }
  });

  // Мобильное меню
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  closeMenu?.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});
