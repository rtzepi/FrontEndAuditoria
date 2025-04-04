import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { SupplierService } from '../../../../core/services/supplier.service';
import { ISupplier, ISupplierSingleResponse, ISupplierArrayResponse } from '../../../../shared/models/ISupplier';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-supplier-conf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './supplier-conf.component.html',
  styleUrls: ['./supplier-conf.component.scss']
})
export class SupplierConfComponent implements OnInit {
  @ViewChild('supplierForm') supplierForm!: NgForm;
  showModal = false;
  suppliers: ISupplier[] = [];
  filteredSuppliers: ISupplier[] = [];
  isLoading = false;
  isEditing = false;
  currentSupplierId: number | null = null;
  formSubmitted = false;

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  newSupplier: ISupplier = {
    idSupplier: 0,
    nameSupplier: '',
    nameContact: '',
    phoneNumber: '',
    phoneNumberContact: '',
    email: '',
    address: '',
    status: 'st',
    observation: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 0,
    deleted_at: null
  };

  constructor(private supplierService: SupplierService, private location: Location) {}


  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'st': 'Activo',
      'A': 'Activo',
      'I': 'Inactivo'
    };
    return statusMap[status] || status;
  }

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.loadSuppliers();
    this.setupSearch();
  }

  private loadSuppliers() {
    this.isLoading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.suppliers = response.value;
          this.filteredSuppliers = [...this.suppliers];
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar proveedores', error)
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterSuppliers();
      this.currentPage = 1;
    });
  }

  validateNumber(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSubmit() {
    this.formSubmitted = true;
    
    if (this.supplierForm.invalid) {
      return;
    }

    this.newSupplier.updated_at = new Date().toISOString();
    
    if (!this.isEditing) {
      this.newSupplier.created_at = new Date().toISOString();
      this.newSupplier.created_by = 1; // Reemplazar con ID de usuario real
    }

    if (this.isEditing) {
      this.updateSupplier();
    } else {
      this.addSupplier();
    }
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterSuppliers() {
    if (!this.searchTerm) {
      this.filteredSuppliers = [...this.suppliers];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(supplier => 
      (supplier.nameSupplier?.toLowerCase().includes(term)) ||
      (supplier.nameContact?.toLowerCase().includes(term)) ||
      (supplier.email?.toLowerCase().includes(term)) ||
      (supplier.phoneNumber?.includes(term)) ||
      (supplier.phoneNumberContact?.includes(term)) ||
      (supplier.idSupplier?.toString().includes(term))
    );
  }

  get paginatedSuppliers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSuppliers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredSuppliers.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddSupplierModal() {
    this.isEditing = false;
    this.currentSupplierId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditSupplierModal(supplier: ISupplier) {
    this.isEditing = true;
    this.currentSupplierId = supplier.idSupplier;
    this.newSupplier = { ...supplier };
    this.showModal = true;
  }

  addSupplier() {
    this.isLoading = true;
    this.supplierService.addSupplier(this.newSupplier).subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.suppliers.push(response.value);
          this.filteredSuppliers = [...this.suppliers];
          Swal.fire('Éxito', 'Proveedor agregado correctamente', 'success');
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al agregar el proveedor', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.handleError('Error al agregar proveedor', error);
      }
    });
  }

  updateSupplier() {
    if (!this.currentSupplierId) return;

    this.isLoading = true;
    this.supplierService.updateSupplier(this.currentSupplierId, this.newSupplier)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.value) {
            const index = this.suppliers.findIndex(s => s.idSupplier === this.currentSupplierId);
            if (index !== -1) {
              this.suppliers[index] = response.value;
              this.filteredSuppliers = [...this.suppliers];
            }
            Swal.fire('Éxito', 'Proveedor actualizado correctamente', 'success');
            this.closeModal();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar el proveedor', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar proveedor', error)
      });
  }

  confirmDelete(supplier: ISupplier) {
    Swal.fire({
      title: '¿Eliminar proveedor?',
      text: `¿Estás seguro de eliminar a ${supplier.nameSupplier}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteSupplier(supplier.idSupplier);
      }
    });
  }

  deleteSupplier(id: number) {
    this.isLoading = true;
    this.supplierService.deleteSupplier(id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.suppliers = this.suppliers.filter(s => s.idSupplier !== id);
          this.filteredSuppliers = this.filteredSuppliers.filter(s => s.idSupplier !== id);
          Swal.fire('Eliminado', 'El proveedor ha sido eliminado', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar el proveedor', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al eliminar proveedor', error)
    });
  }

  closeModal() {
    this.showModal = false;
    this.formSubmitted = false;
    this.resetForm();
  }

  resetForm() {
    this.newSupplier = {
      idSupplier: 0,
      nameSupplier: '',
      nameContact: '',
      phoneNumber: '',
      phoneNumberContact: '',
      email: '',
      address: '',
      status: 'st',
      observation: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 0,
      deleted_at: null
    };
    this.isEditing = false;
    this.currentSupplierId = null;
    this.formSubmitted = false;
  }

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