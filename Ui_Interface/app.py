# ===== 全局配置 ======

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import streamlit as st
from Analyse_and_Present.calculate_exchange import get_rate

# ===== 界面模块 ======

st.title("💱 Louis的汇率查询助手")

# ===== 输入模块 ======

date = st.date_input("选择日期", "2026-04-08")
data = str(date)
base = st.selectbox("基准货币", ["USD", "EUR", "GBP", "CNY", "JPY"])
target = st.selectbox("目标货币", ["CNY", "USD", "EUR", "GBP", "JPY"])

# ===== 交互模块 ======

if st.button("查询"):
    rate = get_rate(date, base, target)

    if rate:
        st.success(f"{base} 兑换 {target} 汇率是 {rate}")
    else:
        st.error("查询失败，请检查数据")