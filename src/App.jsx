import React, { useEffect, useMemo, useState } from "react";

const teams = [
  "Mexico", "South Africa", "Korea Republic", "Czechia",
  "Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland",
  "Haiti", "Scotland", "Brazil", "Morocco",
  "USA", "Paraguay", "Australia", "Türkiye",
  "Côte d'Ivoire", "Ecuador", "Germany", "Curaçao",
  "Netherlands", "Japan", "Sweden", "Tunisia",
  "IR Iran", "New Zealand", "Belgium", "Egypt",
  "Saudi Arabia", "Uruguay", "Spain", "Cabo Verde",
  "France", "Senegal", "Iraq", "Norway",
  "Argentina", "Algeria", "Austria", "Jordan",
  "Portugal", "Congo DR", "Uzbekistan", "Colombia",
  "Ghana", "Panama", "England", "Croatia"
];

const shortNames = {
  "Mexico": "MEX",
  "South Africa": "RSA",
  "Korea Republic": "KOR",
  "Czechia": "CZE",
  "Canada": "CAN",
  "Bosnia and Herzegovina": "BIH",
  "Qatar": "QAT",
  "Switzerland": "SUI",
  "Haiti": "HAI",
  "Scotland": "SCO",
  "Brazil": "BRA",
  "Morocco": "MAR",
  "USA": "USA",
  "Paraguay": "PAR",
  "Australia": "AUS",
  "Türkiye": "TUR",
  "Côte d'Ivoire": "CIV",
  "Ecuador": "ECU",
  "Germany": "GER",
  "Curaçao": "CUW",
  "Netherlands": "NED",
  "Japan": "JPN",
  "Sweden": "SWE",
  "Tunisia": "TUN",
  "IR Iran": "IRN",
  "New Zealand": "NZL",
  "Belgium": "BEL",
  "Egypt": "EGY",
  "Saudi Arabia": "KSA",
  "Uruguay": "URU",
  "Spain": "ESP",
  "Cabo Verde": "CPV",
  "France": "FRA",
  "Senegal": "SEN",
  "Iraq": "IRQ",
  "Norway": "NOR",
  "Argentina": "ARG",
  "Algeria": "ALG",
  "Austria": "AUT",
  "Jordan": "JOR",
  "Portugal": "POR",
  "Congo DR": "COD",
  "Uzbekistan": "UZB",
  "Colombia": "COL",
  "Ghana": "GHA",
  "Panama": "PAN",
  "England": "ENG",
  "Croatia": "CRO"
};

const STORAGE_KEY = "panini-world-cup-26-collection";
const STICKERS_PER_TEAM = 20;
const SPECIAL_STICKERS = 20;
const TOTAL_STICKERS = teams.length * STICKERS_PER_TEAM + SPECIAL_STICKERS;
const CODE_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

function numberToCode(number, length = 2) {
  let value = number;
  let code = "";

  for (let i = 0; i < length; i++) {
    code = CODE_CHARS[value % 64] + code;
    value = Math.floor(value / 64);
  }

  return code;
}

function codeToNumber(code) {
  return code.split("").reduce((total, char) => total * 64 + CODE_CHARS.indexOf(char), 0);
}

function makeStickers() {
  const list = [];
  let id = 1;

  for (const team of teams) {
    for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
      const stickerNumber = String(i);

      list.push({
        id: id,
        team: team,
        section: "Team",
        number: stickerNumber,
        globalNumber: String(id).padStart(3, "0"),
        name: shortNames[team] + stickerNumber,
        rarity:
          i === 20
            ? "Legendary"
            : i % 10 === 0
            ? "Shiny"
            : i % 5 === 0
            ? "Special"
            : "Normal",
      });

      id++;
    }
  }

  for (let i = 1; i <= SPECIAL_STICKERS; i++) {
    const stickerNumber = String(i);

    list.push({
      id: id,
      team: "World Cup 26 Specials",
      section: "Special",
      number: stickerNumber,
      globalNumber: String(id).padStart(3, "0"),
      name: "FWC" + stickerNumber,
      rarity: i % 5 === 0 ? "Legendary" : "Special",
    });

    id++;
  }

  return list;
}

