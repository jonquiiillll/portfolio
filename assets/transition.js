document.addEventListener('DOMContentLoaded', () => {
  // Убедимся, что body плавно появляется
  document.body.classList.add('fade-in');

  // Найди все ссылки-переходы на проекты (можно уточнить селектор)
  const clickableProjects = document.querySelectorAll('.project a');

  clickableProjects.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');

      document.body.classList.remove('fade-in');
      document.body.classList.add('fade-out');

      setTimeout(() => {
        window.location.href = href;
      }, 400); // должен совпадать с CSS transition
    });
  });
});
