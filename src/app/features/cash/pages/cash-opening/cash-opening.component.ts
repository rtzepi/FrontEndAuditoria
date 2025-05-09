import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { CashService, CashSessionOpenRequest, Response } from '../../../../core/services/cash.service';

@Component({
  selector: 'app-cash-opening',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-opening.component.html',
  styleUrls: ['./cash-opening.component.scss'],
  providers: [DatePipe]
})
export class CashOpeningComponent implements OnInit {
  openingAmount: number = 0;
  isLoading: boolean = false;
  hasActiveSession: boolean = false;

  constructor(
    private cashService: CashService,
    private location: Location,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    if (this.openingAmount <= 0) {
      Swal.fire('Error', 'El monto de apertura debe ser mayor a cero', 'error');
      return;
    }

    this.isLoading = true;
    try {
      const request: CashSessionOpenRequest = { openingAmount: this.openingAmount };
      const response = await this.cashService.openCashSession(request).toPromise();
      
      if (response?.isSuccess) {
        const formattedAmount = `Q${this.openingAmount.toFixed(2)}`;
        await Swal.fire({
          title: '¡Apertura exitosa!',
          html: `Sesión de caja abierta con <strong>${formattedAmount}</strong>`,
          icon: 'success'
        });
        this.hasActiveSession = true;
      } else {
        Swal.fire('Error', response?.error || 'Error al abrir sesión', 'error');
      }
    } catch (error) {
      console.error('Error al abrir sesión:', error);
      Swal.fire('Error', 'No se pudo abrir la sesión de caja', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.location.back();
  }
}