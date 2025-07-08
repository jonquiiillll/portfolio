
fetch('/components/navbar.html')
  .then(res => res.text())
  .then(html => {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = html;

    requestAnimationFrame(() => {
      const toggle = document.getElementById('burger-toggle');
      const menu = document.getElementById('mobile-menu');
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          menu.classList.toggle('open');
        });
      }
    });
  })
  .catch(console.error);

