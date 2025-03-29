import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { IProfileResponse, IProfile } from '../../shared/models/IProfile';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  profileData: IProfile = {
    firstName: '',
    fatherLastName: '',
    roleName: '',
    picture: ''
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: IProfileResponse) => {
        if (response.isSuccess && response.value) {
          this.profileData = response.value;
        }
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
      }
    });
  }

  getFullName(): string {
    return `${this.profileData?.firstName || ''} ${this.profileData?.fatherLastName || ''}`.trim() || 'Usuario';
  }
}