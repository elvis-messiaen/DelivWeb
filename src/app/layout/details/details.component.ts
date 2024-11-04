import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OlympicService } from '../../services/olympic.service';
import { Olympics } from '../../models/olympics';
import { ChartData, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [CommonModule, RouterModule, BaseChartDirective], // Import des modules nécessaires
})
export class DetailsComponent implements OnInit {
  // Variable pour stocker les détails olympiques, initialisée à null
  olympicDetails: Olympics | null = null;
  numberofEntry: number | null = null;
  numberMedals: number | null = null;
  TotalNumberAthletes: number | null = null;

  // Configuration des données du graphique de type 'line'
  chartData: ChartData<'line'> = {
    labels: [], // Les labels pour l'axe des X (Dates)
    datasets: [
      {
        label: 'Nombre de médailles', // Titre de la courbe
        data: [], // Données de la courbe (nombre de médailles)
        fill: false, // Pas de remplissage sous la ligne
        borderColor: 'blue', // Couleur de la ligne
        tension: 0.1, // Tension de la courbe pour un effet lisse
      },
    ],
  };

  // Options de configuration pour le graphique
  chartOptions: ChartOptions<'line'> = {
    responsive: true, // Rendre le graphique réactif
    plugins: {
      legend: {
        display: false, // Ne pas afficher la légende
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Commencer l'axe Y à zéro
        ticks: {
          stepSize: 5, // Intervalle des graduations de l'axe Y
        },
      },
      x: {
        title: {
          display: true, // Afficher le titre de l'axe X
          text: 'Dates', // Texte du titre de l'axe X
        },
      },
    },
  };

  constructor(
    // Injection de la route active pour accéder aux paramètres de l'URL
    private route: ActivatedRoute,
    // Injection du service OlympicService pour accéder aux données
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idCountry = params.get('id');
          console.log('ID reçu:', idCountry);
          return idCountry ? this.olympicService.getOlympicById(idCountry) : [];
        })
      )
      .subscribe((data) => {
        this.olympicDetails = data || null;
        console.log('Détails olympiques reçus:', this.olympicDetails);
        if (this.olympicDetails) {
          // Calcul du nombre total d'entrées
          this.numberofEntry = this.olympicDetails.participations.length;

          // Calcul du nombre total de médailles
          this.numberMedals = this.olympicDetails.participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          );

          // Calcul du nombre total d'athlètes
          this.TotalNumberAthletes = this.olympicDetails.participations.reduce(
            (total, participation) => total + participation.athleteCount,
            0
          );

          this.setupChartData(); // Mettre à jour les données du graphique
        } else {
          console.error('Pas de détails olympiques disponibles.');
        }
      });
  }

  setupChartData(): void {
    // Vérifie si les détails olympiques sont disponibles
    if (this.olympicDetails) {
      // Assurez-vous que les participations existent et contiennent des données
      if (
        this.olympicDetails.participations &&
        this.olympicDetails.participations.length > 0
      ) {
        // Remplit les labels avec les dates de chaque participation
        this.chartData.labels = this.olympicDetails.participations.map(
          (participation) => participation.year.toString()
        );

        // Remplit les données avec le nombre de médailles de chaque participation
        this.chartData.datasets[0].data =
          this.olympicDetails.participations.map(
            (participation) => participation.medalsCount
          );

        // Met à jour le graphique en créant une nouvelle référence pour déclencher une mise à jour
        this.chartData = { ...this.chartData }; // Déclenche une mise à jour
      } else {
        console.error(
          'Aucune participation disponible pour les détails olympiques.'
        );
      }
    } else {
      console.error('Pas de détails olympiques disponibles.');
    }
  }

  // Méthode pour revenir à la page précédente
  goBack(): void {
    window.history.back(); // Utiliser l'historique du navigateur pour revenir
  }
}
