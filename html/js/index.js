"use strict";


/* ==============================
   页面状态
   ============================== */

const dashboardState = {
    marketItems: [],
    selectedBase: "USD",
    selectedTarget: "CNY",
    selectedDays: 30,
    chart: null
};


/* ==============================
   DOM 元素
   ============================== */

const marketCards =
    document.getElementById("market-cards");

const ratesTableBody =
    document.getElementById("rates-table-body");

const updateTime =
    document.getElementById("update-time");

const pairSelector =
    document.getElementById("pair-selector");

const periodButtons =
    document.getElementById("period-buttons");

const chartTitle =
    document.getElementById("chart-title");

const chartLoading =
    document.getElementById("chart-loading");

const chartElement =
    document.getElementById("rate-chart");

const pairSearch =
    document.getElementById("pair-search");

const refreshButton =
    document.getElementById("refresh-button");

const moversList =
    document.getElementById("movers-list");


/* ==============================
   通用工具函数
   ============================== */

async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        let errorMessage =
            `请求失败：HTTP ${response.status}`;

        try {
            const errorData = await response.json();

            if (errorData.detail) {
                errorMessage =
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : JSON.stringify(errorData.detail);
            }

        } catch {
            // 返回内容不是 JSON 时保留默认错误信息
        }

        throw new Error(errorMessage);
    }

    return response.json();
}


function toNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function formatRate(value) {
    const number = toNumber(value);

    if (Math.abs(number) >= 100) {
        return number.toFixed(2);
    }

    if (Math.abs(number) >= 1) {
        return number.toFixed(4);
    }

    return number.toFixed(6);
}


function formatChange(value) {
    const number = toNumber(value);

    const prefix =
        number > 0
            ? "+"
            : "";

    return `${prefix}${number.toFixed(4)}`;
}


function formatPercent(value) {
    const number = toNumber(value);

    const prefix =
        number > 0
            ? "+"
            : "";

    return `${prefix}${number.toFixed(2)}%`;
}


function getDirectionClass(value) {
    const number = toNumber(value);

    if (number > 0) {
        return "positive";
    }

    if (number < 0) {
        return "negative";
    }

    return "neutral";
}


function getDirectionSymbol(value) {
    const number = toNumber(value);

    if (number > 0) {
        return "▲";
    }

    if (number < 0) {
        return "▼";
    }

    return "—";
}


function normalizeMarketResponse(payload) {
    /*
        后端可以返回：

        形式一：
        [
            {...},
            {...}
        ]

        或形式二：
        {
            "updated_at": "...",
            "items": [...]
        }

        这里对两种形式都兼容。
    */

    if (Array.isArray(payload)) {
        return {
            updatedAt: null,
            items: payload
        };
    }

    return {
        updatedAt:
            payload.updated_at
            ?? payload.update_time
            ?? payload.date
            ?? null,

        items:
            payload.items
            ?? payload.data
            ?? payload.rates
            ?? []
    };
}


function normalizeMarketItem(item) {
    const rate =
        toNumber(
            item.rate
            ?? item.latest_rate
            ?? item.latest
        );

    const previousRate =
        toNumber(
            item.previous_rate
            ?? item.previous
            ?? item.prev_rate
        );

    let change =
        item.change !== undefined
            ? toNumber(item.change)
            : rate - previousRate;

    let changePct =
        item.change_pct !== undefined
            ? toNumber(item.change_pct)
            : (
                previousRate !== 0
                    ? change / previousRate * 100
                    : 0
            );

    return {
        base:
            String(
                item.base
                ?? item.base_currency
                ?? ""
            ).toUpperCase(),

        target:
            String(
                item.target
                ?? item.target_currency
                ?? ""
            ).toUpperCase(),

        rate,
        previousRate,
        change,
        changePct,

        date:
            item.date
            ?? item.rate_date
            ?? item.quoted_at
            ?? "--"
    };
}


function formatUpdateTime(value) {
    if (!value) {
        return "已获取数据库中的最新有效汇率";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return `数据更新时间：${value}`;
    }

    return `数据更新时间：${parsedDate.toLocaleString(
        "zh-CN",
        {
            hour12: false
        }
    )}`;
}


/* ==============================
   加载市场概览
   ============================== */

