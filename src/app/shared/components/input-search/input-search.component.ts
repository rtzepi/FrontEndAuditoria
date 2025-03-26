import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <input
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="searchValue"
        (ngModelChange)="onSearch()"
        class="search-input"
      />
      <span class="search-icon"></span>
    </div>
  `,
  styleUrls: ['./input-search.component.scss']
})
export class InputSearchComponent {
  @Input() placeholder: string = 'Buscar...';
  @Output() searchChange = new EventEmitter<string>();
  
  searchValue: string = '';

  onSearch() {
    this.searchChange.emit(this.searchValue);
  }
}