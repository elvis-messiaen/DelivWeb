import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Olympics } from '../models/olympics';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympics[]>([]);
  public olympic = this.olympics$.asObservable();

  constructor(private http: HttpClient) {}

  getOlympics(): Observable<Olympics[]> {
    return this.http.get<Olympics[]>(this.olympicUrl).pipe(
      tap((olympic) => this.olympics$.next(olympic)),
      catchError(() => {
        this.olympics$.error('Data loading error');
        return [];
      })
    );
  }

  getOlympicById(id: string): Observable<Olympics | undefined> {
    const numericId = +id;
    return this.http.get<Olympics[]>(this.olympicUrl).pipe(
      map((olympics) => {
        const found = olympics.find((olympic) => olympic.id === numericId);
        return found;
      })
    );
  }
}