async function loadMarketOverview() {
    setRefreshLoading(true);

    marketCards.innerHTML = `
        <div class="loading-card">
            正在加载市场行情……
        </div>
    `;

    ratesTableBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="table-message"
            >
                正在加载汇率数据……
            </td>
        </tr>
    `;

    try {
        const payload = await fetchJSON(
            "/api/market/overview"
        );

        const normalized =
            normalizeMarketResponse(payload);

        const items =
            normalized.items
                .map(normalizeMarketItem)
                .filter(item => {
                    return item.base && item.target;
                });

        if (items.length === 0) {
            throw new Error(
                "接口没有返回有效的货币行情"
            );
        }

        dashboardState.marketItems = items;

        updateTime.textContent =
            formatUpdateTime(normalized.updatedAt);

        renderMarketCards(items);
        renderMarketSummary(items);
        renderMovers(items);
        renderRatesTable(items);

        ensureSelectedPairExists(items);

    } catch (error) {
        console.error(error);

        marketCards.innerHTML = `
            <div class="loading-card">
                市场行情加载失败：
                ${escapeHTML(error.message)}
            </div>
        `;

        ratesTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="table-message"
                >
                    数据加载失败：
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        updateTime.textContent =
            "无法连接市场概览接口";

    } finally {
        setRefreshLoading(false);
    }
}


function setRefreshLoading(isLoading) {
    refreshButton.disabled = isLoading;

    refreshButton.textContent =
        isLoading
            ? "刷新中……"
            : "刷新数据";
}


/* ==============================
   行情卡片
   ============================== */

function renderMarketCards(items) {
    marketCards.innerHTML = "";

    items.forEach(item => {
        const card =
            document.createElement("article");

        const pair =
            `${item.base}-${item.target}`;

        const directionClass =
            getDirectionClass(item.changePct);

        const directionSymbol =
            getDirectionSymbol(item.changePct);

        const selectedPair =
            `${dashboardState.selectedBase}-` +
            `${dashboardState.selectedTarget}`;

        card.className =
            pair === selectedPair
                ? "market-card selected"
                : "market-card";

        card.dataset.base = item.base;
        card.dataset.target = item.target;

        card.innerHTML = `
            <div class="card-top">
                <span class="pair-name">
                    ${escapeHTML(item.base)}/
                    ${escapeHTML(item.target)}
                </span>

                <span class="pair-date">
                    ${escapeHTML(item.date)}
                </span>
            </div>

            <div class="rate-value">
                ${formatRate(item.rate)}
            </div>

            <div class="rate-change ${directionClass}">
                <span>${directionSymbol}</span>

                <span>
                    ${formatChange(item.change)}
                </span>

                <span>
                    ${formatPercent(item.changePct)}
                </span>
            </div>
        `;

        card.addEventListener("click", () => {
            selectPair(
                item.base,
                item.target
            );
        });

        marketCards.appendChild(card);
    });
}


function updateSelectedCard() {
    const cards =
        document.querySelectorAll(".market-card");

    const selectedPair =
        `${dashboardState.selectedBase}-` +
        `${dashboardState.selectedTarget}`;

    cards.forEach(card => {
        const pair =
            `${card.dataset.base}-` +
            `${card.dataset.target}`;

        card.classList.toggle(
            "selected",
            pair === selectedPair
        );
    });
}


/* ==============================
   市场摘要
   ============================== */

function renderMarketSummary(items) {
    const gainers =
        items.filter(item => item.changePct > 0);

    const losers =
        items.filter(item => item.changePct < 0);

    const sorted =
        [...items].sort(
            (a, b) =>
                b.changePct - a.changePct
        );

    const maxGainer = sorted[0];
    const maxLoser = sorted[sorted.length - 1];

    document.getElementById(
        "pair-count"
    ).textContent = items.length;

    document.getElementById(
        "gainer-count"
    ).textContent = gainers.length;

    document.getElementById(
        "loser-count"
    ).textContent = losers.length;

    document.getElementById(
        "max-gainer"
    ).textContent =
        maxGainer
            ? `${maxGainer.base}/${maxGainer.target} ` +
              `${formatPercent(maxGainer.changePct)}`
            : "--";

    document.getElementById(
        "max-loser"
    ).textContent =
        maxLoser
            ? `${maxLoser.base}/${maxLoser.target} ` +
              `${formatPercent(maxLoser.changePct)}`
            : "--";
}


/* ==============================
   涨跌排行
   ============================== */

function renderMovers(items) {
    const sorted =
        [...items].sort(
            (a, b) =>
                Math.abs(b.changePct)
                - Math.abs(a.changePct)
        );

    const topMovers = sorted.slice(0, 6);

    if (topMovers.length === 0) {
        moversList.innerHTML = `
            <p class="empty-message">
                暂无涨跌数据
            </p>
        `;

        return;
    }

    moversList.innerHTML = "";

    topMovers.forEach(item => {
        const row =
            document.createElement("div");

        const directionClass =
            item.changePct >= 0
                ? "positive-text"
                : "negative-text";

        row.className = "mover-item";

        row.innerHTML = `
            <span class="mover-name">
                ${escapeHTML(item.base)}/
                ${escapeHTML(item.target)}
            </span>

            <span
                class="mover-change ${directionClass}"
            >
                ${formatPercent(item.changePct)}
            </span>
        `;

        row.addEventListener("click", () => {
            selectPair(
                item.base,
                item.target
            );
        });

        moversList.appendChild(row);
    });
}


/* ==============================
   行情表格
   ============================== */

function renderRatesTable(items) {
    if (items.length === 0) {
        ratesTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="table-message"
                >
                    没有符合条件的数据
                </td>
            </tr>
        `;

        return;
    }

    ratesTableBody.innerHTML = "";

    items.forEach(item => {
        const row =
            document.createElement("tr");

        const directionClass =
            item.changePct >= 0
                ? "positive-text"
                : "negative-text";

        row.innerHTML = `
            <td class="table-pair">
                ${escapeHTML(item.base)}/
                ${escapeHTML(item.target)}
            </td>

            <td>
                ${formatRate(item.rate)}
            </td>

            <td>
                ${formatRate(item.previousRate)}
            </td>

            <td class="${directionClass}">
                ${formatChange(item.change)}
            </td>

            <td class="${directionClass}">
                ${formatPercent(item.changePct)}
            </td>

            <td>
                ${escapeHTML(item.date)}
            </td>
        `;

        row.addEventListener("click", () => {
            selectPair(
                item.base,
                item.target
            );
        });

        ratesTableBody.appendChild(row);
    });
}


