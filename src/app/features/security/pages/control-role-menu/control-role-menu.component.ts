import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../../../../app/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BtnAcceptComponent } from '../../../../shared/components/btn-accept/btn-accept.component';
import { BtnCloseComponent } from '../../../../shared/components/btn-close/btn-close.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-control-role-menu',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    BtnAcceptComponent,
    BtnCloseComponent
  ],
  templateUrl: './control-role-menu.component.html',
  styleUrls: ['./control-role-menu.component.scss']
})
export class ControlRoleMenuComponent implements OnInit {
  @ViewChild('roleMenuForm') roleMenuForm!: NgForm;
  showModal: boolean = false;
  roleMenus: any[] = [];
  isLoading: boolean = false;

  newRoleMenu = {
    idRole: 0,
    idMenu: 0,
    status: 'E'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRoleMenus();
  }

  getRoleMenus() {
    this.isLoading = true;
    this.http.get<any>(`${environment.baseUrlApi}/RoleMenu/List`).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roleMenus = response.value;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener relaciones rol-menú:', error);
        this.isLoading = false;
      }
    });
  }

  openAddRoleMenuModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newRoleMenu = {
      idRole: 0,
      idMenu: 0,
      status: 'E'
    };
  }

  addRoleMenu() {
    if (this.roleMenuForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      return;
    }

    this.isLoading = true;

    const roleMenuData = {
      idRole: this.newRoleMenu.idRole,
      idMenu: this.newRoleMenu.idMenu,
      status: this.newRoleMenu.status
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    this.http.post(`${environment.baseUrlApi}/RoleMenu/Add`, roleMenuData, { headers })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            Swal.fire({
              title: 'Éxito',
              text: 'Relación Rol-Menú agregada correctamente',
              icon: 'success',
              timer: 3000
            });
            this.getRoleMenus();
            this.closeModal();
          } else {
            Swal.fire('Error', response.message || 'Error al agregar relación', 'error');
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