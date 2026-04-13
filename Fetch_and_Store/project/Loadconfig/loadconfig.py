
import os
from dotenv import load_dotenv

def load_config():

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    env_path = os.path.join(BASE_DIR, "Config",".env")
    load_dotenv(env_path)

    API_KEY = os.getenv("API_KEY")
    
    if not API_KEY:
        raise ValueError("❌ API_KEY 未找到，请检查 Config/.env 文件")

    API_URL= f"Source"
    DB_PATH = os.path.join(BASE_DIR, "Database", "FX_RATES.db")

    return API_URL, DB_PATH