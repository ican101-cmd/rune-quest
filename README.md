# 字之勇者 · 失落的文字王國

遊玩網址：https://ican101-cmd.github.io/rune-quest/

以生字筆順練習進行戰鬥、解謎與水晶蒐集的冒險遊戲，適合手機及平板。

## 開始遊玩

家長先選擇版本、年級與六課生字，再開始六個區域的冒險。目前提供南一、康軒、翰林一年級至六年級上學期字庫。完成一字自動攻擊；寫錯一筆受到反擊。集齊六顆水晶後，挑戰以錯字複習為主的暮星文字魔龍。

進度保存在各自的瀏覽器，無需登入。不同裝置、瀏覽器或網址不會自動共用進度，可從遊戲說明匯出／匯入進度。

## 網站維護

純 HTML、CSS 與 JavaScript，入口為 `index.html`，無需建置或後端。GitHub Pages 使用 `main` 分支的根目錄。更新檔案並推送後，Pages 會自動重新部署。

本機可使用 `python3 -m http.server 8000`，再開啟 http://localhost:8000/ 。請透過 HTTP 開啟，以便載入各版本字庫。

## 資料與插畫來源

- 國語字庫：https://github.com/leyleyaiink/kids-chinese
- 筆順資料：https://github.com/g0v/zh-stroke-data
- 勇者、裝備與部分戰鬥插畫：https://github.com/ican101-cmd/KidGames
- 六關 Boss 與王國地圖為本遊戲生成插畫。詳細素材說明見 `art/SOURCES.txt`。

遊戲介面、戰鬥、解謎與手寫判定為本專案實作；第三方資料與素材保留各自適用授權。
