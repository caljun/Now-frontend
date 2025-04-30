// 関学構内の簡易ポリゴン範囲（精度調整OK）
const KWANSEI_POLYGON = [
  [34.7713160, 135.3463970], // 北西
  [34.7703541, 135.3501509], // 北東
  [34.7651447, 135.3473802], // 南東
  [34.7669979, 135.3433948]  // 南西
];

// 地図を初期化（スクロール制限つき）
function initMap(lat, lng) {
  const map = L.map('map', {
    maxBounds: [
      [34.7645, 135.3425],  // 南西
      [34.7720, 135.3510]   // 北東
    ],
    maxBoundsViscosity: 0.5,
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
