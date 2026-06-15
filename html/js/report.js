"use strict";

const SERIES_COLORS = {
    EURUSD: "#2563eb",
    USDJPY: "#d97706",
    USDCNY: "#059669"
};

const PAIR_LABELS = {
    EURUSD: "EUR/USD",
    USDJPY: "USD/JPY",
    USDCNY: "USD/CNY"
};

const PERIOD_LABELS = {
    "7d": "近7日",
    "14d": "近14日",
    "30d": "近30日"
};

const MODEL_LABELS = {
    ollama: "Ollama · Qwen 本地模型",
    bailian: "阿里云百炼 · Qwen"
};

const state = {
    report: null,
    activePair: "all",
    generating: false
};

const elements = {};

window.addEventListener("DOMContentLoaded", init);

function init() {
    cacheElements();
    setDefaultDate();
    bindEvents();
}

function cacheElements() {
    const ids = [
        "report-date",
        "report-period",
        "base-currency",
        "model-provider",
        "refresh-data-button",
        "generate-report-button",
        "data-status-badge",
        "generation-status-panel",
        "generation-status-title",
        "generation-status-message",
        "generation-progress",
        "generation-progress-bar",
        "preview-report-date",
        "preview-report-period",
        "preview-model-name",
        "strongest-currency",
        "strongest-currency-change",
        "weakest-currency",
        "weakest-currency-change",
        "highest-volatility-pair",
        "highest-volatility-value",
        "latest-update-time",
        "main-trend-chart",
        "currency-table-body",
        "market-summary",
        "currency-analysis",
        "factor-analysis",
        "market-outlook",
        "risk-alert-list",
        "report-data-source",
        "report-generated-time",
        "export-word-button",
        "export-pdf-button"
    ];

    ids.forEach((id) => {
        elements[id] = document.getElementById(id);
    });

    elements.chartButtons = Array.from(document.querySelectorAll(".chart-filter-button"));
    elements.riskBadge = document.querySelector(".risk-level-badge");
    elements.summaryCaption = document.querySelector("#summary-title")?.closest(".report-section-heading")?.querySelector("p");
}

function bindEvents() {
    elements["generate-report-button"]?.addEventListener("click", generateReport);
    elements["refresh-data-button"]?.addEventListener("click", refreshData);
    elements["export-word-button"]?.addEventListener("click", exportWord);
    elements["export-pdf-button"]?.addEventListener("click", exportPdf);

    elements.chartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            state.activePair = button.dataset.pair || "all";
            elements.chartButtons.forEach((item) => item.classList.toggle("active", item === button));

            if (state.report) {
                renderChart(state.report.series, state.activePair);
            }
        });
    });

    elements["report-period"]?.addEventListener("change", () => {
        if (elements.summaryCaption) {
            elements.summaryCaption.textContent = `${PERIOD_LABELS[elements["report-period"].value]}主要货币表现`;
        }
        elements["preview-report-period"].textContent = PERIOD_LABELS[elements["report-period"].value];
    });
}

function setDefaultDate() {
    if (!elements["report-date"]) return;
    const today = new Date();
    elements["report-date"].value = toDateInputValue(today);
}

async function refreshData() {
    if (state.generating) return;

    updateStatus("正在检查数据源", "模拟连接本地汇率数据库……", 30, "loading");
    await sleep(420);
    updateStatus("数据已刷新", `已获得截至 ${formatDateTime(new Date())} 的最新模拟数据。`, 100, "ready");
    showToast("模拟数据库刷新完成");

    window.setTimeout(() => {
        updateStatus("等待生成日报", "配置报告参数后，点击“生成今日日报”。", 0, "ready", true);
    }, 1400);
}

async function generateReport() {
    if (state.generating) return;

    const config = readConfig();
    if (!config.reportDate) {
        showToast("请先选择报告日期");
        return;
    }

    setGenerating(true);

    try {
        const steps = [
            ["正在读取汇率数据", `提取${PERIOD_LABELS[config.period]}主要货币对记录……`, 18, 420],
            ["正在计算统计指标", "计算区间涨跌、最高价、最低价和波动率……", 42, 520],
            ["正在生成趋势图数据", "整理图表序列与日报数据表……", 63, 460],
            ["正在调用分析模型", `${MODEL_LABELS[config.model]}正在生成市场解读……`, 84, 680],
            ["正在组装报告", "填充日报内容并启用导出功能……", 96, 380]
        ];

        for (const [title, message, progress, delay] of steps) {
            updateStatus(title, message, progress, "loading");
            await sleep(delay);
        }

        state.report = buildMockReport(config);
        state.activePair = "all";
        elements.chartButtons.forEach((button) => button.classList.toggle("active", button.dataset.pair === "all"));
        renderReport(state.report);

        updateStatus("日报生成完成", `报告已于 ${state.report.generatedTime} 生成，可继续预览或导出。`, 100, "ready");
        showToast("第一版模拟汇率日报已生成");
    } catch (error) {
        console.error(error);
        updateStatus("日报生成失败", error instanceof Error ? error.message : "发生未知错误。", 100, "error");
    } finally {
        setGenerating(false);
    }
}

