
from Database.query import query_data

def output_data(DB_PATH):
    print("Test 启动！")

    df = query_data(DB_PATH)
    print(df)