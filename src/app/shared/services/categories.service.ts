import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(private http: HttpClient) { }

  getCategories() {
    return this.http.get('http://localhost:3000/categories');
  }

  getCategoryById(id: number) {
    return this.http.get(`http://localhost:3000/categories?id=${id}`);
  }
}


