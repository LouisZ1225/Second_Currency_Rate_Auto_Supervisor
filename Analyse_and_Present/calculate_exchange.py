# ===== 全局配置 ======

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))

# ===== 配置模块 ======

from Database.query import query_rate

# ===== 数据计算模块 ======

def get_rate(date, base, target):
    if base == target:
        return 1.0
    
    if base == "USD":
        usd_to_base = 1.0
    else:
        usd_to_base = query_rate(date, base)
    
    if target == "USD":
        usd_to_target = 1.0
    else:
        usd_to_target = query_rate(date, target)
    
    if usd_to_base is None or usd_to_target is None:
        print(f"⚠无法计算: {base} -> {target}")
        return None
    
    return usd_to_target / usd_to_base

print(get_rate("2026-03-01", "USD", "CNY"))