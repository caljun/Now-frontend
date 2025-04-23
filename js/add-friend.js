document.getElementById('addFriendForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const friendId = document.getElementById('friendId').value;
  
    // TODO: APIに接続（POST /add-friend）
    console.log("友達追加リクエスト:", friendId);
  
    alert(`${friendId} を友達に追加しました（仮）`);
    window.location.href = 'mypage.html';
  });
  