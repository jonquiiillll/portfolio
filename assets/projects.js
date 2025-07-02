
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('project-years-container');

  async function loadProjects(category = 'все') {
    container.classList.add('fade-out');
    container.offsetHeight;
    await new Promise(resolve => setTimeout(resolve, 400));
    container.innerHTML = '';

    const res = await fetch(`/api/projects?category=${encodeURIComponent(category)}`);
    const projects = await res.json();

    const projectsByYear = {};
    projects.forEach(project => {
      const year = project.year || 'Без года';
      if (!projectsByYear[year]) projectsByYear[year] = [];
      projectsByYear[year].push(project);
    });

    const sortedYears = Object.keys(projectsByYear).sort((a, b) => b - a);

    sortedYears.forEach(year => {
      const yearBlock = document.createElement('div');
      yearBlock.classList.add('year-block', 'fade-in');

      const title = document.createElement('h2');
      title.className = 'year-title';
      title.textContent = year;
      yearBlock.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'project-grid';

      projectsByYear[year].forEach(project => {
        const card = document.createElement('a');
        card.href = `project.html?id=${project._id}`;
        card.className = 'project-card';
        card.innerHTML = `
          <img src="${project.coverImage}" alt="${project.title}" />
          <div class="project-name">${project.title} <span class="arrow">↗</span></div>
        `;
        grid.appendChild(card);
      });

      yearBlock.appendChild(grid);
      container.appendChild(yearBlock);
    });

    container.classList.remove('fade-out');
  }

  document.querySelector('.category-filters').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      document.querySelectorAll('.category-filters button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      loadProjects(e.target.dataset.category);
    }
  });

  loadProjects();
});
