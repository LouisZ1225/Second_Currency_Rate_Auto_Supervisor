from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import threading
import webbrowser

import uvicorn
from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from Analyse_and_Present.calculate_exchange import get_rate
from Analyse_and_Present.market_service import (
    build_market_overview,
    build_rate_history
)


# ==================================================
# 路径配置
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

FRONTEND_DIR = BASE_DIR / "html"

INDEX_FILE = FRONTEND_DIR / "index.html"

PAGES_DIR = FRONTEND_DIR / "html"

CONVERTER_FILE = PAGES_DIR / "converter.html"
DATABASE_FILE = PAGES_DIR / "database.html"
COURSE_FILE = PAGES_DIR / "course.html"

CSS_DIR = FRONTEND_DIR / "css"
JS_DIR = FRONTEND_DIR / "js"
IMAGES_DIR = FRONTEND_DIR / "images"


# ==================================================
# 启动检查
# ==================================================

REQUIRED_PATHS = [
    INDEX_FILE,
    CONVERTER_FILE,
    DATABASE_FILE,
    CSS_DIR,
    JS_DIR,
    IMAGES_DIR,
]

for path in REQUIRED_PATHS:
    if not path.exists():
        raise RuntimeError(
            f"文件或目录不存在：{path}"
        )


print("=" * 70)
print("[项目根目录]", BASE_DIR)
print("[首页文件]", INDEX_FILE)
print("[CSS 文件]", CSS_DIR / "index.css")
print("[JS 文件]", JS_DIR / "index.js")
print("=" * 70)


# ==================================================
# FastAPI 应用
# ==================================================

app = FastAPI(
    title="Louis汇率查询系统",
    version="2.0.0"
)


CHINA_TIMEZONE = ZoneInfo("Asia/Shanghai")


MARKET_PAIRS = [
    ("USD", "CNY"),
    ("EUR", "CNY"),
    ("GBP", "CNY"),
    ("JPY", "CNY"),
    ("HKD", "CNY"),
]


# ==================================================
# 开发阶段关闭缓存
# ==================================================

@app.middleware("http")
async def disable_cache(
    request,
    call_next
):
    response = await call_next(request)

    path = request.url.path.lower()

    if (
        path == "/"
        or path.endswith(".html")
        or path.endswith(".css")
        or path.endswith(".js")
    ):
        response.headers["Cache-Control"] = (
            "no-store, no-cache, "
            "must-revalidate, max-age=0"
        )
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


# ==================================================
# 原有单日汇率查询
# ==================================================

@app.get("/api/rate")
def query_exchange_rate(
    date: str = Query(...),
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
    base = base.strip().upper()
    target = target.strip().upper()

    try:
        query_date = datetime.strptime(
            date,
            "%Y-%m-%d"
        ).date()

    except ValueError:
        return {
            "success": False,
            "status": "invalid_date",
            "message":
                "日期格式错误，应为 YYYY-MM-DD。"
        }

    today = datetime.now(
        CHINA_TIMEZONE
    ).date()

    if query_date > today:
        return {
            "success": False,
            "status": "future_date",
            "message": "不能查询未来日期。"
        }

    if base == target:
        rate = 1.0

    else:
        try:
            rate = get_rate(
                date,
                base,
                target
            )

        except Exception as exc:
            print(
                "[汇率查询失败]",
                repr(exc)
            )

            return {
                "success": False,
                "status": "server_error",
                "message": "查询数据库时发生错误。"
            }

    if rate is None:
        return {
            "success": False,
            "status": "not_found",
            "message": "没有查询到对应汇率。"
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


# ==================================================
# 首页市场概览 API
# ==================================================

@app.get("/api/market/overview")
def market_overview():
    try:
        result = build_market_overview(
            MARKET_PAIRS
        )

        return {
            "success": True,
            **result
        }

    except Exception as exc:
        print(
            "[市场概览生成失败]",
            repr(exc)
        )

        return {
            "success": False,
            "updated_at": None,
            "items": [],
            "message": "市场概览生成失败。"
        }


# ==================================================
# 历史趋势 API
# ==================================================

@app.get("/api/rate/history")
def rate_history(
    base: str = Query(
        ...,
        min_length=3,
        max_length=3
    ),
    target: str = Query(
        ...,
        min_length=3,
        max_length=3
    ),
    days: int = Query(
        30,
        ge=1,
        le=3650
    )
):
    base = base.strip().upper()
    target = target.strip().upper()

    try:
        data = build_rate_history(
            base=base,
            target=target,
            days=days
        )

        return {
            "success": True,
            "base": base,
            "target": target,
            "days": days,
            "count": len(data),
            "data": data
        }

    except Exception as exc:
        print(
            "[历史数据生成失败]",
            repr(exc)
        )

        return {
            "success": False,
            "base": base,
            "target": target,
            "days": days,
            "count": 0,
            "data": [],
            "message": "历史趋势生成失败。"
        }


# ==================================================
# 健康检查
# ==================================================

@app.get("/api/health")
def health_check():
    return {
        "success": True,
        "status": "running",
        "time": datetime.now(
            CHINA_TIMEZONE
        ).isoformat()
    }


# ==================================================
# 静态文件
# ==================================================

app.mount(
    "/css",
    StaticFiles(
        directory=str(CSS_DIR),
        check_dir=True
    ),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(
        directory=str(JS_DIR),
        check_dir=True
    ),
    name="js"
)

app.mount(
    "/images",
    StaticFiles(
        directory=str(IMAGES_DIR),
        check_dir=True
    ),
    name="images"
)


# ==================================================
# HTML 页面辅助函数
# ==================================================

def html_response(
    file_path: Path
):
    return FileResponse(
        path=str(file_path),
        media_type="text/html",
        headers={
            "Cache-Control":
                "no-store, no-cache, "
                "must-revalidate, max-age=0"
        }
    )


# ==================================================
# 页面路由
# ==================================================

@app.get(
    "/",
    include_in_schema=False
)
@app.get(
    "/index.html",
    include_in_schema=False
)
def homepage():
    return html_response(
        INDEX_FILE
    )


@app.get(
    "/converter",
    include_in_schema=False
)
@app.get(
    "/converter.html",
    include_in_schema=False
)
def converter_page():
    return html_response(
        CONVERTER_FILE
    )


@app.get(
    "/database",
    include_in_schema=False
)
@app.get(
    "/database.html",
    include_in_schema=False
)
def database_page():
    return html_response(
        DATABASE_FILE
    )


if COURSE_FILE.exists():

    @app.get(
        "/course",
        include_in_schema=False
    )
    @app.get(
        "/course.html",
        include_in_schema=False
    )
    def course_page():
        return html_response(
            COURSE_FILE
        )


# ==================================================
# 启动
# ==================================================

def open_browser():
    timestamp = int(
        datetime.now().timestamp()
    )

    webbrowser.open(
        f"http://127.0.0.1:8000/?v={timestamp}"
    )


if __name__ == "__main__":
    threading.Timer(
        1.2,
        open_browser
    ).start()

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )