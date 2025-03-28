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











// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
// import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
// import Swal from 'sweetalert2';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
// import { MenuService } from '../../../../core/services/menu.service';
// import { IMenu, IMenuResponse } from '../../../../shared/models/IMenu';
// import { CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

// @Component({
//   selector: 'app-menu',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent,
//     InputSearchComponent,
//     CdkDropList,
//     CdkDrag
//   ],
//   templateUrl: './menu.component.html',
//   styleUrls: ['./menu.component.scss']
// })
// export class MenuComponent implements OnInit {
//   @ViewChild('menuForm') menuForm!: NgForm;
//   showModal: boolean = false;
//   menus: IMenu[] = [];
//   parentMenus: IMenu[] = [];
//   filteredMenus: IMenu[] = [];
//   isLoading: boolean = false;
//   isEditing: boolean = false;
//   currentMenuId: number | null = null;
  
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   searchTerm: string = '';
//   searchSubject = new Subject<string>();

//   newMenu: IMenu = {
//     nameMenu: '',
//     icon: '',
//     idMenuFather: null,
//     route: '',
//     status: 'E',
//     order: 0
//   };

//   constructor(private menuService: MenuService) {}

//   ngOnInit() {
//     this.getMenus();
    
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(term => {
//       this.searchTerm = term;
//       this.filterMenus();
//       this.currentPage = 1;
//     });
//   }

//   getMenuFatherName(idMenuFather: number | null): string {
//     if (!idMenuFather) return '';
//     const father = this.menus.find(m => m.idMenu === idMenuFather);
//     return father ? father.nameMenu : '';
//   }

//   get paginatedMenus() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     return this.filteredMenus.slice(startIndex, startIndex + this.itemsPerPage);
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredMenus.length / this.itemsPerPage);
//   }

//   handleSearch(searchTerm: string) {
//     this.searchSubject.next(searchTerm);
//   }

//   filterMenus() {
//     if (!this.searchTerm) {
//       this.filteredMenus = [...this.menus];
//       return;
//     }
    
//     const term = this.searchTerm.toLowerCase();
//     this.filteredMenus = this.menus.filter(menu => 
//       (menu.nameMenu?.toLowerCase().includes(term)) ||
//       (menu.route?.toLowerCase().includes(term)) ||
//       (menu.icon?.toLowerCase().includes(term)) ||
//       (menu.idMenu?.toString().includes(term)) ||
//       (menu.idMenuFather?.toString().includes(term))
//     );
//   }

//   getMenus() {
//     this.isLoading = true;
//     this.menuService.getMenus().subscribe({
//       next: (response) => {
//         if (response.isSuccess && response.value) {
//           this.menus = Array.isArray(response.value) ? response.value : [response.value];
//           this.menus.sort((a, b) => (a.order || 0) - (b.order || 0));
//           this.filteredMenus = [...this.menus];
//           this.parentMenus = this.menus.filter(menu => !menu.idMenuFather);
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener menús:', error);
//         this.isLoading = false;
//         Swal.fire('Error', 'No se pudieron cargar los menús', 'error');
//       }
//     });
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   previousPage() {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   goToPage(page: number) {
//     if (page >= 1 && page <= this.totalPages) this.currentPage = page;
//   }

//   openAddMenuModal() {
//     this.isEditing = false;
//     this.currentMenuId = null;
//     this.resetForm();
//     this.showModal = true;
//   }

//   openEditMenuModal(menu: IMenu) {
//     this.isEditing = true;
//     this.currentMenuId = menu.idMenu || null;
    
//     this.newMenu = {
//       ...menu,
//       nameMenu: menu.nameMenu || '',
//       icon: menu.icon || '',
//       idMenuFather: menu.idMenuFather || null,
//       route: menu.route || '',
//       status: menu.status || 'E',
//       order: menu.order || 0
//     };
    
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.newMenu = {
//       nameMenu: '',
//       icon: '',
//       idMenuFather: null,
//       route: '',
//       status: 'E',
//       order: 0
//     };
//     this.isEditing = false;
//     this.currentMenuId = null;
//   }

//   addMenu() {
//     if (this.menuForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const menuData = {
//       ...this.newMenu,
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       route: this.newMenu.route.trim(),
//       order: this.menus.length + 1
//     };

//     this.menuService.addMenu(menuData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           Swal.fire('Éxito', 'Menú creado correctamente', 'success');
//           this.getMenus();
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al crear menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
//         Swal.fire('Error', error.message || 'Error al crear menú', 'error');
//       }
//     });
//   }

//   updateMenu() {
//     if (this.menuForm.invalid || !this.currentMenuId) {
//       Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const menuData = {
//       ...this.newMenu,
//       idMenu: this.currentMenuId,
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       route: this.newMenu.route.trim()
//     };

//     this.menuService.updateMenu(this.currentMenuId, menuData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           Swal.fire('Éxito', 'Menú actualizado correctamente', 'success');
//           this.getMenus();
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al actualizar menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
//         Swal.fire('Error', error.message || 'Error al actualizar menú', 'error');
//       }
//     });
//   }

//   drop(event: CdkDragDrop<IMenu[]>) {
//     if (event.previousIndex === event.currentIndex) return;
    
//     moveItemInArray(this.filteredMenus, event.previousIndex, event.currentIndex);
//     this.updateOrdersAfterDrag();
//   }

//   updateOrdersAfterDrag() {
//     this.filteredMenus.forEach((menu, index) => {
//       menu.order = index + 1;
//     });
//     this.saveNewOrder();
//   }

//   saveNewOrder() {
//     this.isLoading = true;
//     this.menuService.updateMenuOrder(this.filteredMenus).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           this.getMenus();
//         } else {
//           Swal.fire('Error', response.error || 'Error al actualizar orden', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         Swal.fire('Error', error.message || 'Error al actualizar orden', 'error');
//       }
//     });
//   }

//   confirmDelete(menu: IMenu) {
//     Swal.fire({
//       title: '¿Confirmar eliminación?',
//       text: `¿Estás seguro de eliminar "${menu.nameMenu}"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.deleteMenu(menu);
//       }
//     });
//   }

//   deleteMenu(menu: IMenu) {
//     if (!menu.idMenu) {
//       Swal.fire('Error', 'No se puede eliminar un menú sin ID', 'error');
//       return;
//     }

//     this.isLoading = true;
//     this.menuService.deleteMenu(menu.idMenu).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           this.menus = this.menus.filter(m => m.idMenu !== menu.idMenu);
//           this.filteredMenus = this.filteredMenus.filter(m => m.idMenu !== menu.idMenu);
//           Swal.fire('Éxito', 'Menú eliminado correctamente', 'success');
//         } else {
//           Swal.fire('Error', response.error || 'Error al eliminar menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         Swal.fire('Error', error.message || 'Error al eliminar menú', 'error');
//       }
//     });
//   }
// }








// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
// import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
// import Swal from 'sweetalert2';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
// import { MenuService } from '../../../../core/services/menu.service';
// import { IMenu, IMenuResponse } from '../../../../shared/models/IMenu';

// @Component({
//   selector: 'app-menu',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent,
//     InputSearchComponent
//   ],
//   templateUrl: './menu.component.html',
//   styleUrls: ['./menu.component.scss']
// })
// export class MenuComponent implements OnInit {
//   @ViewChild('menuForm') menuForm!: NgForm;
//   showModal: boolean = false;
//   menus: IMenu[] = [];
//   parentMenus: IMenu[] = [];
//   filteredMenus: IMenu[] = [];
//   isLoading: boolean = false;
//   isEditing: boolean = false;
//   currentMenuId: number | null = null;
  
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   searchTerm: string = '';
//   searchSubject = new Subject<string>();

//   newMenu: IMenu = {
//     nameMenu: '',
//     icon: '',
//     idMenuFather: null,
//     route: '',
//     status: 'E',
//     order: 1
//   };

//   constructor(private menuService: MenuService) {}

//   ngOnInit() {
//     this.getMenus();
    
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(term => {
//       this.searchTerm = term;
//       this.filterMenus();
//       this.currentPage = 1;
//     });
//   }

//   getMenuFatherName(idMenuFather: number | null): string {
//     if (!idMenuFather) return '';
//     const father = this.menus.find(m => m.idMenu === idMenuFather);
//     return father ? father.nameMenu : '';
//   }

//   get paginatedMenus() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     return this.filteredMenus.slice(startIndex, startIndex + this.itemsPerPage);
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredMenus.length / this.itemsPerPage);
//   }

//   handleSearch(searchTerm: string) {
//     this.searchSubject.next(searchTerm);
//   }

//   filterMenus() {
//     if (!this.searchTerm) {
//       this.filteredMenus = [...this.menus];
//       return;
//     }
    
//     const term = this.searchTerm.toLowerCase();
//     this.filteredMenus = this.menus.filter(menu => 
//       (menu.nameMenu?.toLowerCase().includes(term)) ||
//       (menu.route?.toLowerCase().includes(term)) ||
//       (menu.icon?.toLowerCase().includes(term)) ||
//       (menu.idMenu?.toString().includes(term)) ||
//       (menu.idMenuFather?.toString().includes(term))
//     );
//   }

//   getMenus() {
//     this.isLoading = true;
//     this.menuService.getMenus().subscribe({
//       next: (response) => {
//         if (response.isSuccess && response.value) {
//           this.menus = Array.isArray(response.value) ? response.value : [response.value];
//           this.filteredMenus = [...this.menus];
//           this.parentMenus = this.menus.filter(menu => !menu.idMenuFather);
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener menús:', error);
//         this.isLoading = false;
//         Swal.fire('Error', 'No se pudieron cargar los menús', 'error');
//       }
//     });
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   previousPage() {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   goToPage(page: number) {
//     if (page >= 1 && page <= this.totalPages) this.currentPage = page;
//   }

//   openAddMenuModal() {
//     this.isEditing = false;
//     this.currentMenuId = null;
//     this.resetForm();
//     this.showModal = true;
//   }

//   openEditMenuModal(menu: IMenu) {
//     this.isEditing = true;
//     this.currentMenuId = menu.idMenu || null;
    
//     this.newMenu = {
//       nameMenu: menu.nameMenu || '',
//       icon: menu.icon || '',
//       idMenuFather: menu.idMenuFather || null,
//       route: menu.route || '',
//       status: menu.status || 'E',
//       order: menu.order || 1
//     };
    
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.newMenu = {
//       nameMenu: '',
//       icon: '',
//       idMenuFather: null,
//       route: '',
//       status: 'E',
//       order: 1
//     };
//     this.isEditing = false;
//     this.currentMenuId = null;
//   }

//   addMenu() {
//     if (this.menuForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const menuData = {
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       idMenuFather: this.newMenu.idMenuFather || null,
//       route: this.newMenu.route.trim(),
//       status: this.newMenu.status,
//       order: this.newMenu.order || 1
//     };

//     this.menuService.addMenu(menuData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           Swal.fire('Éxito', 'Menú creado correctamente', 'success');
//           this.getMenus();
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al crear menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
        
//         let errorMessage = 'Error al crear el menú';
//         if (error.error?.errors) {
//           errorMessage = Object.values(error.error.errors).join('<br>');
//         } else if (error.error?.message) {
//           errorMessage = error.error.message;
//         }
        
//         Swal.fire('Error', errorMessage, 'error');
//       }
//     });
//   }

//   updateMenu() {
//     if (this.menuForm.invalid || !this.currentMenuId) {
//       Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const menuData = {
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       idMenuFather: this.newMenu.idMenuFather || null,
//       route: this.newMenu.route.trim(),
//       status: this.newMenu.status,
//       order: this.newMenu.order || 1
//     };

//     this.menuService.updateMenu(this.currentMenuId, menuData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           Swal.fire('Éxito', 'Menú actualizado correctamente', 'success');
//           this.getMenus();
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al actualizar menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
        
//         let errorMessage = 'Error al actualizar el menú';
//         if (error.error?.errors) {
//           errorMessage = Object.values(error.error.errors).join('<br>');
//         } else if (error.error?.message) {
//           errorMessage = error.error.message;
//         }
        
//         Swal.fire('Error', errorMessage, 'error');
//       }
//     });
//   }

//   confirmDelete(menu: IMenu) {
//     Swal.fire({
//       title: '¿Confirmar eliminación?',
//       text: `¿Estás seguro de eliminar "${menu.nameMenu}"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.deleteMenu(menu);
//       }
//     });
//   }

//   deleteMenu(menu: IMenu) {
//     if (!menu.idMenu) {
//       Swal.fire('Error', 'No se puede eliminar un menú sin ID', 'error');
//       return;
//     }

//     this.isLoading = true;

//     this.menuService.deleteMenu(menu.idMenu).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           this.menus = this.menus.filter(m => m.idMenu !== menu.idMenu);
//           this.filteredMenus = this.filteredMenus.filter(m => m.idMenu !== menu.idMenu);
//           Swal.fire('Éxito', 'Menú eliminado correctamente', 'success');
//         } else {
//           Swal.fire('Error', response.error || 'Error al eliminar menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
        
//         let errorMessage = 'Error al eliminar el menú';
//         if (error.error?.error) {
//           errorMessage = error.error.error;
//         } else if (error.error?.message) {
//           errorMessage = error.error.message;
//         }
        
//         Swal.fire('Error', errorMessage, 'error');
//       }
//     });
//   }
// }














// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
// import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
// import Swal from 'sweetalert2';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
// import { MenuService } from '../../../../core/services/menu.service';
// import { IMenu, IMenuResponse } from '../../../../shared/models/IMenu';

// @Component({
//   selector: 'app-menu',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent,
//     InputSearchComponent
//   ],
//   templateUrl: './menu.component.html',
//   styleUrls: ['./menu.component.scss']
// })
// export class MenuComponent implements OnInit {
//   @ViewChild('menuForm') menuForm!: NgForm;
//   showModal: boolean = false;
//   menus: IMenu[] = [];
//   parentMenus: IMenu[] = [];
//   filteredMenus: IMenu[] = [];
//   isLoading: boolean = false;
//   isEditing: boolean = false;
//   currentMenuId: number | null = null;
  
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   searchTerm: string = '';
//   searchSubject = new Subject<string>();

//   newMenu = {
//     idMenu: 0,
//     nameMenu: '',
//     icon: '',
//     idMenuFather: null, // Se convertirá a 0 al enviar
//     menuFather: '', // Cadena vacía por defecto
//     route: '',
//     order: 1,
//     status: 'E',
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     created_by: 1, // ID del usuario logueado
//     deleted_at: null
//   };

//   constructor(private menuService: MenuService) {}

//   ngOnInit() {
//     this.getMenus();
    
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(term => {
//       this.searchTerm = term;
//       this.filterMenus();
//       this.currentPage = 1;
//     });
//   }

//   getMenuFatherName(idMenuFather: number | null): string {
//     if (!idMenuFather) return '';
//     const father = this.menus.find(m => m.idMenu === idMenuFather);
//     return father ? father.nameMenu : '';
//   }

//   get paginatedMenus() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     return this.filteredMenus.slice(startIndex, startIndex + this.itemsPerPage);
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredMenus.length / this.itemsPerPage);
//   }

//   handleSearch(searchTerm: string) {
//     this.searchSubject.next(searchTerm);
//   }

//   filterMenus() {
//     if (!this.searchTerm) {
//       this.filteredMenus = [...this.menus];
//       return;
//     }
    
//     const term = this.searchTerm.toLowerCase();
//     this.filteredMenus = this.menus.filter(menu => 
//       (menu.nameMenu?.toLowerCase().includes(term)) ||
//       (menu.route?.toLowerCase().includes(term)) ||
//       (menu.icon?.toLowerCase().includes(term)) ||
//       (menu.idMenu?.toString().includes(term)) ||
//       (menu.idMenuFather?.toString().includes(term))
//     );
//   }

//   getMenus() {
//     this.isLoading = true;
//     this.menuService.getMenus().subscribe({
//       next: (response) => {
//         if (response.isSuccess && response.value) {
//           this.menus = Array.isArray(response.value) ? response.value : [response.value];
//           this.filteredMenus = [...this.menus];
//           this.parentMenus = this.menus.filter(menu => !menu.idMenuFather);
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener menús:', error);
//         this.isLoading = false;
//         Swal.fire('Error', 'No se pudieron cargar los menús', 'error');
//       }
//     });
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   previousPage() {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   goToPage(page: number) {
//     if (page >= 1 && page <= this.totalPages) this.currentPage = page;
//   }

//   openAddMenuModal() {
//     this.isEditing = false;
//     this.currentMenuId = null;
//     this.resetForm();
//     this.showModal = true;
//   }



//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.newMenu = {
//       idMenu: 0,
//       nameMenu: '',
//       icon: '',
//       idMenuFather: null,
//       menuFather: '',
//       route: '',
//       order: 1,
//       status: 'E',
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//       created_by: 1,
//       deleted_at: null
//     };
//     this.isEditing = false;
//     this.currentMenuId = null;
//   }

  
//   addMenu() {
//     if (this.menuForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }
  
//     this.isLoading = true;
  
//     // Preparar el objeto exactamente como lo espera el API
//     const menuData = {
//       idMenu: 0, // Siempre 0 para creación
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       idMenuFather: this.newMenu.idMenuFather || 0, // Asegurar número (0 si es null)
//       menuFather: this.newMenu.idMenuFather ? this.getMenuFatherName(this.newMenu.idMenuFather) : '', // Cadena vacía si no hay padre
//       route: this.newMenu.route.trim(),
//       status: this.newMenu.status,
//       order: Number(this.newMenu.order) || 0, // Asegurar número
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//       created_by: 1, // Cambiar por el ID real del usuario
//       deleted_at: null // Mantener como null para creación
//     };
  
//     console.log('Datos a enviar:', JSON.stringify(menuData, null, 2));
  
//     this.menuService.addMenu(menuData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           Swal.fire('Éxito', 'Menú creado correctamente', 'success');
//           this.getMenus(); // Actualizar la lista
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al crear menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
        
//         let errorMessage = 'Error al crear el menú';
//         if (error.error?.errors) {
//           errorMessage = Object.values(error.error.errors).join('<br>');
//         } else if (error.error?.message) {
//           errorMessage = error.error.message;
//         }
        
//         Swal.fire('Error', errorMessage, 'error');
//       }
//     });
//   }




//   updateMenu() {
//     if (this.menuForm.invalid || !this.currentMenuId) {
//       Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const menuData: IMenu = {
//       ...this.newMenu,
//       idMenu: this.currentMenuId,
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       route: this.newMenu.route.trim(),
//       order: Number(this.newMenu.order),
//       menuFather: this.getMenuFatherName(this.newMenu.idMenuFather) || '',
//       updated_at: new Date().toISOString()
//     };

//     console.log('Datos a enviar para actualización:', menuData);

//     this.menuService.updateMenu(menuData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           Swal.fire('Éxito', 'Menú actualizado correctamente', 'success');
//           this.getMenus();
//           this.closeModal();
//         } else {
//           Swal.fire('Error', response.error || 'Error al actualizar menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
        
//         let errorMessage = 'Error al actualizar el menú';
//         if (error.error?.errors) {
//           errorMessage = Object.values(error.error.errors).join('<br>');
//         } else if (error.error?.message) {
//           errorMessage = error.error.message;
//         }
        
//         Swal.fire('Error', errorMessage, 'error');
//       }
//     });
//   }

//   confirmDelete(menu: IMenu) {
//     Swal.fire({
//       title: '¿Confirmar eliminación?',
//       text: `¿Estás seguro de eliminar "${menu.nameMenu}"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.deleteMenu(menu);
//       }
//     });
//   }

//   deleteMenu(menu: IMenu) {
//     this.isLoading = true;

//     this.menuService.deleteMenu(menu).subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response.isSuccess) {
//           // Eliminar localmente sin recargar
//           this.menus = this.menus.filter(m => m.idMenu !== menu.idMenu);
//           this.filteredMenus = this.filteredMenus.filter(m => m.idMenu !== menu.idMenu);
//           Swal.fire('Éxito', 'Menú eliminado correctamente', 'success');
//         } else {
//           Swal.fire('Error', response.error || 'Error al eliminar menú', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error completo:', error);
        
//         let errorMessage = 'Error al eliminar el menú';
//         if (error.error?.error) {
//           errorMessage = error.error.error;
//         } else if (error.error?.message) {
//           errorMessage = error.error.message;
//         }
        
//         Swal.fire('Error', errorMessage, 'error');
//       }
//     });
//   }

//   private prepareMenuData(): IMenu {
//     return {
//       ...this.newMenu,
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       route: this.newMenu.route.trim(),
//       order: Number(this.newMenu.order),
//       menuFather: this.getMenuFatherName(this.newMenu.idMenuFather),
//       updated_at: new Date().toISOString()
//     };
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
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

// @Component({
//   selector: 'app-menu',
//   standalone: true,
//   imports: [
//     FormsModule, 
//     CommonModule,
//     BtnAcceptComponent,
//     BtnCloseComponent,
//     InputSearchComponent
//   ],
//   templateUrl: './menu.component.html',
//   styleUrls: ['./menu.component.scss']
// })
// export class MenuComponent implements OnInit {
//   @ViewChild('menuForm') menuForm!: NgForm;
//   showModal: boolean = false;
//   menus: any[] = [];
//   filteredMenus: any[] = [];
//   isLoading: boolean = false;
  
//   // Pagination
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   searchTerm: string = '';
//   searchSubject = new Subject<string>();

//   newMenu = {
//     nameMenu: '',
//     icon: '',
//     idMenuFather: null,
//     route: '',
//     status: 'E'
//   };

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.getMenus();
    
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged()
//     ).subscribe(term => {
//       this.searchTerm = term;
//       this.filterMenus();
//       this.currentPage = 1;
//     });
//   }

//   get paginatedMenus() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     return this.filteredMenus.slice(startIndex, endIndex);
//   }

//   get totalPages() {
//     return Math.ceil(this.filteredMenus.length / this.itemsPerPage);
//   }


//   handleSearch(searchTerm: string) {
//     this.searchTerm = searchTerm;
//     this.filterMenus();
//     this.currentPage = 1;
//   }



//   filterMenus() {
//     if (!this.searchTerm) {
//       this.filteredMenus = [...this.menus];
//       return;
//     }
    
//     const term = this.searchTerm.toLowerCase();
//     this.filteredMenus = this.menus.filter(menu => 
//       (menu.nameMenu?.toLowerCase().includes(term)) ||
//       (menu.route?.toLowerCase().includes(term)) ||
//       (menu.icon?.toLowerCase().includes(term)) ||
//       (menu.idMenu?.toString().includes(term)) ||
//       (menu.idMenuFather?.toString().includes(term))
//     );
//   }

//   getMenus() {
//     this.isLoading = true;
//     this.http.get<any>(`${environment.baseUrlApi}/Menu/List`).subscribe({
//       next: (response) => {
//         if (response.isSuccess) {
//           this.menus = response.value;
//           this.filteredMenus = [...this.menus];
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error al obtener menús:', error);
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





//   openAddMenuModal() {
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.newMenu = {
//       nameMenu: '',
//       icon: '',
//       idMenuFather: null,
//       route: '',
//       status: 'E'
//     };
//   }

//   addMenu() {
//     if (this.menuForm.invalid) {
//       Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
//       return;
//     }

//     this.isLoading = true;

//     const menuData = {
//       nameMenu: this.newMenu.nameMenu.trim(),
//       icon: this.newMenu.icon.trim(),
//       idMenuFather: this.newMenu.idMenuFather,
//       route: this.newMenu.route.trim(),
//       status: this.newMenu.status
//     };

//     const headers = {
//       'Content-Type': 'application/json'
//     };

//     this.http.post(`${environment.baseUrlApi}/Menu/Add`, menuData, { headers })
//       .subscribe({
//         next: (response: any) => {
//           this.isLoading = false;
//           if (response.isSuccess) {
//             Swal.fire({
//               title: 'Éxito',
//               text: 'Menú agregado correctamente',
//               icon: 'success',
//               timer: 3000
//             });
//             this.getMenus();
//             this.closeModal();
//           } else {
//             Swal.fire('Error', response.message || 'Error al agregar menú', 'error');
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