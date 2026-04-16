from Database.query import query_rate
from Project.Calculate.calculate_exchange import get_rate

import os

def service_ui(date, base, target):

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

    usd_to_base = 1.0 if base == "USD" else query_rate(DB_PATH, date, base)
    usd_to_target = 1.0 if target == "USD" else query_rate(DB_PATH, date, target)

    rate = get_rate(usd_to_base, usd_to_target, base, target)

    if rate is None:
        return {
            "status": "no_data",
            "rate": None,
            "message": f"⚠️ {base} → {target} 汇率暂无数据"
        }

    return  {
        "status": "success",
        "rate": rate,
        "message": f"{base} 兑换 {target} 汇率是 {rate:.4f}"
    }