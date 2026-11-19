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
  const sample=()=>({first:"",last:"",email:"",jersey:"",bats:"",throws:"",position:""});
  const blankWaiver=()=>({code:""});
  const st={view:"new",step:1,event:"fall",data:sample(),waiver:blankWaiver(),error:"",done:false,skipped:false,editing:false,returning:false,filter:"all",joined:[],tournamentData:{first:"",last:"",email:""}};
  const e=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const sel=(x,y)=>x===y?" selected":"";
  const chk=v=>v?" checked":"";
  const current=()=>events[st.event];
  const status=(name,detail,txt,good)=>`<div class="snl-rp-status-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="snl-rp-pill ${good?"good":"pending"}">${txt}</span></div>`;
  const hasFields=()=>!!(st.data.first.trim()&&st.data.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.data.email.trim())&&/^\d{1,3}$/.test(st.data.jersey.trim())&&["R","L","S"].includes(st.data.bats)&&["R","L"].includes(st.data.throws));
  const hasTournamentFields=()=>!!(st.tournamentData.first.trim()&&st.tournamentData.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.tournamentData.email.trim()));
  const hasWaiver=()=>st.waiver.code.trim().toUpperCase()==="DEMO";

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
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="tournament-restart">Test another waiver →</button><button type="button" class="snl-rp-primary" data-view="new">See league signup →</button></div></div>`;
  }
  function profile(){
    const d=st.data;
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>${st.editing?"Edit demo profile":"Player registration"}</h3><p>Enter fictional information to test this page. Nothing is saved or submitted.</p></div>
      <div class="snl-rp-demo-event"><small>SIMULATED TEAM INVITATION</small><strong>${current().label}</strong><span>Buffaloes · Indoor softball</span></div>
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
    const team=isTournament?"Example Tournament Team":"Buffaloes";
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
        ${status("Indoor waiver",st.skipped?"Existing sample waiver reused":"Sample waiver demo completed","Demo only",true)}
        ${status("Team roster","Buffaloes · Administrator review","Pending · demo",false)}
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
    const players=[
      {name:"Sample Player A",jersey:"12",status:"Cleared",good:true},
      {name:"Sample Player B",jersey:"7",status:"Cleared",good:true},
      {name:"Sample Player C",jersey:"24",status:"Waiver needed",good:false},
      {name:"Sample Player D",jersey:"—",status:"Invited",good:false},
      ...st.joined
    ];
    const rows=players.filter(p=>st.filter==="all"||(st.filter==="good")===p.good);
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Captain dashboard — demo</h3><p>Buffaloes · ${current().label}. All roster entries and waiver statuses shown here are simulated.</p></div>
      <div class="snl-rp-metrics"><div><strong>${players.length}</strong><small>Example players</small></div><div><strong>${players.filter(p=>p.good).length}</strong><small>Cleared</small></div><div><strong>${players.filter(p=>!p.good).length}</strong><small>Need action</small></div></div>
      <div class="snl-rp-invite"><div><strong>Test a captain invitation</strong><p>In the finished system, the team/event would be identified by the invitation link. No real invitations are sent here.</p></div><button type="button" class="snl-rp-demo-invite" data-action="restart">Try invite →</button></div>
      <div class="snl-rp-filter"><button type="button" data-filter="all" aria-pressed="${st.filter==="all"}">All</button><button type="button" data-filter="good" aria-pressed="${st.filter==="good"}">Cleared</button><button type="button" data-filter="pending" aria-pressed="${st.filter==="pending"}">Needs action</button></div>
      <div class="snl-rp-table-wrap"><table class="snl-rp-table"><thead><tr><th>Player</th><th>Jersey</th><th>Status</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${e(p.name)}</td><td>${e(p.jersey)}</td><td><span class="snl-rp-pill ${p.good?"good":"pending"}">${e(p.status)}</span></td></tr>`).join("")}</tbody></table></div>
      <div class="snl-rp-note">When you complete a demo signup, it appears as pending on this dashboard until you refresh the page. Captains would not see legal names or signed documents.</div>
    </div>`;
  }
  function draw(){
    const steps=`<div class="snl-rp-stepper" aria-label="Registration progress"><span class="${st.step>=1?"current":""}">1 · Profile</span><span class="${st.step>=2?"current":""}">2 · Waiver</span><span class="${st.step>=3?"current":""}">3 · Confirmation</span></div>`;
    root.innerHTML=`<div class="snl-rp-top"><div><span class="snl-rp-eyebrow">SNL REGISTRATION & WAIVERS</span><h2>Try the complete experience</h2><p>League player registration or a simple waiver for tournament-only participants.</p></div><span class="snl-rp-demo-badge">INTERACTIVE DEMO · NO REAL SIGNATURES</span></div>
      <div class="snl-rp-demo-switch"><label><strong>Choose example indoor invitation</strong><span>Demo control only. Real invitations will assign an event automatically; one valid indoor-season waiver can cover multiple SNL indoor events.</span></label><select data-event>${st.view==="tournament"?
        `<option value="tournament" selected>Third Annual Holiday Tournament · Dec 27, 2026</option>`:
        `<option value="fall"${sel(st.event,"fall")}>Fall League · 2026–27</option><option value="winter"${sel(st.event,"winter")}>Winter League · 2026–27</option><option value="tournament"${sel(st.event,"tournament")}>Third Annual Holiday Tournament · Dec 27, 2026</option>`}</select></div>
      <div class="snl-rp-tabs" role="group" aria-label="Choose demo experience"><button type="button" data-view="new" aria-pressed="${st.view==="new"}">League signup</button><button type="button" data-view="tournament" aria-pressed="${st.view==="tournament"}">Tournament waiver only</button><button type="button" data-view="returning" aria-pressed="${st.view==="returning"}">Returning player</button><button type="button" data-view="captain" aria-pressed="${st.view==="captain"}">Team captain</button></div>
      ${st.view==="new"?steps+(st.step===1?profile():st.step===2?waiver():completed()):st.view==="tournament"?`<div class="snl-rp-stepper" aria-label="Tournament waiver steps"><span class="${st.step>=1?"current":""}">1 · Participant</span><span class="${st.step>=2?"current":""}">2 · Full waiver</span><span class="${st.step>=3?"current":""}">3 · Confirmation</span></div>`+(st.step===1?tournamentIntro():st.step===2?waiver():tournamentComplete()):st.view==="returning"?returning():captain()}
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
    if(t.dataset.event){st.event=t.value;st.step=1;st.error="";st.waiver=blankWaiver();st.done=false;st.editing=false;draw();return;}
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
    if(t.dataset.waiver==="code")st.waiver.code=t.value;
  });
  root.addEventListener("click",event=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.dataset.view){st.view=b.dataset.view;if(st.view==="tournament"){st.event="tournament";st.step=1;st.waiver=blankWaiver();}else if(st.view==="new"){if(st.event==="tournament")st.event="fall";st.step=1;}st.error="";draw();return;}
    if(b.dataset.filter){st.filter=b.dataset.filter;draw();return;}
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
      if(st.view!=="tournament"&&!st.returning)st.joined.push({name:st.data.first.trim()+" "+st.data.last.trim(),jersey:st.data.jersey.trim(),status:"Awaiting approval · demo",good:false});
      draw();return;
    }
    if(b.dataset.action==="edit"){st.step=1;st.editing=true;st.view="new";draw();return;}
    if(b.dataset.action==="restart"){
      st.view="new";st.step=1;st.data=sample();st.waiver=blankWaiver();st.error="";st.editing=false;st.returning=false;st.skipped=false;st.done=false;draw();return;
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
