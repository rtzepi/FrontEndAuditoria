import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-input-select',
  standalone: true,
  imports: [MatIcon, NgIf, NgFor, ReactiveFormsModule],
  template: `
   <div class="w-full" *ngIf="control">
      <label class="block text-gray-700 text-sm font-bold mb-2">{{ label }}</label>
      <div class="relative">
        <select
          class="block appearance-none w-full border border-teal-600 hover:border-teal-700 px-4 py-3 rounded focus:outline-none focus:border-teal-800 shadow leading-tight"
          [formControl]="control"
        >
          <option value="" disabled>{{ placeholder }}</option>
          <option *ngFor="let item of options" [value]="item.id">{{ item.name }}</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <mat-icon class="text-teal-600">expand_more</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class InputSelectComponent {
  @Input() label!: string;
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options!: { id: number; name: string }[];
  @Input() control!: FormControl | null;

}
