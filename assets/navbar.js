
  document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const mobile = document.getElementById("mobileMenu");
    const closeBtn = document.getElementById("closeMobile");

    burger.addEventListener("click", () => {
      mobile.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", () => {
      mobile.classList.add("hidden");
    });
  });
