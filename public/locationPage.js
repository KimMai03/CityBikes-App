const map = L.map('worldMap').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    let allNetworks = [];
    let markers = [];

    async function loadAllNetworks() {
        try {
            const res = await fetch('https://api.citybik.es/v2/networks');
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
        const resultsEl = document.getElementById('resultsPanel');
        const countEl = document.getElementById('resultCount');
        const clearBtn = document.getElementById('clearBtn');
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
            resultsEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No results. Try searching a broader term like a country name.</p>`;
            countEl.textContent = '';
            clearBtn.style.display = 'inline';
            return;
        }

        statusEl.textContent = '';
        countEl.textContent = `(${filtered.length} found)`;
        mapSubtitle.textContent = ` — Results for "${query}"`;
        clearBtn.style.display = 'inline';

        plotMarkers(filtered, true);
        renderResultsList(filtered);
    }

    function renderResultsList(networks) {
        const resultsEl = document.getElementById('resultsPanel');
        resultsEl.innerHTML = '';

        const list = document.createElement('div');
        list.className = 'network-list';

        networks.forEach(n => {
            const city = n.location?.city || 'Unknown City';
            const country = n.location?.country || '??';
            const company = (n.company || []).join(', ') || 'Unknown Operator';

            const item = document.createElement('a');
            item.className = 'network-item';
            item.href = `resultPage.html?networkId=${n.id}&networkName=${encodeURIComponent(n.name)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
            item.innerHTML = `
                <div class="network-item-left">
                    <h4>${n.name}</h4>
                    <p>${city}, ${country} &bull; ${company}</p>
                </div>
                <span class="network-item-arrow">&#8594;</span>
            `;
            list.appendChild(item);
        });

        resultsEl.appendChild(list);
    }

    function clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchStatus').textContent = '';
        document.getElementById('resultCount').textContent = '';
        document.getElementById('mapSubtitle').textContent = ' — All worldwide networks';
        document.getElementById('clearBtn').style.display = 'none';
        document.getElementById('resultsPanel').innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Search for a city or country above to see matching bike networks here.</p>';
        plotMarkers(allNetworks, false);
        map.setView([20, 0], 2);
    }

    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') searchNetworks();
    });

window.onload = loadAllNetworks();
