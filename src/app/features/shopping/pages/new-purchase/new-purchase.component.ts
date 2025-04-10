import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewPurchaseService } from '../../../../core/services/new-purchase.service';
import { ProductService } from '../../../../core/services/product.service';
import { IProduct, IProductArrayResponse } from '../../../../shared/models/IProduct';
import { ISupplier } from '../../../../shared/models/ISupplier';
import { IProductOrder, ILowStockProduct } from '../../../../shared/models/INewPurchase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-purchase.component.html',
  styleUrls: ['./new-purchase.component.scss']
})
export class NewPurchaseComponent implements OnInit {
  suppliers: ISupplier[] = [];
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  selectedSupplierId: number | null = null;
  selectedProductId: number | null = null;
  quantity: number = 1;
  
  productosAgregados: IProductOrder[] = [];
  productosBajoStock: ILowStockProduct[] = [];

  constructor(
    private purchaseService: NewPurchaseService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
  }

  private loadSuppliers(): void {
    this.purchaseService.getSuppliers().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.suppliers = response.value;
        }
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.products = response.value;
          this.filteredProducts = [...this.products];
          this.checkLowStockProducts();
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    });
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
        dateAdded: new Date().toISOString()
      });
    }

    this.selectedProductId = null;
    this.quantity = 1;
  }

  removeProduct(index: number): void {
    this.productosAgregados.splice(index, 1);
  }

  editProduct(index: number): void {
    const product = this.productosAgregados[index];
    Swal.fire({
      title: 'Editar Producto',
      html: `
        <div class="form-group">
          <label for="quantity">Cantidad:</label>
          <input id="quantity" class="swal2-input" type="number" value="${product.quantity}" min="1">
        </div>
        <div class="form-group">
          <label for="price">Precio de Compra:</label>
          <input id="price" class="swal2-input" type="number" value="${product.priceBuy}" min="0" step="0.01">
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        const price = (document.getElementById('price') as HTMLInputElement).value;
        
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
          Swal.showValidationMessage('La cantidad debe ser mayor a 0');
          return false;
        }
        
        return {
          quantity: Number(quantity),
          priceBuy: Number(price)
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        product.quantity = result.value.quantity;
        product.priceBuy = result.value.priceBuy;
      }
    });
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

    const order: any = {
      idSupplier: this.selectedSupplierId,
      products: this.productosAgregados.map(item => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
        priceBuy: item.priceBuy
      })),
      status: 'Pendiente',
      description: `Orden generada el ${new Date().toLocaleDateString()}`
    };

    this.purchaseService.createOrder(order).subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          Swal.fire('Éxito', 'Orden creada correctamente', 'success');
          this.downloadPdf(response.value.idOrder);
          this.resetForm();
        } else {
          Swal.fire('Error', response.error || 'Error al crear la orden', 'error');
        }
      },
      error: (error) => {
        console.error('Error creating order:', error);
        Swal.fire('Error', 'Error al crear la orden', 'error');
      }
    });
  }

  private downloadPdf(idOrder: number): void {
    this.purchaseService.generatePdf(idOrder).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden_compra_${idOrder}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  private resetForm(): void {
    this.productosAgregados = [];
    this.selectedSupplierId = null;
    this.selectedProductId = null;
    this.quantity = 1;
    this.filteredProducts = [...this.products];
    this.productosBajoStock = [];
  }
}