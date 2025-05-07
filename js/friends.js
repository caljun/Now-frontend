function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('token');
if (token) parseJwt(token);

// Now IDから_userIdを取得
async function getUserIdByNowId(nowId) {
  const res = await fetch(`https://now-backend-wah5.onrender.com/api/auth/user-by-nowid/${nowId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'ユーザー取得に失敗');
  return data.id;
}

// フレンド申請送信
async function sendFriendRequest(friendId) {
  const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ friendId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'リクエスト送信失敗');
}

// ✅ フォーム送信処理（areaId削除済）
async function handleAddFriendSubmit(e) {
  e.preventDefault();
  const friendNowId = document.getElementById('friendNowId').value.trim();
  if (!friendNowId) return alert('Now IDを入力してください');

  try {
    const friendId = await getUserIdByNowId(friendNowId);
    await sendFriendRequest(friendId);
    alert('友達申請が送られました');
  } catch (err) {
    alert(err.message);
  }
}

// 承認処理
async function acceptFriend(friendId) {
  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendId })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || '承認に失敗しました');
    alert('友達リクエストを承認しました');
    loadFriends();
    loadFriendRequests();
  } catch (err) {
    alert('通信エラーが発生しました');
  }
}

// ✅ 友達一覧に＋エリア追加ボタン
async function loadFriends() {
  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const friendList = document.getElementById('friendList');
    friendList.innerHTML = '';

    if (!res.ok) return console.error('友達一覧取得失敗:', data.error);

    if (data.friends.length === 0) {
      friendList.innerHTML = '<li>まだ友達がいません</li>';
    } else {
      data.friends.forEach(friend => {
        const li = document.createElement('li');
        li.classList.add('friend-card');

        const name = document.createElement('span');
        name.textContent = friend.name;
        name.classList.add('name');

        const id = document.createElement('span');
        id.textContent = `ID: ${friend.id}`;
        id.classList.add('id');

        const addBtn = document.createElement('button');
        addBtn.textContent = '＋エリア追加';
        addBtn.onclick = () => addFriendToAreaFromList(friend.id);

        li.append(name, id, addBtn);
        friendList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

// リクエスト表示
async function loadFriendRequests() {
  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const requestList = document.getElementById('requestList');
    requestList.innerHTML = '';

    if (!res.ok) return console.error('リクエスト取得失敗:', data.error);

    if (data.requests.length === 0) {
      requestList.innerHTML = '<li>リクエストはありません</li>';
    } else {
      data.requests.forEach(request => {
        const li = document.createElement('li');
        li.classList.add('friend-card');

        const name = document.createElement('div');
        name.textContent = request.name;
        name.classList.add('name');

        const id = document.createElement('div');
        id.textContent = `ID: ${request.id}`;
        id.classList.add('id');

        const btn = document.createElement('button');
        btn.textContent = '承認';
        btn.onclick = () => acceptFriend(request.id);

        li.append(name, id, btn);
        requestList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

let selectedFriendNowId = null; // モーダル経由で friendNowId を保持

async function addFriendToAreaFromList(friendNowId) {
  selectedFriendNowId = friendNowId;

  // モーダル表示
  const modal = document.getElementById('areaSelectModal');
  const dropdown = document.getElementById('areaDropdown');
  modal.classList.remove('hidden');
  dropdown.innerHTML = '<option disabled selected>エリアを選択してください</option>';

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/areas/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const areas = await res.json();

    areas.forEach(area => {
      const opt = document.createElement('option');
      opt.value = area._id;
      opt.textContent = area.name;
      dropdown.appendChild(opt);
    });
  } catch (err) {
    alert('エリア一覧の取得に失敗しました');
  }
}

// ✅ 初期化（setupAreaSelectは削除）
document.addEventListener('DOMContentLoaded', () => {
  loadFriends();
  loadFriendRequests();
  document.getElementById('addFriendForm').addEventListener('submit', handleAddFriendSubmit);

  // ✅ 「追加」ボタン処理
  document.getElementById('confirmAreaAddBtn').addEventListener('click', async () => {
    const selectedAreaId = document.getElementById('areaDropdown').value;
    if (!selectedAreaId || !selectedFriendNowId) return alert('エリアを選択してください');

    try {
      const res = await fetch(`https://now-backend-wah5.onrender.com/api/areas/${selectedAreaId}/add-friend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendNowId: selectedFriendNowId })
      });

      const data = await res.json();
      if (res.ok) {
        alert('エリアに追加しました');
        document.getElementById('areaSelectModal').classList.add('hidden');
        selectedFriendNowId = null;
      } else {
        alert(data.error || '追加に失敗しました');
      }
    } catch (err) {
      alert('通信エラー: ' + err.message);
    }
  });

  // ✅ 「キャンセル」ボタン処理
  document.getElementById('cancelAreaAddBtn').addEventListener('click', () => {
    document.getElementById('areaSelectModal').classList.add('hidden');
    selectedFriendNowId = null;
  });
});

