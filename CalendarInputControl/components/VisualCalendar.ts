export class VisualCalendar {
    private container: HTMLElement;
    private monthYearDisplay: HTMLElement;
    private calendarGrid: HTMLElement;

    constructor() {
        // Create the main container for the calendar
        this.container = document.createElement("div");
        this.container.className = "calendar-container";

        // Build the calendar structure
        this.buildCalendar();
    }

    // Method to build the calendar HTML structure
    private buildCalendar() {
        // Header with month/year display and navigation arrows
        const header = document.createElement("div");
        header.className = "calendar-header";

        const prevButton = document.createElement("button");
        prevButton.className = "arrow-button";
        prevButton.id = "prev-month";
        prevButton.innerText = "←";

        this.monthYearDisplay = document.createElement("span");
        this.monthYearDisplay.className = "month-year";
        this.monthYearDisplay.id = "month-year-display";

        const nextButton = document.createElement("button");
        nextButton.className = "arrow-button";
        nextButton.id = "next-month";
        nextButton.innerText = "→";

        header.appendChild(prevButton);
        header.appendChild(this.monthYearDisplay);
        header.appendChild(nextButton);

        // Days of the week header
        const daysHeader = document.createElement("div");
        daysHeader.className = "days-header";

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        days.forEach(day => {
            const dayName = document.createElement("span");
            dayName.className = "day-name";
            dayName.innerText = day;
            daysHeader.appendChild(dayName);
        });

        // Dates grid
        this.calendarGrid = document.createElement("div");
        this.calendarGrid.className = "calendar-grid";
        this.calendarGrid.id = "calendar-grid";

        // Action buttons
        const actionsContainer = document.createElement("div");
        actionsContainer.className = "calendar-actions";

        const clearButton = document.createElement("button");
        clearButton.className = "calendar-button";
        clearButton.id = "clear-button";
        clearButton.innerText = "Clear";

        const submitButton = document.createElement("button");
        submitButton.className = "calendar-button";
        submitButton.id = "submit-button";
        submitButton.innerText = "Submit";

        actionsContainer.appendChild(clearButton);
        actionsContainer.appendChild(submitButton);

        // Append everything to the main container
        this.container.appendChild(header);
        this.container.appendChild(daysHeader);
        this.container.appendChild(this.calendarGrid);
        this.container.appendChild(actionsContainer);
    }

    // Getter for the container element
    public getElement(): HTMLElement {
        return this.container;
    }

    // Method to update the month and year display
    public updateMonthYearDisplay(month: string, year: number): void {
        this.monthYearDisplay.innerText = `${month} ${year}`;
    }

    // Method to render the dates in the calendar grid
    public renderDates(dates: Date[]): void {
        this.calendarGrid.innerHTML = ""; // Clear existing dates
        dates.forEach(date => {
            const dateElement = document.createElement("div");
            dateElement.className = "calendar-date";
            dateElement.innerText = date.getDate().toString();
            this.calendarGrid.appendChild(dateElement);
        });
    }
}