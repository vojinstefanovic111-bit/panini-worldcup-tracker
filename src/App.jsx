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
  "Mexico": "MEX", "South Africa": "RSA", "Korea Republic": "KOR", "Czechia": "CZE",
  "Canada": "CAN", "Bosnia and Herzegovina": "BIH", "Qatar": "QAT", "Switzerland": "SUI",
  "Haiti": "HAI", "Scotland": "SCO", "Brazil": "BRA", "Morocco": "MAR",
  "USA": "USA", "Paraguay": "PAR", "Australia": "AUS", "Türkiye": "TUR",
  "Côte d'Ivoire": "CIV", "Ecuador": "ECU", "Germany": "GER", "Curaçao": "CUW",
  "Netherlands": "NED", "Japan": "JPN", "Sweden": "SWE", "Tunisia": "TUN",
  "IR Iran": "IRN", "New Zealand": "NZL", "Belgium": "BEL", "Egypt": "EGY",
  "Saudi Arabia": "KSA", "Uruguay": "URU", "Spain": "ESP", "Cabo Verde": "CPV",
  "France": "FRA", "Senegal": "SEN", "Iraq": "IRQ", "Norway": "NOR",
  "Argentina": "ARG", "Algeria": "ALG", "Austria": "AUT", "Jordan": "JOR",
  "Portugal": "POR", "Congo DR": "COD", "Uzbekistan": "UZB", "Colombia": "COL",
  "Ghana": "GHA", "Panama": "PAN", "England": "ENG", "Croatia": "CRO"
};

const STORAGE_KEY = "panini-world-cup-26-collection";
const STICKERS_PER_TEAM = 20;
const SPECIAL_STICKERS = 20;

function makeGroups() {
  const groups = [];
  let id = 1;

  for (const team of teams) {
    const stickers = [];

    for (let number = 1; number <= STICKERS_PER_TEAM; number++) {
      stickers.push({
        id,
        number,
        name: shortNames[team] + number,
      });
      id++;
    }

    groups.push({ team, shortName: shortNames[team], stickers });
  }

  const specialStickers = [];
  for (let number = 1; number <= SPECIAL_STICKERS; number++) {
    specialStickers.push({
      id,
      number,
      name: "FWC" + number,
    });
    id++;
  }

  groups.push({ team: "World Cup 26 Specials", shortName: "FWC", stickers: specialStickers });

  return groups;
}

const groups = makeGroups();

export default function App() {
  const [collection, setCollection] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }, [collection]);

  function addSticker(id) {
    setCollection((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }));
  }

  function removeSticker(event, id) {
    event.preventDefault();

    setCollection((current) => {
      const next = { ...current };
      const newCount = Math.max(0, (next[id] || 0) - 1);

      if (newCount === 0) delete next[id];
      else next[id] = newCount;

      return next;
    });
  }

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return groups;

    return groups.filter((group) =>
      group.team.toLowerCase().includes(search) ||
      group.shortName.toLowerCase().includes(search)
    );
  }, [query]);

  const totalOwned = Object.values(collection).filter((count) => count > 0).length;
  const duplicates = Object.values(collection).reduce((sum, count) => sum + Math.max(0, count - 1), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-sky-950 p-2 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-center text-2xl font-black">Panini Tracker</h1>

        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/10 px-3 py-1">Owned: {totalOwned}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Duplicates: {duplicates}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Click +1 / right click -1</span>
        </div>

        <div className="mb-4 flex justify-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country"
            className="w-full max-w-sm rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGroups.map((group) => {
            const ownedInGroup = group.stickers.filter((sticker) => (collection[sticker.id] || 0) > 0).length;

            return (
              <div key={group.team} className="rounded-2xl border border-white/10 bg-white/10 p-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="truncate text-sm font-black">{group.team}</h2>
                  <span className="shrink-0 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold">
                    {ownedInGroup}/{group.stickers.length}
                  </span>
                </div>

                <div className="grid grid-cols-10 gap-1">
                  {group.stickers.map((sticker) => {
                    const count = collection[sticker.id] || 0;

                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        onClick={() => addSticker(sticker.id)}
                        onContextMenu={(event) => removeSticker(event, sticker.id)}
                        title={`${sticker.name} - you have ${count}`}
                        className={`relative aspect-square rounded-md text-[10px] font-black leading-none ${
                          count > 1
                            ? "bg-yellow-300 text-slate-950"
                            : count === 1
                            ? "bg-white text-slate-950"
                            : "bg-black/25 text-white/60"
                        }`}
                      >
                        {sticker.number}
                        {count > 1 && (
                          <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1 text-[8px] text-white">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
