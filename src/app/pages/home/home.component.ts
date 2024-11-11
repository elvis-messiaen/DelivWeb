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
  public numberofJOs: number | null = null;
  public numberCountries: number | null = null;
  public chart: Chart | undefined;
  public hoveredCountryId!: number | undefined;
  public pieChartType: 'pie' = 'pie';
  public olympics: Olympics[] | undefined;
  private lineLength: number = 50;
  public numberofEntry: number = 0;

  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        label: 'Médailles remportées',
        data: [],
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

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
        labels: {
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const index = tooltipItem.dataIndex;
            const label = tooltipItem.label;
            const data = this.pieChartData.datasets[0].data[index];

            if (this.olympics && index >= 0 && index < this.olympics.length) {
              this.hoveredCountryId = this.olympics[index].id;
              this.numberofEntry = this.olympics[index].participations.length;
            } else {
              this.hoveredCountryId = undefined;
              this.numberofEntry = 0;
            }

            this.numberofJOs = data;
            this.cdr.markForCheck();
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
        bottom: 20,
      },
    },
    aspectRatio: 0.8,
  };

  constructor(
    private olympicService: OlympicService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.olympicService.getOlympics().subscribe(
      (data: Olympics[]) => {
        this.olympics = data;
        this.numberCountries = this.olympics.length;
        this.pieChartData.labels = [];
        this.pieChartData.datasets[0].data = [];

        this.olympics.forEach((country) => {
          this.pieChartData.labels?.push(country.country);
          const medalsCount = country.participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          );
          this.pieChartData.datasets[0].data.push(medalsCount);
        });

        this.registerCustomPlugin();
        this.cdr.detectChanges();

        setTimeout(() => {
          const chartElement = document.querySelector('canvas');
          if (chartElement) {
            const chartInstance = Chart.getChart(chartElement);
            if (chartInstance) {
              chartInstance.update();
            }
          }
        }, 0);
      },
      (error) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );
  }

  onChartClick(): void {
    if (this.hoveredCountryId) {
      this.router.navigate(['/details', this.hoveredCountryId]);
    } else {
      console.error('Aucun ID de pays disponible pour la navigation.');
    }
  }

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

        datasets.forEach(
          (dataset: { data: number[] }, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex);
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

                const label = chart.data.labels[index];
                const labelX = model.x;
                const labelY = model.y;

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

                const angle = (model.startAngle + model.endAngle) / 2;
                const xOuter = model.x + Math.cos(angle) * model.outerRadius;
                const yOuter = model.y + Math.sin(angle) * model.outerRadius;
                const xLineEnd =
                  model.x + Math.cos(angle) * (model.outerRadius + 150);
                const yLineEnd = yOuter;

                ctx.beginPath();
                ctx.moveTo(xOuter, yOuter);
                ctx.lineTo(xLineEnd, yLineEnd);
                ctx.stroke();

                const textX = xLineEnd + (angle > Math.PI ? -10 : 10);
                const textY = yLineEnd;

                ctx.textAlign = angle > Math.PI ? 'right' : 'left';

                ctx.fillText(`${label}`, textX, textY);
                ctx.restore();
              }
            );
          }
        );
      },
    };

    Chart.register(customPlugin);
  }
}
