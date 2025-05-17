// ✅ Mapbox版 area.js（現在地を初期位置に）

const token = localStorage.getItem('token');

if (!token) {
  alert('ログインしてください');
  window.location.href = 'login.html';
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsanVuIiwiYSI6ImNtYW83bHUzOTAxaWcybnB0MTlvaWY3NjcifQ.JwYLaH_HlbrjhgBeJxhLOw'; // ← あなたのトークンを使用

let map;
let drawnPolygon = null;
let markers = []; // マーカーを保持する配列

function initMapbox() {
  const fallback = [139.767125, 35.681236]; // 東京駅

  console.log('Initializing Mapbox...'); // デバッグログ

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('Got position:', position);
      const { latitude, longitude } = position.coords;
      startMap([longitude, latitude]);
    },
    (error) => {
      console.error('Geolocation error:', error);
      startMap(fallback);
    }
  );
}

function startMap(center) {
  console.log('Starting map with center:', center);
  
  try {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center,
      zoom: 15
    });

    map.on('click', onMapClick);

    // 右クリックで最後のポイントを削除
    map.getCanvas().addEventListener('contextmenu', (e) => {
      e.preventDefault();
      removeLastPoint();
    });

    map.on('load', () => {
      console.log('Map loaded successfully');
      map.resize();
    });

    map.on('error', (e) => {
      console.error('Mapbox error:', e);
    });
  } catch (error) {
    console.error('Error creating map:', error);
  }
}

let currentCoords = [];

function onMapClick(e) {
  const lngLat = e.lngLat;
  currentCoords.push([lngLat.lng, lngLat.lat]);

  // マーカーを追加
  const marker = new mapboxgl.Marker({
    color: '#FF0000',
    scale: 0.8
  })
    .setLngLat(lngLat)
    .setPopup(new mapboxgl.Popup().setText(`ポイント ${currentCoords.length}`))
    .addTo(map);

  markers.push(marker);
  
  drawPolygon();
}

function removeLastPoint() {
  if (currentCoords.length > 0) {
    currentCoords.pop();
    if (markers.length > 0) {
      markers[markers.length - 1].remove();
      markers.pop();
    }
    drawPolygon();
  }
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

  // ポリゴンの塗りつぶし
  map.addLayer({
    id: 'area',
    type: 'fill',
    source: 'area',
    layout: {},
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.3
    }
  });

  // ポリゴンの境界線
  map.addLayer({
    id: 'area-border',
    type: 'line',
    source: 'area',
    layout: {},
    paint: {
      'line-color': '#088',
      'line-width': 2
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
document.addEventListener('DOMContentLoaded', () => {
  initMapbox();
});
