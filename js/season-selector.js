/*
 * SNL shared season selector (website-only first stage).
 * The calendar feed currently represents F26. Do not display it as W27.
 * Season labels are visitor-facing; permanent game IDs remain unchanged.
 */
(() => {
  'use strict';

  // Every page has the scoreboard. Only these pages display season-specific body content.
  const seasonPages = new Set(['home','schedule','standings','teams','team','playoffs','stats']);
  const page = document.body?.dataset.page || 'home';

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
    '.scorehead{flex-wrap:nowrap;}',
    '.scorehead .snl-seasonbar{display:inline-flex;align-items:stretch;gap:0;flex:0 0 auto;margin-left:auto;white-space:nowrap;border:1px solid #d1b52e;border-radius:9px;overflow:hidden;background:#133653;}',
    '.scorehead .snl-seasonbar label{display:flex;align-items:center;justify-content:center;background:#ffde19;color:#071c31;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;padding:0 10px;}',
    '.scorehead .snl-season-select-wrap{position:relative;display:inline-flex;align-items:center;background:#143654;}',
    '.scorehead .snl-season-select-wrap::after{content:"⌄";font-family:Arial,sans-serif;font-size:21px;font-weight:900;line-height:1;color:#ffde19;position:absolute;right:9px;top:45%;transform:translateY(-50%);pointer-events:none;}',
    '.scorehead .snl-seasonbar select{-webkit-appearance:none;appearance:none;background:transparent;color:#fff;border:0;border-radius:0;outline:0;padding:9px 28px 9px 11px;width:183px;max-width:183px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.025em;cursor:pointer;}',
    '.scorehead .snl-seasonbar select:focus-visible{outline:2px solid #fff;outline-offset:-3px;}',
    '.scorehead .snl-seasonbar select option{background:#143654;color:#fff;}',
    '.scorehead .right-text{margin-left:auto;}',
    '@media(max-width:1100px){.scorehead .right-text{display:none;}}',
    '.snl-ticker-soon{opacity:1!important;flex:1 0 220px;max-width:560px;padding:14px 16px;}',
    '.snl-ticker-soon .scoremeta{margin-bottom:9px;}',
    '.snl-ticker-soon .scoreteam{line-height:1.5;font-weight:700;color:#d7e7f2;white-space:normal;}',
    '.snl-unpublished{border:1px solid #496d88;border-radius:14px;background:#0d2d49;color:#fff;padding:32px;margin:24px 0;}',
    '.snl-unpublished small{color:#ffde19;letter-spacing:.13em;font-weight:900;font-size:11px;}',
    '.snl-unpublished h2{font-size:clamp(22px,3vw,32px);margin:12px 0;}',
    '.snl-unpublished p{color:#c6d7e5;line-height:1.6;max-width:670px;}',
    '.snl-unpublished button{margin-top:18px;border:1px solid #ffde19;color:#ffde19;background:transparent;border-radius:9px;padding:10px 16px;font-weight:900;cursor:pointer;}',
    '@media(max-width:800px){.scorehead .snl-seasonbar select{width:160px;max-width:160px;font-size:11px;}.scorehead .snl-seasonbar label{padding:0 8px;font-size:9px;}}',
    '@media(max-width:480px){.scorehead{gap:5px;}.scorehead h2{font-size:12px;letter-spacing:.35px;}.scorehead .snl-seasonbar{margin-left:auto;}.scorehead .snl-seasonbar select{width:min(139px,38vw);max-width:38vw;font-size:10px;padding:8px 23px 8px 7px;letter-spacing:0;}.scorehead .snl-seasonbar label{padding:0 7px;font-size:8px;letter-spacing:.01em;}.scorehead .snl-season-select-wrap::after{right:6px;font-size:17px;}.scorehead .scorebtn{display:none;}}',
    '@media(max-width:380px){.scorehead h2{font-size:11px;letter-spacing:0;}.scorehead .snl-seasonbar select{width:34vw;max-width:34vw;}.scorehead .snl-seasonbar label{padding:0 5px;}}',
    // Preserve existing GameChanger stats data flow.
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
    if (selected.id === current.id || !seasonPages.has(page)) return;
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
      const hero = wrap.querySelector(':scope > .page-hero');
      // Keep the page title; prevent archived or unpublished seasons showing Fall data.
      // GameChanger still updates its stats DOM asynchronously, so keep that DOM hidden
      // rather than removing nodes needed by its existing data callbacks.
      const statsRoot = page === 'stats' ? wrap.querySelector('#gc-stats') : null;
      if (statsRoot) {
        statsRoot.hidden = true;
        statsRoot.setAttribute('aria-hidden','true');
      }
      for (const child of [...wrap.children]) {
        if (child !== footer && child !== hero && child !== statsRoot) child.remove();
      }
      wrap.insertBefore(unpublished(), statsRoot || footer || null);
    }
  }

  function syncTicker() {
    if (selected.id === current.id) return; // Preserve the existing verified Fall feed.
    const head = document.querySelector('#siteHeader .scorehead');
    const track = document.getElementById('scoreTrack');
    if (!head || !track) return;

    const text = head.querySelector('.right-text');
    if (text) text.textContent = selected.label.toUpperCase() + ' · COMING SOON';
    head.closest('.scoreboard')?.querySelectorAll('[data-score-step]').forEach(btn => {
      btn.hidden = true;
      btn.disabled = true;
    });
    // No Winter feed has been published. Never relabel Fall scores as Winter scores.
    const notice = document.createElement('div');
    notice.className = 'scorecard snl-ticker-soon';
    notice.setAttribute('role','status');
    const heading = document.createElement('div');
    heading.className = 'scoremeta';
    heading.textContent = selected.label.toUpperCase() + ' · COMING SOON';
    const message = document.createElement('div');
    message.className = 'scoreteam';
    message.textContent = 'Schedule and results will appear when this season is published.';
    notice.append(heading,message);
    track.replaceChildren(notice);
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
    const target = header?.querySelector('.scorehead');
    if (!target || !wrap?.querySelector('.footer')) return false;
    // The Stats page swaps its initial content for a GameChanger view.
    // For Winter, don't hide nodes until GameChanger has completed that swap.
    if (page === 'stats' && !wrap.querySelector('#gc-stats')) return false;
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
      // Keep the control compact; the scoreboard communicates Coming Soon for unpublished seasons.
      option.textContent = s.label;
      option.selected = s.id === selected.id;
      select.appendChild(option);
    }
    select.addEventListener('change',() => navigateTo(select.value));
    const selectWrap = document.createElement('span');
    selectWrap.className = 'snl-season-select-wrap';
    selectWrap.appendChild(select);
    bar.append(label,selectWrap);
    // One compact selector beside SNL SCOREBOARD on every page.
    target.appendChild(bar);

    const footer = wrap.querySelector('.footer');
    if (footer?.lastElementChild) footer.lastElementChild.textContent = selected.label;
    syncTicker();
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