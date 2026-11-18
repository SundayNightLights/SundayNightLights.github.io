function snlRegistrationDemo(){
  "use strict";
  const root=document.getElementById("snl-reg-preview");
  if(!root||root.dataset.initialized==="yes")return;
  root.dataset.initialized="yes";
  const events={
    fall:{label:"2026–27 Fall League",kind:"indoor"},
    summer:{label:"2027 Summer League",kind:"outdoor"},
    tournament:{label:"2027 Winter Indoor Tournament",kind:"indoor"}
  };
  const sample=()=>({first:"",last:"",email:"",jersey:"",bats:"",throws:"",position:""});
  const blankWaiver=()=>({media:"",read:false,demo:false,code:""});
  const st={view:"new",step:1,event:"fall",data:sample(),waiver:blankWaiver(),error:"",done:false,skipped:false,editing:false,returning:false,filter:"all",joined:[]};
  const e=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const sel=(x,y)=>x===y?" selected":"";
  const chk=v=>v?" checked":"";
  const current=()=>events[st.event];
  const status=(name,detail,txt,good)=>`<div class="snl-rp-status-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="snl-rp-pill ${good?"good":"pending"}">${txt}</span></div>`;
  const hasFields=()=>!!(st.data.first.trim()&&st.data.last.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.data.email.trim())&&/^\d{1,3}$/.test(st.data.jersey.trim())&&["R","L","S"].includes(st.data.bats)&&["R","L"].includes(st.data.throws));
  const hasWaiver=()=>st.waiver.read&&st.waiver.demo&&!!st.waiver.media&&st.waiver.code.trim().toUpperCase()==="DEMO";
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
    const kind=current().kind==="indoor"?"Indoor":"Outdoor";
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>${kind} participation waiver — demo</h3><p>${current().label}. This tests the review and acknowledgment experience, not an actual signature.</p></div>
      <div class="snl-rp-waiver"><div class="snl-rp-waiver-label">SAMPLE ONLY · DRAFT FOR REVIEW · NOT A LEGAL WAIVER</div>
        <h4>Sunday Night Lights · ${kind} Player Participation</h4>
        <div class="snl-rp-waiver-section"><strong>1. Risks of softball</strong><p>Playing can involve struck balls, running, falls, contact with other players, and serious injury. Indoor facilities may include goalposts, bleachers, netting, benches, barriers and other equipment near the playing area.</p></div>
        <div class="snl-rp-waiver-section"><strong>2. Safe participation</strong><p>Players agree to follow league rules, officials' directions and applicable facility safety instructions.</p></div>
        <div class="snl-rp-waiver-section"><strong>3. Website and media notice</strong><p>SNL may publish roster names, team records, batting statistics and ordinary game coverage. Separate promotional media permission is offered below.</p></div>
        <div class="snl-rp-waiver-section"><strong>4. Liability release</strong><p>The actual release, defined participation period, venue provisions and full legal wording are pending appropriate review and facility approval. No legal agreement is formed here.</p></div>
      </div>
      <fieldset class="snl-rp-pref"><legend>Optional SNL promotion <span>Choose one</span></legend><p class="snl-rp-waiver-hint">Allow identifiable photos/video for SNL highlights and promotion of future leagues or tournaments? Declining does not prevent participation.</p><div class="snl-rp-checks">
        <label><input type="radio" name="snl-demo-media" data-waiver="yes"${chk(st.waiver.media==="yes")}> Yes, allow promotion</label>
        <label><input type="radio" name="snl-demo-media" data-waiver="no"${chk(st.waiver.media==="no")}> No, decline promotion</label>
      </div></fieldset>
      <div class="snl-rp-demo-ack">
        <label><input type="checkbox" data-waiver="read"${chk(st.waiver.read)}> I reviewed the sample waiver summary.</label>
        <label><input type="checkbox" data-waiver="demo"${chk(st.waiver.demo)}> I understand this is NOT a real waiver or signature.</label>
        <label class="snl-rp-field"><span>Demo confirmation code <em>Type DEMO, not your real signature</em></span><input data-waiver="code" value="${e(st.waiver.code)}" maxlength="4" autocomplete="off" placeholder="DEMO"></label>
      </div>
      ${st.error?`<p class="snl-rp-required" role="alert">${e(st.error)}</p>`:""}
      <div class="snl-rp-note"><strong>No private information is collected.</strong> The real digital waiver will require an approved full agreement and secure signing system.</div>
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
    root.innerHTML=`<div class="snl-rp-top"><div><span class="snl-rp-eyebrow">SNL REGISTRATION & WAIVERS</span><h2>Try the complete experience</h2><p>Player registration, sample waiver, returning players and captain dashboard.</p></div><span class="snl-rp-demo-badge">INTERACTIVE DEMO · NO REAL SIGNATURES</span></div>
      <div class="snl-rp-demo-switch"><label><strong>Test invitation type</strong><span>Demo control only. Real player invitations will assign the event automatically.</span></label><select data-event><option value="fall"${sel(st.event,"fall")}>Fall League · Indoor</option><option value="summer"${sel(st.event,"summer")}>Summer League · Outdoor</option><option value="tournament"${sel(st.event,"tournament")}>Winter Tournament · Indoor</option></select></div>
      <div class="snl-rp-tabs" role="group" aria-label="Choose demo experience"><button type="button" data-view="new" aria-pressed="${st.view==="new"}">New player</button><button type="button" data-view="returning" aria-pressed="${st.view==="returning"}">Returning player</button><button type="button" data-view="captain" aria-pressed="${st.view==="captain"}">Team captain</button></div>
      ${st.view==="new"?steps+(st.step===1?profile():st.step===2?waiver():completed()):st.view==="returning"?returning():captain()}
      <p class="snl-rp-footer">Test only. Information exists in this page's temporary memory, not a server or database. Refresh to clear it. Please use fictional details, not real signatures.</p>`;
  }
  root.addEventListener("input",event=>{
    const t=event.target;
    if(t.dataset.field)st.data[t.dataset.field]=t.value;
    if(t.dataset.waiver==="code")st.waiver.code=t.value;
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
  });
  root.addEventListener("change",event=>{
    const t=event.target;
    if(t.dataset.field)st.data[t.dataset.field]=t.value;
    if(t.dataset.event){st.event=t.value;st.step=1;st.error="";st.waiver=blankWaiver();st.done=false;st.editing=false;draw();return;}
    if(t.dataset.area&&t.checked)st.data.position=t.dataset.area;
    if(t.dataset.waiver==="yes"||t.dataset.waiver==="no")st.waiver.media=t.dataset.waiver;
    if(t.dataset.waiver==="read"||t.dataset.waiver==="demo")st.waiver[t.dataset.waiver]=t.checked;
    if(t.dataset.waiver==="code")st.waiver.code=t.value;
  });
  root.addEventListener("click",event=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.dataset.view){st.view=b.dataset.view;st.error="";draw();return;}
    if(b.dataset.filter){st.filter=b.dataset.filter;draw();return;}
    if(b.dataset.action==="clear-area"){st.data.position="";draw();return;}
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
      if(!st.returning)st.joined.push({name:st.data.first.trim()+" "+st.data.last.trim(),jersey:st.data.jersey.trim(),status:"Awaiting approval · demo",good:false});
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
