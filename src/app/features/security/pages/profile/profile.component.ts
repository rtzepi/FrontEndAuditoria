import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { IProfile, IProfileResponse } from '../../../../shared/models/IProfile';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: IProfile | null = null;
  loading = true;
  error: string | null = null;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;
    
    this.profileService.getProfile().subscribe({
      next: (response: IProfileResponse) => {
        if (response.isSuccess && response.value) {
          this.profile = response.value;
        } else {
          this.error = response.error || 'No se pudo cargar el perfil';
        }
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'Error al cargar el perfil';
        this.loading = false;
      }
    });
  }

  getFullName(): string {
    if (!this.profile) return 'Nombre no disponible';
    return [
      this.profile.firstName,
      this.profile.middleName,
      this.profile.fatherLastName,
      this.profile.motherLastName
    ].filter(Boolean).join(' ') || 'Nombre no disponible';
  }

  getProfileImage(): string | null {
    if (!this.profile?.picture) return null;
    return this.profile.picture.startsWith('data:image') 
      ? this.profile.picture 
      : `data:image/jpeg;base64,${this.profile.picture}`;
  }

  getStatusText(status?: string): string {
    switch(status) {
      case 'E': return 'Activo';
      case 'D': return 'Desactivado';
      case 'P': return 'Pendiente';
      default: return 'Estado desconocido';
    }
  }
}