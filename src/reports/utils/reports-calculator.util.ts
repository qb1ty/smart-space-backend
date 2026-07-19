export function calculateHours(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

export function calculateOccupancyRate(bookedHours: number, daysInPeriod = 30): number {
    const totalAvailabelHours = daysInPeriod * 8
    if (totalAvailabelHours <= 0) return 0

    const rate = (bookedHours / totalAvailabelHours) * 100
    return Math.min(100, Math.round(rate))
}

export function calculateCancellationRate(cancelledCount: number, totalCount: number): number {
    if (totalCount === 0) return 0
    return Math.round((cancelledCount / totalCount) * 100)
}