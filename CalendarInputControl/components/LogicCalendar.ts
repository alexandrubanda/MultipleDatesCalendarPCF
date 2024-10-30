export class LogicCalendar {

    private selectedDates: Date[] = [];

    constructor(private defaultDate: Date = new Date()) {}

    static generateMonthGrid(month: number, year: number): Date[] {
        const monthGrid: Date[] = [];
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startDate = new Date(firstDayOfMonth);
        while (startDate.getDay() !== 1) { // 1 = Monday
            startDate.setDate(startDate.getDate() - 1);
        }

        let endDate = new Date(lastDayOfMonth);
        while (endDate.getDay() !== 0) { // 0 = Sunday
            endDate.setDate(endDate.getDate() + 1);
        }

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            monthGrid.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return monthGrid;
    }

    addRange(startDate: Date, endDate: Date): void {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (!this.isDateInSelectedDates(currentDate)) {
                this.selectedDates.push(new Date(currentDate)); 
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    removeRange(startDate: Date, endDate: Date): void {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            this.selectedDates = this.selectedDates.filter(date => !this.areDatesEqual(date, currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    clearSelectedDates(): void {
        this.selectedDates = [];
    }

    getSelectedDates(): Date[] {
        return this.selectedDates;
    }

    private isDateInSelectedDates(date: Date): boolean {
        return this.selectedDates.some(selectedDate => this.areDatesEqual(selectedDate, date));
    }

    private areDatesEqual(date1: Date, date2: Date): boolean {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }
}
