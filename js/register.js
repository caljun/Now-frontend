document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const profilePhoto = document.getElementById('profilePhoto').value; // base64でもURLでもOK

  try {
    const res = await fetch('https://now-backend-wah5.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, profilePhoto })
    });

    const data = await res.json();

    if (res.ok) {
      // 登録後はログインAPIを自動実行
      const loginRes = await fetch('https://now-backend-wah5.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem('token', loginData.token);
        window.location.href = 'area-setup.html';
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
