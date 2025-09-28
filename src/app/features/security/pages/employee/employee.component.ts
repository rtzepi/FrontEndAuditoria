import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../../../core/services/employee.service';
import { IEmployee, IEmployeeSingleResponse, IEmployeeArrayResponse } from '../../../../shared/models/IEmployee';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  @ViewChild('employeeForm') employeeForm!: NgForm;
  photoTouched = false;
  showModal = false;
  employees: IEmployee[] = [];
  filteredEmployees: IEmployee[] = [];
  imagePreview: string | null = null;
  isLoading = false;
  isEditing = false;
  currentEmployeeId: number | null = null;
  formSubmitted = false;

  // Límites de caracteres
  readonly MAX_NAME_LENGTH = 50;
  readonly MAX_LASTNAME_LENGTH = 50;
  readonly MAX_PHONE_LENGTH = 8;
  readonly MAX_EMAIL_LENGTH = 100;
  readonly MAX_CUI_LENGTH = 13;

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  newEmployee: IEmployee = {
    idEmployee: 0,
    firstName: '',
    middleName: null,
    fatherLastName: '',
    motherLastName: null,
    email: '',
    phoneNumber: '',
    status: 'E',
    isAuthorization: true,
    imgBase64: null,
    idPicture: null,
    picture: '',
    cui: null
  };

  constructor(private employeeService: EmployeeService, private location: Location) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.loadEmployees();
    this.setupSearch();
  }

  private loadEmployees() {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.employees = response.value;
          this.filteredEmployees = [...this.employees];
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar empleados', error)
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterEmployees();
      this.currentPage = 1;
    });
  }

  handleInput(field: 'firstName' | 'middleName' | 'fatherLastName' | 'motherLastName' | 'email' | 'phoneNumber' | 'cui', 
              maxLength: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value.length > maxLength) {
      input.value = value.substring(0, maxLength);
      this.newEmployee[field] = input.value as any;
    }
  }

  getRemainingChars(field: 'firstName' | 'middleName' | 'fatherLastName' | 'motherLastName' | 'email' | 'phoneNumber' | 'cui', 
                  maxLength: number): number {
    const value = this.newEmployee[field] || '';
    return maxLength - value.length;
  }

  validateNumber(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  validateCUI(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSubmit() {
    this.formSubmitted = true;
    
    if (!this.newEmployee.imgBase64) {
      Swal.fire('Error', 'La fotografía es requerida', 'error');
      return;
    }

    // Validación adicional de longitudes
    if (this.newEmployee.firstName.length > this.MAX_NAME_LENGTH) {
      Swal.fire('Error', `El primer nombre no puede exceder ${this.MAX_NAME_LENGTH} caracteres`, 'error');
      return;
    }

    if (this.newEmployee.middleName && this.newEmployee.middleName.length > this.MAX_NAME_LENGTH) {
      Swal.fire('Error', `El segundo nombre no puede exceder ${this.MAX_NAME_LENGTH} caracteres`, 'error');
      return;
    }

    if (this.newEmployee.fatherLastName.length > this.MAX_LASTNAME_LENGTH) {
      Swal.fire('Error', `El primer apellido no puede exceder ${this.MAX_LASTNAME_LENGTH} caracteres`, 'error');
      return;
    }

    if (this.newEmployee.motherLastName && this.newEmployee.motherLastName.length > this.MAX_LASTNAME_LENGTH) {
      Swal.fire('Error', `El segundo apellido no puede exceder ${this.MAX_LASTNAME_LENGTH} caracteres`, 'error');
      return;
    }

    if (this.newEmployee.email.length > this.MAX_EMAIL_LENGTH) {
      Swal.fire('Error', `El email no puede exceder ${this.MAX_EMAIL_LENGTH} caracteres`, 'error');
      return;
    }

    if (this.newEmployee.phoneNumber.length !== this.MAX_PHONE_LENGTH) {
      Swal.fire('Error', `El teléfono debe tener exactamente ${this.MAX_PHONE_LENGTH} dígitos`, 'error');
      return;
    }

    // Validación de CUI (opcional, máximo 13 dígitos)
    if (this.newEmployee.cui && this.newEmployee.cui.length > this.MAX_CUI_LENGTH) {
      Swal.fire('Error', `El CUI no puede exceder ${this.MAX_CUI_LENGTH} dígitos`, 'error');
      return;
    }

    if (this.employeeForm.invalid) {
      return;
    }

    if (this.isEditing) {
      this.updateEmployee();
    } else {
      this.addEmployee();
    }
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterEmployees() {
    if (!this.searchTerm) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(employee => 
      (employee.firstName?.toLowerCase().includes(term)) ||
      (employee.middleName?.toLowerCase()?.includes(term)) ||
      (employee.fatherLastName?.toLowerCase().includes(term)) ||
      (employee.motherLastName?.toLowerCase()?.includes(term)) ||
      (employee.email?.toLowerCase().includes(term)) ||
      (employee.phoneNumber?.includes(term)) ||
      (employee.cui?.includes(term)) ||
      (employee.idEmployee?.toString().includes(term))
    );
  }

  getInitials(employee: IEmployee): string {
    const firstInitial = employee.firstName?.charAt(0) || '';
    const lastInitial = employee.fatherLastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  get paginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddEmployeeModal() {
    this.isEditing = false;
    this.currentEmployeeId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditEmployeeModal(employee: IEmployee) {
    this.isEditing = true;
    this.currentEmployeeId = employee.idEmployee;
    
    this.newEmployee = { ...employee };
    this.newEmployee.imgBase64 = employee.picture;
    this.imagePreview = employee.imgBase64 ? `${employee.imgBase64}` : null;
    this.showModal = true;
  }

  handleImageUpload(event: Event) {
    this.photoTouched = true;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        Swal.fire('Error', 'Solo se permiten imágenes (JPEG, PNG, JPG)', 'error');
        return;
    }

    if (file.size > 2097152) {
        Swal.fire('Error', 'La imagen no debe exceder los 2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
            this.imagePreview = e.target.result as string;
            this.newEmployee.imgBase64 = (e.target.result as string).split(',')[1];
        }
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.photoTouched = true;
    this.imagePreview = null;
    this.newEmployee.imgBase64 = null;
    const fileInput = document.getElementById('employeePhoto') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  }

  addEmployee() {
    this.isLoading = true;
    this.employeeService.addEmployee(this.newEmployee).subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.employees.push(response.value);
          this.filteredEmployees = [...this.employees];
          Swal.fire('Éxito', 'Empleado agregado', 'success');
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al agregar', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al agregar', error)
    });
  }

  updateEmployee() {
    if (!this.currentEmployeeId) return;

    this.isLoading = true;
    this.employeeService.updateEmployee(this.currentEmployeeId, this.newEmployee)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.value) {
            const index = this.employees.findIndex(e => e.idEmployee === this.currentEmployeeId);
            if (index !== -1) {
              this.employees[index] = response.value;
              this.filteredEmployees = [...this.employees];
            }
            Swal.fire('Éxito', 'Empleado actualizado', 'success');
            this.closeModal();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar', error)
      });
  }

  confirmDelete(employee: IEmployee) {
    Swal.fire({
      title: '¿Eliminar empleado?',
      text: `¿Seguro que deseas eliminar a ${employee.firstName} ${employee.fatherLastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteEmployee(employee.idEmployee);
      }
    });
  }

  deleteEmployee(id: number) {
    this.isLoading = true;
    this.employeeService.deleteEmployee(id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.employees = this.employees.filter(e => e.idEmployee !== id);
          this.filteredEmployees = this.filteredEmployees.filter(e => e.idEmployee !== id);
          Swal.fire('Éxito', 'Empleado eliminado', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al eliminar', error)
    });
  }

  closeModal() {
    this.showModal = false;
    this.formSubmitted = false;
    this.resetForm();
  }

  resetForm() {
    this.imagePreview = null;
    this.newEmployee = {
      idEmployee: 0,
      firstName: '',
      middleName: null,
      fatherLastName: '',
      motherLastName: null,
      email: '',
      phoneNumber: '',
      status: 'E',
      isAuthorization: true,
      imgBase64: null,
      idPicture: null,
      picture: '',
      cui: null
    };
    this.isEditing = false;
    this.currentEmployeeId = null;
    this.formSubmitted = false;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}