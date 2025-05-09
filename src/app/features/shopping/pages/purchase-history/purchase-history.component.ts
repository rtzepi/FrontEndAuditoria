import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

interface Orden {
  idOrder: number;
  dateOrder: string;
  status: string;
  totalAmount: number;
  dumpValue?: number;
  created_at?: string;
  updated_at?: string | null;
  id: number;
  fechaCompra: string;
  total: number;
  estado: string;
  usuario: string;
  proveedor: string;
}

interface DetalleOrden {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  estado: string;
}

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, InputSearchComponent],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit {
  ordenes: Orden[] = [];
  ordenesFiltradas: Orden[] = [];
  detallesOrden: DetalleOrden[] = [];
  ordenSeleccionada: Orden | null = null;
  mostrarModalDetalles = false;
  cargando = false;
  
  paginaActual = 1;
  itemsPorPagina = 10;
  terminoBusqueda = '';
  busquedaSubject = new Subject<string>();

  constructor(private http: HttpClient, private location: Location) {}

  ngOnInit(): void {
    this.cargarOrdenes();
    this.configurarBusqueda();
  }

  cargarOrdenes(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.baseUrlApi || 'https://localhost:7124'}/Order/List`).subscribe({
      next: (respuesta) => {
        if (respuesta && respuesta.value) {
          this.ordenes = respuesta.value.map((orden: any) => ({
            ...orden,
            id: orden.idOrder,
            fechaCompra: orden.dateOrder,
            total: orden.totalAmount,
            estado: this.mapStatus(orden.status),
            usuario: `Usuario ${orden.idOrder}`,
            proveedor: `Proveedor ${orden.dumpValue || 1}`
          }));
          this.ordenesFiltradas = [...this.ordenes];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.cargando = false;
      }
    });
  }

  private mapStatus(status: string): string {
    switch(status) {
      case 'R': return 'Recibido';
      case 'P': return 'Procesando';
      case 'E': return 'Entregado';
      case 'C': return 'Cancelado';
      default: return status;
    }
  }

  configurarBusqueda(): void {
    this.busquedaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.terminoBusqueda = termino;
      this.filtrarOrdenes();
      this.paginaActual = 1;
    });
  }

  handleSearch(terminoBusqueda: string): void {
    this.busquedaSubject.next(terminoBusqueda);
  }

  filtrarOrdenes(): void {
    if (!this.terminoBusqueda) {
      this.ordenesFiltradas = [...this.ordenes];
      return;
    }
    
    const termino = this.terminoBusqueda.toLowerCase();
    this.ordenesFiltradas = this.ordenes.filter(orden => 
      orden.usuario.toLowerCase().includes(termino) ||
      orden.proveedor.toLowerCase().includes(termino) ||
      orden.idOrder.toString().includes(termino)
    );
  }

  get ordenesPaginadas() {
    const indiceInicial = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.ordenesFiltradas.slice(indiceInicial, indiceInicial + this.itemsPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.ordenesFiltradas.length / this.itemsPorPagina);
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  verDetalles(orden: Orden): void {
    this.ordenSeleccionada = orden;
    this.mostrarModalDetalles = true;
    this.detallesOrden = [];
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
  }

  goBack(): void {
    this.location.back();
  }
}