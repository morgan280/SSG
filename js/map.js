/* Store Stop Go — Locations map (Leaflet + CARTO Positron tiles)
   Status system mirrors the brand: store = scouting (red),
   stop = under contract (amber), go = delivered (green). */
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('map');
  if (!el) return;

  const shell = el.closest('.map-shell');
  if (typeof L === 'undefined') {
    if (shell) shell.innerHTML =
      '<div class="map-fallback"><div><strong>The interactive map needs a connection.</strong><br>Browse the corridor watchlist below — every active file is listed there.</div></div>';
    return;
  }

  // Sample portfolio data — replace with live corridor files.
  const spots = [
    { name: 'Waco — I-35 North', state: 'TX', status: 'go', lat: 31.585, lng: -97.145, aadt: '142K', acres: 28, note: 'Delivered travel-center pad. Opened Q1 2026.' },
    { name: 'New Braunfels — I-35', state: 'TX', status: 'go', lat: 29.703, lng: -98.121, aadt: '168K', acres: 24, note: 'Delivered. Fuel + QSR endcap, open and trading.' },
    { name: 'Ocala — I-75', state: 'FL', status: 'go', lat: 29.187, lng: -82.141, aadt: '96K', acres: 31, note: 'Delivered. Interchange NW quadrant, full access.' },
    { name: 'Terrell — I-20', state: 'TX', status: 'stop', lat: 32.736, lng: -96.294, aadt: '58K', acres: 22, note: 'Under contract. Entitlements in progress.' },
    { name: 'Baton Rouge — I-10 W', state: 'LA', status: 'stop', lat: 30.415, lng: -91.135, aadt: '118K', acres: 18, note: 'Under contract. Phase I complete, survey underway.' },
    { name: 'Crossville — I-40', state: 'TN', status: 'stop', lat: 35.952, lng: -85.031, aadt: '46K', acres: 26, note: 'Under contract. Utility agreements in negotiation.' },
    { name: 'Athens — I-65', state: 'AL', status: 'stop', lat: 34.796, lng: -86.966, aadt: '74K', acres: 20, note: 'Under contract. Zoning hearing scheduled.' },
    { name: 'Buckeye — I-10', state: 'AZ', status: 'stop', lat: 33.373, lng: -112.556, aadt: '102K', acres: 35, note: 'Under contract. Title work in final review.' },
    { name: 'Ennis — I-45', state: 'TX', status: 'store', lat: 32.329, lng: -96.622, aadt: '71K', acres: 25, note: 'Scouting. Traffic counts and drive-time study running.' },
    { name: 'Luling — I-10', state: 'TX', status: 'store', lat: 29.681, lng: -97.647, aadt: '84K', acres: 30, note: 'Scouting. Two off-market parcels under review.' },
    { name: 'Ardmore — I-35', state: 'OK', status: 'store', lat: 34.174, lng: -97.129, aadt: '51K', acres: 27, note: 'Scouting. Corridor drive complete, scoring in progress.' },
    { name: 'Springfield — I-44', state: 'MO', status: 'store', lat: 37.208, lng: -93.292, aadt: '62K', acres: 23, note: 'Scouting. Growth-model flag: +9% five-year population.' },
    { name: 'Monument — I-25', state: 'CO', status: 'store', lat: 39.066, lng: -104.872, aadt: '88K', acres: 29, note: 'Scouting. Visibility and access scoring underway.' },
    { name: 'Richmond — I-75', state: 'KY', status: 'store', lat: 37.748, lng: -84.295, aadt: '57K', acres: 21, note: 'Scouting. Competitor-gap analysis flagged this exit.' },
    { name: 'Fort Worth (Alliance) — I-35W', state: 'TX', status: 'store', lat: 32.987, lng: -97.318, aadt: '124K', acres: 19, note: 'Scouting. Logistics-corridor demand model in progress.' }
  ];

  const label = { store: 'Scouting', stop: 'Under contract', go: 'Delivered' };
  const chip = { store: 'chip--store', stop: 'chip--stop', go: 'chip--go' };

  const map = L.map('map', { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  const groups = {
    store: L.layerGroup().addTo(map),
    stop: L.layerGroup().addTo(map),
    go: L.layerGroup().addTo(map)
  };
  const all = [];

  spots.forEach(s => {
    const m = L.marker([s.lat, s.lng], {
      icon: L.divIcon({
        className: 'pin-wrap',
        html: '<span class="map-pin map-pin--' + s.status + '"></span>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      title: s.name + ', ' + s.state
    }).bindPopup(
      '<div class="pop"><strong>' + s.name + ', ' + s.state + '</strong>' +
      '<span class="chip ' + chip[s.status] + '"><i></i>' + label[s.status] + '</span>' +
      '<ul><li><b>' + s.aadt + '</b>corridor AADT</li><li><b>' + s.acres + ' ac</b>site target</li></ul>' +
      '<p>' + s.note + '</p></div>',
      { maxWidth: 280 }
    );
    groups[s.status].addLayer(m);
    all.push(m);
  });

  map.fitBounds(L.featureGroup(all).getBounds().pad(0.18));

  /* status filters */
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.filter;
      Object.entries(groups).forEach(([k, g]) => {
        if (f === 'all' || f === k) map.addLayer(g);
        else map.removeLayer(g);
      });
    });
  });
});
