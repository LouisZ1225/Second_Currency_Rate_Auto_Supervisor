# ===== 全局配置 ======

import sqlite3
import os

# ===== 配置模块 ======

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

# ===== 数据提取模块 ======

def query_rate(date, currency):
    with sqlite3.connect(DB_PATH) as conn:
      cursor = conn.cursor()
      cursor.execute("""
                   SELECT rate FROM FX_RATES
                     WHERE date = ? AND targetC = ?
                     """, (date, currency))
    
      result = cursor.fetchone()
    
    return result[0] if result else None