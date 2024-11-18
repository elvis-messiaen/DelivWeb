import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '../../services/olympic.service';
import { Olympics } from '../../models/olympics';
import { ChartData, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [CommonModule, RouterModule, BaseChartDirective],
})
export class DetailsComponent implements OnInit, OnDestroy {
  public olympicDetails: Olympics | null = null;
  public numberofEntry: number | null = null;
  public numberMedals: number | null = null;
  public TotalNumberAthletes: number | null = null;
  public NameContry: string | null = null;
  public isLoading = true;
  private destroy$ = new Subject<void>();

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Nombre de médailles',
        data: [],
        fill: false,
        borderColor: 'blue',
        tension: 0.1,
      },
    ],
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Dates',
          font: {
            size: 30,
            family: 'Arial',
          },
          color: 'gray',
        },
        ticks: {},
      },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private olympicService: OlympicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOlympicDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadOlympicDetails(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idCountry = params.get('id');
          if (!idCountry) {
            this.router.navigate(['/notfound']);
            return of(null);
          }
          return this.olympicService.getOlympicById(idCountry).pipe(
            catchError(() => {
              this.router.navigate(['/notfound']);
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        if (data) {
          this.olympicDetails = data;
          this.NameContry = this.olympicDetails.country;
          this.numberofEntry = this.olympicDetails.participations.length;
          this.numberMedals = this.olympicDetails.participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          );
          this.TotalNumberAthletes = this.olympicDetails.participations.reduce(
            (total, participation) => total + participation.athleteCount,
            0
          );
          this.setupChartData();
          this.isLoading = false;
        } else {
          this.router.navigate(['/notfound']);
        }
      });
  }

  setupChartData(): void {
    if (this.olympicDetails) {
      if (
        this.olympicDetails.participations &&
        this.olympicDetails.participations.length > 0
      ) {
        this.chartData.labels = this.olympicDetails.participations.map(
          (participation) => participation.year.toString()
        );

        this.chartData.datasets[0].data =
          this.olympicDetails.participations.map(
            (participation) => participation.medalsCount
          );

        this.chartData = { ...this.chartData };
      } else {
        console.error(
          'Aucune participation disponible pour les détails olympiques.'
        );
      }
    } else {
      console.error('Pas de détails olympiques disponibles.');
    }
  }

  goBack(): void {
    window.history.back();
  }
}
