# ===== 全局配置 ======

import requests
import sqlite3
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
import os

# ===== 配置模块 ======

def load_config():

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    API_KEY = os.getenv("API_KEY")

    if not API_KEY:
        env_path = os.path.join(BASE_DIR, "Config",".env")
        load_dotenv(env_path)
        API_KEY = os.getenv("API_KEY")
    
    if not API_KEY:
        raise ValueError("❌ API_KEY 未找到，请检查 Config/.env 文件")

    API_URL= f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD"
    DB_NAME = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

    return API_URL, DB_NAME

# ===== 初始化模块 ======

def init_db(DB_NAME): 
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("""
    CREATE TABLE IF NOT EXISTS fx_rates (
        date TEXT, 
        baseC TEXT,
        targetC TEXT,
        rate REAL,
        PRIMARY KEY (date, baseC, targetC)
)                
""")

# ===== 数据获取模块 ======

def fetch_data(API_URL):
    response = requests.get(API_URL)
    data = response.json()

    api_timr = data.get("time_last_update_utc", "")
    api_date = datetime.strptime(api_timr, "%a, %d %b %Y %H:%M:%S %z").strftime("%Y-%m-%d")

    base = data["base_code"]
    rates = data["conversion_rates"]

    records = [(api_date, base, target, rate) for target, rate in rates.items()]

    return api_date, records

# ===== 数据存储模块 ======

def store_data(DB_NAME, records):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT OR IGNORE INTO fx_rates(date, baseC, targetC, rate)
        VALUES (?, ?, ?, ?)
        """, records)  

# ===== 输出数据模块 ======

def output_data(records):
    df = pd.DataFrame(records, columns=["Date", "baseC", "targetC", "rate"])
    print(df.head(20))

# ===== 主函数 ======

def main():

    API_URL, DB_NAME = load_config()

    init_db(DB_NAME)

    today, records = fetch_data(API_URL)

    store_data(DB_NAME, records)

    output_data(records)

if __name__ == "__main__":
    main()