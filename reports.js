(() => {
  const grid = document.querySelector('#report-grid');
  const form = document.querySelector('#report-filters');

  if (!grid || !form) return;

  const cards = [...grid.querySelectorAll('.card')];
  const search = form.querySelector('#report-search');
  const osFilter = form.querySelector('#os-filter');
  const difficultyFilter = form.querySelector('#difficulty-filter');
  const statusFilter = form.querySelector('#status-filter');
  const clearButton = form.querySelector('#clear-filters');
  const emptyState = document.querySelector('#empty-state');
  const emptyClear = document.querySelector('#empty-clear');
  const resultsCount = document.querySelector('#results-count');

  const readMetadata = (card) => {
    const metadata = {};

    card.querySelectorAll('p').forEach((row) => {
      const label = row.querySelector('strong')?.textContent.replace(':', '').trim().toLowerCase();
      if (!label) return;
      metadata[label] = row.textContent.replace(row.querySelector('strong').textContent, '').trim();
    });

    return {
      name: card.querySelector('h2')?.textContent.trim() || '',
      os: metadata.os || '',
      difficulty: metadata.difficulty || '',
      status: metadata.status || '',
    };
  };

  const reports = cards.map((card) => ({ card, ...readMetadata(card) }));

  reports.forEach(({ card, status }) => {
    const badge = document.createElement('span');
    badge.className = `status-badge status-${status.toLowerCase()}`;
    badge.textContent = status;
    card.querySelector('h2')?.insertAdjacentElement('afterend', badge);
  });

  const updateSummary = () => {
    const platforms = new Set(reports.map(({ os }) => os));
    const retired = reports.filter(({ status }) => status === 'Retired').length;
    document.querySelector('#report-count').textContent = reports.length;
    document.querySelector('#platform-count').textContent = platforms.size;
    document.querySelector('#retired-count').textContent = retired;
  };

  const applyFilters = () => {
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;

    reports.forEach((report) => {
      const matchesSearch = !query || [report.name, report.os, report.difficulty, report.status]
        .some((value) => value.toLowerCase().includes(query));
      const matchesOs = !osFilter.value || report.os === osFilter.value;
      const matchesDifficulty = !difficultyFilter.value || report.difficulty === difficultyFilter.value;
      const matchesStatus = !statusFilter.value || report.status === statusFilter.value;
      const isVisible = matchesSearch && matchesOs && matchesDifficulty && matchesStatus;

      report.card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    const hasFilters = Boolean(query || osFilter.value || difficultyFilter.value || statusFilter.value);
    clearButton.hidden = !hasFilters;
    emptyState.hidden = visibleCount !== 0;
    grid.hidden = visibleCount === 0;
    resultsCount.textContent = hasFilters
      ? `${visibleCount} ${visibleCount === 1 ? 'report' : 'reports'} found`
      : `Showing all ${reports.length} reports`;
  };

  form.addEventListener('input', applyFilters);
  form.addEventListener('reset', () => requestAnimationFrame(applyFilters));
  emptyClear?.addEventListener('click', () => {
    form.reset();
    applyFilters();
    search.focus();
  });

  updateSummary();
  applyFilters();
})();
