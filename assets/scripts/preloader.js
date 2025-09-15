document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const video = document.getElementById('preloaderVideo');
  const lastShown = localStorage.getItem('preloaderLastShown');
  const now = Date.now();
  const ONE_HOUR = 1000;

  const fadeOut = () => {
    preloader.classList.add('fade-out');
    localStorage.setItem('preloaderLastShown', now.toString());

    // После окончания анимации полностью убираем DOM
    setTimeout(() => {
      preloader.remove();
    }, 1600); // немного больше, чем transition в CSS
  };

  if (!lastShown || now - parseInt(lastShown, 10) > ONE_HOUR) {
    window.addEventListener('load', () => {
      if (video) {
        video.onended = () => {
          setTimeout(fadeOut, 300);
        };
      } else {
        setTimeout(fadeOut, 3000);
      }
    });
  } else {
    preloader.style.display = 'none';
  }
});
