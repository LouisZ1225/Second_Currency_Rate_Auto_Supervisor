from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from zoneinfo import ZoneInfo

import threading
import webbrowser

import uvicorn
from fastapi.responses import FileResponse

from Analyse_and_Present.calculate_exchange import get_rate


BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "html"

app = FastAPI(
    title="Louis汇率查询系统",
    version="1.0.0"
)


@app.get("/api/rate")
def query_exchange_rate(
    date: str = Query(
        ...,
        description="查询日期，格式YYYY-MM-DD"
    ),
    base: str = Query(
        ...,
        min_length=3,
        max_length=3
    ),
    target: str = Query(
        ...,
        min_length=3,
        max_length=3
    )
):
    base = base.upper()
    target = target.upper()

    try:
        query_date = datetime.strptime(
            date,
            "%Y-%m-%d"
        ).date()

    except ValueError:
        return {
            "success": False,
            "status": "invalid_date",
            "message": "日期格式错误，应为YYYY-MM-DD。"
        }

    china_today = datetime.now(
        ZoneInfo("Asia/Shanghai")
    ).date()

    if query_date > china_today:
        return {
            "success": False,
            "status": "future_date",
            "message": "不能查询未来日期的汇率。"
        }

    if base == target:
        return {
            "success": True,
            "data": {
                "date": date,
                "base": base,
                "target": target,
                "rate": 1.0
            }
        }

    try:
        rate = get_rate(
            date,
            base,
            target
        )

    except Exception as exc:
        print(
            "[汇率查询错误]",
            repr(exc)
        )

        return {
            "success": False,
            "status": "server_error",
            "message": "查询数据库时发生错误。"
        }

    if rate is None:
        if query_date == china_today:
            return {
                "success": False,
                "status": "pending",
                "message":
                    "今日汇率数据尚未更新，"
                    "请于每日早晨8:30后再试。"
            }

        return {
            "success": False,
            "status": "not_found",
            "message":
                "该日期没有对应汇率数据，"
                "请检查日期或币种。"
        }

    return {
        "success": True,
        "data": {
            "date": date,
            "base": base,
            "target": target,
            "rate": float(rate)
        }
    }


# ===== 前端目录 =====

CSS_DIR = WEB_DIR / "css"
JS_DIR = WEB_DIR / "js"
IMAGES_DIR = WEB_DIR / "images"
PAGES_DIR = WEB_DIR / "html"


# ===== 启动前检查目录 =====

required_paths = [
    WEB_DIR / "index.html",
    PAGES_DIR / "converter.html",
    PAGES_DIR / "database.html",
    CSS_DIR,
    JS_DIR,
    IMAGES_DIR,
]

for path in required_paths:
    if not path.exists():
        raise RuntimeError(
            f"前端文件或目录不存在：{path}"
        )


# ===== 静态资源 =====

app.mount(
    "/css",
    StaticFiles(directory=CSS_DIR),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory=JS_DIR),
    name="js"
)

app.mount(
    "/images",
    StaticFiles(directory=IMAGES_DIR),
    name="images"
)


# ===== 页面路由 =====

@app.get("/", include_in_schema=False)
def homepage():
    return FileResponse(
        WEB_DIR / "index.html"
    )


@app.get("/converter", include_in_schema=False)
def converter_page():
    return FileResponse(
        PAGES_DIR / "converter.html"
    )


@app.get("/database", include_in_schema=False)
def database_page():
    return FileResponse(
        PAGES_DIR / "database.html"
    )


# 如果还需要原来的course页面
@app.get("/course", include_in_schema=False)
def course_page():
    return FileResponse(
        PAGES_DIR / "course.html"
    )


# ===== 本地启动 =====

def open_browser():
    webbrowser.open(
        "http://127.0.0.1:8000/"
    )


if __name__ == "__main__":
    threading.Timer(
        1.2,
        open_browser
    ).start()

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )