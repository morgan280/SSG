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
    { name: 'Ocala — I-75', state: 'FL', status: 'go', lat: 29.187, lng: -82.141, aadt: '96K', acres: 31, note: 'Delivered. Interchange NW quadrant, full access.' },
    { name: 'Cheyenne — I-80', state: 'WY', status: 'go', lat: 41.140, lng: -104.820, aadt: '52K', acres: 26, note: 'Delivered. Freight-corridor travel center, open and trading.' },
    { name: 'Savannah — I-95', state: 'GA', status: 'go', lat: 32.088, lng: -81.243, aadt: '78K', acres: 30, note: 'Delivered. Coastal interchange pad, opened this year.' },
    { name: 'Crossville — I-40', state: 'TN', status: 'stop', lat: 35.952, lng: -85.031, aadt: '46K', acres: 26, note: 'Under contract. Utility agreements in negotiation.' },
    { name: 'Athens — I-65', state: 'AL', status: 'stop', lat: 34.796, lng: -86.966, aadt: '74K', acres: 20, note: 'Under contract. Zoning hearing scheduled.' },
    { name: 'Buckeye — I-10', state: 'AZ', status: 'stop', lat: 33.373, lng: -112.556, aadt: '102K', acres: 35, note: 'Under contract. Title work in final review.' },
    { name: 'Carlisle — I-81', state: 'PA', status: 'stop', lat: 40.201, lng: -77.189, aadt: '62K', acres: 24, note: 'Under contract. Phase I complete, survey underway.' },
    { name: 'St. George — I-15', state: 'UT', status: 'stop', lat: 37.096, lng: -113.568, aadt: '44K', acres: 22, note: 'Under contract. Entitlements in progress.' },
    { name: 'Springfield — I-44', state: 'MO', status: 'store', lat: 37.208, lng: -93.292, aadt: '62K', acres: 23, note: 'Scouting. Growth-model flag: +9% five-year population.' },
    { name: 'Monument — I-25', state: 'CO', status: 'store', lat: 39.066, lng: -104.872, aadt: '88K', acres: 29, note: 'Scouting. Visibility and access scoring underway.' },
    { name: 'Richmond — I-75', state: 'KY', status: 'store', lat: 37.748, lng: -84.295, aadt: '57K', acres: 21, note: 'Scouting. Competitor-gap analysis flagged this exit.' },
    { name: 'Salem — I-5', state: 'OR', status: 'store', lat: 44.943, lng: -123.035, aadt: '112K', acres: 20, note: 'Scouting. Drive-time study running on two parcels.' },
    { name: 'Rapid City — I-90', state: 'SD', status: 'store', lat: 44.081, lng: -103.231, aadt: '29K', acres: 32, note: 'Scouting. Seasonal tourism counts in progress.' },
    { name: 'Elkhart — I-80/90', state: 'IN', status: 'store', lat: 41.682, lng: -85.977, aadt: '54K', acres: 23, note: 'Scouting. Logistics-corridor demand model in progress.' },
    { name: 'Las Cruces — I-10', state: 'NM', status: 'store', lat: 32.320, lng: -106.776, aadt: '38K', acres: 28, note: 'Scouting. Corridor drive complete, scoring in progress.' }
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
