document.getElementById('addFriendForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('ログインしてください');
    window.location.href = 'login.html';
    return;
  }

  const friendId = document.getElementById('friendId').value;

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendId })
    });

    const data = await res.json();

    if (res.ok) {
      alert('友達を追加しました');
      document.getElementById('friendId').value = '';
    } else {
      alert(data.error || '友達の追加に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
});

// JWTからユーザーIDを取り出して表示する関数
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// トークン取得とID表示処理
const token = localStorage.getItem('token');
if (token) {
  const payload = parseJwt(token);
  const myId = payload?.id;
  if (myId) {
    document.getElementById('myId').textContent = `あなたの Now ID：${myId}`;
  }
}

// 友達一覧を取得して表示する関数
async function loadFriends() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      const friendList = document.getElementById('friendList');
      friendList.innerHTML = '';

      if (data.friends.length === 0) {
        friendList.innerHTML = '<li>まだ友達がいません</li>';
      } else {
        data.friends.forEach(friend => {
          const li = document.createElement('li'); 
          li.classList.add('friend-card');

          const nameElem = document.createElement('span');
          nameElem.textContent = friend.name;
          nameElem.style.fontWeight = 'bold';
          nameElem.style.fontSize = '16px';
          nameElem.style.marginBottom = '4px';

          const idElem = document.createElement('span');
          idElem.textContent = `ID: ${friend.id}`;
          idElem.style.fontSize = '12px';
          idElem.style.opacity = '0.8';

          li.appendChild(nameElem);
          li.appendChild(idElem);
          friendList.appendChild(li);
        });
      }
    } else {
      console.error('友達一覧取得失敗:', data.error);
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

async function loadFriendRequests() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/requests', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      const requestList = document.getElementById('requestList');
      requestList.innerHTML = '';

      if (data.requests.length === 0) {
        requestList.innerHTML = '<li>リクエストはありません</li>';
      } else {
        data.requests.forEach(request => {
          const li = document.createElement('li');
          li.classList.add('friend-card');

          const nameElem = document.createElement('div');
          nameElem.textContent = request.name;
          nameElem.style.fontWeight = 'bold';
          nameElem.style.marginBottom = '4px';

          const idElem = document.createElement('div');
          idElem.textContent = `ID: ${request.id}`;
          idElem.style.fontSize = '12px';
          idElem.style.opacity = '0.8';

          const acceptButton = document.createElement('button');
          acceptButton.textContent = '承認';
          acceptButton.classList.add('btn');
          acceptButton.onclick = () => acceptFriend(request.id); // ★次ここを作る！

          li.appendChild(nameElem);
          li.appendChild(idElem);
          li.appendChild(acceptButton);
          requestList.appendChild(li);
        });
      }
    } else {
      console.error('リクエスト一覧取得失敗:', data.error);
    }
  } catch (err) {
    console.error('通信エラー:', err);
  }
}

async function acceptFriend(friendId) {
  const token = localStorage.getItem('token');
  if (!token) return;

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
      alert(data.error || '友達リクエスト承認に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
}

// ページ読み込み時に友達一覧も表示
window.addEventListener('DOMContentLoaded', () => {
  loadFriends();
  loadFriendRequests();
});

