import sys
import os
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from Project.Service.service_ui import service_ui

import streamlit as st
import pytz
from datetime import date, datetime
china_tz = pytz.timezone("Asia/Shanghai")
china_today = datetime.now(china_tz).date()

# ===== 界面模块 ======

st.title("💱 Louis的汇率查询助手")

CURRENCIES = {
        "USD": "美元",
        "EUR": "欧元",
        "GBP": "英镑",
        "AUD": "澳元",
        "CAD": "加拿大元",
        
        "CNY": "人民币",
        "JPY": "日元",
        "KRW": "韩元",
        "HKD": "港元",
        "TWD": "新台币",
        "RUB": "俄罗斯卢布",
        "VND": "越南盾",
        "THB": "泰铢",
        "MMK": "缅甸元",
        "SGD": "新加坡元",
        "MYR": "马来西亚林吉特",
        "INR": "印度卢比",
        "PKR": "巴基斯坦卢比",
        "IDR": "印尼盾",
        
        "AED": "阿联酋迪拉姆",
        "SAR": "沙特里亚尔",
        "OMR": "阿曼里亚尔",
        "QAR": "卡塔尔里亚尔",
        "BHD": "巴林第纳尔",
        
        "BRL": "巴西雷亚尔",
        "ARS": "阿根廷比索",
        "CUP": "古巴比索",
        "CLP": "智利比索",
        "PEN": "秘鲁索尔",
        
        "KES": "肯尼亚先令",
        "NGN": "尼日利亚奈拉",
        "EGP": "埃及镑",
        "TND": "突尼斯第纳尔",
        "CDF": "刚果法郎",
        "DZD": "阿尔及利亚第纳尔",
        "BIF": "布隆迪法郎",
        "GHS": "加纳塞地",
        "SDG": "苏丹镑",
        "TZS": "坦桑尼亚先令",
        "UGX": "乌干达先令",
        "AOA": "安哥拉宽扎",
        "BWP": "博兹瓦纳普拉",
        "ZAR": "南非兰特",
        
        
    }

FLAGS= {
        "USD": "🇺🇸",
        "EUR": "🇪🇺",
        "GBP": "🇬🇧",
        "AUD": "🇦🇺",
        "CAD": "🇨🇦",
        "CNY": "🇨🇳",
        "JPY": "🇯🇵",
        "KRW": "🇰🇷",
        "THB": "🇹🇭",
        "HKD": "🇭🇰",
        "TWD": "🇨🇳",
        "SGD": "🇸🇬",
        "MYR": "🇲🇾",
        "INR": "🇮🇳",
        "PKR": "🇵🇰",
        "IDR": "🇮🇩",
        "AED": "🇦🇪",
        "SAR": "🇸🇦",
        "OMR": "🇴🇲",
        "QAR": "🇶🇦",
        "BHD": "🇧🇭",
        "BRL": "🇧🇷",
        "ARS": "🇦🇷",
        "CUP": "🇨🇺",
        "CLP": "🇨🇱",
        "PEN": "🇵🇪",
        "KES": "🇰🇪",
        "NGN": "🇳🇬",
        "EGP": "🇪🇬",
        "TND": "🇹🇳",
        "CDF": "🇨🇩",
        "DZD": "🇩🇿",
        "BIF": "🇧🇮",
        "GHS": "🇬🇭",
        "SDG": "🇸🇩",
        "TZS": "🇹🇿",
        "UGX": "🇺🇬",
        "AOA": "🇦🇴",
        "BWP": "🇧🇼",
        "ZAR": "🇿🇦",
        "RUB": "🇷🇺",
        "VND": "🇻🇳",
        "MMK": "🇲🇲",
        
        
    }

# ===== 用户输入模块 ======

date = st.date_input("选择日期", value = china_today)
data = str(date)
base = st.selectbox("基准货币", 
                    list(CURRENCIES.keys()),
                    format_func=lambda x: f"{FLAGS.get(x, '🌍')} {x} - {CURRENCIES[x]} "
)
target = st.selectbox("目标货币", 
                    list(CURRENCIES.keys()),
                    index = list(CURRENCIES.keys()).index("CNY"),
                    format_func=lambda x: f"{FLAGS.get(x, '🌍')} {x} - {CURRENCIES[x]}"
)

# ===== 结果展示模块 ======

if st.button("查询"):
    
    result = service_ui(data, base, target)

    if result["status"] == "success":
        st.success(result["message"])

    elif result["status"] == "no_data":
        st.warning(result["message"])