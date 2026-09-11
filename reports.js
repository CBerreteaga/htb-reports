(() => {
  const grid = document.querySelector('#report-grid');
  const form = document.querySelector('#report-filters');
  if (!grid || !form) return;

  const search = form.querySelector('#report-search');
  const osFilter = form.querySelector('#os-filter');
  const difficultyFilter = form.querySelector('#difficulty-filter');
  const statusFilter = form.querySelector('#status-filter');
  const clearButton = form.querySelector('#clear-filters');
  const emptyState = document.querySelector('#empty-state');
  const emptyClear = document.querySelector('#empty-clear');
  const resultsCount = document.querySelector('#results-count');
  let reports = [];

  const readFallback = () => [...grid.querySelectorAll('.card')].map((card) => {
    const values = [...card.querySelectorAll('p')].map((row) =>
      row.textContent.replace(row.querySelector('strong')?.textContent || '', '').trim());
    return {
      slug: card.getAttribute('href').split('/').pop().replace(/\.html$/, ''),
      name: card.querySelector('h2')?.textContent.trim() || '',
      os: values[0] || '',
      difficulty: values[1] || '',
      status: values[2] || '',
    };
  });

  const renderCards = (items) => {
    grid.replaceChildren();
    items.forEach((report) => {
      const card = document.createElement('a');
      card.className = 'card';
      card.href = `reports/${report.slug}.html`;

      const heading = document.createElement('h2');
      heading.textContent = report.name;
      card.append(heading);

      const badge = document.createElement('span');
      badge.className = `status-badge status-${report.status.toLowerCase()}`;
      badge.textContent = report.status;
      card.append(badge);

      [['OS', report.os], ['Difficulty', report.difficulty], ['Status', report.status]].forEach(([label, value]) => {
        const row = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}:`;
        row.append(strong, ` ${value}`);
        card.append(row);
      });
      grid.append(card);
    });
  };

  const populateSelect = (select, values, allLabel) => {
    const selected = select.value;
    select.replaceChildren(new Option(allLabel, ''));
    [...new Set(values)].sort().forEach((value) => select.add(new Option(value, value)));
    select.value = selected;
  };

  const updateSummary = () => {
    document.querySelector('#report-count').textContent = reports.length;
    document.querySelector('#platform-count').textContent = new Set(reports.map(({ os }) => os)).size;
    document.querySelector('#retired-count').textContent = reports.filter(({ status }) => status === 'Retired').length;
  };

  const applyFilters = () => {
    const query = search.value.trim().toLowerCase();
    const visible = reports.filter((report) => {
      const matchesSearch = !query || [report.name, report.os, report.difficulty, report.status]
        .some((value) => value.toLowerCase().includes(query));
      return matchesSearch
        && (!osFilter.value || report.os === osFilter.value)
        && (!difficultyFilter.value || report.difficulty === difficultyFilter.value)
        && (!statusFilter.value || report.status === statusFilter.value);
    });

    renderCards(visible);
    const hasFilters = Boolean(query || osFilter.value || difficultyFilter.value || statusFilter.value);
    clearButton.hidden = !hasFilters;
    emptyState.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
    resultsCount.textContent = hasFilters
      ? `${visible.length} ${visible.length === 1 ? 'report' : 'reports'} found`
      : `Showing all ${reports.length} reports`;
  };

  const initialize = (items) => {
    reports = items;
    populateSelect(osFilter, reports.map(({ os }) => os), 'All operating systems');
    populateSelect(difficultyFilter, reports.map(({ difficulty }) => difficulty), 'All difficulties');
    populateSelect(statusFilter, reports.map(({ status }) => status), 'All statuses');
    updateSummary();
    applyFilters();
  };

  form.addEventListener('input', applyFilters);
  form.addEventListener('reset', () => requestAnimationFrame(applyFilters));
  emptyClear?.addEventListener('click', () => {
    form.reset();
    applyFilters();
    search.focus();
  });

  const fallback = readFallback();
  initialize(fallback);
  fetch('reports.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Report metadata request failed: ${response.status}`);
      return response.json();
    })
    .then(initialize)
    .catch(() => {
      // The static card fallback keeps the collection usable offline and without fetch support.
    });
})();
