import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './input-search.component.html',
  styleUrl: './input-search.component.scss'
})
export class InputSearchComponent {
  @Input() searchMessage: string = '';
  @Input() searchInput: string | null = null;
  @Output() searchInputChange = new EventEmitter<string>();

  onSearchChange(value: string) {
    this.searchInputChange.emit(value);
  }
}
