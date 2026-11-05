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
    '.snl-seasonbar{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;margin-left:auto;white-space:nowrap;}',
    '.snl-seasonbar label{font-size:10px;font-weight:900;color:#c2d6e5;text-transform:uppercase;letter-spacing:.06em;}',
    '.snl-seasonbar select{background:#06192b;border:1px solid #8197ac;border-radius:9px;padding:9px 12px;color:#fff;font-size:13px;font-weight:800;max-width:220px;cursor:pointer;}',
    '.snl-seasonbar select:focus-visible{outline:2px solid #ffde19;outline-offset:2px;}',
    '.page-hero .snl-seasonbar{align-self:flex-end;margin-bottom:2px;}',
    '.split > div:first-child > .section-top{flex-wrap:wrap;align-items:center;}',
    '.split > div:first-child > .section-top .snl-seasonbar{margin-left:auto;}',
    '.snl-unpublished{border:1px solid #496d88;border-radius:14px;background:#0d2d49;color:#fff;padding:32px;margin:24px 0;}',
    '.snl-unpublished small{color:#ffde19;letter-spacing:.13em;font-weight:900;font-size:11px;}',
    '.snl-unpublished h2{font-size:clamp(22px,3vw,32px);margin:12px 0;}',
    '.snl-unpublished p{color:#c6d7e5;line-height:1.6;max-width:670px;}',
    '.snl-unpublished button{margin-top:18px;border:1px solid #ffde19;color:#ffde19;background:transparent;border-radius:9px;padding:10px 16px;font-weight:900;cursor:pointer;}',
    '@media(max-width:650px){.page-hero{flex-wrap:wrap}.page-hero .snl-seasonbar{margin-left:0}.snl-seasonbar select{max-width:195px;font-size:12px;padding:8px 10px}}',
    // Stats has an internal technical selector; show only the shared page-level control.
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
      if (gamesAndStandings) {
        // Keep the Upcoming Games heading and its inline selector when Winter is unpublished.
        const heading = gamesAndStandings.querySelector(':scope > div:first-child > .section-top');
        const summary = document.createElement('section');
        summary.className = 'section snl-season-summary';
        if (heading) summary.appendChild(heading);
        summary.appendChild(unpublished());
        gamesAndStandings.replaceWith(summary);
      }
      for (const section of wrap.querySelectorAll('section.section')) {
        const heading = section.querySelector('.section-top h2')?.textContent || '';
        if (/LEAGUE\s*LEADERS/i.test(heading)) section.remove();
      }
    } else {
      const footer = wrap.querySelector('.footer');
      const hero = wrap.querySelector(':scope > .page-hero');
      // Preserve the page title and the selector; remove only old-season data.
      for (const child of [...wrap.children]) {
        if (child !== footer && child !== hero) child.remove();
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
    const wrap = document.querySelector('#app > .wrap');
    if (!header?.querySelector('.scoreboard') || !wrap?.querySelector('.footer')) return false;
    // Stats swaps its initial page markup for a GameChanger statistics view.
    // Attach only after that swap so its heading (and selector) remain intact.
    if (page === 'stats' && !wrap.querySelector('#gc-stats')) return false;
    const target = page === 'home'
      ? wrap.querySelector('.split > div:first-child > .section-top')
      : wrap.querySelector(':scope > .page-hero');
    if (!target) return false;
    if (document.getElementById('snlSeason')) return true;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const bar = document.createElement('div');
    bar.className = 'snl-seasonbar';
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
    bar.append(label,select);
    // Use the heading's existing row rather than introducing a new page-wide bar.
    target.appendChild(bar);

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