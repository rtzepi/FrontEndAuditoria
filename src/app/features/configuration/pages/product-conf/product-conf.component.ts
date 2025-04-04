import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService } from '../../../../core/services/product.service';
import { UnitOfSaleService } from '../../../../core/services/unit.service';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';
import { IProduct, IProductResponse, ICategory, ISupplier, IUnitOfSale } from '../../../../shared/models/IProduct';

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
  showModal = false;
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  isLoading = false;
  isEditing = false;
  currentProductId: number | null = null;
  formSubmitted = false;
  photoTouched = false;


  readonly MAX_NAME_LENGTH = 100;
  readonly MAX_DESCRIPTION_LENGTH = 200;

  categories: ICategory[] = [];
  suppliers: ISupplier[] = [];
  units: IUnitOfSale[] = [];
  categoryMap: { [key: number]: ICategory } = {};
  supplierMap: { [key: number]: ISupplier } = {};
  unitMap: { [key: number]: IUnitOfSale } = {};

  currentPage = 1;
  itemsPerPage = 10;
  searchTerm = '';
  searchSubject = new Subject<string>();

  imagePreview: string | null = null;

  newProduct = {
    idProduct: 0,
    nameProduct: '',
    description: '',
    status: 'A',
    isExpire: false,
    dateExpire: new Date().toISOString(),
    idImage: 0,
    imgBase64: '',
    idCategory: 0,
    idSupplier: 0,
    idUnitOfSale: 0
  };

  constructor(
    private productService: ProductService,
    private unitService: UnitOfSaleService,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  private loadData() {
    this.isLoading = true;
    
    this.productService.getCategories().subscribe({
      next: (catResponse: any) => {
        if (catResponse.isSuccess && catResponse.value) {
          this.categories = Array.isArray(catResponse.value) ? catResponse.value : [catResponse.value];
          this.categoryMap = this.categories.reduce((map, cat) => {
            map[cat.idCategory] = cat;
            return map;
          }, {} as { [key: number]: ICategory });

          this.productService.getSuppliers().subscribe({
            next: (supResponse: any) => {
              if (supResponse.isSuccess && supResponse.value) {
                this.suppliers = Array.isArray(supResponse.value) ? supResponse.value : [supResponse.value];
                this.supplierMap = this.suppliers.reduce((map, sup) => {
                  map[sup.idSupplier] = sup;
                  return map;
                }, {} as { [key: number]: ISupplier });

                this.unitService.getUnits().subscribe({
                  next: (unitResponse: any) => {
                    if (unitResponse.isSuccess && unitResponse.value) {
                      this.units = Array.isArray(unitResponse.value) ? unitResponse.value : [unitResponse.value];
                      this.unitMap = this.units.reduce((map, unit) => {
                        map[unit.idUnitOfSale] = unit;
                        return map;
                      }, {} as { [key: number]: IUnitOfSale });

                      this.productService.getProducts().subscribe({
                        next: (prodResponse: IProductResponse) => {
                          if (prodResponse.isSuccess && prodResponse.value) {
                            this.products = Array.isArray(prodResponse.value) ? prodResponse.value : [prodResponse.value];
                            this.filteredProducts = [...this.products];
                          }
                          this.isLoading = false;
                        },
                        error: (error) => this.handleError('Error al cargar productos', error)
                      });
                    } else {
                      this.isLoading = false;
                    }
                  },
                  error: (error) => this.handleError('Error al cargar unidades de medida', error)
                });
              } else {
                this.isLoading = false;
              }
            },
            error: (error) => this.handleError('Error al cargar proveedores', error)
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => this.handleError('Error al cargar categorías', error)
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
      (product.description?.toLowerCase().includes(term)) ||
      (product.idProduct?.toString().includes(term))
    );
  }

  handleInput(field: 'nameProduct' | 'description', maxLength: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value.length > maxLength) {
      input.value = value.substring(0, maxLength);
      this.newProduct[field] = input.value;
    }
  }

  getRemainingChars(field: 'nameProduct' | 'description', maxLength: number): number {
    return maxLength - (this.newProduct[field]?.length || 0);
  }

  getCategoryName(idCategory: number): string {
    const category = this.categoryMap[idCategory];
    return category ? category.categoryName : 'Desconocido';
  }

  getSupplierName(idSupplier: number): string {
    const supplier = this.supplierMap[idSupplier];
    return supplier ? supplier.nameSupplier : 'Desconocido';
  }

  getUnitName(idUnitOfSale: number | undefined): string {
    if (!idUnitOfSale) return 'No asignado';
    const unit = this.unitMap[idUnitOfSale];
    return unit ? `${unit.unityName} (${unit.abbreviation})` : 'Desconocido';
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
    this.formSubmitted = false;
    this.photoTouched = false;
  }

  openEditProductModal(product: IProduct) {
    this.isEditing = true;
    this.currentProductId = product.idProduct;
    this.newProduct = {
      idProduct: product.idProduct,
      nameProduct: product.nameProduct,
      description: product.description,
      status: product.status,
      isExpire: product.isExpire,
      dateExpire: product.dateExpire,
      idImage: product.idImage,
      imgBase64: product.imgBase64,
      idCategory: product.idCategory,
      idSupplier: product.idSupplier,
      idUnitOfSale: product.idUnitOfSale || 0
    };
    this.imagePreview = product.imgBase64 ? `data:image/jpeg;base64,${product.imgBase64}` : null;
    this.showModal = true;
    this.formSubmitted = false;
    this.photoTouched = false;
  }

  addProduct() {
    this.formSubmitted = true;
    this.photoTouched = true;
    
    if (this.productForm.invalid || !this.newProduct.imgBase64) return;

    this.isLoading = true;
    this.productService.addProduct(this.newProduct).subscribe({
      next: (response: IProductResponse) => {
        if (response.isSuccess && response.value) {
          const newProduct = Array.isArray(response.value) ? response.value[0] : response.value;
          this.products.push(newProduct);
          this.filteredProducts = [...this.products];
          
          Swal.fire('Éxito', 'Producto creado correctamente', 'success');
          this.closeModal();
        } else {
          Swal.fire('Error', response.error || 'Error al crear producto', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al crear producto', error)
    });
  }

  updateProduct() {
    this.formSubmitted = true;
    this.photoTouched = true;
    
    if (!this.currentProductId || this.productForm.invalid || !this.newProduct.imgBase64) return;

    this.isLoading = true;
    this.productService.updateProduct(this.currentProductId, this.newProduct)
      .subscribe({
        next: (response: IProductResponse) => {
          if (response.isSuccess && response.value) {
            const index = this.products.findIndex(p => p.idProduct === this.currentProductId);
            if (index !== -1) {
              this.products[index] = response.value as IProduct;
              this.filteredProducts = [...this.products];
            }
            Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
            this.closeModal();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar producto', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar producto', error)
      });
  }

  confirmDelete(product: IProduct) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de eliminar ${product.nameProduct}?`,
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
      next: (response: IProductResponse) => {
        if (response.isSuccess) {
          this.products = this.products.filter(p => p.idProduct !== id);
          this.filteredProducts = this.filteredProducts.filter(p => p.idProduct !== id);
          
          Swal.fire('Éxito', 'Producto eliminado correctamente', 'success');
        } else {
          Swal.fire('Error', response.error || 'Error al eliminar producto', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al eliminar producto', error)
    });
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newProduct = {
      idProduct: 0,
      nameProduct: '',
      description: '',
      status: 'A',
      isExpire: false,
      dateExpire: new Date().toISOString(),
      idImage: 0,
      imgBase64: '',
      idCategory: 0,
      idSupplier: 0,
      idUnitOfSale: 0
    };
    this.imagePreview = null;
    this.isEditing = false;
    this.currentProductId = null;
    this.formSubmitted = false;
    this.photoTouched = false;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }

  getStatusText(status: string): string {
    return status === 'A' ? 'Activo' : 'Inactivo';
  }

  goBack() {
    this.location.back();
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe exceder los 2MB', 'error');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        Swal.fire('Error', 'Solo se permiten imágenes JPEG, PNG o JPG', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.newProduct.imgBase64 = e.target.result.split(',')[1];
        this.photoTouched = true;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.imagePreview = null;
    this.newProduct.imgBase64 = '';
    this.photoTouched = true;
  }
}