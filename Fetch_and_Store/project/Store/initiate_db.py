import sqlite3

def init_db(DB_PATH): 
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
    CREATE TABLE IF NOT EXISTS fx_rates (
        date TEXT, 
        baseC TEXT,
        targetC TEXT,
        rate REAL,
        PRIMARY KEY (date, baseC, targetC)
)                
""")