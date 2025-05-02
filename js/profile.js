document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (!token || !user) {
      alert('ログインしてください');
      window.location.href = 'login.html';
      return;
    }
  
    // ユーザー情報表示
    document.getElementById('userName').textContent = user.name || '名前未設定';
    document.getElementById('userId').textContent = user.nowId || 'ID未設定';
    if (user.profilePhoto) {
      document.getElementById('profilePhoto').src = user.profilePhoto;
    }
  
    // エリア一覧取得
    fetch('https://now-backend-wah5.onrender.com/api/areas/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(areas => {
        const list = document.getElementById('areaList');
        list.innerHTML = '';
  
        if (areas.length === 0) {
          list.innerHTML = '<li>参加しているエリアはありません</li>';
        } else {
          areas.forEach(area => {
            const item = document.createElement('li');
            item.textContent = area.name;
            list.appendChild(item);
          });
        }
      })
      .catch(err => {
        console.error('エリア一覧の取得に失敗', err);
        document.getElementById('areaList').innerHTML = '<li>取得失敗</li>';
      });
  
    // ログアウト処理
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = 'index.html';
    });
  });
  