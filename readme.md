## 本機啟動說明

### 1) 後端啟動 (Flask)
1. 進入後端資料夾
	`cd backend`
2. 安裝套件
	`pip install -r requirements.txt`
3. 啟動後端
	`python app.py`

後端預設會在 `http://127.0.0.1:5000` 啟動，並提供登入 API：`POST /login`。

### 2) 前端啟動 (Next.js)
1. 回到專案根目錄後進入前端資料夾
	`cd frontend`
2. 第一次下載到本機時安裝套件
	`npm install`
3. 啟動前端開發伺服器
	`npm run dev`
4. 在瀏覽器開啟
	`http://localhost:3000`

### 3) 測試流程
1. 先確認後端有啟動 (`http://127.0.0.1:5000`)。
2. 再開前端 (`http://localhost:3000`)。
3. 在登入頁輸入帳密按下 Login，應會看到後端回傳訊息。

### 4) 常見問題
- 前端顯示 `Request failed`：通常是後端尚未啟動或埠號不是 5000。
- `npm install` 失敗：先確認 Node.js 與 npm 已安裝。
- `pip install` 失敗：先確認 Python 與 pip 可正常使用。