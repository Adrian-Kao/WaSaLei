# WaSaLei 數位衣櫃

WaSaLei 是一個數位衣櫃 / 衣物管理專案。使用者可以登入、管理收納空間、上傳衣物圖片、解析衣物顏色，並把衣物的類型、季節、顏色、風格等屬性存入資料庫。

## 專案架構

```text
WaSaLei/
├─ backend/          Flask API、MySQL 存取、圖片解析流程
├─ frontend/         Next.js 前端
├─ pictures/         圖片流程資料夾，執行後會使用 input/output/final
└─ readme.md
```

## 主要功能

- 使用者註冊與登入
- 建立與查詢收納空間，例如衣櫃、行李箱
- 上傳圖片並產生解析預覽
- 確認圖片後新增衣物資料
- 查詢、修改、刪除單一衣物
- 依空間、類型、季節、顏色、風格搜尋衣物

## 後端啟動

### 1. 進入後端資料夾

```bash
cd backend
```

### 2. 建立虛擬環境，建議使用

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. 安裝套件

```bash
pip install -r requirements.txt
```

如果 `torch` 或 `torchvision` 安裝失敗，請依照你的 Python / CUDA / CPU 環境到 PyTorch 官網選擇安裝指令：

```text
https://pytorch.org/get-started/locally/
```

### 4. 設定資料庫連線

在 `backend/.env` 設定 MySQL 連線資訊：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=digital_wardrobe
DB_PORT=3306
```

### 5. 匯入資料庫

先建立資料庫：

```sql
CREATE DATABASE digital_wardrobe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

再匯入 `backend/init.sql`。

可用 MySQL CLI：

```bash
mysql -u root -p digital_wardrobe < init.sql
```

### 6. 啟動 Flask API

```bash
python app.py
```

後端預設啟動在：

```text
http://127.0.0.1:5000
```

健康檢查：

```text
GET http://127.0.0.1:5000/
```

## 前端啟動

### 1. 進入前端資料夾

```bash
cd frontend
```

### 2. 安裝套件

```bash
npm install
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

前端預設啟動在：

```text
http://localhost:3000
```

## 圖片流程

推薦前端使用新的拆分式流程：

```text
POST /api/images/upload-input
-> POST /api/images/parse-input
-> 顯示 preview_url
-> POST /api/items/confirm-image
```

圖片資料夾用途：

```text
pictures/input/    目前上傳的原圖
pictures/output/   目前解析後的預覽圖 output.png
pictures/final/    使用者確認後的正式衣物圖片
```

舊的一步式預覽 API 仍保留：

```text
POST /api/items/preview-image
```

它等同於「上傳圖片 + 立即解析」。

## 常用 API

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/space/predefined
POST   /api/space
GET    /api/space/user/<user_id>
GET    /api/space/<space_id>/items

GET    /api/items/<item_id>
PATCH  /api/items/<item_id>
DELETE /api/items/<item_id>
POST   /api/items/preview-image
POST   /api/items/confirm-image

GET    /api/search
POST   /api/search

POST   /api/images/upload-input
POST   /api/images/parse-input
```

更完整的 API 文件請看：

```text
backend/api_docs.txt
```

## 本機測試

除了 `image_preview.py` 之外，`backend/services` 裡的 service 檔案都有簡單本機測試：

```bash
python services/auth.py
python services/items.py
python services/search.py
python services/space.py
```

其中會修改資料庫的測試預設關閉，避免不小心改到 seed data。

## 注意事項

- 目前資料表使用 MySQL dump 建立，請先確認 `init.sql` 已成功匯入。
- `item` 的季節、顏色、風格是多對多關係，分別透過 `item_season`、`item_color`、`item_style` 儲存。
- `pictures/output/output.png` 必須存在，才能呼叫 `/api/items/confirm-image`。
- 如果前端出現 `Request failed`，先確認 Flask 是否在 `http://127.0.0.1:5000` 執行。
- 如果圖片解析套件安裝失敗，優先檢查 Python 版本、PyTorch 安裝方式，以及 `onnxruntime` 是否能正常安裝。
