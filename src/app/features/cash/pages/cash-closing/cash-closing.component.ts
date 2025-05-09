import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CashService, DailyTransaction, CashSessionCloseRequest, Response } from '../../../../core/services/cash.service';

@Component({
  selector: 'app-cash-closing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-closing.component.html',
  styleUrls: ['./cash-closing.component.scss'],
  providers: [DatePipe]
})
export class CashClosingComponent implements OnInit {
  transactions: DailyTransaction[] = [];
  isLoading: boolean = false;
  closingInProgress: boolean = false;
  closeData: CashSessionCloseRequest = {
    closingAmount: 0,
    replenishedAmount: 0,
    observation: ''
  };
  showCloseForm: boolean = false;

  constructor(
    private cashService: CashService,
    private location: Location,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.cashService.getTransactionList().toPromise();
      if (response?.isSuccess && response.value) {
        this.transactions = response.value;
      } else {
        Swal.fire('Información', response?.error || 'No hay transacciones para mostrar', 'info');
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      Swal.fire('Error', 'No se pudieron cargar las transacciones', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  prepareCloseSession(): void {
    this.closeData = {
      closingAmount: this.calculateExpectedAmount(),
      replenishedAmount: 0,
      observation: ''
    };
    this.showCloseForm = true;
  }

  calculateExpectedAmount(): number {
    const income = this.getTotalIncome();
    const expenses = this.getTotalExpenses();
    return income - expenses;
  }

  getTotalIncome(): number {
    return this.transactions
      .filter(t => t.trnType === 'Ingreso')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses(): number {
    return this.transactions
      .filter(t => t.trnType === 'Egreso')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getDifference(): number {
    return (this.closeData.closingAmount + this.closeData.replenishedAmount) - this.calculateExpectedAmount();
  }

  validateCloseForm(): boolean {
    return this.closeData.closingAmount >= 0 && 
            this.closeData.replenishedAmount >= 0;
  }

  async confirmCloseSession(): Promise<void> {
    if (!this.validateCloseForm()) {
      Swal.fire('Error', 'Por favor complete todos los campos correctamente', 'error');
      return;
    }

    const difference = this.getDifference();
    if (difference !== 0) {
      const confirm = await Swal.fire({
        title: '¿Continuar con diferencia?',
        html: `Existe una diferencia de <strong>Q${Math.abs(difference).toFixed(2)}</strong>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Revisar'
      });
      if (!confirm.isConfirmed) return;
    }

    await this.closeSession();
  }

  async closeSession(): Promise<void> {
    this.closingInProgress = true;
    try {
      const response = await this.cashService.closeCashSession(this.closeData).toPromise();
      
      if (response?.isSuccess) {
        await Swal.fire('Éxito', 'Caja cerrada correctamente', 'success');
        this.showCloseForm = false;
        this.transactions = [];
      } else {
        Swal.fire('Error', response?.error || 'Error al cerrar la caja', 'error');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire('Error', 'No se pudo cerrar la sesión de caja', 'error');
    } finally {
      this.closingInProgress = false;
    }
  }

  getTransactionType(type: string): string {
    return type === 'Ingreso' ? 'Ingreso' : 'Egreso';
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'medium') || '';
  }

  goBack(): void {
    this.location.back();
  }
}