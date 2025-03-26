import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-date-start-end',
  standalone: true,
  imports: [
    MatNativeDateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './date-start-end.component.html',
  styleUrl: './date-start-end.component.scss'
})
export class DateStartEndComponent {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();

  onStartDateChange(value: string): void {
    this.startDateChange.emit(value);
  }

  onEndDateChange(value: string): void {
    this.endDateChange.emit(value);
  }

  openDatePicker(input: HTMLInputElement): void {
    input.showPicker();
  }
}
