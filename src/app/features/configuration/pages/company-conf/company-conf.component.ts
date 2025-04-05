import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-conf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-conf.component.html',
  styleUrls: ['./company-conf.component.scss']
})
export class CompanyConfComponent {
  modoEdicion = false;
  modalAbierto = false;
  vistaPrevia: string | ArrayBuffer | null = null;
  imagenTemporal: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;

  empresaOriginal: { [key: string]: string };
  empresa: { [key: string]: string } = {
    nombre: 'FERRETERIA EL CONDOR',
    direccion: '6TA AVE 4-55 ZONA 2',
    nit: '4087162-2',
    telefono: '',
    email: 'ELCONDOR2114@GMAIL.COM'
  };

  campos = [
    { label: 'Nombre', key: 'nombre', placeholder: 'Nombre de la Empresa' },
    { label: 'Dirección', key: 'direccion', placeholder: 'Dirección de la Empresa' },
    { label: 'NIT', key: 'nit', placeholder: 'NIT de la Empresa' },
    { label: 'Teléfono', key: 'telefono', placeholder: 'Teléfono de la Empresa' },
    { label: 'Email', key: 'email', placeholder: 'Correo de la Empresa' }
  ];

  telefonoInvalido = false;
  touchedFields: { [key: string]: boolean } = {};
  campoIncompleto: { [key: string]: boolean } = {};

  constructor() {
    const datos = localStorage.getItem('empresa');
    if (datos) {
      this.empresa = JSON.parse(datos);
    }

    this.empresaOriginal = { ...this.empresa };

    const logo = localStorage.getItem('logoEmpresa');
    if (logo) {
      this.vistaPrevia = logo;
    }
  }

  validarTelefono() {
    let telefono = this.empresa['telefono'];
    telefono = telefono.slice(0, 8);
    this.empresa['telefono'] = telefono;
    this.telefonoInvalido = telefono.length !== 8 || !/^\d+$/.test(telefono);
  }

  volver() {
    history.back();
  }

  guardarEmpresa() {
    this.campoIncompleto = {};

    for (const key in this.empresa) {
      if (!this.empresa[key]) {
        this.campoIncompleto[key] = true;
      }
    }

    if (Object.keys(this.campoIncompleto).length > 0 || this.telefonoInvalido) {
      return;
    }

    localStorage.setItem('empresa', JSON.stringify(this.empresa));
    if (this.vistaPrevia) {
      localStorage.setItem('logoEmpresa', this.vistaPrevia.toString());
    }

    this.modoEdicion = false;
  }

  cancelarEdicion() {
    this.empresa = { ...this.empresaOriginal };
    this.modoEdicion = false;
  }

  abrirModal() {
    this.imagenTemporal = this.vistaPrevia;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.archivoSeleccionado = null;
    this.imagenTemporal = this.vistaPrevia;
  }

  guardarImagen() {
    this.vistaPrevia = this.imagenTemporal;
    this.modalAbierto = false;
  }

  onArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;
      const lector = new FileReader();
      lector.onload = () => {
        this.imagenTemporal = lector.result;
      };
      lector.readAsDataURL(archivo);
    }
  }
}
