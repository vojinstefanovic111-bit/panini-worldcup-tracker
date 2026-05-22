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
      list.push({
        id: id,
        team: team,
        section: "Team",
        number: String(i),
        globalNumber: String(id).padStart(3, "0"),
        name: shortNames[team] + i,
        rarity: i === 20 ? "Legendary" : i % 10 === 0 ? "Shiny" : i % 5 === 0 ? "Special" : "Normal",
      });

      id++;
    }
  }

  for (let i = 1; i <= SPECIAL_STICKERS; i++) {
    list.push({
      id: id,
      team: "World Cup 26 Specials",
      section: "Special",
      number: String(i),
      globalNumber: String(id).padStart(3, "0"),
      name: "FWC" + i,
      rarity: i % 5 === 0 ? "Legendary" : "Special",
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-sky-950 p-4 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-center text-4xl font-black">
          Panini World Cup 26 Tracker
        </h1>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stickers..."
            className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {filtered.map((sticker) => {
            const count = collection[sticker.id] || 0;

            return (
              <div
                key={sticker.id}
                className={`rounded-2xl border p-2 text-center transition ${
                  count > 0
                    ? "border-white bg-white text-slate-950"
                    : "border-white/10 bg-white/10 text-white"
                }`}
              >
                <p className="text-[10px] opacity-70">#{sticker.globalNumber}</p>
                <h3 className="text-sm font-black">{sticker.name}</h3>

                <div className="my-2 rounded-xl border border-white/10 bg-black/10 p-2 text-[10px]">
                  {sticker.team}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => changeCount(sticker.id, -1)}
                    className="rounded-lg bg-black/20 px-2 py-1"
                  >
                    -
                  </button>

                  <span className="text-sm font-black">{count}</span>

                  <button
                    onClick={() => changeCount(sticker.id, 1)}
                    className="rounded-lg bg-black/20 px-2 py-1"
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
