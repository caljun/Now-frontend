function initMap(lat = null, lng = null) {
  // 🧭 fallback座標を東京駅に変更
  const defaultLat = 35.681236;
  const defaultLng = 139.767125;

  const map = L.map('map', {
    maxBoundsViscosity: 0.5
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  if (lat && lng) {
    map.setView([lat, lng], 17);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 17);
      },
      () => {
        map.setView([defaultLat, defaultLng], 17); // ✅ 現在地取得失敗時
      }
    );
  } else {
    map.setView([defaultLat, defaultLng], 17); // ✅ geolocation 非対応時
  }

  return { map };
}
