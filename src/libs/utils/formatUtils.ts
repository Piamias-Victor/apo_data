export const formatLargeNumber = (value: any, isCurrency: boolean = true): string => {
    const num = parseFloat(value) || 0;
    let formattedValue = "";

    if (num >= 1_000_000) {
        formattedValue = `${(num / 1_000_000).toFixed(2).replace(".", ",")} M`;
    } else if (num >= 1_000) {
        formattedValue = `${(num / 1_000).toFixed(2).replace(".", ",")} K`;
    } else {
        formattedValue = num.toFixed(2).replace(".", ",");
    }

    return isCurrency ? `${formattedValue} €` : formattedValue;
};