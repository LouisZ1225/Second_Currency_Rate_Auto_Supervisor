import requests
from datetime import datetime

def fetch_data(API_URL):
    response = requests.get(API_URL)
    data = response.json()

    api_time = data.get("time_last_update_utc", "")
    api_date = datetime.strptime(api_time, "%a, %d %b %Y %H:%M:%S %z").strftime("%Y-%m-%d")

    base = data["base_code"]
    rates = data["conversion_rates"]

    records = [(api_date, base, target, rate) for target, rate in rates.items()]

    return api_date, records