import sqlite3

def store_data(DB_NAME, records):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT OR IGNORE INTO fx_rates(date, baseC, targetC, rate)
        VALUES (?, ?, ?, ?)
        """, records)  