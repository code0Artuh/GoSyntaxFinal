function getCurrencyPrice(currency, price) {
    if (currency === 'BRL') {
        return `Number(${price}.replace('R$', '').replace('.', '').replace(',', '.'))`;
    }

    if (currency === 'USD') {
        return `Number(${price}.replace('USD', '').replace('.', '').replace(',', '.'))`;
    }
}

export { getCurrencyPrice }