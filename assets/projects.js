// 📄 projects.js

// async function loadProjects(category = 'все') {
//   try {
//     const url = category && category !== 'все'
//       ? `/api/projects?category=${encodeURIComponent(category)}`
//       : '/api/projects';

//     const res = await fetch(url);
//     const projects = await res.json();

//     const container = document.getElementById('project-years-container');
//     container.innerHTML = '';

//     // Группируем по годам
//     const grouped = {};
//     projects.forEach(p => {
//       if (!grouped[p.year]) grouped[p.year] = [];
//       grouped[p.year].push(p);
//     });

//     // Сортируем года по убыванию
//     const years = Object.keys(grouped).sort((a, b) => b - a);

//     years.forEach(year => {
//       const section = document.createElement('div');
//       section.className = 'year-block';

//       const header = document.createElement('h2');
//       header.className = 'year-title';
//       header.textContent = year;
//       section.appendChild(header);


//       const grid = document.createElement('div');
//       grid.className = 'project-grid';

//       grouped[year].forEach(project => {
//         const card = document.createElement('div');
//         card.className = 'project-card';
//         card.innerHTML = `
//           <img src="${project.coverImage}" alt="${project.title}" />
//           <div class="project-card-title">${project.title}</div>
//         `;
//         card.addEventListener('click', () => {
//           window.location.href = `project.html?id=${project.id}`;
//         });
//         grid.appendChild(card);
//       });

//       section.appendChild(grid);
//       container.appendChild(section);
//     });
//   } catch (err) {
//     console.error('Ошибка загрузки проектов:', err);
//   }
// }

// 📄 projects.js

async function loadProjects(category = 'все') {
  try {
    const url = category && category !== 'все'
      ? `/api/projects?category=${encodeURIComponent(category)}`
      : '/api/projects';

    const res = await fetch(url);
    let projects = await res.json();

    const container = document.getElementById('project-years-container');
    container.innerHTML = '';

    // сортируем по году (новые выше)
    projects.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const grid = document.createElement('div');
    grid.className = 'project-grid';

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <img src="${project.coverImage}" alt="${project.title}" />
        <div class="project-card-title">${project.title}</div>
      `;
      card.addEventListener('click', () => {
        window.location.href = "project.html?id=" + project.id;
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (err) {
    console.error('Ошибка загрузки проектов:', err);
  }
}

function setupFilters() {
  const buttons = document.querySelectorAll('.category-filters button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      loadProjects(category);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  loadProjects();
});


function setupFilters() {
  const buttons = document.querySelectorAll('.category-filters button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      loadProjects(category);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  loadProjects();
});
