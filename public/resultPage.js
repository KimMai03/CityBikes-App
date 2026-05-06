const params      = new URLSearchParams(window.location.search);
const networkId   = params.get('networkId');
const networkName = params.get('networkName') || 'Bike Network';
const city        = params.get('city') || '';
const country     = params.get('country') || '';

document.getElementById('networkTitle').textContent = decodeURIComponent(networkName);
document.getElementById('networkSubtitle').textContent =
    [decodeURIComponent(city), decodeURIComponent(country)].filter(Boolean).join(', ') + ' — Live Station Availability';

let stationMap = null;
let allStations = [];

async function loadStations() {
    if (!networkId) { showError(); return; }

    try {
        const res = await fetch(`https://api.citybik.es/v2/networks/${networkId}`);
        if (!res.ok) throw new Error('Bad response');
        const json = await res.json();
        allStations = json.network?.stations || [];

        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('resultsContent').style.display = 'block';

        renderSummary(allStations);
        initMap(allStations);
        renderStations(allStations);
    } catch (e) {
        showError();
    }
}

 function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}

function renderSummary(stations) {
    const total = stations.length;
    const withBikes = stations.filter(s => (s.free_bikes || 0) > 0).length;
    const empty = stations.filter(s => (s.free_bikes || 0) === 0).length;
    const full = stations.filter(s => (s.empty_slots || 0) === 0).length;

    document.getElementById('summaryRow').innerHTML = `
        <div class="card" style="padding:12px 18px; text-align:center; min-width:110px;">
            <div style="font-size:1.4rem; font-weight:800; color:var(--primary);">${total}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Total Stations</div>
        </div>
        <div class="card" style="padding:12px 18px; text-align:center; min-width:110px;">
            <div style="font-size:1.4rem; font-weight:800; color:#16A34A;">${withBikes}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Have Bikes</div>
        </div>
        <div class="card" style="padding:12px 18px; text-align:center; min-width:110px;">
            <div style="font-size:1.4rem; font-weight:800; color:#EF4444;">${empty}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">No Bikes</div>
        </div>
        <div class="card" style="padding:12px 18px; text-align:center; min-width:110px;">
            <div style="font-size:1.4rem; font-weight:800; color:#D97706;">${full}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Full Docks</div>
        </div>
    `;
}

function stationStatus(s) {
    const bikes = s.free_bikes || 0;
    if (bikes === 0) return 'empty';
    if (bikes <= 3) return 'limited';
    return 'available';
}

function markerColor(s) {
    const status = stationStatus(s);
    if (status === 'available') return '#22C55E';
    if (status === 'limited')   return '#F59E0B';
    return '#EF4444';
}

function badgeHTML(s) {
    const status = stationStatus(s);
    const cls    = status === 'available' ? 'badge-available' : status === 'limited' ? 'badge-limited' : 'badge-full';
    const label  = status === 'available' ? 'Available' : status === 'limited' ? 'Limited' : 'No Bikes';
    return `<span class="station-badge ${cls}">${label}</span>`;
}

function initMap(stations) {
    if (stations.length === 0) return;

    const firstValid = stations.find(s => s.latitude && s.longitude);
    const center = firstValid ? [firstValid.latitude, firstValid.longitude] : [20, 0];

    stationMap = L.map('stationMap').setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(stationMap);

    stations.forEach(s => {
        if (!s.latitude || !s.longitude) return;
        const bikes = s.free_bikes || 0;
        const docks = s.empty_slots || 0;
        const color = markerColor(s);

        L.circleMarker([s.latitude, s.longitude], {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            fillOpacity: 0.9
        }).addTo(stationMap).bindPopup(
            `<strong>${s.name || 'Station'}</strong><br/>` +
            `Bikes available: <strong>${bikes}</strong><br/>` +
            `Docks free: <strong>${docks}</strong>`
        );
    });

    const coords = stations.filter(s => s.latitude && s.longitude).map(s => [s.latitude, s.longitude]);
    if (coords.length > 1) {
        stationMap.fitBounds(L.latLngBounds(coords).pad(0.1));
    }
}

function renderStations(stations) {
    const listEl  = document.getElementById('stationList');
    const countEl = document.getElementById('stationCount');
    listEl.innerHTML = '';
    countEl.textContent = `(${stations.length})`;

    if (stations.length === 0) {
        listEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.88rem;">No stations match this filter.</p>';
        return;
    }

    stations.forEach(s => {
        const bikes     = s.free_bikes || 0;
        const docks     = s.empty_slots || 0;
        const bikePct   = Math.min(100, bikes * 10);

        const card = document.createElement('div');
        card.className = 'station-card';
        card.setAttribute('data-status', stationStatus(s));
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px;">
                    h4>${s.name || 'Unnamed Station'}</h4>
                ${badgeHTML(s)}
            </div>
            <div class="station-stats">
                <span class="stat-pill pill-bikes">${bikes} bikes</span>
                <span class="stat-pill pill-docks">${docks} docks free</span>
            </div>
            <div style="margin-top:8px;">
                <div class="stat-bar">
                    <div class="stat-bar-fill ${bikes <= 3 ? (bikes === 0 ? 'danger' : 'warn') : ''}" style="width:${bikePct}%"></div>
                </div>
            </div>
        `;
        listEl.appendChild(card);
    });
}

function filterStations(type, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filtered = type === 'all'
        ? allStations
        : allStations.filter(s => stationStatus(s) === type);
    renderStations(filtered);
}

window.onload = loadStations();
