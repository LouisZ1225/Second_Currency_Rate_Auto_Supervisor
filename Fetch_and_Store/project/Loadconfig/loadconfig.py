import os
from dotenv import load_dotenv

def load_config():

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    env_path = os.path.join(BASE_DIR, "Config",".env")
    DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

    load_dotenv(env_path)
    API_REALTIME_KEY = os.getenv("API_KEY")
    API_HISTORY_KEY = os.getenv("API_HISTORY_KEY")
    if not API_REALTIME_KEY:
        raise ValueError("❌ API_KEY 未找到，请检查 Config/.env 文件")
    if not API_HISTORY_KEY:
        raise ValueError("❌ API_HISTORY_KEY 未找到，请检查 Config/.env 文件")
    
    API_REALTIME_URL = "https://v6.exchangerate-api.com/"
    API_HISTORY_URL = "https://api.exchangerate.host"

    return  {
        "realtime": {
        "api_url": API_REALTIME_URL,
        "api_key": API_REALTIME_KEY,
        "path": DB_PATH
    },
        "history": {
        "api_url": API_HISTORY_URL,
        "api_key": API_HISTORY_KEY,
        "path": DB_PATH
    },
}