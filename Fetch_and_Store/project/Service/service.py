from Fetch.fetch import fetch_present_data, fetch_historical_data
from Database.initiate_db import init_db
from Store.store import store_data
from Clean.clean import clean_realtime_data, clean_historical_data
from Database.query import test_data
from datetime import datetime, timedelta
import time

# ===== 实时数据服务 ======

def service_realtime(config):
    
    init_db(config["path"])

    api_data = fetch_present_data(config["api_url"],
                                 config["api_key"])
    
    records = clean_realtime_data(api_data)

    if records:
        store_data(config["path"], records)

        test_data(config["path"])


# ===== 历史数据服务 ======

def service_history(config, start_date, end_date):
 
    init_db(config["path"])
    
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    while start <= end:
        date_str = start.strftime("%Y-%m-%d")
        print(f"\n📥 处理日期: {date_str}")

        api_data = fetch_historical_data(
            config["api_url"],
            config["api_key"],
            date_str)
        
        records = clean_historical_data(api_data)

        if records:
            store_data(config["path"], records)
            print(f"✅ 写入 {len(records)} 条数据")
        
        start += timedelta(days=1)
        time.sleep(2)