const stickers = makeStickers();
const searchableStickers = stickers.map((sticker) => ({
  ...sticker,
  searchText: `${sticker.name} ${sticker.team} ${sticker.number} ${sticker.globalNumber}`.toLowerCase()
}));

function loadCollection() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveCollection(collection) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  } catch {
    // Ignore storage errors.
  }
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border ${className}`}>{children}</div>;
}

function Button({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 font-bold transition ${className}`}
    >
      {children}
    </button>
  );
}

function Stat({ title, value }) {
  return (
    <Card className="bg-white/10 border-white/10 p-4">
      <p className="text-sm text-white/70">{title}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </Card>
  );
}

export default function App() {
  const [collection, setCollection] = useState(loadCollection);
  const [backupText, setBackupText] = useState("");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [view, setView] = useState("all");
  const [message, setMessage] = useState("Saved on this device");

  useEffect(() => {
    saveCollection(collection);
    setMessage("Saved on this device");
  }, [collection]);

  const stats = useMemo(() => {
    const owned = stickers.filter((sticker) => (collection[sticker.id] || 0) > 0).length;
    const duplicates = stickers.reduce((sum, sticker) => sum + Math.max(0, (collection[sticker.id] || 0) - 1), 0);
    const missing = TOTAL_STICKERS - owned;
    const percent = Math.round((owned / TOTAL_STICKERS) * 100);
    return { owned, missing, duplicates, percent };
  }, [collection]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return searchableStickers.filter((sticker) => {
      const count = collection[sticker.id] || 0;
      const matchesSearch = search === "" || sticker.searchText.includes(search);
      const matchesTeam = teamFilter === "All" || sticker.team === teamFilter;
      const matchesView =
        view === "all" ||
        (view === "owned" && count > 0) ||
        (view === "missing" && count === 0) ||
        (view === "duplicates" && count > 1);

      return matchesSearch && matchesTeam && matchesView;
    });
  }, [collection, query, teamFilter, view]);

  const duplicateList = stickers.filter((sticker) => (collection[sticker.id] || 0) > 1);
  const teamOptions = ["All", ...teams, "World Cup 26 Specials"];

  function changeCount(id, amount) {
    setCollection((current) => {
      const next = { ...current };
      const newCount = Math.max(0, (next[id] || 0) + amount);

      if (newCount === 0) delete next[id];
      else next[id] = newCount;

      return next;
    });
  }

  function resetCollection() {
    localStorage.removeItem(STORAGE_KEY);
    setCollection({});
    setMessage("Collection reset");
  }

  function exportBackup() {
    try {
      const denseCode =
        "D" +
        stickers
          .map((sticker) => {
            const count = Math.min(collection[sticker.id] || 0, 35);
            return count.toString(36);
          })
          .join("")
          .replace(/0+$/, "");

      const owned = Object.entries(collection)
        .filter(([, count]) => Number(count) > 0)
        .sort(([a], [b]) => Number(a) - Number(b));

      const singleCopies = owned.map(([id]) => numberToCode(Number(id) - 1, 2)).join("");
      const duplicateCopies = owned
        .filter(([, count]) => Number(count) > 1)
        .map(([id, count]) => numberToCode(Number(id) - 1, 2) + Math.min(Number(count), 35).toString(36))
        .join("");

      const sparseCode = `S${singleCopies}${duplicateCopies ? ":" + duplicateCopies : ""}`;
      const bestCode = sparseCode.length < denseCode.length ? sparseCode : denseCode;

      setBackupText(bestCode);
      setMessage("Shortest backup exported");
    } catch {
      setMessage("Failed to export backup");
    }
  }

  function importBackup() {
    try {
      const text = backupText.trim();
      const next = {};

      if (text.startsWith("S")) {
        const [ownedPart = "", duplicatePart = ""] = text.slice(1).split(":");

        if (ownedPart.length % 2 !== 0 || duplicatePart.length % 3 !== 0) {
          throw new Error("Invalid backup");
        }

        for (let i = 0; i < ownedPart.length; i += 2) {
          const id = codeToNumber(ownedPart.slice(i, i + 2)) + 1;
          if (id < 1 || id > TOTAL_STICKERS) throw new Error("Invalid backup");
          next[id] = 1;
        }

        for (let i = 0; i < duplicatePart.length; i += 3) {
          const id = codeToNumber(duplicatePart.slice(i, i + 2)) + 1;
          const count = parseInt(duplicatePart[i + 2], 36);
          if (id < 1 || id > TOTAL_STICKERS || !count) throw new Error("Invalid backup");
          next[id] = count;
        }
      } else {
        const denseText = text.startsWith("D") ? text.slice(1) : text.toLowerCase();

        for (let i = 0; i < denseText.length; i++) {
          const count = parseInt(denseText[i], 36);
          if (Number.isNaN(count)) throw new Error("Invalid backup");
          if (count > 0) next[i + 1] = count;
        }
      }

      setCollection(next);
      setMessage("Backup imported");
    } catch {
      setMessage("Invalid backup text");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-sky-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm">
              Panini World Cup 26
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              Sticker Collection Tracker
            </h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Track collected stickers, missing stickers, and duplicates for trade.
            </p>
            <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm">
              {message}
            </p>
          </div>

          <Button onClick={resetCollection} className="bg-white text-slate-950 hover:bg-white/90">
            Reset
          </Button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat title="Owned" value={stats.owned} />
          <Stat title="Missing" value={stats.missing} />
          <Stat title="Duplicates" value={stats.duplicates} />
          <Stat title="Complete" value={`${stats.percent}%`} />
        </section>

        <Card className="mb-6 border-white/10 bg-white/10 p-4 md:p-5">
          <div className="mb-4 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <textarea
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              placeholder="Backup text appears here when you export. Paste backup text here before importing."
              className="mb-4 min-h-20 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm outline-none"
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={exportBackup} className="bg-white text-slate-950 hover:bg-white/90">
                Export Backup
              </Button>
              <Button onClick={importBackup} className="border border-white/10 bg-white/10 text-white hover:bg-white/20">
                Import Backup
              </Button>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stickers..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-12 outline-none"
                />

                {query !== "" && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-3 py-1 font-bold hover:bg-white/20"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                {teamOptions.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <main className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-5 flex flex-wrap gap-2">
              {["all", "owned", "missing", "duplicates"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-full border px-4 py-2 capitalize transition ${
                    view === item
                      ? "border-white bg-white text-slate-950"
                      : "border-white/10 bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((sticker) => {
                const count = collection[sticker.id] || 0;

                return (
                  <Card
                    key={sticker.id}
                    className={`p-4 transition hover:-translate-y-1 ${
                      count > 0
                        ? "border-white bg-white text-slate-950"
                        : "border-white/10 bg-white/10 text-white"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm opacity-70">
                          Album #{sticker.globalNumber} • {sticker.team} #{sticker.number}
                        </p>
                        <h3 className="text-lg font-black">{sticker.name}</h3>
                        <p className="text-sm opacity-70">{sticker.section}</p>
                      </div>
                      <span className="rounded-full bg-black/20 px-3 py-1 text-xs">
                        {sticker.rarity}
                      </span>
                    </div>

                    <div className="mb-4 flex h-28 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-center">
                      <div>
                        <p className="font-bold">{sticker.team}</p>
                        <p className="text-sm opacity-70">{sticker.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button onClick={() => changeCount(sticker.id, -1)} className="bg-black/20 hover:bg-black/30">
                        −
                      </Button>
                      <div className="text-center">
                        <p className="text-xs opacity-70">You have</p>
                        <p className="text-2xl font-black">{count}</p>
                      </div>
                      <Button onClick={() => changeCount(sticker.id, 1)} className="bg-black/20 hover:bg-black/30">
                        +
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <aside>
            <Card className="sticky top-6 border-white bg-white p-5 text-slate-950">
              <h2 className="mb-2 text-2xl font-black">Duplicates for Trade</h2>
              <p className="mb-4 text-sm text-slate-500">
                Stickers where you have more than one copy.
              </p>

              {duplicateList.length === 0 ? (
                <div className="rounded-2xl bg-slate-100 p-4 text-center text-slate-500">
                  No duplicates yet.
                </div>
              ) : (
                <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
                  {duplicateList.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 p-3"
                    >
                      <div>
                        <p className="font-bold">
                          {sticker.team} #{sticker.number}
                        </p>
                        <p className="text-xs text-slate-500">{sticker.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">x{(collection[sticker.id] || 0) - 1}</p>
                        <p className="text-xs text-slate-500">trade</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}