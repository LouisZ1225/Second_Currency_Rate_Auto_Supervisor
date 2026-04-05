import sqlite3

DB_PATH = "data/fx_rates.db"

def get_conn():
    return sqlite3.connect(DB_PATH)
