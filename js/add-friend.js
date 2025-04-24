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
    const res = await fetch('https://now-backend-wah5.onrender.com/api/friends/add', {
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
