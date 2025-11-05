import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { QuizService } from "../shared/services/quiz.service";
import { CategoriesService } from "../shared/services/categories.service";

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

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizService.playerName = params['playerName'];
      this.playerName = params['playerName'];
      this.categoryId = params['categoryId'] ? Number(params['categoryId']) : null;
      this.quizService.resetQuiz();
      this.quizService.getQuizContent(this.categoryId != null ? this.categoryId : undefined);
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
