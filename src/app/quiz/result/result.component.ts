import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { QuizService } from '../../shared/services/quiz.service';
import { QuizStore } from '../../shared/state/quiz.store';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
  standalone: false,
})
export class ResultComponent implements OnInit {
  score = 0;
  scoreTotal = 0;
  playerName = this.quizService.playerName;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private quizStore: QuizStore
  ) {}

  ngOnInit(): void {
    this.quizStore.quizContent$.pipe(take(1)).subscribe((items) => {
      this.scoreTotal = items?.length || 0;
      let computedScore = 0;
      for (const item of items || []) {
        const player = this.quizService.playerAnswers.find(
          (a) => a.questionId === item.id
        );
        if (!player) continue;
        const correct = (item.answers || []).find(
          (ans: any) => ans.isCorrect && ans.answerLabel === player.answer
        );
        if (correct) computedScore += 1;
      }
      this.score = computedScore;
    });
  }

  goToHome() {
    this.router.navigate(['/']);
    this.quizService.resetQuiz();
  }

  getGifUrl() {
    if (this.score > this.scoreTotal / 2)
      return 'https://media.giphy.com/media/YRuFixSNWFVcXaxpmX/giphy.gif';
    return 'https://media.giphy.com/media/jWcypagX0tNtiup1pg/giphy.gif';
  }
}
