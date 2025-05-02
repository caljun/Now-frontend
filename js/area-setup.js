document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([34.7685, 135.3467], 17); // 関学中央芝生
    const pins = [];
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  
    map.on('click', (e) => {
      const marker = L.marker(e.latlng).addTo(map);
      pins.push(e.latlng);
  
      // ★あとでエリア可視化したいなら以下を有効化
      // if (pins.length >= 3) {
      //   if (window.polygon) map.removeLayer(window.polygon);
      //   window.polygon = L.polygon(pins, { color: 'blue' }).addTo(map);
      // }
    });
  
    document.getElementById('areaForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const name = document.getElementById('areaName').value.trim();
      const token = localStorage.getItem('token');
  
      if (!token) {
        alert('ログイン情報がありません。再ログインしてください。');
        return;
      }
  
      if (pins.length < 3) {
        alert('3点以上のピンを追加してください');
        return;
      }
  
      if (!name) {
        alert('エリア名を入力してください');
        return;
      }
  
      try {
        const res = await fetch('https://now-backend-wah5.onrender.com/api/areas/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            coords: pins.map(p => ({ lat: p.lat, lng: p.lng }))
          })
        });
  
        const data = await res.json();
  
        if (res.ok) {
          alert('エリアを作成しました');
          window.location.href = 'mypage.html';
        } else {
          alert(data.error || 'エリア作成に失敗しました');
        }
  
      } catch (err) {
        console.error(err);
        alert('サーバーとの通信に失敗しました');
      }
    });
  });
  