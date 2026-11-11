# 頁首「到訪勇者」設定

目前前端已準備好，`visitor-counter-config.js` 的服務網址預設留空；未完成部署前不顯示任何人數，也不以 0 或測試數字代替真實資料。

## 一次性 Google 端設定

1. 在 Google Analytics 的「管理 → 資源設定 → 資源詳細資料」找到**數字型資源 ID**。不要使用資料串流 ID 或 `G-XLCR3Q82P8`。
2. 用可檢視該 GA 資源的同一 Google 帳號開啟 https://script.google.com/ ，建立新專案，名稱可用「字之勇者人數統計」。
3. 將本目錄的 `visitor-counter.gs` 全部貼到預設 `程式碼.gs`，目前已填好資源 ID `563803380`，不需再修改。
4. 左側「服務」按 `＋`，加入 **Google Analytics Data API**，識別名稱應為 `AnalyticsData`。若使用自訂 Cloud 專案，還需在該專案啟用 Google Analytics Data API。
5. 儲存，在上方函式選單選 `setupVisitorCounter`，按「執行」，以自己的帳號授權查詢 Analytics 與建立排程。成功後會先查詢一次，再建立每小時更新一次的觸發條件。
6. 右上角「部署 → 新增部署作業」，類型選「網頁應用程式」，執行身分選「我」，誰可以存取選「所有人」。部署後複製以 `/exec` 結尾的網址。不要使用編輯器網址或 `/dev` 測試網址。如果工作／學校帳號禁止公開網頁應用程式，需要由管理員允許，或使用可公開部署且有該 GA 資源檢視權限的帳號。
7. 將公開 `/exec` 網址填入網站 `visitor-counter-config.js` 的 `QUEST_VISITOR_COUNTER_URL` 並發布網站。這個網址不是密碼；不需要把 Google 密碼、授權碼、OAuth token 或私鑰給網站或聊天。

往後修改 Apps Script 程式，需透過「管理部署作業」編輯並選新版本，才能更新公開端點。資源 ID 改動後也需再次執行 setupVisitorCounter 以刷新快取。

## 統計意義

- GA4 `totalUsers`，查詢從 2020-01-01 到今天的整段期間；實際只會包含該資源已收集的資料。
- 篩選 `pageLocation` 以 `https://ican101-cmd.github.io/rune-quest/` 開頭的造訪。
- 不相加每日人數，避免將每天回訪者逐日重複累加；數字仍是 GA 依識別資料估算，非真實玩家名單或目前在線人數。
- Google 報表本身可能延遲。頁首「約每小時更新」指查詢快取更新頻率，不表示資料是即時的。
- 公開服務只回傳總人數與更新時間。頁面讀取不會查詢 GA、增加計數或公開其他報表資料。
- 查詢失敗保留上一份快取；前端最多顯示 24 小時內的快取，超過期限或首次讀取失敗則隱藏。數字以「約」標示。

## 驗證

在 Apps Script 執行 `setupVisitorCounter` 成功後，用未登入 Google 的視窗開啟公開 `/exec` 網址，應看到 `window.runeQuestVisitorCount({...});`，其中含 `totalUsers` 與 `updatedAt`。若顯示 `available:false`，表示還沒有成功產生快取。回到編輯器的「執行項目」檢查錯誤。

網站測試：`node tests/visitor-counter.cjs`。瀏覽器版面測試使用隔離的模擬資料；正式網站不附測試人數。
