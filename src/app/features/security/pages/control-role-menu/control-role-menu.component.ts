// control-role-menu.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../../../../app/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

@Component({
  selector: 'app-control-role-menu',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    BtnAcceptComponent,
    BtnCloseComponent,
    InputSearchComponent
  ],
  templateUrl: './control-role-menu.component.html',
  styleUrls: ['./control-role-menu.component.scss']
})
export class ControlRoleMenuComponent implements OnInit {
  @ViewChild('roleMenuForm') roleMenuForm!: NgForm;
  showModal: boolean = false;
  roleMenus: any[] = [];
  filteredRoleMenus: any[] = [];
  roles: any[] = [];
  menus: any[] = [];
  isLoading: boolean = false;
  isEditing: boolean = false;
  currentRoleMenuId: number | null = null;
  originalRoleMenu: any = null;
  hasChanges: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  searchSubject = new Subject<string>();

  newRoleMenu = {
    idRole: 0,
    idMenu: 0,
    status: 'E'
  };

  constructor(private http: HttpClient, private location: Location) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.loadData();
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterRoleMenus();
      this.currentPage = 1;
    });
  }

  loadData() {
    this.isLoading = true;
    
    // Cargar roles
    this.http.get<any>(`${environment.baseUrlApi}/Role/List`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roles = response.value;
          // Cargar menús después de cargar roles
          this.loadMenus();
        }
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.isLoading = false;
      }
    });
  }

  loadMenus() {
    this.http.get<any>(`${environment.baseUrlApi}/Menu/List`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.menus = response.value;
          // Cargar relaciones rol-menú después de cargar menús
          this.loadRoleMenus();
        }
      },
      error: (error) => {
        console.error('Error loading menus', error);
        this.isLoading = false;
      }
    });
  }

  loadRoleMenus() {
    this.http.get<any>(`${environment.baseUrlApi}/RoleMenu/List`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roleMenus = response.value.map((roleMenu: any) => {
            // Encontrar el rol correspondiente
            const role = this.roles.find(r => r.idRole === roleMenu.idRole);
            // Encontrar el menú correspondiente
            const menu = this.menus.find(m => m.idMenu === roleMenu.idMenu);
            
            return {
              ...roleMenu,
              role: role ? { ...role } : null,
              menu: menu ? { ...menu } : null
            };
          });
          
          this.filteredRoleMenus = [...this.roleMenus];
          this.updatePaginatedData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading role menus', error);
        this.isLoading = false;
      }
    });
  }

  getRoleName(idRole: number): string {
    const role = this.roles.find(r => r.idRole === idRole);
    return role ? role.roleName : 'N/A';
  }

  getMenuName(idMenu: number): string {
    const menu = this.menus.find(m => m.idMenu === idMenu);
    return menu ? menu.nameMenu : 'N/A';
  }

  get paginatedRoleMenus() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoleMenus.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredRoleMenus.length / this.itemsPerPage);
  }

  updatePaginatedData() {
    this.currentPage = 1;
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterRoleMenus() {
    if (!this.searchTerm) {
      this.filteredRoleMenus = [...this.roleMenus];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredRoleMenus = this.roleMenus.filter(roleMenu => 
      (this.getMenuName(roleMenu.idMenu)?.toLowerCase().includes(term)) ||
      (this.getRoleName(roleMenu.idRole)?.toLowerCase().includes(term)) ||
      (roleMenu.idRoleMenu?.toString().includes(term)) ||
      (roleMenu.idRole?.toString().includes(term)) ||
      (roleMenu.idMenu?.toString().includes(term))
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddRoleMenuModal() {
    this.isEditing = false;
    this.currentRoleMenuId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditRoleMenuModal(roleMenu: any) {
    this.isEditing = true;
    this.currentRoleMenuId = roleMenu.idRoleMenu;
    
    this.originalRoleMenu = {
      idRole: roleMenu.idRole,
      idMenu: roleMenu.idMenu,
      status: roleMenu.status
    };
    
    this.newRoleMenu = {...this.originalRoleMenu};
    this.checkForChanges();
    this.showModal = true;
  }

  onFormChange() {
    this.checkForChanges();
  }

  checkForChanges() {
    if (!this.isEditing) return;
    this.hasChanges = !(
      this.newRoleMenu.idRole === this.originalRoleMenu.idRole &&
      this.newRoleMenu.idMenu === this.originalRoleMenu.idMenu &&
      this.newRoleMenu.status === this.originalRoleMenu.status
    );
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newRoleMenu = {
      idRole: 0,
      idMenu: 0,
      status: 'E'
    };
    this.isEditing = false;
    this.currentRoleMenuId = null;
    this.originalRoleMenu = null;
    this.hasChanges = false;
  }

  addRoleMenu() {
    if (this.roleMenuForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const roleMenuData = {
      idRole: this.newRoleMenu.idRole,
      idMenu: this.newRoleMenu.idMenu,
      status: this.newRoleMenu.status
    };

    this.http.post(`${environment.baseUrlApi}/RoleMenu/Add`, roleMenuData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Relación Rol-Menú agregada correctamente',
              icon: 'success',
              timer: 3000
            }).then(() => {
              this.loadData();
              this.closeModal();
            });
          } else {
            Swal.fire('Error', response.message || 'Error al agregar relación', 'error');
          }
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error al conectar con el servidor';
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          }
          Swal.fire('Error', errorMessage, 'error');
          console.error('Error completo:', error);
        }
      });
  }

  updateRoleMenu() {
    if (this.roleMenuForm.invalid || !this.currentRoleMenuId || !this.hasChanges) {
      return;
    }

    this.isLoading = true;

    const roleMenuData = {
      idRoleMenu: this.currentRoleMenuId,
      idRole: this.newRoleMenu.idRole,
      idMenu: this.newRoleMenu.idMenu,
      status: this.newRoleMenu.status
    };

    this.http.put(`${environment.baseUrlApi}/RoleMenu/${this.currentRoleMenuId}`, roleMenuData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Relación Rol-Menú actualizada correctamente',
              icon: 'success',
              timer: 3000
            }).then(() => {
              this.loadData();
              this.closeModal();
            });
          } else {
            Swal.fire('Error', response.message || 'Error al actualizar relación', 'error');
          }
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error al conectar con el servidor';
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          }
          Swal.fire('Error', errorMessage, 'error');
          console.error('Error completo:', error);
        }
      });
  }

  confirmDelete(roleMenu: any) {
    const roleName = this.getRoleName(roleMenu.idRole);
    const menuName = this.getMenuName(roleMenu.idMenu);
    
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: `¿Estás seguro de eliminar la relación entre ${roleName} y ${menuName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRoleMenu(roleMenu);
      }
    });
  }

  deleteRoleMenu(roleMenu: any) {
    if (!roleMenu.idRoleMenu) {
        Swal.fire('Error', 'No se puede eliminar una relación sin ID', 'error');
        return;
    }

    this.isLoading = true;
    
    const deleteUrl = `${environment.baseUrlApi}/RoleMenu?id=${roleMenu.idRoleMenu}`;
    
    this.http.delete(deleteUrl)
        .subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response.isSuccess) {
                  
                    this.roleMenus = this.roleMenus.filter(rm => rm.idRoleMenu !== roleMenu.idRoleMenu);
                    this.filteredRoleMenus = this.filteredRoleMenus.filter(rm => rm.idRoleMenu !== roleMenu.idRoleMenu);
                    Swal.fire('Éxito', 'Relación eliminada correctamente', 'success');
                } else {
                    Swal.fire('Error', response.message || 'Error al eliminar relación', 'error');
                }
            },
            error: (error) => {
                this.isLoading = false;
                let errorMessage = 'Error al conectar con el servidor';
                if (error.error?.message) {
                    errorMessage += `: ${error.error.message}`;
                }
                Swal.fire('Error', errorMessage, 'error');
                console.error('Detalles del error:', {
                    status: error.status,
                    message: error.message,
                    url: error.url,
                    error: error.error
                });
            }
        });
  }
}