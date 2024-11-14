export class LogicCalendar {

    private selectedDates: Date[] = [];

    constructor() {}

    static generateMonthGrid(month: number, year: number): Date[] {
        const monthGrid: Date[] = [];
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDate = new Date(firstDayOfMonth);
        while (startDate.getDay() !== 1) { // 1 = Monday
            startDate.setDate(startDate.getDate() - 1);
        }

        const endDate = new Date(lastDayOfMonth);
        while (endDate.getDay() !== 0) { // 0 = Sunday
            endDate.setDate(endDate.getDate() + 1);
        }

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            monthGrid.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return monthGrid;
    }
}
