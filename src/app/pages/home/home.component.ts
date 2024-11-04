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
  numberofJOs: number | null = null;
  numberCountries: number | null = null;

  public chart: Chart | undefined;
  public hoveredCountryId!: number | undefined;

  // injection du service et de ChangeDetectorRef
  constructor(
    private olympicService: OlympicService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  onChartClick(): void {
    if (this.hoveredCountryId) {
      // Utilisez l'ID récupéré par le survol pour naviguer vers le composant de détail
      this.router.navigate(['/details', this.hoveredCountryId]);
    } else {
      console.error('Aucun ID de pays disponible pour la navigation.');
    }
  }

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
        display: false, // desactiver la légende
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
            // Vérifiez que l'index est valide avant d'accéder à this.olympics
            if (this.olympics && index >= 0 && index < this.olympics.length) {
              this.hoveredCountryId = this.olympics[index].id; // Récupérer l'ID du pays
            } else {
              this.hoveredCountryId = undefined; // Définir à undefined si l'index est invalide
            }

            this.numberofJOs = data;
            this.cdr.markForCheck();
            return `${label}: ${data} médailles`; // Formatage du texte du tooltip
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

  // Type du graphique
  public pieChartType: 'pie' = 'pie'; // Type de graphique spécifié en tant que chaîne

  // Tableau pour stocker les données olympiques (initialisé vide)
  public olympics: Olympics[] | undefined;

  // Longueur des lignes à dessiner
  private lineLength: number = 50;

  ngOnInit(): void {
    this.olympicService.getOlympics().subscribe((data: Olympics[]) => {
      this.olympics = data;

      this.numberCountries = this.olympics.length;

      // Remplissage des données pour le graphique en fonction des participations
      this.olympics.forEach((country) => {
        this.pieChartData.labels?.push(country.country);
        const medalsCount = country.participations.reduce(
          (total, participation) => total + participation.medalsCount,
          0
        );
        this.pieChartData.datasets[0].data.push(medalsCount);
      });

      // Enregistrement du plugin après l'initialisation
      this.registerCustomPlugin();
    });
  }

  private registerCustomPlugin() {
    // Enregistrement d'un plugin personnalisé
    const customPlugin = {
      id: 'customLines',
      afterDraw: (chart: {
        ctx: CanvasRenderingContext2D; // Type du contexte
        chartArea: any;
        data: { datasets: any; labels: string[] }; // Définir les labels comme tableau de chaînes
        getDatasetMeta: (arg0: any) => any;
      }) => {
        const ctx = chart.ctx; // Contexte du graphique
        const datasets = chart.data.datasets; // Récupération des datasets

        datasets.forEach(
          (dataset: { data: number[] }, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex); // Récupération des métadonnées du dataset
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
                ); // Obtenir les coordonnées du secteur

                // Récupération des informations nécessaires
                const label = chart.data.labels[index]; // Nom du pays
                const data = dataset.data[index]; // Nombre de médailles
                const labelX = model.x; // Position X du secteur
                const labelY = model.y; // Position Y du secteur

                // Couleurs du pays
                const colors = [
                  'rgba(137, 73, 81, 1)',
                  'rgba(106, 40, 65, 1)',
                  'rgba(166, 193, 227, 1)',
                  'rgba(112, 145, 214, 1)',
                  'rgba(172, 219, 238, 1)',
                  'rgba(134, 107, 145, 1)',
                ];

                // Dessiner la ligne horizontale de 50px depuis l'extérieur du cercle
                ctx.save(); // Sauvegarder l'état actuel du contexte
                ctx.strokeStyle = colors[index]; // Définir la couleur de la ligne
                ctx.lineWidth = 2; // Épaisseur de la ligne
                ctx.font = '16px Arial';
                ctx.beginPath();

                // Calculer l'angle du secteur pour positionner la ligne correctement
                const angle = (model.startAngle + model.endAngle) / 2; // Angle moyen du secteur

                const xOuter = model.x + Math.cos(angle) * model.outerRadius; // Position X au bord du cercle
                const yOuter = model.y + Math.sin(angle) * model.outerRadius; // Position Y au bord du cercle

                // Dessiner la ligne horizontale
                ctx.moveTo(xOuter, yOuter); // Début de la ligne à l'extérieur
                ctx.lineTo(xOuter + this.lineLength, yOuter); // Fin de la ligne horizontale
                ctx.stroke(); // Dessiner la ligne

                // Positionner le texte à gauche ou à droite selon le secteur
                const textX =
                  xOuter + this.lineLength + (angle > Math.PI ? -5 : 5); // Position X de l'étiquette
                const textY = yOuter; // Position Y de l'étiquette

                // Afficher l'étiquette

                ctx.fillText(
                  `${label} `,
                  textX, // Position de l'étiq${data} médaillesuette légèrement décalée
                  textY // Position Y de l'étiquette
                ); // Affichage du texte du label
                ctx.restore(); // Restaurer l'état du contexte
              }
            );
          }
        );
      },
    };

    // Enregistrement du plugin
    Chart.register(customPlugin);
  }
}
