window.addEventListener('DOMContentLoaded', () => {
  if (!navigator.geolocation) {
    alert("位置情報が取得できません。");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const map = L.map('map').setView([lat, lng], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup("あなたの現在地").openPopup();

    // TODO: 自分の現在位置をサーバーに送信する処理（POST /location）

  }, () => {
    alert("位置情報の取得に失敗しました。");
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  // TODO: トークン削除・ログアウト処理
  window.location.href = 'index.html';
});
