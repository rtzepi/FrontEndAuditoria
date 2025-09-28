import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { TableAuditService } from '../../../../core/services/table-audit.service';
import { ITableAuditStatus, ITableAuditSetRequest } from '../../../../shared/models/ITableAudit';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-table-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './table-audit.component.html',
  styleUrls: ['./table-audit.component.scss']
})
export class TableAuditComponent implements OnInit {
  tables: ITableAuditStatus[] = [];
  filteredTables: ITableAuditStatus[] = [];
  isLoading = false;

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  constructor(
    private tableAuditService: TableAuditService,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.loadTables();
    this.setupSearch();
  }

  private loadTables() {
    this.isLoading = true;
    this.tableAuditService.getTablesStatus().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.tables = response.value;
          this.filteredTables = [...this.tables];
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar las tablas', error)
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterTables();
      this.currentPage = 1;
    });
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterTables() {
    if (!this.searchTerm) {
      this.filteredTables = [...this.tables];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredTables = this.tables.filter(table => 
      table.schemaName.toLowerCase().includes(term) ||
      table.tableName.toLowerCase().includes(term)
    );
  }

  toggleAudit(table: ITableAuditStatus) {
    const newAuditValue = !table.auditar;
    
    const request: ITableAuditSetRequest = {
      schemaName: table.schemaName,
      tableName: table.tableName,
      auditar: newAuditValue
    };

    this.isLoading = true;
    this.tableAuditService.setTableAudit(request).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          table.auditar = newAuditValue;
          Swal.fire('Éxito', 'Estado de auditoría actualizado correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al actualizar el estado', 'error');
          table.auditar = !newAuditValue;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Error al actualizar el estado', error);
        // Revert the toggle in case of error
        table.auditar = !newAuditValue;
        this.isLoading = false;
      }
    });
  }

  get paginatedTables() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTables.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredTables.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  getTriggerStatus(triggerExists: number): string {
    return triggerExists === 1 ? 'Activo' : 'Inactivo';
  }

  getTriggerStatusClass(triggerExists: number): string {
    return triggerExists === 1 ? 'active' : 'inactive';
  }

  getAuditStatus(auditar: boolean): string {
    return auditar ? 'Activo' : 'Inactivo';
  }

  getAuditStatusClass(auditar: boolean): string {
    return auditar ? 'active' : 'inactive';
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    Swal.fire('Error', message, 'error');
  }
}