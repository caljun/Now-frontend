const token = localStorage.getItem('token');

if (!token) {
  alert('ログインしてください');
  window.location.href = 'login.html';
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
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

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

      console.log('位置情報送信成功:', data);

      const { map } = initMap(34.768462, 135.346724);
      window.map = map;
      startWatchingLocation();

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
    console.error(error);
    alert('位置情報の取得に失敗しました');
  });
}

function startWatchingLocation() {
  navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      await fetch('https://now-backend-wah5.onrender.com/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude })
      });

      if (!window.myMarker) {
        window.myMarker = L.marker([latitude, longitude])
          .addTo(window.map)
          .bindPopup("あなたの現在地");
      } else {
        window.myMarker.setLatLng([latitude, longitude]);
      }
    },
    (err) => {
      console.error('位置情報の取得に失敗しました', err);
      const messages = {
        1: '位置情報の使用が拒否されています。「設定 > アプリ > Safari > 位置情報」で「確認」または「許可」に変更してください。',
        2: '位置情報が取得できません。通信状況を確認してください。',
        default: '未知の理由で位置情報の取得に失敗しました。'
      };
      alert(messages[err.code] || messages.default);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  );
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
      await fetchAreaFriends(areaId); // ← リロード不要！
    });

  } catch (err) {
    console.error('エリア一覧の取得に失敗', err);
    select.innerHTML = '<option>読み込み失敗</option>';
  }
}

async function fetchAreaFriends(areaId) {
  try {
    const res = await fetch(`https://now-backend-wah5.onrender.com/api/areas/${areaId}/friends-in`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const friends = await res.json();
    const list = document.getElementById('friendList');
    if (list) list.innerHTML = '';

    if (!res.ok) {
      console.error('エリア内の友達取得失敗:', friends.error);
      return;
    }

    friends.forEach(friend => {
      const loc = friend.location;
      if (loc?.latitude && loc?.longitude) {
        L.marker([loc.latitude, loc.longitude])
          .addTo(window.map)
          .bindPopup(`${friend.name}（${friend.email}）`);

        if (list) {
          const item = document.createElement('div');
          item.className = 'friend-card';
          item.innerHTML = `
            <p><strong>${friend.name}</strong></p>
            <p>${friend.email}</p>
            <img src="${friend.profilePhoto}" alt="プロフィール画像" width="100" />
          `;
          list.appendChild(item);
        }
      }
    });
  } catch (err) {
    console.error('通信エラー:', err);
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
