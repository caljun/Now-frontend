// ✅ Mapbox版 area.js（現在地を初期位置に）

const token = localStorage.getItem('token');

if (!token) {
  alert('ログインしてください');
  window.location.href = 'login.html';
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsanVuIiwiYSI6ImNtYW83bHUzOTAxaWcybnB0MTlvaWY3NjcifQ.JwYLaH_HlbrjhgBeJxhLOw'; // ← あなたのトークンを使用

let map;
let drawnPolygon = null;

function initMapbox() {
  const fallback = [139.767125, 35.681236]; // 東京駅

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      startMap([longitude, latitude]);
    },
    () => {
      startMap(fallback);
    }
  );
}

function startMap(center) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center,
    zoom: 15
  });

  map.on('click', onMapClick);
}

let currentCoords = [];

function onMapClick(e) {
  const lngLat = e.lngLat;
  currentCoords.push([lngLat.lng, lngLat.lat]);

  drawPolygon();
}

function drawPolygon() {
  // 既存ポリゴン削除
  if (map.getSource('area')) {
    map.removeLayer('area');
    map.removeSource('area');
  }

  if (currentCoords.length < 3) return;

  const polygon = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[...currentCoords, currentCoords[0]]]
    }
  };

  map.addSource('area', {
    type: 'geojson',
    data: polygon
  });

  map.addLayer({
    id: 'area',
    type: 'fill',
    source: 'area',
    layout: {},
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.5
    }
  });
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const name = document.getElementById('areaName').value.trim();
  if (!name) return alert('エリア名を入力してください');
  if (currentCoords.length < 3) return alert('3点以上を指定してください');

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/areas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        coordinates: currentCoords
      })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || '作成に失敗しました');

    alert('エリアを作成しました');
    location.href = 'home.html';
  } catch (err) {
    alert('通信エラー: ' + err.message);
  }
});

// 初期化
initMapbox();