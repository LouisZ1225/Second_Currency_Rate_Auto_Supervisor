from Fetch.fetch import fetch_data
from Store.initiate_db import init_db
from Store.store import store_data
from Clean.clean import clean_data



def service(API_URL, DB_PATH):

    print("Service 启动！")

    init_db(DB_PATH)

    date, records = fetch_data(API_URL)

    store_data(DB_PATH, records)

    clean_data(DB_PATH)

    return date, records