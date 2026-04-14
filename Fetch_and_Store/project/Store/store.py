import sqlite3

def store_data(DB_PATH, records):
    print("Store 启动！")
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT OR IGNORE INTO fx_rates(date, baseC, targetC, rate)
        VALUES (?, ?, ?, ?)
        """, records)  