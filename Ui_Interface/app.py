# ===== 全局配置 ======

import sys
import os
import pytz
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import streamlit as st
from Analyse_and_Present.calculate_exchange import get_rate
from datetime import date, datetime

# ===== 配置模块 ======

china_tz = pytz.timezone("Asia/Shanghai")
china_today = datetime.now(china_tz).date()

# ===== 界面模块 ======

st.title("💱 Louis的汇率查询助手")

# ===== 输入模块 ======

date = st.date_input("选择日期", value = china_today)
data = str(date)
base = st.selectbox("基准货币", ["USD", "EUR", "GBP", "CNY", "JPY"])
target = st.selectbox("目标货币", ["CNY", "USD", "EUR", "GBP", "JPY"])

# ===== 交互模块 ======

if st.button("查询"):
    
    rate = get_rate(data, base, target)
    
    if date == china_today and rate is None:
        st.warning("⚠️ 今日汇率数据尚未更新，请于每日早晨8:30再试")
    
    elif rate is not None:
            st.success(f"{base} 兑换 {target} 汇率是 {rate:.4f}")
    else:
        pass
