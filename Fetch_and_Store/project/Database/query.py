import sqlite3
import pandas as pd

def query_rate(DB_PATH, date, currency):
    with sqlite3.connect(DB_PATH) as conn:
      cursor = conn.cursor()
      cursor.execute("""
                   SELECT rate FROM FX_RATES
                     WHERE date = ? AND targetC = ?
                     """, (date, currency))
    
      result = cursor.fetchone()
    
      if not result:
            print(f"No data found for date: {date} and currency: {currency}")
            return None
    
    return result[0] 



def test_data(DB_PATH):
    with sqlite3.connect(DB_PATH) as conn:
        test_result = pd.read_sql_query(
                   "SELECT * FROM FX_RATES LIMIT 5",
                   conn
        )
        print(test_result)

    return 0