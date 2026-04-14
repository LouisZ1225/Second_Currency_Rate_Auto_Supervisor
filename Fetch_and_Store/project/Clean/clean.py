
import sqlite3
from datetime import datetime

def clean_data(DB_PATH):
    print("Clean 启动！")
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        DELETE FROM FX_RATES
        WHERE rate <=0
        """)

        cursor.execute("""
        DELETE FROM FX_RATES
        WHERE baseC = targetC AND rate != 1
        """)

        conn.commit()
