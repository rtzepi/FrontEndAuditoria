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
  showModal = false;
  employees: IEmployee[] = [];
  filteredEmployees: IEmployee[] = [];
  imagePreview: string | null = null;
  isLoading = false;
  isEditing = false;
  currentEmployeeId: number | null = null;

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
    picture: ''
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
          console.log(this.employees)
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
    this.imagePreview = null;
    this.newEmployee.imgBase64 = null;
  }

  addEmployee() {
    if (this.employeeForm.invalid) return;

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
    if (!this.currentEmployeeId || this.employeeForm.invalid) return;

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
      picture: ''
    };
    this.isEditing = false;
    this.currentEmployeeId = null;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}






// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, NgForm, Validators } from '@angular/forms';
// import { environment } from '../../../../../app/environments/environment.development';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
// import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
// import Swal from 'sweetalert2';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

// @Component({
//   selector: 'app-employee',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent,
//     InputSearchComponent
//   ],
//   templateUrl: './employee.component.html',
//   styleUrls: ['./employee.component.scss']
// })
// export class EmployeeComponent implements OnInit {
//   @ViewChild('employeeForm') employeeForm!: NgForm;
//   showModal: boolean = false;
//   employees: any[] = [];
//   filteredEmployees: any[] = [];
//   imagePreview: string | null = null;
//   isLoading: boolean = false;


//   // Paginación
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   searchTerm: string = '';
//   searchSubject = new Subject<string>();


//   newEmployee = {
//     firstName: '',
//     middleName: '',
//     fatherLastName: '',
//     motherLastName: '',
//     email: '',
//     phoneNumber: '',
//     imgBase64: '',
//     status: 'E', 
//     isAuthorization: true
//   };

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.getEmployees();
    
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(term => {
//       this.searchTerm = term;
//       this.filterEmployees();
//       this.currentPage = 1;
//     });
//   }

//   get paginatedEmployees() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     return this.filteredEmployees.slice(startIndex, endIndex);
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
//   }


//   handleSearch(searchTerm: string) {
//     this.searchTerm = searchTerm;
//     this.filterEmployees();
//     this.currentPage = 1;
//   }



//   filterEmployees() {
//     if (!this.searchTerm) {
//       this.filteredEmployees = [...this.employees];
//       return;
//     }
    
//     const term = this.searchTerm.toLowerCase();
//     this.filteredEmployees = this.employees.filter(employee => 
//       (employee.firstName?.toLowerCase().includes(term)) ||
//       (employee.middleName?.toLowerCase().includes(term)) ||
//       (employee.fatherLastName?.toLowerCase().includes(term)) ||
//       (employee.motherLastName?.toLowerCase().includes(term)) ||
//       (employee.email?.toLowerCase().includes(term)) ||
//       (employee.phoneNumber?.includes(term)) ||
//       (employee.idEmployee?.toString().includes(term))
//     );
//   }

//   getEmployees() {
//     this.isLoading = true;
//     this.http.get<any>(`${environment.baseUrlApi}/Employee/employees`).subscribe({
//       next: (response) => {
//         if (response.isSuccess) {
//           this.employees = response.value;
//           this.filteredEmployees = [...this.employees];
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener empleados:', error);
//         this.isLoading = false;
//       }
//     });
//   }

//   // Pagination methods
//   nextPage() {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//     }
//   }

//   previousPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   goToPage(page: number) {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//     }
//   }


  



//   openAddEmployeeModal() {
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.imagePreview = null;
//     this.newEmployee = {
//       firstName: '',
//       middleName: '',
//       fatherLastName: '',
//       motherLastName: '',
//       email: '',
//       phoneNumber: '',
//       imgBase64: '',
//       status: 'E',
//       isAuthorization: true
//     };
//   }

//   handleImageUpload(event: any) {
//     const file = event.target.files[0];
//     if (!file) return;

//     if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
//       Swal.fire('Error', 'Solo se permiten imágenes (JPEG, PNG, JPG)', 'error');
//       return;
//     }

//     if (file.size > 2097152) {
//       Swal.fire('Error', 'La imagen no debe exceder los 2MB', 'error');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e: any) => {
//       this.imagePreview = e.target.result;
//       this.newEmployee.imgBase64 = e.target.result;
//     };
//     reader.readAsDataURL(file);
//   }

//   private processImageBase64(imgBase64: string): string {
//     return imgBase64 && imgBase64.includes(',') ? imgBase64.split(',')[1] : imgBase64;
//   }

//   addEmployee() {
//     if (this.employeeForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const employeeData = {
//       firstName: this.newEmployee.firstName.trim(),
//       middleName: this.newEmployee.middleName.trim(),
//       fatherLastName: this.newEmployee.fatherLastName.trim(),
//       motherLastName: this.newEmployee.motherLastName.trim(),
//       email: this.newEmployee.email.trim(),
//       phoneNumber: this.newEmployee.phoneNumber.trim(),
//       imgBase64: this.processImageBase64(this.newEmployee.imgBase64),
//       status: this.newEmployee.status,
//       isAuthorization: this.newEmployee.isAuthorization
//     };

//     const headers = {
//       'Content-Type': 'application/json'
//     };

//     this.http.post(`${environment.baseUrlApi}/Employee/Add`, employeeData, { headers })
//       .subscribe({
//         next: (response: any) => {
//           this.isLoading = false;
//           if (response.isSuccess) {
//             Swal.fire({
//               title: 'Éxito',
//               text: 'Empleado agregado y correo enviado correctamente',
//               icon: 'success',
//               timer: 3000
//             });
//             this.employees.push(response.value);
//             this.closeModal();
//           } else {
//             Swal.fire('Error', response.message || 'Error al agregar empleado', 'error');
//           }
//         },
//         error: (error) => {
//           this.isLoading = false;
//           let errorMessage = 'Error al conectar con el servidor';
//           if (error.error?.message) {
//             errorMessage += `: ${error.error.message}`;
//           }
//           Swal.fire('Error', errorMessage, 'error');
//           console.error('Error completo:', error);
//         }
//       });
//   }
// }
