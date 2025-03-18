export class VisualCalendar {
    private container: HTMLElement;
    private monthYearDisplay: HTMLElement | null = null;
    private calendarGrid: HTMLElement;
    private isDragging: boolean = false;
    private startDate: Date | null = null;
    private endDate: Date | null = null;
    private dateElements: Map<string, HTMLElement> = new Map(); 
    private selectedDateKeys: Set<string> = new Set();
    private selectionMode: 'add' | 'remove' = 'add';
    private defaultDate: Date | null = null;

    constructor(defaultDate?: Date | null) {
        this.container = document.createElement("div");
        this.container.className = "calendar-container";
        this.defaultDate = defaultDate ? this.resetTime(defaultDate) : null;
        this.buildCalendar();
        if (this.defaultDate) {
            this.addDefaultDate();
        }
    }

    private addDefaultDate(): void {
        if (this.defaultDate) {
            const dateKey = this.getDateKey(this.defaultDate);
            this.selectedDateKeys.clear(); 
            this.selectedDateKeys.add(dateKey); 
        }
    }

    public setDefaultDate(date: Date): void {
        this.defaultDate = this.resetTime(date);
        this.addDefaultDate();
    }

    private buildCalendar() {
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

        const daysHeader = document.createElement("div");
        daysHeader.className = "days-header";

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        days.forEach(day => {
            const dayName = document.createElement("span");
            dayName.className = "day-name";
            dayName.innerText = day;
            daysHeader.appendChild(dayName);
        });

        this.calendarGrid = document.createElement("div");
        this.calendarGrid.className = "calendar-grid";
        this.calendarGrid.id = "calendar-grid";

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "calendar-actions";

        const clearButton = document.createElement("button");
        clearButton.className = "calendar-button";
        clearButton.id = "clear-button";
        clearButton.innerText = "Clear";

        const submitButton = document.createElement("button");
        submitButton.className = "calendar-button";
        submitButton.id = "submit-button";
        submitButton.innerText = "Pick";

        actionsContainer.appendChild(clearButton);
        actionsContainer.appendChild(submitButton);

        this.container.appendChild(header);
        this.container.appendChild(daysHeader);
        this.container.appendChild(this.calendarGrid);
        this.container.appendChild(actionsContainer);

        this.container.style.userSelect = "none";
    }

    public getElement(): HTMLElement {
        return this.container;
    }

    public updateMonthYearDisplay(month: string, year: number): void {
        if (this.monthYearDisplay) {
            this.monthYearDisplay.innerText = `${month} ${year}`;
        } else {
            console.warn("monthYearDisplay element is not defined.");
        }
    }

    /**
     * Render all 42 (or so) dates in the grid, but visually disable any out-of-range days
     */
    public renderDates(
        dates: Date[],
        today: Date,
        limitMonths: boolean,
        allowPast: boolean,
        numberOfAllowedMonths: number
    ): void {
        this.calendarGrid.innerHTML = "";
        this.dateElements.clear();

        // Compute the "allowed" range if limitMonths is true
        const todayMonthIndex = today.getFullYear() * 12 + today.getMonth();
        const pastOffset = allowPast ? numberOfAllowedMonths : 0;
        const minMonthIndex = todayMonthIndex - pastOffset;
        const maxMonthIndex = todayMonthIndex + numberOfAllowedMonths;

        // Convert those indexes to actual date boundaries
        const minDate = new Date(
            Math.floor(minMonthIndex / 12),
            (minMonthIndex % 12),
            1
        );
        const maxDateTemp = new Date(
            Math.floor(maxMonthIndex / 12),
            (maxMonthIndex % 12) + 1,
            0
        );
        const maxDate = maxDateTemp;

        dates.forEach(date => {
            const dateElement = document.createElement("div");
            dateElement.className = "calendar-date";
            dateElement.innerText = date.getDate().toString();

            const dateKey = this.getDateKey(date);
            this.dateElements.set(dateKey, dateElement);

            // Check if this date is out of range
            const isBeforeToday = date < today && !allowPast;
            const isTooEarly = limitMonths && date < minDate;
            const isTooLate = limitMonths && date > maxDate;

            // If date is out of range, disable
            if (isBeforeToday || isTooEarly || isTooLate) {
                dateElement.classList.add("disabled");
            } else {
                // Otherwise allow selection
                if (this.selectedDateKeys.has(dateKey)) {
                    dateElement.classList.add("selected");
                }
                dateElement.addEventListener("mousedown", () => this.startSelection(date));
                dateElement.addEventListener("mouseenter", () => this.updateSelection(date));
                dateElement.addEventListener("mouseup", () => this.endSelection());
            }

            this.calendarGrid.appendChild(dateElement);
        });

        // Ensure mouseup is captured to stop dragging
        document.addEventListener("mouseup", () => this.endSelection());
    }

    private startSelection(date: Date): void {
        this.isDragging = true;
        this.startDate = this.resetTime(date);
        this.endDate = this.resetTime(date);

        const dateKey = this.getDateKey(date);
        if (this.selectedDateKeys.has(dateKey)) {
            this.selectionMode = 'remove';
        } else {
            this.selectionMode = 'add';
        }
        this.applySelection();
    }

    private updateSelection(date: Date): void {
        if (this.isDragging && this.startDate) {
            this.endDate = this.resetTime(date);
            this.applySelection();
        }
    }

    private endSelection(): void {
        this.isDragging = false;
    }

    private applySelection(): void {
        if (!this.startDate || !this.endDate) return;

        const [start, end] = this.startDate <= this.endDate
            ? [this.startDate, this.endDate]
            : [this.endDate, this.startDate];

        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dateKey = this.getDateKey(currentDate);
            const dateElement = this.dateElements.get(dateKey);

            if (dateElement) {
                if (this.selectionMode === 'add') {
                    dateElement.classList.add("selected");
                    this.selectedDateKeys.add(dateKey);
                } else if (this.selectionMode === 'remove') {
                    dateElement.classList.remove("selected");
                    this.selectedDateKeys.delete(dateKey);
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    public getSelectedDateRange(): Date[] {
        const selectedDates: Date[] = [];
        this.selectedDateKeys.forEach(dateKey => {
            const [year, month, day] = dateKey.split('-').map(Number);
            selectedDates.push(new Date(year, month - 1, day)); // Months are zero-based
        });
        return selectedDates.sort((a, b) => a.getTime() - b.getTime());
    }

    public clearSelection(resetDates = true): void {
        this.dateElements.forEach((el, dateKey) => {
            el.classList.remove("selected");
        });
        this.selectedDateKeys.clear();
        if (resetDates) {
            this.startDate = null;
            this.endDate = null;
        }
    }

    private resetTime(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private getDateKey(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
}
