import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { CategoryProductService } from '../../../../core/services/category-product.service';
import { ICategoryProduct } from '../../../../shared/models/ICategoryProduct';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-category-conf',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    BtnAcceptComponent,
    BtnCloseComponent,
    InputSearchComponent
  ],
  templateUrl: './product-category-conf.component.html',
  styleUrls: ['./product-category-conf.component.scss']
})
export class ProductCategoryConfComponent implements OnInit {
  @ViewChild('categoryForm') categoryForm!: NgForm;
  showModal: boolean = false;
  categories: ICategoryProduct[] = [];
  filteredCategories: ICategoryProduct[] = [];
  isLoading: boolean = false;
  isEditing: boolean = false;
  currentCategoryId: number | null = null;
  
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  searchSubject = new Subject<string>();

  newCategory: ICategoryProduct = {
    idCategory: 0,
    categoryName: '',
    description: '',
    status: 'E'
  };

  constructor(
    private categoryService: CategoryProductService,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.getCategories();
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterCategories();
      this.currentPage = 1;
    });
  }

  get paginatedCategories() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredCategories.length / this.itemsPerPage);
  }

  handleSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  filterCategories() {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.categories];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(category => 
      (category.categoryName?.toLowerCase().includes(term)) ||
      (category.description?.toLowerCase().includes(term)) ||
      (category.idCategory?.toString().includes(term))
    );
  }

  getCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.categories = Array.isArray(response.value) ? response.value : [response.value];
          this.filteredCategories = [...this.categories];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener categorías:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
      }
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openAddCategoryModal() {
    this.isEditing = false;
    this.currentCategoryId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditCategoryModal(category: ICategoryProduct) {
    this.isEditing = true;
    this.currentCategoryId = category.idCategory || null;
    
    this.newCategory = {
      ...category,
      categoryName: category.categoryName || '',
      description: category.description || '',
      status: category.status || 'Activo'
    };
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newCategory = {
      categoryName: '',
      description: '',
      creationDate: new Date(),
      status: 'Activo'
    };
    this.isEditing = false;
    this.currentCategoryId = null;
  }

  addCategory() {
    if (this.categoryForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const categoryData = {
      ...this.newCategory,
      category: this.newCategory.categoryName.trim(),
      description: this.newCategory.description.trim()
    };

    this.categoryService.addCategory(categoryData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          Swal.fire('Éxito', 'Categoría creada correctamente', 'success');
          this.getCategories();
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al crear categoría', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error completo:', error);
        Swal.fire('Error', error.message || 'Error al crear categoría', 'error');
      }
    });
  }

  updateCategory() {
    if (this.categoryForm.invalid || !this.currentCategoryId) {
      Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const categoryData = {
      ...this.newCategory,
      id: this.currentCategoryId,
      category: this.newCategory.categoryName.trim(),
      description: this.newCategory.description.trim()
    };

    this.categoryService.updateCategory(this.currentCategoryId, categoryData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          Swal.fire('Éxito', 'Categoría actualizada correctamente', 'success');
          this.getCategories();
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al actualizar categoría', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error completo:', error);
        Swal.fire('Error', error.message || 'Error al actualizar categoría', 'error');
      }
    });
  }

  confirmDelete(category: ICategoryProduct) {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: `¿Estás seguro de eliminar "${category.categoryName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCategory(category);
      }
    });
  }

  deleteCategory(category: ICategoryProduct) {
    if (!category.idCategory) {
      Swal.fire('Error', 'No se puede eliminar una categoría sin ID', 'error');
      return;
    }

    this.isLoading = true;
    this.categoryService.deleteCategory(category.idCategory).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          this.categories = this.categories.filter(c => c.idCategory !== category.idCategory);
          this.filteredCategories = this.filteredCategories.filter(c => c.idCategory !== category.idCategory);
          Swal.fire('Éxito', 'Categoría eliminada correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar categoría', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.message || 'Error al eliminar categoría', 'error');
      }
    });
  }
}