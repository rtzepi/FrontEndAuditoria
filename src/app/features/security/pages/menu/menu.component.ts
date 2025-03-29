import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { MenuService } from '../../../../core/services/menu.service';
import { IMenu, IMenuResponse } from '../../../../shared/models/IMenu';
import { Location } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    BtnAcceptComponent,
    BtnCloseComponent,
    InputSearchComponent
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @ViewChild('menuForm') menuForm!: NgForm;
  showModal: boolean = false;
  menus: IMenu[] = [];
  parentMenus: IMenu[] = [];
  filteredMenus: IMenu[] = [];
  isLoading: boolean = false;
  isEditing: boolean = false;
  currentMenuId: number | null = null;
  
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  searchSubject = new Subject<string>();

  newMenu: IMenu = {
    nameMenu: '',
    icon: '',
    idMenuFather: null,
    route: '',
    status: 'E',
    order: 0
  };

  constructor(private menuService: MenuService,  private location: Location) {}
  goBack() {
    this.location.back();
}

  ngOnInit() {
    this.getMenus();
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterMenus();
      this.currentPage = 1;
    });
  }

  getMenuFatherName(idMenuFather: number | null): string {
    if (!idMenuFather) return '';
    const father = this.menus.find(m => m.idMenu === idMenuFather);
    return father ? father.nameMenu : '';
  }

  get paginatedMenus() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMenus.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredMenus.length / this.itemsPerPage);
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterMenus() {
    if (!this.searchTerm) {
      this.filteredMenus = [...this.menus];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredMenus = this.menus.filter(menu => 
      (menu.nameMenu?.toLowerCase().includes(term)) ||
      (menu.route?.toLowerCase().includes(term)) ||
      (menu.icon?.toLowerCase().includes(term)) ||
      (menu.idMenu?.toString().includes(term)) ||
      (menu.idMenuFather?.toString().includes(term))
    );
  }

  getMenus() {
    this.isLoading = true;
    this.menuService.getMenus().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.menus = Array.isArray(response.value) ? response.value : [response.value];
          this.menus.sort((a, b) => (a.order || 0) - (b.order || 0));
          this.filteredMenus = [...this.menus];
          this.parentMenus = this.menus.filter(menu => !menu.idMenuFather);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener menús:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los menús', 'error');
      }
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  openAddMenuModal() {
    this.isEditing = false;
    this.currentMenuId = null;
    this.resetForm();
    this.newMenu.order = this.menus.length > 0 ? 
      Math.max(...this.menus.map(m => m.order || 0)) + 1 : 1;
    this.showModal = true;
  }

  openEditMenuModal(menu: IMenu) {
    this.isEditing = true;
    this.currentMenuId = menu.idMenu || null;
    
    this.newMenu = {
      ...menu,
      nameMenu: menu.nameMenu || '',
      icon: menu.icon || '',
      idMenuFather: menu.idMenuFather || null,
      route: menu.route || '',
      status: menu.status || 'E',
      order: menu.order || 0
    };
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newMenu = {
      nameMenu: '',
      icon: '',
      idMenuFather: null,
      route: '',
      status: 'E',
      order: 0
    };
    this.isEditing = false;
    this.currentMenuId = null;
  }

  addMenu() {
    if (this.menuForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const menuData = {
      ...this.newMenu,
      nameMenu: this.newMenu.nameMenu.trim(),
      icon: this.newMenu.icon.trim(),
      route: this.newMenu.route.trim()
    };

    this.menuService.addMenu(menuData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          Swal.fire('Éxito', 'Menú creado correctamente', 'success');
          this.getMenus();
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al crear menú', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error completo:', error);
        Swal.fire('Error', error.message || 'Error al crear menú', 'error');
      }
    });
  }

  updateMenu() {
    if (this.menuForm.invalid || !this.currentMenuId) {
      Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const menuData = {
      ...this.newMenu,
      idMenu: this.currentMenuId,
      nameMenu: this.newMenu.nameMenu.trim(),
      icon: this.newMenu.icon.trim(),
      route: this.newMenu.route.trim()
    };

    this.menuService.updateMenu(this.currentMenuId, menuData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          Swal.fire('Éxito', 'Menú actualizado correctamente', 'success');
          this.getMenus();
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al actualizar menú', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error completo:', error);
        Swal.fire('Error', error.message || 'Error al actualizar menú', 'error');
      }
    });
  }

  confirmDelete(menu: IMenu) {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: `¿Estás seguro de eliminar "${menu.nameMenu}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteMenu(menu);
      }
    });
  }

  deleteMenu(menu: IMenu) {
    if (!menu.idMenu) {
      Swal.fire('Error', 'No se puede eliminar un menú sin ID', 'error');
      return;
    }

    this.isLoading = true;
    this.menuService.deleteMenu(menu.idMenu).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.menus = this.menus.filter(m => m.idMenu !== menu.idMenu);
          this.filteredMenus = this.filteredMenus.filter(m => m.idMenu !== menu.idMenu);
          Swal.fire('Éxito', 'Menú eliminado correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar menú', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.message || 'Error al eliminar menú', 'error');
      }
    });
  }
}

