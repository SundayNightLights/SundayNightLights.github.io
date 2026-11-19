function snlRegistrationDemo(){
  "use strict";
  const root=document.getElementById("snl-reg-preview");
  if(!root||root.dataset.initialized==="yes")return;
  root.dataset.initialized="yes";
  const events={
    fall:{label:"2026–27 Fall League",kind:"indoor"},
    summer:{label:"2027 Summer League",kind:"outdoor"},
    tournament:{label:"2027 Winter Indoor Tournament",kind:"indoor"},outdoorTourney:{label:"2027 Summer Outdoor Tournament",kind:"outdoor"}
  };
  const sample=()=>({first:"",last:"",email:"",jersey:"",bats:"",throws:"",position:""});
  const blankWaiver=()=>({media:"",read:false,demo:false,code:""});
  const st={view:"new",step:1,event:"fall",data:sample(),waiver:blankWaiver(),error:"",done:false,skipped:false,editing:false,returning:false,filter:"all",joined:[],tournamentData:{first:"",last:"",email:""}};
  const e=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const sel=(x,y)=>x===y?" selected":"";
  const chk=v=>v?" checked":"";
  const current=()=>events[st.event];
  const status=(name,detail,txt,good)=>`<div class="snl-rp-status-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="snl-rp-pill ${good?"good":"pending"}">${txt}</span></div>`;
  const hasFields=()=>!!(st.data.first.trim()&&st.data.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.data.email.trim())&&/^\d{1,3}$/.test(st.data.jersey.trim())&&["R","L","S"].includes(st.data.bats)&&["R","L"].includes(st.data.throws));
  const hasTournamentFields=()=>!!(st.tournamentData.first.trim()&&st.tournamentData.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.tournamentData.email.trim()));
  const hasWaiver=()=>st.waiver.read&&st.waiver.demo&&!!st.waiver.media&&st.waiver.code.trim().toUpperCase()==="DEMO";

  function tournamentIntro(){
    const p=st.tournamentData;
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Tournament waiver only</h3><p>For players joining an SNL tournament without signing up for a league or creating a website account. Enter sample information only.</p></div>
      <div class="snl-rp-demo-event"><small>EXAMPLE TOURNAMENT INVITATION</small><strong>${e(current().label)}</strong><span>Example Tournament Team · ${current().kind==="indoor"?"Indoor":"Outdoor"} waiver</span></div>
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
      <div class="snl-rp-demo-event"><small>SIMULATED TEAM INVITATION</small><strong>${current().label}</strong><span>Buffaloes · ${current().kind==="indoor"?"Indoor":"Outdoor"} softball</span></div>
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
  const indoor=current().kind==="indoor";
  const kind=indoor?"Indoor":"Outdoor";
  const period=indoor?"October 1 through April 30 of the following year":"May 1 through October 31 of the same year";
  const coverage=indoor?"Fall and Winter league seasons, indoor playoffs, and SNL-organized indoor tournaments":"Spring and Summer league seasons, outdoor playoffs, and SNL-organized outdoor tournaments";
  const risks=indoor
    ? "ALL SPORT, INCLUDING INDOOR SOFTBALL, HAS ITS RISKS."
    : "ALL SPORT, INCLUDING OUTDOOR SOFTBALL, HAS ITS RISKS.";
  return `<div class="snl-rp-panel">
    <div class="snl-rp-heading"><h3>Full ${kind.toLowerCase()} waiver — demo</h3><p>${current().label}. Review the entire proposed SNL agreement below. This is draft language and no actual waiver is signed here.${st.view==="tournament"?" No league profile is required.":""}</p></div>
    <article class="snl-rp-waiver snl-rp-waiver-full" aria-label="Full draft SNL ${kind} player participation waiver">
      <header class="snl-rp-legal-head">
        <div class="snl-rp-waiver-label">REVIEW DRAFT · NOT APPROVED FOR SIGNING</div>
        <div class="snl-rp-legal-brand">SUNDAY NIGHT LIGHTS</div>
        <h4>PLAYER PARTICIPATION &amp; LIABILITY WAIVER</h4>
        <p class="snl-rp-legal-subtitle">${kind} leagues, playoffs and SNL-organized tournaments</p>
        <p class="snl-rp-legal-version">Website demo · SNL-only draft v0.2 (November 18, 2026), adapted for indoor/outdoor leagues and tournaments. Not final legal text.</p>
      </header>
      <div class="snl-rp-legal-warning"><strong>Independent SNL draft — not an approved signing form.</strong> This waiver is intended solely for Sunday Night Lights leagues and SNL-organized tournaments, not as a waiver issued by any event venue. A facility may separately require its own waiver or impose participation and filming conditions. SNL must finalize its agreement with Ontario legal counsel and use a secure signing process before collecting real signatures.</div>

      <section class="snl-rp-legal-section"><h4>A | Participant &amp; Event</h4>
        <p><strong>Private registration details, in the live system:</strong> Full legal name, team, email, relevant contact information, event/season, participation dates, venue and emergency contact where required. These are not collected in this demo.</p>
        <p><strong>Participation:</strong> SNL regular leagues, playoffs, SNL-organized tournaments or another SNL-designated event covered by this agreement.</p>
        <p><strong>Proposed ${kind.toLowerCase()} participation period:</strong> ${period}. Coverage would include ${coverage}. The applicable waiver is determined by the event type and covered period, not merely by the month in which a player registers.</p>
        <p><strong>Eligibility:</strong> I confirm I am at least 18 years old. If not, a separately approved minor-participant process is required.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>B | Acknowledgement of ${kind} Softball Risks</h4>
        <p><strong>${risks}</strong> I choose to participate voluntarily and understand that softball can involve serious injury, permanent disability, or other loss. Potential hazards include:</p>
        <ul>
          <li>Injuries from strenuous play, running, dryland activities, stretching, fatigue, and cardiovascular exertion;</li>
          <li>Falls and injuries from grass, turf, uneven or irregular surfaces, and infections or rashes;</li>
          <li>Collisions or contact with other participants, spectators, walls, balls, bats, sporting equipment, or vehicles;</li>
          <li>Improper use or mechanical failure of equipment and potentially severe injuries, including spinal cord injury;</li>
          <li>Heat, cold, other weather conditions, and travel to or from related events.</li>
        </ul>
        <p>In ${indoor?"indoor multipurpose facilities":"outdoor sports facilities"}, fixed or movable structures and equipment may be located within, adjacent to, or beyond normal playing boundaries. These may include ${indoor?"soccer goalposts, bleachers, benches, netting, barriers, walls and other sporting equipment":"benches, fencing, dugouts, bleachers, bases, barriers and other sporting equipment"}. Some objects may be near foul lines or in areas where a player may field or retrieve a ball. They may not always be movable. Contact, collision, tripping or falling against these objects can result in injury.</p>
        <p>I understand that close or unexpected contact can occur; that fatigue may increase risks; that rules and safe conduct can reduce (but not eliminate) risks; and that participation may involve anxiety or physical challenge.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>C | Participant Responsibilities &amp; Assumption of Risk</h4>
        <p>I agree to follow SNL rules, facility requirements, official instructions, and reasonable sportsmanship and safety standards. I will not knowingly participate while unable to do so safely and will promptly report unsafe conditions or incidents to an organizer.</p>
        <p>I voluntarily accept the risks described in this document and understand that I am responsible for the ordinary consequences of my participation, subject to applicable law.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>D | Release of Responsibility — Draft for Legal Review</h4>
        <p>For this proposed SNL agreement, “SNL parties” refers to Sunday Night Lights (SNL) and its league and tournament organizers, administrators, directors, officers, employees, volunteers, officials, and agents acting on SNL’s behalf. The draft does not name a venue or independent facility operator as an SNL party.</p>
        <p>I release the SNL parties from claims, demands, actions, and costs arising from my voluntary participation in the identified SNL softball activity, to the extent permitted by applicable law. The precise scope, treatment of negligence, and enforceability of this release must be reviewed by Ontario legal counsel before any participant signs it.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>E | Website Rosters &amp; Player Statistics</h4>
        <p>I understand that SNL operates a public league and tournament website. As part of its ordinary sports administration and coverage, SNL may publish my name, team, team roster, game participation, scores, playing statistics, league records, achievements, and related news coverage. Such information may appear in current and historical season or tournament records.</p>
        <p>I may contact SNL to correct inaccurate information or discuss a privacy concern. Requests concerning public display will be considered with regard to league operations and applicable privacy requirements.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>F | Game Photography &amp; Video Notice</h4>
        <p>SNL may have photographers or cameras at its games and events. Recordings may include gameplay, celebrations, spectators, teammates, and people incidentally appearing in the background. SNL may publish ordinary event coverage and highlights according to its disclosed media practices and any consent required by law. Facility filming rules also apply.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>G | SNL Media &amp; Event-Promotion Authorization</h4>
        <p>This separate authorization covers the regular SNL media activities discussed during registration, including photos and video clips featuring me in highlights, articles, season or tournament recaps, social media, and promotion of future SNL-run leagues and tournaments. It does not authorize unrelated third-party endorsements or the facility’s independent advertising.</p>
        <p>I understand this material may be public and shareable. I may request withdrawal of consent for future identifiable promotional uses through the SNL privacy contact; material already published may not always be fully retractable. Declining does not prevent league participation. SNL will take reasonable steps with identifiable features, but cannot guarantee that I will never appear incidentally in group or background footage.</p>
        <div class="snl-rp-legal-choice">
          <strong>Separate optional media choice · demo only</strong>
          <label><input type="radio" name="snl-demo-media" data-waiver="yes"${chk(st.waiver.media==="yes")}> YES — I consent to the identifiable SNL media and promotion uses described above.</label>
          <label><input type="radio" name="snl-demo-media" data-waiver="no"${chk(st.waiver.media==="no")}> NO — I decline optional media authorization. My league or tournament eligibility is unaffected.</label>
        </div>
      </section>

      <section class="snl-rp-legal-section"><h4>H | Privacy &amp; Recordkeeping</h4>
        <p>SNL collects participant information and signatures to administer registrations, confirm eligibility, contact participants, track waiver completion, maintain sports records, and document consent. Public website content is described above. Personal contact details, emergency contacts, and signed waivers are not intended for public posting.</p>
        <p>SNL will limit access to signed records and retain them according to its final privacy and retention policy. <strong>Privacy contact:</strong> Pending designation. <strong>Full policy:</strong> Pending publication.</p>
      </section>

      <section class="snl-rp-legal-section"><h4>I | Participant Acknowledgment &amp; Signature</h4>
        <p>By signing, I confirm that I have read and understood Sections A–D, the website-statistics disclosure in Section E, the filming notice in Section F, and the privacy terms in Section H. My separate response in Section G records my optional media choice. I am signing voluntarily.</p>
        <p><strong>In the eventual secure version:</strong> Printed legal name, electronic signature, signing date, agreement version and reliable audit trail will be recorded privately. No real signature is taken in this demo.</p>
      </section>
      <div class="snl-rp-legal-end">SNL DRAFT ONLY · NOT APPROVED FOR SIGNING · ONTARIO LEGAL REVIEW REQUIRED</div>
    </article>

    <div class="snl-rp-demo-ack">
      <label><input type="checkbox" data-waiver="read"${chk(st.waiver.read)}> I reviewed the <strong>full draft waiver</strong> above for testing.</label>
      <label><input type="checkbox" data-waiver="demo"${chk(st.waiver.demo)}> I understand this is a demo and does NOT sign a real waiver or provide legally effective consent.</label>
      <label class="snl-rp-field"><span>Demo completion code <em>Type DEMO, not your legal name or signature</em></span><input data-waiver="code" value="${e(st.waiver.code)}" maxlength="4" autocomplete="off" placeholder="DEMO"></label>
    </div>
    ${st.error?`<p class="snl-rp-required" role="alert">${e(st.error)}</p>`:""}
    <div class="snl-rp-note"><strong>Demo safety:</strong> This page does not collect legal names, signatures or waiver records. Refresh to erase your test entries.</div>
    <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="back">← Back</button><button type="button" class="snl-rp-primary" data-action="finish">Complete demo →</button></div>
  </div>`;
}
  function completed(){
    const d=st.data;
    return `<div class="snl-rp-panel snl-rp-complete"><div class="snl-rp-success-icon" aria-hidden="true">✓</div><h3>Demo registration complete</h3><p>This is a simulated confirmation. No real registration was submitted, no waiver was signed and no SNL player ID was created.</p>
      <div class="snl-rp-summary">${status("Player profile",e(d.first+" "+d.last)+" · #"+e(d.jersey),"Sample complete",true)}
        ${status((current().kind==="indoor"?"Indoor":"Outdoor")+" waiver",st.skipped?"Existing sample waiver reused":"Sample acknowledgments completed","Demo only",true)}
        ${status("Team roster","Buffaloes · Administrator review","Pending · demo",false)}
        ${status("SNL Player ID","Issued only after live registration","Not issued",false)}
      </div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="edit">Edit demo profile</button><button type="button" class="snl-rp-primary" data-view="captain">See captain roster →</button></div></div>`;
  }
  function returning(){
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Returning player — demo</h3><p>Test how SNL would reuse an existing player account and an already valid waiver.</p></div>
      <div class="snl-rp-example-profile"><div class="snl-rp-avatar">#27</div><div><small>SAMPLE PLAYER ID · SNL-DEMO-104</small><h4>Mike Sample</h4><p>Buffaloes · Bats R · Throws R</p></div><span class="snl-rp-pill">Example</span></div>
      <div class="snl-rp-summary">${status("2026–27 Indoor waiver","Fall, Winter and covered events","Valid · sample",true)}${status("2027 Outdoor waiver","Spring, Summer and covered events","Not signed · sample",false)}
      ${status("Selected activity",current().label,current().kind==="indoor"?"Covered by sample indoor waiver":"Would require outdoor waiver",current().kind==="indoor")}</div>
      <div class="snl-rp-note">A player keeps the same SNL ID when changing teams or jersey numbers. Their permanent career stats remain connected, while substitute games can be excluded from official individual stats.</div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="edit-returning">Edit sample profile</button><button type="button" class="snl-rp-primary" data-action="join-returning">${current().kind==="indoor"?"Test reusing valid waiver":"Test outdoor waiver"} →</button></div>
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
      <div class="snl-rp-demo-switch"><label><strong>Test invitation type</strong><span>Demo control only. Real player invitations will assign the event automatically.</span></label><select data-event>${st.view==="tournament"?`<option value="tournament"${sel(st.event,"tournament")}>Winter Tournament · Indoor</option><option value="outdoorTourney"${sel(st.event,"outdoorTourney")}>Summer Tournament · Outdoor</option>`:`<option value="fall"${sel(st.event,"fall")}>Fall League · Indoor</option><option value="summer"${sel(st.event,"summer")}>Summer League · Outdoor</option><option value="tournament"${sel(st.event,"tournament")}>Winter Tournament · Indoor</option><option value="outdoorTourney"${sel(st.event,"outdoorTourney")}>Summer Tournament · Outdoor</option>`}</select></div>
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
    if(t.dataset.waiver==="yes"||t.dataset.waiver==="no")st.waiver.media=t.dataset.waiver;
    if(t.dataset.waiver==="read"||t.dataset.waiver==="demo")st.waiver[t.dataset.waiver]=t.checked;
    if(t.dataset.waiver==="code")st.waiver.code=t.value;
  });
  root.addEventListener("click",event=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.dataset.view){st.view=b.dataset.view;if(st.view==="tournament"){if(st.event!=="outdoorTourney")st.event="tournament";st.step=1;st.waiver=blankWaiver();}else if(st.view==="new"){st.step=1;}st.error="";draw();return;}
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
      if(!hasWaiver()){st.error="Choose a media preference, check both statements and type DEMO.";draw();return;}
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
      st.step=st.editing?1:current().kind==="indoor"?3:2;st.skipped=st.step===3;draw();return;
    }
  });
  draw();
}
window.SNLRegistrationPreview={init:snlRegistrationDemo};
