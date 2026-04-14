import sqlite3
import pandas as pd

def test_data(DB_PATH):
    with sqlite3.connect(DB_PATH) as conn:
        test_result = pd.read_sql_query(
                   "SELECT * FROM FX_RATES LIMIT 5",
                   conn
        )
        print(test_result)

    return 0