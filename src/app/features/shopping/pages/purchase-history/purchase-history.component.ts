import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';

interface Orden {
  id: number;
  usuario: string;
  proveedor: string;
  fechaCompra: string;
  total: number;
  estado: string;
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
    this.http.get<any>(`${environment.baseUrlApi}/Order/List`).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.ordenes = respuesta.value || [];
          this.ordenesFiltradas = [...this.ordenes];
        } else {
          console.error('Error al cargar órdenes:', respuesta.errors);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.cargando = false;
      }
    });
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
      orden.usuario?.toLowerCase().includes(termino) ||
      orden.proveedor?.toLowerCase().includes(termino) ||
      orden.id?.toString().includes(termino)
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
    this.cargarDetallesOrden(orden.id);
  }

  cargarDetallesOrden(idOrden: number): void {
    this.cargando = true;
  
    this.detallesOrden = [];
    this.mostrarModalDetalles = true;
    this.cargando = false;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
  }

  goBack(): void {
    this.location.back();
  }
}