import { Component, inject  } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { SupplierService } from '../../../../core/services/supplier.service';
import { ISupplier } from '../../../../shared/models/ISupplier';
import Swal from 'sweetalert2';
import { GenericService } from '../../../../core/services/generic.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

  readonly reportForm = new FormGroup({
    reportType : new FormControl<string>('', { nonNullable: true , validators: [Validators.required]}),
    startDate     : new FormControl<string>('', { nonNullable: true , validators: [Validators.required]}),
    endDate    : new FormControl<string>('', { nonNullable: true , validators: [Validators.required]}),
    outputFormat  : new FormControl<string>('', { nonNullable: true , validators: [Validators.required]}),
    status      : new FormControl<any>('', { nonNullable: true }),
    idSupplier      : new FormControl<any>('', { nonNullable: true }),
    limit      : new FormControl<string>('', { nonNullable: true }),
  });

  suppliers: ISupplier[] = [];
  isLoading = false;
  private location = inject(Location);
  private sGeneric = inject(GenericService);  


  constructor(private supplierService: SupplierService) {
    this.reportForm.valueChanges.subscribe(fv => {
      for (const [name, getValidators] of Object.entries(this.conditionalConfig)) {
        const ctrl = this.reportForm.get(name);
        if (!ctrl) continue;
        ctrl.setValidators(getValidators(fv)); 
        ctrl.updateValueAndValidity({
          onlySelf: true,
          emitEvent: false
        });
      }
    });
  }


  ngOnInit() {
    this.loadSuppliers();
  }

  onSubmit(): void {

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    if (this.reportForm.valid) {
      const { startDate, endDate, reportType, outputFormat, status, idSupplier, limit } = this.reportForm.getRawValue();
      const start = new Date(startDate);
      const end   = new Date(endDate);
      if (start > end) {
        this.reportForm.get('endDate')?.setErrors({
          dateRange: 'La fecha de inicio debe ser anterior o igual a la fecha fin.'
        });
      }

      const result  = {
        startDate: start,
        endDate : end,
        reportType : +reportType,
        outputFormat: +outputFormat,
        status: status,
        idSupplier: +idSupplier,
        limit : +limit
      }


      this.sGeneric.generate(result).subscribe({
        next: (response) => {
          const blob = response.body!;
          const contentDisp = response.headers.get('content-disposition') || '';
          let filename = '';
          const starMatch = contentDisp.match(/filename\*\s*=\s*([^']*)''([^;]+)/i);
          if (starMatch && starMatch[2]) {
            filename = decodeURIComponent(starMatch[2]);
          } else {
            const nameMatch = contentDisp.match(/filename="?([^";]+)"?/i);
            if (nameMatch && nameMatch[1]) {
              filename = nameMatch[1];
            }
          }
          if (!filename) {
            filename = `reporte.pdf`;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
    
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al generar PDF', error)
      });




    }


  }

  
  private loadSuppliers() {
    this.isLoading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.suppliers = response.value;
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar proveedores', error)
    });
  }

  
  goBack() {
    this.location.back();
  }

  private conditionalConfig: Record<string, (fv: any) => ValidatorFn[]> = {
    status: fv => fv.reportType === '2' ? [Validators.required] : [],
    idSupplier: fv => fv.reportType === '2' ? [Validators.required] : [],
    limit: fv => fv.reportType === '3' ? [Validators.required] : [],
  };


  private handleError(message: string, error: any) {
    console.error('Error detallado:', error);
    this.isLoading = false;
    
    let errorMessage = message;
    if (error.error && error.error.error) {
      errorMessage += `: ${error.error.error}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    Swal.fire('Error', errorMessage, 'error');
  }
    
}


