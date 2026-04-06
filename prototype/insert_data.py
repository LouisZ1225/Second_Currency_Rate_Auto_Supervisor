import sqlite3

conn = sqlite3.connect("fx_rates.db")

data = [
    ("2026-04-01", "USD", "CNY", 7.23),
]

conn.executemany("""
INSERT OR IGNORE INTO fx_rates (date, base, target, rate)
VALUES(?,?,?,?)
""", data)

conn.commit()

print("数据写入成功 ✌️")

conn.close()
