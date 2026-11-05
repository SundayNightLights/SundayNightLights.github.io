
/* SNL Main Website - Live GameChanger Batting Stats */
(() => {
  "use strict";

  const DATA_URL =
    "https://sundaynightlights.github.io/SNL-Stats-Hub/stats-data.json";

  const root = document.getElementById("snl-live-stats");
  if (!root) return;

  const columns = [
    "GP", "PA", "AVG", "OBP", "SLG", "OPS",
    "H", "2B", "3B", "HR", "RBI"
  ];

  const rates = new Set(["AVG", "OBP", "SLG", "OPS"]);

  const sorting = [
    ["AVG", "Batting Average"],
    ["OBP", "On-Base Percentage"],
    ["SLG", "Slugging Percentage"],
    ["OPS", "OPS"],
    ["HR", "Home Runs"],
    ["RBI", "RBIs"],
    ["H", "Hits"],
    ["PA", "Plate Appearances"],
    ["GP", "Games Played"]
  ];

  const css = document.createElement("style");
  css.textContent = `
    #snl-live-stats {
      width:100%;
      margin:24px auto;
      color:inherit;
    }

    #snl-live-stats .controls {
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:12px;
      margin-bottom:18px;
    }

    #snl-live-stats label {
      display:flex;
      flex-direction:column;
      gap:6px;
      font-size:12px;
      font-weight:700;
    }

    #snl-live-stats select,
    #snl-live-stats input {
      width:100%;
      min-width:0;
      padding:11px;
      border-radius:8px;
      border:1px solid #738198;
      background:#132b47;
      color:#fff;
      font:inherit;
    }

    #snl-live-stats .notice {
      background:rgba(127,137,153,.1);
      border-left:3px solid #f4c542;
      padding:12px;
      margin-bottom:16px;
      font-size:13px;
    }

    #snl-live-stats .table-wrap {
      width:100%;
      overflow-x:auto;
      border:1px solid #718097;
      border-radius:10px;
    }

    #snl-live-stats table {
      width:100%;
      min-width:820px;
      border-collapse:collapse;
      white-space:nowrap;
      font-size:13px;
    }

    #snl-live-stats th,
    #snl-live-stats td {
      padding:11px;
      border-bottom:1px solid rgba(135,146,161,.25);
    }

    #snl-live-stats th {
      text-align:left;
      background:#123051;
      color:white;
    }

    #snl-live-stats th.rate {
      color:#f4c542;
    }

    #snl-live-stats .number {
      text-align:right;
      font-variant-numeric:tabular-nums;
    }

    #snl-live-stats .player {
      font-weight:700;
    }

    #snl-live-stats .status {
      margin-top:16px;
      font-size:13px;
    }

    #snl-live-stats .muted {
      opacity:.8;
      font-size:12px;
    }

    @media(max-width:730px) {
      #snl-live-stats .controls {
        grid-template-columns:repeat(2,minmax(0,1fr));
      }
    }

    @media(max-width:440px) {
      #snl-live-stats .controls {
        grid-template-columns:1fr;
      }
    }
  `;

  root.appendChild(css);

  const panel = document.createElement("div");

  panel.innerHTML = `
    <div class="controls">
      <label>Season
        <select id="snl-season">
          <option>Loading...</option>
        </select>
      </label>

      <label>Team
        <select id="snl-team">
          <option value="">All Teams</option>
        </select>
      </label>

      <label>Sort By
        <select id="snl-sort"></select>
      </label>

      <label>Player Search
        <input id="snl-search"
               type="search"
               placeholder="Search player">
      </label>
    </div>

    <p class="notice">
      GameChanger batting statistics are voluntarily
      recorded by participating teams.
      Leaderboards reflect submitted statistics only.
    </p>

    <p class="muted" id="snl-summary">
      Loading statistics...
    </p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr id="snl-headers"></tr>
        </thead>
        <tbody id="snl-rows"></tbody>
      </table>
    </div>

    <p class="status" id="snl-reporting"></p>
    <p class="muted" id="snl-updated"></p>
  `;

  root.appendChild(panel);

  const $ = id => panel.querySelector("#" + id);

  const seasonSelect = $("snl-season");
  const teamSelect = $("snl-team");
  const sortSelect = $("snl-sort");
  const searchInput = $("snl-search");
  const rows = $("snl-rows");

  let data = null;

  function addOption(select, value, label) {
    const el = document.createElement("option");
    el.value = value;
    el.textContent = label;
    select.appendChild(el);
  }

  function addCell(row, tag, value, className = "") {
    const el = document.createElement(tag);
    el.textContent = String(value);

    if (className) el.className = className;

    row.appendChild(el);
    return el;
  }

  function getValue(player, key) {
    const value = player.stats?.[key];

    return typeof value === "number" &&
      Number.isFinite(value)
      ? value
      : null;
  }

  function formatValue(player, key) {
    const value = getValue(player, key);

    if (value === null) return "—";

    return rates.has(key)
      ? value.toFixed(3)
      : String(value);
  }

  function activeSeason() {
    return data?.seasons.find(
      season => season.season_id === seasonSelect.value
    );
  }

  function render() {
    const season = activeSeason();
    if (!season) return;

    const previousTeam = teamSelect.value;

    teamSelect.replaceChildren();

    addOption(teamSelect, "", "All Teams");

    for (const team of season.teams) {
      addOption(
        teamSelect,
        team.team_id,
        team.name
      );
    }

    teamSelect.value = previousTeam;

    const selectedTeam = teamSelect.value;
    const search = searchInput.value
      .trim()
      .toLowerCase();

    const sortKey = sortSelect.value;

    const players = season.players.filter(player =>
      (!selectedTeam ||
        player.team_id === selectedTeam) &&
      player.name.toLowerCase().includes(search)
    );

    players.sort((a, b) => {
      const x = getValue(a, sortKey);
      const y = getValue(b, sortKey);

      return (y ?? -Infinity) -
        (x ?? -Infinity) ||
        a.name.localeCompare(b.name);
    });

    rows.replaceChildren();

    players.forEach((player, index) => {
      const row = document.createElement("tr");

      addCell(row, "td", index + 1);
      addCell(row, "td", player.name, "player");
      addCell(row, "td", player.team);

      for (const key of columns) {
        addCell(
          row,
          "td",
          formatValue(player, key),
          "number"
        );
      }

      rows.appendChild(row);
    });

    if (!players.length) {
      const row = document.createElement("tr");

      addCell(
        row,
        "td",
        "No matching player statistics."
      ).colSpan = columns.length + 3;

      rows.appendChild(row);
    }

    $("snl-summary").textContent =
      `${season.season_label} — ` +
      `${players.length} player records · ` +
      `${season.reporting_team_count} of 6 teams reporting`;

    const reporting = season.teams
      .filter(team =>
        team.reporting_status === "stats_available"
      )
      .map(team => team.name);

    $("snl-reporting").textContent =
      "Teams reporting: " +
      (reporting.join(", ") || "None yet") +
      ". Other teams: No statistics submitted.";
  }

  for (const [key, label] of sorting) {
    addOption(sortSelect, key, label);
  }

  ["#", "Player", "Team", ...columns].forEach(
    (key, index) => {
      addCell(
        $("snl-headers"),
        "th",
        key,
        index > 2
          ? rates.has(key)
            ? "number rate"
            : "number"
          : ""
      );
    }
  );

  seasonSelect.addEventListener("change", () => {
    teamSelect.value = "";
    render();
  });

  teamSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  fetch(DATA_URL, { cache: "no-store" })
    .then(response => {
      if (!response.ok) {
        throw new Error("Stats unavailable");
      }

      return response.json();
    })
    .then(result => {
      if (!Array.isArray(result.seasons) ||
          !result.seasons.length) {
        throw new Error("No season data available");
      }

      data = result;

      seasonSelect.replaceChildren();

      for (const season of data.seasons) {
        addOption(
          seasonSelect,
          season.season_id,
          season.season_label
        );
      }

      seasonSelect.value = data.current_season;

      if (seasonSelect.selectedIndex < 0) {
        seasonSelect.selectedIndex = 0;
      }

      if (data.generated_at_utc) {
        $("snl-updated").textContent =
          "Last processed: " +
          new Date(data.generated_at_utc)
            .toLocaleString();
      }

      render();
    })
    .catch(error => {
      console.error("SNL Stats error:", error);

      $("snl-summary").textContent =
        "Live batting statistics are temporarily unavailable.";
    });
})();
