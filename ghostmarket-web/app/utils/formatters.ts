
/**
 * Formata um valor numérico para a representação de moeda Brasileira (R$).
 * @param amount O valor a ser formatado.
 * @returns String formatada (Ex: R$ 1.200,00).
 */
export const formatCurrency = (amount: number | string): string => {
    // Garante que o valor seja tratado como número
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Retorna R$ 0,00 se o valor não for válido ou for zero
    if (isNaN(numericAmount) || numericAmount === 0) {
        return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericAmount);
};