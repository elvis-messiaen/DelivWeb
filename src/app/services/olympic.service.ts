import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json'; // URL du fichier JSON
  private olympics$ = new BehaviorSubject<any>(undefined); // BehaviorSubject pour stocker les données

  constructor(private http: HttpClient) {}

  loadInitialData(): void {
    // Charge les données initiales
    this.http
      .get<any>(this.olympicUrl)
      .pipe(
        tap((value) => this.olympics$.next(value)), // Met à jour le BehaviorSubject avec les données
        catchError((error) => {
          console.error('Erreur lors du chargement des données :', error); // Gère les erreurs
          this.olympics$.next(null); // Met à jour le BehaviorSubject avec null en cas d'erreur
          return []; // Retourne un tableau vide en cas d'erreur
        })
      )
      .subscribe();
  }

  getOlympics(): Observable<any> {
    return this.olympics$.asObservable(); // Retourne l'observable des données olympiques
  }
}
