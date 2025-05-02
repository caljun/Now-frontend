window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('ログインしてください');
    window.location.href = 'login.html';
    return;
  }

  // 現在地取得
  if ('geolocation' in navigator) {
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

        if (res.ok) {
          console.log('位置情報送信成功:', data);
          const { map } = initMap(34.768462, 135.346724);
          window.map = map;
          startWatchingLocation(token);
          fetchFriendsInCampus();
          setInterval(fetchFriendsInCampus, 10000);

          // 構内なら表示など（必要に応じてここでマップ操作）
        } else {
          console.error('送信失敗:', data);
          alert(data.error || '位置情報送信に失敗しました');
        }
      } catch (err) {
        console.error('通信エラー:', err);
        alert('サーバーとの通信に失敗しました');
      }
    }, (error) => {
      alert('位置情報の取得に失敗しました');
      console.error(error);
    });
  } else {
    alert('このブラウザでは位置情報が使えません');
  }
});

async function fetchFriendsInCampus() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/in-campus', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      // リスト表示（任意）
      const list = document.getElementById('friendList');
      if (list) {
        list.innerHTML = '';
      }

      data.forEach(friend => {
        if (friend.latitude && friend.longitude) {
          if (isInsideKwanseiGakuin(friend.latitude, friend.longitude)) {
            // 学内の友達だけマーカー追加
            L.marker([friend.latitude, friend.longitude])
              .addTo(window.map)
              .bindPopup(`${friend.name}（構内）`);
      
            // 学内の友達だけリスト追加
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
          // 学外の友達は完全に無視する
        }
      });
      

    } else {
      console.error('取得失敗:', data);
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

// ✅ ログアウト処理を追加
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.replace('index.html');
    });
  }
});


function startWatchingLocation(token) {
  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
  
      await fetch('https://now-backend-wah5.onrender.com/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude })
      });
  
      if (!window.myMarker) {
        window.myMarker = L.marker([latitude, longitude]).addTo(window.map).bindPopup("あなたの現在地");
      } else {
        window.myMarker.setLatLng([latitude, longitude]);
      }
    },
    (err) => {
      console.error('位置情報の取得に失敗しました', err);
  
      if (err.code === 1) {
        alert('位置情報の使用が拒否されています。「設定 > アプリ > Safari > 位置情報」で「確認」または「許可」に変更してください。');
      } else if (err.code === 2) {
        alert('位置情報が取得できません。通信状況を確認してください。');
      } else {
        alert('未知の理由で位置情報の取得に失敗しました。');
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  );
}

async function loadAreaList() {
  const token = localStorage.getItem('token');
  const select = document.getElementById('areaSelect');

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/areas/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const areas = await res.json();
    select.innerHTML = '';

    areas.forEach(area => {
      const option = document.createElement('option');
      option.value = area._id;
      option.textContent = area.name;
      select.appendChild(option);
    });

    // 最初に選択されたエリアを保存
    select.addEventListener('change', () => {
      localStorage.setItem('selectedAreaId', select.value);
      location.reload(); // 必要なら画面を再読み込み
    });

    // 前回選んだエリアがあれば復元
    const saved = localStorage.getItem('selectedAreaId');
    if (saved) select.value = saved;

  } catch (err) {
    console.error('エリア一覧の取得に失敗', err);
    select.innerHTML = '<option>読み込み失敗</option>';
  }
}

document.addEventListener('DOMContentLoaded', loadAreaList);

