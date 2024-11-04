import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Olympics } from '../models/olympics';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json'; // URL du fichier JSON
  private olympics$ = new BehaviorSubject<Olympics[]>([]); // BehaviorSubject pour stocker les données
  public olympic = this.olympics$.asObservable();

  constructor(private http: HttpClient) {}

  getOlympics(): Observable<Olympics[]> {
    return this.http.get<Olympics[]>(this.olympicUrl).pipe(
      tap((olympic) => this.olympics$.next(olympic)), // Met à jour le BehaviorSubject
      catchError(() => {
        this.olympics$.error('Data loading error'); // Émet une erreur
        return [];
      })
    );
  }

  getOlympicById(id: string): Observable<Olympics | undefined> {
    const numericId = parseInt(id, 10); // Convertir l'ID en nombre
    console.log(`Recherche de l'olympique avec l'ID: ${numericId}`); // Log de débogage
    return this.http.get<Olympics[]>(this.olympicUrl).pipe(
      map((olympics) => {
        const found = olympics.find((olympic) => olympic.id === numericId);
        console.log('Olympique trouvé:', found); // Log de débogage
        return found; // Retourner l'olympique trouvé ou undefined
      })
    );
  }
}
