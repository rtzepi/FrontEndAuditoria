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
  selector: 'app-role',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    BtnAcceptComponent,
    BtnCloseComponent
  ],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  @ViewChild('roleForm') roleForm!: NgForm;
  showModal: boolean = false;
  roles: any[] = [];
  isLoading: boolean = false;

  newRole = {
    roleName: '',
    description: '',
    status: 'E'
  };

  constructor(private http: HttpClient, private location: Location) {}
  goBack() {
    this.location.back();
}

  ngOnInit() {
    this.getRoles();
  }

  getRoles() {
    this.isLoading = true;
    this.http.get<any>(`${environment.baseUrlApi}/Role/List`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roles = response.value;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener roles:', error);
        this.isLoading = false;
      }
    });
  }

  openAddRoleModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newRole = {
      roleName: '',
      description: '',
      status: 'E'
    };
  }

  addRole() {
    if (this.roleForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const roleData = {
      roleName: this.newRole.roleName.trim(),
      description: this.newRole.description.trim(),
      status: this.newRole.status
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    this.http.post(`${environment.baseUrlApi}/Role/Add`, roleData, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Rol agregado correctamente',
              icon: 'success',
              timer: 3000
            });
            this.getRoles();
            this.closeModal();
          } else {
            Swal.fire('Error', response.message || 'Error al agregar rol', 'error');
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