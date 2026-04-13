from Loadconfig.loadconfig import load_config
from Fetch.fetch import fetch_data
from Clean.clean import clean_data
from Store.store import store_data
from Store.initiate_db import init_db

def service():
    API_URL, DB_NAME = load_config()

    init_db(DB_NAME)

    date, records = fetch_data(API_URL)

    store_data(DB_NAME, records)

    return date,len(records)