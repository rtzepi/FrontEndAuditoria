import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  showOrderModal = false;
  showStatusModal = false;
  showReceiveModal = false;
  orders: IOrder[] = [];
  filteredOrders: IOrder[] = [];
  isLoading = false;
  isEditing = false;
  currentOrder: IOrder | null = null;

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

  supplierMap: { [key: number]: ISupplier } = {};
  productMap: { [key: number]: IProduct } = {};

  constructor(
    private purchaseService: NewPurchaseService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  private loadData() {
    this.isLoading = true;
    
    this.purchaseService.getOrders().subscribe({
      next: (response: IOrderArrayResponse) => {
        if (response.isSuccess && response.value) {
          this.orders = Array.isArray(response.value) ? response.value : [response.value];
          this.filteredOrders = [...this.orders];
          this.orders.forEach(order => {
            if (order.idOrder) {
              this.loadOrderProducts(order.idOrder);
            }
          });
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
        if (response.isSuccess && response.value && response.value.products) {
          const orderIndex = this.orders.findIndex(o => o.idOrder === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].products = response.value.products;
            this.filteredOrders = [...this.orders];
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
      this.filteredOrders = [...this.orders];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order => 
      (this.getSupplierName(order.idSupplier)?.toLowerCase().includes(term) ||
      (order.idOrder?.toString().includes(term)) ||
      (order.created_at?.toLowerCase().includes(term)) ||
      (this.getStatusText(order.status).toLowerCase().includes(term))));
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

  getStatusText(status: string): string {
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
  }

  openEditOrderModal(order: IOrder) {
    this.isEditing = true;
    this.currentOrder = order;
    this.selectedSupplierId = order.idSupplier;
    
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
            isExpire: detail.isExpire,
            stockMin: detail.stockMin,
            productDescription: detail.productDescription,
            status: detail.status
          }));
          this.onSupplierChange();
          this.cdr.detectChanges();
        }
      },
      error: (error) => this.handleError('Error al cargar la orden', error)
    });
    
    this.showOrderModal = true;
  }

  openStatusModal(order: IOrder) {
    this.currentOrder = order;
    this.newStatus = order.status;
    this.statusDescription = '';
    this.showStatusModal = true;
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
            salePrice: 0,
            idOrderDetail: detail.idOrderDetail,
            subtotal: detail.subtotal,
            isExpire: detail.isExpire,
            stockMin: detail.stockMin,
            productDescription: detail.productDescription,
            status: detail.status
          }));
          this.showReceiveModal = true;
          this.cdr.detectChanges();
        }
      },
      error: (error) => this.handleError('Error al cargar la orden', error)
    });
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.currentOrder = null;
  }

  closeReceiveModal() {
    this.showReceiveModal = false;
    this.currentOrder = null;
    this.productosAgregados = [];
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
        priceBuy: 0,
        salePrice: 0,
        isExpire: product.isExpire,
        stockMin: product.stockMin,
        productDescription: product.description
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

  generateOrder(): void {
    if (!this.selectedSupplierId) {
      Swal.fire('Error', 'Seleccione un proveedor', 'error');
      return;
    }

    if (this.productosAgregados.length === 0) {
      Swal.fire('Error', 'Agregue al menos un producto', 'error');
      return;
    }

    const totalAmount = this.productosAgregados.reduce((total, item) => total + (item.priceBuy * item.quantity), 0);

    const order: IOrderRequest = {
      idSupplier: this.selectedSupplierId,
      products: this.productosAgregados.map(item => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
        priceBuy: item.priceBuy
      })),
      status: 'P',
      description: `Orden generada el ${new Date().toLocaleDateString()}`,
      totalAmount: totalAmount
    };

    this.isLoading = true;
    this.purchaseService.createOrder(order).subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          Swal.fire('Éxito', 'Orden creada correctamente', 'success');
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

  updateOrder(): void {
    if (!this.currentOrder || !this.selectedSupplierId) {
      Swal.fire('Error', 'Datos de orden incompletos', 'error');
      return;
    }

    if (this.productosAgregados.length === 0) {
      Swal.fire('Error', 'La orden debe tener al menos un producto', 'error');
      return;
    }

    const totalAmount = this.productosAgregados.reduce((total, item) => total + (item.priceBuy * item.quantity), 0);

    const order: IOrderUpdateRequest = {
      idSupplier: this.selectedSupplierId,
      products: this.productosAgregados.map(item => ({
        idOrderDetail: item.idOrderDetail,
        idProduct: item.idProduct,
        quantity: item.quantity,
        priceBuy: item.priceBuy,
        idOrder: this.currentOrder!.idOrder
      })),
      status: this.currentOrder.status,
      description: this.currentOrder.description || `Orden actualizada el ${new Date().toLocaleDateString()}`,
      totalAmount: totalAmount
    };

    this.isLoading = true;
    this.purchaseService.updateOrder(this.currentOrder.idOrder, order).subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          Swal.fire('Éxito', 'Orden actualizada correctamente', 'success');
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

  updateOrderStatus(): void {
    if (!this.currentOrder) return;

    const currentStatus = this.currentOrder.status;
    const newStatus = this.newStatus;

    if (currentStatus === 'P' && newStatus !== 'S' && newStatus !== 'C') {
        Swal.fire('Error', 'Desde Pendiente solo puede cambiar a Enviado o Cancelado', 'error');
        return;
    }

    if (currentStatus === 'S' && newStatus !== 'V' && newStatus !== 'C') {
        Swal.fire('Error', 'Desde Enviado solo puede cambiar a Confirmado o Cancelado', 'error');
        return;
    }

    if (currentStatus === 'V' && newStatus !== 'R' && newStatus !== 'C') {
        Swal.fire('Error', 'Desde Confirmado solo puede cambiar a Recibido o Cancelado', 'error');
        return;
    }

    if (this.newStatus === 'C' && (!this.statusDescription || this.statusDescription.length > 75)) {
        Swal.fire('Error', 'La descripción de cancelación es requerida y debe tener máximo 75 caracteres', 'error');
        return;
    }

    const statusRequest: IOrderStatusRequest = {
        status: this.newStatus
    };

    if (this.newStatus === 'C') {
        statusRequest.description = this.statusDescription;
    }

    this.isLoading = true;
    this.purchaseService.updateOrderStatus(this.currentOrder.idOrder, statusRequest).subscribe({
        next: (response) => {
            if (response.isSuccess) {
                Swal.fire('Éxito', 'Estado actualizado correctamente', 'success');
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

  receiveOrder(): void {
    if (!this.currentOrder) return;
    const productsToReceive = this.productosAgregados
        .filter(item => item.quantity > 0)
        .map(item => {
            const productData: any = {
                idOrderDetail: item.idOrderDetail || 0,
                idProduct: item.idProduct,
                priceBuy: item.priceBuy,
                salePrice: item.salePrice || 0,
                quantity: item.quantity,
                idOrder: this.currentOrder!.idOrder
            };
            if (item.isExpire) {
                productData.expireProduct = new Date().toISOString();
            }
            if (item.observation) {
                productData.observation = item.observation;
            }

            return productData;
        });

    if (productsToReceive.length === 0) {
        Swal.fire('Error', 'Debe haber al menos un producto con cantidad mayor a cero', 'error');
        return;
    }

    const receiveRequest: IOrderReceiveRequest = {
        products: productsToReceive,
        description: this.receiveDescription || undefined
    };

    this.isLoading = true;
    this.purchaseService.receiveOrder(this.currentOrder.idOrder, receiveRequest).subscribe({
        next: (response) => {
            if (response.isSuccess) {
                Swal.fire('Éxito', 'Orden recibida correctamente', 'success');
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

  downloadPdf(idOrder: number): void {
    this.isLoading = true;
    this.purchaseService.generatePdf(idOrder).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orden_compra_${idOrder}.pdf`;
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

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.resetOrderForm();
  }

  resetOrderForm(): void {
    this.productosAgregados = [];
    this.selectedSupplierId = null;
    this.selectedProductId = null;
    this.quantity = 1;
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