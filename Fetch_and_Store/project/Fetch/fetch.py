import requests

# ===== 获取实时数据 ======

def fetch_present_data(API_URL, API_KEY):

    url = f"{API_URL}/v6/{API_KEY}/latest/USD"

    response = requests.get(url)
    api_data = response.json()

    return api_data

# ===== 获取历史数据 ======

def fetch_historical_data(API_URL, API_KEY, date):

    url = f"{API_URL}/historical"
    params = {
        "access_key": API_KEY,
        "date": date
    }

    response = requests.get(url, params=params)
    api_data = response.json()

    if not api_data.get("quotes"):
        print(f"⚠无数据: {date}")
        return None

    return api_data