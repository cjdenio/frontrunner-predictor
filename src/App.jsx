import { useState, useRef, useEffect } from "react";

function getNow() {
  if (true) {
    return new Date();
  } else {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
    // return new Date("2026-10-09");
  }
}

function formatDistance(time, now) {
  const distanceMs = time - now;

  if (distanceMs > 1000 * 60 * 60) {
    return `${Math.floor(distanceMs / 1000 / 60 / 60)}h`;
  } else {
    return `${Math.floor(distanceMs / 1000 / 60)}m`;
  }
}

export default function App() {
  const [station, setStation] = useState("21771");
  const [loading, setLoading] = useState(false);
  const [departures, setDepartures] = useState([]);
  const [clock, setClock] = useState(getNow().toLocaleTimeString("en-US"));

  const loadedDepartures = useRef(null);

  function loadDepartures(s) {
    setLoading(true);
    fetch(
      `https://uta.clb.li/api/upcoming-departures?stationIds=${s}&from=${Math.round(getNow().getTime() / 1000)}`,
    )
      .then((r) => r.json())
      .then((r) => {
        loadedDepartures.current = r;
        refreshUI();
        setLoading(false);
      });
  }

  function refreshUI() {
    setClock(getNow().toLocaleTimeString("en-US"));

    if (loadedDepartures?.current?.departures?.length) {
      const now = getNow();

      setDepartures(
        loadedDepartures.current.departures
          .filter((d) => new Date(d.departureTime) > getNow())
          .map((d) => {
            return {
              tripId: d.tripId,
              headsign: d.headsign,
              track: d.predictedPlatform,
              when: formatDistance(new Date(d.departureTime), now),
            };
          }),
      );
    } else {
      setDepartures([]);
    }
  }

  useEffect(() => {
    loadDepartures(station);

    const interval = setInterval(() => {
      refreshUI();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="pt-10">
      <div className="w-96 mx-auto mb-10">
        <h1 className="text-center text-xl">FrontRunner Track Predictor</h1>
        <div className="flex justify-between border border-gray-300">
          <select
            value={station}
            onChange={(e) => {
              setStation(e.target.value);
              loadDepartures(e.target.value);
            }}
          >
            <option value="21753" disabled>
              Ogden
            </option>
            <option value="21760">Roy</option>
            <option value="21757">Clearfield</option>
            <option value="21772">Layton</option>
            <option value="21758">Farmington</option>
            <option value="21759">Woods Cross</option>
            <option value="23113">North Temple</option>
            <option value="21771">Salt Lake Central</option>
            <option value="23080">Murray Central</option>
            <option value="23082">South Jordan</option>
            <option value="23081">Draper</option>
            <option value="23074">Lehi</option>
            <option value="23071">American Fork</option>
            <option value="25330">Vineyard</option>
            <option value="23076">Orem</option>
            <option value="23073" disabled>
              Provo
            </option>
          </select>

          <p>{clock}</p>
        </div>
      </div>

      <div className="flex justify-center gap-5 h-64 w-96 mx-auto">
        <div className="bg-gray-300 p-3 place-content-center text-gray-400 shrink-0">
          track 1
        </div>
        {loading ? (
          <p className="place-content-center grow text-center">Loading...</p>
        ) : departures.length == 0 ? (
          <p className="place-content-center grow text-center">
            No departures scheduled for the next 60 minutes.
          </p>
        ) : (
          <ul className="place-content-center grow">
            {departures.map((d) => (
              <li key={d.tripId} className="text-center">
                {d.track == "1" && "⬅️ "}
                {d.headsign} in {d.when}
                {d.track == "2" && " ➡️"}
              </li>
            ))}
          </ul>
        )}
        <div className="bg-gray-300 p-3 place-content-center text-gray-400 shrink-0">
          track 2
        </div>
      </div>
    </main>
  );
}
