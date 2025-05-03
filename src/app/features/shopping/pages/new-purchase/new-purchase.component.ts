import { Component, OnInit, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NewPurchaseService } from '../../../../core/services/new-purchase.service';
import { 
    IOrder,
    IOrderArrayResponse,
    IOrderRequest,
    IOrderUpdateRequest,
    IOrderResponse,
    IProductOrder,
    ILowStockProduct,
    ISupplier,
    IProduct,
    ISupplierResponse,
    IProductResponse,
    IOrderStatusRequest,
    IOrderReceiveRequest,
    IOrderDetail
} from '../../../../shared/models/INewPurchase';
import Swal from 'sweetalert2';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-new-purchase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './new-purchase.component.html',
  styleUrls: ['./new-purchase.component.scss']
})
export class NewPurchaseComponent implements OnInit {
    @ViewChild('orderForm') orderForm?: NgForm;
    
    showOrderModal = false;
    showStatusModal = false;
    showReceiveModal = false;
    orders: IOrder[] = [];
    filteredOrders: IOrder[] = [];
    isLoading = false;
    isEditing = false;
    currentOrder: IOrder | null = null;
    orderDescription = '';
  
    suppliers: ISupplier[] = [];
    products: IProduct[] = [];
    filteredProducts: IProduct[] = [];
    selectedSupplierId: number | null = null;
    selectedProductId: number | null = null;
    quantity = 1;
    
    productosAgregados: IProductOrder[] = [];
    productosBajoStock: ILowStockProduct[] = [];
    hasExpirableProducts = false;
  
    newStatus = '';
    statusDescription = '';
    receiveDescription = '';
    currentReceivePage = 1;
    receiveItemsPerPage = 7;
  
    currentPage = 1;
    itemsPerPage = 10;
    searchTerm = '';
    searchSubject = new Subject<string>();

    // Variable para controlar el estado del menú
    isMenuHidden = false;
  
    supplierMap: { [key: number]: ISupplier } = {};
    productMap: { [key: number]: IProduct } = {};
    // Mapa para rastrear productos en órdenes activas
    productInActiveOrdersMap: { [key: number]: boolean } = {};
  
    constructor(
      private purchaseService: NewPurchaseService,
      private location: Location,
      private cdr: ChangeDetectorRef
    ) {}
  
    ngOnInit() {
      this.loadData();
      this.setupSearch();
    }

    // Método para verificar si hay algún modal abierto
    get isAnyModalOpen(): boolean {
        return this.showOrderModal || this.showStatusModal || this.showReceiveModal;
    }

