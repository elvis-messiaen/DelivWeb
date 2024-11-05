import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Olympics } from '../models/olympics';

// Utilisation du décorateur Injectable pour rendre ce service disponible à l'échelle de l'application
@Injectable({
  providedIn: 'root',
})
// Déclaration de la classe du service OlympicService
export class OlympicService {
  // Définition de l'URL du fichier JSON contenant les données des Jeux Olympiques
  private olympicUrl = './assets/mock/olympic.json';
  // Création d'un BehaviorSubject pour stocker et émettre les données des Jeux Olympiques
  private olympics$ = new BehaviorSubject<Olympics[]>([]);
  // Conversion du BehaviorSubject en Observable pour permettre la souscription
  public olympic = this.olympics$.asObservable();

  // Constructeur de la classe avec injection du HttpClient pour effectuer les requêtes HTTP
  constructor(private http: HttpClient) {}

  // Méthode pour obtenir les données des Jeux Olympiques
  getOlympics(): Observable<Olympics[]> {
    // Requête HTTP GET pour récupérer les données des Jeux Olympiques
    return this.http.get<Olympics[]>(this.olympicUrl).pipe(
      // Mise à jour du BehaviorSubject avec les données récupérées
      tap((olympic) => this.olympics$.next(olympic)),
      // Gestion des erreurs lors de la récupération des données
      catchError(() => {
        this.olympics$.error('Data loading error'); // Émission d'une erreur
        return []; // Retourne un tableau vide en cas d'erreur
      })
    );
  }

  // Méthode pour obtenir les données d'un jeu olympique par son identifiant
  getOlympicById(id: string): Observable<Olympics | undefined> {
    // Conversion de l'ID en nombre
    const numericId = +id;
    // Log de débogage pour afficher l'ID recherché
    console.log(`Recherche de l'olympique avec l'ID: ${numericId}`);
    // Requête HTTP GET pour récupérer les données des Jeux Olympiques
    return this.http.get<Olympics[]>(this.olympicUrl).pipe(
      // Recherche du jeu olympique correspondant à l'ID
      map((olympics) => {
        const found = olympics.find((olympic) => olympic.id === numericId);
        // Log de débogage pour afficher l'objet trouvé
        console.log('Olympique trouvé:', found);
        // Retourne l'objet trouvé ou undefined s'il n'existe pas
        return found;
      })
    );
  }
}
