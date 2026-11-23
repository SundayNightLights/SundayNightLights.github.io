function snlRegistrationDemo(){
  "use strict";
  const root=document.getElementById("snl-reg-preview");
  if(!root||root.dataset.initialized==="yes")return;
  root.dataset.initialized="yes";
  const events={
    fall:{label:"2026–27 Fall League",kind:"indoor",date:"As listed on the official league schedule"},
    winter:{label:"2026–27 Winter League",kind:"indoor",date:"As listed on the official league schedule"},
    tournament:{label:"Sunday Night Lights Third Annual Holiday Tournament",kind:"indoor",date:"Sunday, December 27, 2026"}
  };
  const teams={BUF:"Buffaloes",IHT:"IHT",MOR:"MORSL",OUT:"Outcasts",PM:"Pacific Maul",RAC:"Toronto Raccoons"};
  const demoSeasons={fall:"F26",winter:"W27"};
  const teamName=code=>teams[code]||teams.BUF;
  const readDemoInvite=()=>{
    try{
      const found=(window.location.search||"").match(/(?:^\?|&)snl_demo_invite=([A-Z0-9-]+)/);
      const code=found?found[1]:"";
      const match=/^(BUF|IHT|MOR|OUT|PM|RAC)-(F26|W27)$/.exec(code);
      return match?{team:match[1],event:match[2]==="F26"?"fall":"winter"}:null;
    }catch(_){return null;}
  };
  const incomingInvite=readDemoInvite();
  // Public URLs select a fictional demo screen only — never grant actual staff privileges.
  const demoParam=(name)=>{try{
    const match=(window.location.search||"").match(new RegExp("(?:[?&])"+name+"=([A-Za-z0-9-]+)"));
    return match?match[1]:"";
  }catch(_){return "";}};
  const initialRole=["captain","admin"].includes(demoParam("snl_demo_role"))?demoParam("snl_demo_role"):"public";
  const initialTeam=teams[demoParam("snl_demo_team")]?demoParam("snl_demo_team"):incomingInvite?.team||"BUF";
  const invitationUrl=(team,event)=>"https://sundaynightlights.github.io/registration.html?snl_demo_invite="+encodeURIComponent(team+"-"+demoSeasons[event]);
  const teamChoices=selected=>Object.entries(teams).map(([code,name])=>`<option value="${code}"${sel(selected,code)}>${e(name)}</option>`).join("");
  const sample=()=>({first:"",last:"",email:"",jersey:"",bats:"",throws:"",position:""});
  const st={view:initialRole==="public"?"new":initialRole,step:1,event:incomingInvite?.event||"fall",team:incomingInvite?.team||"BUF",captainTeam:initialTeam,captainEvent:incomingInvite?.event||"fall",invite:incomingInvite,copyStatus:"",samples:{},tournamentRecords:[],nextId:0,adminTeam:initialTeam,adminEvent:incomingInvite?.event||"fall",accessRole:initialRole,assignedTeam:initialTeam,data:sample(),error:"",done:false,skipped:false,editing:false,returning:false,filter:"all",joined:[],tournamentData:{first:"",last:"",email:""}};
  const e=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const sel=(x,y)=>x===y?" selected":"";
  const chk=v=>v?" checked":"";
  const current=()=>events[st.event];
  const status=(name,detail,txt,good)=>`<div class="snl-rp-status-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="snl-rp-pill ${good?"good":"pending"}">${txt}</span></div>`;
  const hasFields=()=>!!(st.data.first.trim()&&st.data.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.data.email.trim())&&/^\d{1,3}$/.test(st.data.jersey.trim())&&["R","L","S"].includes(st.data.bats)&&["R","L"].includes(st.data.throws));
  const hasTournamentFields=()=>!!(st.tournamentData.first.trim()&&st.tournamentData.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.tournamentData.email.trim()));
  // UI role previews only. Real permissions must be checked by a trusted backend.
  const canView=target=>target!=="captain"&&target!=="admin"||
    target==="captain"&&st.accessRole==="captain"||
    target==="admin"&&st.accessRole==="admin";
  const accessDescription=()=>st.accessRole==="captain"
    ?"Captain preview: assigned team "+teamName(st.assignedTeam)+" only. No access to signed waivers."
    :st.accessRole==="admin"
    ?"SNL admin preview: waiver-status checks across teams and the Holiday Tournament. No real documents or signing available."
    :"Public preview: league signup, tournament entry and returning-player examples. No waiver signing.";


  const rosterKey=(team,event)=>team+"-"+event;
  const ensureExamples=(team,event)=>{
    const key=rosterKey(team,event);
    if(!st.samples[key])st.samples[key]=[
      {id:key+"-A",name:"Sample Player A",jersey:"12",team,event,approval:"approved",waiver:"checked"},
      {id:key+"-B",name:"Sample Player B",jersey:"7",team,event,approval:"approved",waiver:"missing"},
      {id:key+"-C",name:"Sample Player C",jersey:"24",team,event,approval:"pending",waiver:"submitted"},
      {id:key+"-D",name:"Sample Player D",jersey:"—",team,event,approval:"pending",waiver:"missing"}
    ];
    return st.samples[key];
  };
  const rosterFor=(team,event)=>[...ensureExamples(team,event),...st.joined.filter(p=>p.team===team&&p.event===event)];
  const isCleared=p=>p.approval==="approved"&&p.waiver==="checked";
  const decisionLabel=p=>p.approval==="approved"?"Approved · demo":p.approval==="declined"?"Declined · demo":"Pending review";
  const waiverLabel=p=>p.waiver==="checked"?"Fictional checked sample":p.waiver==="submitted"?"Fictional received sample":"Not submitted · demo";
  const readinessLabel=p=>p.approval==="declined"?"Declined":isCleared(p)?"Cleared · demo":p.approval!=="approved"&&p.waiver!=="checked"?"Both steps outstanding":p.approval!=="approved"?"Captain approval needed":"Waiver check needed";
  const rosterSummary=players=>`<div class="snl-rp-metrics">
    <div><strong>${players.length}</strong><small>Example entries</small></div>
    <div><strong>${players.filter(isCleared).length}</strong><small>Cleared · demo</small></div>
    <div><strong>${players.filter(p=>p.approval==="pending").length}</strong><small>Captain pending</small></div>
    <div><strong>${players.filter(p=>p.waiver!=="checked").length}</strong><small>Waiver pending · sample</small></div>
  </div>`;
  function rosterCards(players,role){
    return `<div class="snl-rp-review-grid">${players.map(p=>`<article class="snl-rp-review-card">
      <div class="snl-rp-review-top"><div><strong>${e(p.name)}</strong><small>Jersey #${e(p.jersey)} · ${e(teamName(p.team))} · ${e(events[p.event].label)}</small></div><span class="snl-rp-pill ${isCleared(p)?"good":"pending"}">${e(readinessLabel(p))}</span></div>
      <div class="snl-rp-review-details">
        <div><span>Captain decision</span><strong>${e(decisionLabel(p))}</strong></div>
        <div><span>Waiver status</span><strong>${e(waiverLabel(p))}</strong></div>
      </div>
      ${role==="captain"?`<div class="snl-rp-review-actions">
        ${p.approval!=="approved"?`<button type="button" data-captain-decision="approved" data-record-id="${e(p.id)}">Approve roster · demo</button>`:`<button type="button" data-captain-decision="pending" data-record-id="${e(p.id)}">Undo approval</button>`}
        ${p.approval==="pending"?`<button type="button" class="snl-rp-review-decline" data-captain-decision="declined" data-record-id="${e(p.id)}">Decline · demo</button>`:p.approval==="declined"?`<button type="button" data-captain-decision="pending" data-record-id="${e(p.id)}">Restore pending</button>`:""}
      </div>`:`<div class="snl-rp-review-actions">
        ${p.waiver==="missing"?`<button type="button" data-admin-waiver="submitted" data-record-id="${e(p.id)}">Simulate received</button>`:
          p.waiver==="submitted"?`<button type="button" data-admin-waiver="checked" data-record-id="${e(p.id)}">Mark checked · demo</button>`:
          `<button type="button" data-admin-waiver="submitted" data-record-id="${e(p.id)}">Require recheck · demo</button>`}
        ${p.waiver==="submitted"?`<button type="button" class="snl-rp-review-decline" data-admin-waiver="missing" data-record-id="${e(p.id)}">Mark missing · demo</button>`:""}
      </div>`}
    </article>`).join("")}</div>`;
  }
  function tournamentCards(){
    return `<div class="snl-rp-review-grid">${st.tournamentRecords.map(p=>`<article class="snl-rp-review-card">
      <div class="snl-rp-review-top"><div><strong>${e(p.name)}</strong><small>Third Annual Holiday Tournament · December 27, 2026 · Waiver only</small></div>
        <span class="snl-rp-pill ${p.waiver==="checked"?"good":"pending"}">${p.waiver==="checked"?"Checked · demo":"Not checked"}</span></div>
      <div class="snl-rp-review-details"><div><span>Account</span><strong>Not required</strong></div><div><span>Waiver status</span><strong>${e(waiverLabel(p))}</strong></div></div>
      <div class="snl-rp-review-actions">${p.waiver==="submitted"?`<button type="button" data-tournament-waiver="checked" data-record-id="${e(p.id)}">Mark checked · demo</button>`:
        p.waiver==="checked"?`<button type="button" data-tournament-waiver="submitted" data-record-id="${e(p.id)}">Require recheck · demo</button>`:
        `<button type="button" data-tournament-waiver="submitted" data-record-id="${e(p.id)}">Simulate received</button>`}</div>
    </article>`).join("")}</div>`;
  }


  function tournamentIntro(){
    const p=st.tournamentData;
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Tournament entry preview</h3><p>Preview an event-only registration without joining the league. The waiver has not been finalized and cannot be signed here. Use fictional information only.</p></div>
      <div class="snl-rp-demo-event"><small>EXAMPLE TOURNAMENT INVITATION</small><strong>${e(current().label)}</strong><span>Example Tournament Team · Registration preview</span></div>
      <div class="snl-rp-grid">
        <label class="snl-rp-field"><span>First Name <em>Sample only</em></span><input data-tournament="first" value="${e(p.first)}" maxlength="60" placeholder="e.g. Alex" autocomplete="off"></label>
        <label class="snl-rp-field"><span>Last Name <em>Sample only</em></span><input data-tournament="last" value="${e(p.last)}" maxlength="60" placeholder="e.g. Example" autocomplete="off"></label>
        <label class="snl-rp-field"><span>Email <em>Sample only · Not submitted</em></span><input type="email" data-tournament="email" value="${e(p.email)}" placeholder="e.g. alex@example.com" autocomplete="off"></label>
        <div class="snl-rp-field"><span>Event / Team <em>Example event assignment</em></span><div class="snl-rp-disabled">Example Tournament Team · ${e(current().label)}</div></div>
      </div>
      <div class="snl-rp-note"><strong>Entry preview only.</strong> No jersey number, batting side, throwing hand or position is needed. The finalized waiver will be handled separately, and this page cannot satisfy any waiver requirement.</div>
      ${st.error?`<p class="snl-rp-required" role="alert">${e(st.error)}</p>`:""}
      <div class="snl-rp-actions"><button type="button" class="snl-rp-primary" data-action="tournament-next">Continue tournament preview →</button></div></div>`;
  }
  function tournamentComplete(){
    return `<div class="snl-rp-panel snl-rp-complete">
      <div class="snl-rp-success-icon" aria-hidden="true">✓</div>
      <h3>Tournament preview complete</h3>
      <p>You have reached the end of the fictional tournament entry preview. No participant was registered, no waiver was presented or signed, and nothing was saved.</p>
      <div class="snl-rp-summary">
        ${status("Event",e(current().label)+" · Example Tournament Team","Preview only",true)}
        ${status("Waiver","Final version not available on this site","Coming soon",false)}
        ${status("Player account","Not required for tournament-only participants","Not created",true)}
        ${status("Organizer review","Only fictional workflow statuses appear in the admin demo","No real submission",false)}
      </div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="tournament-restart">Try another preview →</button><button type="button" class="snl-rp-primary" data-action="preview-admin">Preview admin workflow (demo) →</button></div>
    </div>`;
  }
  function profile(){
    const d=st.data;
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>${st.editing?"Edit demo profile":"Player registration"}</h3><p>Enter fictional information to test this page. Nothing is saved or submitted.</p></div>
      <div class="snl-rp-demo-event"><small>${st.invite?"CAPTAIN INVITATION · DEMO LINK":"SIMULATED TEAM INVITATION"}</small><strong>${e(teamName(st.team))} · ${e(current().label)}</strong><span>Team and season automatically assigned · Indoor softball</span>${st.invite?'<button type="button" class="snl-rp-invite-exit" data-action="leave-invite">Exit invitation preview</button>':""}</div>
      <div class="snl-rp-grid">
        <label class="snl-rp-field"><span>First Name <em>Required · Public</em></span><input data-field="first" value="${e(d.first)}" maxlength="60" autocomplete="off" placeholder="e.g. Mike"></label>
        <label class="snl-rp-field"><span>Last Name <em>Required · Public</em></span><input data-field="last" value="${e(d.last)}" maxlength="60" autocomplete="off" placeholder="e.g. Sample"></label>
        <label class="snl-rp-field"><span>Email <em>Required · Private in live system</em></span><input type="email" data-field="email" value="${e(d.email)}" autocomplete="off" placeholder="e.g. mike@example.com"></label>
        <label class="snl-rp-field"><span>Jersey Number <em>Required</em></span><input data-field="jersey" value="${e(d.jersey)}" maxlength="3" inputmode="numeric" autocomplete="off" placeholder="e.g. 27 or 00"></label>
        <label class="snl-rp-field"><span>Bats <em>Required</em></span><select data-field="bats"><option value="" disabled${sel(d.bats,"")}>Select batting side</option><option value="R"${sel(d.bats,"R")}>Right</option><option value="L"${sel(d.bats,"L")}>Left</option><option value="S"${sel(d.bats,"S")}>Switch</option></select></label>
        <label class="snl-rp-field"><span>Throws <em>Required</em></span><select data-field="throws"><option value="" disabled${sel(d.throws,"")}>Select throwing hand</option><option value="R"${sel(d.throws,"R")}>Right</option><option value="L"${sel(d.throws,"L")}>Left</option></select></label>
      </div>
      <fieldset class="snl-rp-pref"><legend>Preferred Fielding Area <span>Optional · Choose one</span></legend><div class="snl-rp-checks">
        <label><input type="radio" name="snl-demo-fielding" data-area="IF"${chk(d.position==="IF")}> Infield (includes catcher)</label>
        <label><input type="radio" name="snl-demo-fielding" data-area="OF"${chk(d.position==="OF")}> Outfield</label>
        <label><input type="radio" name="snl-demo-fielding" data-area="P"${chk(d.position==="P")}> Pitcher</label>
        <label><input type="radio" name="snl-demo-fielding" data-area="UTIL"${chk(d.position==="UTIL")}> Utility</label>
      </div>${d.position?'<button type="button" class="snl-rp-clear" data-action="clear-area">Clear preference</button>':""}</fieldset>
      <div class="snl-rp-note"><strong>Professional roster names:</strong> SNL would approve the public first and last name. Legal names are private and requested separately in the future secure waiver system.</div>
      ${st.error?`<p class="snl-rp-required" role="alert">${e(st.error)}</p>`:""}
      <div class="snl-rp-actions"><button type="button" class="snl-rp-primary" data-action="${st.editing?"save-edit":"next"}">${st.editing?"Save demo changes":"Continue registration preview"} →</button></div>
    </div>`;
  }
  function waiver(){
    return `<div class="snl-rp-panel snl-rp-waiver-pending">
      <div class="snl-rp-heading"><h3>Waiver coming soon</h3><p>The SNL indoor participation waiver is still being finalized. The full agreement and signing form are not available on this website yet.</p></div>
      <div class="snl-rp-waiver-placeholder">
        <div class="snl-rp-waiver-placeholder-brand"><img src="assets/snl-ball-white-only-v2.svg" alt="Sunday Night Lights softball logo" width="66" height="66"><div><small>SUNDAY NIGHT LIGHTS</small><strong>WAIVER COMING SOON</strong></div></div>
        <p><strong>There is nothing to sign at this stage.</strong> This page is only a preview of where the completed waiver will appear once SNL has approved the wording and set up secure electronic signing.</p>
        <div class="snl-rp-waiver-placeholder-event"><span>Selected event</span><strong>${e(current().label)}</strong></div>
        <p class="snl-rp-placeholder-disclaimer">No agreement, consent or signature is requested or collected here. Completing this preview does not register you for a real SNL event or satisfy a waiver requirement.</p>
      </div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="back">← Back</button><button type="button" class="snl-rp-primary" data-action="finish">Continue registration preview →</button></div>
    </div>`;
  }
  function completed(){
    const d=st.data;
    return `<div class="snl-rp-panel snl-rp-complete"><div class="snl-rp-success-icon" aria-hidden="true">✓</div><h3>Registration preview complete</h3><p>This is a fictional preview only. No player registration was submitted, no waiver was offered or signed, and no player ID was created.</p>
      <div class="snl-rp-summary">${status("Player profile",e(d.first+" "+d.last)+" · #"+e(d.jersey),"Sample complete",true)}
        ${status("Indoor waiver","Not available for signing · final agreement coming soon","Not signed",false)}
        ${status("Team roster",e(teamName(st.team))+" · "+e(current().label)+" · Administrator review","Pending · demo",false)}
        ${status("SNL Player ID","Issued only after live registration","Not issued",false)}
      </div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="edit">Edit demo profile</button><button type="button" class="snl-rp-primary" data-view="${st.accessRole==="captain"?"captain":st.accessRole==="admin"?"admin":"new"}">${st.accessRole==="captain"?"See captain queue →":st.accessRole==="admin"?"See SNL admin review →":"Return to registration →"}</button></div></div>`;
  }
  function returning(){
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Returning player — demo</h3><p>Preview how a returning player profile could work. The real waiver is not available yet, and no actual player account is loaded.</p></div>
      <div class="snl-rp-example-profile"><div class="snl-rp-avatar">#27</div><div><small>SAMPLE PLAYER ID · SNL-DEMO-104</small><h4>Mike Sample</h4><p>Buffaloes · Bats R · Throws R</p></div><span class="snl-rp-pill">Example</span></div>
      <div class="snl-rp-summary">${status("2026–27 Indoor waiver","Final version still being prepared","Coming soon",false)}${status("2027–28 Indoor waiver","Future waiver requirements to be confirmed","Not available",false)}
      ${status("Selected activity",current().label,"Preview only",true)}</div>
      <div class="snl-rp-note">A player keeps the same SNL ID when changing teams or jersey numbers. Their permanent career stats remain connected, while substitute games can be excluded from official individual stats.</div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="edit-returning">Edit sample profile</button><button type="button" class="snl-rp-primary" data-action="join-returning">Preview returning-player flow →</button></div>
    </div>`;
  }
  function accessPanel(){
    return `<section class="snl-rp-access-preview" aria-label="Staff access demonstration">
      <div class="snl-rp-access-head"><strong>Staff access preview</strong><span>SIMULATION — NOT A LOGIN</span></div>
      <p>Choose a fictional viewing role to see how permissions should differ. Anyone can switch roles here because there are no real accounts, records or private information.</p>
      <div class="snl-rp-access-controls">
        <label class="snl-rp-field"><span>View as</span><select data-demo-role aria-label="Choose simulated access role">
          <option value="public"${sel(st.accessRole,"public")}>Public visitor / player</option>
          <option value="captain"${sel(st.accessRole,"captain")}>Team captain (demo)</option>
          <option value="admin"${sel(st.accessRole,"admin")}>SNL administrator (demo)</option>
        </select></label>
        ${st.accessRole==="captain"?`<label class="snl-rp-field"><span>Fictional team assignment</span><select data-preview-team aria-label="Select example captain team">${teamChoices(st.assignedTeam)}</select></label>`:""}
      </div>
      <p class="snl-rp-access-description">${e(accessDescription())}</p>
      <p class="snl-rp-access-warning">Changing this control is not authentication. Real staff privileges will require verified sign-in and server-side role checks before accepting registrations.</p>
    </section>`;
  }
  function captain(){
    const team=st.captainTeam,event=st.captainEvent,link=invitationUrl(team,event);
    const players=rosterFor(team,event);
    const rows=players.filter(p=>st.filter==="all"||(st.filter==="good")===isCleared(p));
    return `<div class="snl-rp-panel">
      <div class="snl-rp-heading"><h3>Captain invitations &amp; approvals — demo</h3><p>Your fictional team assignment is fixed within this captain dashboard. You can choose the indoor season and approve roster membership, but cannot verify waivers or access other teams. No actual captain login exists.</p></div>
      <div class="snl-rp-captain-picker">
        <div class="snl-rp-admin-note"><strong>Assigned team · demo</strong><span>${e(teamName(team))} — changes only through the access preview above</span></div>
        <label class="snl-rp-field"><span>Indoor Season</span><select data-captain-event><option value="fall"${sel(event,"fall")}>2026–27 Fall League</option><option value="winter"${sel(event,"winter")}>2026–27 Winter League</option></select></label>
      </div>
      <div class="snl-rp-invite-builder">
        <div class="snl-rp-invite-heading"><strong>${e(teamName(team))} invitation</strong><small>${e(events[event].label)}</small></div>
        <p>Example invitation link for <strong>${e(teamName(team))}</strong> and <strong>${e(events[event].label)}</strong>. Anyone can open this link; it is not a secure captain credential.</p>
        <label class="snl-rp-field snl-rp-link-field"><span>Shareable demo URL</span><input type="text" readonly value="${e(link)}" aria-label="Demo captain invitation link"></label>
        <div class="snl-rp-link-actions">
          <button type="button" class="snl-rp-primary" data-action="copy-invite">Copy demo link</button>
          <a class="snl-rp-demo-invite-link" href="${e(link)}" target="_blank" rel="noopener noreferrer">Open link in new tab ↗</a>
          <button type="button" class="snl-rp-secondary" data-action="preview-invite">Preview in this tab</button>
        </div>
        ${st.copyStatus?`<p class="snl-rp-copy-status" role="status">${e(st.copyStatus)}</p>`:""}
        <p class="snl-rp-invite-clarifier">Preview a registration in this tab to see its sample record here. New tabs do not share demo records.</p>
      </div>
      <h4 class="snl-rp-review-heading">Roster approval queue</h4>
      ${rosterSummary(players)}
      <div class="snl-rp-review-legend"><strong>Cleared = captain approved + waiver checked by SNL admin</strong><span>A captain's approval alone never clears a player.</span></div>
      <div class="snl-rp-filter"><button type="button" data-filter="all" aria-pressed="${st.filter==="all"}">All</button><button type="button" data-filter="good" aria-pressed="${st.filter==="good"}">Cleared</button><button type="button" data-filter="pending" aria-pressed="${st.filter==="pending"}">Not cleared</button></div>
      ${rosterCards(rows,"captain")}
      <div class="snl-rp-note"><strong>Captain access in a real system:</strong> team assignment, roster decisions and waiver-status labels only. Captains would never see legal names, email addresses, signatures or the signed waiver document.</div>
    </div>`;
  }
  function admin(){
    const team=st.adminTeam,event=st.adminEvent;
    const holiday=event==="tournament";
    const players=holiday?[]:rosterFor(team,event);
    const rows=players.filter(p=>st.filter==="all"||(st.filter==="good")===isCleared(p));
    return `<div class="snl-rp-panel">
      <div class="snl-rp-heading"><h3>SNL administrator review — demo</h3><p>Review sample waiver completion separately from captain approvals. This page is publicly accessible because it is a simulation; it does not grant administrative access to any real records.</p></div>
      <div class="snl-rp-captain-picker">
        <label class="snl-rp-field"><span>Event</span><select data-admin-event>
          <option value="fall"${sel(event,"fall")}>2026–27 Fall League</option>
          <option value="winter"${sel(event,"winter")}>2026–27 Winter League</option>
          <option value="tournament"${sel(event,"tournament")}>Holiday Tournament · Dec 27</option>
        </select></label>
        ${holiday?`<div class="snl-rp-admin-note"><strong>Waiver-only participants</strong><span>No team account or league roster required</span></div>`:
          `<label class="snl-rp-field"><span>Team</span><select data-admin-team>${teamChoices(team)}</select></label>`}
      </div>
      <div class="snl-rp-review-legend"><strong>Simulation — not verification of a signed agreement</strong><span>“Checked · demo” is only a sample status. No real waiver is available here. These fictional status labels do not confirm a signed agreement.</span></div>
      ${holiday
        ?`<h4 class="snl-rp-review-heading">Holiday Tournament waiver-only checks</h4>
          <div class="snl-rp-metrics"><div><strong>${st.tournamentRecords.length}</strong><small>Sample participants</small></div>
          <div><strong>${st.tournamentRecords.filter(p=>p.waiver==="checked").length}</strong><small>Checked · demo</small></div>
          <div><strong>${st.tournamentRecords.filter(p=>p.waiver!=="checked").length}</strong><small>Need review</small></div></div>
          ${st.tournamentRecords.length?tournamentCards():'<p class="snl-rp-review-empty">No tournament waiver examples yet. Complete the “Tournament waiver only” demo to add one here.</p>'}`
        :`<h4 class="snl-rp-review-heading">${e(teamName(team))} · ${e(events[event].label)}</h4>
          ${rosterSummary(players)}
          <div class="snl-rp-filter"><button type="button" data-filter="all" aria-pressed="${st.filter==="all"}">All</button><button type="button" data-filter="good" aria-pressed="${st.filter==="good"}">Cleared</button><button type="button" data-filter="pending" aria-pressed="${st.filter==="pending"}">Not cleared</button></div>
          ${rosterCards(rows,"admin")}`}
      <div class="snl-rp-note">A real admin system would require authenticated roles, event-specific access checks, secure audit logs and private waiver storage. None are active in this demo.</div>
    </div>`;
  }
  function draw(){
    const steps=`<div class="snl-rp-stepper" aria-label="Registration progress"><span class="${st.step>=1?"current":""}">1 · Profile</span><span class="${st.step>=2?"current":""}">2 · Waiver coming soon</span><span class="${st.step>=3?"current":""}">3 · Preview summary</span></div>`;
    root.innerHTML=`<div class="snl-rp-top"><div><span class="snl-rp-eyebrow">SNL REGISTRATION & WAIVERS</span><h2>${st.view==="captain"&&st.accessRole==="captain"?"Captain dashboard":st.view==="admin"&&st.accessRole==="admin"?"SNL administrator dashboard":"Player registration & waiver demo"}</h2><p>${st.view==="captain"&&st.accessRole==="captain"?"Review your fictional team roster, invitations and approvals.":st.view==="admin"&&st.accessRole==="admin"?"Review fictional league and tournament waiver statuses.":"Test league signup and the indoor tournament waiver-only path."}</p></div><span class="snl-rp-demo-badge">INTERACTIVE DEMO · NO REAL SIGNATURES</span></div>
      ${st.view==="captain"||st.view==="admin"?"":`
${st.invite&&st.view==="new"
        ?`<div class="snl-rp-locked-invite"><strong>Captain invitation · ${e(teamName(st.team))}</strong><span>${e(current().label)} · Automatically assigned by demo invitation</span><button type="button" data-action="leave-invite">Try a different example</button></div>`
        :`<div class="snl-rp-demo-switch"><label><strong>Demo indoor event</strong><span>Opening a captain invitation link fills in the team and season automatically.</span></label><select data-event>${st.view==="tournament"
          ?`<option value="tournament" selected>Third Annual Holiday Tournament · Dec 27, 2026</option>`
          :`<option value="fall"${sel(st.event,"fall")}>Fall League · 2026–27</option><option value="winter"${sel(st.event,"winter")}>Winter League · 2026–27</option>`}</select></div>`}`}
      ${accessPanel()}
      <div class="snl-rp-tabs" role="group" aria-label="Choose demo experience">
        ${st.accessRole==="captain"
          ?`<button type="button" data-view="captain" aria-pressed="${st.view==="captain"}">Captain dashboard</button><button type="button" data-view="new" aria-pressed="${st.view==="new"}">Preview player signup</button>`
          :st.accessRole==="admin"
            ?`<button type="button" data-view="admin" aria-pressed="${st.view==="admin"}">SNL admin dashboard</button><button type="button" data-view="tournament" aria-pressed="${st.view==="tournament"}">Preview tournament entry</button>`
            :`<button type="button" data-view="new" aria-pressed="${st.view==="new"}">League signup</button><button type="button" data-view="tournament" aria-pressed="${st.view==="tournament"}">Tournament entry</button><button type="button" data-view="returning" aria-pressed="${st.view==="returning"}">Returning player</button>`}
      </div>
      ${st.view==="new"?steps+(st.step===1?profile():st.step===2?waiver():completed()):st.view==="tournament"?`<div class="snl-rp-stepper" aria-label="Tournament waiver steps"><span class="${st.step>=1?"current":""}">1 · Participant</span><span class="${st.step>=2?"current":""}">2 · Waiver coming soon</span><span class="${st.step>=3?"current":""}">3 · Preview summary</span></div>`+(st.step===1?tournamentIntro():st.step===2?waiver():tournamentComplete()):st.view==="returning"?returning():st.view==="captain"&&st.accessRole==="captain"?captain():st.view==="admin"&&st.accessRole==="admin"?admin():profile()}
      <p class="snl-rp-footer">Test only. Information exists in this page's temporary memory, not a server or database. Refresh to clear it. Please use fictional details, not real signatures.</p>`;
  }
  root.addEventListener("input",event=>{
    const t=event.target;
    if(t.dataset.field)st.data[t.dataset.field]=t.value;
    if(t.dataset.tournament)st.tournamentData[t.dataset.tournament]=t.value;
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
  });
  root.addEventListener("change",event=>{
    const t=event.target;
    if(t.dataset.field)st.data[t.dataset.field]=t.value;
    if(t.dataset.tournament)st.tournamentData[t.dataset.tournament]=t.value;
    if(t.dataset.demoRole){
      if(!["public","captain","admin"].includes(t.value))return;
      st.accessRole=t.value;
      st.captainTeam=st.assignedTeam;
      st.copyStatus="";
      st.filter="all";
      if(t.value==="captain"){st.view="captain";}
      else if(t.value==="admin"){st.view="admin";if(st.adminEvent==="tournament")st.adminEvent="fall";}
      else {st.view="new";if(st.event==="tournament")st.event="fall";st.step=1;}
      draw();return;
    }
    if(t.dataset.previewTeam&&st.accessRole==="captain"&&teams[t.value]){
      st.assignedTeam=t.value;st.captainTeam=t.value;st.copyStatus="";st.filter="all";draw();return;
    }
    if(t.dataset.event){st.event=t.value;st.invite=null;st.step=1;st.error="";st.done=false;st.editing=false;draw();return;}
    if(t.dataset.captainEvent){st.captainEvent=t.value;st.copyStatus="";draw();return;}
    if(t.dataset.adminTeam){st.adminTeam=t.value;draw();return;}
    if(t.dataset.adminEvent){st.adminEvent=t.value;draw();return;}
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
  });
  root.addEventListener("click",event=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.dataset.view&&!canView(b.dataset.view))return;
    if(b.dataset.view){if(b.dataset.view==="captain"&&st.view==="new"&&st.done){st.captainTeam=st.assignedTeam;st.captainEvent=st.event;}
      if(b.dataset.view==="admin"&&st.view==="tournament")st.adminEvent="tournament";
      if(b.dataset.view==="admin"&&st.view==="new"&&st.done){st.adminTeam=st.team;st.adminEvent=st.event;}
      st.view=b.dataset.view;if(st.view==="tournament"){st.event="tournament";st.invite=null;st.step=1;}else if(st.view==="new"){if(st.event==="tournament")st.event="fall";st.step=1;}st.error="";draw();return;}
    if(b.dataset.filter){st.filter=b.dataset.filter;draw();return;}
    if(b.dataset.captainDecision&&st.view==="captain"&&st.accessRole==="captain"&&st.captainTeam===st.assignedTeam){
      const target=rosterFor(st.captainTeam,st.captainEvent).find(p=>p.id===b.dataset.recordId);
      if(target&&["approved","declined","pending"].includes(b.dataset.captainDecision)){
        target.approval=b.dataset.captainDecision;draw();
      }
      return;
    }
    if(b.dataset.adminWaiver&&st.view==="admin"&&st.accessRole==="admin"&&st.adminEvent!=="tournament"){
      const target=rosterFor(st.adminTeam,st.adminEvent).find(p=>p.id===b.dataset.recordId);
      const next=b.dataset.adminWaiver;
      if(target&&(
        (target.waiver==="missing"&&next==="submitted")||
        (target.waiver==="submitted"&&["checked","missing"].includes(next))||
        (target.waiver==="checked"&&next==="submitted")
      )){target.waiver=next;draw();}
      return;
    }
    if(b.dataset.tournamentWaiver&&st.view==="admin"&&st.accessRole==="admin"&&st.adminEvent==="tournament"){
      const target=st.tournamentRecords.find(p=>p.id===b.dataset.recordId);
      const next=b.dataset.tournamentWaiver;
      if(target&&((target.waiver==="submitted"&&next==="checked")||(target.waiver==="checked"&&next==="submitted")||(target.waiver==="missing"&&next==="submitted"))){
        target.waiver=next;draw();
      }
      return;
    }
    if(b.dataset.action==="preview-invite"&&st.accessRole==="captain"){
      st.invite={team:st.captainTeam,event:st.captainEvent};
      st.team=st.captainTeam;st.event=st.captainEvent;
      st.view="new";st.step=1;st.data=sample();st.error="";
      st.done=false;st.returning=false;st.editing=false;st.skipped=false;draw();return;
    }
    if(b.dataset.action==="preview-admin"){
      st.accessRole="admin";st.adminEvent=st.view==="tournament"?"tournament":st.event;st.view="admin";st.filter="all";draw();return;
    }
    if(b.dataset.action==="leave-invite"){
      st.invite=null;st.team="BUF";st.event="fall";st.view="new";st.step=1;
      st.data=sample();st.error="";st.returning=false;st.done=false;draw();return;
    }
    if(b.dataset.action==="copy-invite"&&st.accessRole==="captain"){
      const link=invitationUrl(st.captainTeam,st.captainEvent);
      if(typeof navigator!=="undefined"&&navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(link).then(()=>{
          st.copyStatus="Demo invitation link copied to clipboard.";draw();
        }).catch(()=>{
          st.copyStatus="Clipboard unavailable. Copy the URL directly from the field above.";draw();
        });
      }else{
        st.copyStatus="Copy the URL directly from the field above.";draw();
      }
      return;
    }
    if(b.dataset.action==="clear-area"){st.data.position="";draw();return;}
    if(b.dataset.action==="tournament-next"){if(!hasTournamentFields()){st.error="Please enter a fictional first name, last name and valid sample email to continue.";draw();return;}st.error="";st.step=2;draw();return;}
    if(b.dataset.action==="tournament-restart"){st.step=1;st.error="";st.tournamentData={first:"",last:"",email:""};draw();return;}
    if(b.dataset.action==="next"||b.dataset.action==="save-edit"){
      if(!hasFields()){st.error="Please complete first name, last name, a valid email, jersey number, bats and throws.";draw();return;}
      st.error="";
      if(b.dataset.action==="save-edit"){st.step=3;st.editing=false;st.skipped=true;}else st.step=2;
      draw();return;
    }
    if(b.dataset.action==="back"){st.step=1;st.error="";draw();return;}
    if(b.dataset.action==="finish"){
      if(st.step!==2||!["new","tournament"].includes(st.view))return;
      st.error="";st.step=3;st.done=true;st.skipped=false;
      if(st.view!=="tournament"&&!st.returning)st.joined.push({id:"joined-"+(++st.nextId),name:st.data.first.trim()+" "+st.data.last.trim(),jersey:st.data.jersey.trim(),team:st.team,event:st.event,approval:"pending",waiver:"missing"});
      if(st.view==="tournament")st.tournamentRecords.push({id:"holiday-"+(++st.nextId),name:st.tournamentData.first.trim()+" "+st.tournamentData.last.trim(),waiver:"missing"});
      draw();return;
    }
    if(b.dataset.action==="edit"){st.step=1;st.editing=true;st.view="new";draw();return;}
    if(b.dataset.action==="restart"){
      st.view="new";st.step=1;st.data=sample();st.error="";st.editing=false;st.returning=false;st.skipped=false;st.done=false;st.invite=null;st.team=st.captainTeam;st.event=st.captainEvent;draw();return;
    }
    if(b.dataset.action==="edit-returning"||b.dataset.action==="join-returning"){
      st.data={first:"Mike",last:"Sample",email:"mike@example.com",jersey:"27",bats:"R",throws:"R",position:"IF"};
      st.error="";st.returning=true;st.view="new";st.editing=b.dataset.action==="edit-returning";
      st.step=st.editing?1:3;st.skipped=st.step===3;draw();return;
    }
  });
  draw();
}
window.SNLRegistrationPreview={init:snlRegistrationDemo};
