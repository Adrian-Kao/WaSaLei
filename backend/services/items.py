import sys
import os

# --- 尋路魔法：讓 Python 知道上一層資料夾 (backend) 的存在 ---
# 這行的意思是：找到目前這個檔案的「上一層的上一層」，把它加進系統路徑裡
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import db

