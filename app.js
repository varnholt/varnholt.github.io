const collection = document.querySelector('#collection');
const search = document.querySelector('#search');
const demoOnly = document.querySelector('#demo-only');
let selected = 'all';
let projects = [];
let groups = [];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };

function card(p) {
  const url = safeURL(p.html_url);
  const demo = safeURL(p.demo);
  const title = escapeHTML(p.title || p.name);
  const image = p.image ? `assets/${encodeURIComponent(p.name)}.${p.image.split('.').pop()}` : '';
  const visual = image
    ? `<div class="visual ${p.fit === 'contain' || p.name === 'tinysubdiv' ? 'contain' : ''}"><img src="${image}" alt="${escapeHTML(p.alt)}" loading="lazy" width="640" height="360"></div>`
    : `<div class="visual code" aria-hidden="true"><span class="symbol">${p.group === 'hardware' ? '⌁' : '{ }'}</span><span class="code-name">${escapeHTML(p.name)}</span></div>`;
  return `<article class="card">${visual}<div class="card-body"><p class="tech">${escapeHTML(p.tech || p.language || 'Project')}</p><h4><a href="${url}">${title}</a></h4><p class="description">${escapeHTML(p.description || 'Explore the source and documentation on GitHub.')}</p><div class="card-links">${demo ? `<a class="demo-link" href="${demo}">Try it live ↗</a>` : ''}<a href="${url}">Source ↗</a>${p.stargazers_count ? `<span class="stars" aria-label="${p.stargazers_count} GitHub stars">☆ ${p.stargazers_count}</span>` : ''}</div></div></article>`;
}

function render() {
  const query = search.value.toLocaleLowerCase().trim();
  const visible = projects.filter(p => (selected === 'all' || p.group === selected) && (!demoOnly.checked || p.demo) && `${p.title || ''} ${p.name} ${p.description || ''} ${p.tech || ''}`.toLocaleLowerCase().includes(query));
  document.querySelector('#results').textContent = `${visible.length} of ${projects.length} projects${demoOnly.checked ? ' · with browser demos' : ''}`;
  collection.innerHTML = groups.map((g, index) => {
    const items = visible.filter(p => p.group === g.id);
    return items.length ? `<section class="group" aria-labelledby="group-${g.id}"><div class="group-header"><span class="group-number">${String(index + 1).padStart(2, '0')}</span><h3 id="group-${g.id}">${escapeHTML(g.title)}</h3><p>${escapeHTML(g.intro)}</p></div><div class="grid">${items.map(card).join('')}</div></section>` : '';
  }).join('') || '<p class="empty">No matching projects. Try another search or filter.</p>';
}

async function start() {
  try {
    const responses = await Promise.all([fetch('repos.json'), fetch('curation.json')]);
    if (responses.some(r => !r.ok)) throw new Error('Project data could not be loaded');
    const [repos, config] = await Promise.all(responses.map(r => r.json()));
    groups = config.groups;
    const byName = new Map(repos.map(r => [r.name, r]));
    projects = Object.entries(config.projects).filter(([name]) => byName.has(name) && !config.excluded[name]).map(([name, details]) => ({...byName.get(name), ...details}));
    // New original repositories appear automatically; forks and explicit exclusions stay out.
    for (const repo of repos) {
      if (!repo.fork && !config.excluded[repo.name] && !config.projects[repo.name]) projects.push({...repo, group:'more', tech:repo.language, demo:safeURL(repo.homepage)});
    }
    document.querySelector('#total').textContent = String(projects.length).padStart(2, '0');
    const filters = document.querySelector('#filters');
    filters.innerHTML = [{id:'all', title:'Everything'}, ...groups].map(g => `<button type="button" data-group="${g.id}" aria-pressed="${g.id === 'all'}">${escapeHTML(g.title)}</button>`).join('');
    filters.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      selected = button.dataset.group;
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      render();
    });
    search.addEventListener('input', render);
    demoOnly.addEventListener('change', render);
    render();
  } catch {
    collection.innerHTML = '<p class="empty">The project directory could not load. <a href="https://github.com/varnholt?tab=repositories">Browse the repositories on GitHub ↗</a></p>';
  }
}
start();
