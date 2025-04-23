import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../../core/services/company.service';
import { ICompany, ICompanySingleResponse } from '../../../../shared/models/ICompany';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-company-conf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-conf.component.html',
  styleUrls: ['./company-conf.component.scss']
})
export class CompanyConfComponent implements OnInit {
  @ViewChild('companyForm') companyForm!: NgForm;
  showModal = false;
  imagePreview: string | null = null;
  isLoading = false;
  isEditing = false;
  photoTouched = false;
  formSubmitted = false;

  // Límites de caracteres
  readonly MAX_NAME_LENGTH = 100;
  readonly MAX_ADDRESS_LENGTH = 200;
  readonly MAX_PHONE_LENGTH = 8;
  readonly MAX_EMAIL_LENGTH = 100;
  readonly MAX_NIT_LENGTH = 15;

  company: ICompany = {
    idCompany: 0,
    companyName: '',
    phoneNumber: '',
    address: '',
    email: '',
    nit: '',
    status: 'A',
    idLogo: 0,
    imgBase64: null,
    image: null
  };

  constructor(private companyService: CompanyService, private location: Location) {}

  ngOnInit(): void {
    this.loadCompany();
  }

  private loadCompany() {
    this.isLoading = true;
    this.companyService.getCompany().subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.company = response.value;
          this.imagePreview = response.value.imgBase64;
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al cargar la empresa', error)
    });
  }

  validateNumber(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  handleInput(field: keyof ICompany, maxLength: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value.length > maxLength) {
      input.value = value.substring(0, maxLength);
      (this.company[field] as any) = input.value;
    }
  }

  getRemainingChars(field: keyof ICompany, maxLength: number): number {
    const value = (this.company[field] as string) || '';
    return maxLength - value.length;
  }

  onSubmit() {
    this.formSubmitted = true;
    
    if (this.companyForm.invalid) {
      return;
    }

    if (this.company.phoneNumber.length !== this.MAX_PHONE_LENGTH) {
      Swal.fire('Error', `El teléfono debe tener exactamente ${this.MAX_PHONE_LENGTH} dígitos`, 'error');
      return;
    }

    if (!this.company.imgBase64) {
      Swal.fire('Error', 'El logo de la empresa es requerido', 'error');
      return;
    }

    this.saveCompany();
  }

  saveCompany() {
    this.isLoading = true;
    this.companyService.saveCompany(this.company).subscribe({
      next: (response) => {
        if (response.isSuccess && response.value) {
          this.company = response.value;
          this.imagePreview = response.value.imgBase64;
          Swal.fire('Éxito', 'Empresa guardada correctamente', 'success');
          this.isEditing = false;
        } else {
          Swal.fire('Error', response.error || 'Error al guardar', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => this.handleError('Error al guardar', error)
    });
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
            this.company.imgBase64 = (e.target.result as string).split(',')[1];
        }
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.photoTouched = true;
    this.imagePreview = null;
    this.company.imgBase64 = null;
    const fileInput = document.getElementById('companyLogo') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadCompany();
    }
  }

  goBack() {
    this.location.back();
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.isLoading = false;
    Swal.fire('Error', message, 'error');
  }
}
