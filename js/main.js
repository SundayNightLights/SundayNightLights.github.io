(()=>{
 'use strict';
 const D=window.SNL_DATA, teamMap=Object.fromEntries(D.teams.map(t=>[t.id,t]));
 const page=document.body.dataset.page||'home';
 const FEED_URL='/SNL-Calendar-Hub/site-data.json';
 let feed=null;
 let feedFailed=false;
 const escapeHtml=value=>String(value??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
 const regular=()=>feed?.regularSeason||[];
 const weekGames=week=>regular().filter(g=>g.week===week).sort((a,b)=>(a.slot-b.slot)||(a.diamond-b.diamond));
 const fmtDate=date=>date?new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(date+'T12:00:00Z')):'Date pending';
 const dateLabel=date=>fmtDate(date).toUpperCase();
 const gameStart=g=>g.startLabel||g.time?.split(/[–—-]/)[0]?.trim()||'Slot '+g.slot;
 const diamondCode=g=>`Diamond ${g.diamond} • ${g.diamond===1?'Near':'Far'}`;
 const gameCard=g=>({a:g.away,h:g.home,time:gameStart(g),d:`DIAMOND ${g.diamond} • ${g.diamond===1?'NEAR':'FAR'}`,field:diamondCode(g)});
 const latestResultsWeek=()=>[...new Set(regular().filter(g=>g.status==='Final').map(g=>g.week))].sort((a,b)=>b-a)[0]||null;
 // SNL live mode must be asserted by a trusted, verified scoring integration.
 // Never infer LIVE from scheduled times, incomplete scores, or the GameChanger embed.
 const allScheduledGames=()=>[...regular(),...(Array.isArray(feed?.playoffs)?feed.playoffs:[])];
 const hasConfirmedLiveScoring=()=>{
   const live=feed?.liveScoring;
   if(live?.confirmed!==true||!Array.isArray(live.activeGameIds)||!live.activeGameIds.length)return false;
   const activeIds=new Set(live.activeGameIds.filter(id=>typeof id==='string'));
   return allScheduledGames().some(g=>activeIds.has(g.id)&&g.status!=='Final'&&g.status!=='Not Necessary');
 };
 const torontoNowMinute=()=>{
   const parts=new Intl.DateTimeFormat('en-US',{
     timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit',
     hour:'2-digit',minute:'2-digit',hourCycle:'h23'
   }).formatToParts(new Date());
   const p=Object.fromEntries(parts.map(part=>[part.type,part.value]));
   return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
 };
 const selectedFall=()=>{
   let id=new URLSearchParams(location.search).get('season');
   if(!id){try{id=localStorage.getItem('snl-selected-season-v1');}catch(_){}}
   return !id||id==='F26';
 };
 const scheduledGamesActive=()=>{
   if(!selectedFall())return false;
   const now=torontoNowMinute();
   return allScheduledGames().some(g=>{
     if(g.status==='Final'||g.status==='Not Necessary')return false;
     if(typeof g.date!=='string'||g.date.length!==10||
        typeof g.timeStart!=='string'||g.timeStart.length!==5||
        typeof g.timeEnd!=='string'||g.timeEnd.length!==5)return false;
     const endDate=g.timeEnd<g.timeStart
       ?new Date(Date.parse(g.date+'T12:00:00Z')+86400000).toISOString().slice(0,10)
       :g.date;
     return now>=g.date+'T'+g.timeStart && now<endDate+'T'+g.timeEnd;
   });
 };
 const tickerGameTimeAlert=()=>selectedFall()&&(hasConfirmedLiveScoring()||scheduledGamesActive());
 const nextScheduledGame=()=>{
   const now=torontoNowMinute();
   return allScheduledGames().filter(g=>
     g.status!=='Final'&&g.status!=='Not Necessary'&&
     typeof g.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(g.date)&&
     typeof g.timeStart==='string'&&/^\d{2}:\d{2}$/.test(g.timeStart)&&
     `${g.date}T${g.timeStart}`>=now
   ).sort((a,b)=>`${a.date}T${a.timeStart}`.localeCompare(`${b.date}T${b.timeStart}`))[0]||null;
 };
 const liveCentreCard=()=>{
   if(!selectedFall())return '';
   if(hasConfirmedLiveScoring())return `<a href="live.html#snlOfficialFeed" class="gamecenter live-status-card is-live" aria-label="View confirmed live SNL games"><span class="live-card-kicker"><span class="live-card-status-dot" aria-hidden="true"></span>LIVE NOW</span><strong>LIVE GAME CENTRE</strong><span class="live-card-detail">GAMES IN PROGRESS</span><small>View live coverage</small></a>`;
   if(scheduledGamesActive())return `<a href="live.html#snlOfficialFeed" class="gamecenter live-status-card is-game-time" aria-label="Games are scheduled now; GameChanger live scoring may not be available"><span class="live-card-kicker"><span class="live-card-status-dot" aria-hidden="true"></span>GAME TIME</span><strong>LIVE GAME CENTRE</strong><span class="live-card-detail">SCHEDULED GAMES NOW</span><small>Live scoring not guaranteed</small></a>`;
   const next=nextScheduledGame();
   if(!next)return '';
   const date=new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',weekday:'short',month:'short',day:'numeric'}).format(new Date(next.date+'T12:00:00Z')).toUpperCase().replace(',', ' ·');
   const time=next.startLabel||gameStart(next);
   return `<a href="live.html" class="gamecenter live-status-card is-upcoming" aria-label="Next SNL games start ${escapeHtml(date)} at ${escapeHtml(time)} Eastern Time"><span class="live-card-kicker">UPCOMING</span><strong>LIVE GAME CENTRE</strong><span class="live-card-detail">${escapeHtml(date)} · ${escapeHtml(time)}</span><small>Games start at · ET</small></a>`;
 };
 function syncScoreboardGameWindow(){
   if(!selectedFall())return;
   const title=document.querySelector('#siteHeader .scorehead h2');
   const track=document.getElementById('scoreTrack');
   if(!title||!track)return;
   let dot=title.querySelector('.scoreboard-live-dot');
   if(tickerGameTimeAlert()){
     if(!dot){
       dot=document.createElement('span');
       dot.className='scoreboard-live-dot';
       dot.setAttribute('aria-hidden','true');
       title.insertBefore(dot,title.firstChild);
     }
     dot.title=hasConfirmedLiveScoring()?'Confirmed live scoring':'Scheduled game time; live scoring not confirmed';
   }else if(dot){dot.remove();}
   const markup=liveCentreCard();
   if(track.dataset.snlLiveCard===markup)return;
   track.querySelector('.live-status-card')?.remove();
   if(markup)track.insertAdjacentHTML('afterbegin',markup);
   track.dataset.snlLiveCard=markup;
 }
 function torontoToday(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;}
 function upcomingWeek(){if(!feed)return 2;const today=torontoToday();const g=regular().filter(g=>g.status!=='Final'&&g.date>=today).sort((a,b)=>a.date.localeCompare(b.date)||a.slot-b.slot)[0];return g?.week||regular().filter(g=>g.status!=='Final').sort((a,b)=>a.week-b.week)[0]?.week||10;}
 const requestedWeek=()=>{const w=Number(new URLSearchParams(location.search).get('week'));return Number.isInteger(w)&&w>=1&&w<=10?w:upcomingWeek()};
 const feedNotice=()=>feed?'':'<div class="notice">Schedule and standings are temporarily unavailable. Please check back shortly.</div>';
 const validatedFeed=data=>data&&data.schemaVersion===1&&Array.isArray(data.regularSeason)&&data.regularSeason.length===60&&Array.isArray(data.standings)&&data.standings.length===6&&Array.isArray(data.playoffs)&&data.playoffs.length===15&&data.regularSeason.every(g=>teamMap[g.away]&&teamMap[g.home]&&Number.isInteger(g.week)&&g.week>=1&&g.week<=10);
 const im=(id,cl='',alt='')=>`<img src="${id==='morsl'?'assets/morsl.webp?v=morsl-excel-20261105':(window.__ASSET_DATA?.[id+'.webp']||'assets/'+id+'.webp')}" class="${cl}" alt="${alt||teamMap[id]?.name||''}" loading="lazy">`;
 const primaryNav=[['home','Home','index.html'],['schedule','Schedule','schedule.html'],['standings','Standings','standings.html'],['teams','Teams','teams.html'],['live','Live','live.html'],['stats','Stats','stats.html'],['highlights','News','highlights.html']];
 const extraNav=[['playoffs','Playoffs','playoffs.html'],['tournaments','Tournaments','tournaments.html'],['rules','Rules','rules.html'],['about','About','about.html']];
 const playoffInNav=()=>{
   // Promote Playoffs when the second-to-last playing week begins.
   // Using playing weeks (rather than subtracting calendar days) handles holiday breaks.
   const games=regular().filter(g=>Number.isInteger(g.week)&&
     typeof g.date==='string'&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(g.date));
   const weeks=[...new Set(games.map(g=>g.week))].sort((a,b)=>a-b);
   if(weeks.length<2)return false;
   const previewWeek=weeks[weeks.length-2];
   const dates=games.filter(g=>g.week===previewWeek).map(g=>g.date).sort();
   return dates.length>0&&dates[0]<=torontoToday();
 };
 const navActive=k=>page===k||(page==='article'&&k==='highlights')||(page==='team'&&k==='teams');
 const navLinks=items=>items.map(([k,label,href])=>`<a href="${href}" class="${navActive(k)?'active':''}">${label}</a>`).join('');
 const navMarkup=()=>{
   const postseason=playoffInNav();
   const main=postseason?[...primaryNav.slice(0,3),extraNav[0],...primaryNav.slice(3)]:primaryNav;
   const more=postseason?extraNav.slice(1):extraNav;
   return navLinks(main)+
     `<details class="nav-more${more.some(([k])=>navActive(k))?' active':''}"><summary>More <span aria-hidden="true">⌄</span></summary><div class="nav-more-menu">${navLinks(more)}</div></details>`;
 };
 const cal='https://sundaynightlights.github.io/SNL-Calendar-Hub/subscribe.html';
 const insta='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="17.3" cy="6.8" r="1.4" fill="currentColor"/></svg>';
 const calendarIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M7 3v5M17 3v5M3 10h18" stroke="currentColor" fill="none" stroke-width="2"/></svg>';
 const title=(a,b,right='')=>`<div class="section-top"><div><h2>${a} <em>${b}</em></h2><div class="section-rule"></div></div>${right?`<span>${right}</span>`:''}</div>`;
 const sectionHead=(a,b,action='',href='')=>`<div class="section-top"><div><h2>${a} <em>${b}</em></h2><div class="section-rule"></div></div>${action?`<a href="${href}">${action}</a>`:''}</div>`;
 function header(){return `<header id="top">
  <div class="utility"><div class="wrap utility-in"><nav class="utility-links" aria-label="League participation"><a class="utility-link${navActive('registration')?' active':''}" href="registration.html"${page==='registration'?' aria-current="page"':''}>Register</a><a class="utility-link utility-link-join${navActive('join')?' active':''}" href="join.html"${page==='join'?' aria-current="page"':''}>Join SNL</a></nav><span class="venue">MARKHAM SPORTS DOME · ONTARIO</span><div class="socials"><a class="social-pill instagram-follow" href="https://www.instagram.com/snl_416/" target="_blank" rel="noopener noreferrer" aria-label="Follow @snl_416 on Instagram" title="Follow @snl_416 on Instagram">${insta}<span class="instagram-follow-text">Follow<span class="instagram-follow-handle"> @snl_416</span></span></a><span class="utility-divider"></span><a class="calendar-pill" href="${cal}" target="_blank" rel="noopener noreferrer">${calendarIcon}<span>Subscribe to Calendar</span></a></div></div></div>
 <div class="masthead"><div class="wrap masthead-in"><a href="index.html" class="brand" aria-label="Sunday Night Lights home"><span class="brand-mark">S<i>N</i>L</span><span class="brand-divider"></span><span class="brand-txt"><b>SUNDAY NIGHT<br>LIGHTS</b><small>OFFICIAL LEAGUE HUB</small></span></a><button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="siteNav">☰</button><nav class="nav" id="siteNav" aria-label="Main navigation">${navMarkup()}</nav></div></div>
 <div class="scoreboard"><div class="wrap"><div class="scorehead"><h2>${tickerGameTimeAlert()?`<span class="scoreboard-live-dot" aria-hidden="true"></span>`:''}<span class="brand-mark scoreboard-label-snl">S<i>N</i>L</span> <span class="scoreboard-label-score">SCOREBOARD</span></h2><span class="right-text">${latestResultsWeek()?`WEEK ${latestResultsWeek()} · ${dateLabel(weekGames(latestResultsWeek())[0].date)} · RESULTS`:'SCHEDULE & RESULTS'}</span></div><div class="score-viewport"><button type="button" class="scorebtn ticker-arrow ticker-arrow-prev" data-score-step="-1" aria-label="Scroll scoreboard left" aria-controls="scoreTrack"><span aria-hidden="true">‹</span></button><div class="scoretrack" id="scoreTrack">${liveCentreCard()}${latestResultsWeek()?weekGames(latestResultsWeek()).map(g=>`<div class="scorecard ${g.status==='Final'?'':'pending'}"><div class="scoremeta">${g.status==='Final'?'FINAL':'PENDING'}<span>WEEK ${g.week}</span></div><div class="scoreteam">${im(g.away)}<span>${teamMap[g.away].short}</span><b>${g.awayScore??'—'}</b></div><div class="scoreteam">${im(g.home)}<span>${teamMap[g.home].short}</span><b>${g.homeScore??'—'}</b></div></div>`).join(''):'<div class="scorecard pending"><div class="scoremeta">LIVE DATA</div><div class="scoreteam">No verified results available</div></div>'}</div><button type="button" class="scorebtn ticker-arrow ticker-arrow-next" data-score-step="1" aria-label="Scroll scoreboard right" aria-controls="scoreTrack"><span aria-hidden="true">›</span></button></div></div></div>
 </header>`;}
 function footer(){return `<footer class="footer snl-footer" aria-label="SNL footer">
   <div class="snl-footer-main">
     <div class="snl-footer-top">
       <strong class="snl-footer-wordmark">SUNDAY <em>NIGHT</em> LIGHTS</strong>
       <a class="snl-footer-instagram" href="https://www.instagram.com/snl_416/" target="_blank" rel="noopener noreferrer" aria-label="Follow SNL on Instagram @snl_416">${insta}<span>@snl_416</span></a>
     </div>
     <span class="snl-footer-venue">Markham Sports Dome · Markham, Ontario</span>
     <nav class="snl-footer-links" aria-label="Footer navigation">
       <a href="about.html">About</a>
       <a href="rules.html">Rules</a>
       <a href="join.html">Join SNL</a>
       <a href="${cal}" target="_blank" rel="noopener noreferrer">Calendar</a>
     </nav>
   </div>
   <div class="snl-footer-bottom">© ${new Date().getFullYear()} Sunday Night Lights</div>
 </footer>`;}
 const ribbon=()=>`<div class="logo-ribbon" aria-label="SNL team logos">${['buffaloes','outcasts','morsl','iht','maul','raccoons'].map(id=>`<a class="logo-team ${id}" href="team.html?team=${id}" title="${teamMap[id].name}">${im(id,'',teamMap[id].name)}</a>`).join('')}</div>`;
 const hero=()=>`<section class="hero" aria-label="Sunday Night Lights dome banner and team logos"><div class="hero-banner"><img src="assets/snl-dome-banner.webp" alt="Sunday Night Lights logo over the Markham Sports Dome" fetchpriority="high"></div>${ribbon()}</section>`;
 const positions={buffaloes:'buffaloes',maul:'maul',raccoons:'raccoons',iht:'iht',morsl:'morsl',outcasts:'outcasts'};
 function teamHalf(id,side){const t=teamMap[id];return `<div class="half ${side} half--${id}"><div class="teamart" aria-hidden="true"></div><span class="position-label">${side.toUpperCase()}</span><span class="half-label">${t.name}</span></div>`;}
 function matchup(g){return `<div class="match" aria-label="${teamMap[g.a].short} away at ${teamMap[g.h].short}, ${g.time}, ${g.field}">${teamHalf(g.a,'away')}${teamHalf(g.h,'home')}<div class="slash"></div><div class="matchtime"><b>${g.time}</b><small>${g.d}</small></div></div>`;}

 // "All" reuses the compact SNL previous-results scoreboard card design.
 function overviewScorecard(g){
   const finished=g.status==='Final';
   const status=finished?'FINAL':(g.date < torontoToday()?'PENDING':'SCHEDULED');
   const time=escapeHtml(gameStart(g));
   const diamond=escapeHtml(diamondCode(g));
   const away=teamMap[g.away], home=teamMap[g.home];
   return '<article class="scorecard snl-overview-scorecard' + (finished?'':' snl-scheduled') +
     '" aria-label="' + escapeHtml(away.name+' at '+home.name+', '+(finished?'final':'scheduled')+', '+gameStart(g)+', '+diamondCode(g)) + '">' +
     '<div class="scoremeta"><span>' + status + '</span><span>' + time + ' · ' + diamond + '</span></div>' +
     '<div class="scoreteam">' + im(g.away) + '<span>' + escapeHtml(away.short) + '</span>' +
       (finished?'<b>'+escapeHtml(g.awayScore??'—')+'</b>':'') + '</div>' +
     '<div class="scoreteam">' + im(g.home) + '<span>' + escapeHtml(home.short) + '</span>' +
       (finished?'<b>'+escapeHtml(g.homeScore??'—')+'</b>':'') + '</div></article>';
 }

 function allWeeksPanel(full=false,selectedWeek=null){
   if(!regular().length) return '<div class="panel"><div class="panel-foot">Live schedule unavailable.</div></div>';
   const label=selectedWeek===null?'All regular-season weeks':'Week '+selectedWeek+' results';
   let html='<div class="snl-all-weeks ' + (full?'snl-all-weeks-full':'snl-all-weeks-home') +
     '" aria-label="' + label + '"' + (full?'':' tabindex="0"') + '>';
   const weeks=selectedWeek===null?Array.from({length:10},(_,i)=>i+1):[selectedWeek];
   for(const week of weeks){
     const games=weekGames(week);
     if(!games.length) continue;
     html+='<section class="snl-week-group"><div class="panel-h"><span>' +
       dateLabel(games[0].date) + '</span><small>WEEK ' + week + '</small></div>' +
       '<div class="snl-week-scorecards">' + games.map(overviewScorecard).join('') + '</div></section>';
   }
   return html+'</div>';
 }

 function gamesPanel(all=false,week=upcomingWeek()){
  const games=weekGames(week);
  if(!games.length)return `<div class="panel"><div class="panel-h"><span>LEAGUE SCHEDULE</span></div><div class="panel-foot">Live schedule unavailable.</div></div>`;
  // Score entry controls EACH game independently. Passing a date does not turn
  // an unscored diagonal matchup into a final-results card.
  const isFinal=g=>g.status==='Final' &&
    Number.isInteger(g.awayScore) && Number.isInteger(g.homeScore);
  if(games.every(isFinal))return allWeeksPanel(all,week);
  const someFinal=games.some(isFinal);
  const cards=games.map(g=>isFinal(g)?overviewScorecard(g):matchup(gameCard(g))).join('');
  return `<div class="panel"><div class="panel-h"><span>${dateLabel(games[0].date)}</span><small>WEEK ${week}</small></div><div class="matches ${all?'large-matches':''} ${someFinal?'snl-mixed-games':''}">${cards}</div>${all?`<div class="panel-foot">All times local to Markham · ${D.venue} · Diamond 1 • Near and Diamond 2 • Far</div>`:''}</div>`;
 }
 function standingsTable(compact=true){
  const rows=feed?.standings||[];
  return `<div class="panel"><div class="panel-h"><span>REGULAR SEASON</span><small>2 WIN · 1 TIE</small></div><table class="standings"><thead><tr><th>TEAM</th><th>GP</th><th>W</th>${compact?'':'<th>T</th>'}<th>L</th>${compact?'':'<th>RF</th><th>RA</th><th>C-RD</th>'}<th>PTS</th></tr></thead><tbody>${rows.map(r=>{const t=teamMap[r.team];return `<tr><td><a href="team.html?team=${t.id}" class="team-id">${im(t.id)}<span>${t.name}</span></a></td><td>${r.gp}</td><td>${r.wins}</td>${compact?'':`<td>${r.ties}</td>`}<td>${r.losses}</td>${compact?'':`<td>${r.runsFor}</td><td>${r.runsAgainst}</td><td>${r.cappedRunDiff??'—'}</td>`}<td>${r.points}</td></tr>`}).join('')||`<tr><td colspan="${compact?5:9}">Live standings unavailable</td></tr>`}</tbody></table><div class="panel-foot">${feed?'Provisional standings based on entered scores. Official final seeding may require additional tie-breakers or a draw.':'Live standings are temporarily unavailable.'}</div></div>`;
 }


 function expandedStandingsTable(){
   // Rankings come from the existing published standings; derived fields from completed games.
   const rows=feed?.standings||[];
   const finals=regular().filter(g=>g.status==='Final'&&Number.isInteger(g.awayScore)&&Number.isInteger(g.homeScore)&&teamMap[g.away]&&teamMap[g.home]);
   const outcome=(g,id)=>{
     const scored=g.away===id?g.awayScore:g.homeScore,allowed=g.away===id?g.homeScore:g.awayScore;
     return scored>allowed?'W':scored<allowed?'L':'T';
   };
   const record=games=>{
     let w=0,l=0,t=0;
     for(const result of games){if(result==='W')w++;else if(result==='L')l++;else t++;}
     return w+'-'+l+'-'+t;
   };
   const signed=n=>n>0?'+'+n:String(n);
   const rowHtml=r=>{
     const team=teamMap[r.team];if(!team)return '';
     const played=finals.filter(g=>g.away===r.team||g.home===r.team).sort((a,b)=>
       a.date.localeCompare(b.date)||(a.slot-b.slot)||(a.diamond-b.diamond)||
       String(a.id??'').localeCompare(String(b.id??'')));
     const outcomes=played.map(g=>outcome(g,r.team));
     const home=played.filter(g=>g.home===r.team).map(g=>outcome(g,r.team));
     const away=played.filter(g=>g.away===r.team).map(g=>outcome(g,r.team));
     const last5=outcomes.slice(-5);
     let streak='—';
     if(outcomes.length){
       const last=outcomes[outcomes.length-1];let count=0;
       for(let i=outcomes.length-1;i>=0&&outcomes[i]===last;i--)count++;
       streak=last+count;
     }
     const capped=played.reduce((sum,g)=>{
       const diff=g.away===r.team?g.awayScore-g.homeScore:g.homeScore-g.awayScore;
       return sum+Math.max(-7,Math.min(7,diff));
     },0);
     const pct=r.gp>0?(r.points/(2*r.gp)*100).toFixed(1)+'%':'—';
     const values=[
       r.gp,r.wins,r.losses,r.ties,r.points,pct,r.runsFor,r.runsAgainst,
       signed(r.runDiff??r.runsFor-r.runsAgainst),signed(capped),record(home),record(away),record(last5),streak
     ];
     return '<tr><td class="snl-standings-rank">'+escapeHtml(r.rank??'—')+'</td>'+
       '<td class="snl-standings-team"><a href="team.html?team='+team.id+'" class="team-id">'+im(team.id)+'<span>'+escapeHtml(team.name)+'</span></a></td>'+
       values.map((value,i)=>'<td class="'+(i===4?'snl-standings-points':'')+'">'+escapeHtml(value??'—')+'</td>').join('')+'</tr>';
   };
   const headings=[
     ['RANK','Provisional rank'],['TEAM','Team'],['GP','Games Played'],['W','Wins'],
     ['L','Losses'],['T','Ties'],['PTS','Standings Points'],['PTS%','Points Percentage'],
     ['RF','Runs For'],['RA','Runs Against'],['RD','Uncapped Run Differential'],
     ['RD ±7','Run Differential capped at seven per game'],['HOME','Home W-L-T record'],
     ['AWAY','Away W-L-T record'],['L5','Last five W-L-T record'],['STREAK','Current results streak']
   ];
   return '<div class="panel snl-expanded-standings"><div class="panel-h"><span>REGULAR SEASON</span><small>2 PTS WIN · 1 PT TIE</small></div>'+
     '<div class="snl-standings-scroll-hint">Scroll horizontally for all statistics <span aria-hidden="true">↔</span></div>'+
     '<div class="snl-expanded-scroll" role="region" tabindex="0" aria-label="Full standings, horizontally scrollable">'+
     '<table class="standings snl-expanded-table"><thead><tr>'+headings.map(([label,title])=>'<th scope="col" title="'+title+'">'+label+'</th>').join('')+'</tr></thead>'+
     '<tbody>'+(rows.map(rowHtml).join('')||'<tr><td colspan="16">Live standings unavailable.</td></tr>')+'</tbody></table></div>'+
     '<div class="panel-foot">'+(feed?'Provisional standings from entered scores. RD ±7 is capped per game; HOME, AWAY and L5 show W-L-T. Final seeding may require a draw.':'Live standings are temporarily unavailable.')+'</div></div>';
 }

  function leaders(){return `<div class="leader-cards">${[['Batting Average','AVG'],['Home Runs','HR'],['Runs Batted In','RBI'],['Hits','H']].map(([t,s])=>`<div class="leader-card"><b>${t.toUpperCase()}</b><small>${s}</small><strong>—</strong><span>Awaiting verified player statistics</span></div>`).join('')}</div>`;}
 function storyArt(s){if(s.id==='opener')return `${im('raccoons','one','')}${im('buffaloes','two','')}`;if(s.id==='expansion')return `${im('morsl','one','')}${im('iht','two','')}${im('maul','three','')}`;if(s.id==='trade')return `${im('maul','one','')}${im('iht','two','')}`;return ''}
 function stories(){return `<div class="stories-viewport"><button type="button" class="story-arrow story-arrow-prev" data-story-step="-1" aria-label="Previous featured stories"><span aria-hidden="true">‹</span></button><div class="stories" aria-label="Featured story carousel">${D.stories.map(s=>`<a class="story ${s.id}" href="article.html?id=${s.id}" aria-label="Read ${s.title}"><div class="story-illustration"><img class="story-poster" src="assets/story-${s.id}.webp" alt="" loading="lazy"></div><span class="story-tag">${s.tag}</span><div class="story-bottom"><h3>${s.title}</h3><small>SNL NEWS · FEATURE</small></div></a>`).join('')}</div><button type="button" class="story-arrow story-arrow-next" data-story-step="1" aria-label="Next featured stories"><span aria-hidden="true">›</span></button></div>`;}
 function home(){return `${hero()}<section class="section" id="featured">${sectionHead('FEATURED','STORIES','VIEW ALL STORIES ›','highlights.html')}${stories()}<div class="newsline"><b>LEAGUE NEWS</b><span class="news-updates"><span><strong>NOV 2</strong> Time slots changed for Weeks 2, 8 &amp; 9. <a class="news-inline-link" href="schedule.html">Check schedule ›</a></span></span><a href="highlights.html#league-news">VIEW ALL NEWS ›</a></div></section><section class="split"><div><div class="section-top"><div><h2>UPCOMING <em>GAMES</em></h2><div class="section-rule"></div></div><a href="schedule.html">VIEW FULL SCHEDULE ›</a></div>${gamesPanel(false)}</div><div><div class="section-top"><div><h2>LEAGUE <em>STANDINGS</em></h2><div class="section-rule"></div></div><a href="standings.html">FULL TABLE ›</a></div>${standingsTable(true)}</div></section><section class="section">${sectionHead('LEAGUE','LEADERS','VIEW ALL STATS ›','stats.html')}<p class="hint" style="margin:0 0 13px">Player batting leaders · GameChanger statistics</p>${leaders()}</section><section class="join-home-prompt"><div><strong>INTERESTED IN JOINING SNL?</strong><p>Bring a team or join as a free agent. Explore your options for future sessions.</p></div><a class="join-home-action" href="join.html">JOIN SNL ›</a></section><section class="flat-card" style="display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap"><div><b style="color:var(--yellow);font-size:13px">PLAYER REGISTRATION &amp; WAIVERS</b><p class="section-note" style="margin:6px 0 0">Roster registration and league waivers are being prepared.</p></div><a class="neutral-link" href="registration.html">HOW IT WILL WORK ›</a></section>`;}
 const pageHero=(a,b,sub='',action='')=>`<div class="page-hero"><div><h1>${a} <em>${b}</em></h1><p>${sub}</p></div>${action}</div>`;
 function schedule(){const active=requestedWeek();return `${pageHero('SNL','SCHEDULE','2026-27 Fall · Markham Sports Dome')}<div class="filters"><button class="filterbtn" data-week="all">All</button>${Array.from({length:10},(_,i)=>i+1).map(w=>`<button class="filterbtn ${w===active?'active':''}" data-week="${w}">Week ${w}</button>`).join('')}</div><div id="scheduleArea">${gamesPanel(true,active)}</div>${feedNotice()}<div class="notice">Ten playing Sundays · Holiday break December 27, 2026. Times and diamonds may change. Check back for the latest schedule.</div>`;}

 function standingsPage(){return `${pageHero('LEAGUE','STANDINGS','Full regular-season standings and team records.')}<section class="snl-standings-page" aria-label="Expanded league standings">${expandedStandingsTable()}</section>${feedNotice()}<p class="section-note">For ranking and playoff seeding procedures, see <a class="feature-link" href="rules.html?season=F26#standings-tiebreakers">STANDINGS &amp; TIEBREAKER RULES ›</a>.</p>`;}

  function playoffsPage(){return `${pageHero('SNL','PLAYOFFS','Seeds and series will be determined after the regular season.')}<div class="playoff-grid"><div class="round-card"><h3>QUARTERFINALS</h3><div class="series">#3 vs #6<small>Best of 3 · Higher seed home</small></div><div class="series">#4 vs #5<small>Best of 3 · Higher seed home</small></div></div><div class="round-card"><h3>SEMIFINALS</h3><div class="series">#1 vs lowest remaining seed<small>Best of 3</small></div><div class="series">#2 vs other remaining seed<small>Best of 3</small></div></div><div class="round-card"><h3>FINALS</h3><div class="series">Semifinal Winner vs Winner<small>Best of 3 · Championship</small></div></div></div><div class="notice">The top two regular-season seeds receive quarterfinal byes. Series and home assignments will follow the approved SNL playoff rules. No teams are seeded yet.</div>${playoffSlots()}`;}
 function playoffSlots(){if(!feed)return feedNotice();const rounds=['Quarterfinals','Semifinals','Finals'];return `<div class="flat-card"><h2>PLAYOFF GAME SLOTS</h2><p class="section-note">Matchups remain placeholders until official seeding. Game 3 is played only if necessary.</p><div style="overflow-x:auto"><table class="game-table"><thead><tr><th>ROUND</th><th>DATE</th><th>TIME</th><th>DIAMOND</th><th>AWAY</th><th>HOME</th><th>STATUS</th></tr></thead><tbody>${feed.playoffs.map(g=>`<tr><td>${escapeHtml(g.round)}</td><td>${escapeHtml(g.date)}</td><td>${escapeHtml(gameStart(g))}</td><td>${diamondCode(g)}</td><td>${escapeHtml(teamMap[g.away]?.name||g.away)}</td><td>${escapeHtml(teamMap[g.home]?.name||g.home)}</td><td>${g.status==='Not Necessary'?'Not necessary':g.status==='Final'?`${g.awayScore} – ${g.homeScore}`:g.ifNecessary?'If necessary':'Scheduled'}</td></tr>`).join('')}</tbody></table></div></div>`;}
 function teamsPage(){return `${pageHero('SNL','TEAMS','Six clubs. One league. Explore each team’s official logo and future roster.')}<div class="team-grid">${D.teams.map(t=>`<a class="team-card" href="team.html?team=${t.id}">${im(t.id,'',t.name)}<h3>${t.name}</h3><span>VIEW TEAM ›</span></a>`).join('')}</div>`;}

 function teamResultCell(g,teamId){
   if(g.status!=='Final'||!Number.isInteger(g.awayScore)||!Number.isInteger(g.homeScore))return '—';
   const teamScore=g.away===teamId?g.awayScore:g.homeScore;
   const opponentScore=g.away===teamId?g.homeScore:g.awayScore;
   const outcome=teamScore>opponentScore?'W':teamScore<opponentScore?'L':'T';
   const outcomeLabel=outcome==='W'?'Win':outcome==='L'?'Loss':'Tie';
   return '<span class="snl-team-result"><span class="snl-team-result-score">'+
     escapeHtml(g.awayScore+'–'+g.homeScore)+'</span><span class="snl-team-result-badge snl-team-result-'+
     outcome.toLowerCase()+'" aria-label="'+outcomeLabel+'" title="'+outcomeLabel+'">'+outcome+'</span></span>';
 }
 function teamPage(){
  const id=new URLSearchParams(location.search).get('team')||'buffaloes',t=teamMap[id]||teamMap.buffaloes;
  const standing=feed?.standings.find(r=>r.team===t.id);
  const matches=regular().filter(g=>g.away===t.id||g.home===t.id);
  return `${pageHero('TEAM',t.name.toUpperCase(),'Roster, results and season schedule') }<div class="flat-card team-detail">${im(t.id,'',t.name)}<div><h2>${t.name}</h2><p class="section-note">${standing?`${standing.wins}W–${standing.losses}L–${standing.ties}T · ${standing.points} points · Provisional rank ${standing.rank}`:'Live team record is temporarily unavailable.'}</p><a class="neutral-link" href="teams.html">← ALL TEAMS</a></div></div><div class="flat-card"><h2>2026-27 Fall Roster</h2><p class="section-note">Roster pending. No player names or personal information have been published.</p></div><div class="flat-card"><h2>Team Schedule & Results</h2>${matches.length?`<div class="snl-matchups-filter">
<label for="snlOpponentSelect">Opponent</label>
<select id="snlOpponentSelect" aria-label="Filter team matchups by opponent">
<option value="all">All Opponents</option>
${D.teams.filter(op=>op.id!==t.id).sort((a,b)=>a.name.localeCompare(b.name)).map(op=>`<option value="${escapeHtml(op.id)}">${escapeHtml(op.name)}</option>`).join('')}
</select>
<span id="snlMatchupsCount" role="status" aria-live="polite"></span>
</div>` : ''}${matches.length?`<div style="overflow-x:auto"><table class="game-table"><thead><tr><th>WEEK</th><th>DATE</th><th>TIME</th><th>DIAMOND</th><th>MATCHUP</th><th>RESULT</th></tr></thead><tbody id="snlTeamMatchupRows">${matches.map(g=>`<tr data-opponent="${g.away===t.id?g.home:g.away}" data-week="${g.week}" data-home="${g.home===t.id?1:0}"><td><a href="schedule.html?week=${g.week}">W${g.week}</a></td><td>${escapeHtml(g.date)}</td><td>${escapeHtml(gameStart(g))}</td><td>${diamondCode(g)}</td><td>${escapeHtml(teamMap[g.away].short)} @ ${escapeHtml(teamMap[g.home].short)}</td><td>${teamResultCell(g,t.id)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="section-note">Live team schedule temporarily unavailable.</p>'}<a class="feature-link" href="schedule.html">VIEW FULL SNL SCHEDULE ›</a></div>`;
 }

  function statsPage(){return `${pageHero('LEAGUE','STATS','Team performance and individual player leaderboards')}<div class="stat-summary"><div class="stat-box"><b>6</b><small>TEAMS</small></div><div class="stat-box"><b>10</b><small>PLAYING WEEKS</small></div><div class="stat-box"><b>60</b><small>REGULAR-SEASON GAMES</small></div><div class="stat-box"><b>2</b><small>DIAMONDS</small></div></div><section class="section">${sectionHead('TEAM','STATISTICS')}<div style="overflow:auto">${standingsTable(false)}</div></section><section class="section leaders-full">${sectionHead('LEAGUE','LEADERS')}${leaders()}</section><div class="notice">Player statistics will be shown after GameChanger data is connected and verified. No statistics, leaders, or player identities have been invented.</div>`;}

 function livePage(){
   return `${pageHero('SNL','GAME CENTRE','Official GameChanger live scores, innings and game updates')}
   <section class="snl-native-gamecenter" aria-labelledby="snlNativeTitle">
     <div class="snl-native-lede">
       <div><span class="snl-native-eyebrow"><i class="light-dot"></i> SUNDAY NIGHT LIGHTS · LIVE COVERAGE</span>
         <h2 id="snlNativeTitle">FOLLOW THE <em>ACTION</em></h2>
         <p>View live SNL games directly here through GameChanger. The official feed displays game scores and status as games are scored. Upcoming matchups are already on our <a href="index.html">homepage</a> and <a href="schedule.html">Schedule</a>.</p></div>
       <button type="button" class="snl-live-action" id="snlLiveOpen" aria-controls="snlOfficialFeed" aria-expanded="false">VIEW LIVE SCORES <span aria-hidden="true">↓</span></button>
     </div>
   </section>
   <details class="snl-official-feed" id="snlOfficialFeed">
     <summary><span><strong>OFFICIAL LIVE SCORES</strong><small>Open GameChanger to follow the games in progress</small></span><span class="snl-official-chevron" aria-hidden="true">⌄</span></summary>
     <div class="snl-official-body">
       <p class="snl-live-intro">Follow live scores and game updates. Final standings may update after results are confirmed.</p>
       <div class="snl-live-widget-panel">
         <p class="snl-live-status" id="snlGcLoadStatus" role="status">Loading GameChanger scoreboard…</p>
         <div id="gc-scoreboard-widget-snl" aria-label="Official GameChanger live scoreboard"></div>
       </div>
     </div>
   </details>
   <p class="snl-live-note">Live scores may appear before results are reflected in league standings.</p>`;
 }
 function highlightsPage(){return `${pageHero('SNL','HIGHLIGHTS','Featured stories, league news and season developments')}${sectionHead('FEATURED','STORIES')}<section class="section story-archive">${stories()}</section><section class="flat-card league-news-panel" id="league-news"><h2>LEAGUE NEWS · QUICK UPDATES</h2><div class="news-item"><time datetime="2026-11-02">NOV 2, 2026</time><span>Time slots changed for Weeks 2, 8 &amp; 9.</span><a href="schedule.html">VIEW SCHEDULE ›</a></div></section>`;}
 function articlePage(){const id=new URLSearchParams(location.search).get('id')||'opener',s=D.stories.find(s=>s.id===id)||D.stories[0],a=window.SNL_ARTICLES?.[s.id];document.title=s.title+' | Sunday Night Lights';return `<article class="article snl-article"><a href="highlights.html" class="feature-link">← ALL FEATURED STORIES</a><div class="article-head"><span class="article-tag">${a?.category||s.tag}</span><time datetime="${s.id==='opener'?'2026-11-01':s.id==='trade'?'2026-09-30':'2026-09-25'}">${a?.date||'2026'}</time></div><h1>${s.title}</h1><div class="article-content">${a?.body||`<p>${s.dek}</p>`}</div><a class="neutral-link article-back" href="highlights.html">← BACK TO ALL STORIES</a></article>`;}
 function rulesPage(){return `${pageHero('LEAGUE','RULES','League rules · Markham Sports Dome')}<div class="rules-intro"><p>Review the rules below or open the official one-page PDF.</p><a class="rules-download" href="assets/SNL-Rules-2026-27.pdf?v=fall-20261107-innings" target="_blank" rel="noopener noreferrer" download>↓ DOWNLOAD OFFICIAL RULES (PDF)</a></div>

<section class="rules-section" id="league-format"><h2>League Format · 2026–27 Fall</h2>
<p class="section-note">The Fall regular season has six teams playing across ten Sundays, with a holiday break on December 27, 2026. Every team plays two different opponents each playing Sunday: 20 games per team, 60 regular-season games in all. Each pair of teams meets four times over the season, twice with each club designated home.</p></section>
<section class="rules-section" id="standings-tiebreakers"><h2>Standings &amp; Tiebreaker Procedures</h2>
<p class="section-note"><strong>2026–27 Fall scoring:</strong> 2 standings points for a win, 1 for a tie and 0 for a loss. The standings and playoff seeds use the following order:</p>
<ol class="rules-list"><li><strong>Standings points (PTS)</strong> — highest total first.</li>
<li><strong>Most wins (W)</strong> — among teams tied on points.</li>
<li><strong>Head-to-head points</strong> — most points earned in games among the tied teams.</li>
<li><strong>Season capped run differential (RD ±7)</strong> — add each game's run differential after capping it between −7 and +7.</li>
<li><strong>Fewest runs allowed (RA)</strong> — lower regular-season total ranks higher.</li>
<li><strong>Most runs scored (RF)</strong> — higher regular-season total ranks higher.</li>
<li><strong>Draw required</strong> — if teams remain level after all preceding criteria.</li></ol>
<p class="section-note">The uncapped RD column is for reference; <strong>RD ±7</strong> is used for ranking ties. These rules apply to the Fall regular-season standings and playoff seeding.</p></section>
<section class="rules-section" id="playoff-format"><h2>Playoff Format · 2026–27 Fall</h2>
<p class="section-note">The top two regular-season teams receive quarterfinal byes. The quarterfinal matchups are #3 vs #6 and #4 vs #5. Every round is best-of-three; a third game is played only if necessary. <strong>Quarterfinal games are six full innings; semifinals and the championship final are seven full innings</strong>, subject to applicable mercy rules. Home-team assignments follow the published playoff schedule.</p></section>
<section class="rules-section"><h2>Game Format &amp; Batting</h2>
<ol class="rules-list" start="1"><li>Batting lineup can be as long as you wish, no limit.</li><li>Everything is live. Any ball that hits the dome in fair territory and is caught in the air will be recorded as an out. Umpire discretion applies for balls hit into or under bleachers or soccer nets (ground-rule doubles, etc.).</li><li>Games are 35 minutes or 6 innings, whichever comes first. No new inning after 30 minutes. If a game goes over 35 minutes, scores revert to the previous inning. <strong>Playoffs:</strong> Quarterfinals are six full innings; semifinals and finals are seven full innings, subject to the applicable playoff mercy rule.</li><li>1–1 count to start (no Mexican). Wooden board used as strike zone. Legal pitches must be 6–12 feet.</li><li>Intentional walks are allowed.</li><li>Any foul tip that is caught will be an out.</li><li>Home runs can only be scored inside the park.</li></ol></section>
<section class="rules-section"><h2>Runners &amp; Defence</h2><ol class="rules-list" start="8"><li><strong>Courtesy Runners</strong><ul><li>Regular Season: Unlimited courtesy runners per game.</li><li>Playoffs: Maximum 5 courtesy runners. Cannot courtesy a courtesy. The same player may be used for multiple courtesies but not in the same inning.</li><li>Injured players must be declared at the beginning of each game; one courtesy is deducted per injured player per at-bat. If a runner is injured during a play, a courtesy runner is required. If no courtesies remain, the last person out must run.</li></ul></li><li>Any defence allowed, including a 5-man infield with an adjustment. If no one is on base, the fifth infielder (between shortstop and second base) may not throw to first. That infielder may throw to first when a player is already on base. Ten defenders may be on the field. Outfielders may throw runners out at first when a player is already on base.</li><li>Commitment line is in effect (identified by cones). Sliding is allowed, including at home plate. Touching home plate results in an out.</li><li>No bunting or chopped swings; batter is called out.</li></ol></section>
<section class="rules-section"><h2>Mercy Rules, Ties &amp; Playoffs</h2><ol class="rules-list" start="12"><li>Five-run limit per inning; last inning is open.<ul><li>Regular season: No game-ending mercy rule.</li><li>Playoffs: 20-run lead after 4 innings or 15-run lead after 5 innings.</li></ul></li><li><strong>Ties</strong><ul><li>Regular season: Games may end in a tie.</li><li>Playoffs: No ties. Extra innings begin with the last batter on second base and no outs.</li></ul></li><li>Substitution rule applies only to playoffs.<ul><li>One substitute per game; no re-entry. Once a player is replaced, they cannot re-enter that game.</li><li>A player may be added to a game at any point, including into the batting order after play has begun.</li></ul></li></ol></section>
<section class="rules-section"><h2>Eligibility &amp; Sportsmanship</h2><ol class="rules-list" start="15"><li>Players may only play for their rostered teams. No picking up or sharing players from other or eliminated teams.</li><li>Umpires’ decisions are final.</li><li>Please arrive at the diamond on time. Games will begin right away, sometimes early if possible.</li></ol></section>
<div class="rules-end"><strong>Most importantly — let’s have some fun!</strong><p>These rules are transcribed for browsing from the official 2026–27 PDF. For game-day discrepancies, refer to the official PDF and confirm with league officials. The revised 2026–27 Fall PDF includes the current best-of-three playoff series format and inning lengths.</p><a class="rules-download" href="assets/SNL-Rules-2026-27.pdf?v=fall-20261107-innings" target="_blank" rel="noopener noreferrer">VIEW OFFICIAL RULES PDF ↗</a></div>`;}

function tournamentsPage(){return `${pageHero('SNL','TOURNAMENTS','Sunday Night Lights · Tournament information and announcements')}
<section class="flat-card info-landing"><span class="info-kicker">TOURNAMENT HUB</span><h2>TOURNAMENTS</h2><p class="section-note">Tournament details, event formats and registration information will be posted here when officially announced. No tournament dates or entries are currently being advertised on this page.</p><div class="info-links"><a class="neutral-link" href="schedule.html">CURRENT LEAGUE SCHEDULE ›</a><a class="neutral-link" href="rules.html">LEAGUE RULES ›</a></div></section>`;}
function aboutPage(){return `${pageHero('ABOUT','SNL','Sunday Night Lights · Men’s indoor slo-pitch at Markham Sports Dome')}
<section class="flat-card info-landing"><span class="info-kicker">SUNDAY NIGHT LIGHTS</span><h2>FOUR YEARS. SEVEN SEASONS.</h2><p class="section-note">Sunday Night Lights brings six teams together for indoor softball at Markham Sports Dome. Entering its seventh season in its fourth year, SNL expanded from four to six teams for the 2026–27 season.</p><div class="about-numbers"><div><strong>6</strong><span>TEAMS</span></div><div><strong>7</strong><span>SEASONS</span></div><div><strong>2</strong><span>DIAMONDS</span></div></div><p class="section-note">Weekly doubleheaders, competitive regular-season play and best-of-three playoff series lead toward the championship. League updates, results and schedules are published throughout the season.</p><div class="info-links"><a class="neutral-link" href="teams.html">MEET THE TEAMS ›</a><a class="neutral-link" href="join.html">JOIN SNL ›</a><a class="neutral-link" href="rules.html">LEAGUE RULES ›</a></div></section>`;}
function joinPage(){return `${pageHero('JOIN','SNL','Interested in playing Sunday Night Lights?')}
<section class="flat-card info-landing"><span class="info-kicker">GROW WITH SNL</span><h2>HOW WOULD YOU LIKE TO JOIN?</h2><p class="section-note">Whether you have a full team or want to find a place as an individual player, we’d like to hear from you. Participation and availability are subject to league approval; the website is not accepting registrations yet.</p><div class="join-choice-grid"><a href="#join-team" class="join-choice"><span>OPTION 01</span><strong>BRING A TEAM</strong><small>Interested in entering a team in a future SNL session?</small><b>TEAM INTEREST ›</b></a><a href="#join-free-agent" class="join-choice"><span>OPTION 02</span><strong>JOIN AS A FREE AGENT</strong><small>Looking for a team or an opportunity to play?</small><b>PLAYER INTEREST ›</b></a></div></section>
<section class="flat-card join-detail" id="join-team"><span class="info-kicker">PROSPECTIVE TEAMS</span><h2>BRING YOUR TEAM TO SNL</h2><p class="section-note">Contact the league to express interest in a future season. Team spots and league arrangements will be confirmed directly by SNL.</p><a class="neutral-link" href="https://www.instagram.com/snl_416/" target="_blank" rel="noopener noreferrer">MESSAGE SNL ON INSTAGRAM ↗</a></section>
<section class="flat-card join-detail" id="join-free-agent"><span class="info-kicker">INDIVIDUAL PLAYERS</span><h2>LOOKING FOR A TEAM?</h2><p class="section-note">Free agents can get in touch to introduce themselves and ask about possible openings. Placement is not guaranteed and no personal information is collected on this website.</p><a class="neutral-link" href="https://www.instagram.com/snl_416/" target="_blank" rel="noopener noreferrer">MESSAGE SNL ON INSTAGRAM ↗</a></section>
<div class="notice">Already on an SNL team? The separate <a href="registration.html">Registration &amp; Waivers</a> page is for existing-player administration once that process opens.</div>`;}
 function registrationPage(){return `${pageHero('PLAYER','REGISTRATION','Registration, team rosters and league waiver process')}<div class="notice"><b>Registration is not open yet.</b> This is an information page. No form is connected and no personal information is being collected through this website.</div><div class="register-steps"><div class="register-step"><span class="step">STEP 01</span><h3>Player Information</h3><p>Players will provide their name, team, private contact details and optional jersey information.</p></div><div class="register-step"><span class="step">STEP 02</span><h3>League Waiver</h3><p>Players will review and complete the approved SNL waiver through an appropriate secure process.</p></div><div class="register-step"><span class="step">STEP 03</span><h3>Roster Approval</h3><p>League administrators can verify registrations before approved names appear on public team rosters.</p></div></div><div class="flat-card" style="margin-top:18px"><h2>Player Privacy</h2><p class="section-note">Email addresses, phone numbers, and signed waivers will not appear in public player profiles. Registration and waiver storage will be configured before the form goes live.</p></div>`;}
 async function init(){
   document.getElementById('app').innerHTML='<div class="wrap"><div class="notice">Loading the latest SNL schedule and standings…</div></div>';
   try{
     const response=await fetch(FEED_URL,{cache:'no-store'});
     if(!response.ok)throw new Error(`HTTP ${response.status}`);
     const data=await response.json();
     if(!validatedFeed(data))throw new Error('SNL data validation failed');
     feed=data;
   }catch(error){feedFailed=true;console.warn('SNL live feed unavailable',error);}
   document.getElementById('siteHeader').innerHTML=header();
   syncScoreboardGameWindow();
   window.setInterval(syncScoreboardGameWindow,30000);
   const body={home, schedule,live:livePage,standings:standingsPage,playoffs:playoffsPage,teams:teamsPage,team:teamPage,stats:statsPage,highlights:highlightsPage,article:articlePage,rules:rulesPage,tournaments:tournamentsPage,about:aboutPage,join:joinPage,registration:registrationPage}[page]||home;
   document.getElementById('app').innerHTML=`<div class="wrap">${body()}${footer()}</div>`;
   if (location.hash === '#league-news') requestAnimationFrame(() => document.getElementById('league-news')?.scrollIntoView());
   if (location.hash === '#standings-tiebreakers') requestAnimationFrame(() => document.getElementById('standings-tiebreakers')?.scrollIntoView());
   const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
   menu.addEventListener('click',()=>{let open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
   // FOX-style desktop edge controls; only reveal arrows at an edge with hidden scores.
   const scoreTrack=document.getElementById('scoreTrack');
   const scoreButtons=[...document.querySelectorAll('.score-viewport [data-score-step]')];
   const updateScoreArrows=()=>{
     if(!scoreTrack)return;
     const last=Math.max(0,scoreTrack.scrollWidth-scoreTrack.clientWidth);
     for(const btn of scoreButtons){
       const direction=Number(btn.dataset.scoreStep);
       const available=direction<0?scoreTrack.scrollLeft>2:scoreTrack.scrollLeft<last-2;
       const enabled=last>2&&available&&!btn.hidden;
       btn.disabled=!enabled;
       btn.classList.toggle('has-scroll',enabled);
     }
   };
   scoreButtons.forEach(btn=>btn.addEventListener('click',()=>{
     const distance=Math.min(410,Math.max(210,scoreTrack.clientWidth*.75));
     scoreTrack.scrollBy({left:Number(btn.dataset.scoreStep)*distance,behavior:'smooth'});
   }));
   if(scoreTrack){
     scoreTrack.addEventListener('scroll',updateScoreArrows,{passive:true});
     new MutationObserver(updateScoreArrows).observe(scoreTrack,{childList:true});
     if(typeof ResizeObserver==='function')new ResizeObserver(updateScoreArrows).observe(scoreTrack);
     window.addEventListener('resize',updateScoreArrows,{passive:true});
     updateScoreArrows();
   }
   // FOX-style headline carousel. Hover anywhere over the headline cards to reveal
   // only the arrows that can actually scroll more stories.
   document.querySelectorAll('.stories-viewport').forEach(viewport=>{
     const track=viewport.querySelector('.stories');
     const buttons=[...viewport.querySelectorAll('[data-story-step]')];
     if(!track)return;
     const updateArrows=()=>{
       const max=Math.max(0,track.scrollWidth-track.clientWidth);
       buttons.forEach(btn=>{
         const available=Number(btn.dataset.storyStep)<0?track.scrollLeft>2:track.scrollLeft<max-2;
         const enabled=max>2&&available;
         btn.disabled=!enabled;
         btn.classList.toggle('has-scroll',enabled);
       });
     };
     buttons.forEach(btn=>btn.addEventListener('click',()=>{
       const first=track.querySelector('.story');
       const gap=parseFloat(getComputedStyle(track).columnGap)||12;
       const step=(first?.getBoundingClientRect().width||track.clientWidth*.75)+gap;
       track.scrollBy({left:Number(btn.dataset.storyStep)*step,behavior:'smooth'});
     }));
     track.addEventListener('scroll',updateArrows,{passive:true});
     if(typeof ResizeObserver==='function')new ResizeObserver(updateArrows).observe(track);
     window.addEventListener('resize',updateArrows,{passive:true});
     updateArrows();
   });
   document.querySelectorAll('[data-week]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-week]').forEach(b=>b.classList.toggle('active',b===btn));document.getElementById('scheduleArea').innerHTML=btn.dataset.week==='all'?allWeeksPanel(true):gamesPanel(true,Number(btn.dataset.week))}));
   const opponentSelect=document.getElementById('snlOpponentSelect');
   if(opponentSelect){
     const rows=[...document.querySelectorAll('#snlTeamMatchupRows tr')];
     const count=document.getElementById('snlMatchupsCount');
     const applyOpponentFilter=()=>{
       const selected=opponentSelect.value;
       const visible=rows.filter(row=>{
         const show=selected==='all'||row.dataset.opponent===selected;
         row.hidden=!show;
         return show;
       });
       const home=visible.filter(row=>row.dataset.home==='1').length;
       const away=visible.length-home;
       const weeks=[...new Set(visible.map(row=>Number(row.dataset.week)))].sort((a,b)=>a-b);
       if(count)count.textContent=visible.length+' games · '+home+' home · '+away+' away'+
         (selected==='all'?'':' · Weeks '+weeks.join(', '));
     };
     opponentSelect.addEventListener('change',applyOpponentFilter);
     applyOpponentFilter();
   }

 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

// Loads the shared selector for the scoreboard ticker and season-specific pages; source feeds remain unchanged.
document.head.appendChild(Object.assign(document.createElement('script'), {src:'js/season-selector.js?v=snl-rules-20261107'}));
