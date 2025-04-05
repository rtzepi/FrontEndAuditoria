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
  nameExists = false;

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
          if (Array.isArray(response.value)) {
            this.roles = response.value;
          } else {
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

  checkRoleNameExists() {
    if (!this.newRole.roleName || this.newRole.roleName.trim() === '') {
      this.nameExists = false;
      return;
    }
    if (this.isEditing && this.currentRoleId) {
      const currentRole = this.roles.find(r => r.idRole === this.currentRoleId);
      if (currentRole && currentRole.roleName === this.newRole.roleName) {
        this.nameExists = false;
        return;
      }
    }

    this.nameExists = this.roles.some(role => 
      role.roleName?.toLowerCase() === this.newRole.roleName?.toLowerCase()
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
    this.nameExists = false;
    
    this.newRole = {
      roleName: role.roleName,
      description: role.description || '',
      status: role.status,
      isNotify: role.isNotify || false
    };
    
    this.showModal = true;
  }

  addRole() {
    if (this.roleForm.invalid || this.nameExists) return;

    this.isLoading = true;
    this.roleService.addRole(this.newRole).subscribe({
      next: (response: IRoleResponse) => {
        if (response.isSuccess && response.value) {
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
    if (!this.currentRoleId || this.roleForm.invalid || this.nameExists) return;

    const updateData: IRoleUpdateRequest = {
      ...this.newRole,
      idRole: this.currentRoleId
    };

    this.isLoading = true;
    this.roleService.updateRole(this.currentRoleId, updateData).subscribe({
      next: (response: IRoleResponse) => {
        if (response.isSuccess && response.value) {
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
    this.nameExists = false;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}