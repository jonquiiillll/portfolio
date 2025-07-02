 // Раскрытие и анимация плюсика
    document.querySelectorAll('.service-title').forEach(title => {
      title.addEventListener('click', () => {
        const service = title.parentElement;
        const icon = title.querySelector('.icon');
        const isOpen = service.classList.contains('open');

        document.querySelectorAll('.service').forEach(s => {
          s.classList.remove('open');
          s.querySelector('.icon').classList.remove('rotate');
        });

        if (!isOpen) {
          service.classList.add('open');
          icon.classList.add('rotate');
        }
      });
    });

    // Drag-scroll
    document.querySelectorAll('.carousel').forEach(carousel => {
      let isDown = false;
      let startX;
      let scrollLeft;

      carousel.addEventListener('mousedown', e => {
        isDown = true;
        carousel.classList.add('dragging');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('dragging');
      });

      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('dragging');
      });

      carousel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
        carousel.scrollLeft = scrollLeft - walk;
      });
    });