const KWANSEI_POLYGON = [
  [34.7713160, 135.3463970], // 北西
  [34.7703541, 135.3501509], // 北東
  [34.7651447, 135.3473802], // 南東
  [34.7669979, 135.3433948]  // 南西
];

// ✅ 中央芝生付近を中心とした緯度経度（あなたの画像のピン）
const CENTER_LAT = 34.768462;  
const CENTER_LNG = 135.346724;

function initMap(lat = CENTER_LAT, lng = CENTER_LNG) {
  const map = L.map('map', {
    maxBounds: [
      [34.7640, 135.3420],  // 南西 - 少し広めに取って誤差をカバー
      [34.7725, 135.3510]   // 北東
    ],
    maxBoundsViscosity: 0.5
  }).setView([CENTER_LAT, CENTER_LNG], 17); // 📍常に中央芝生に初期フォーカス

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  return { map };
}

function isInsideKwanseiGakuin(lat, lng) {
  const [northLat, westLng] = KWANSEI_POLYGON[0];
  const [southLat, eastLng] = KWANSEI_POLYGON[2];
  return lat <= northLat && lat >= southLat && lng >= westLng && lng <= eastLng;
}

window.initMap = initMap;

