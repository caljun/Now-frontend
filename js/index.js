// ✅ 修正版：index.js
window.addEventListener('load', () => {
  // iOS PWA 対策：読み込み完了後、少し待ってからlocalStorageを確認
  setTimeout(() => {
    const user = localStorage.getItem('user');
    if (user) {
      location.replace('mypage.html'); // ← 強制遷移（履歴に残さない）
    }
  }, 200); // ← Safari PWA対応のために200ms待つ
});

// ✅ Service Worker登録（これはそのままでOK）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}
