document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('project-years-container');

  async function loadProjects(category = 'все') {
    // 1. Плавное исчезновение
    container.classList.add('fade-out');
    container.offsetHeight; // Форсируем ререндер
    await new Promise(resolve => setTimeout(resolve, 400));
    container.innerHTML = '';

    // 2. Загружаем проекты
    const res = await fetch(`/api/projects?category=${encodeURIComponent(category)}`);
    const projects = await res.json();

    const projectsByYear = {};
    projects.forEach(project => {
      const year = project.year || 'Без года';
      if (!projectsByYear[year]) projectsByYear[year] = [];
      projectsByYear[year].push(project);
    });

    const sortedYears = Object.keys(projectsByYear).sort((a, b) => b - a);

    // 3. Создаём блоки по годам и по 5 проектов в ряд
    sortedYears.forEach(year => {
      const yearBlock = document.createElement('div');
      yearBlock.classList.add('year-block', 'fade-in');

      const yearProjects = projectsByYear[year];

      for (let i = 0; i < yearProjects.length; i += 5) {
        const row = document.createElement('div');
        row.className = 'project-row';

        const title = document.createElement('h2');
        title.className = 'year-title';
        title.textContent = i === 0 ? year : '';
        row.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'project-grid';

        yearProjects.slice(i, i + 5).forEach(project => {
          const card = document.createElement('a');
          card.href = `project.html?id=${project._id}`;
          card.className = 'project-card';
          card.innerHTML = `
            <img src="${project.coverImage}" alt="${project.title}" />
            <div class="project-name">${project.title} <span class="arrow">↗</span></div>
          `;
          grid.appendChild(card);
        });

        row.appendChild(grid);
        yearBlock.appendChild(row);
      }

      container.appendChild(yearBlock);
    });

    // 4. Плавное появление
    container.classList.remove('fade-out');
  }

  // Обработка нажатий на категории
  document.querySelector('.category-filters').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      document.querySelectorAll('.category-filters button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      loadProjects(e.target.dataset.category);
    }
  });

  // Первоначальная загрузка
  loadProjects();
});
