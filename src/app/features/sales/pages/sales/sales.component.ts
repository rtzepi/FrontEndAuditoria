import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../../../core/services/sales.service';
import { 
    IProduct, 
    IProductResponse, 
    ICategory,
    ICategoryResponse,
    ICartItem,
    ISale,
    ISaleDetail
} from '../../../../shared/models/ISales';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, InputSearchComponent],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  categories: ICategory[] = [];
  selectedCategory: number | null = null;
  cartItems: ICartItem[] = [];
  
  showAddModal = false;
  showEditModal = false;
  selectedProduct: IProduct | null = null;
  selectedCartItem: ICartItem | null = null;
  
  productQuantity = 1;
  productDiscount = 0;
  editQuantity = 1;
  editDiscount = 0;
  
  quantityError = '';
  discountError = '';
  editQuantityError = '';
  editDiscountError = '';
  
  saleConfirmed = false;
  amountReceived = 0;
  changeAmount = 0;
  totalAmount = 0;
  
  isLoading = false;
  loadingProducts = false;
  loadingCategories = false;
  
  searchTerm = '';
  searchSubject = new Subject<string>();
  
  categoryScrollStart = 0;
  visibleCategories = 4;
  
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.setupSearch();
  }

  private loadProducts(categoryId?: number): void {
    this.loadingProducts = true;
    this.salesService.getProducts(categoryId).subscribe({
      next: (response: IProductResponse) => {
        if (response.isSuccess && response.value) {
          this.products = this.processProductData(response.value);
          this.filteredProducts = [...this.products];
        }
        this.loadingProducts = false;
      },
      error: (error) => {
        this.loadingProducts = false;
        this.handleError('Error al cargar productos', error);
      }
    });
  }

  private processProductData(products: IProduct[]): IProduct[] {
    return products.map(product => ({
      ...product,
      imageBase64: product.imageBase64 ? `${product.imageBase64}` : '',
      totalStock: product.totalStock ?? 0,
      priceBuy: product.priceBuy ?? 0,
      salePrice: product.salePrice ?? product.priceBuy ?? 0
    }));
  }

  private loadCategories(): void {
    this.loadingCategories = true;
    this.salesService.getCategories().subscribe({
      next: (response: ICategoryResponse) => {
        if (response.isSuccess && response.value) {
          this.categories = response.value;
        }
        this.loadingCategories = false;
      },
      error: (error) => {
        this.loadingCategories = false;
        this.handleError('Error al cargar categorías', error);
      }
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(term => {
      this.searchTerm = term;
      if (!term.trim()) {
        this.loadProducts(this.selectedCategory || undefined);
      } else {
        this.searchProductsByName(term);
      }
    });
  }

  private searchProductsByName(name: string): void {
    this.loadingProducts = true;
    this.salesService.getProductsByName(name).subscribe({
      next: (response: IProductResponse) => {
        if (response.isSuccess && response.value) {
          this.filteredProducts = this.processProductData(response.value);
        } else {
          this.filteredProducts = [];
        }
        this.loadingProducts = false;
      },
      error: (error) => {
        this.loadingProducts = false;
        this.handleError('Error al buscar productos', error);
        this.filteredProducts = [];
      }
    });
  }

  handleSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  selectCategory(idCategory: number): void {
    if (idCategory === this.selectedCategory) {
      this.selectedCategory = null;
      this.searchTerm = '';
      this.loadProducts();
      return;
    }

    this.selectedCategory = idCategory;
    this.searchTerm = '';
    this.loadProducts(idCategory);
  }

  openAddProductModal(product: IProduct): void {
    this.selectedProduct = product;
    this.productQuantity = 1;
    this.productDiscount = 0;
    this.quantityError = '';
    this.discountError = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.selectedProduct = null;
  }

  validateQuantity(): void {
    if (!this.selectedProduct) return;
    
    if (this.productQuantity < 1) {
      this.quantityError = 'La cantidad debe ser al menos 1';
    } else if (this.productQuantity > (this.selectedProduct.totalStock || 0)) {
      this.quantityError = `No hay suficiente stock (disponible: ${this.selectedProduct.totalStock})`;
    } else {
      this.quantityError = '';
    }
  }

  validateDiscount(): void {
    if (this.productDiscount < 0) {
      this.discountError = 'El descuento no puede ser negativo';
    } else if (this.productDiscount > 100) {
      this.discountError = 'El descuento no puede ser mayor a 100%';
    } else {
      this.discountError = '';
    }
  }

  get selectedProductPrice(): number {
    return this.selectedProduct?.salePrice || this.selectedProduct?.priceBuy || 0;
  }

  calculateProductTotal(): number {
    const price = this.selectedProductPrice;
    const quantity = this.productQuantity;
    const discount = this.productDiscount / 100;
    return price * quantity * (1 - discount);
  }

  addToCart(): void {
    if (!this.selectedProduct || this.quantityError || this.discountError) return;
    
    const existingItemIndex = this.cartItems.findIndex(
      item => item.idProduct === this.selectedProduct?.idProduct
    );
    
    const newItem: ICartItem = {
      idProduct: this.selectedProduct.idProduct,
      name: this.selectedProduct.description,
      price: this.selectedProductPrice,
      quantity: this.productQuantity,
      discount: this.productDiscount,
      subtotal: this.selectedProductPrice * this.productQuantity,
      total: this.calculateProductTotal(),
      image: this.selectedProduct.imageBase64,
      stock: this.selectedProduct.totalStock - this.productQuantity
    };
    
    if (existingItemIndex >= 0) {
      this.cartItems[existingItemIndex] = newItem;
    } else {
      this.cartItems.push(newItem);
    }
    
    this.updateTotalAmount();
    this.closeAddModal();
    
    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      showConfirmButton: false,
      timer: 1000
    });
  }

  openEditItemModal(item: ICartItem): void {
    this.selectedCartItem = item;
    this.editQuantity = item.quantity;
    this.editDiscount = item.discount;
    this.editQuantityError = '';
    this.editDiscountError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCartItem = null;
  }

  validateEditQuantity(): void {
    if (!this.selectedCartItem) return;
    
    const availableStock = (this.selectedCartItem.stock || 0) + (this.selectedCartItem.quantity || 0);
    
    if (this.editQuantity < 1) {
      this.editQuantityError = 'La cantidad debe ser al menos 1';
    } else if (this.editQuantity > availableStock) {
      this.editQuantityError = `No hay suficiente stock (disponible: ${availableStock})`;
    } else {
      this.editQuantityError = '';
    }
  }

  validateEditDiscount(): void {
    if (this.editDiscount < 0) {
      this.editDiscountError = 'El descuento no puede ser negativo';
    } else if (this.editDiscount > 100) {
      this.editDiscountError = 'El descuento no puede ser mayor a 100%';
    } else {
      this.editDiscountError = '';
    }
  }

  calculateEditTotal(): number {
    if (!this.selectedCartItem) return 0;
    return (this.selectedCartItem.price || 0) * this.editQuantity * (1 - this.editDiscount / 100);
  }

  updateCartItem(): void {
    if (!this.selectedCartItem || this.editQuantityError || this.editDiscountError) return;
    
    const itemIndex = this.cartItems.findIndex(
      item => item.idProduct === this.selectedCartItem?.idProduct
    );
    
    if (itemIndex >= 0) {
      this.cartItems[itemIndex] = {
        ...this.selectedCartItem,
        quantity: this.editQuantity,
        discount: this.editDiscount,
        subtotal: (this.selectedCartItem.price || 0) * this.editQuantity,
        total: this.calculateEditTotal(),
        stock: ((this.selectedCartItem.stock || 0) + (this.selectedCartItem.quantity || 0)) - this.editQuantity
      };
      
      this.updateTotalAmount();
      this.closeEditModal();
      
      Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
        showConfirmButton: false,
        timer: 1000
      });
    }
  }

  removeFromCart(): void {
    if (!this.selectedCartItem) return;
    
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Seguro que deseas eliminar ${this.selectedCartItem.name} del carrito?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartItems = this.cartItems.filter(
          item => item.idProduct !== this.selectedCartItem?.idProduct
        );
        this.updateTotalAmount();
        this.closeEditModal();
        
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          showConfirmButton: false,
          timer: 1000
        });
      }
    });
  }

  updateTotalAmount(): void {
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  confirmSale(): void {
    if (this.cartItems.length === 0) return;
    
    if (this.saleConfirmed) {
      this.saleConfirmed = false;
      this.amountReceived = 0;
      this.changeAmount = 0;
    } else {
      this.saleConfirmed = true;
      
      Swal.fire({
        icon: 'success',
        title: 'Venta confirmada',
        text: 'Ingrese el monto recibido del cliente',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  calculateChange(): void {
    this.changeAmount = (this.amountReceived || 0) - this.totalAmount;
  }

  processPayment(): void {
    if (this.changeAmount < 0) {
      Swal.fire('Error', 'El monto recibido es insuficiente', 'error');
      return;
    }
    
    this.isLoading = true;
    
    const saleData: ISale = {
      observation: '',
      amountReceive: this.amountReceived,
      amountGive: this.changeAmount,
      products: this.cartItems.map(item => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
        discount: item.discount,
        unitPrice: item.price
      } as ISaleDetail))
    };
    
    this.salesService.processSale(saleData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.isSuccess) {
          Swal.fire({
            icon: 'success',
            title: 'Venta completada',
            text: `Número de venta: ${response.value?.idSale}`,
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.resetSale();
          });
        } else {
          Swal.fire('Error', response.error || 'Error al procesar la venta', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError('Error al procesar la venta', error);
      }
    });
  }

  resetSale(): void {
    this.cartItems = [];
    this.totalAmount = 0;
    this.saleConfirmed = false;
    this.amountReceived = 0;
    this.changeAmount = 0;
  }

  get paginatedCartItems(): ICartItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.cartItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.cartItems.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  scrollCategories(direction: number): void {
    const newStart = this.categoryScrollStart + direction;
    if (newStart >= 0 && newStart <= this.categories.length - this.visibleCategories) {
      this.categoryScrollStart = newStart;
    }
  }

  private handleError(title: string, error: any): void {
    console.error(title, error);
    this.isLoading = false;
    Swal.fire('Error', title, 'error');
  }
}




// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { SalesService } from '../../../../core/services/sales.service';
// import { 
//     IProduct, 
//     IProductResponse, 
//     ICategory,
//     ICategoryResponse,
//     ICartItem,
//     ISale,
//     ISaleDetail,
//     IProductNameResponse
// } from '../../../../shared/models/ISales';
// import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
// import Swal from 'sweetalert2';
// import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

// @Component({
//   selector: 'app-sales',
//   standalone: true,
//   imports: [CommonModule, FormsModule, InputSearchComponent],
//   templateUrl: './sales.component.html',
//   styleUrls: ['./sales.component.scss']
// })
// export class SalesComponent implements OnInit {
//   products: IProduct[] = [];
//   filteredProducts: IProduct[] = [];
//   categories: ICategory[] = [];
//   selectedCategory: number | null = null;
//   cartItems: ICartItem[] = [];
  
//   showAddModal = false;
//   showEditModal = false;
//   selectedProduct: IProduct | null = null;
//   selectedCartItem: ICartItem | null = null;
  
//   productQuantity = 1;
//   productDiscount = 0;
//   editQuantity = 1;
//   editDiscount = 0;
  
//   quantityError = '';
//   discountError = '';
//   editQuantityError = '';
//   editDiscountError = '';
  
//   saleConfirmed = false;
//   amountReceived = 0;
//   changeAmount = 0;
//   totalAmount = 0;
  
//   isLoading = false;
//   loadingProducts = false;
//   loadingCategories = false;
  
//   searchTerm = '';
//   searchSubject = new Subject<string>();
  
//   categoryScrollStart = 0;
//   visibleCategories = 4;
  
//   currentPage = 1;
//   itemsPerPage = 5;

//   constructor(private salesService: SalesService) {}

//   ngOnInit(): void {
//     this.loadProducts();
//     this.loadCategories();
//     this.setupSearch();
//   }

//   private loadProducts(): void {
//     this.loadingProducts = true;
//     this.salesService.getProducts().subscribe({
//       next: (response: IProductResponse) => {
//         if (response.isSuccess && response.value) {
//           this.products = this.processProductData(response.value);
//           this.filteredProducts = [...this.products];
//         }
//         this.loadingProducts = false;
//       },
//       error: (error) => {
//         this.loadingProducts = false;
//         this.handleError('Error al cargar productos', error);
//       }
//     });
//   }

//   private processProductData(products: IProduct[]): IProduct[] {
//     return products.map(product => ({
//       ...product,
//       imageBase64: product.imageBase64 || product.imgBase64 ? `${product.imageBase64 || product.imgBase64}` : '',
//       description: product.description || product.nameProduct || 'Sin descripción',
//       totalStock: product.totalStock ?? 0,
//       priceBuy: product.priceBuy ?? 0,
//       salePrice: product.salePrice ?? product.priceBuy ?? 0
//     }));
//   }

//   private loadCategories(): void {
//     this.loadingCategories = true;
//     this.salesService.getCategories().subscribe({
//       next: (response: ICategoryResponse) => {
//         if (response.isSuccess && response.value) {
//           this.categories = response.value;
//         }
//         this.loadingCategories = false;
//       },
//       error: (error) => {
//         this.loadingCategories = false;
//         this.handleError('Error al cargar categorías', error);
//       }
//     });
//   }

//   private setupSearch(): void {
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged(),
//       switchMap(term => {
//         this.searchTerm = term;
//         if (!term.trim()) {
//           if (this.selectedCategory) {
//             return this.salesService.getProductsByCategory(this.selectedCategory);
//           }
//           return this.salesService.getProducts();
//         }
//         return this.salesService.getProductsByName(term);
//       })
//     ).subscribe({
//       next: (response: IProductResponse | IProductNameResponse) => {
//         if (response.isSuccess) {
//           if (Array.isArray(response.value) && typeof response.value[0] === 'string') {
//             const productNames = response.value as string[];
//             this.filteredProducts = this.products.filter(product => 
//               productNames.includes(product.description)
//             );
//           } else {
//             const products = response.value as IProduct[];
//             this.filteredProducts = this.processProductData(products);
//           }
//         }
//       },
//       error: (error) => this.handleError('Error al buscar productos', error)
//     });
//   }

//   handleSearch(searchTerm: string): void {
//     this.searchSubject.next(searchTerm);
//   }

//   selectCategory(idCategory: number): void {
//     if (idCategory === this.selectedCategory) {
//       this.selectedCategory = null;
//       this.searchTerm = '';
//       this.filteredProducts = [...this.products];
//       return;
//     }

//     this.selectedCategory = idCategory;
//     this.searchTerm = '';
//     this.loadingProducts = true;
    
//     this.salesService.getProductsByCategory(idCategory).subscribe({
//       next: (response: IProductResponse) => {
//         if (response.isSuccess && response.value) {
//           this.filteredProducts = this.processProductData(response.value);
//         } else {
//           this.filteredProducts = [];
//         }
//         this.loadingProducts = false;
//       },
//       error: (error) => {
//         this.loadingProducts = false;
//         this.handleError('Error al filtrar por categoría', error);
//         this.filteredProducts = [];
//       }
//     });
//   }

//   openAddProductModal(product: IProduct): void {
//     this.selectedProduct = product;
//     this.productQuantity = 1;
//     this.productDiscount = 0;
//     this.quantityError = '';
//     this.discountError = '';
//     this.showAddModal = true;
//   }

//   closeAddModal(): void {
//     this.showAddModal = false;
//     this.selectedProduct = null;
//   }

//   validateQuantity(): void {
//     if (!this.selectedProduct) return;
    
//     if (this.productQuantity < 1) {
//       this.quantityError = 'La cantidad debe ser al menos 1';
//     } else if (this.productQuantity > (this.selectedProduct.totalStock || 0)) {
//       this.quantityError = `No hay suficiente stock (disponible: ${this.selectedProduct.totalStock})`;
//     } else {
//       this.quantityError = '';
//     }
//   }

//   validateDiscount(): void {
//     if (this.productDiscount < 0) {
//       this.discountError = 'El descuento no puede ser negativo';
//     } else if (this.productDiscount > 100) {
//       this.discountError = 'El descuento no puede ser mayor a 100%';
//     } else {
//       this.discountError = '';
//     }
//   }

//   get selectedProductPrice(): number {
//     return this.selectedProduct?.salePrice || this.selectedProduct?.priceBuy || 0;
//   }

//   calculateProductTotal(): number {
//     const price = this.selectedProductPrice;
//     const quantity = this.productQuantity;
//     const discount = this.productDiscount / 100;
//     return price * quantity * (1 - discount);
//   }

//   addToCart(): void {
//     if (!this.selectedProduct || this.quantityError || this.discountError) return;
    
//     const existingItemIndex = this.cartItems.findIndex(
//       item => item.idProduct === this.selectedProduct?.idProduct
//     );
    
//     const newItem: ICartItem = {
//       idProduct: this.selectedProduct.idProduct,
//       name: this.selectedProduct.description,
//       price: this.selectedProductPrice,
//       quantity: this.productQuantity,
//       discount: this.productDiscount,
//       subtotal: this.selectedProductPrice * this.productQuantity,
//       total: this.calculateProductTotal(),
//       image: this.selectedProduct.imageBase64,
//       stock: this.selectedProduct.totalStock - this.productQuantity
//     };
    
//     if (existingItemIndex >= 0) {
//       this.cartItems[existingItemIndex] = newItem;
//     } else {
//       this.cartItems.push(newItem);
//     }
    
//     this.updateTotalAmount();
//     this.closeAddModal();
    
//     Swal.fire({
//       icon: 'success',
//       title: 'Producto agregado',
//       showConfirmButton: false,
//       timer: 1000
//     });
//   }

//   openEditItemModal(item: ICartItem): void {
//     this.selectedCartItem = item;
//     this.editQuantity = item.quantity;
//     this.editDiscount = item.discount;
//     this.editQuantityError = '';
//     this.editDiscountError = '';
//     this.showEditModal = true;
//   }

//   closeEditModal(): void {
//     this.showEditModal = false;
//     this.selectedCartItem = null;
//   }

//   validateEditQuantity(): void {
//     if (!this.selectedCartItem) return;
    
//     const availableStock = (this.selectedCartItem.stock || 0) + (this.selectedCartItem.quantity || 0);
    
//     if (this.editQuantity < 1) {
//       this.editQuantityError = 'La cantidad debe ser al menos 1';
//     } else if (this.editQuantity > availableStock) {
//       this.editQuantityError = `No hay suficiente stock (disponible: ${availableStock})`;
//     } else {
//       this.editQuantityError = '';
//     }
//   }

//   validateEditDiscount(): void {
//     if (this.editDiscount < 0) {
//       this.editDiscountError = 'El descuento no puede ser negativo';
//     } else if (this.editDiscount > 100) {
//       this.editDiscountError = 'El descuento no puede ser mayor a 100%';
//     } else {
//       this.editDiscountError = '';
//     }
//   }

//   calculateEditTotal(): number {
//     if (!this.selectedCartItem) return 0;
//     return (this.selectedCartItem.price || 0) * this.editQuantity * (1 - this.editDiscount / 100);
//   }

//   updateCartItem(): void {
//     if (!this.selectedCartItem || this.editQuantityError || this.editDiscountError) return;
    
//     const itemIndex = this.cartItems.findIndex(
//       item => item.idProduct === this.selectedCartItem?.idProduct
//     );
    
//     if (itemIndex >= 0) {
//       this.cartItems[itemIndex] = {
//         ...this.selectedCartItem,
//         quantity: this.editQuantity,
//         discount: this.editDiscount,
//         subtotal: (this.selectedCartItem.price || 0) * this.editQuantity,
//         total: this.calculateEditTotal(),
//         stock: ((this.selectedCartItem.stock || 0) + (this.selectedCartItem.quantity || 0)) - this.editQuantity
//       };
      
//       this.updateTotalAmount();
//       this.closeEditModal();
      
//       Swal.fire({
//         icon: 'success',
//         title: 'Producto actualizado',
//         showConfirmButton: false,
//         timer: 1000
//       });
//     }
//   }

//   removeFromCart(): void {
//     if (!this.selectedCartItem) return;
    
//     Swal.fire({
//       title: '¿Eliminar producto?',
//       text: `¿Seguro que deseas eliminar ${this.selectedCartItem.name} del carrito?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.cartItems = this.cartItems.filter(
//           item => item.idProduct !== this.selectedCartItem?.idProduct
//         );
//         this.updateTotalAmount();
//         this.closeEditModal();
        
//         Swal.fire({
//           icon: 'success',
//           title: 'Producto eliminado',
//           showConfirmButton: false,
//           timer: 1000
//         });
//       }
//     });
//   }

//   updateTotalAmount(): void {
//     this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
//   }

//   confirmSale(): void {
//     if (this.cartItems.length === 0) return;
    
//     if (this.saleConfirmed) {
//       this.saleConfirmed = false;
//       this.amountReceived = 0;
//       this.changeAmount = 0;
//     } else {
//       this.saleConfirmed = true;
      
//       Swal.fire({
//         icon: 'success',
//         title: 'Venta confirmada',
//         text: 'Ingrese el monto recibido del cliente',
//         showConfirmButton: false,
//         timer: 1500
//       });
//     }
//   }

//   calculateChange(): void {
//     this.changeAmount = (this.amountReceived || 0) - this.totalAmount;
//   }

//   processPayment(): void {
//     if (this.changeAmount < 0) {
//       Swal.fire('Error', 'El monto recibido es insuficiente', 'error');
//       return;
//     }
    
//     this.isLoading = true;
    
//     const saleData: ISale = {
//       observation: '',
//       amountReceive: this.amountReceived,
//       amountGive: this.changeAmount,
//       products: this.cartItems.map(item => ({
//         idProduct: item.idProduct,
//         quantity: item.quantity,
//         discount: item.discount,
//         unitPrice: item.price
//       } as ISaleDetail))
//     };
    
//     this.salesService.processSale(saleData).subscribe({
//       next: (response) => {
//         this.isLoading = false;
        
//         if (response.isSuccess) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Venta completada',
//             text: `Número de venta: ${response.value?.idSale}`,
//             confirmButtonText: 'Aceptar'
//           }).then(() => {
//             this.resetSale();
//           });
//         } else {
//           Swal.fire('Error', response.error || 'Error al procesar la venta', 'error');
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         this.handleError('Error al procesar la venta', error);
//       }
//     });
//   }

//   resetSale(): void {
//     this.cartItems = [];
//     this.totalAmount = 0;
//     this.saleConfirmed = false;
//     this.amountReceived = 0;
//     this.changeAmount = 0;
//   }

//   get paginatedCartItems(): ICartItem[] {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     return this.cartItems.slice(startIndex, startIndex + this.itemsPerPage);
//   }

//   get totalPages(): number {
//     return Math.ceil(this.cartItems.length / this.itemsPerPage);
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }

//   previousPage(): void {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   scrollCategories(direction: number): void {
//     const newStart = this.categoryScrollStart + direction;
//     if (newStart >= 0 && newStart <= this.categories.length - this.visibleCategories) {
//       this.categoryScrollStart = newStart;
//     }
//   }

//   private handleError(title: string, error: any): void {
//     console.error(title, error);
//     this.isLoading = false;
//     Swal.fire('Error', title, 'error');
//   }
// }