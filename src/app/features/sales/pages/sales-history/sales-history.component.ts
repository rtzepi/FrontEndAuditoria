import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleHistoryService } from '../../../../core/services/sale-history.service';
import { ISale, ISaleResponse, ISaleDetailResponse, ISaleFull } from '../../../../shared/models/ISaleHistory';
import Swal from 'sweetalert2';
import { InputSearchComponent } from '../../../../shared/components/input-search/input-search.component';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSearchComponent
  ],
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.scss']
})
export class SalesHistoryComponent implements OnInit {
    showDetailsModal = false;
    sales: ISale[] = [];
    filteredSales: ISale[] = [];
    isLoading = false;
    saleDetails: ISaleFull | null = null;
    
    currentPage = 1;
    itemsPerPage = 10;
    searchTerm = '';
    searchSubject = new Subject<string>();

    constructor(
        private saleService: SaleHistoryService,
        private location: Location,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadSales();
        this.setupSearch();
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.showDetailsModal) {
            this.closeDetailsModal();
        }
    }

    private loadSales() {
        this.isLoading = true;
        
        this.saleService.getSales().subscribe({
            next: (response: ISaleResponse) => {
                if (response.isSuccess && response.value) {
                    this.sales = Array.isArray(response.value) ? response.value : [response.value];
                    this.filteredSales = [...this.sales];
                }
                this.isLoading = false;
            },
            error: (error) => this.handleError('Error al cargar ventas', error)
        });
    }

    private setupSearch() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.searchTerm = term;
            this.filterSales();
            this.currentPage = 1;
        });
    }

    handleSearch(searchTerm: string) {
        this.searchSubject.next(searchTerm);
    }

    filterSales() {
        if (!this.searchTerm) {
            this.filteredSales = [...this.sales];
            return;
        }
        
        const term = this.searchTerm.toLowerCase();
        this.filteredSales = this.sales.filter(sale => 
            (sale.idSale.toString().includes(term) ||
            (sale.saleDate.toLowerCase().includes(term)) ||
            (sale.typePayment.toLowerCase().includes(term)) ||
            (sale.user.toLowerCase().includes(term))
        ));
    }

    get paginatedSales() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredSales.slice(startIndex, startIndex + this.itemsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.filteredSales.length / this.itemsPerPage);
    }

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }

    previousPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    openDetailsModal(idSale: number) {
        this.isLoading = true;
        this.saleService.getSaleDetails(idSale).subscribe({
            next: (response: ISaleDetailResponse) => {
                if (response.isSuccess && response.value) {
                    this.saleDetails = response.value;
                    this.showDetailsModal = true;
                }
                this.isLoading = false;
            },
            error: (error) => {
                this.handleError('Error al cargar detalles de venta', error);
                this.isLoading = false;
            }
        });
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.saleDetails = null;
    }

    downloadPdf(idSale: number) {
        this.isLoading = true;
        this.saleService.generateSalePdf(idSale).subscribe({
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
                    filename = `recibo_venta_${idSale}.pdf`;
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
            error: (error) => {
                this.handleError('Error al generar PDF', error);
                this.isLoading = false;
            }
        });
    }

    private handleError(message: string, error: any) {
        console.error(message, error);
        Swal.fire('Error', message, 'error');
    }

    goBack() {
        this.location.back();
    }
}