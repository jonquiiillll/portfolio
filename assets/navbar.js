fetch('/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar-container').innerHTML = html;

    const path = window.location.pathname;
    document.querySelectorAll('.desktop-menu a').forEach(link => {
      if (link.getAttribute('href') === path) {
        link.classList.add('active');
      }
    });

    const burger = document.getElementById("burger");
    const mobile = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("closeMobile");

    if (burger && mobile && closeBtn) {
      burger.addEventListener("click", () => {
        mobile.classList.add("open");
      });
      closeBtn.addEventListener("click", () => {
        mobile.classList.remove("open");
      });
    }
  });
