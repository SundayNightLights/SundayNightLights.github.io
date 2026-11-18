function snlRegistrationPreview(){
  "use strict";
  const root=document.getElementById("snl-reg-preview");
  if(!root || root.dataset.initialized==="yes")return;
  root.dataset.initialized="yes";
  const state={
    view:"new",step:1,filter:"all",
    fields:{displayName:"",email:"",number:"",bats:"",throws:"",season:"indoor"},
    prefs:{IF:false,OF:false,P:false,ANY:false}
  };
  const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const checked=value=>value?" checked":"";
  const selected=(a,b)=>a===b?" selected":"";
  const statusCard=(label,detail,status,kind)=>`<div class="snl-rp-status-row"><div><strong>${label}</strong><small>${detail}</small></div><span class="snl-rp-pill ${kind}">${status}</span></div>`;
  function newPlayer(){
    const d=state.fields;
    const steps=`<div class="snl-rp-stepper" aria-label="Registration steps"><span class="${state.step>=1?"current":""}">1 · Player profile</span><span class="${state.step>=2?"current":""}">2 · Waiver</span><span class="${state.step>=3?"current":""}">3 · Review</span></div>`;
    if(state.step===1){
      return `${steps}<div class="snl-rp-panel">
        <div class="snl-rp-heading"><h3>Create your player profile</h3><p>One profile for leagues, tournaments and career statistics. Use sample information in this preview.</p></div>
        <div class="snl-rp-grid">
          <label class="snl-rp-field"><span>Public display name <em>Required in live registration</em></span><input data-field="displayName" value="${escapeHtml(d.displayName)}" placeholder="e.g. Johnny Smith" autocomplete="off"></label>
          <label class="snl-rp-field"><span>Email for secure sign-in <em>Private</em></span><input type="email" data-field="email" value="${escapeHtml(d.email)}" placeholder="e.g. player@example.com" autocomplete="off"></label>
          <label class="snl-rp-field"><span>Jersey number <em>Season-specific · Optional</em></span><input data-field="number" value="${escapeHtml(d.number)}" placeholder="e.g. 27" maxlength="3" inputmode="numeric" autocomplete="off"></label>
          <label class="snl-rp-field"><span>Participation type</span><select data-field="season"><option value="indoor"${selected(d.season,"indoor")}>Indoor · Fall / Winter</option><option value="outdoor"${selected(d.season,"outdoor")}>Outdoor · Spring / Summer</option></select></label>
          <label class="snl-rp-field"><span>Bats <em>Optional</em></span><select data-field="bats"><option value=""${selected(d.bats,"")}>Prefer not to specify</option><option value="R"${selected(d.bats,"R")}>Right</option><option value="L"${selected(d.bats,"L")}>Left</option><option value="S"${selected(d.bats,"S")}>Switch</option></select></label>
          <label class="snl-rp-field"><span>Throws <em>Optional</em></span><select data-field="throws"><option value=""${selected(d.throws,"")}>Prefer not to specify</option><option value="R"${selected(d.throws,"R")}>Right</option><option value="L"${selected(d.throws,"L")}>Left</option></select></label>
        </div>
        <fieldset class="snl-rp-pref"><legend>Preferred fielding area <span>Optional · Choose any that apply</span></legend>
        <div class="snl-rp-checks"><label><input type="checkbox" data-pref="IF"${checked(state.prefs.IF)}> Infield (incl. catcher)</label><label><input type="checkbox" data-pref="OF"${checked(state.prefs.OF)}> Outfield</label><label><input type="checkbox" data-pref="P"${checked(state.prefs.P)}> Pitcher</label><label><input type="checkbox" data-pref="ANY"${checked(state.prefs.ANY)}> Anywhere / Utility</label></div>
        </fieldset>
        <div class="snl-rp-note"><strong>Public vs. private:</strong> Your chosen display name appears on SNL rosters and statistics. Your legal name is requested separately and kept private for waiver signing.</div>
        <div class="snl-rp-actions"><button type="button" class="snl-rp-primary" data-action="next">Preview waiver step <span aria-hidden="true">→</span></button></div>
      </div>`;
    }
    if(state.step===2){
      return `${steps}<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>${d.season==="indoor"?"Indoor":"Outdoor"} participation waiver</h3><p>Players sign once for the applicable participation period. A valid waiver can cover multiple SNL seasons and tournaments within its approved scope.</p></div>
        <div class="snl-rp-waiver">
          <div class="snl-rp-waiver-label">PREVIEW ONLY · WAIVER TEXT PENDING APPROVAL</div>
          <h4>Sunday Night Lights · ${d.season==="indoor"?"Indoor":"Outdoor"} Participation Agreement</h4>
          <p>The final agreement will explain the playing risks, including equipment and obstructions around the playing area, organizers' terms, rules acknowledgment, website statistics and applicable media uses.</p>
          <p>The full approved waiver must be shown before a real electronic signature is collected. Markham Sports Dome approval and any other facility-specific requirements remain outstanding.</p>
        </div>
        <div class="snl-rp-grid"><div class="snl-rp-field"><span>Legal full name <em>Private · Waiver only</em></span><div class="snl-rp-disabled">Collected through the secure signing process</div></div><div class="snl-rp-field"><span>Electronic signature</span><div class="snl-rp-disabled">Enabled after waiver approval</div></div></div>
        <div class="snl-rp-note"><strong>No real signature is taken here.</strong> Completing this preview does not register a player or satisfy a waiver requirement.</div>
        <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="back">← Back</button><button type="button" class="snl-rp-primary" data-action="next">View confirmation design →</button></div>
      </div>`;
    }
    return `${steps}<div class="snl-rp-panel snl-rp-complete"><div class="snl-rp-success-icon" aria-hidden="true">✓</div><h3>Registration confirmation — design preview</h3><p>In the live version, a registered player would receive an email confirmation and appear on the captain's roster with verified waiver status.</p>
      <div class="snl-rp-summary">${statusCard("Player profile","Display name: "+escapeHtml(d.displayName||"Sample Player"),"Not submitted","pending")}${statusCard(d.season==="indoor"?"Indoor waiver":"Outdoor waiver","Legal signature required","Not signed","pending")}${statusCard("Captain roster","Team and event assignment","Pending","pending")}</div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-secondary" data-action="restart">Restart preview</button><button type="button" class="snl-rp-primary" data-tab-direct="captain">View captain dashboard →</button></div></div>`;
  }
  function returning(){
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Returning player experience</h3><p>The live system will use a secure email sign-in link or verification code—no password to remember.</p></div>
      <div class="snl-rp-returning">
        <div class="snl-rp-example-profile"><div class="snl-rp-avatar" aria-hidden="true">#27</div><div><small>EXAMPLE PLAYER PROFILE</small><h4>Johnny Sample</h4><p>Bats R · Throws R · IF / OF</p></div><span class="snl-rp-pill">Demo data</span></div>
        <div class="snl-rp-summary"><h4>Waiver checks</h4>${statusCard("2026–27 indoor","Fall, Winter and covered indoor tournaments","Signed · example","good")}${statusCard("2027 outdoor","Spring, Summer and covered outdoor tournaments","Not signed · example","pending")}</div>
      </div>
      <div class="snl-rp-note">When the same player joins another SNL roster, their permanent player ID and career statistics stay intact. They only update season-specific details like team and jersey number.</div>
      <div class="snl-rp-actions"><button type="button" class="snl-rp-primary" data-tab-direct="new">View new player flow →</button></div></div>`;
  }
  function captain(){
    const players=[
      {name:"Sample Player A",number:"12",status:"Cleared",key:"cleared"},
      {name:"Sample Player B",number:"7",status:"Cleared",key:"cleared"},
      {name:"Sample Player C",number:"24",status:"Waiver needed",key:"pending"},
      {name:"Sample Player D",number:"—",status:"Invitation pending",key:"pending"}
    ];
    const rows=players.filter(p=>state.filter==="all"||p.key===state.filter);
    return `<div class="snl-rp-panel"><div class="snl-rp-heading"><h3>Captain roster dashboard</h3><p>Illustrative team: Buffaloes · 2026–27 Indoor. Captains see registration clearance, not legal names, contact details or signed documents.</p></div>
      <div class="snl-rp-metrics"><div><strong>4</strong><small>Example players</small></div><div><strong>2</strong><small>Cleared</small></div><div><strong>2</strong><small>Action required</small></div></div>
      <div class="snl-rp-invite"><div><strong>Invite players to join your roster</strong><p>At launch: send an email invitation or share a team-specific WhatsApp link. Players supply their own preferred and legal names.</p></div><button type="button" disabled title="Invitations will be enabled when secure registration launches">Invite player · Coming soon</button></div>
      <div class="snl-rp-filter" aria-label="Roster filter"><button type="button" data-filter="all" aria-pressed="${state.filter==="all"}">All players</button><button type="button" data-filter="cleared" aria-pressed="${state.filter==="cleared"}">Cleared</button><button type="button" data-filter="pending" aria-pressed="${state.filter==="pending"}">Action needed</button></div>
      <div class="snl-rp-table-wrap"><table class="snl-rp-table"><thead><tr><th>Player</th><th>Jersey</th><th>Registration / Waiver</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${p.name}</td><td>${p.number}</td><td><span class="snl-rp-pill ${p.key==="cleared"?"good":"pending"}">${p.status}</span></td></tr>`).join("")}</tbody></table></div>
      <div class="snl-rp-note">Sample records only. A real captain dashboard will be available only after captain authentication and SNL administrator approval.</div></div>`;
  }
  function render(){
    root.innerHTML=`<div class="snl-rp-top"><div><span class="snl-rp-eyebrow">SNL REGISTRATION EXPERIENCE</span><h2>One profile. Every season.</h2><p>Designed for existing players, new players and team captains.</p></div><span class="snl-rp-demo-badge">INTERACTIVE DESIGN PREVIEW</span></div>
      <div class="snl-rp-tabs" role="group" aria-label="Preview a registration experience"><button type="button" data-reg-tab="new" aria-pressed="${state.view==="new"}">New player</button><button type="button" data-reg-tab="returning" aria-pressed="${state.view==="returning"}">Returning player</button><button type="button" data-reg-tab="captain" aria-pressed="${state.view==="captain"}">Team captain</button></div>
      ${state.view==="new"?newPlayer():state.view==="returning"?returning():captain()}
      <p class="snl-rp-footer">This is a front-end preview only. No login, waiver signing, registration, invitation, personal-data storage or roster updates are active.</p>`;
  }
  root.addEventListener("click",event=>{
    const el=event.target.closest("button");
    if(!el)return;
    if(el.dataset.regTab){state.view=el.dataset.regTab;render();return;}
    if(el.dataset.tabDirect){state.view=el.dataset.tabDirect;render();return;}
    if(el.dataset.filter){state.filter=el.dataset.filter;render();return;}
    if(el.dataset.action==="next"){state.step=Math.min(3,state.step+1);render();}
    if(el.dataset.action==="back"){state.step=Math.max(1,state.step-1);render();}
    if(el.dataset.action==="restart"){state.step=1;state.fields={displayName:"",email:"",number:"",bats:"",throws:"",season:"indoor"};state.prefs={IF:false,OF:false,P:false,ANY:false};render();}
  });
  root.addEventListener("input",event=>{
    const el=event.target;
    if(el.dataset.field)state.fields[el.dataset.field]=el.value;
    if(el.dataset.pref)state.prefs[el.dataset.pref]=el.checked;
  });
  root.addEventListener("change",event=>{
    const el=event.target;
    if(el.dataset.field)state.fields[el.dataset.field]=el.value;
    if(el.dataset.pref)state.prefs[el.dataset.pref]=el.checked;
  });
  render();
}window.SNLRegistrationPreview={init:snlRegistrationPreview};
