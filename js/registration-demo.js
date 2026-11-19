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
  const invitationUrl=(team,event)=>"https://sundaynightlights.github.io/registration.html?snl_demo_invite="+encodeURIComponent(team+"-"+demoSeasons[event]);
  const teamChoices=selected=>Object.entries(teams).map(([code,name])=>`<option value="${code}"${sel(selected,code)}>${e(name)}</option>`).join("");
  const sample=()=>({first:"",last:"",email:"",jersey:"",bats:"",throws:"",position:""});
  const blankWaiver=()=>({code:""});
  const st={view:"new",step:1,event:incomingInvite?.event||"fall",team:incomingInvite?.team||"BUF",captainTeam:incomingInvite?.team||"BUF",captainEvent:incomingInvite?.event||"fall",invite:incomingInvite,copyStatus:"",samples:{},tournamentRecords:[],nextId:0,adminTeam:incomingInvite?.team||"BUF",adminEvent:incomingInvite?.event||"fall",data:sample(),waiver:blankWaiver(),error:"",done:false,skipped:false,editing:false,returning:false,filter:"all",joined:[],tournamentData:{first:"",last:"",email:""}};
  const e=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const sel=(x,y)=>x===y?" selected":"";
  const chk=v=>v?" checked":"";
  const current=()=>events[st.event];
  const status=(name,detail,txt,good)=>`<div class="snl-rp-status-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="snl-rp-pill ${good?"good":"pending"}">${txt}</span></div>`;
  const hasFields=()=>!!(st.data.first.trim()&&st.data.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.data.email.trim())&&/^\d{1,3}$/.test(st.data.jersey.trim())&&["R","L","S"].includes(st.data.bats)&&["R","L"].includes(st.data.throws));
  const hasTournamentFields=()=>!!(st.tournamentData.first.trim()&&st.tournamentData.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.tournamentData.email.trim()));
  const hasWaiver=()=>st.waiver.code.trim().toUpperCase()==="DEMO";

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
  const waiverLabel=p=>p.waiver==="checked"?"Checked · demo":p.waiver==="submitted"?"Demo completed · review needed":"Not completed · demo";
  const readinessLabel=p=>p.approval==="declined"?"Declined":isCleared(p)?"Cleared · demo":p.approval!=="approved"&&p.waiver!=="checked"?"Both steps outstanding":p.approval!=="approved"?"Captain approval needed":"Waiver check needed";
  const rosterSummary=players=>`<div class="snl-rp-metrics">
    <div><strong>${players.length}</strong><small>Example entries</small></div>
    <div><strong>${players.filter(isCleared).length}</strong><small>Cleared · demo</small></div>
    <div><strong>${players.filter(p=>p.approval==="pending").length}</strong><small>Captain pending</small></div>
    <div><strong>${players.filter(p=>p.waiver!=="checked").length}</strong><small>Waiver needs review</small></div>
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
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Tournament waiver only</h3><p>For players joining an SNL tournament without signing up for a league or creating a website account. Enter sample information only.</p></div>
      <div class="snl-rp-demo-event"><small>EXAMPLE TOURNAMENT INVITATION</small><strong>${e(current().label)}</strong><span>Example Tournament Team · Indoor waiver</span></div>
      <div class="snl-rp-grid">
        <label class="snl-rp-field"><span>Legal First Name <em>Required for real waiver · Private</em></span><input data-tournament="first" value="${e(p.first)}" maxlength="60" placeholder="e.g. Alex" autocomplete="off"></label>
        <label class="snl-rp-field"><span>Legal Last Name <em>Required for real waiver · Private</em></span><input data-tournament="last" value="${e(p.last)}" maxlength="60" placeholder="e.g. Example" autocomplete="off"></label>
        <label class="snl-rp-field"><span>Email <em>For waiver confirmation · Private</em></span><input type="email" data-tournament="email" value="${e(p.email)}" placeholder="e.g. alex@example.com" autocomplete="off"></label>
        <div class="snl-rp-field"><span>Event / Team <em>Already assigned by captain invitation</em></span><div class="snl-rp-disabled">Example Tournament Team · ${e(current().label)}</div></div>
      </div>
      <div class="snl-rp-note"><strong>Waiver only.</strong> No jersey number, batting side, throwing hand or position is needed. The real organizer would see completion status, not the participant's private waiver details.</div>
      ${st.error?`<p class="snl-rp-required" role="alert">${e(st.error)}</p>`:""}
      <div class="snl-rp-actions"><button type="button" class="snl-rp-primary" data-action="tournament-next">Review full tournament waiver →</button></div></div>`;
  }
  function tournamentComplete(){
    return `<div class="snl-rp-panel snl-rp-complete">
      <div class="snl-rp-success-icon" aria-hidden="true">✓</div>
      <h3>Tournament waiver demo complete</h3>
      <p>No league registration, website account, permanent player ID or official waiver record has been created. This is only a test confirmation.</p>
      <div class="snl-rp-summary">
        ${status("Event",e(current().label)+" · Example Tournament Team","Demo only",true)}
        ${status("Waiver",current().kind==="indoor"?"Indoor draft":"Outdoor draft","Demo completed",true)}
        ${status("Player account","Not required for tournament-only participants","Not created",true)}
        ${status("Organizer verification","Would be shown in the authorized event dashboard","Example only",true)}
      </div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="tournament-restart">Test another waiver →</button><button type="button" class="snl-rp-primary" data-view="admin">View simulated admin check →</button></div></div>`;
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
      <div class="snl-rp-actions"><button type="button" class="snl-rp-primary" data-action="${st.editing?"save-edit":"next"}">${st.editing?"Save demo changes":"Continue to waiver demo"} →</button></div>
    </div>`;
  }
  function waiver(){
    const isTournament=st.event==="tournament";
    const displayName=st.view==="tournament"&&st.tournamentData.first.trim()&&st.tournamentData.last.trim()
      ? e(st.tournamentData.first.trim()+" "+st.tournamentData.last.trim())+" (fictional example)"
      : "[Entered privately when the live waiver is signed]";
    const team=isTournament?"Example Tournament Team":teamName(st.team);
    return `<div class="snl-rp-panel">
      <div class="snl-rp-heading"><h3>Indoor participation waiver — demo</h3><p>Review SNL's indoor waiver v0.7 for the selected season. This is a demonstration only; no actual waiver is signed here.${st.view==="tournament"?" A tournament-only participant does not need an SNL website account.":""}</p></div>
      <article class="snl-rp-waiver snl-rp-waiver-full" aria-label="SNL indoor player participation waiver v0.7 working draft">
        <header class="snl-rp-legal-head">
          <div class="snl-rp-waiver-label">REVIEW DRAFT · NOT A VALID SIGNING FORM</div>
          <div class="snl-rp-waiver-brand"><img src="assets/snl-ball-white-only-v2.svg" alt="Sunday Night Lights softball logo — SNL on a ball" width="90" height="90"></div>
          <div class="snl-rp-legal-brand">SUNDAY NIGHT LIGHTS</div>
          <h4>PLAYER PARTICIPATION &amp; LIABILITY WAIVER</h4>
          <p class="snl-rp-legal-subtitle">Indoor Softball — Leagues, Playoffs &amp; Tournaments</p>
          <p class="snl-rp-legal-version">Version 0.7 · Final working draft · Demo only</p>
        </header>
        <div class="snl-rp-legal-warning"><strong>DEMO ONLY — NO LEGAL SIGNATURES.</strong> This agreement is displayed for review and testing. It has not been legally validated or configured for collection of actual signatures. Please use fictional details only. No submitted information or signature records are saved.</div>
        <section class="snl-rp-legal-section"><h4>1. Participant Information &amp; Waiver Coverage</h4>
          <p><strong>Full Legal Name:</strong> ${displayName}</p>
          <p><strong>Team:</strong> ${e(team)} (demo assignment)</p>
          <p><strong>Initial Event:</strong> ${e(current().label)} (automatically assigned in this example)</p>
          <p><strong>Event Date:</strong> ${e(current().date)}</p>
          <p><strong>Indoor Season Coverage:</strong> 2026–27 indoor season (start and end dates to be confirmed before live signing).</p>
          <p><strong>League Officials:</strong> Rob Bebeacua and Bryan Magpayo.</p>
          <p>I confirm that I am at least 18 years old and am voluntarily participating in softball activities organized or authorized by Sunday Night Lights (SNL).</p>
          <p>This agreement applies to SNL indoor leagues, regular-season games, playoffs, tournaments, warmups, batting practice and directly related authorized softball activities during the coverage period identified above. It is intended to cover multiple qualifying SNL indoor events within that period without requiring a separate signature for each event.</p>
        </section>
        <section class="snl-rp-legal-section"><h4>2. Acknowledgment &amp; Assumption of Risks</h4>
          <p>I understand that indoor softball involves risks that may result in serious injury, permanent disability or death.</p>
          <p>These risks include, but are not limited to:</p>
          <ul>
            <li>Being struck by batted, thrown or foul softballs, swinging bats, thrown or accidentally released bats, or other equipment.</li>
            <li>Collisions with players, officials or spectators, including collisions while fielding balls or running the bases.</li>
            <li>Injuries from running, sliding, diving, throwing, catching, batting, fielding, warmups or other physical exertion.</li>
            <li>Slips, trips and falls on artificial turf, bases or other playing surfaces.</li>
            <li>Contact with walls, netting, barriers, benches, bleachers, soccer goalposts or other structures within or near the playing area.</li>
            <li>Equipment failure, fatigue, unsafe playing conditions and other foreseeable or unforeseen hazards.</li>
          </ul>
          <p>Injuries may include cuts, fractures, head or facial injuries, concussions, spinal injuries and other serious or permanent harm.</p>
          <p>I understand that some structures and equipment may be located near foul lines or in areas where players attempt to field or retrieve balls.</p>
          <p><strong>I voluntarily accept and assume the risks associated with participating in SNL indoor softball activities.</strong></p>
        </section>
        <section class="snl-rp-legal-section"><h4>3. Player Responsibilities &amp; Release of Liability</h4>
          <p>I agree to follow SNL rules, respect officials and participants, use equipment responsibly and exercise reasonable care for my safety and the safety of others.</p>
          <p>I understand that participation is voluntary and that I may choose not to participate if I believe conditions are unsafe.</p>
          <div class="snl-rp-release"><strong>RELEASE OF LIABILITY — PLEASE READ CAREFULLY</strong>
            <p>In consideration of being permitted to participate, I agree to release Sunday Night Lights (SNL), its league officials, including Rob Bebeacua and Bryan Magpayo, and its organizers, administrators, directors, officers, volunteers, employees and representatives acting on behalf of SNL from claims, demands, actions, damages, losses or expenses arising from my participation in covered SNL indoor softball activities, including claims involving personal injury, permanent disability, death or property loss, and claims alleging negligence by these parties, to the extent permitted by applicable law.</p>
            <p><strong>I understand that by signing this agreement, I may be giving up certain legal rights, including the right to bring a claim against the released parties for injuries arising from their negligence, to the extent permitted by law.</strong></p>
          </div>
        </section>
        <section class="snl-rp-legal-section"><h4>4. League Coverage, Statistics &amp; Media</h4>
          <p>I understand that SNL operates a public website and social media channels providing regular league and tournament coverage.</p>
          <p>This may include player names, team rosters, game results, statistics, standings, awards, trades, player features, interviews, weekly recaps, photographs, video highlights and historical league records.</p>
          <p>I understand that I may appear in photographs or videos taken during SNL activities and that identifiable content may be published as part of ordinary league coverage, subject to applicable privacy and consent requirements.</p>
          <p>This coverage documents SNL activities and does not imply commercial endorsement by any player. Uses outside ordinary league coverage may require separate permission.</p>
          <p><strong>Questions, corrections or privacy concerns:</strong> <a href="mailto:sundaynightlights416@gmail.com">sundaynightlights416@gmail.com</a> · Instagram <a href="https://www.instagram.com/snl_416/" target="_blank" rel="noopener noreferrer">@snl_416</a>.</p>
          <p>Personal contact information, private legal identity details and signed waiver records will not be publicly displayed. Access to these records will be restricted to authorized SNL administrators for legitimate league administration and recordkeeping.</p>
        </section>
        <section class="snl-rp-legal-section"><h4>5. Participant Acknowledgment &amp; Signature</h4>
          <p>By signing, I confirm that:</p>
          <ul><li>I have read and understand this agreement.</li>
            <li>I understand the risks associated with indoor softball.</li>
            <li>I voluntarily accept those risks.</li>
            <li>I understand the release of liability and its intended effect on my legal rights.</li>
            <li>I acknowledge SNL's ordinary league and tournament coverage practices.</li></ul>
          <p>I am signing this agreement voluntarily.</p>
          <p><strong>Electronic Signature:</strong> [Participant would sign in a future secure system]</p>
          <p><strong>Date Signed:</strong> [Automatically recorded only when real signing is enabled]</p>
        </section>
        <div class="snl-rp-legal-end">SNL · INDOOR WAIVER v0.7 · DEMO ONLY · NO REAL SIGNATURES</div>
      </article>
      <div class="snl-rp-demo-ack"><p class="snl-rp-demo-sign-notice"><strong>Simulate completing the waiver.</strong> Type DEMO below. This does not create an agreement, obtain consent, or submit any private information.</p>
        <label class="snl-rp-field"><span>Demo confirmation code <em>Type DEMO, not your legal name or signature</em></span><input data-waiver="code" value="${e(st.waiver.code)}" maxlength="4" autocomplete="off" placeholder="DEMO"></label>
      </div>
      ${st.error?`<p class="snl-rp-required" role="alert">${e(st.error)}</p>`:""}
      <div class="snl-rp-note"><strong>Demo safety:</strong> No personal details, electronic signatures or waiver records are uploaded or stored by this page. Refresh to erase test entries.</div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="back">← Back</button><button type="button" class="snl-rp-primary" data-action="finish">Complete demo →</button></div>
    </div>`;
  }
  function completed(){
    const d=st.data;
    return `<div class="snl-rp-panel snl-rp-complete"><div class="snl-rp-success-icon" aria-hidden="true">✓</div><h3>Demo registration complete</h3><p>This is a simulated confirmation. No real registration was submitted, no waiver was signed and no SNL player ID was created.</p>
      <div class="snl-rp-summary">${status("Player profile",e(d.first+" "+d.last)+" · #"+e(d.jersey),"Sample complete",true)}
        ${status("Indoor waiver",st.skipped?"Existing sample waiver reused":"Demo completed · admin check needed",st.skipped?"Reused · sample":"Not checked · demo",st.skipped)}
        ${status("Team roster",e(teamName(st.team))+" · "+e(current().label)+" · Administrator review","Pending · demo",false)}
        ${status("SNL Player ID","Issued only after live registration","Not issued",false)}
      </div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="edit">Edit demo profile</button><button type="button" class="snl-rp-primary" data-view="captain">See captain roster →</button></div></div>`;
  }
  function returning(){
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Returning player — demo</h3><p>Test how SNL would reuse an existing player account and an already valid waiver.</p></div>
      <div class="snl-rp-example-profile"><div class="snl-rp-avatar">#27</div><div><small>SAMPLE PLAYER ID · SNL-DEMO-104</small><h4>Mike Sample</h4><p>Buffaloes · Bats R · Throws R</p></div><span class="snl-rp-pill">Example</span></div>
      <div class="snl-rp-summary">${status("2026–27 Indoor waiver","Fall, Winter and covered events","Valid · sample",true)}${status("2027–28 Indoor waiver","A new indoor season would require a new signature","Future · sample",false)}
      ${status("Selected activity",current().label,"Covered by sample indoor waiver",true)}</div>
      <div class="snl-rp-note">A player keeps the same SNL ID when changing teams or jersey numbers. Their permanent career stats remain connected, while substitute games can be excluded from official individual stats.</div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="edit-returning">Edit sample profile</button><button type="button" class="snl-rp-primary" data-action="join-returning">Test reusing valid waiver →</button></div>
    </div>`;
  }
  function captain(){
    const team=st.captainTeam,event=st.captainEvent,link=invitationUrl(team,event);
    const players=rosterFor(team,event);
    const rows=players.filter(p=>st.filter==="all"||(st.filter==="good")===isCleared(p));
    return `<div class="snl-rp-panel">
      <div class="snl-rp-heading"><h3>Captain invitations &amp; approvals — demo</h3><p>Choose a team and season. A captain can approve roster membership but cannot mark a waiver as checked. All names and decisions here are fictional and temporary.</p></div>
      <div class="snl-rp-captain-picker">
        <label class="snl-rp-field"><span>Team</span><select data-captain-team>${teamChoices(team)}</select></label>
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
      <div class="snl-rp-review-legend"><strong>Simulation — not verification of a signed agreement</strong><span>“Checked · demo” is only a sample status. No real identity, consent, signature or document is being reviewed or stored.</span></div>
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
    const steps=`<div class="snl-rp-stepper" aria-label="Registration progress"><span class="${st.step>=1?"current":""}">1 · Profile</span><span class="${st.step>=2?"current":""}">2 · Waiver</span><span class="${st.step>=3?"current":""}">3 · Confirmation</span></div>`;
    root.innerHTML=`<div class="snl-rp-top"><div><span class="snl-rp-eyebrow">SNL REGISTRATION & WAIVERS</span><h2>Try the complete experience</h2><p>League player registration or a simple waiver for tournament-only participants.</p></div><span class="snl-rp-demo-badge">INTERACTIVE DEMO · NO REAL SIGNATURES</span></div>
      ${st.invite&&st.view==="new"
        ?`<div class="snl-rp-locked-invite"><strong>Captain invitation · ${e(teamName(st.team))}</strong><span>${e(current().label)} · Automatically assigned by demo invitation</span><button type="button" data-action="leave-invite">Try a different example</button></div>`
        :`<div class="snl-rp-demo-switch"><label><strong>Demo indoor event</strong><span>Opening a captain invitation link fills in the team and season automatically.</span></label><select data-event>${st.view==="tournament"
          ?`<option value="tournament" selected>Third Annual Holiday Tournament · Dec 27, 2026</option>`
          :`<option value="fall"${sel(st.event,"fall")}>Fall League · 2026–27</option><option value="winter"${sel(st.event,"winter")}>Winter League · 2026–27</option>`}</select></div>`}
      <div class="snl-rp-tabs" role="group" aria-label="Choose demo experience"><button type="button" data-view="new" aria-pressed="${st.view==="new"}">League signup</button><button type="button" data-view="tournament" aria-pressed="${st.view==="tournament"}">Tournament waiver only</button><button type="button" data-view="returning" aria-pressed="${st.view==="returning"}">Returning player</button><button type="button" data-view="captain" aria-pressed="${st.view==="captain"}">Team captain</button><button type="button" data-view="admin" aria-pressed="${st.view==="admin"}">SNL admin</button></div>
      ${st.view==="new"?steps+(st.step===1?profile():st.step===2?waiver():completed()):st.view==="tournament"?`<div class="snl-rp-stepper" aria-label="Tournament waiver steps"><span class="${st.step>=1?"current":""}">1 · Participant</span><span class="${st.step>=2?"current":""}">2 · Full waiver</span><span class="${st.step>=3?"current":""}">3 · Confirmation</span></div>`+(st.step===1?tournamentIntro():st.step===2?waiver():tournamentComplete()):st.view==="returning"?returning():st.view==="captain"?captain():admin()}
      <p class="snl-rp-footer">Test only. Information exists in this page's temporary memory, not a server or database. Refresh to clear it. Please use fictional details, not real signatures.</p>`;
  }
  root.addEventListener("input",event=>{
    const t=event.target;
    if(t.dataset.field)st.data[t.dataset.field]=t.value;
    if(t.dataset.tournament)st.tournamentData[t.dataset.tournament]=t.value;
    if(t.dataset.waiver==="code")st.waiver.code=t.value;
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
  });
  root.addEventListener("change",event=>{
    const t=event.target;
    if(t.dataset.field)st.data[t.dataset.field]=t.value;
    if(t.dataset.tournament)st.tournamentData[t.dataset.tournament]=t.value;
    if(t.dataset.event){st.event=t.value;st.invite=null;st.step=1;st.error="";st.waiver=blankWaiver();st.done=false;st.editing=false;draw();return;}
    if(t.dataset.captainTeam){st.captainTeam=t.value;st.copyStatus="";draw();return;}
    if(t.dataset.captainEvent){st.captainEvent=t.value;st.copyStatus="";draw();return;}
    if(t.dataset.adminTeam){st.adminTeam=t.value;draw();return;}
    if(t.dataset.adminEvent){st.adminEvent=t.value;draw();return;}
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
    if(t.dataset.waiver==="code")st.waiver.code=t.value;
  });
  root.addEventListener("click",event=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.dataset.view){if(b.dataset.view==="captain"&&st.view==="new"&&st.done){st.captainTeam=st.team;st.captainEvent=st.event;}
      if(b.dataset.view==="admin"&&st.view==="tournament")st.adminEvent="tournament";
      if(b.dataset.view==="admin"&&st.view==="new"&&st.done){st.adminTeam=st.team;st.adminEvent=st.event;}
      st.view=b.dataset.view;if(st.view==="tournament"){st.event="tournament";st.invite=null;st.step=1;st.waiver=blankWaiver();}else if(st.view==="new"){if(st.event==="tournament")st.event="fall";st.step=1;}st.error="";draw();return;}
    if(b.dataset.filter){st.filter=b.dataset.filter;draw();return;}
    if(b.dataset.captainDecision&&st.view==="captain"){
      const target=rosterFor(st.captainTeam,st.captainEvent).find(p=>p.id===b.dataset.recordId);
      if(target&&["approved","declined","pending"].includes(b.dataset.captainDecision)){
        target.approval=b.dataset.captainDecision;draw();
      }
      return;
    }
    if(b.dataset.adminWaiver&&st.view==="admin"&&st.adminEvent!=="tournament"){
      const target=rosterFor(st.adminTeam,st.adminEvent).find(p=>p.id===b.dataset.recordId);
      const next=b.dataset.adminWaiver;
      if(target&&(
        (target.waiver==="missing"&&next==="submitted")||
        (target.waiver==="submitted"&&["checked","missing"].includes(next))||
        (target.waiver==="checked"&&next==="submitted")
      )){target.waiver=next;draw();}
      return;
    }
    if(b.dataset.tournamentWaiver&&st.view==="admin"&&st.adminEvent==="tournament"){
      const target=st.tournamentRecords.find(p=>p.id===b.dataset.recordId);
      const next=b.dataset.tournamentWaiver;
      if(target&&((target.waiver==="submitted"&&next==="checked")||(target.waiver==="checked"&&next==="submitted")||(target.waiver==="missing"&&next==="submitted"))){
        target.waiver=next;draw();
      }
      return;
    }
    if(b.dataset.action==="preview-invite"){
      st.invite={team:st.captainTeam,event:st.captainEvent};
      st.team=st.captainTeam;st.event=st.captainEvent;
      st.view="new";st.step=1;st.data=sample();st.waiver=blankWaiver();st.error="";
      st.done=false;st.returning=false;st.editing=false;st.skipped=false;draw();return;
    }
    if(b.dataset.action==="leave-invite"){
      st.invite=null;st.team="BUF";st.event="fall";st.view="new";st.step=1;
      st.waiver=blankWaiver();st.data=sample();st.error="";st.returning=false;st.done=false;draw();return;
    }
    if(b.dataset.action==="copy-invite"){
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
    if(b.dataset.action==="tournament-next"){if(!hasTournamentFields()){st.error="Please enter a fictional legal first name, legal last name and valid email to continue.";draw();return;}st.error="";st.step=2;draw();return;}
    if(b.dataset.action==="tournament-restart"){st.step=1;st.error="";st.tournamentData={first:"",last:"",email:""};st.waiver=blankWaiver();draw();return;}
    if(b.dataset.action==="next"||b.dataset.action==="save-edit"){
      if(!hasFields()){st.error="Please complete first name, last name, a valid email, jersey number, bats and throws.";draw();return;}
      st.error="";
      if(b.dataset.action==="save-edit"){st.step=3;st.editing=false;st.skipped=true;}else st.step=2;
      draw();return;
    }
    if(b.dataset.action==="back"){st.step=1;st.error="";draw();return;}
    if(b.dataset.action==="finish"){
      if(!hasWaiver()){st.error="To test completion, type DEMO into the confirmation-code field.";draw();return;}
      st.error="";st.step=3;st.done=true;st.skipped=false;
      if(st.view!=="tournament"&&!st.returning)st.joined.push({id:"joined-"+(++st.nextId),name:st.data.first.trim()+" "+st.data.last.trim(),jersey:st.data.jersey.trim(),team:st.team,event:st.event,approval:"pending",waiver:"submitted"});
      if(st.view==="tournament")st.tournamentRecords.push({id:"holiday-"+(++st.nextId),name:st.tournamentData.first.trim()+" "+st.tournamentData.last.trim(),waiver:"submitted"});
      draw();return;
    }
    if(b.dataset.action==="edit"){st.step=1;st.editing=true;st.view="new";draw();return;}
    if(b.dataset.action==="restart"){
      st.view="new";st.step=1;st.data=sample();st.waiver=blankWaiver();st.error="";st.editing=false;st.returning=false;st.skipped=false;st.done=false;st.invite=null;st.team=st.captainTeam;st.event=st.captainEvent;draw();return;
    }
    if(b.dataset.action==="edit-returning"||b.dataset.action==="join-returning"){
      st.data={first:"Mike",last:"Sample",email:"mike@example.com",jersey:"27",bats:"R",throws:"R",position:"IF"};
      st.waiver=blankWaiver();st.error="";st.returning=true;st.view="new";st.editing=b.dataset.action==="edit-returning";
      st.step=st.editing?1:3;st.skipped=st.step===3;draw();return;
    }
  });
  draw();
}
window.SNLRegistrationPreview={init:snlRegistrationDemo};
