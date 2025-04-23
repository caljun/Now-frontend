document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profilePhoto = document.getElementById('profilePhoto').files[0];
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('profilePhoto', profilePhoto);
  
    // 後ほどAPI連携：POST /api/register などに切り替える
    console.log("登録実行:", name, email, profilePhoto);
  
    // 仮の成功処理
    window.location.href = 'mypage.html';
  });
  