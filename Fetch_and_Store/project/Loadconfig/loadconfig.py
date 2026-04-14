
import os
from dotenv import load_dotenv

def load_config():
    print("Loadconfig 启动！")

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    API_KEY = os.getenv("API_KEY")

    
    if not API_KEY:
        env_path = os.path.join(BASE_DIR, "Config",".env")
        load_dotenv(env_path)
        API_KEY = os.getenv("API_KEY")
    
    if not API_KEY:
        raise ValueError("❌ API_KEY 未找到，请检查 Config/.env 文件")

    API_URL= f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD"
    DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

    return API_URL, DB_PATH