document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('ログインしてください');
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const res = await fetch('https://now-backend-wah5.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '取得失敗');
      }
  
      // プロフィール表示
      document.getElementById('userName').textContent = data.name || '名前未設定';
      document.getElementById('userId').textContent = data.nowId || 'ID未設定';
      if (data.profilePhoto) {
        document.getElementById('profilePhoto').src = data.profilePhoto;
      }
  
      // エリア一覧表示
      const list = document.getElementById('areaList');
      list.innerHTML = '';
      if (data.areas.length === 0) {
        list.innerHTML = '<li>参加しているエリアはありません</li>';
      } else {
        data.areas.forEach(area => {
          const item = document.createElement('li');
          item.textContent = `${area.name}（${area.count}人）`;
          list.appendChild(item);
        });
      }
  
    } catch (err) {
      console.error(err);
      alert('プロフィール情報の取得に失敗しました');
    }
  
    // ログアウト
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = 'index.html';
    });
  });
  