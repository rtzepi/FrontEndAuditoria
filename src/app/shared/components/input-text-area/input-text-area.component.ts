import { NgIf } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-text-area',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
      <div class="w-full" *ngIf="control">
        <label for="message" class="block">{{label()}}</label>
        <textarea id=" message" rows="4" [formControl]="control"
          class="block p-2.5 w-full text-sm  rounded-lg border border-gray-300 focus:outline-none focus:border-teal-800"
          [placeholder]="placeholder()"></textarea>
      </div>
  `,
  styles: ``
})

export class InputTextAreaComponent {
  label = input.required<string>();
  placeholder = input<string>();
  @Input() control!: FormControl | null;
}
