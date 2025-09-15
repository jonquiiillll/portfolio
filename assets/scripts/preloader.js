document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const video = document.getElementById("preloaderVideo");

  const lastShown = localStorage.getItem("preloaderLastShown");
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000; // 1 час

  // если прелоадер показывался меньше часа назад — скрываем его сразу
  if (lastShown && now - parseInt(lastShown, 10) < ONE_HOUR) {
    preloader.remove();
    return;
  }

  // иначе показываем и записываем время
  localStorage.setItem("preloaderLastShown", now.toString());

  video.addEventListener("timeupdate", () => {
    // ловим момент перед концом
    if (video.duration - video.currentTime < 0.2) {
      video.pause();
      video.currentTime = video.duration - 0.2; // замораживаем кадр

      preloader.classList.add("fade-out");

      setTimeout(() => preloader.remove(), 2100);
    }
  });
});
