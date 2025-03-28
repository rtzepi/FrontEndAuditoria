import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { UserService } from '../../../../core/services/user.service';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

interface IUser {
  idUser: number;
  userName: string;
  status: string;
  isChangePass: boolean;
  lastLogin: string | null;
  idEmployee: number;
  idRole: number;
  email: string;
  picture?: string | null;
}

interface IEmployee {
  idEmployee: number;
  firstName: string;
  middleName: string | null;
  fatherLastName: string;
  motherLastName: string | null;
  picture?: string | null;
}

interface IRole {
  idRole: number;
  roleName: string;
}

interface IUserResponse {
  isSuccess: boolean;
  value: IUser | IUser[];
  error?: string | null;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @ViewChild('userForm') userForm!: NgForm;
  showModal = false;
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  isLoading = false;
  isEditing = false;
  currentUserId: number | null = null;

  employees: IEmployee[] = [];
  roles: IRole[] = [];
  employeeMap: { [key: number]: IEmployee } = {};
  roleMap: { [key: number]: IRole } = {};

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  newUser = {
    idUser: 0,
    idEmployee: 0,
    idRole: 0,
    status: 'E',
    isChangePass: false
  };

  constructor(
    private userService: UserService,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  private loadData() {
    this.isLoading = true;
    
    // Cargar empleados
    this.userService.getEmployees().subscribe({
      next: (empResponse: any) => {
        if (empResponse.isSuccess && empResponse.value) {
          this.employees = Array.isArray(empResponse.value) ? empResponse.value : [empResponse.value];
          this.employeeMap = this.employees.reduce((map, emp) => {
            map[emp.idEmployee] = emp;
            return map;
          }, {} as { [key: number]: IEmployee });

          // Cargar roles
          this.userService.getRoles().subscribe({
            next: (roleResponse: any) => {
              if (roleResponse.isSuccess && roleResponse.value) {
                this.roles = Array.isArray(roleResponse.value) ? roleResponse.value : [roleResponse.value];
                this.roleMap = this.roles.reduce((map, role) => {
                  map[role.idRole] = role;
                  return map;
                }, {} as { [key: number]: IRole });

                // Cargar usuarios
                this.userService.getUsers().subscribe({
                  next: (userResponse: IUserResponse) => {
                    if (userResponse.isSuccess && userResponse.value) {
                      this.users = Array.isArray(userResponse.value) ? userResponse.value : [userResponse.value];
                      this.filteredUsers = [...this.users];
                    }
                    this.isLoading = false;
                  },
                  error: (error) => this.handleError('Error al cargar usuarios', error)
                });
              } else {
                this.isLoading = false;
              }
            },
            error: (error) => this.handleError('Error al cargar roles', error)
          });
        } else {
          this.isLoading = false;
        }
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
      this.filterUsers();
      this.currentPage = 1;
    });
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      (user.userName?.toLowerCase().includes(term)) ||
      (user.email?.toLowerCase().includes(term)) ||
      (user.idUser?.toString().includes(term))
    );
  }

  getInitials(user: IUser): string {
    return user.userName ? user.userName.slice(0, 2).toUpperCase() : '';
  }

  getEmployeeFullName(idEmployee: number): string {
    const employee = this.employeeMap[idEmployee];
    if (!employee) return 'Desconocido';
    
    return `${employee.firstName || ''} ${employee.middleName || ''} ${employee.fatherLastName || ''} ${employee.motherLastName || ''}`
      .replace(/\s+/g, ' ')
      .trim();
  }

  getEmployeeImage(idEmployee: number): string | null {
    const employee = this.employeeMap[idEmployee];
    return employee?.picture ? `data:image/jpeg;base64,${employee.picture}` : null;
  }

  getRoleName(idRole: number): string {
    const role = this.roleMap[idRole];
    return role ? role.roleName : 'Desconocido';
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddUserModal() {
    this.isEditing = false;
    this.currentUserId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditUserModal(user: IUser) {
    this.isEditing = true;
    this.currentUserId = user.idUser;
    this.newUser = {
      idUser: user.idUser,
      idEmployee: user.idEmployee,
      idRole: user.idRole,
      status: user.status,
      isChangePass: user.isChangePass
    };
    this.showModal = true;
  }

  addUser() {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    this.userService.registerUser(this.newUser).subscribe({
      next: (response: IUserResponse) => {
        if (response.isSuccess && response.value) {
          const newUser = Array.isArray(response.value) ? response.value[0] : response.value;
          this.users.push(newUser);
          this.filteredUsers = [...this.users];
          Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al crear usuario', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al crear usuario', error)
    });
  }

  updateUser() {
    if (!this.currentUserId || this.userForm.invalid) return;

    this.isLoading = true;
    this.userService.updateUser(this.currentUserId, this.newUser)
      .subscribe({
        next: (response: IUserResponse) => {
          if (response.isSuccess && response.value) {
            const index = this.users.findIndex(u => u.idUser === this.currentUserId);
            if (index !== -1) {
              this.users[index] = response.value as IUser;
              this.filteredUsers = [...this.users];
            }
            Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
            this.closeModal();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar usuario', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar usuario', error)
      });
  }

  confirmDelete(user: IUser) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar a ${user.userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser(user.idUser);
      }
    });
  }

  deleteUser(id: number) {
    this.isLoading = true;
    this.userService.deleteUser(id).subscribe({
      next: (response: IUserResponse) => {
        if (response.isSuccess) {
          this.users = this.users.filter(u => u.idUser !== id);
          this.filteredUsers = this.filteredUsers.filter(u => u.idUser !== id);
          Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar usuario', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al eliminar usuario', error)
    });
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newUser = {
      idUser: 0,
      idEmployee: 0,
      idRole: 0,
      status: 'E',
      isChangePass: false
    };
    this.isEditing = false;
    this.currentUserId = null;
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





// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
// import { environment } from '../../../../../app/environments/environment.development';
// import { UserService } from '../../../../core/services/user.service';
// import { CommonModule } from '@angular/common';
// import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
// import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
// import Swal from 'sweetalert2';
// import { Location } from '@angular/common';
// import { IUser, IUserResponse } from '../../../../shared/models/IUser';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

// @Component({
//   selector: 'app-user',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     InputSearchComponent
//   ],
//   templateUrl: './user.component.html',
//   styleUrls: ['./user.component.scss']
// })
// export class UserComponent implements OnInit {
//   @ViewChild('userForm') userForm!: NgForm;
//   showModal = false;
//   users: IUser[] = [];
//   filteredUsers: IUser[] = [];
//   imagePreview: string | null = null;
//   isLoading = false;
//   isEditing = false;
//   currentUserId: number | null = null;

//   currentPage = 1;
//   itemsPerPage = 10;
//   searchTerm = '';
//   searchSubject = new Subject<string>();

//   newUser = {
//     userName: '',
//     password: '',
//     status: 'E',
//     isChangePass: true,
//     idEmployee: 0,
//     idRole: 0,
//     picture: ''
//   };

//   constructor(private userService: UserService, private location: Location) {}

//   goBack() {
//     this.location.back();
//   }

//   ngOnInit() {
//     this.loadUsers();
//     this.setupSearch();
//   }

//   private loadUsers() {
//     this.isLoading = true;
//     this.userService.getUsers().subscribe({
//       next: (response) => {
//         if (response.isSuccess && response.value) {
//           this.users = Array.isArray(response.value) ? response.value : [response.value];
//           this.filteredUsers = [...this.users];
//         }
//         this.isLoading = false;
//       },
//       error: (error) => this.handleError('Error al cargar usuarios', error)
//     });
//   }

//   private setupSearch() {
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(term => {
//       this.searchTerm = term;
//       this.filterUsers();
//       this.currentPage = 1;
//     });
//   }

//   handleSearch(searchTerm: string) {
//     this.searchSubject.next(searchTerm);
//   }

//   filterUsers() {
//     if (!this.searchTerm) {
//       this.filteredUsers = [...this.users];
//       return;
//     }
    
//     const term = this.searchTerm.toLowerCase();
//     this.filteredUsers = this.users.filter(user => 
//       (user.userName?.toLowerCase().includes(term)) ||
//       (user.email?.toLowerCase().includes(term)) ||
//       (user.idUser?.toString().includes(term))
//     );
//   }

//   get paginatedUsers() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   previousPage() {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   openAddUserModal() {
//     this.isEditing = false;
//     this.currentUserId = null;
//     this.resetForm();
//     this.showModal = true;
//   }

//   openEditUserModal(user: IUser) {
//     this.isEditing = true;
//     this.currentUserId = user.idUser;
    
//     this.newUser = { 
//       userName: user.userName,
//       password: '',
//       status: user.status,
//       isChangePass: user.isChangePass,
//       idEmployee: user.idEmployee,
//       idRole: user.idRole,
//       picture: user.picture
//     };
    
//     this.imagePreview = user.picture ? `data:image/png;base64,${user.picture}` : null;
//     this.showModal = true;
//   }

//   handleImageUpload(event: Event) {
//     const input = event.target as HTMLInputElement;
//     const file = input.files?.[0];
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
//     reader.onload = (e: ProgressEvent<FileReader>) => {
//       if (e.target?.result) {
//         this.imagePreview = e.target.result as string;
//         this.newUser.picture = (e.target.result as string).split(',')[1];
//       }
//     };
//     reader.readAsDataURL(file);
//   }

//   removePhoto() {
//     this.imagePreview = null;
//     this.newUser.picture = '';
//   }

//   addUser() {
//     if (this.userForm.invalid) return;

//     this.isLoading = true;
//     this.userService.registerUser(this.newUser).subscribe({
//       next: (response) => {
//         if (response.isSuccess && response.value) {
//           const newUser = Array.isArray(response.value) ? response.value[0] : response.value;
//           this.users.push(newUser);
//           this.filteredUsers = [...this.users];
//           Swal.fire('Éxito', 'Usuario agregado', 'success');
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al agregar usuario', 'error');
//         }
//         this.isLoading = false;
//       },
//       error: (error) => this.handleError('Error al agregar usuario', error)
//     });
//   }

//   updateUser() {
//     if (!this.currentUserId || this.userForm.invalid) return;

//     this.isLoading = true;
//     const userData = {
//       ...this.newUser,
//       idUser: this.currentUserId
//     };

//     this.userService.updateUser(this.currentUserId, userData)
//       .subscribe({
//         next: (response) => {
//           if (response.isSuccess && response.value) {
//             const index = this.users.findIndex(u => u.idUser === this.currentUserId);
//             if (index !== -1) {
//               this.users[index] = response.value as IUser;
//               this.filteredUsers = [...this.users];
//             }
//             Swal.fire('Éxito', 'Usuario actualizado', 'success');
//             this.closeModal();
//           } else {
//             Swal.fire('Error', response.error || 'Error al actualizar usuario', 'error');
//           }
//           this.isLoading = false;
//         },
//         error: (error) => this.handleError('Error al actualizar usuario', error)
//       });
//   }

//   confirmDelete(user: IUser) {
//     Swal.fire({
//       title: '¿Eliminar usuario?',
//       text: `¿Seguro que deseas eliminar a ${user.userName}?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.deleteUser(user.idUser);
//       }
//     });
//   }

//   deleteUser(id: number) {
//     this.isLoading = true;
//     this.userService.deleteUser(id).subscribe({
//       next: (response) => {
//         if (response.isSuccess) {
//           this.users = this.users.filter(u => u.idUser !== id);
//           this.filteredUsers = this.filteredUsers.filter(u => u.idUser !== id);
//           Swal.fire('Éxito', 'Usuario eliminado', 'success');
//         } else {
//           Swal.fire('Error', response.error || 'Error al eliminar usuario', 'error');
//         }
//         this.isLoading = false;
//       },
//       error: (error) => this.handleError('Error al eliminar usuario', error)
//     });
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.imagePreview = null;
//     this.newUser = {
//       userName: '',
//       password: '',
//       status: 'E',
//       isChangePass: true,
//       idEmployee: 0,
//       idRole: 0,
//       picture: ''
//     };
//     this.isEditing = false;
//     this.currentUserId = null;
//   }

//   private handleError(message: string, error: any) {
//     console.error(message, error);
//     this.isLoading = false;
//     Swal.fire('Error', message, 'error');
//   }

//   getStatusBadgeClass(status: string): string {
//     return status === 'E' ? 'badge-success' : 'badge-warning';
//   }

//   getStatusText(status: string): string {
//     return status === 'E' ? 'Activo' : 'Inactivo';
//   }
// }


















// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
// import { environment } from '../../../../../app/environments/environment.development';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
// import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
// import Swal from 'sweetalert2';
// import { Location } from '@angular/common';

// @Component({
//   selector: 'app-user',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent
//   ],
//   templateUrl: './user.component.html',
//   styleUrls: ['./user.component.scss']
// })
// export class UserComponent implements OnInit {
//   @ViewChild('userForm') userForm!: NgForm;
//   showModal: boolean = false;
//   users: any[] = [];
//   imagePreview: string | null = null;
//   isLoading: boolean = false;

//   newUser = {
//     userName: '',
//     password: '',
//     status: 'E',
//     isChangePass: true,
//     idEmployee: 0,
//     idRole: 0,
//     picture: ''
//   };

//   constructor(private http: HttpClient, private location: Location) {}
//   goBack() {
//     this.location.back();
// }

//   ngOnInit() {
//     this.getUsers();
//   }

//   getUsers() {
//     this.isLoading = true;
//     this.http.get<any>(`${environment.baseUrlApi}/User/users`).subscribe({
//       next: (response) => {
//         if (response.isSuccess) {
//           this.users = response.value;
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener usuarios:', error);
//         this.isLoading = false;
//       }
//     });
//   }

//   openAddUserModal() {
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.imagePreview = null;
//     this.newUser = {
//       userName: '',
//       password: '',
//       status: 'E',
//       isChangePass: true,
//       idEmployee: 0,
//       idRole: 0,
//       picture: ''
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
//       this.newUser.picture = e.target.result.split(',')[1]; 
//     };
//     reader.readAsDataURL(file);
//   }

//   addUser() {
//     if (this.userForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const userData = {
//       userName: this.newUser.userName.trim(),
//       password: this.newUser.password,
//       status: this.newUser.status,
//       isChangePass: this.newUser.isChangePass,
//       idEmployee: this.newUser.idEmployee,
//       idRole: this.newUser.idRole,
//       picture: this.newUser.picture
//     };

//     const headers = {
//       'Content-Type': 'application/json'
//     };

//     this.http.post(`${environment.baseUrlApi}/User/register`, userData, { headers })
//       .subscribe({
//         next: (response: any) => {
//           this.isLoading = false;
//           if (response.isSuccess) {
//             Swal.fire({
//               title: 'Éxito',
//               text: 'Usuario creado correctamente',
//               icon: 'success',
//               timer: 3000
//             });
//             this.users.push(response.value);
//             this.closeModal();
//           } else {
//             Swal.fire('Error', response.message || 'Error al crear usuario', 'error');
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