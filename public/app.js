const socket = io();
let threshold = 35.0;
let lastDataTime = 0;
let chart;
let currentDevice = '';

const tempCard = document.getElementById('tempCard');
const tempValue = document.getElementById('tempValue');
const tempTime = document.getElementById('tempTime');
const humValue = document.getElementById('humValue');
const humTime = document.getElementById('humTime');
const statusIndicator = document.getElementById('statusIndicator');
const deviceSelect = document.getElementById('deviceSelect');
const tableBody = document.querySelector('#historyTable tbody');

// Inisialisasi Chart.js
const ctx = document.getElementById('myChart').getContext('2d');
chart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [
        { label: 'Suhu (°C)', borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', data: [], tension: 0.3, fill: true },
        { label: 'Kelembapan (%)', borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)', data: [], tension: 0.3, fill: true }
    ]},
    options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: false } }
    }
});

async function fetchData() {
    try {
        const devQuery = currentDevice ? `?device_id=${currentDevice}` : '';
        const [latestRes, historyRes, settingsRes, devicesRes] = await Promise.all([
            fetch(`/api/readings/latest${devQuery}`),
            fetch(`/api/readings${devQuery}?limit=20`),
            fetch('/api/settings'),
            fetch('/api/devices')
        ]);
        
        const latest = await latestRes.json();
        const history = await historyRes.json();
        const settings = await settingsRes.json();
        const devices = await devicesRes.json();

        threshold = settings.threshold_suhu;
        document.getElementById('thresholdInput').value = threshold;

        updateDevicesDropdown(devices);
        if (latest && latest.id) {
            updateDashboard(latest, history.reverse());
        }
    } catch (err) {
        console.error("Gagal memuat data dari API", err);
    }
}

function updateDevicesDropdown(devices) {
    const prev = deviceSelect.value;
    deviceSelect.innerHTML = '<option value="">Semua Perangkat</option>';
    devices.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = d;
        deviceSelect.appendChild(opt);
    });
    deviceSelect.value = prev;
}

function updateDashboard(latest, history) {
    lastDataTime = new Date(latest.created_at).getTime();
    
    tempValue.innerText = latest.suhu.toFixed(1) + ' °C';
    tempTime.innerText = new Date(latest.created_at).toLocaleString('id-ID');
    humValue.innerText = latest.kelembapan.toFixed(1) + ' %';
    humTime.innerText = new Date(latest.created_at).toLocaleString('id-ID');

    // Logika warna status Panas / Normal
    if (latest.suhu > threshold) {
        tempCard.style.backgroundColor = '#ffcccc'; // Merah
        tempCard.style.color = '#c0392b';
    } else {
        tempCard.style.backgroundColor = '#ccffcc'; // Hijau
        tempCard.style.color = '#27ae60';
    }

    // Update Data Grafik
    chart.data.labels = history.map(h => new Date(h.created_at).toLocaleTimeString('id-ID'));
    chart.data.datasets[0].data = history.map(h => h.suhu);
    chart.data.datasets[1].data = history.map(h => h.kelembapan);
    chart.update();

    // Update Tabel Riwayat (10 Data Terakhir)
    tableBody.innerHTML = '';
    const tableData = [...history].reverse().slice(0, 10);
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${new Date(row.created_at).toLocaleString('id-ID')}</td>
                        <td>${row.device_id}</td>
                        <td>${row.suhu}</td>
                        <td>${row.kelembapan}</td>`;
        tableBody.appendChild(tr);
    });
}

// Filter Perangkat
deviceSelect.addEventListener('change', (e) => {
    currentDevice = e.target.value;
    fetchData();
});

// Simpan Threshold ke DB
document.getElementById('saveThreshold').addEventListener('click', async () => {
    const val = parseFloat(document.getElementById('thresholdInput').value);
    await fetch('/api/settings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({threshold_suhu: val})
    });
    alert('Ambang batas suhu berhasil diperbarui!');
});

// Ekspor ke CSV
document.getElementById('exportCsv').addEventListener('click', () => {
    const devQuery = currentDevice ? `?device_id=${currentDevice}` : '';
    window.location.href = `/api/export${devQuery}`;
});

// WebSocket Listeners: Menerima data baru secara real-time
socket.on('newData', (data) => {
    if (!currentDevice || data.device_id === currentDevice) {
        fetchData();
    }
});

socket.on('settingsUpdated', (data) => {
    threshold = data.threshold_suhu;
    document.getElementById('thresholdInput').value = threshold;
    fetchData();
});

// Cek Status Perangkat setiap 1 detik
setInterval(() => {
    const now = new Date().getTime();
    if (now - lastDataTime < 30000) {
        statusIndicator.textContent = 'Status: Online';
        statusIndicator.className = 'status-online';
    } else {
        statusIndicator.textContent = 'Status: Offline';
        statusIndicator.className = 'status-offline';
    }
}, 1000);

// Initial fetch saat halaman dimuat
fetchData();