/* ==============================
   历史趋势图
   ============================== */

async function loadRateHistory() {
    const {
        selectedBase,
        selectedTarget,
        selectedDays
    } = dashboardState;

    chartTitle.textContent =
        `${selectedBase}/${selectedTarget} 汇率趋势`;

    chartLoading.style.display = "flex";
    chartElement.style.display = "none";

    try {
        const query =
            new URLSearchParams({
                base: selectedBase,
                target: selectedTarget,
                days: String(selectedDays)
            });

        const payload = await fetchJSON(
            `/api/rate/history?${query.toString()}`
        );

        const historyData =
            normalizeHistoryResponse(payload);

        if (historyData.length === 0) {
            throw new Error(
                "该货币对暂无历史数据"
            );
        }

        renderRateChart(historyData);

    } catch (error) {
        console.error(error);

        chartLoading.textContent =
            `趋势数据加载失败：${error.message}`;

        chartLoading.style.display = "flex";
        chartElement.style.display = "none";
    }
}


function normalizeHistoryResponse(payload) {
    let data;

    if (Array.isArray(payload)) {
        data = payload;
    } else {
        data =
            payload.data
            ?? payload.items
            ?? payload.history
            ?? [];
    }

    return data
        .map(item => ({
            date:
                item.date
                ?? item.rate_date
                ?? item.time,

            rate:
                toNumber(
                    item.rate
                    ?? item.value
                    ?? item.close
                )
        }))
        .filter(item => {
            return item.date
                && Number.isFinite(item.rate);
        })
        .sort((a, b) => {
            return new Date(a.date)
                - new Date(b.date);
        });
}


