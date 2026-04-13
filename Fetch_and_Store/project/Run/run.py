from Service.service import service

def run():
    date, count = service()
    print(f"✅ 更新完成: {date}, {count}条")

if __name__ == "__main__":
    run()