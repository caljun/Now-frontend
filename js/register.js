document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const fileInput = document.getElementById('profilePhoto');
  const file = fileInput.files[0];

  if (!file) {
    return alert("プロフィール写真を選択してください");
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('profilePhoto', file);

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/auth/register', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      // 自動ログイン処理
      const loginRes = await fetch('https://now-backend-wah5.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify({
          id: loginData.user.id,
          name: loginData.user.name,
          email: loginData.user.email,
          profilePhoto: loginData.user.profilePhoto
        }));
        window.location.href = 'area.html';
      } else {
        alert('登録は成功しましたが、ログインに失敗しました');
      }
    } else {
      alert(data.error || '登録に失敗しました');
    }
  } catch (err) {
    console.error('通信エラー:', err);
    alert('サーバーとの通信に失敗しました');
  }
});