function renderRateChart(data) {
    chartLoading.style.display = "none";
    chartElement.style.display = "block";

    if (!dashboardState.chart) {
        dashboardState.chart =
            echarts.init(chartElement);
    }

    const dates =
        data.map(item => item.date);

    const rates =
        data.map(item => item.rate);

    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    const padding =
        Math.max(
            (maxRate - minRate) * 0.15,
            Math.abs(maxRate) * 0.002
        );

    const option = {
        animationDuration: 500,

        tooltip: {
            trigger: "axis",

            formatter(params) {
                const point = params[0];

                return `
                    <strong>
                        ${point.axisValue}
                    </strong>
                    <br>
                    ${dashboardState.selectedBase}/
                    ${dashboardState.selectedTarget}：
                    ${formatRate(point.data)}
                `;
            }
        },

        grid: {
            left: 58,
            right: 22,
            top: 24,
            bottom: 48
        },

        xAxis: {
            type: "category",
            boundaryGap: false,
            data: dates,

            axisLine: {
                lineStyle: {
                    color: "#d0d5dd"
                }
            },

            axisLabel: {
                color: "#667085",
                hideOverlap: true
            }
        },

        yAxis: {
            type: "value",

            min: minRate - padding,
            max: maxRate + padding,

            axisLabel: {
                color: "#667085",

                formatter(value) {
                    return formatRate(value);
                }
            },

            splitLine: {
                lineStyle: {
                    color: "#eef0f4"
                }
            }
        },

        series: [
            {
                name:
                    `${dashboardState.selectedBase}/` +
                    `${dashboardState.selectedTarget}`,

                type: "line",
                smooth: true,
                symbol: "circle",
                showSymbol: false,

                lineStyle: {
                    width: 3,
                    color: "#4b63f3"
                },

                itemStyle: {
                    color: "#4b63f3"
                },

                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,

                        colorStops: [
                            {
                                offset: 0,
                                color:
                                    "rgba(75, 99, 243, 0.30)"
                            },
                            {
                                offset: 1,
                                color:
                                    "rgba(75, 99, 243, 0.02)"
                            }
                        ]
                    }
                },

                data: rates
            }
        ]
    };

    dashboardState.chart.setOption(
        option,
        true
    );
}


/* ==============================
   货币对切换
   ============================== */

function selectPair(base, target) {
    dashboardState.selectedBase = base;
    dashboardState.selectedTarget = target;

    const selectValue =
        `${base}-${target}`;

    const optionExists =
        [...pairSelector.options]
            .some(option => {
                return option.value === selectValue;
            });

    if (!optionExists) {
        const option =
            document.createElement("option");

        option.value = selectValue;
        option.textContent =
            `${base}/${target}`;

        pairSelector.appendChild(option);
    }

    pairSelector.value = selectValue;

    updateSelectedCard();
    loadRateHistory();
}


function ensureSelectedPairExists(items) {
    const selectedExists =
        items.some(item => {
            return (
                item.base
                    === dashboardState.selectedBase
                &&
                item.target
                    === dashboardState.selectedTarget
            );
        });

    if (!selectedExists && items.length > 0) {
        dashboardState.selectedBase =
            items[0].base;

        dashboardState.selectedTarget =
            items[0].target;
    }

    selectPair(
        dashboardState.selectedBase,
        dashboardState.selectedTarget
    );
}


/* ==============================
   搜索和交互事件
   ============================== */

pairSearch.addEventListener(
    "input",
    event => {
        const keyword =
            event.target.value
                .trim()
                .toUpperCase();

        if (!keyword) {
            renderRatesTable(
                dashboardState.marketItems
            );

            return;
        }

        const filtered =
            dashboardState.marketItems.filter(
                item => {
                    const pair =
                        `${item.base}/${item.target}`;

                    return pair.includes(keyword)
                        || item.base.includes(keyword)
                        || item.target.includes(keyword);
                }
            );

        renderRatesTable(filtered);
    }
);


pairSelector.addEventListener(
    "change",
    event => {
        const [base, target] =
            event.target.value.split("-");

        selectPair(base, target);
    }
);


periodButtons.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                "button[data-days]"
            );

        if (!button) {
            return;
        }

        const days =
            Number(button.dataset.days);

        dashboardState.selectedDays = days;

        periodButtons
            .querySelectorAll("button")
            .forEach(item => {
                item.classList.toggle(
                    "active",
                    item === button
                );
            });

        loadRateHistory();
    }
);


refreshButton.addEventListener(
    "click",
    async () => {
        await loadMarketOverview();
    }
);


window.addEventListener(
    "resize",
    () => {
        if (dashboardState.chart) {
            dashboardState.chart.resize();
        }
    }
);


/* ==============================
   基础安全处理
   ============================== */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ==============================
   页面初始化
   ============================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        await loadMarketOverview();
    }
);