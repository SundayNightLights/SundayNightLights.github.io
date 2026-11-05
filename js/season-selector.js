/*
 * SNL shared season selector (website-only first stage).
 * The calendar feed currently represents F26. Do not display it as W27.
 * Season labels are visitor-facing; permanent game IDs remain unchanged.
 */
(() => {
  'use strict';

  const pages = new Set(['home','schedule','standings','teams','team','playoffs','stats']);
  const page = document.body?.dataset.page || 'home';
  if (!pages.has(page)) return;

  const seasons = [
    {id:'F26',label:'2026-27 Fall',status:'current',order:20261},
    {id:'W27',label:'2026-27 Winter',status:'upcoming',order:20262}
  ];
  const current = seasons.find(s => s.status === 'current');
  const storageKey = 'snl-selected-season-v1';
  const getStored = () => { try { return localStorage.getItem(storageKey); } catch (_) { return null; } };
  const store = id => { try { localStorage.setItem(storageKey,id); } catch (_) {} };
  const requested = new URLSearchParams(location.search).get('season');
  const selected = seasons.find(s => s.id === (requested || getStored())) || current;
  if (requested) store(selected.id);
  window.SNL_SELECTED_SEASON = selected.id;

  const ordered = [
    ...seasons.filter(s => s.status === 'current'),
    ...seasons.filter(s => s.status === 'archived').sort((a,b) => b.order-a.order),
    ...seasons.filter(s => s.status === 'upcoming').sort((a,b) => a.order-b.order)
  ];

  function navigateTo(id) {
    store(id);
    const next = new URL(location.href);
    next.searchParams.set('season',id);
    location.assign(next.toString());
  }

  const css = [
    '.snl-seasonbar{background:#0a2943;border-bottom:1px solid #45627e;}',
    '.snl-seasonbar .wrap{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding-top:8px;padding-bottom:8px;min-height:54px;}',
    '.snl-seasonbar label{font-size:11px;font-weight:900;color:#c2d6e5;text-transform:uppercase;letter-spacing:.09em;}',
    '.snl-seasonbar select{background:#06192b;border:1px solid #8197ac;border-radius:9px;padding:10px 14px;color:#fff;font-size:14px;font-weight:800;min-width:210px;cursor:pointer;}',
    '.snl-seasonbar select:focus-visible{outline:2px solid #ffde19;outline-offset:2px;}',
    '.snl-season-state{font-size:11px;font-weight:850;color:#ffde19;white-space:nowrap;}',
    '.snl-unpublished{border:1px solid #496d88;border-radius:14px;background:#0d2d49;color:#fff;padding:32px;margin:24px 0;}',
    '.snl-unpublished small{color:#ffde19;letter-spacing:.13em;font-weight:900;font-size:11px;}',
    '.snl-unpublished h2{font-size:clamp(22px,3vw,32px);margin:12px 0;}',
    '.snl-unpublished p{color:#c6d7e5;line-height:1.6;max-width:670px;}',
    '.snl-unpublished button{margin-top:18px;border:1px solid #ffde19;color:#ffde19;background:transparent;border-radius:9px;padding:10px 16px;font-weight:900;cursor:pointer;}',
    '@media(max-width:650px){.snl-seasonbar .wrap{justify-content:flex-start;gap:8px;flex-wrap:wrap}.snl-seasonbar label{width:100%}.snl-seasonbar select{flex:1;min-width:0}.snl-season-state{font-size:10px}}',
    // Stats already had an internal season dropdown. The shared bar replaces its visual control.
    'body[data-page="stats"] #gc-stats .gc-seasonbar label[for="gcSeason"]{display:none;}'
  ].join('\n');

  function unpublished() {
    const panel = document.createElement('section');
    panel.className = 'snl-unpublished';
    const kicker = document.createElement('small');
    kicker.textContent = 'SUNDAY NIGHT LIGHTS · SEASON SCHEDULE';
    const title = document.createElement('h2');
    title.textContent = selected.label + ' · Coming Soon';
    const detail = document.createElement('p');
    detail.textContent = 'This season has not been published yet. Once the league releases its schedule and results, they will appear here. The current Fall season remains available.';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'VIEW ' + current.label.toUpperCase();
    button.addEventListener('click',() => navigateTo(current.id));
    panel.append(kicker,title,detail,button);
    return panel;
  }

  function hideUnpublishedSeasonData() {
    if (selected.id === current.id) return;
    const wrap = document.querySelector('#app > .wrap');
    if (!wrap) return;
    if (page === 'home') {
      const gamesAndStandings = wrap.querySelector('.split');
      if (gamesAndStandings) gamesAndStandings.replaceWith(unpublished());
      for (const section of wrap.querySelectorAll('section.section')) {
        const heading = section.querySelector('.section-top h2')?.textContent || '';
        if (/LEAGUE\s*LEADERS/i.test(heading)) section.remove();
      }
    } else {
      const footer = wrap.querySelector('.footer');
      for (const child of [...wrap.children]) {
        if (child !== footer) child.remove();
      }
      wrap.insertBefore(unpublished(), footer || null);
    }
  }

  function syncStats() {
    if (page !== 'stats' || selected.id !== current.id) return;
    // The GameChanger Stats code asynchronously populates its own selector.
    const control = document.getElementById('gcSeason');
    if (!control || ![...control.options].some(o => o.value === selected.id)) return;
    if (control.value !== selected.id) {
      control.value = selected.id;
      control.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }

  function install() {
    const header = document.getElementById('siteHeader');
    const masthead = header?.querySelector('.masthead');
    const wrap = document.querySelector('#app > .wrap');
    if (!masthead || !wrap?.querySelector('.footer')) return false;
    if (document.getElementById('snlSeason')) return true;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const bar = document.createElement('div');
    bar.className = 'snl-seasonbar';
    const inner = document.createElement('div');
    inner.className = 'wrap';
    const label = document.createElement('label');
    label.htmlFor = 'snlSeason';
    label.textContent = 'Select season';
    const select = document.createElement('select');
    select.id = 'snlSeason';
    select.setAttribute('aria-label','Select SNL season');
    for (const s of ordered) {
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = s.label + (s.status === 'upcoming' ? ' · Coming Soon' : '');
      option.selected = s.id === selected.id;
      select.appendChild(option);
    }
    select.addEventListener('change',() => navigateTo(select.value));
    const state = document.createElement('span');
    state.className = 'snl-season-state';
    state.textContent = selected.status === 'current' ? 'CURRENT' : selected.status === 'upcoming' ? 'COMING SOON' : 'ARCHIVED';
    inner.append(label,select,state);
    bar.appendChild(inner);
    masthead.insertAdjacentElement('afterend',bar);

    const footer = wrap.querySelector('.footer');
    if (footer?.lastElementChild) footer.lastElementChild.textContent = selected.label;
    hideUnpublishedSeasonData();
    syncStats();
    return true;
  }

  function start() {
    if (install()) {
      if (page === 'stats' && selected.id === current.id) {
        const observer = new MutationObserver(syncStats);
        observer.observe(document.getElementById('app'),{childList:true,subtree:true});
      }
      return;
    }
    const observer = new MutationObserver(() => {
      if (install()) {
        observer.disconnect();
        if (page === 'stats' && selected.id === current.id) {
          const statsObserver = new MutationObserver(syncStats);
          statsObserver.observe(document.getElementById('app'),{childList:true,subtree:true});
        }
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',start,{once:true});
  } else start();
})();