import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { CategoriesService } from "../shared/services/categories.service";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  standalone: false
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  playerName = '';

  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.playerName = params['playerName'];
    });
    this.categoriesService.getCategories().subscribe((cats: any) => {
      this.categories = cats || [];
      this.filtered = this.categories;
    });
  }

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filtered = this.categories;
      return;
    }
    this.filtered = this.categories.filter(c =>
      (c.name || c.title || '').toLowerCase().includes(term)
    );
  }

  resetFilter() {
    this.searchTerm = '';
    this.filtered = this.categories;
  }

  selectCategory(categoryId: number) {
    this.router.navigate(['/quiz', this.playerName, categoryId]);
  }
}


