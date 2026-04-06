# ===== 全局配置 ======

from logging import config
import requests
import sqlite3
import pandas as pd
import os
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

# ===== 配置模块 ======

def load_config():

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    env_path = os.path.join(BASE_DIR, "Config",".env")
    if not os.path.exists(env_path):
        raise FileNotFoundError(f".env 文件不存在: {env_path}")
    
    load_dotenv(env_path)

    API_HISTORY_KEY = os.getenv("API_HISTORY_KEY")
    if not API_HISTORY_KEY:
        raise ValueError("❌ API_HISTORY_KEY 未找到，请检查 Config/.env 文件")

    API_BASE_URL = "https://api.exchangerate.host"
    DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

    return {
        "api_key": API_HISTORY_KEY,
        "api_base_url": API_BASE_URL,
        "db_path": DB_PATH
}

# ===== 初始化模块 ======

def init_db(DB_PATH): 
    with sqlite3.connect(DB_PATH) as conn:
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

def fetch_historical_data(API_BASE_URL, API_HISTORY_KEY, date):
    
    url = f"{API_BASE_URL}/historical"
    params = {
        "access_key": API_HISTORY_KEY,
        "date": date
    }

    response = requests.get(url, params=params)
    api_data = response.json()

    if not api_data.get("quotes"):
        print(f"⚠无数据: {date}")
        return None

    return api_data

# ===== 数据清洗模块 ======

def clean_data(api_data):
    if not api_data:
        return []
    
    raw_date = api_data.get("date")
    date = datetime.strptime(raw_date, "%Y-%m-%d").strftime("%Y-%m-%d")
    base = api_data.get("source")
    quotes = api_data.get("quotes", {})

    records = []

    for pair, rate in quotes.items():
        target = pair.replace(base, "")
        records.append((date, base, target, rate))

    return records

# ===== 数据存储模块 ======

def store_data(DB_PATH, records):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT OR IGNORE INTO fx_rates (date, baseC, targetC, rate) 
        VALUES (?, ?, ?, ?)
        """, records)

# ===== 引擎模块 ======

def process_engine(date_str, config):
    api_date = fetch_historical_data(
        config["api_base_url"], 
        config["api_key"], 
        date_str
    )

    records = clean_data(api_date)

    if records:
        store_data(config["db_path"], records)
        print(f"\n📊 {date_str} 样例数据：")
        sample = records[:3]
        for row in sample:
            print(row)
        
# ===== 数据检查模块 ======

def check_db(db_path):
        with sqlite3.connect(db_path) as conn:
            df = pd.read_sql("SELECT * FROM fx_rates LIMIT 10", conn)
            print("\n📊 数据库中的数据：")
            print(df)

# ===== 主函数 ======

def main():

    config = load_config()
    init_db(config["db_path"])

    start_date = "2025-02-19"
    end_date = "2026-04-05"

    current = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        print(f"\n📥 处理日期: {date_str}")
        
        process_engine(date_str, config)

        current += timedelta(days=1)
        time.sleep(2)

    check_db(config["db_path"])

if __name__ == "__main__":
    main()