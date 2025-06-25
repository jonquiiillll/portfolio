document.addEventListener('DOMContentLoaded', () => {
  let current = 0;
  const slides = document.querySelectorAll('.slides img');
  const total = slides.length;

  function showSlide(index) {
    slides.forEach((img, i) => {
      img.classList.remove('active');
      if (i === index) img.classList.add('active');
    });
  }

  function nextSlide() {
    current = (current + 1) % total;
    showSlide(current);
updateIndicators(current);
  }

  function prevSlide() {
    current = (current - 1 + total) % total;
    showSlide(current);
updateIndicators(current);
  }

  document.querySelector('.next').addEventListener('click', nextSlide);
  document.querySelector('.prev').addEventListener('click', prevSlide);

  setInterval(nextSlide, 4000);
  showSlide(current);
  const dots = document.querySelectorAll('.dot');

function updateIndicators(index) {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

const burger = document.getElementById('burger');
const mobileMenu = document.querySelector('.mobile-menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

const closeMenu = document.getElementById('closeMenu');

closeMenu.addEventListener('click', () => {
  burger.classList.remove('open');
  mobileMenu.classList.remove('open');
});




  // Мобильное меню
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const url = link.getAttribute('href');
    if (...) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = url;
        }, 300);
      });
    }
  });
}); 


