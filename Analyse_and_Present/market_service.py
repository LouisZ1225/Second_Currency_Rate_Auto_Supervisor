from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from Analyse_and_Present.calculate_exchange import get_rate


CHINA_TIMEZONE = ZoneInfo("Asia/Shanghai")


def safe_get_rate(
    query_date,
    base: str,
    target: str
):
    """
    安全查询某一天的汇率。
    查询失败或没有数据时返回 None。
    """

    base = base.upper()
    target = target.upper()

    if base == target:
        return 1.0

    date_string = query_date.isoformat()

    try:
        rate = get_rate(
            date_string,
            base,
            target
        )

    except Exception as exc:
        print(
            "[safe_get_rate 查询失败]",
            date_string,
            base,
            target,
            repr(exc)
        )
        return None

    if rate is None:
        return None

    try:
        return float(rate)

    except (TypeError, ValueError):
        return None


def find_latest_records(
    base: str,
    target: str,
    record_count: int = 2,
    lookback_days: int = 45
):
    """
    查找最近若干条有效数据。

    不能直接查询今天和昨天，因为周末、
    节假日可能没有汇率数据。
    """

    today = datetime.now(
        CHINA_TIMEZONE
    ).date()

    records = []

    for offset in range(
        lookback_days + 1
    ):
        query_date = (
            today
            - timedelta(days=offset)
        )

        rate = safe_get_rate(
            query_date,
            base,
            target
        )

        if rate is None:
            continue

        records.append(
            {
                "date": query_date.isoformat(),
                "rate": rate
            }
        )

        if len(records) >= record_count:
            break

    return records


def build_market_overview(
    pairs: list[tuple[str, str]]
):
    """
    生成首页市场行情数据。
    """

    items = []
    available_dates = []

    for base, target in pairs:
        records = find_latest_records(
            base=base,
            target=target,
            record_count=2
        )

        if not records:
            continue

        latest = records[0]

        previous = (
            records[1]
            if len(records) > 1
            else records[0]
        )

        latest_rate = latest["rate"]
        previous_rate = previous["rate"]

        change = (
            latest_rate
            - previous_rate
        )

        if previous_rate:
            change_pct = (
                change
                / previous_rate
                * 100
            )
        else:
            change_pct = 0.0

        items.append(
            {
                "base": base,
                "target": target,
                "rate": latest_rate,
                "previous_rate": previous_rate,
                "change": change,
                "change_pct": change_pct,
                "date": latest["date"],
                "previous_date": previous["date"]
            }
        )

        available_dates.append(
            latest["date"]
        )

    return {
        "updated_at": (
            max(available_dates)
            if available_dates
            else None
        ),
        "items": items
    }


def build_rate_history(
    base: str,
    target: str,
    days: int
):
    """
    生成指定货币对的历史趋势数据。
    """

    today = datetime.now(
        CHINA_TIMEZONE
    ).date()

    start_date = (
        today
        - timedelta(days=days - 1)
    )

    data = []

    for offset in range(days):
        query_date = (
            start_date
            + timedelta(days=offset)
        )

        rate = safe_get_rate(
            query_date,
            base,
            target
        )

        if rate is None:
            continue

        data.append(
            {
                "date": query_date.isoformat(),
                "rate": rate
            }
        )

    return data