function readConfig() {
    return {
        reportDate: elements["report-date"]?.value || "",
        period: elements["report-period"]?.value || "7d",
        baseCurrency: elements["base-currency"]?.value || "USD",
        model: elements["model-provider"]?.value || "ollama"
    };
}

function setGenerating(value) {
    state.generating = value;
    elements["generate-report-button"].disabled = value;
    elements["refresh-data-button"].disabled = value;
    elements["generate-report-button"].textContent = value ? "正在生成……" : "生成今日日报";
}

function updateStatus(title, message, progress = 0, type = "ready", hideProgress = false) {
    const panel = elements["generation-status-panel"];
    const badge = elements["data-status-badge"];

    elements["generation-status-title"].textContent = title;
    elements["generation-status-message"].textContent = message;
    elements["generation-progress-bar"].style.width = `${Math.max(0, Math.min(100, progress))}%`;
    elements["generation-progress"].hidden = hideProgress || progress === 0;

    panel.classList.toggle("is-loading", type === "loading");
    badge.className = "status-badge";

    if (type === "loading") {
        badge.classList.add("status-loading");
        badge.textContent = "生成中";
    } else if (type === "error") {
        badge.classList.add("status-error");
        badge.textContent = "生成失败";
    } else {
        badge.classList.add("status-ready");
        badge.textContent = title.includes("完成") ? "报告已生成" : "数据已就绪";
    }
}

function buildMockReport(config) {
    const dayCount = Number.parseInt(config.period, 10) || 7;
    const dates = buildDateRange(config.reportDate, dayCount);
    const seed = hashString(`${config.reportDate}-${config.period}-${config.baseCurrency}`);

    const definitions = {
        EURUSD: { start: 1.0832, drift: 0.00065, noise: 0.0028, decimals: 4 },
        USDJPY: { start: 155.18, drift: -0.09, noise: 0.42, decimals: 2 },
        USDCNY: { start: 7.2468, drift: -0.0018, noise: 0.0105, decimals: 4 }
    };

    const series = {};
    Object.entries(definitions).forEach(([pair, definition], index) => {
        series[pair] = generateSeries(dates, definition, seed + index * 101);
    });

    const rows = Object.entries(series).map(([pair, values]) => summarizePair(pair, values));
    const strongest = [...rows].sort((a, b) => b.changePct - a.changePct)[0];
    const weakest = [...rows].sort((a, b) => a.changePct - b.changePct)[0];
    const mostVolatile = [...rows].sort((a, b) => b.volatility - a.volatility)[0];
    const generatedTime = formatDateTime(new Date());

    const riskScore = mostVolatile.volatility > 0.7 ? "high" : mostVolatile.volatility > 0.35 ? "medium" : "low";

    return {
        config,
        series,
        rows,
        generatedTime,
        summary: {
            strongestCurrency: strongest.pair.split("/")[0],
            strongestChange: strongest.changePct,
            weakestCurrency: weakest.changePct < 0 ? weakest.pair.split("/")[0] : weakest.pair.split("/")[1],
            weakestChange: weakest.changePct,
            highestVolatilityPair: mostVolatile.pair,
            highestVolatility: mostVolatile.volatility,
            latestUpdate: `${config.reportDate} 18:00`
        },
        analysis: buildAnalysis(rows, strongest, weakest, mostVolatile, config),
        risk: buildRisks(rows, mostVolatile, riskScore),
        riskScore
    };
}

function generateSeries(dates, definition, seed) {
    const random = seededRandom(seed);
    let value = definition.start;

    return dates.map((date, index) => {
        const cycle = Math.sin((index + seed % 7) / 2.1) * definition.noise * 0.38;
        const shock = (random() - 0.5) * definition.noise;
        value += definition.drift + cycle + shock;
        value = Math.max(0.0001, value);

        return {
            date,
            value: Number(value.toFixed(definition.decimals))
        };
    });
}

