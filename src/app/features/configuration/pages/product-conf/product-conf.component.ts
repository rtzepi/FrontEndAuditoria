import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService } from '../../../../core/services/product.service';
import { 
    IProduct, 
    IProductImage,
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
    @Input() isReadOnly: boolean = false;
    
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
    readonly MAX_DESCRIPTION_LENGTH = 100;

    currentPage = 1;
    itemsPerPage = 10;
    searchTerm = '';
    searchSubject = new Subject<string>();

    categories: ICategory[] = [];
    suppliers: ISupplier[] = [];
    unitsOfSale: IUnitOfSale[] = [];

    categoryMap: { [key: number]: string } = {};
    supplierMap: { [key: number]: string } = {};
    unityOfSaleMap: { [key: number]: string } = {};

    newProduct: IProduct = {
        idProduct: 0,
        nameProduct: '',
        description: null,
        status: 'E',
        isExpire: false,
        dateExpire: null,
        idImage: 0,
        image: null,
        imgBase64: null,
        idCategory: null,
        category: null,
        idSupplier: null,
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
                    this.products = response.value.map(product => {
                        if (product.imgBase64) {
                            product.picture = `${product.imgBase64}`;
                        } else if (product.image) {
                            const productImage = product.image as IProductImage;
                            product.picture = `${productImage.mimeType}${productImage.data}`;
                        }
                        
                        if (product.idCategory && !product.category) {
                            product.category = this.categories.find(c => c.idCategory === product.idCategory) || null;
                        }
                        if (product.idSupplier && !product.supplier) {
                            product.supplier = this.suppliers.find(s => s.idSupplier === product.idSupplier) || null;
                        }
                        if (product.idUnitOfSale && !product.unitOfSale) {
                            product.unitOfSale = this.unitsOfSale.find(u => u.idUnitOfSale === product.idUnitOfSale) || null;
                        }
                        
                        return product;
                    });
                    this.filteredProducts = [...this.products];
                }
                this.isLoading = false;
            },
            error: (error) => this.handleError('Error al cargar productos', error)
        });
    }

    private formatDateForDisplay(dateString: string | null): string | null {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            // Formato yyyy-MM-dd para el input type="date"
            return date.toISOString().split('T')[0];
        } catch {
            return null;
        }
    }

    private formatDateForApi(dateString: string | null): string | null {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return date.toISOString();
        } catch {
            return null;
        }
    }

    private loadCategories() {
        this.productService.getCategories().subscribe({
            next: (response) => {
                if (response.isSuccess && response.value) {
                    this.categories = response.value;
                    this.categoryMap = {};
                    this.categories.forEach(category => {
                        this.categoryMap[category.idCategory] = category.categoryName;
                    });
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
                    this.supplierMap = {};
                    this.suppliers.forEach(supplier => {
                        this.supplierMap[supplier.idSupplier] = supplier.nameSupplier;
                    });
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
                    this.unityOfSaleMap = {};
                    this.unitsOfSale.forEach(unit => {
                        this.unityOfSaleMap[unit.idUnitOfSale] = `${unit.unityName} (${unit.abbreviation})`;
                    });
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
        this.photoTouched = true;
        
        if (!this.newProduct.imgBase64 && !this.isEditing) {
            Swal.fire('Error', 'La imagen del producto es requerida', 'error');
            return;
        }

        if (this.productForm.invalid) {
            return;
        }

        // Formatear fecha para API antes de enviar
        if (this.newProduct.isExpire && this.newProduct.dateExpire) {
            this.newProduct.dateExpire = this.formatDateForApi(this.newProduct.dateExpire);
        } else {
            this.newProduct.dateExpire = null;
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
            (this.getCategoryName(product.idCategory)?.toLowerCase()?.includes(term)) ||
            (this.getSupplierName(product.idSupplier)?.toLowerCase()?.includes(term)) ||
            (this.getUnitOfSaleName(product.idUnitOfSale)?.toLowerCase()?.includes(term)) ||
            (product.idProduct?.toString().includes(term))
        );
    }

    getCategoryName(idCategory: number | null): string {
        if (idCategory === null) return 'N/A';
        return this.categoryMap[idCategory] || 'N/A';
    }

    getSupplierName(idSupplier: number | null): string {
        if (idSupplier === null) return 'N/A';
        return this.supplierMap[idSupplier] || 'N/A';
    }

    getUnitOfSaleName(idUnitOfSale: number | null): string {
        if (idUnitOfSale === null) return 'N/A';
        return this.unityOfSaleMap[idUnitOfSale] || 'N/A';
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES');
        } catch {
            return 'N/A';
        }
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
        this.newProduct.imgBase64 = product.imgBase64 ?? product.picture?.replace(/^data:image\/\w+;base64,/, '') ?? null;
        this.imagePreview = product.picture || (product.imgBase64 ? `${product.imgBase64}` : null);
        
        // Formatear fecha para el input type="date"
        if (this.newProduct.dateExpire) {
            this.newProduct.dateExpire = this.formatDateForDisplay(this.newProduct.dateExpire);
        }
        
        this.showModal = true;
    }

    handleImageUpload(event: Event) {
        if (this.isReadOnly) return;
        
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
        if (this.isReadOnly) return;
        
        this.photoTouched = true;
        this.imagePreview = null;
        this.newProduct.imgBase64 = null;
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
                    if (response.value.imgBase64) {
                        response.value.picture = `${response.value.imgBase64}`;
                    }
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
                        if (response.value.imgBase64) {
                            response.value.picture = `data:image/jpeg;base64,${response.value.imgBase64}`;
                        }
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
        if (this.isReadOnly) return;
        
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
            status: 'E',
            isExpire: false,
            dateExpire: null,
            idImage: 0,
            image: null,
            imgBase64: null,
            idCategory: null,
            category: null,
            idSupplier: null,
            supplier: null,
            idUnitOfSale: null,
            unitOfSale: null,
            picture: ''
        };
        this.isEditing = false;
        this.currentProductId = null;
        this.formSubmitted = false;
        this.photoTouched = false;
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