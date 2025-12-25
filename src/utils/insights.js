export const generateSmartInsight = (items) => {
    const expenses = items.filter(i => i.type === 'expense' || !i.type);
    if (expenses.length === 0) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    const thisMonthCategories = {};

    expenses.forEach(item => {
        const d = new Date(item.date);
        const amount = parseFloat(item.amount);

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            thisMonthTotal += amount;
            thisMonthCategories[item.category] = (thisMonthCategories[item.category] || 0) + amount;
        } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
            lastMonthTotal += amount;
        }
    });

    // Insight 1: Month vs Month
    if (lastMonthTotal > 0) {
        const diff = thisMonthTotal - lastMonthTotal;
        const percent = Math.round((Math.abs(diff) / lastMonthTotal) * 100);

        if (diff > 0) {
            // Spending Increased
            // Find top category driver
            const topCat = Object.entries(thisMonthCategories).sort((a, b) => b[1] - a[1])[0];
            return {
                type: 'warning',
                title: 'Spending Alert',
                message: `You've spent ${percent}% more than last month.`,
                detail: topCat ? `Mainly due to ${topCat[0]} ($${topCat[1].toFixed(0)}).` : 'Check your recent transactions.'
            };
        } else {
            // Spending Decreased
            return {
                type: 'success',
                title: 'Great Job!',
                message: `You've spent ${percent}% less than last month.`,
                detail: 'Keep up the good habits!'
            };
        }
    }

    // Fallback Insight: Top Category Focus
    const topCat = Object.entries(thisMonthCategories).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
        return {
            type: 'info',
            title: 'Spending Focus',
            message: `Your top category this month is ${topCat[0]}.`,
            detail: `You've spent $${topCat[1].toFixed(0)} so far.`
        };
    }

    return null;
};
