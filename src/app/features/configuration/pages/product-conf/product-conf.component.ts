import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService } from '../../../../core/services/product.service';
import { 
    IProduct, 
    IProductSingleResponse, 
    IProductArrayResponse,
    ICategory,
    ISupplier,
    IUnitOfSale
} from '../../../../shared/models/IProduct';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';

@Component({
    selector: 'app-product-conf',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputSearchComponent
    ],
    templateUrl: './product-conf.component.html',
    styleUrls: ['./product-conf.component.scss']
})
export class ProductConfComponent implements OnInit {
    @ViewChild('productForm') productForm!: NgForm;
    photoTouched = false;
    showModal = false;
    products: IProduct[] = [];
    filteredProducts: IProduct[] = [];
    imagePreview: string | null = null;
    isLoading = false;
    isEditing = false;
    currentProductId: number | null = null;
    formSubmitted = false;

  
    readonly MAX_NAME_LENGTH = 50;
    readonly MAX_DESCRIPTION_LENGTH = 500;

    currentPage = 1;
    itemsPerPage = 10;
    searchTerm = '';
    searchSubject = new Subject<string>();

    categories: ICategory[] = [];
    suppliers: ISupplier[] = [];
    unitsOfSale: IUnitOfSale[] = [];

    newProduct: IProduct = {
        idProduct: 0,
        nameProduct: '',
        description: null,
        status: 's',
        isExpire: false,
        dateExpire: null,
        idImage: null,
        image: null,
        imgBase64: '',
        idCategory: 0,
        category: null,
        idSupplier: 0, 
        supplier: null,
        idUnitOfSale: null,
        unitOfSale: null,
        picture: ''
    };

    constructor(private productService: ProductService, private location: Location) {}

    goBack() {
        this.location.back();
    }

    ngOnInit() {
        this.loadProducts();
        this.loadCategories();
        this.loadSuppliers();
        this.loadUnitsOfSale();
        this.setupSearch();
    }

    private loadProducts() {
        this.isLoading = true;
        this.productService.getProducts().subscribe({
            next: (response) => {
                if (response.isSuccess && response.value) {
                    this.products = response.value;
                    this.filteredProducts = [...this.products];
                }
                this.isLoading = false;
            },
            error: (error) => this.handleError('Error al cargar productos', error)
        });
    }

    private loadCategories() {
        this.productService.getCategories().subscribe({
            next: (response) => {
                if (response.isSuccess && response.value) {
                    this.categories = response.value;
                }
            },
            error: (error) => this.handleError('Error al cargar categorías', error)
        });
    }

    private loadSuppliers() {
        this.productService.getSuppliers().subscribe({
            next: (response) => {
                if (response.isSuccess && response.value) {
                    this.suppliers = response.value;
                }
            },
            error: (error) => this.handleError('Error al cargar proveedores', error)
        });
    }

    private loadUnitsOfSale() {
        this.productService.getUnitsOfSale().subscribe({
            next: (response) => {
                if (response.isSuccess && response.value) {
                    this.unitsOfSale = response.value;
                }
            },
            error: (error) => this.handleError('Error al cargar unidades de medida', error)
        });
    }

