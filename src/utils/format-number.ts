// 71759 -> "71,759", 3.28666 -> "3.29"
export function formatNumber(value: number, maxDecimals: number = 2): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: maxDecimals })
}