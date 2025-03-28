import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../../../../app/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    BtnAcceptComponent,
    BtnCloseComponent
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @ViewChild('userForm') userForm!: NgForm;
  showModal: boolean = false;
  users: any[] = [];
  imagePreview: string | null = null;
  isLoading: boolean = false;

  newUser = {
    userName: '',
    password: '',
    status: 'E',
    isChangePass: true,
    idEmployee: 0,
    idRole: 0,
    picture: ''
  };

  constructor(private http: HttpClient, private location: Location) {}
  goBack() {
    this.location.back();
}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.isLoading = true;
    this.http.get<any>(`${environment.baseUrlApi}/User/users`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.users = response.value;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.isLoading = false;
      }
    });
  }

  openAddUserModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.imagePreview = null;
    this.newUser = {
      userName: '',
      password: '',
      status: 'E',
      isChangePass: true,
      idEmployee: 0,
      idRole: 0,
      picture: ''
    };
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
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
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
      this.newUser.picture = e.target.result.split(',')[1]; 
    };
    reader.readAsDataURL(file);
  }

  addUser() {
    if (this.userForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const userData = {
      userName: this.newUser.userName.trim(),
      password: this.newUser.password,
      status: this.newUser.status,
      isChangePass: this.newUser.isChangePass,
      idEmployee: this.newUser.idEmployee,
      idRole: this.newUser.idRole,
      picture: this.newUser.picture
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    this.http.post(`${environment.baseUrlApi}/User/register`, userData, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Usuario creado correctamente',
              icon: 'success',
              timer: 3000
            });
            this.users.push(response.value);
            this.closeModal();
          } else {
            Swal.fire('Error', response.message || 'Error al crear usuario', 'error');
          }
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error al conectar con el servidor';
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          }
          Swal.fire('Error', errorMessage, 'error');
          console.error('Error completo:', error);
        }
      });
  }
}