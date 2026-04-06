import requests
import time
import os

API_KEY = os.getenv("API_KEY")

pairs = ["USD/CNY", "EUR/CNY" , "GBP/CNY"]

last_rates = {}

INTERVAL = 20

def get_rate(pair):
    url=f"http://api.twelvedata.com/exchange_rate?symbol={pair}&apikey={API_KEY}"
    try:
        res = requests.get(url, timeout=5).json()
        if "rate" in res:
            return float(res["rate"])
        else:
            print("API返回异常:", res)
            return None 
    except Exception as e:
        print ("请求失败：", e)
        return None

def color_text(text, color):
    colors = {
        "red": "\033[91m",
        "green":"\033[92m",
        "reset":"\033[0m"
    }
    return f"{colors.get(color, '')}{text}{colors['reset']}"

def compare(pair, rate):
    last_rate = last_rates.get(pair)

    if last_rate is None:
        print(f"{pair}=>{rate:.5f}")

    else:
        diff = rate - last_rate
        pct = (diff / last_rate)*100

        if diff > 0:
            arrow = "↑"
            text = f"{pair}=>{rate:.5f}(+{diff:.5f}/+{pct:.3f}%){arrow}"
            print(color_text(text, "red"))
        elif diff < 0:
            arrow = "↓"
            text = f"{pair}=>{rate:.5f}(+{diff:.5f}/+{pct:.3f}%){arrow}"
            print(color_text(text, "green"))
        else:
            arrow = "-"
            print(f"{pair}=>{rate:.5f}(0.00000 / 0.000%){arrow}")
    last_rates[pair] = rate

def main():
    print("开始实时更新汇率(Ctrl+C)停止")

    i = 0

    try:
        while True:
        
            pair = pairs[i % len(pairs)]
            rate = get_rate(pair)

            if rate:
                compare(pair, rate)
            i += 1
            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("\n程序已手动停止")

if __name__ == "__main__":
    
    print("程序开始运行：")
    main()
        
