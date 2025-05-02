function initMap(lat = null, lng = null) {
  const defaultLat = 34.768462;
  const defaultLng = 135.346724;

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
        map.setView([defaultLat, defaultLng], 17); // 現在地取得に失敗した場合のフォールバック
      }
    );
  } else {
    map.setView([defaultLat, defaultLng], 17); // geolocation 非対応端末
  }

  return { map };
}

