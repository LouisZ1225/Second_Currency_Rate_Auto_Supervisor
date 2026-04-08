# ===== 全局配置 ======

import sys
import os

# ===== 配置模块 ======

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))
from Database.query import query_rate

# ===== 数据计算模块 ======

def get_rate(date, base, target):
    if base == target:
        return 1.0
    
    usd_to_base = query_rate(date, base)
    usd_to_target = query_rate(date, target)
    
    if usd_to_base is None or usd_to_target is None:
        print(f"⚠无法计算: {base} -> {target}")
        return None
    
    return usd_to_target / usd_to_base
