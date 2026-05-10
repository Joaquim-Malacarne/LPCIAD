import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IntegrantesContent {
  content: string;
  images: string[];
}

@Injectable({ providedIn: 'root' })
export class IntegrantesService {

  private readonly apiUrl = `${environment.apiUrl}/Integrantes`;

  constructor(private http: HttpClient) {}

  getContent(lang: string): Observable<IntegrantesContent> {
    return this.http.get<IntegrantesContent>(`${this.apiUrl}/Language/${lang}`);
  }

  update(contentPt: string, contentEn: string, images: File[]): Observable<any> {
    const form = new FormData();
    form.append('contentPt', contentPt);
    form.append('contentEn', contentEn ?? '');
    images.forEach(img => form.append('images', img, img.name));
    return this.http.put(`${this.apiUrl}`, form, { responseType: 'text' });
  }

  getImageUrl(imageName: string): string {
    return `${this.apiUrl}/Image/${imageName}`;
  }
}
