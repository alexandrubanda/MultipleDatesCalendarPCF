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

    constructor() {}

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        const defaultDate = context.parameters.defaultDate?.raw ? new Date(context.parameters.defaultDate.raw) : new Date();
        this.logicCalendar = new LogicCalendar(defaultDate);
        this.visualCalendar = new VisualCalendar();

        this.month = defaultDate.getMonth();
        this.year = defaultDate.getFullYear();

        this.container.appendChild(this.visualCalendar.getElement());

        this.updateMonthYearDisplay();
        this.renderDates();

        this.container.querySelector("#prev-month")?.addEventListener("click", () => this.changeMonth(-1));
        this.container.querySelector("#next-month")?.addEventListener("click", () => this.changeMonth(1));
        this.container.querySelector("#clear-button")?.addEventListener("click", () => this.clearSelectedDates());
        this.container.querySelector("#submit-button")?.addEventListener("click", () => this.submitSelectedDates());
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {}

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
        this.notifyOutputChanged();
    }

    private submitSelectedDates(): void {
        this.notifyOutputChanged();
    }
}
