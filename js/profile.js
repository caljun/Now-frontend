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
      if (!res.ok) throw new Error(data.error || '取得失敗');
  
      // プロフィール表示
      document.getElementById('userName').textContent = data.name || '名前未設定';
      document.getElementById('userId').textContent = data.nowId || 'ID未設定';
      if (data.profilePhoto) {
        document.getElementById('profilePhoto').src = data.profilePhoto;
      }
  
      // エリア一覧表示
      const list = document.getElementById('areaList');
      list.innerHTML = '';
      if (!data.areas || data.areas.length === 0) {
        list.innerHTML = '<li>参加しているエリアはありません</li>';
      } else {
        data.areas.forEach(area => {
          const item = document.createElement('li');
          item.className = 'area-card';
          item.innerHTML = `
            <h3>${area.name}</h3>
            <p>${area.count}人</p>
            <button class="btn delete-area-btn" data-id="${area._id}">削除</button>
          `;
          list.appendChild(item);
        });
      }
  
      // エリア削除ボタンにイベント追加
      document.querySelectorAll('.delete-area-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const areaId = btn.dataset.id;
          if (confirm('このエリアを削除しますか？')) {
            try {
              const delRes = await fetch(`https://now-backend-wah5.onrender.com/api/areas/${areaId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (!delRes.ok) throw new Error('削除失敗');
              btn.closest('li').remove();
            } catch (err) {
              alert('削除に失敗しました');
            }
          }
        });
      });
  
    } catch (err) {
      console.error(err);
      alert('プロフィール情報の取得に失敗しました');
    }
  
    // ログアウト処理
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = 'index.html';
    });
  
    // プロフィール更新処理
    document.getElementById('updateProfileBtn').addEventListener('click', async () => {
      const name = document.getElementById('nameInput').value;
      const photoInput = document.getElementById('photoInput').files[0];
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (photoInput) formData.append('profilePhoto', photoInput);
  
      try {
        const updateRes = await fetch('https://now-backend-wah5.onrender.com/api/auth/update', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!updateRes.ok) throw new Error('更新失敗');
        alert('プロフィールを更新しました');
        location.reload();
      } catch (err) {
        alert('更新に失敗しました');
      }
    });
  });
  