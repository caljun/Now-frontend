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

// ユーザーの Now ID から MongoDB の _id を取得
async function getUserIdByNowId(nowId) {
  try {
    const res = await fetch(`https://now-backend-wah5.onrender.com/api/auth/user-by-nowid/${nowId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ユーザー取得に失敗');
    return data.id;
  } catch (err) {
    throw new Error('ユーザー検索エラー: ' + err.message);
  }
}

// 友達リクエストを送る
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

// フレンド一覧取得
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

        li.append(name, id);
        friendList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

// リクエスト一覧表示
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
        btn.classList.add('btn');
        btn.onclick = () => acceptFriend(request.id);

        li.append(name, id, btn);
        requestList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

// エリア選択セレクトを構築
async function setupAreaSelect() {
  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/areas/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const areas = await res.json();
    const select = document.getElementById('areaSelect');
    select.innerHTML = '';

    areas.forEach(area => {
      const opt = document.createElement('option');
      opt.value = area._id;
      opt.textContent = area.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('エリア取得エラー:', err);
  }
}

// フォーム送信時の処理：申請 → 成功後にエリア追加
async function handleAddFriendSubmit(e) {
  e.preventDefault();

  const areaId = document.getElementById('areaSelect').value;
  const friendNowId = document.getElementById('friendNowId').value.trim();

  if (!friendNowId) return alert('Now IDを入力してください');

  try {
    const friendId = await getUserIdByNowId(friendNowId);
    await sendFriendRequest(friendId);

    alert('リクエストを送信しました。相手の承認後、エリアに自動追加されます。');

  } catch (err) {
    alert(err.message);
  }
}

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
    if (!res.ok) {
      return alert(data.error || '承認に失敗しました');
    }

    alert('友達リクエストを承認しました');
    loadFriends();
    loadFriendRequests();

  } catch (err) {
    console.error('通信エラー:', err);
    alert('通信エラーが発生しました');
  }
}

async function addFriendToAreaFromList(friendNowId) {
  const areaId = prompt("追加するエリアIDを入力してください"); // 後でselect化も可能
  if (!areaId) return;

  try {
    const res = await fetch(`https://now-backend-wah5.onrender.com/api/areas/${areaId}/add-friend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ friendNowId })
    });

    const data = await res.json();
    if (res.ok) {
      alert('エリアに追加しました');
    } else {
      alert(data.error || '追加に失敗しました');
    }
  } catch (err) {
    alert('通信エラー: ' + err.message);
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  setupAreaSelect();
  loadFriends();
  loadFriendRequests();

  document.getElementById('addFriendForm').addEventListener('submit', handleAddFriendSubmit);
});
