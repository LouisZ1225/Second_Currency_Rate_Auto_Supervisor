from Database.query import DB_PATH, query_rate

def get_rate(date, base, target):

    if base == target:
        return 1.0
    
    if base == "USD":
        usd_to_base = 1.0
    else:
        usd_to_base = query_rate(DB_PATH, date, base)
    
    if target == "USD":
        usd_to_target = 1.0
    else:
        usd_to_target = query_rate(DB_PATH, date, target)
    
    if usd_to_base is None or usd_to_target is None:
        print(f"⚠无法计算: {base} -> {target}")
        return None
    
    return usd_to_target / usd_to_base
