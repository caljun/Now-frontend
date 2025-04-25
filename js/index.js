window.addEventListener('DOMContentLoaded', () => {
  // 仮：ログイン状態チェック（localStorage に保存された "user" の有無で判断）
  const user = localStorage.getItem('user');

  if (user) {
    // すでにログイン済みならマイページへ
    window.location.href = 'mypage.html';
  }

  // 未ログインならそのまま説明表示（特に追加処理なし）
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}
