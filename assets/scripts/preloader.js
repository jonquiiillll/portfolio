document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const video = document.getElementById('preloaderVideo');
  const lastShown = localStorage.getItem('preloaderLastShown');
  const now = Date.now();
  // const ONE_HOUR = 60 * 60 * 1000;
  const ONE_HOUR = 100;

  const fadeOut = () => {
    preloader.classList.add('fade-out');
    localStorage.setItem('preloaderLastShown', now.toString());

    // ждём пока и фон и видео растворятся
    setTimeout(() => {
      preloader.remove();
    }, 1000); // должно совпадать с transition в CSS
  };

  if (!lastShown || now - parseInt(lastShown, 10) > ONE_HOUR) {
    window.addEventListener('load', () => {
      if (video) {
        // Ждём 0.3 секунды после окончания видео — и запускаем fadeOut
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
