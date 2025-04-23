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
    const res = await fetch('https://now-backend.onrender.com/api/friends/add', {
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
