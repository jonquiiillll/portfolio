  document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const lastShown = localStorage.getItem('preloaderLastShown');
    const now = Date.now();
    // const ONE_HOUR = 60 * 60 * 1000;
        const ONE_HOUR = 10000;

    // если давно не показывали — показываем
    if (!lastShown || now - parseInt(lastShown, 10) > ONE_HOUR) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          preloader.classList.add('fade-out');
          localStorage.setItem('preloaderLastShown', now.toString());
        }, 3000); // через 5 секунд
      });
    } else {
      // уже показывали — сразу скрываем
      preloader.style.display = 'none';
    }
  });