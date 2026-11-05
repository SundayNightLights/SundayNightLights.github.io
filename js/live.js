/* SNL GameChanger organization scoreboard.
 * Uses the league widget ID supplied by SNL. GameChanger owns scores and updates.
 * The Fall widget is never shown for an unpublished Winter season.
 */
(() => {
  'use strict';

  const widgets = {
    F26: 'd964e6f8-13f0-4f66-8322-03f948ffad34'
  };
  const storageKey = 'snl-selected-season-v1';
  const querySeason = new URLSearchParams(location.search).get('season');
  let savedSeason = null;
  try { savedSeason = localStorage.getItem(storageKey); } catch (_) {}
  const season = ['F26','W27'].includes(querySeason || savedSeason) ? (querySeason || savedSeason) : 'F26';
  const widgetId = widgets[season];
  if (!widgetId) return;

  let started = false;

  function mount() {
    const container = document.getElementById('gc-scoreboard-widget-snl');
    if (!container || started) return false;
    started = true;

    const status = document.getElementById('snlGcLoadStatus');
    const fail = () => {
      if (status) {
        status.hidden = false;
        status.textContent = 'GameChanger could not load right now. Refresh this page to try again.';
      }
    };
    const initialize = () => {
      if (!window.GC || !window.GC.scoreboard || typeof window.GC.scoreboard.init !== 'function') {
        fail();
        return;
      }
      try {
        const result = window.GC.scoreboard.init({
          target: '#gc-scoreboard-widget-snl',
          widgetId,
          maxVerticalGamesVisible: 6
        });
        if (status) status.hidden = true;
        if (result && typeof result.catch === 'function') result.catch(fail);
      } catch (error) {
        console.warn('SNL GameChanger widget initialization failed',error);
        fail();
      }
    };

    if (window.GC?.scoreboard?.init) {
      initialize();
    } else {
      const sdk = document.createElement('script');
      sdk.src = 'https://widgets.gc.com/static/js/sdk.v1.js';
      sdk.async = true;
      sdk.addEventListener('load',initialize,{once:true});
      sdk.addEventListener('error',fail,{once:true});
      document.head.appendChild(sdk);
    }
    return true;
  }

  function start() {
    if (mount()) return;
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.getElementById('app') || document.documentElement,{childList:true,subtree:true});
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',start,{once:true});
  } else start();
})();
