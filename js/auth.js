// ログイン済みユーザーを取得
export function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  // ログイン状態のチェック（未ログインならindexへリダイレクト）
  export function requireLogin() {
    const user = getCurrentUser();
    if (!user) {
      alert('ログインが必要です');
      window.location.href = 'index.html';
    }
  }
  
  // ログアウト処理
  export function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
  