    // Escuchar eventos de teclado para cerrar modales con ESC
    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.showOrderModal) {
            this.closeOrderModal();
        } else if (this.showStatusModal) {
            this.closeStatusModal();
        } else if (this.showReceiveModal) {
            this.closeReceiveModal();
        }
    }

    // Método para verificar si un producto está en órdenes activas
    isProductInActiveOrders(productId: number): boolean {
      return this.productInActiveOrdersMap[productId] || false;
    }

    // Actualizar el mapa de productos en órdenes activas
    private updateProductInActiveOrdersMap(): void {
      this.productInActiveOrdersMap = {};
      
      // Filtrar órdenes que no están canceladas o recibidas
      const activeOrders = this.orders.filter(order => 
        order.status !== 'C' && order.status !== 'R'
      );

      // Recorrer todas las órdenes activas
      activeOrders.forEach(order => {
        if (order.products) {
          order.products.forEach(product => {
            // Marcar el producto como en una orden activa
            this.productInActiveOrdersMap[product.idProduct] = true;
          });
        }
      });
    }

    isOrderFormValid(): boolean {
      return !!this.selectedSupplierId && this.productosAgregados.length > 0;
    }

    isReceiveFormValid(): boolean {
      if (!this.receiveDescription || this.productosAgregados.length === 0) {
        return false;
      }

      return this.productosAgregados.every(item => {
        const basicValid = item.quantity > 0 && 
                          item.priceBuy > 0 &&
                          item.salePrice > 0;
        
        if (item.isExpire) {
          return basicValid && !!item.expireProduct;
        }
        return basicValid;
      });
    }

    private loadData() {
      this.isLoading = true;
      
      this.purchaseService.getOrders().subscribe({
        next: (response: IOrderArrayResponse) => {
          if (response.isSuccess && response.value) {
            this.orders = Array.isArray(response.value) ? response.value : [response.value];
            this.filteredOrders = this.orders.filter(order => 
              order.status !== 'C' && order.status !== 'R'
            );
            this.orders.forEach(order => {
              if (order.idOrder) {
                this.loadOrderProducts(order.idOrder);
              }
            });
            // Actualizar el mapa de productos en órdenes activas
            this.updateProductInActiveOrdersMap();
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al cargar órdenes', error)
      });

      this.purchaseService.getSuppliers().subscribe({
        next: (response: ISupplierResponse) => {
          if (response.isSuccess && response.value) {
            this.suppliers = Array.isArray(response.value) ? response.value : [response.value];
            this.supplierMap = this.suppliers.reduce((map, supplier) => {
              map[supplier.idSupplier] = supplier;
              return map;
            }, {} as { [key: number]: ISupplier });
          }
        },
        error: (error) => this.handleError('Error al cargar proveedores', error)
      });

      this.purchaseService.getProducts().subscribe({
        next: (response: IProductResponse) => {
          if (response.isSuccess && response.value) {
            this.products = Array.isArray(response.value) ? response.value : [response.value];
            this.filteredProducts = [...this.products];
            this.productMap = this.products.reduce((map, product) => {
              map[product.idProduct] = product;
              return map;
            }, {} as { [key: number]: IProduct });
          }
        },
        error: (error) => this.handleError('Error al cargar productos', error)
      });
    }

    private loadOrderProducts(orderId: number) {
      this.purchaseService.getOrderById(orderId).subscribe({
        next: (response: IOrderResponse) => {
          if (response.isSuccess && response.value) {
            const orderIndex = this.orders.findIndex(o => o.idOrder === orderId);
            if (orderIndex !== -1) {
              this.orders[orderIndex].products = response.value.products || [];
              this.filteredOrders = this.orders.filter(order => 
                order.status !== 'C' && order.status !== 'R'
              );
              // Actualizar el mapa después de cargar los productos de la orden
              this.updateProductInActiveOrdersMap();
            }
          }
        },
        error: (error) => console.error('Error al cargar productos de la orden', error)
      });
    }

    private setupSearch() {
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(term => {
        this.searchTerm = term;
        this.filterOrders();
        this.currentPage = 1;
      });
    }

    handleSearch(searchTerm: string) {
      this.searchSubject.next(searchTerm);
    }

    filterOrders() {
      if (!this.searchTerm) {
        this.filteredOrders = this.orders.filter(order => 
          order.status !== 'C' && order.status !== 'R'
        );
        return;
      }
      
      const term = this.searchTerm.toLowerCase();
      this.filteredOrders = this.orders.filter(order => 
        (order.status !== 'C' && order.status !== 'R') && (
        (this.getSupplierName(order.idSupplier)?.toLowerCase().includes(term) ||
        (order.idOrder?.toString().includes(term)) ||
        (order.created_at?.toLowerCase().includes(term)) ||
        (this.getStatusText(order.status).toLowerCase().includes(term)))));
    }

    getSupplierName(idSupplier: number): string {
      const supplier = this.supplierMap[idSupplier];
      return supplier ? supplier.nameSupplier : 'Desconocido';
    }

    getProductById(idProduct: number): IProduct | null {
      return this.productMap[idProduct] || null;
    }

    getProductsCount(order: IOrder): number {
      return order.products?.length || 0;
    }

    getOrderTotal(order: IOrder): number {
      return order.totalAmount || 0;
    }

    getStatusText(status: string | undefined): string {
      if (!status) return 'Desconocido';
      
      switch(status) {
          case 'P': return 'Pendiente';
          case 'V': return 'Confirmada';
          case 'S': return 'Enviada';
          case 'R': return 'Recibida';
          case 'C': return 'Cancelada';
          default: return 'Desconocido';
      }
    }

    getStatusClass(status: string): string {
      switch(status) {
        case 'P': return 'status-pending';
        case 'V': return 'status-confirmed';
        case 'S': return 'status-sent';
        case 'R': return 'status-received';
        case 'C': return 'status-cancelled';
        default: return 'status-unknown';
      }
    }

    getRemainingChars(text: string | null | undefined, maxLength: number): number {
      return maxLength - (text?.length || 0);
    }

    get paginatedOrders() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
    }

    get paginatedProductosAgregados() {
      const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
      return this.productosAgregados.slice(startIndex, startIndex + this.receiveItemsPerPage);
    }

    get totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }

    get totalReceivePages() {
      return Math.ceil(this.productosAgregados.length / this.receiveItemsPerPage);
    }

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    }

    previousPage() {
      if (this.currentPage > 1) this.currentPage--;
    }

    nextReceivePage() {
      if (this.currentReceivePage < this.totalReceivePages) this.currentReceivePage++;
    }

    previousReceivePage() {
      if (this.currentReceivePage > 1) this.currentReceivePage--;
    }

    openAddOrderModal() {
      this.isEditing = false;
      this.currentOrder = null;
      this.resetOrderForm();
      this.showOrderModal = true;
      this.updateMenuVisibility();
    }

    openEditOrderModal(order: IOrder) {
      this.isEditing = true;
      this.currentOrder = order;
      this.selectedSupplierId = order.idSupplier;
      this.orderDescription = order.description || '';
      
      this.purchaseService.getOrderById(order.idOrder).subscribe({
        next: (response: IOrderResponse) => {
          if (response.isSuccess && response.value) {
            const orderDetails = response.value.products || [];
            this.productosAgregados = orderDetails.map(detail => ({
              idProduct: detail.idProduct,
              nameProduct: detail.productName || this.getProductById(detail.idProduct)?.nameProduct || 'Producto desconocido',
              quantity: detail.quantity,
              priceBuy: detail.priceBuy,
              salePrice: 0,
              idOrderDetail: detail.idOrderDetail,
              subtotal: detail.subtotal,
              isExpire: detail.isExpire || false,
              stockMin: detail.stockMin || 0,
              productDescription: detail.productDescription,
              status: detail.status || 'A'
            }));
            this.onSupplierChange();
            this.cdr.detectChanges();
          }
        },
        error: (error) => this.handleError('Error al cargar la orden', error)
      });
      
      this.showOrderModal = true;
      this.updateMenuVisibility();
    }

    openStatusModal(order: IOrder) {
      this.currentOrder = order;
      this.newStatus = order.status; 
      this.statusDescription = '';
      this.showStatusModal = true;
      this.updateMenuVisibility();
    }

    openReceiveModal(order: IOrder) {
      if (order.status !== 'V') {
        Swal.fire('Error', 'Solo se pueden recibir órdenes con estado Confirmado', 'error');
        return;
      }

      this.currentOrder = order;
      this.receiveDescription = '';
      
      this.purchaseService.getOrderById(order.idOrder).subscribe({
        next: (response: IOrderResponse) => {
          if (response.isSuccess && response.value) {
            const orderDetails = response.value.products || [];
            this.productosAgregados = orderDetails.map(detail => ({
              idProduct: detail.idProduct,
              nameProduct: detail.productName || this.getProductById(detail.idProduct)?.nameProduct || 'Producto desconocido',
              quantity: detail.quantity,
              priceBuy: detail.priceBuy,
              salePrice: detail.priceBuy * 1.2, // 20% de margen por defecto para evitar perdidas
              idOrderDetail: detail.idOrderDetail,
              subtotal: detail.subtotal,
              isExpire: detail.isExpire || false,
              stockMin: detail.stockMin || 0,
              productDescription: detail.productDescription,
              status: detail.status || 'A',
              observation: detail.observation || '',
              expireProduct: detail.expireProduct || null
            }));
            this.showReceiveModal = true;
            this.updateMenuVisibility();
            this.cdr.detectChanges();
          }
        },
        error: (error) => this.handleError('Error al cargar la orden', error)
      });
    }

    closeStatusModal() {
      this.showStatusModal = false;
      this.currentOrder = null;
      this.updateMenuVisibility();
    }

    closeReceiveModal() {
      this.showReceiveModal = false;
      this.currentOrder = null;
      this.productosAgregados = [];
      this.updateMenuVisibility();
    }

    closeOrderModal(): void {
      this.showOrderModal = false;
      this.resetOrderForm();
      this.updateMenuVisibility();
    }

    // Método para actualizar la visibilidad del menú
    private updateMenuVisibility(): void {
      this.isMenuHidden = this.isAnyModalOpen;
      this.cdr.detectChanges();
    }

    onSupplierChange(): void {
      if (this.selectedSupplierId) {
        this.filteredProducts = this.products.filter(
          product => product.idSupplier === this.selectedSupplierId
        );
        this.checkLowStockProducts();
      } else {
        this.filteredProducts = [...this.products];
        this.productosBajoStock = [];
      }
      this.selectedProductId = null;
      this.cdr.detectChanges();
    }

    checkLowStockProducts(): void {
      if (!this.selectedSupplierId) {
        this.productosBajoStock = [];
        return;
      }

      this.productosBajoStock = this.products
        .filter(product => 
          product.idSupplier === this.selectedSupplierId && 
          (product.stockMin !== undefined && product.stockMin !== null) &&
          product.stockMin > 0
        )
        .map(product => ({
          idProduct: product.idProduct,
          nameProduct: product.nameProduct || 'Sin nombre',
          currentStock: 0,
          minStock: product.stockMin || 0
        }));
    }

    addProduct(): void {
      if (!this.selectedProductId || this.quantity <= 0) {
        Swal.fire('Advertencia', 'Seleccione un producto y una cantidad válida', 'warning');
        return;
      }

      // Verificar si el producto ya está en una orden activa
      if (this.isProductInActiveOrders(this.selectedProductId)) {
        Swal.fire('Error', 'Este producto ya está incluido en una orden activa (no cancelada ni recibida). No puede agregarlo a otra orden hasta que la orden actual sea cancelada o recibida.', 'error');
        return;
      }

      const product = this.products.find(p => p.idProduct === this.selectedProductId);
      if (!product) return;

      const existingProduct = this.productosAgregados.find(p => p.idProduct === this.selectedProductId);
      
      if (existingProduct) {
        existingProduct.quantity += this.quantity;
      } else {
        this.productosAgregados.push({
          idProduct: product.idProduct,
          nameProduct: product.nameProduct || 'Sin nombre',
          quantity: this.quantity,
          priceBuy: product.priceBuy || 0,
          salePrice: 0,
          isExpire: product.isExpire || false,
          stockMin: product.stockMin || 0,
          productDescription: product.description || null
        });
      }

      this.selectedProductId = null;
      this.quantity = 1;
      this.currentReceivePage = 1;
      this.cdr.detectChanges();
    }

    removeProduct(index: number): void {
      const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
      const actualIndex = startIndex + index;
      this.productosAgregados.splice(actualIndex, 1);
      this.cdr.detectChanges();
    }

    updateQuantity(index: number, newQuantity: number) {
      if (newQuantity > 0) {
        const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
        const actualIndex = startIndex + index;
        this.productosAgregados[actualIndex].quantity = newQuantity;
        this.cdr.detectChanges();
      }
    }

    updatePrice(index: number, newPrice: number) {
      if (newPrice >= 0) {
        const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
        const actualIndex = startIndex + index;
        this.productosAgregados[actualIndex].priceBuy = newPrice;
        this.cdr.detectChanges();
      }
    }

    updateSalePrice(index: number, newPrice: number) {
      if (newPrice >= 0) {
        const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
        const actualIndex = startIndex + index;
        this.productosAgregados[actualIndex].salePrice = newPrice;
        this.cdr.detectChanges();
      }
    }

    updateObservation(index: number, observation: string) {
      const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
      const actualIndex = startIndex + index;
      this.productosAgregados[actualIndex].observation = observation;
      this.cdr.detectChanges();
    }

    validateAndSubmitOrder(): void {
      if (!this.selectedSupplierId) {
        Swal.fire('Error', 'Seleccione un proveedor', 'error');
        return;
      }

      if (this.productosAgregados.length === 0) {
        Swal.fire('Error', 'Agregue al menos un producto', 'error');
        return;
      }

      const invalidProducts = this.productosAgregados.filter(
        item => item.priceBuy <= 0 || isNaN(item.priceBuy)
      );
      
      if (invalidProducts.length > 0) {
        Swal.fire('Error', 'Todos los productos deben tener un precio de compra válido', 'error');
        return;
      }

      const totalAmount = this.productosAgregados.reduce((total, item) => total + (item.priceBuy * item.quantity), 0);

      if (this.isEditing) {
        this.updateOrder(totalAmount);
      } else {
        this.generateOrder(totalAmount);
      }
    }

    generateOrder(totalAmount: number): void {
      const order: IOrderRequest = {
        idSupplier: this.selectedSupplierId!,
        products: this.productosAgregados.map(item => ({
          idProduct: item.idProduct,
          quantity: item.quantity,
          priceBuy: item.priceBuy
        })),
        status: 'P',
        description: this.orderDescription || `Orden generada el ${new Date().toLocaleDateString()}`,
        totalAmount: totalAmount
      };

      this.isLoading = true;
      this.purchaseService.createOrder(order).subscribe({
        next: (response) => {
          if (response.isSuccess && response.value) {
            Swal.fire({
              title: 'Éxito',
              text: 'Orden creada correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeOrderModal();
            this.loadData();
          } else {
            Swal.fire('Error', response.error || 'Error al crear la orden', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al crear la orden', error)
      });
    }

    updateOrder(totalAmount: number): void {
      const order: IOrderUpdateRequest = {
        idSupplier: this.selectedSupplierId!,
        products: this.productosAgregados.map(item => ({
          idOrderDetail: item.idOrderDetail,
          idProduct: item.idProduct,
          quantity: item.quantity,
          priceBuy: item.priceBuy,
          idOrder: this.currentOrder!.idOrder
        })),
        status: this.currentOrder!.status,
        description: this.orderDescription || `Orden actualizada el ${new Date().toLocaleDateString()}`,
        totalAmount: totalAmount
      };

      this.isLoading = true;
      this.purchaseService.updateOrder(this.currentOrder!.idOrder, order).subscribe({
        next: (response) => {
          if (response.isSuccess && response.value) {
            Swal.fire({
              title: 'Éxito',
              text: 'Orden actualizada correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeOrderModal();
            this.loadData();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar la orden', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar la orden', error)
      });
    }

    validateAndUpdateStatus(): void {
      if (!this.newStatus) {
        Swal.fire('Error', 'Seleccione un estado', 'error');
        return;
      }

      if (this.newStatus === 'C' && (!this.statusDescription || this.statusDescription.length > 100)) {
        Swal.fire('Error', 'La descripción de cancelación es requerida y debe tener máximo 100 caracteres', 'error');
        return;
      }

      const currentStatus = this.currentOrder?.status;
      
      if (currentStatus === 'P' && this.newStatus !== 'S' && this.newStatus !== 'C') {
        Swal.fire('Error', 'Desde Pendiente solo puede cambiar a Enviado o Cancelado', 'error');
        return;
      }

      if (currentStatus === 'S' && this.newStatus !== 'V' && this.newStatus !== 'C') {
        Swal.fire('Error', 'Desde Enviado solo puede cambiar a Confirmado o Cancelado', 'error');
        return;
      }

      if (currentStatus === 'V' && this.newStatus !== 'R' && this.newStatus !== 'C') {
        Swal.fire('Error', 'Desde Confirmado solo puede cambiar a Recibido o Cancelado', 'error');
        return;
      }

      this.updateOrderStatus();
    }

    updateOrderStatus(): void {
      const statusRequest: IOrderStatusRequest = {
        status: this.newStatus
      };

      if (this.newStatus === 'C') {
        statusRequest.description = this.statusDescription;
      }

      this.isLoading = true;
      this.purchaseService.updateOrderStatus(this.currentOrder!.idOrder, statusRequest).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Estado actualizado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeStatusModal();
            this.loadData();
          } else {
            Swal.fire('Error', response.error || 'Error al actualizar el estado', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al actualizar el estado', error)
      });
    }

    validateAndReceiveOrder(): void {
      if (!this.receiveDescription) {
        Swal.fire('Error', 'La descripción es requerida', 'error');
        return;
      }

      const invalidProducts = this.productosAgregados.filter(item => {
        const basicInvalid = item.quantity <= 0 || isNaN(item.quantity) ||
                            item.priceBuy <= 0 || isNaN(item.priceBuy) ||
                            item.salePrice <= 0 || isNaN(item.salePrice);
        if (item.isExpire) {
          return basicInvalid || !item.expireProduct;
        }
        return basicInvalid;
      });
      
      if (invalidProducts.length > 0) {
        Swal.fire('Error', 'Revise los datos de los productos. Los productos perecederos deben tener fecha de expiración.', 'error');
        return;
      }

      this.receiveOrder();
    }

    receiveOrder(): void {
      const productsToReceive = this.productosAgregados.map(item => {
        const productData: any = {
          idOrderDetail: item.idOrderDetail || 0,
          idProduct: item.idProduct,
          priceBuy: item.priceBuy,
          salePrice: item.salePrice,
          quantity: item.quantity,
          idOrder: this.currentOrder!.idOrder,
          observation: item.observation || null
        };
        
        if (item.isExpire) {
          productData.expireProduct = item.expireProduct || new Date().toISOString();
        }
        
        return productData;
      });

      const receiveRequest: IOrderReceiveRequest = {
        products: productsToReceive,
        description: this.receiveDescription
      };

      this.isLoading = true;
      this.purchaseService.receiveOrder(this.currentOrder!.idOrder, receiveRequest).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Orden recibida correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.closeReceiveModal();
            this.loadData();
          } else {
            Swal.fire('Error', response.error || 'Error al recibir la orden', 'error');
          }
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al recibir la orden', error)
      });
    }

    updateExpireDate(index: number, date: string) {
      const startIndex = (this.currentReceivePage - 1) * this.receiveItemsPerPage;
      const actualIndex = startIndex + index;
      this.productosAgregados[actualIndex].expireProduct = date;
      this.cdr.detectChanges();
    }

    downloadPdf(idOrder: number): void {
      this.isLoading = true;
      this.purchaseService.generatePdf(idOrder).subscribe({
        next: (response) => {
          const blob = response.body!;
          const contentDisp = response.headers.get('content-disposition') || '';
          let filename = '';
          const starMatch = contentDisp.match(/filename\*\s*=\s*([^']*)''([^;]+)/i);
          if (starMatch && starMatch[2]) {
            filename = decodeURIComponent(starMatch[2]);
          } else {
            const nameMatch = contentDisp.match(/filename="?([^";]+)"?/i);
            if (nameMatch && nameMatch[1]) {
              filename = nameMatch[1];
            }
          }
          if (!filename) {
            filename = `orden_compra_${idOrder}.pdf`;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
    
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error al generar PDF', error)
      });
    }

    generateAndDownloadPdf(): void {
      if (!this.currentOrder) return;
      this.downloadPdf(this.currentOrder.idOrder);
    }

    resetOrderForm(): void {
      this.productosAgregados = [];
      this.selectedSupplierId = null;
      this.selectedProductId = null;
      this.quantity = 1;
      this.orderDescription = '';
      this.filteredProducts = [...this.products];
      this.productosBajoStock = [];
      this.currentReceivePage = 1;
    }

    private handleError(message: string, error: any) {
      console.error(message, error);
      this.isLoading = false;
      Swal.fire('Error', message, 'error');
    }

    goBack() {
      this.location.back();
    }
}