    private setupSearch() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.searchTerm = term;
            this.filterProducts();
            this.currentPage = 1;
        });
    }

    validateNameProduct() {
        if (this.newProduct.nameProduct && this.newProduct.nameProduct.length > this.MAX_NAME_LENGTH) {
            this.newProduct.nameProduct = this.newProduct.nameProduct.substring(0, this.MAX_NAME_LENGTH);
        }
    }

    validateDescription() {
        if (this.newProduct.description && this.newProduct.description.length > this.MAX_DESCRIPTION_LENGTH) {
            this.newProduct.description = this.newProduct.description.substring(0, this.MAX_DESCRIPTION_LENGTH);
        }
    }

    onSubmit() {
        this.formSubmitted = true;
        
        if (!this.newProduct.imgBase64) {
            Swal.fire('Error', 'La imagen del producto es requerida', 'error');
            return;
        }

        if (this.newProduct.nameProduct.length > this.MAX_NAME_LENGTH) {
            Swal.fire('Error', `El nombre del producto no puede exceder ${this.MAX_NAME_LENGTH} caracteres`, 'error');
            return;
        }

        if (this.newProduct.description && this.newProduct.description.length > this.MAX_DESCRIPTION_LENGTH) {
            Swal.fire('Error', `La descripción no puede exceder ${this.MAX_DESCRIPTION_LENGTH} caracteres`, 'error');
            return;
        }

        if (this.productForm.invalid) {
            return;
        }

        if (this.isEditing) {
            this.updateProduct();
        } else {
            this.addProduct();
        }
    }

    handleSearch(searchTerm: string) {
        this.searchSubject.next(searchTerm);
    }

    filterProducts() {
        if (!this.searchTerm) {
            this.filteredProducts = [...this.products];
            return;
        }
        
        const term = this.searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            (product.nameProduct?.toLowerCase().includes(term)) ||
            (product.description?.toLowerCase()?.includes(term)) ||
            (product.category?.categoryName?.toLowerCase()?.includes(term)) ||
            (product.supplier?.nameSupplier?.toLowerCase()?.includes(term)) ||
            (product.idProduct?.toString().includes(term))
        );
    }

    get paginatedProducts() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }

    previousPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    openAddProductModal() {
        this.isEditing = false;
        this.currentProductId = null;
        this.resetForm();
        this.showModal = true;
    }

    openEditProductModal(product: IProduct) {
        this.isEditing = true;
        this.currentProductId = product.idProduct;
        
        this.newProduct = { ...product };
        this.newProduct.imgBase64 = product.imgBase64 ?? product.picture ?? null;
        this.imagePreview = this.newProduct.imgBase64 ? `${this.newProduct.imgBase64}` : null;
        this.showModal = true;
    }

    handleImageUpload(event: Event) {
        this.photoTouched = true;
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
                this.newProduct.imgBase64 = (e.target.result as string).split(',')[1];
            }
        };
        reader.readAsDataURL(file);
    }

    removePhoto() {
        this.photoTouched = true;
        this.imagePreview = null;
        this.newProduct.imgBase64 = '';
        const fileInput = document.getElementById('productPhoto') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    addProduct() {
        this.isLoading = true;
        this.productService.addProduct(this.newProduct).subscribe({
            next: (response) => {
                if (response.isSuccess && response.value) {
                    this.products.push(response.value);
                    this.filteredProducts = [...this.products];
                    Swal.fire('Éxito', 'Producto agregado correctamente', 'success');
                    this.closeModal();
                } else {
                    Swal.fire('Error', response.error || 'Error al agregar el producto', 'error');
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error detallado:', error);
                this.handleError('Error al agregar el producto', error);
            }
        });
    }

    updateProduct() {
        if (!this.currentProductId) return;

        this.isLoading = true;
        this.productService.updateProduct(this.currentProductId, this.newProduct)
            .subscribe({
                next: (response) => {
                    if (response.isSuccess && response.value) {
                        const index = this.products.findIndex(p => p.idProduct === this.currentProductId);
                        if (index !== -1) {
                            this.products[index] = response.value;
                            this.filteredProducts = [...this.products];
                        }
                        Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
                        this.closeModal();
                    } else {
                        Swal.fire('Error', response.error || 'Error al actualizar el producto', 'error');
                    }
                    this.isLoading = false;
                },
                error: (error) => this.handleError('Error al actualizar el producto', error)
            });
    }

    confirmDelete(product: IProduct) {
        Swal.fire({
            title: '¿Eliminar producto?',
            text: `¿Seguro que deseas eliminar "${product.nameProduct}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteProduct(product.idProduct);
            }
        });
    }

    deleteProduct(id: number) {
        this.isLoading = true;
        this.productService.deleteProduct(id).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.products = this.products.filter(p => p.idProduct !== id);
                    this.filteredProducts = this.filteredProducts.filter(p => p.idProduct !== id);
                    Swal.fire('Éxito', 'Producto eliminado correctamente', 'success');
                } else {
                    Swal.fire('Error', response.error || 'Error al eliminar el producto', 'error');
                }
                this.isLoading = false;
            },
            error: (error) => this.handleError('Error al eliminar el producto', error)
        });
    }

    closeModal() {
        this.showModal = false;
        this.formSubmitted = false;
        this.resetForm();
    }

    resetForm() {
      this.imagePreview = null;
      this.newProduct = {
          idProduct: 0,
          nameProduct: '',
          description: null,
          status: 's',
          isExpire: false,
          dateExpire: null,
          idImage: null,
          image: null,
          imgBase64: '', 
          idCategory: 0, 
          category: null,
          idSupplier: 0,
          supplier: null,
          idUnitOfSale: null,
          unitOfSale: null,
          picture: ''
      };
      this.isEditing = false;
      this.currentProductId = null;
      this.formSubmitted = false;
      this.newProduct.imgBase64 = '';
  }

    private handleError(message: string, error: any) {
        console.error('Error completo:', error);
        this.isLoading = false;
        let errorMessage = message;
        
        if (error.error && error.error.errors) {
            const validationErrors = error.error.errors;
            errorMessage += '<br><br>';
            for (const key in validationErrors) {
                if (validationErrors.hasOwnProperty(key)) {
                    errorMessage += `${validationErrors[key].join('<br>')}<br>`;
                }
            }
        } else if (error.error && error.error.title) {
            errorMessage += `<br><br>${error.error.title}`;
        }
        
        Swal.fire({
            title: 'Error',
            html: errorMessage,
            icon: 'error'
        });
    }
}