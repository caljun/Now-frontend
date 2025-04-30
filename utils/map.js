// 関学構内の簡易ポリゴン範囲（精度調整OK）
const KWANSEI_POLYGON = [
  [34.7713160, 135.3463970], // 北西
  [34.7703541, 135.3501509], // 北東
  [34.7651447, 135.3473802], // 南東
  [34.7669979, 135.3433948]  // 南西
];

// 関学の中心点（4点の平均）
const KWANSEI_CENTER = {
  lat: (34.7713160 + 34.7703541 + 34.7651447 + 34.7669979) / 4,
  lng: (135.3463970 + 135.3501509 + 135.3473802 + 135.3433948) / 4
};

// 地図を初期化（スクロール制限つき）
function initMap() {
  const map = L.map('map', {
    maxBounds: [
      [34.7645, 135.3425],  // 南西
      [34.7720, 135.3510]   // 北東
    ],
    maxBoundsViscosity: 1.0
  }).setView([KWANSEI_CENTER.lat, KWANSEI_CENTER.lng], 17); // 常に関学の真ん中を初期表示

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
