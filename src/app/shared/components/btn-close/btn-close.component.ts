import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-btn-close',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  template: `
    <button mat-button
      type="button"
      [disabled]="disabled"
      class="bg-red-500/80 px-3 rounded text-zinc-200 py-2 mx-2 hover:bg-red-500/70 focus:bg-red-500/100"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled">
      @if (!loading) {
        <span>Cancelar</span>
      }
      @if (loading) {
        <span>Procesando...</span>
      }
    </button>
  `,
  styleUrls: ['./btn-close.component.scss']
})
export class BtnCloseComponent {
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
}