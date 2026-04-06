import sqlite3
import pandas as pd

conn = sqlite3.connect("fx_rates.db")

df = pd.read_sql("""
SELECT * FROM fx_rates
ORDER BY date
""", conn)

print(df)

conn.close()
