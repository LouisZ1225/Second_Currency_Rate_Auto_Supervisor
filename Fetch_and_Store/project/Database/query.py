# ===== 全局配置 ======

import sqlite3
import pandas as pd
import os

# ===== 配置模块 ======

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

# ===== 数据提取模块 ======

def query_data(DB_PATH):
    print("Query 启动！")
    with sqlite3.connect(DB_PATH) as conn:
        df = pd.read_sql_query(
                   "SELECT * FROM FX_RATES LIMIT 5",
                   conn
        )
    
    return df