function summarizePair(pairCode, values) {
    const numbers = values.map((item) => item.value);
    const first = numbers[0];
    const latest = numbers[numbers.length - 1];
    const high = Math.max(...numbers);
    const low = Math.min(...numbers);
    const changePct = ((latest - first) / first) * 100;
    const returns = [];

    for (let index = 1; index < numbers.length; index += 1) {
        returns.push((numbers[index] - numbers[index - 1]) / numbers[index - 1]);
    }

    const volatility = standardDeviation(returns) * Math.sqrt(Math.max(returns.length, 1)) * 100;

    return {
        pairCode,
        pair: PAIR_LABELS[pairCode],
        latest,
        high,
        low,
        changePct,
        volatility,
        trend: changePct > 0.08 ? "up" : changePct < -0.08 ? "down" : "flat"
    };
}

function buildAnalysis(rows, strongest, weakest, mostVolatile, config) {
    const periodText = PERIOD_LABELS[config.period];
    const modelText = MODEL_LABELS[config.model];
    const rising = rows.filter((row) => row.changePct > 0).map((row) => row.pair);
    const falling = rows.filter((row) => row.changePct < 0).map((row) => row.pair);

    return {
        marketSummary: `${periodText}主要货币对呈现分化走势。${rising.length ? `${rising.join("、")}区间收涨` : "主要货币对未出现明显上涨"}；${falling.length ? `${falling.join("、")}区间承压` : "下跌货币对数量有限"}。整体波动仍处于可监控范围，但不同货币对的节奏存在明显差异。`,
        currencyAnalysis: `${strongest.pair}录得${formatSignedPercent(strongest.changePct)}，是本期表现相对较强的货币对；${weakest.pair}录得${formatSignedPercent(weakest.changePct)}。${mostVolatile.pair}的估算波动率为${mostVolatile.volatility.toFixed(2)}%，短期价格变化更值得持续观察。`,
        factorAnalysis: `本版为前端模拟报告，影响因素文字由预设模板生成。正式接入${modelText}后，可将统计摘要、宏观事件、利率预期和风险偏好变化一并传入模型，生成有数据依据的归因分析。`,
        marketOutlook: `下一阶段建议重点跟踪${mostVolatile.pair}的区间突破情况，同时关注${strongest.pair}能否延续当前方向。业务端可结合结算币种、应收应付期限和预算汇率设置分级预警。`
    };
}

function buildRisks(rows, mostVolatile, riskScore) {
    const alerts = [];
    const biggestMove = [...rows].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))[0];

    alerts.push(`${mostVolatile.pair}为本期波动最高货币对，估算波动率为 ${mostVolatile.volatility.toFixed(2)}%，建议提高监测频率。`);
    alerts.push(`${biggestMove.pair}区间变动为 ${formatSignedPercent(biggestMove.changePct)}，涉及该币种的短期收付款应核对预算汇率偏差。`);

    if (riskScore === "high") {
        alerts.push("当前模拟指标触发高波动阈值，可考虑增加情景测算、敞口拆分和止损预警。 ");
    } else if (riskScore === "medium") {
        alerts.push("当前波动处于中等区间，建议结合未来一周资金计划持续观察。 ");
    } else {
        alerts.push("当前波动水平相对温和，但仍应关注突发政策和宏观数据造成的跳变风险。 ");
    }

    return alerts;
}

function renderReport(report) {
    const { config, summary, rows, analysis, risk } = report;

    elements["preview-report-date"].textContent = formatDateCN(config.reportDate);
    elements["preview-report-period"].textContent = PERIOD_LABELS[config.period];
    elements["preview-model-name"].textContent = MODEL_LABELS[config.model];

    elements["strongest-currency"].textContent = summary.strongestCurrency;
    setMetricChange(elements["strongest-currency-change"], summary.strongestChange);

    elements["weakest-currency"].textContent = summary.weakestCurrency;
    setMetricChange(elements["weakest-currency-change"], summary.weakestChange);

    elements["highest-volatility-pair"].textContent = summary.highestVolatilityPair;
    elements["highest-volatility-value"].textContent = `${summary.highestVolatility.toFixed(2)}%`;
    elements["highest-volatility-value"].className = "metric-change neutral";
    elements["latest-update-time"].textContent = summary.latestUpdate;

    if (elements.summaryCaption) {
        elements.summaryCaption.textContent = `${PERIOD_LABELS[config.period]}主要货币表现`;
    }

    renderChart(report.series, state.activePair);
    renderTable(rows);
    renderAnalysis(analysis);
    renderRisk(risk, report.riskScore);

    elements["report-data-source"].textContent = "前端模拟数据（后续替换为 SQLite / FastAPI）";
    elements["report-generated-time"].textContent = report.generatedTime;
    elements["export-word-button"].disabled = false;
    elements["export-pdf-button"].disabled = false;
}

