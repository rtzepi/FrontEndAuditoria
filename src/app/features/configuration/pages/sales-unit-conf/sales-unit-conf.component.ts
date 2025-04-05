import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { UnitOfSaleService } from '../../../../core/services/unit.service';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

interface IUnitOfSale {
  idUnitOfSale: number;
  unityName: string;
  abbreviation: string;
  description: string;
  status: string;
}

interface IUnitOfSaleResponse {
  isSuccess: boolean;
  value: IUnitOfSale | IUnitOfSale[];
  error?: string | null;
}

@Component({
  selector: 'app-sales-unit-conf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './sales-unit-conf.component.html',
  styleUrls: ['./sales-unit-conf.component.scss']
})
export class SalesUnitConfComponent implements OnInit {
  @ViewChild('unitForm') unitForm!: NgForm;
  showModal = false;
  units: IUnitOfSale[] = [];
  filteredUnits: IUnitOfSale[] = [];
  isLoading = false;
  isEditing = false;
  currentUnitId: number | null = null;

  // Límites de caracteres
  readonly MAX_NAME_LENGTH = 50;
  readonly MAX_ABBREVIATION_LENGTH = 10;
  readonly MAX_DESCRIPTION_LENGTH = 100;

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  newUnit = {
    idUnitOfSale: 0,
    unityName: '',
    abbreviation: '',
    description: '',
    status: 'E'
  };

  constructor(
    private unitService: UnitOfSaleService,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  private loadData() {
    this.isLoading = true;
    
    this.unitService.getUnits().subscribe({
      next: (response: IUnitOfSaleResponse) => {
        if (response.isSuccess && response.value) {
          this.units = Array.isArray(response.value) ? response.value : [response.value];
          this.filteredUnits = [...this.units];
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar unidades de venta', error)
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterUnits();
      this.currentPage = 1;
    });
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterUnits() {
    if (!this.searchTerm) {
      this.filteredUnits = [...this.units];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUnits = this.units.filter(unit => 
      (unit.unityName?.toLowerCase().includes(term)) ||
      (unit.abbreviation?.toLowerCase().includes(term)) ||
      (unit.idUnitOfSale?.toString().includes(term))
    );
  }

  handleInput(field: 'unityName' | 'abbreviation' | 'description', maxLength: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value.length > maxLength) {
      input.value = value.substring(0, maxLength);
      this.newUnit[field] = input.value;
    }
  }

  getRemainingChars(field: 'unityName' | 'abbreviation' | 'description', maxLength: number): number {
    return maxLength - (this.newUnit[field]?.length || 0);
  }

  get paginatedUnits() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUnits.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredUnits.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddUnitModal() {
    this.isEditing = false;
    this.currentUnitId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditUnitModal(unit: IUnitOfSale) {
    this.isEditing = true;
    this.currentUnitId = unit.idUnitOfSale;
    this.newUnit = {
      idUnitOfSale: unit.idUnitOfSale,
      unityName: unit.unityName,
      abbreviation: unit.abbreviation,
      description: unit.description,
      status: unit.status
    };
    this.showModal = true;
  }

  addUnit() {
    if (this.unitForm.invalid) return;

    this.isLoading = true;
    this.unitService.addUnit(this.newUnit).subscribe({
      next: (response: IUnitOfSaleResponse) => {
        if (response.isSuccess && response.value) {
          const newUnit = Array.isArray(response.value) ? response.value[0] : response.value;
          this.units.push(newUnit);
          this.filteredUnits = [...this.units];
          
          Swal.fire('Éxito', 'Unidad de venta creada correctamente', 'success');
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al crear unidad de venta', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al crear unidad de venta', error)
    });
  }

  updateUnit() {
    if (!this.currentUnitId || this.unitForm.invalid) return;

    this.isLoading = true;
    this.unitService.updateUnit(this.currentUnitId, this.newUnit)
      .subscribe({
        next: (response: IUnitOfSaleResponse) => {
          if (response.isSuccess && response.value) {
            const index = this.units.findIndex(u => u.idUnitOfSale === this.currentUnitId);
            if (index !== -1) {
              this.units[index] = response.value as IUnitOfSale;
              this.filteredUnits = [...this.units];
            }
            Swal.fire('Éxito', 'Unidad de venta actualizada correctamente', 'success');
            this.closeModal();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar unidad de venta', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar unidad de venta', error)
      });
  }

  confirmDelete(unit: IUnitOfSale) {
    Swal.fire({
      title: '¿Eliminar unidad de venta?',
      text: `¿Estás seguro de eliminar ${unit.unityName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUnit(unit.idUnitOfSale);
      }
    });
  }

  deleteUnit(id: number) {
    this.isLoading = true;
    this.unitService.deleteUnit(id).subscribe({
      next: (response: IUnitOfSaleResponse) => {
        if (response.isSuccess) {
          this.units = this.units.filter(u => u.idUnitOfSale !== id);
          this.filteredUnits = this.filteredUnits.filter(u => u.idUnitOfSale !== id);
          
          Swal.fire('Éxito', 'Unidad de venta eliminada correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar unidad de venta', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al eliminar unidad de venta', error)
    });
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newUnit = {
      idUnitOfSale: 0,
      unityName: '',
      abbreviation: '',
      description: '',
      status: 'E'
    };
    this.isEditing = false;
    this.currentUnitId = null;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }

  getStatusText(status: string): string {
    return status === 'E' ? 'Activo' : 'Inactivo';
  }

  goBack() {
    this.location.back();
  }
}