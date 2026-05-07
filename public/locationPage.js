const map = L.map('worldMap').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    let allNetworks = [];
    let markers = [];

    const HISTORY_KEY = 'citybikes_search_history';

    async function loadAllNetworks() {
        try {
            const res = await fetch('/api/networks');
            const json = await res.json();
            allNetworks = json.networks || [];
            plotMarkers(allNetworks, false);
        } catch (e) {
            document.getElementById('searchStatus').textContent = 'Could not load network data. Check your connection.';
        }
    }

    function plotMarkers(networks, fitBounds) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        networks.forEach(n => {
            if (!n.location) return;
            const { latitude: lat, longitude: lng, city, country } = n.location;
            const marker = L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: '#0057B8',
                color: '#ffffff',
                weight: 1.5,
                fillOpacity: 0.85
            }).addTo(map);

            marker.bindPopup(
                `<strong>${n.name}</strong><br/>${city}, ${country}<br/>` +
                `<a href="resultPage.html?networkId=${n.id}&networkName=${encodeURIComponent(n.name)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}" ` +
                `style="color:#0057B8; font-weight:600;">View Stations</a>`
            );
                markers.push(marker);
        });

        if (fitBounds && markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }

    function searchNetworks() {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const statusEl = document.getElementById('searchStatus');
        const mapSubtitle = document.getElementById('mapSubtitle');

        if (!query) {
            statusEl.textContent = 'Please enter a city or country to search.';
            return;
        }

        statusEl.innerHTML = '<span class="spinner"></span>Searching...';

        const filtered = allNetworks.filter(n => {
            const city = (n.location?.city || '').toLowerCase();
            const country = (n.location?.country || '').toLowerCase();
            const name = (n.name || '').toLowerCase();
            return city.includes(query) || country.includes(query) || name.includes(query);
        });

        if (filtered.length === 0) {
            statusEl.textContent = `No networks found for "${query}". Try a different city or country.`;
            return;
        }

        statusEl.textContent = `${filtered.length} network(s) found for "${query}".`;
        mapSubtitle.textContent = ` — Results for "${query}"`;

        plotMarkers(filtered, true);
    }

    function clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchStatus').textContent = '';
        document.getElementById('mapSubtitle').textContent = ' — All worldwide networks';
        plotMarkers(allNetworks, false);
        map.setView([20, 0], 2);
    }

    // --- Search History ---

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveToHistory(name, city, country) {
        const history = getHistory();
        history.unshift({
            name,
            location: [city, country].filter(Boolean).join(', '),
            viewedAt: new Date().toISOString()
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
        renderHistoryTable();
    }

    function renderHistoryTable() {
        const wrapper = document.getElementById('historyTableWrapper');
        const history = getHistory();

        if (history.length === 0) {
            wrapper.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No search history yet. Click on a network above to record it here.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'history-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Network Name</th>
                    <th>Location</th>
                    <th>Viewed At</th>
                </tr>
            </thead>
            <tbody>
                ${history.map((entry, i) => `
                    <tr>
                        <td style="color:var(--text-muted);">${i + 1}</td>
                        <td style="font-weight:600;">${entry.name}</td>
                        <td>${entry.location}</td>
                        <td style="color:var(--text-muted);">${new Date(entry.viewedAt).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        wrapper.innerHTML = '';
        wrapper.appendChild(table);
    }

    function clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
        renderHistoryTable();
    }

    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') searchNetworks();
    });

window.onload = function() {
    loadAllNetworks();
    renderHistoryTable();
};
