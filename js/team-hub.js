(()=>{
 'use strict';
 const DATA=window.SNL_DATA;
 const STAT_URL='https://sundaynightlights.github.io/SNL-Stats-Hub/stats-data.json';
 const SCHEDULE_URL='/SNL-Calendar-Hub/site-data.json';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const torontoToday=()=>{
  const v=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  return v.year+'-'+v.month+'-'+v.day;
 };
 function updateCards(teamId){
   const intro=document.querySelector('.team-detail');
   if(!intro||intro.dataset.hubReady)return false;
   const roster=intro.nextElementSibling, schedule=roster?.nextElementSibling;
   if(!roster||!schedule||!roster.classList.contains('flat-card')||!schedule.classList.contains('flat-card'))return false;
   intro.dataset.hubReady='1';
   // Replace the duplicate page title with a single sports-style team overview.
   if(intro.previousElementSibling?.classList.contains('page-hero')){
     intro.previousElementSibling.remove();
   }
   const team=DATA.teams.find(t=>t.id===teamId);
   intro.classList.add('snl-team-spotlight');
   intro.style.setProperty('--snl-team-accent',team?.secondary||'#63acd9');
   const illustration=document.createElementNS('http://www.w3.org/2000/svg','svg');
   illustration.setAttribute('class','snl-team-sweep');
   illustration.setAttribute('viewBox','0 0 1200 490');
   illustration.setAttribute('preserveAspectRatio','none');
   illustration.setAttribute('aria-hidden','true');
   illustration.innerHTML='<path d="M -30 133 C 260 198, 685 252, 1220 515" fill="none" stroke="#4d9ccb" stroke-width="2.5"/>';
   intro.prepend(illustration);
   const logo=intro.querySelector('img');
   if(logo){
     const medallion=document.createElement('div');
     medallion.className='snl-team-spotlight-medallion';
     logo.before(medallion);
     medallion.append(logo);
   }
   const details=intro.querySelector(':scope > div:not(.snl-team-spotlight-medallion)');
   if(details){
     details.classList.add('snl-team-spotlight-title');
     const heading=details.querySelector('h2');
     if(heading){
       const title=document.createElement('h1');
       title.className='snl-team-spotlight-name';
       title.textContent=heading.textContent;
       heading.replaceWith(title);
       title.before(Object.assign(document.createElement('span'),{className:'snl-team-spotlight-kicker',textContent:'SUNDAY NIGHT LIGHTS · TEAM PROFILE'}));
     }
   }
   const summary=document.createElement('div');
   summary.className='snl-team-spotlight-metrics';
   summary.setAttribute('aria-label','Team season snapshot');
   summary.setAttribute('aria-live','polite');
   summary.id='snlTeamSnapshot';
   const categories=[['RF AVG','Runs scored per completed game','rf-avg'],['RA AVG','Runs allowed per completed game','ra-avg'],['AVG','Mean of reported players','team-avg'],['OPS','Mean of reported players','team-ops']];
   summary.innerHTML=categories.map(([label,title,key])=>
     '<div class="snl-team-spotlight-metric" data-stat="'+key+'"><span>'+label+'</span><strong>—</strong><small>'+title+'</small></div>').join('');
   intro.append(summary);
   const note=document.createElement('p');
   note.className='snl-team-snapshot-note';
   note.textContent='Batting AVG and OPS are averages of reported players, not official team aggregate rates.';
   intro.append(note);

   roster.id='team-roster';schedule.id='team-schedule';
   roster.classList.add('snl-team-hub-section');schedule.classList.add('snl-team-hub-section');
   roster.querySelector('h2').textContent='Roster';
   const rosterNote=roster.querySelector('.section-note');
   if(rosterNote)rosterNote.textContent='The official team roster will appear here after league approval. Players with published batting statistics are not necessarily confirmed roster members.';
   schedule.querySelector('h2').textContent='Schedule & Results';
   const nav=document.createElement('nav');
   nav.className='snl-team-hub-nav';nav.setAttribute('aria-label','Team sections');
   nav.innerHTML=[['team-leaders','Team Leaders'],['team-schedule','Schedule & Results'],['team-stats','Batting Stats'],['team-roster','Roster']].map(([id,label])=>'<a href="#'+id+'">'+label+'</a>').join('');
   const leaders=document.createElement('section');
   leaders.className='flat-card snl-team-hub-section';leaders.id='team-leaders';
   leaders.innerHTML='<div class="snl-team-hub-heading"><h2>Team Leaders</h2><a href="stats.html">ALL LEAGUE STATS ›</a></div>'+
     '<p class="section-note">Current-season player batting leaders.</p><div class="snl-team-leader-grid" id="snlTeamLeaders" aria-live="polite"><p class="section-note">Loading batting leaders…</p></div>';
   const stats=document.createElement('section');
   stats.className='flat-card snl-team-hub-section';stats.id='team-stats';
   stats.innerHTML='<div class="snl-team-hub-heading"><h2>Batting Stats</h2><a href="stats.html">ALL LEAGUE STATS ›</a></div>'+
    '<p class="section-note">Published batting statistics for players on this team.</p>'+
    '<div id="snlTeamBatting" aria-live="polite"><p class="section-note">Loading published batting statistics…</p></div>';
   intro.after(nav,leaders,schedule,stats,roster);
   loadTeam(teamId);
   return true;
 }

 function renderTeamSnapshot(data,id){
   const panel=document.getElementById('snlTeamSnapshot');
   if(!panel)return;
   const standing=Array.isArray(data?.standings)?data.standings.find(r=>r.team===id):null;
   for(const [key,total] of [['rf-avg',standing?.runsFor],['ra-avg',standing?.runsAgainst]]){
     const tile=panel.querySelector('[data-stat="'+key+'"]');
     if(!tile)continue;
     const gp=standing?.gp;
     tile.querySelector('strong').textContent=
       typeof total==='number'&&Number.isFinite(total)&&Number.isInteger(gp)&&gp>0?(total/gp).toFixed(2):'—';
   }
 }
 function renderBatting(data,siteData,id){
   const leaders=document.getElementById('snlTeamLeaders'),batting=document.getElementById('snlTeamBatting');
   const empty=message=>{
     leaders.innerHTML='<p class="section-note">'+esc(message)+'</p>';
     batting.innerHTML='<p class="section-note">'+esc(message)+'</p>';
   };
   const dates=siteData?.regularSeason?.map(g=>g.date).filter(d=>typeof d==='string'&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)).sort()||[];
   const first=dates[0];
   const code=first?(Number(first.slice(5,7))>=8?'F':'W')+first.slice(2,4):'F26';
   const season=Array.isArray(data?.seasons)?data.seasons.find(s=>s.season_id===code):null;
   if(!Array.isArray(season?.players)){empty('No published batting statistics available for this season yet.');return;}
   const players=season.players.filter(p=>p.team_id===id&&typeof p.name==='string'&&p.name.trim()&&p.stats&&typeof p.stats==='object');
   if(!players.length){empty('No published batting statistics for this team yet.');return;}
   const metrics=['GP','PA','AVG','OBP','SLG','OPS','H','2B','3B','HR','RBI'];
   const rates=new Set(['AVG','OBP','SLG','OPS']);
   const value=(p,k)=>typeof p.stats[k]==='number'&&Number.isFinite(p.stats[k])?p.stats[k]:null;
   const fmt=(p,k)=>value(p,k)===null?'—':rates.has(k)?value(p,k).toFixed(3):String(value(p,k));
   const pastWeeks=new Set((siteData?.regularSeason||[]).filter(g=>typeof g.date==='string'&&g.date<torontoToday()&&Number.isInteger(g.week)).map(g=>g.week)).size;
   const minGP=Math.max(1,Math.min(10,pastWeeks));
   // Available GameChanger export contains player rates but not the raw
   // team batting totals needed for official aggregate AVG / OPS.
   // Display the arithmetic mean of players with reported plate appearances.
   for(const key of ['AVG','OPS']){
     const tile=document.querySelector('#snlTeamSnapshot [data-stat="team-'+key.toLowerCase()+'"]');
     if(!tile)continue;
     const samples=players.filter(p=>(value(p,'PA')??0)>0)
       .map(p=>value(p,key)).filter(n=>n!==null);
     const average=samples.length?samples.reduce((sum,n)=>sum+n,0)/samples.length:null;
     tile.querySelector('strong').textContent=average===null?'—':average.toFixed(3);
     tile.querySelector('small').textContent=samples.length?
       'Avg. of '+samples.length+' reported batters':'No reported batting data';
     tile.title='Arithmetic mean of reported player '+key+' values (not official aggregate team '+key+')';
   }
   leaders.innerHTML=[['AVG','Batting Average'],['HR','Home Runs'],['RBI','Runs Batted In'],['H','Hits']].map(([key,label])=>{
     const ranked=players.filter(p=>value(p,key)!==null&&(!rates.has(key)||(value(p,'GP')??0)>=minGP))
       .sort((a,b)=>value(b,key)-value(a,key)||a.name.localeCompare(b.name));
     const winner=ranked[0],qualified=winner&&(rates.has(key)||value(winner,key)>0);
     return '<div class="snl-team-leader"><span>'+esc(label)+'</span><strong>'+(qualified?esc(fmt(winner,key)):'—')+'</strong>'+
       '<b>'+(qualified?esc(winner.name):'No qualifying leader yet')+'</b>'+
       (rates.has(key)?'<small>Minimum '+minGP+' GP</small>':'')+'</div>';
   }).join('');
   const ordered=[...players].sort((a,b)=>(value(b,'OPS')??-1)-(value(a,'OPS')??-1)||a.name.localeCompare(b.name));
   batting.innerHTML='<div class="snl-team-batting-scroll"><table class="game-table snl-team-batting-table" aria-label="Team player batting statistics">'+
     '<thead><tr><th>PLAYER</th>'+metrics.map(k=>'<th>'+k+'</th>').join('')+'</tr></thead><tbody>'+
     ordered.map(p=>'<tr><td>'+esc(p.name)+'</td>'+metrics.map(k=>'<td>'+esc(fmt(p,k))+'</td>').join('')+'</tr>').join('')+
     '</tbody></table></div><p class="section-note">'+players.length+' players with published batting statistics. This is not an official roster.</p>';
 }
 async function loadTeam(id){
   const [schedule,batting]=await Promise.allSettled([
     fetch(SCHEDULE_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Schedule HTTP '+r.status);return r.json();}),
     fetch(STAT_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Stats HTTP '+r.status);return r.json();})
   ]);
   const scheduleData=schedule.status==='fulfilled'?schedule.value:null;
   renderTeamSnapshot(scheduleData,id);
   if(batting.status==='fulfilled')renderBatting(batting.value,scheduleData,id);
   else{
     const msg='<p class="section-note">Published batting statistics are temporarily unavailable.</p>';
     document.getElementById('snlTeamLeaders').innerHTML=msg;
     document.getElementById('snlTeamBatting').innerHTML=msg;
   }
 }
 function boot(){
   const id=new URLSearchParams(location.search).get('team');
   const teamId=DATA.teams.some(t=>t.id===id)?id:'buffaloes';
   const app=document.getElementById('app');
   if(!app)return;
   if(updateCards(teamId))return;
   const observer=new MutationObserver(()=>{
     if(updateCards(teamId))observer.disconnect();
   });
   observer.observe(app,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
 else boot();
})();
