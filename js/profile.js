document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('ログインしてください');
    window.location.href = 'login.html';
    return;
  }

  let currentPhotoUrl = null;

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
      currentPhotoUrl = data.profilePhoto;
      document.getElementById('profilePhoto').src = data.profilePhoto;
      document.getElementById('modalProfilePhoto').src = data.profilePhoto;
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

    // エリア削除処理
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

    // 設定の読み込みと保存
    await loadSettings();

  } catch (err) {
    console.error(err);
    alert('プロフィール情報の取得に失敗しました');
  }

  // Cloudinaryアップロードウィジェットの設定
  const uploadWidget = cloudinary.createUploadWidget(
    {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: 'now_preset',
      sources: ['local', 'camera'],
      multiple: false,
      maxFiles: 1,
      cropping: true,
      croppingAspectRatio: 1,
      croppingShowDimensions: true,
      croppingValidateDimensions: true,
      styles: {
        palette: {
          window: "#1a1a1a",
          windowBorder: "#333333",
          tabIcon: "#FFFFFF",
          menuIcons: "#FFFFFF",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#FFFFFF",
          action: "#FF620C",
          inactiveTabIcon: "#999999",
          error: "#F44235",
          inProgress: "#0078FF",
          complete: "#20B832",
          sourceBg: "#1a1a1a"
        }
      }
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        currentPhotoUrl = result.info.secure_url;
        document.getElementById('profilePhoto').src = currentPhotoUrl;
        document.getElementById('modalProfilePhoto').src = currentPhotoUrl;
      }
    }
  );

  // 画像アップロードボタンのイベントリスナー
  document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
    uploadWidget.open();
  });

  // ログアウト処理
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = 'index.html';
  });

  // ✅ プロフィール更新処理
  document.getElementById('updateProfileBtn').addEventListener('click', async () => {
    const name = document.getElementById('nameInput').value;
    const updateData = {};

    if (name) updateData.name = name;
    if (currentPhotoUrl) updateData.profilePhoto = currentPhotoUrl;

    try {
      const updateRes = await fetch('https://now-backend-wah5.onrender.com/api/auth/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updateData)
      });

      const result = await updateRes.json();
      if (!updateRes.ok) throw new Error(result.error || '更新失敗');

      // 成功時の即時反映
      if (result.user.name) {
        document.getElementById('userName').textContent = result.user.name;
      }

      document.getElementById('editModal').classList.add('hidden');
      alert('プロフィールを更新しました');

    } catch (err) {
      console.error(err);
      alert('更新に失敗しました');
    }
  });
});

// モーダル開閉処理
document.getElementById('openModalBtn').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('hidden');
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  document.getElementById('editModal').classList.add('hidden');
});

// 設定の読み込みと保存
async function loadSettings() {
  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const settings = await res.json();
    
    // プライバシー設定の適用
    document.getElementById('locationSharing').checked = settings.privacy?.locationSharing ?? true;
    document.getElementById('profileVisibility').value = settings.privacy?.profileVisibility ?? 'friends';
    document.getElementById('onlineStatus').checked = settings.privacy?.onlineStatus ?? true;
    
    // 通知設定の適用
    document.getElementById('friendRequests').checked = settings.notifications?.friendRequests ?? true;
    document.getElementById('areaAlerts').checked = settings.notifications?.areaAlerts ?? true;
    document.getElementById('friendLocation').checked = settings.notifications?.friendLocation ?? true;
    
  } catch (err) {
    console.error('設定の読み込みに失敗:', err);
  }
}

// 設定の保存
async function saveSettings() {
  const settings = {
    privacy: {
      locationSharing: document.getElementById('locationSharing').checked,
      profileVisibility: document.getElementById('profileVisibility').value,
      onlineStatus: document.getElementById('onlineStatus').checked
    },
    notifications: {
      friendRequests: document.getElementById('friendRequests').checked,
      areaAlerts: document.getElementById('areaAlerts').checked,
      friendLocation: document.getElementById('friendLocation').checked
    }
  };

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!res.ok) throw new Error('設定の保存に失敗しました');
    
    alert('設定を保存しました');
    
  } catch (err) {
    console.error('設定の保存に失敗:', err);
    alert('設定の保存に失敗しました');
  }
}

// 設定変更の監視
document.querySelectorAll('.setting-item input, .setting-item select').forEach(element => {
  element.addEventListener('change', saveSettings);
});
