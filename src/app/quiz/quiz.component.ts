import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { QuizService } from "../shared/services/quiz.service";
import { CategoriesService } from "../shared/services/categories.service";
import { QuizStore } from "../shared/state/quiz.store";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  standalone: false
})
export class QuizComponent implements OnInit {
  isQuizFinished = this.quizService.isQuizFinished;
  playerName = '';
  categoryId: number | null = null;
  categoryLabel = '';
  quizContent$ = this.quizStore.quizContent$;
  isLoading$ = this.quizStore.isLoading$;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private quizStore: QuizStore
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizService.playerName = params['playerName'];
      this.playerName = params['playerName'];
      this.categoryId = params['categoryId'] ? Number(params['categoryId']) : null;
      this.quizStore.setPlayerName(this.playerName);
      this.quizStore.setCategory(this.categoryId);
      if (this.categoryId != null) {
        this.categoriesService.getCategoryById(this.categoryId).subscribe((res: any) => {
          const cat = Array.isArray(res) ? res[0] : res;
          this.categoryLabel = cat?.name || cat?.title || '';
        });
      } else {
        this.categoryLabel = '';
      }
    });
  }

  goToResultPage() {
    this.router.navigate(['/result']);
  }
}
