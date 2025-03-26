import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../../../../app/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

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
  menus: any[] = [];
  filteredMenus: any[] = [];
  isLoading: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  searchSubject = new Subject<string>();

  newMenu = {
    nameMenu: '',
    icon: '',
    idMenuFather: null,
    route: '',
    status: 'E'
  };

  constructor(private http: HttpClient) {}

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

  get paginatedMenus() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMenus.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.filteredMenus.length / this.itemsPerPage);
  }


  handleSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterMenus();
    this.currentPage = 1;
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
    this.http.get<any>(`${environment.baseUrlApi}/Menu/List`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.menus = response.value;
          this.filteredMenus = [...this.menus];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener menús:', error);
        this.isLoading = false;
      }
    });
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }





  openAddMenuModal() {
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
      status: 'E'
    };
  }

  addMenu() {
    if (this.menuForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const menuData = {
      nameMenu: this.newMenu.nameMenu.trim(),
      icon: this.newMenu.icon.trim(),
      idMenuFather: this.newMenu.idMenuFather,
      route: this.newMenu.route.trim(),
      status: this.newMenu.status
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    this.http.post(`${environment.baseUrlApi}/Menu/Add`, menuData, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Menú agregado correctamente',
              icon: 'success',
              timer: 3000
            });
            this.getMenus();
            this.closeModal();
          } else {
            Swal.fire('Error', response.message || 'Error al agregar menú', 'error');
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
}