import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { LogicCalendar } from "./components/LogicCalendar";
import { VisualCalendar } from "./components/VisualCalendar";

export class CalendarInputControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private notifyOutputChanged: () => void;

    private logicCalendar: LogicCalendar;
    private visualCalendar: VisualCalendar;

    private month: number;
    private year: number;

    private textInput: HTMLInputElement;
    private defaultDate: Date | null;

    private limitMonths: boolean;
    private allowPast: boolean;
    private numberOfAllowedMonths: number;

    private today: Date;

    private minMonthIndex: number;
    private maxMonthIndex: number;

    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        this.limitMonths = !!context.parameters.limitMonths?.raw;
        this.allowPast = !!context.parameters.allowPast?.raw;
        this.numberOfAllowedMonths = context.parameters.numberOfAllowedMonths?.raw ?? 0;

        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);

        const rawDefault = context.parameters.defaultDate?.raw;
        this.defaultDate = rawDefault ? new Date(rawDefault) : null;

        this.logicCalendar = new LogicCalendar();
        this.visualCalendar = new VisualCalendar(this.defaultDate);

        this.textInput = document.createElement("input");
        this.textInput.type = "text";
        this.textInput.className = "calendar-text-input";
        this.textInput.readOnly = true;
        this.textInput.addEventListener("click", () => this.toggleCalendarVisibility());

        container.appendChild(this.textInput);

        // Initialize month/year either from defaultDate or today
        if (this.defaultDate) {
            this.month = this.defaultDate.getMonth();
            this.year = this.defaultDate.getFullYear();
        } else {
            this.month = this.today.getMonth();
            this.year = this.today.getFullYear();
        }

        // Calculate min/max month indexes if user limited the months
        const todayMonthIndex = this.today.getFullYear() * 12 + this.today.getMonth();
        if (this.limitMonths) {
            const pastOffset = this.allowPast ? this.numberOfAllowedMonths : 0;
            this.minMonthIndex = todayMonthIndex - pastOffset;
            this.maxMonthIndex = todayMonthIndex + this.numberOfAllowedMonths;
        } else {
            this.minMonthIndex = 0;
            this.maxMonthIndex = Number.MAX_SAFE_INTEGER;
        }

        // Add the calendar DOM element to the container
        container.appendChild(this.visualCalendar.getElement());

        // Render the initial month/year and dates
        this.updateMonthYearDisplay();
        this.renderDates();
        this.updateTextInput();

        // Handle outside clicks (close calendar if user clicks away)
        document.addEventListener("click", this.handleOutsideClick.bind(this));

        // Hook up navigation and buttons
        this.container.querySelector("#prev-month")?.addEventListener("click", () => this.changeMonth(-1));
        this.container.querySelector("#next-month")?.addEventListener("click", () => this.changeMonth(1));
        this.container.querySelector("#clear-button")?.addEventListener("click", () => this.clearSelectedDates());
        this.container.querySelector("#submit-button")?.addEventListener("click", () => this.submitSelectedDates());
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Check if defaultDate changed
        const newRawDefault = context.parameters.defaultDate?.raw;
        const newDefaultDate = newRawDefault ? new Date(newRawDefault) : null;

        if (newDefaultDate && (!this.defaultDate || newDefaultDate.getTime() !== this.defaultDate.getTime())) {
            this.defaultDate = newDefaultDate;
            this.month = this.defaultDate.getMonth();
            this.year = this.defaultDate.getFullYear();

            this.visualCalendar.setDefaultDate(newDefaultDate);
            this.updateMonthYearDisplay();
            this.renderDates();
            this.updateTextInput();
            this.notifyOutputChanged();
        }

        // Re-check the limitMonths/allowPast/numberOfAllowedMonths
        this.limitMonths = !!context.parameters.limitMonths?.raw;
        this.allowPast = !!context.parameters.allowPast?.raw;
        this.numberOfAllowedMonths = context.parameters.numberOfAllowedMonths?.raw ?? 0;

        // Recompute min/max indexes
        const todayMonthIndex = this.today.getFullYear() * 12 + this.today.getMonth();
        if (this.limitMonths) {
            const pastOffset = this.allowPast ? this.numberOfAllowedMonths : 0;
            this.minMonthIndex = todayMonthIndex - pastOffset;
            this.maxMonthIndex = todayMonthIndex + this.numberOfAllowedMonths;
        } else {
            this.minMonthIndex = 0;
            this.maxMonthIndex = Number.MAX_SAFE_INTEGER;
        }

        // Rerender
        this.updateMonthYearDisplay();
        this.renderDates();
        this.updateTextInput();
    }

    private groupConsecutiveDates(dates: Date[]): Array<{ start: Date; end: Date }> {
        const ranges: Array<{ start: Date; end: Date }> = [];
        if (dates.length === 0) {
            return ranges;
        }

        let start = dates[0];
        let end = dates[0];

        for (let i = 1; i < dates.length; i++) {
            const current = dates[i];
            const oneDay = 24 * 60 * 60 * 1000;
            if (current.getTime() === end.getTime() + oneDay) {
                // Extend the current range
                end = current;
            } else {
                // Close the old range and start a new one
                ranges.push({ start, end });
                start = current;
                end = current;
            }
        }

        // Push the last range
        ranges.push({ start, end });
        return ranges;
    }

    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    public getOutputs(): IOutputs {
        // Build the dateRange string
        const selectedDates = this.visualCalendar.getSelectedDateRange();
        const groupedRanges = this.groupConsecutiveDates(selectedDates);

        const dateRangeString = groupedRanges
            .map(range => `${this.formatDate(range.start)} to ${this.formatDate(range.end)}`)
            .join(", ");

        return {
            dateRange: dateRangeString
        };
    }

    public destroy(): void {
        // No cleanup needed in this sample
    }

    private updateMonthYearDisplay(): void {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.visualCalendar.updateMonthYearDisplay(monthNames[this.month], this.year);
    }

    private changeMonth(offset: number): void {
        const currentIndex = this.year * 12 + this.month;
        const newMonthIndex = currentIndex + offset;

        // Make sure we don't exceed min/max
        if (newMonthIndex < this.minMonthIndex || newMonthIndex > this.maxMonthIndex) {
            return;
        }

        this.year = Math.floor(newMonthIndex / 12);
        this.month = newMonthIndex % 12;

        this.updateMonthYearDisplay();
        this.renderDates();
    }

    private renderDates(): void {
        // Always generate the full "Monday-Sunday" grid
        const allDates = LogicCalendar.generateMonthGrid(this.month, this.year);

        // Pass it in along with constraints
        this.visualCalendar.renderDates(
            allDates,
            this.today,
            this.limitMonths,
            this.allowPast,
            this.numberOfAllowedMonths
        );
    }

    private clearSelectedDates(): void {
        this.visualCalendar.clearSelection();
        this.updateTextInput();
        this.toggleCalendarVisibility();
        this.notifyOutputChanged();
    }

    private submitSelectedDates(): void {
        this.updateTextInput();
        this.toggleCalendarVisibility();
        this.notifyOutputChanged();
    }

    private toggleCalendarVisibility(): void {
        const calendarElement = this.visualCalendar.getElement();
        calendarElement.style.display = (calendarElement.style.display === "none") ? "block" : "none";
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (!this.container.contains(event.target as Node) &&
            this.visualCalendar.getElement().style.display === "block") {
            this.visualCalendar.getElement().style.display = "none";
        }
    }

    private updateTextInput(): void {
        const selectedDates = this.visualCalendar.getSelectedDateRange();
        if (selectedDates.length === 0) {
            this.textInput.value = "Pick a date";
        } else {
            // Group the selected dates
            const groupedRanges = this.groupConsecutiveDates(selectedDates);
            // Show them as "dd.MM.yyyy to dd.MM.yyyy" separated by comma
            this.textInput.value = groupedRanges
                .map(range => `${this.formatDate(range.start)} to ${this.formatDate(range.end)}`)
                .join(", ");
        }
    }
}
