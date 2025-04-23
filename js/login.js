document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // 後でここをAPI連携に切り替える（例：POST /api/login）
    console.log("ログイン実行:", email, password);
  
    // 仮の処理（成功した体で）
    window.location.href = 'mypage.html';
  });
  