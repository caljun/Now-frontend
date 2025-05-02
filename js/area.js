document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('ログイン情報が無効です。再ログインしてください。');
      window.location.href = 'login.html';
      return;
    }
  
    const pins = [];
  
    const map = L.map('map', {
      maxBoundsViscosity: 0.5
    });
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  
    // 現在地を中心に表示（取得できなければ東京駅）
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 17);
        },
        () => {
          map.setView([35.681236, 139.767125], 17); // fallback: 東京駅
        }
      );
    } else {
      map.setView([35.681236, 139.767125], 17);
    }
  
    map.on('click', (e) => {
      const marker = L.marker(e.latlng).addTo(map);
      pins.push(e.latlng);
  
      if (pins.length >= 3) {
        if (window.polygon) map.removeLayer(window.polygon);
        window.polygon = L.polygon(pins, {
          color: 'blue',
          fillColor: '#3388ff',
          fillOpacity: 0.4
        }).addTo(map);
      }
    });
  
    document.getElementById('areaForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const name = document.getElementById('areaName').value.trim();
  
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
          console.error('エリア作成失敗:', res.status, data);
          alert(data.error || 'エリア作成に失敗しました');
        }
  
      } catch (err) {
        console.error('通信エラー:', err);
        alert('サーバーとの通信に失敗しました');
      }
    });
  });
  