function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('token');
if (token) {
  const payload = parseJwt(token);
}

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
        name.classList.add('name');             // ✅
        
        const id = document.createElement('span');
        id.textContent = `ID: ${friend.id}`;
        id.classList.add('id');                 // ✅        

        li.append(name, id);
        friendList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

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
        name.classList.add('name');              // ✅
        
        const id = document.createElement('div');
        id.textContent = `ID: ${request.id}`;
        id.classList.add('id');                  // ✅        

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
    if (res.ok) {
      alert('友達リクエストを承認しました');
      loadFriends();
      loadFriendRequests();
    } else {
      alert(data.error || '承認に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('通信エラーが発生しました');
  }
}

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

async function addFriendToArea() {
  const areaId = document.getElementById('areaSelect').value;
  const friendNowId = document.getElementById('friendNowId').value.trim();

  if (!friendNowId) {
    return alert('Now IDを入力してください');
  }

  try {
    const res = await fetch(`https://now-backend-wah5.onrender.com/api/areas/${areaId}/add-friend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendNowId })
    });

    const data = await res.json();
    if (res.ok) {
      alert('友達を追加しました');
      location.reload();
    } else {
      alert(data.error || '追加に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupAreaSelect();
  loadFriends();
  loadFriendRequests();

  document.getElementById('addFriendForm').addEventListener('submit', e => {
    e.preventDefault();
    addFriendToArea();
  });
});