from Loadconfig.loadconfig import load_config
from Service.service import service
from Test.test import output_data

def main():
    print("Main 启动！")
    
    API_URL, DB_PATH = load_config()

    service(API_URL,DB_PATH)
    
    output_data(DB_PATH)

if __name__ == "__main__":
    main()