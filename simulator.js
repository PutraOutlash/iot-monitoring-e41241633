const URL = 'http://localhost:3000/api/readings';

// Mendukung simulasi beberapa perangkat (Bonus Multi-device)
const devices = ['GH-01', 'GH-02'];

setInterval(async () => {
    for (let device_id of devices) {
        const data = {
            device_id: device_id,
            suhu: +(25 + Math.random() * 12).toFixed(1), // 25-37 °C
            kelembapan: +(60 + Math.random() * 25).toFixed(1) // 60-85%
        };

        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            let result = {};
            if(response.ok) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.log(`[Error] Status: ${response.status} - ${text}`);
            }
            
            console.log(`[${new Date().toLocaleTimeString()}] ${device_id} Data terkirim:`, response.status, result.id ? 'Tersimpan' : 'Gagal');
        } catch (error) {
            console.error('Gagal mengirim data:', error.message);
        }
    }
}, 5000);