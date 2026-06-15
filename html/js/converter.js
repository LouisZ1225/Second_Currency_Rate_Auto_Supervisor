// ===== 货币配置 =====

const CURRENCY_META = {
    USD: { name: "美元"},
    EUR: { name: "欧元"},
    GBP: { name: "英镑"},
    AUD: { name: "澳元"},
    CAD: { name: "加拿大元"},

    CNY: { name: "人民币"},
    JPY: { name: "日元"},
    KRW: { name: "韩元"},
    HKD: { name: "港元"},
    TWD: { name: "新台币"},
    RUB: { name: "俄罗斯卢布"},
    VND: { name: "越南盾"},
    THB: { name: "泰铢"},
    MMK: { name: "缅甸元"},
    SGD: { name: "新加坡元"},
    MYR: { name: "马来西亚林吉特"},
    INR: { name: "印度卢比"},
    PKR: { name: "巴基斯坦卢比"},
    IDR: { name: "印尼盾"},

    AED: { name: "阿联酋迪拉姆"},
    SAR: { name: "沙特里亚尔"},
    OMR: { name: "阿曼里亚尔"},
    QAR: { name: "卡塔尔里亚尔"},
    BHD: { name: "巴林第纳尔"},

    BRL: { name: "巴西雷亚尔"},
    ARS: { name: "阿根廷比索"},
    CUP: { name: "古巴比索"},
    CLP: { name: "智利比索"},
    PEN: { name: "秘鲁索尔"},

    KES: { name: "肯尼亚先令"},
    NGN: { name: "尼日利亚奈拉"},
    EGP: { name: "埃及镑"},
    TND: { name: "突尼斯第纳尔"},
    CDF: { name: "刚果法郎"},
    DZD: { name: "阿尔及利亚第纳尔"},
    BIF: { name: "布隆迪法郎"},
    GHS: { name: "加纳塞地"},
    SDG: { name: "苏丹镑"},
    TZS: { name: "坦桑尼亚先令"},
    UGX: { name: "乌干达先令"},
    AOA: { name: "安哥拉宽扎"},
    BWP: { name: "博茨瓦纳普拉"},
    ZAR: { name: "南非兰特"}
};


// ===== 获取页面元素 =====

const dateInput =
    document.getElementById("query-date");

const baseSelect =
    document.getElementById("base-currency");

const targetSelect =
    document.getElementById("target-currency");

const queryButton =
    document.getElementById("query-button");

const swapButton =
    document.getElementById("swap-button");

const messageBox =
    document.getElementById("message-box");

const resultPanel =
    document.getElementById("result-panel");


// ===== 获取北京时间日期 =====

function getChinaToday() {
    const formatter = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Asia/Shanghai",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    );

    const parts = formatter.formatToParts(new Date());

    const year = parts.find(
        part => part.type === "year"
    ).value;

    const month = parts.find(
        part => part.type === "month"
    ).value;

    const day = parts.find(
        part => part.type === "day"
    ).value;

    return `${year}-${month}-${day}`;
}


// ===== 初始化货币选择框 =====

function populateCurrencySelect(selectElement) {
    const options = Object.entries(CURRENCY_META)
        .map(([code, item]) => {
            return `
                <option value="${code}">
                    ${code} - ${item.name}
                </option>
            `;
        })
        .join("");

    selectElement.innerHTML = options;
}


function initializePage() {
    populateCurrencySelect(baseSelect);
    populateCurrencySelect(targetSelect);

    baseSelect.value = "USD";
    targetSelect.value = "CNY";

    const chinaToday = getChinaToday();

    dateInput.value = chinaToday;
    dateInput.max = chinaToday;
}


// ===== 页面提示 =====

function showMessage(message, type) {
    messageBox.textContent = message;

    messageBox.className =
        `message-box ${type}`;

    resultPanel.classList.add("hidden");
}


function hideMessage() {
    messageBox.className =
        "message-box hidden";

    messageBox.textContent = "";
}


// ===== 显示查询结果 =====

function showResult(data) {
    hideMessage();

    document.getElementById(
        "result-date"
    ).textContent = data.date;

    document.getElementById(
        "base-code"
    ).textContent = data.base;

    document.getElementById(
        "target-code"
    ).textContent = data.target;

    document.getElementById(
        "rate-value"
    ).textContent =
        Number(data.rate).toFixed(4);

    document.getElementById(
        "rate-description"
    ).textContent =
        `1 ${data.base} = `
        + `${Number(data.rate).toFixed(4)} `
        + `${data.target}`;

    resultPanel.classList.remove("hidden");
}


// ===== 调用Python API =====

async function queryExchangeRate() {
    const queryDate = dateInput.value;
    const baseCurrency = baseSelect.value;
    const targetCurrency = targetSelect.value;

    if (!queryDate) {
        showMessage(
            "请选择需要查询的日期。",
            "warning"
        );

        return;
    }

    queryButton.disabled = true;
    queryButton.textContent = "正在查询...";

    showMessage(
        "正在读取汇率数据库，请稍候。",
        "loading"
    );

    try {
        const params = new URLSearchParams({
            date: queryDate,
            base: baseCurrency,
            target: targetCurrency
        });

        const response = await fetch(
            `/api/rate?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(
                `服务器响应异常：${response.status}`
            );
        }

        const result = await response.json();

        if (result.success) {
            showResult(result.data);
            return;
        }

        showMessage(
            result.message || "没有找到对应汇率数据。",
            result.status === "pending"
                ? "warning"
                : "error"
        );

    } catch (error) {
        console.error(error);

        showMessage(
            "无法连接汇率服务，请确认Python后端已经启动。",
            "error"
        );

    } finally {
        queryButton.disabled = false;
        queryButton.textContent = "查询汇率";
    }
}


// ===== 交换货币 =====

function swapCurrencies() {
    const currentBase = baseSelect.value;

    baseSelect.value = targetSelect.value;
    targetSelect.value = currentBase;

    resultPanel.classList.add("hidden");
    hideMessage();
}


// ===== 事件监听 =====

queryButton.addEventListener(
    "click",
    queryExchangeRate
);

swapButton.addEventListener(
    "click",
    swapCurrencies
);

document.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            queryExchangeRate();
        }
    }
);


// ===== 启动页面 =====

initializePage();