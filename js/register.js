document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const fileInput = document.getElementById('profilePhoto');
  const file = fileInput.files[0];

  if (!file) {
    return alert("プロフィール写真を選択してください");
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const profilePhoto = reader.result; // base64文字列

    try {
      const res = await fetch('https://now-backend-wah5.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, profilePhoto })
      });

      const data = await res.json();

      if (res.ok) {
        const loginRes = await fetch('https://now-backend-wah5.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.token);
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
  };

  reader.readAsDataURL(file); // 🔥 base64へ変換して読み込む
});
