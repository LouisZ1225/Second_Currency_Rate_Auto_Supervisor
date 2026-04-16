def get_rate(usd_to_base, usd_to_target, base, target):

    if base == target:
        return 1.0
    
    if usd_to_base is None or usd_to_target is None:
        return None
    
    return usd_to_target / usd_to_base
