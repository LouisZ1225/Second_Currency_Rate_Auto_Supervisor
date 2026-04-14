from datetime import datetime

def clean_realtime_data(api_data):
    if not api_data:
        return []

    api_time = api_data.get("time_last_update_utc", "")
    api_date = datetime.strptime(api_time, "%a, %d %b %Y %H:%M:%S %z").strftime("%Y-%m-%d")

    base = api_data["base_code"]
    rates = api_data["conversion_rates"]

    records = [(api_date, base, target, rate) for target, rate in rates.items()]

    return records


def clean_historical_data(api_data):
    if not api_data:
        return []
    
    api_date = api_data.get("date")
    date = datetime.strptime(api_date, "%Y-%m-%d").strftime("%Y-%m-%d")
    base = api_data.get("source")
    quotes = api_data.get("quotes", {})

    records = []

    for pair, rate in quotes.items():
        target = pair.replace(base, "")
        records.append((date, base, target, rate))

    return records