function setMetricChange(element, value) {
    element.textContent = formatSignedPercent(value);
    element.className = `metric-change ${value > 0 ? "positive" : value < 0 ? "negative" : "neutral"}`;
}

function renderTable(rows) {
    elements["currency-table-body"].innerHTML = rows.map((row) => {
        const decimals = row.pairCode === "USDJPY" ? 2 : 4;
        const changeClass = row.changePct > 0 ? "change-positive" : row.changePct < 0 ? "change-negative" : "change-neutral";
        const trendInfo = {
            up: ["trend-up", "上涨 ↑"],
            down: ["trend-down", "下跌 ↓"],
            flat: ["trend-flat", "震荡 →"]
        }[row.trend];

        return `
            <tr>
                <td>
                    <span class="pair-cell">
                        <span class="pair-dot" style="background:${SERIES_COLORS[row.pairCode]}"></span>
                        ${row.pair}
                    </span>
                </td>
                <td>${row.latest.toFixed(decimals)}</td>
                <td>${row.high.toFixed(decimals)}</td>
                <td>${row.low.toFixed(decimals)}</td>
                <td class="${changeClass}">${formatSignedPercent(row.changePct)}</td>
                <td>${row.volatility.toFixed(2)}%</td>
                <td><span class="trend-pill ${trendInfo[0]}">${trendInfo[1]}</span></td>
            </tr>
        `;
    }).join("");
}

function renderAnalysis(analysis) {
    elements["market-summary"].innerHTML = `<p>${escapeHtml(analysis.marketSummary)}</p>`;
    elements["currency-analysis"].innerHTML = `<p>${escapeHtml(analysis.currencyAnalysis)}</p>`;
    elements["factor-analysis"].innerHTML = `<p>${escapeHtml(analysis.factorAnalysis)}</p>`;
    elements["market-outlook"].innerHTML = `<p>${escapeHtml(analysis.marketOutlook)}</p>`;
}

function renderRisk(alerts, riskScore) {
    elements["risk-alert-list"].innerHTML = alerts.map((alert) => `<li>${escapeHtml(alert)}</li>`).join("");

    const labels = {
        low: "低风险",
        medium: "中等风险",
        high: "较高风险"
    };

    elements.riskBadge.textContent = labels[riskScore];
    elements.riskBadge.className = `risk-level-badge level-${riskScore}`;
}

