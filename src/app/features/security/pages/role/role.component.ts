import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RoleService } from '../../../../core/services/role.service';
import { IRole, IRoleResponse, IRoleRegisterRequest, IRoleUpdateRequest } from '../../../../shared/models/IRole';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  @ViewChild('roleForm') roleForm!: NgForm;
  showModal = false;
  roles: IRole[] = [];
  filteredRoles: IRole[] = [];
  isLoading = false;
  isEditing = false;
  currentRoleId: number | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  newRole: IRoleRegisterRequest = {
    roleName: '',
    description: '',
    status: 'E',
    isNotify: false
  };

  constructor(private roleService: RoleService, private location: Location) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.loadRoles();
    this.setupSearch();
  }

  private loadRoles() {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (response: IRoleResponse) => {
        if (response.isSuccess) {
          // Verificamos si es un array o un solo objeto
          if (Array.isArray(response.value)) {
            this.roles = response.value;
          } else {
            // Si es un solo objeto, lo convertimos a array
            this.roles = response.value ? [response.value] : [];
          }
          this.filteredRoles = [...this.roles];
        } else if (!response.isSuccess && response.error) {
          Swal.fire('Error', response.error, 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar roles', error)
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterRoles();
      this.currentPage = 1;
    });
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterRoles() {
    if (!this.searchTerm) {
      this.filteredRoles = [...this.roles];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredRoles = this.roles.filter(role => 
      (role.roleName?.toLowerCase().includes(term)) ||
      (role.description?.toLowerCase()?.includes(term)) ||
      (role.idRole?.toString().includes(term))
    );
  }

  get paginatedRoles() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredRoles.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddRoleModal() {
    this.isEditing = false;
    this.currentRoleId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditRoleModal(role: IRole) {
    this.isEditing = true;
    this.currentRoleId = role.idRole;
    
    this.newRole = {
      roleName: role.roleName,
      description: role.description || '',
      status: role.status,
      isNotify: role.isNotify || false
    };
    
    this.showModal = true;
  }

  addRole() {
    if (this.roleForm.invalid) return;

    this.isLoading = true;
    this.roleService.addRole(this.newRole).subscribe({
      next: (response: IRoleResponse) => {
        if (response.isSuccess && response.value) {
          // Asegurarnos de que siempre trabajamos con un array
          const newRole = Array.isArray(response.value) ? response.value[0] : response.value;
          if (newRole) {
            this.roles.push(newRole);
            this.filteredRoles = [...this.roles];
            Swal.fire('Éxito', 'Rol agregado correctamente', 'success');
            this.closeModal();
          }
        } else {
          Swal.fire('Error', response.error || 'Error al agregar rol', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al agregar rol', error)
    });
  }

  updateRole() {
    if (!this.currentRoleId || this.roleForm.invalid) return;

    const updateData: IRoleUpdateRequest = {
      ...this.newRole,
      idRole: this.currentRoleId
    };

    this.isLoading = true;
    this.roleService.updateRole(this.currentRoleId, updateData).subscribe({
      next: (response: IRoleResponse) => {
        if (response.isSuccess && response.value) {
          // Asegurarnos de que siempre trabajamos con un objeto IRole
          const updatedRole = Array.isArray(response.value) ? response.value[0] : response.value;
          if (updatedRole) {
            const index = this.roles.findIndex(r => r.idRole === this.currentRoleId);
            if (index !== -1) {
              this.roles[index] = updatedRole;
              this.filteredRoles = [...this.roles];
            }
            Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
            this.closeModal();
          }
        } else {
          Swal.fire('Error', response.error || 'Error al actualizar rol', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al actualizar rol', error)
    });
  }

  confirmDelete(role: IRole) {
    Swal.fire({
      title: '¿Eliminar rol?',
      text: `¿Seguro que deseas eliminar el rol "${role.roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRole(role.idRole);
      }
    });
  }

  deleteRole(id: number) {
    this.isLoading = true;
    this.roleService.deleteRole(id).subscribe({
      next: (response: IRoleResponse) => {
        if (response.isSuccess) {
          this.roles = this.roles.filter(r => r.idRole !== id);
          this.filteredRoles = this.filteredRoles.filter(r => r.idRole !== id);
          Swal.fire('Éxito', 'Rol eliminado correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar rol', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al eliminar rol', error)
    });
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newRole = {
      roleName: '',
      description: '',
      status: 'E',
      isNotify: false
    };
    this.isEditing = false;
    this.currentRoleId = null;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}






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
//   selector: 'app-role',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent
//   ],
//   templateUrl: './role.component.html',
//   styleUrls: ['./role.component.scss']
// })
// export class RoleComponent implements OnInit {
//   @ViewChild('roleForm') roleForm!: NgForm;
//   showModal: boolean = false;
//   roles: any[] = [];
//   isLoading: boolean = false;

//   newRole = {
//     roleName: '',
//     description: '',
//     status: 'E'
//   };

//   constructor(private http: HttpClient, private location: Location) {}
//   goBack() {
//     this.location.back();
// }

//   ngOnInit() {
//     this.getRoles();
//   }

//   getRoles() {
//     this.isLoading = true;
//     this.http.get<any>(`${environment.baseUrlApi}/Role/List`).subscribe({
//       next: (response) => {
//         if (response.isSuccess) {
//           this.roles = response.value;
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener roles:', error);
//         this.isLoading = false;
//       }
//     });
//   }

//   openAddRoleModal() {
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.newRole = {
//       roleName: '',
//       description: '',
//       status: 'E'
//     };
//   }

//   addRole() {
//     if (this.roleForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const roleData = {
//       roleName: this.newRole.roleName.trim(),
//       description: this.newRole.description.trim(),
//       status: this.newRole.status
//     };

//     const headers = {
//       'Content-Type': 'application/json'
//     };

//     this.http.post(`${environment.baseUrlApi}/Role/Add`, roleData, { headers })
//       .subscribe({
//         next: (response: any) => {
//           this.isLoading = false;
//           if (response.isSuccess) {
//             Swal.fire({
//               title: 'Éxito',
//               text: 'Rol agregado correctamente',
//               icon: 'success',
//               timer: 3000
//             });
//             this.getRoles();
//             this.closeModal();
//           } else {
//             Swal.fire('Error', response.message || 'Error al agregar rol', 'error');
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