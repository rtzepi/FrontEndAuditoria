import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss'
})
export class ImageUploaderComponent implements OnInit {
  @Input() control!: FormControl | null;
  @Input() imageUrl: string | null = null;
  @Input() label: string = 'Subir archivo';
  imgPreview: any;


  ngOnInit(): void {
    if (this.imageUrl) {
      this.imgPreview = this.imageUrl;
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.control?.setValue(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgPreview = e.target?.result;
    }

    reader.readAsDataURL(file);
  }
}
