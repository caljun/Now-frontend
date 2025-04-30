// 関学構内の簡易ポリゴン範囲（精度調整OK）
const KWANSEI_POLYGON = [
  [34.7705, 135.3432],
  [34.7705, 135.3480],
  [34.7650, 135.3480],
  [34.7650, 135.3432]
];

// 地図を初期化（スクロール制限つき）
function initMap(lat, lng) {
  const map = L.map('map', {
    maxBounds: [
      [34.7635, 135.3410],
      [34.7725, 135.3505]
    ],
    maxBoundsViscosity: 1.0
  }).setView([lat, lng], 17); // ここlat,lng維持でOK。動くマーカーが後から使う

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  return { map };
}

// 関学構内にいるかどうか
function isInsideKwanseiGakuin(lat, lng) {
  const [northLat, westLng] = KWANSEI_POLYGON[0];
  const [southLat, eastLng] = KWANSEI_POLYGON[2];
  return lat <= northLat && lat >= southLat && lng >= westLng && lng <= eastLng;
}

window.initMap = initMap;