function renderChart(series, selectedPair = "all") {
    const host = elements["main-trend-chart"];
    const pairCodes = selectedPair === "all" ? Object.keys(series) : [selectedPair];

    if (!pairCodes.length) {
        host.innerHTML = '<div class="empty-state"><strong>暂无图表数据</strong></div>';
        return;
    }

    const width = 1040;
    const height = 350;
    const margin = { top: 50, right: 34, bottom: 46, left: 58 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const pointCount = series[pairCodes[0]].length;

    const normalized = {};
    pairCodes.forEach((pairCode) => {
        const first = series[pairCode][0].value;
        normalized[pairCode] = series[pairCode].map((item) => ({
            ...item,
            normalized: (item.value / first) * 100
        }));
    });

    const allValues = pairCodes.flatMap((pairCode) => normalized[pairCode].map((item) => item.normalized));
    let minY = Math.min(...allValues);
    let maxY = Math.max(...allValues);
    const rangePadding = Math.max((maxY - minY) * 0.18, 0.18);
    minY -= rangePadding;
    maxY += rangePadding;

    const xScale = (index) => margin.left + (pointCount === 1 ? 0 : (index / (pointCount - 1)) * plotWidth);
    const yScale = (value) => margin.top + ((maxY - value) / (maxY - minY || 1)) * plotHeight;

    const yTicks = Array.from({ length: 5 }, (_, index) => maxY - (index / 4) * (maxY - minY));
    const maxXTicks = Math.min(pointCount, 7);
    const xIndexes = Array.from({ length: maxXTicks }, (_, index) => Math.round((index / Math.max(maxXTicks - 1, 1)) * (pointCount - 1)));

    const grid = yTicks.map((tick) => {
        const y = yScale(tick);
        return `
            <line class="chart-grid-line" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>
            <text class="chart-axis-label" x="${margin.left - 10}" y="${y + 4}" text-anchor="end">${tick.toFixed(2)}</text>
        `;
    }).join("");

    const xLabels = xIndexes.map((index) => {
        const item = series[pairCodes[0]][index];
        return `<text class="chart-axis-label" x="${xScale(index)}" y="${height - 14}" text-anchor="middle">${formatChartDate(item.date)}</text>`;
    }).join("");

    const paths = pairCodes.map((pairCode) => {
        const points = normalized[pairCode];
        const path = points.map((item, index) => `${index === 0 ? "M" : "L"} ${xScale(index).toFixed(2)} ${yScale(item.normalized).toFixed(2)}`).join(" ");
        const circles = points.map((item, index) => `
            <circle
                class="chart-point"
                cx="${xScale(index)}"
                cy="${yScale(item.normalized)}"
                r="4.5"
                fill="${SERIES_COLORS[pairCode]}"
                data-pair="${pairCode}"
                data-date="${item.date}"
                data-value="${item.value}"
                tabindex="0"
            ></circle>
        `).join("");

        return `
            <path class="chart-path" d="${path}" stroke="${SERIES_COLORS[pairCode]}"></path>
            ${circles}
        `;
    }).join("");

    const legend = pairCodes.map((pairCode, index) => {
        const x = margin.left + index * 142;
        return `
            <circle cx="${x}" cy="22" r="5" fill="${SERIES_COLORS[pairCode]}"></circle>
            <text class="chart-legend-text" x="${x + 10}" y="26">${PAIR_LABELS[pairCode]}</text>
        `;
    }).join("");

    host.innerHTML = `
        <svg class="fx-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="主要货币对标准化趋势图">
            ${legend}
            ${grid}
            ${xLabels}
            ${paths}
            <text class="chart-axis-label" x="${margin.left}" y="${margin.top - 12}">期初 = 100</text>
        </svg>
        <div class="chart-tooltip" id="chart-tooltip"></div>
    `;

    bindChartTooltip(host);
}

function bindChartTooltip(host) {
    const tooltip = host.querySelector("#chart-tooltip");
    const points = host.querySelectorAll(".chart-point");

    const show = (point) => {
        const hostRect = host.getBoundingClientRect();
        const pointRect = point.getBoundingClientRect();
        const pairCode = point.dataset.pair;
        const decimals = pairCode === "USDJPY" ? 2 : 4;

        tooltip.innerHTML = `<strong>${PAIR_LABELS[pairCode]}</strong><br>${formatDateCN(point.dataset.date)}<br>汇率：${Number(point.dataset.value).toFixed(decimals)}`;
        tooltip.style.left = `${pointRect.left - hostRect.left + pointRect.width / 2}px`;
        tooltip.style.top = `${pointRect.top - hostRect.top}px`;
        tooltip.classList.add("visible");
    };

    const hide = () => tooltip.classList.remove("visible");

    points.forEach((point) => {
        point.addEventListener("mouseenter", () => show(point));
        point.addEventListener("mouseleave", hide);
        point.addEventListener("focus", () => show(point));
        point.addEventListener("blur", hide);
    });
}

function exportWord() {
    if (!state.report) return;

    const reportNode = document.getElementById("report-preview");
    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
        .map((node) => node.outerHTML)
        .join("\n");

    const documentHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>汇率日报-${state.report.config.reportDate}</title>
            ${styles}
            <style>
                body { background: #fff; padding: 24px; }
                .report-preview { max-width: 1100px; margin: 0 auto; }
            </style>
        </head>
        <body>${reportNode.outerHTML}</body>
        </html>
    `;

    const blob = new Blob(["\ufeff", documentHtml], { type: "application/msword" });
    downloadBlob(blob, `汇率日报-${state.report.config.reportDate}.doc`);
    showToast("Word 兼容文档已开始下载");
}

function exportPdf() {
    if (!state.report) return;
    showToast("请在打印窗口中选择“另存为 PDF”");
    window.setTimeout(() => window.print(), 180);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function buildDateRange(endDateString, dayCount) {
    const end = new Date(`${endDateString}T12:00:00`);
    return Array.from({ length: dayCount }, (_, index) => {
        const date = new Date(end);
        date.setDate(end.getDate() - (dayCount - index - 1));
        return toDateInputValue(date);
    });
}

function standardDeviation(values) {
    if (!values.length) return 0;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
    return Math.sqrt(variance);
}

function seededRandom(seed) {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;

    return () => {
        value = (value * 16807) % 2147483647;
        return (value - 1) / 2147483646;
    };
}

function hashString(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
}

function formatSignedPercent(value) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
}

function formatDateCN(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

function formatChartDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(date);
}

function toDateInputValue(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function sleep(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
