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

  allEmployees: IEmployee[] = [];
  employeesWithoutUser: IEmployee[] = [];
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
    
    this.userService.getEmployees().subscribe({
      next: (empResponse: any) => {
        if (empResponse.isSuccess && empResponse.value) {
          this.allEmployees = Array.isArray(empResponse.value) ? empResponse.value : [empResponse.value];
          this.employeeMap = this.allEmployees.reduce((map, emp) => {
            map[emp.idEmployee] = emp;
            return map;
          }, {} as { [key: number]: IEmployee });

          this.userService.getRoles().subscribe({
            next: (roleResponse: any) => {
              if (roleResponse.isSuccess && roleResponse.value) {
                this.roles = Array.isArray(roleResponse.value) ? roleResponse.value : [roleResponse.value];
                this.roleMap = this.roles.reduce((map, role) => {
                  map[role.idRole] = role;
                  return map;
                }, {} as { [key: number]: IRole });

                this.userService.getUsers().subscribe({
                  next: (userResponse: IUserResponse) => {
                    if (userResponse.isSuccess && userResponse.value) {
                      this.users = Array.isArray(userResponse.value) ? userResponse.value : [userResponse.value];
                      this.filteredUsers = [...this.users];
                      
                      this.filterEmployeesWithoutUser();
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

  private filterEmployeesWithoutUser() {
    const employeeIdsWithUser = this.users.map(user => user.idEmployee);
    
    this.employeesWithoutUser = this.allEmployees.filter(
      employee => !employeeIdsWithUser.includes(employee.idEmployee)
    );
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
          
          this.filterEmployeesWithoutUser();
          
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
          
          this.filterEmployeesWithoutUser();
          
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