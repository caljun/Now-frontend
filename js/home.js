const token = localStorage.getItem('token');

if (!token) {
  alert('ログインしてください');
  window.location.href = 'login.html';
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsanVuIiwiYSI6ImNtYW83bHUzOTAxaWcybnB0MTlvaWY3NjcifQ.JwYLaH_HlbrjhgBeJxhLOw'; // ← ご自身のトークンをここに入れてください

let map;

// 初期化と現在地取得
async function initMapbox(lat, lng) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lng, lat],
    zoom: 16
  });

  // 現在地ピン
  new mapboxgl.Marker({ color: 'blue' })
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup().setText('あなたの現在地'))
    .addTo(map);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadAreaList();
  await sendCurrentLocation();
  setupLogout();
});

async function sendCurrentLocation() {
  if (!navigator.geolocation) {
    alert('このブラウザでは位置情報が使えません');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const res = await fetch('https://now-backend-wah5.onrender.com/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '位置情報送信に失敗しました');
        return;
      }

      await initMapbox(latitude, longitude);
      const selectedAreaId = localStorage.getItem('selectedAreaId');
      if (selectedAreaId) {
        await fetchAreaFriends(selectedAreaId);
        setInterval(() => fetchAreaFriends(selectedAreaId), 10000);
      }

    } catch (err) {
      console.error('通信エラー:', err);
      alert('サーバーとの通信に失敗しました');
    }
  }, (error) => {
    console.error('位置情報の取得に失敗しました', error);
    alert('位置情報の取得に失敗しました');
  });
}

async function fetchAreaFriends(areaId) {
  try {
    const res = await fetch(`https://now-backend-wah5.onrender.com/api/areas/${areaId}/friends-in`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('エリア内の友達取得失敗:', data.error);
      return;
    }

    const friends = data.friends;

    friends.forEach(friend => {
      if (friend.latitude && friend.longitude) {
        new mapboxgl.Marker()
          .setLngLat([friend.longitude, friend.latitude])
          .setPopup(new mapboxgl.Popup().setText(friend.name))
          .addTo(map);
      }
    });
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

async function loadAreaList() {
  const select = document.getElementById('areaSelect');
  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/areas/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const areas = await res.json();
    select.innerHTML = '';

    areas.forEach(area => {
      const option = document.createElement('option');
      option.value = area._id;
      option.textContent = area.name;
      select.appendChild(option);
    });

    const saved = localStorage.getItem('selectedAreaId');
    if (saved) select.value = saved;

    select.addEventListener('change', async () => {
      const areaId = select.value;
      localStorage.setItem('selectedAreaId', areaId);
      await fetchAreaFriends(areaId);
    });

  } catch (err) {
    console.error('エリア一覧の取得に失敗', err);
    select.innerHTML = '<option>読み込み失敗</option>';
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = 'index.html';
    });
  }
}

