import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts'; // Assurez-vous que ces imports sont corrects
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideZoneChangeDetection(),
    provideHttpClient(withFetch()),
  ],
};
