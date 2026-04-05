
df_usd = df[df['base'].isin (['USD','EUR','GBP'])].copy()
df_usd = df_usd.sort_values(by='date')
df_usd['daily_return'] = df_usd['rate'].pct_change()
df_usd['ma3'] = df_usd['rate'].rolling(3).mean()

# 方差（基于收益率）
df_usd['variance'] = df_usd['daily_return'].rolling(3).var()

# 标准差（波动率）
df_usd['std'] = df_usd['daily_return'].rolling(3).std()

# 均值（用于计算CV）
df_usd['mean'] = df_usd['rate'].rolling(3).mean()

# 变异系数
df_usd['cv'] = df_usd['std'] / df_usd['mean']

print(df_usd)