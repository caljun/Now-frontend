function checkLoginAndRedirect(attempt = 0) {
  const user = localStorage.getItem('user');
  if (user) {
    location.replace('mypage.html'); // ← 成功
  } else if (attempt < 5) {
    // 0.5秒後にもう一回試す（最大5回）
    setTimeout(() => checkLoginAndRedirect(attempt + 1), 500);
  } else {
    console.log('ユーザー情報が取得できませんでした（PWA対応リトライ失敗）');
  }
}

window.addEventListener('load', () => {
  checkLoginAndRedirect();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}
