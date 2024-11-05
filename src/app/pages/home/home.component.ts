import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Olympics } from '../../models/olympics';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { OlympicService } from '../../services/olympic.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Nombre total de JOs
  numberofJOs: number | null = null;
  // Nombre total de pays
  numberCountries: number | null = null;

  public chart: Chart | undefined;
  public hoveredCountryId!: number | undefined;

  // Données pour le graphique en secteurs
  public pieChartData: ChartData<'pie'> = {
    labels: [], // Les labels seront remplis dynamiquement
    datasets: [
      {
        label: 'Médailles remportées',
        data: [], // Les données seront remplies dynamiquement
        backgroundColor: [
          'rgba(137, 73, 81, 0.6)',
          'rgba(106, 40, 65, 0.6)',
          'rgba(166, 193, 227, 0.6)',
          'rgba(112, 145, 214, 0.6)',
          'rgba(172, 219, 238, 0.6)',
          'rgba(134, 107, 145, 0.6)',
        ],
      },
    ],
  };

  // Options du graphique
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true, // Rendre le graphique réactif
    plugins: {
      legend: {
        display: false, // Désactiver la légende
        position: 'top' as const, // Position de la légende
        labels: {
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const index = tooltipItem.dataIndex; // Index du secteur survolé
            const label = tooltipItem.label; // Nom du pays
            const data = this.pieChartData.datasets[0].data[index]; // Nombre de médailles
            // Vérifie que l'index est valide avant d'accéder aux données des JO
            if (this.olympics && index >= 0 && index < this.olympics.length) {
              this.hoveredCountryId = this.olympics[index].id; // Récupère l'ID du pays
            } else {
              this.hoveredCountryId = undefined; // Définir à undefined si l'index est invalide
            }

            // Met à jour le nombre de JOs
            this.numberofJOs = data;
            // Force la détection des changements
            this.cdr.markForCheck();
            // Retourne le texte formaté pour le tooltip
            return `${label}: ${data} médailles`;
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        left: 20,
        right: 20,
      },
    },
    aspectRatio: 1.5,
  };

  // Type du graphique spécifié en tant que chaîne
  public pieChartType: 'pie' = 'pie';

  // Tableau pour stocker les données olympiques (initialisé vide)
  public olympics: Olympics[] | undefined;

  // Longueur des lignes à dessiner
  private lineLength: number = 50;

  // Injection du service, ChangeDetectorRef et du routeur
  constructor(
    private olympicService: OlympicService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  // Méthode d'initialisation du composant
  ngOnInit(): void {
    // Appel du service pour récupérer les données des JO
    this.olympicService.getOlympics().subscribe(
      (data: Olympics[]) => {
        // Stocke les données reçues dans la variable olympics
        this.olympics = data;

        // Met à jour le nombre de pays
        this.numberCountries = this.olympics.length;

        // Initialise les labels et les données du graphique
        this.pieChartData.labels = [];
        this.pieChartData.datasets[0].data = [];

        // Remplit les labels et les données avec les pays et le nombre de médailles
        this.olympics.forEach((country) => {
          this.pieChartData.labels?.push(country.country);
          const medalsCount = country.participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          );
          this.pieChartData.datasets[0].data.push(medalsCount);
        });

        // Enregistre le plugin personnalisé pour le graphique
        this.registerCustomPlugin();
        // Déclenche la détection des changements
        this.cdr.detectChanges();

        // Met à jour l'instance du graphique après un léger délai
        setTimeout(() => {
          const chartElement = document.querySelector('canvas');
          if (chartElement) {
            const chartInstance = Chart.getChart(chartElement); // Récupère l'instance du graphique
            if (chartInstance) {
              chartInstance.update(); // Mise à jour du graphique
            }
          }
        }, 0);
      },
      // Gestion des erreurs lors de la récupération des données
      (error) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );
  }

  // Méthode pour gérer le clic sur le graphique
  onChartClick(): void {
    // Vérifie si un ID de pays est disponible pour la navigation
    if (this.hoveredCountryId) {
      this.router.navigate(['/details', this.hoveredCountryId]);
    } else {
      console.error('Aucun ID de pays disponible pour la navigation.');
    }
  }

  // Enregistre un plugin personnalisé pour dessiner des lignes sur le graphique
  private registerCustomPlugin() {
    const customPlugin = {
      id: 'customLines',
      afterDraw: (chart: {
        ctx: CanvasRenderingContext2D;
        chartArea: any;
        data: { datasets: any; labels: string[] };
        getDatasetMeta: (arg0: any) => any;
      }) => {
        const ctx = chart.ctx;
        const datasets = chart.data.datasets;

        // Parcourt chaque ensemble de données
        datasets.forEach(
          (dataset: { data: number[] }, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            // Parcourt chaque élément du graphique
            meta.data.forEach(
              (
                element: {
                  getProps: (
                    arg0: string[],
                    arg1: boolean
                  ) => {
                    x: number;
                    y: number;
                    startAngle: number;
                    endAngle: number;
                    outerRadius: number;
                  };
                },
                index: number
              ) => {
                const model = element.getProps(
                  ['x', 'y', 'startAngle', 'endAngle', 'outerRadius'],
                  true
                );

                // Récupère les coordonnées et les données
                const label = chart.data.labels[index];
                const data = dataset.data[index];
                const labelX = model.x;
                const labelY = model.y;

                // Définit les couleurs pour chaque secteur
                const colors = [
                  'rgba(137, 73, 81, 1)',
                  'rgba(106, 40, 65, 1)',
                  'rgba(166, 193, 227, 1)',
                  'rgba(112, 145, 214, 1)',
                  'rgba(172, 219, 238, 1)',
                  'rgba(134, 107, 145, 1)',
                ];

                ctx.save();
                ctx.strokeStyle = colors[index];
                ctx.lineWidth = 2;
                ctx.font = '16px Arial';
                ctx.beginPath();

                // Calcule les coordonnées de l'extrémité des lignes
                const angle = (model.startAngle + model.endAngle) / 2;
                const xOuter = model.x + Math.cos(angle) * model.outerRadius;
                const yOuter = model.y + Math.sin(angle) * model.outerRadius;

                // Dessine les lignes partant du cercle
                ctx.moveTo(xOuter, yOuter);
                ctx.lineTo(xOuter + this.lineLength, yOuter);
                ctx.stroke();

                // Positionne le texte en fonction de l'angle
                const textX =
                  xOuter + this.lineLength + (angle > Math.PI ? -5 : 5);
                const textY = yOuter;

                // Affiche le label à côté de la ligne
                ctx.fillText(`${label} `, textX, textY);
                ctx.restore();
              }
            );
          }
        );
      },
    };

    // Enregistre le plugin personnalisé dans Chart.js
    Chart.register(customPlugin);
  }
}
