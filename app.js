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
  const previews = p.images?.length ? p.images : p.image ? [{image:p.image, alt:p.alt}] : [];
  const source = (preview, index) => `assets/${encodeURIComponent(p.name)}${p.images?.length ? `-${index}` : ''}.${preview.image.split('.').pop()}`;
  const image = (preview, index) => `<div class="visual ${p.fit === 'contain' || p.name === 'tinysubdiv' ? 'contain' : ''}"><img src="${escapeHTML(source(preview, index))}" alt="${escapeHTML(preview.alt)}" loading="lazy" width="800" height="480"></div>`;
  const visual = previews.length > 1
    ? `<div class="preview-gallery" data-gallery><div class="preview-stage">${previews.map((preview, index) => `<figure data-preview-panel${index ? ' hidden' : ''}>${image(preview, index)}<figcaption><span>${escapeHTML(preview.label)}</span><a href="${escapeHTML(source(preview, index))}" target="_blank" rel="noopener">Full size ↗</a></figcaption></figure>`).join('')}</div><div class="preview-picker" role="group" aria-label="${title} screenshots">${previews.map((preview, index) => `<button type="button" data-preview="${index}" aria-pressed="${index === 0}">${escapeHTML(preview.label)}</button>`).join('')}</div></div>`
    : previews.length ? image(previews[0], 0)
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
    collection.addEventListener('click', event => {
      const button = event.target.closest('[data-preview]');
      if (!button) return;
      const gallery = button.closest('[data-gallery]');
      if (!gallery) return;
      const panels = gallery.querySelectorAll('[data-preview-panel]');
      const index = Number(button.dataset.preview);
      if (!Number.isInteger(index) || index < 0 || index >= panels.length) return;
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      gallery.querySelectorAll('[data-preview]').forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
    });
    search.addEventListener('input', render);
    demoOnly.addEventListener('change', render);
    render();
  } catch {
    collection.innerHTML = '<p class="empty">The project directory could not load. <a href="https://github.com/varnholt?tab=repositories">Browse the repositories on GitHub ↗</a></p>';
  }
}
start();
