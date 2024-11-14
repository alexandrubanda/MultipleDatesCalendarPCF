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

    constructor() {}

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        this.defaultDate = context.parameters.defaultDate?.raw ? new Date(context.parameters.defaultDate.raw) : new Date();
        this.logicCalendar = new LogicCalendar();
        this.visualCalendar = new VisualCalendar(this.defaultDate);

        this.textInput = document.createElement("input");
        this.textInput.type = "text";
        this.textInput.className = "calendar-text-input";
        this.textInput.readOnly = true;
        this.textInput.addEventListener("click", () => this.toggleCalendarVisibility());

        this.container.appendChild(this.textInput);

        this.month = this.defaultDate?.getMonth();
        this.year = this.defaultDate?.getFullYear();

        this.container.appendChild(this.visualCalendar.getElement());

        this.updateMonthYearDisplay();
        this.renderDates();
        this.updateTextInput();

        document.addEventListener("click", this.handleOutsideClick.bind(this));
        this.container.querySelector("#prev-month")?.addEventListener("click", () => this.changeMonth(-1));
        this.container.querySelector("#next-month")?.addEventListener("click", () => this.changeMonth(1));
        this.container.querySelector("#clear-button")?.addEventListener("click", () => this.clearSelectedDates());
        this.container.querySelector("#submit-button")?.addEventListener("click", () => this.submitSelectedDates());
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const newDefaultDate = context.parameters.defaultDate?.raw ? new Date(context.parameters.defaultDate.raw) : null;
        
        if (newDefaultDate && (!this.defaultDate || newDefaultDate.getTime() !== this.defaultDate.getTime())) {
            this.defaultDate = newDefaultDate;
            this.month = this.defaultDate?.getMonth() as number;
            this.year = this.defaultDate?.getFullYear() as number;

            this.visualCalendar.setDefaultDate(newDefaultDate as Date); 

            const dates = LogicCalendar.generateMonthGrid(this.month, this.year);
            this.visualCalendar.renderDates(dates);
            this.updateTextInput();
            this.notifyOutputChanged();
        }

    
    }

    public getOutputs(): IOutputs {
        const selectedDates = this.visualCalendar.getSelectedDateRange();
        const dateRangeString = selectedDates.map(date => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }).join(", ");
        return { dateRange: dateRangeString };
    }

    public destroy(): void {}

    private updateMonthYearDisplay(): void {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.visualCalendar.updateMonthYearDisplay(monthNames[this.month], this.year);
    }

    private changeMonth(offset: number): void {
        this.month += offset;
        if (this.month < 0) {
            this.month = 11;
            this.year -= 1;
        } else if (this.month > 11) {
            this.month = 0;
            this.year += 1;
        }
        this.updateMonthYearDisplay();
        this.renderDates();
    }

    private renderDates(): void {
        const dates = LogicCalendar.generateMonthGrid(this.month, this.year);
        this.visualCalendar.renderDates(dates);
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
        calendarElement.style.display = calendarElement.style.display === "none" ? "block" : "none";
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (!this.container.contains(event.target as Node) && this.visualCalendar.getElement().style.display === "block") {
            this.visualCalendar.getElement().style.display = "none";
        }
    }

    private updateTextInput(): void {
        const selectedDates = this.visualCalendar.getSelectedDateRange();

        if (selectedDates.length === 0) {
            // Display the placeholder message if no dates are selected
            this.textInput.value = "Pick a date";
        } else {
            // Format the selected dates as "YYYY-MM-DD" and display them
            this.textInput.value = selectedDates.map(date => {
                    const year = date.getFullYear();
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
                    const day = date.getDate().toString().padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }).join(", ");
        }

    }
}
