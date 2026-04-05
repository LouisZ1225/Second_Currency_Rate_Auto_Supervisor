import matplotlib.pyplot as plt

# 单币种波动率图
def plot_volatility(df, currency):
    df_cur = df[df['base'] == currency].copy()

    plt.figure()
    plt.plot(df_cur['date'], df_cur['std'])

    plt.title(f'{currency} Volatility')
    plt.xlabel('Date')
    plt.ylabel('STD')

    plt.show()


# 单币种趋势图（价格+均线）
def plot_trend(df, currency):
    df_cur = df[df['base'] == currency].copy()

    plt.figure()
    plt.plot(df_cur['date'], df_cur['rate'], label='Price')
    plt.plot(df_cur['date'], df_cur['ma3'], label='MA3')

    plt.title(f'{currency} Trend')
    plt.legend()

    plt.show()


# 多币种波动对比
def plot_multi_volatility(df):
    plt.figure()

    for currency in df['base'].unique():
        df_cur = df[df['base'] == currency]
        plt.plot(df_cur['date'], df_cur['std'], label=currency)

    plt.title('Volatility Comparison')
    plt.legend()
    plt.show()