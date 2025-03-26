import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-btn-accept',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  template: `
    <button mat-button
      type="submit"
      [disabled]="disabled"
      class="bg-blue-600/80 px-3 rounded text-zinc-200 py-2 mx-2 hover:bg-blue-600/70 focus:bg-blue-600/100"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled">
      @if (!loading) {
        <span>Aceptar</span>
      }
      @if (loading) {
        <span>Procesando...</span>
      }
    </button>
  `,
  styleUrls: ['./btn-accept.component.scss']
})
export class BtnAcceptComponent {
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
}