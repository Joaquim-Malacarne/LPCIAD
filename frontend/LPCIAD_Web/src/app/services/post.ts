import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PostListItem } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private readonly apiUrl = `${environment.apiUrl}/Posts`;

  constructor(private http: HttpClient) {}

  // retorna a lista resumida de todos os posts
  getAll(): Observable<PostListItem[]> {
    return this.http.get<PostListItem[]>(this.apiUrl);
  }

  // retorna o detalhe completo de um post pelo id e idioma (ex: 'pt' ou 'en')
  getById(id: number, lang: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/Language/${lang}`);
  }

  // cria um novo post com conteúdo em PT, EN opcional, descrição e imagens
  create(contentPt: string, contentEn: string, description: string, images: File[]): Observable<any> {
    const form = this.buildFormData(contentPt, contentEn, description, images);
    return this.http.post(this.apiUrl, form, { responseType: 'text' });
  }

  // atualiza um post existente pelo id
  update(id: number, contentPt: string, contentEn: string, description: string, images: File[]): Observable<any> {
    const form = this.buildFormData(contentPt, contentEn, description, images);
    return this.http.put(`${this.apiUrl}/${id}`, form, { responseType: 'text' });
  }

  // retorna a URL pública de uma imagem vinculada a um post
  getImageUrl(id: number, imageName: string): string {
    return `${this.apiUrl}/${id}/Image/${imageName}`;
  }

  // remove um post pelo id
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  // monta o FormData para envio multipart (usado no create e update)
  private buildFormData(contentPt: string, contentEn: string, description: string, images: File[]): FormData {
    const form = new FormData();
    form.append('contentPt', contentPt);
    form.append('contentEn', contentEn ?? '');
    form.append('description', description ?? '');
    images.forEach(img => form.append('images', img, img.name));
    return form;
  }
}