// 関学構内の簡易ポリゴン範囲（西宮上ケ原キャンパスの例：精度調整可）
const KWANSEI_POLYGON = [
  [34.7705, 135.3432], // 北西（正門前）
  [34.7705, 135.3480], // 北東（図書館側）
  [34.7650, 135.3480], // 南東（グラウンド側）
  [34.7650, 135.3432]  // 南西（附属中学側）
];
  
  // Leaflet 地図を初期化し、マップオブジェクトを返す
  function initMap(lat, lng) {
    const map = L.map('map').setView([lat, lng], 17);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  
    const marker = L.marker([lat, lng]).addTo(map)
      .bindPopup('あなたの現在地')
      .openPopup();
  
    return { map, marker };
  }
  
  // 関学構内にいるかの判定（四角形内）
  function isInsideKwanseiGakuin(lat, lng) {
    const [northLat, westLng] = KWANSEI_POLYGON[0];
    const [southLat, eastLng] = KWANSEI_POLYGON[2];
  
    return lat <= northLat && lat >= southLat && lng >= westLng && lng <= eastLng;
  }

  window.initMap = initMap;