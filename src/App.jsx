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
  "Mexico": "MEX","South Africa": "RSA","Korea Republic": "KOR","Czechia": "CZE",
  "Canada": "CAN","Bosnia and Herzegovina": "BIH","Qatar": "QAT","Switzerland": "SUI",
  "Haiti": "HAI","Scotland": "SCO","Brazil": "BRA","Morocco": "MAR",
  "USA": "USA","Paraguay": "PAR","Australia": "AUS","Türkiye": "TUR",
  "Côte d'Ivoire": "CIV","Ecuador": "ECU","Germany": "GER","Curaçao": "CUW",
  "Netherlands": "NED","Japan": "JPN","Sweden": "SWE","Tunisia": "TUN",
  "IR Iran": "IRN","New Zealand": "NZL","Belgium": "BEL","Egypt": "EGY",
  "Saudi Arabia": "KSA","Uruguay": "URU","Spain": "ESP","Cabo Verde": "CPV",
  "France": "FRA","Senegal": "SEN","Iraq": "IRQ","Norway": "NOR",
  "Argentina": "ARG","Algeria": "ALG","Austria": "AUT","Jordan": "JOR",
  "Portugal": "POR","Congo DR": "COD","Uzbekistan": "UZB","Colombia": "COL",
  "Ghana": "GHA","Panama": "PAN","England": "ENG","Croatia": "CRO"
};

const STORAGE_KEY = "panini-world-cup-26-collection";
const STICKERS_PER_TEAM = 20;
const SPECIAL_STICKERS = 20;

function makeStickers() {
  const list = [];
  let id = 1;

  for (const team of teams) {
    for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
      list.push({
        id,
        team,
        name: shortNames[team] + i,
        globalNumber: String(id).padStart(3, "0")
      });
      id++;
    }
  }

  for (let i = 1; i <= SPECIAL_STICKERS; i++) {
    list.push({
      id,
      team: "FWC",
      name: "FWC" + i,
      globalNumber: String(id).padStart(3, "0")
    });
    id++;
  }

  return list;
}

const stickers = makeStickers();

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

  function changeCount(id, amount) {
    setCollection((current) => {
      const next = { ...current };
      const newCount = Math.max(0, (next[id] || 0) + amount);

      if (newCount === 0) delete next[id];
      else next[id] = newCount;

      return next;
    });
  }

  const filtered = useMemo(() => {
    return stickers.filter((sticker) =>
      sticker.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-sky-950 p-2 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center text-2xl font-black">
          Panini Tracker
        </h1>

        <div className="mb-4 flex justify-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full max-w-sm rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {filtered.map((sticker) => {
            const count = collection[sticker.id] || 0;

            return (
              <div
                key={sticker.id}
                className={`rounded-xl border p-1 text-center ${
                  count > 0
                    ? "border-white bg-white text-slate-950"
                    : "border-white/10 bg-white/10 text-white"
                }`}
              >
                <p className="text-[9px] font-black leading-none">{sticker.name}</p>
                <p className="text-[8px] opacity-60 leading-none">{sticker.globalNumber}</p>

                <div className="mt-1 flex items-center justify-center gap-1">
                  <button
                    onClick={() => changeCount(sticker.id, -1)}
                    className="rounded bg-black/20 px-1 text-[10px]"
                  >
                    -
                  </button>

                  <span className="text-[10px] font-black">{count}</span>

                  <button
                    onClick={() => changeCount(sticker.id, 1)}
                    className="rounded bg-black/20 px-1 text-[10px]"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
