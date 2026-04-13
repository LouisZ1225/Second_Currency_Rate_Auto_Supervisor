
def clean_data(api_data):
    if not api_data:
        return []
    
    raw_date = api_data.get("date")
    date = datetime.strptime(raw_date, "%Y-%m-%d").strftime("%Y-%m-%d")
    base = api_data.get("source")
    quotes = api_data.get("quotes", {})

    records = []

    for pair, rate in quotes.items():
        target = pair.replace(base, "")
        records.append((date, base, target, rate))

    return records
