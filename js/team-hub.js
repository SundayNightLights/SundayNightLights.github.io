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
