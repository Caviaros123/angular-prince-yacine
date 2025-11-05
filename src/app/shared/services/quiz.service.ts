import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  quizContent: any[] = [];
  playerAnswers: { questionId: number; answer: string }[] = [];
  score = 0;
  isQuizFinished = false;
  playerName: string = '';
  isLoading = false;

  private questionsSub?: Subscription;
  private answersSubs: Subscription[] = [];

  constructor(private http: HttpClient) {}

  checkAnswers() {
    this.score = 0;
    for (let i = 0; i < this.playerAnswers.length; i++) {
      const question = this.quizContent.find(
        (q) => q.id === this.playerAnswers[i].questionId
      );
      if (!question) continue;
      for (let j = 0; j < question.answers.length; j++) {
        const currentAnswer = question.answers[j];
        if (
          currentAnswer?.isCorrect &&
          this.playerAnswers[i].answer === currentAnswer.answerLabel
        ) {
          this.score += 1;
          break;
        }
      }
    }
    this.isQuizFinished = true;
  }

  addAnswer(answer: string, questionId: number) {
    const isAnswered = this.playerAnswers.find(
      (a) => a.questionId === questionId
    );
    if (isAnswered) {
      isAnswered.answer = answer;
      return;
    }
    this.playerAnswers.push({ questionId, answer });
  }

  getQuizContent(categoryId?: number) {
    this.cancelOngoingRequests();
    this.resetQuiz();
    this.isLoading = true;

    const questionsUrl =
      categoryId != null
        ? `http://localhost:3000/questions?categoryId=${categoryId}`
        : 'http://localhost:3000/questions';

    this.questionsSub = this.http.get<any[]>(questionsUrl).subscribe(
      (questions: any[]) => {
        if (!Array.isArray(questions) || questions.length === 0) {
          this.isLoading = false;
          return;
        }
        let remaining = questions.length;
        for (const question of questions) {
          const sub = this.http
            .get<any[]>(
              `http://localhost:3000/answers?questionId=${question.id}`
            )
            .subscribe( // TODO: Fix avec les new syntaxe
              (answers: any[]) => {
                this.quizContent.push({
                  id: question.id,
                  question: question.questionLabel,
                  answers,
                });
                remaining -= 1;
                if (remaining === 0) {
                  this.isLoading = false;
                  this.clearFinishedAnswerSubs();
                }
              },
              () => {
                remaining -= 1;
                if (remaining === 0) {
                  this.isLoading = false;
                  this.clearFinishedAnswerSubs();
                }
              }
            );
          this.answersSubs.push(sub);
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  resetQuiz() {
    this.quizContent = [];
    this.playerAnswers = [];
    this.score = 0;
    this.isQuizFinished = false;
  }

  private cancelOngoingRequests() {
    if (this.questionsSub) {
      this.questionsSub.unsubscribe();
      this.questionsSub = undefined;
    }
    for (const sub of this.answersSubs) {
      try {
        sub.unsubscribe();
      } catch {}
    }
    this.answersSubs = [];
  }

  private clearFinishedAnswerSubs() {
    for (const sub of this.answersSubs) {
      try {
        sub.unsubscribe();
      } catch {}
    }
    this.answersSubs = [];
  }
}
