import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators';

interface QuestionDto { id: number; questionLabel: string; }
interface AnswerDto { questionId: number; answerLabel: string; isCorrect: boolean; }
export interface QuizItem { id: number; question: string; answers: AnswerDto[]; }

@Injectable({ providedIn: 'root' })
export class QuizStore {
  private categoryIdSubject = new BehaviorSubject<number | null>(null);
  private playerNameSubject = new BehaviorSubject<string>('');
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly categoryId$ = this.categoryIdSubject.asObservable().pipe(distinctUntilChanged());
  readonly playerName$ = this.playerNameSubject.asObservable().pipe(distinctUntilChanged());
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  private cache = new Map<string, QuizItem[]>();

  readonly quizContent$ = this.categoryId$.pipe(
    tap(() => this.isLoadingSubject.next(true)),
    switchMap((categoryId) => {
      const key = categoryId == null ? 'all' : String(categoryId);
      if (this.cache.has(key)) return of(this.cache.get(key)!);

      const questionsUrl = categoryId == null
        ? 'http://localhost:3000/questions'
        : `http://localhost:3000/questions?categoryId=${categoryId}`;

      return this.http.get<QuestionDto[]>(questionsUrl).pipe(
        switchMap((questions) => {
          if (!questions?.length) return of<QuizItem[]>([]);
          const calls = questions.map((q) =>
            this.http.get<AnswerDto[]>(`http://localhost:3000/answers?questionId=${q.id}`).pipe(
              map((answers) => ({ id: q.id, question: q.questionLabel, answers }))
            )
          );
          return forkJoin(calls);
        }),
        tap((items) => this.cache.set(key, items)),
      );
    }),
    tap(() => this.isLoadingSubject.next(false)),
    shareReplay(1)
  );

  constructor(private http: HttpClient) {}

  setCategory(categoryId: number | null) {
    this.categoryIdSubject.next(categoryId);
  }

  setPlayerName(name: string) {
    this.playerNameSubject.next(name);
  }

  clearCache() {
    this.cache.clear();
  }
}


