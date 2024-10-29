import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // pour le routing
    provideRouter(routes),
    // Ajout de la configuration de ng2-charts
    provideCharts(withDefaultRegisterables()),
    // Si vous utilisez Zone.js pour le changement de détection
    provideZoneChangeDetection(),
  ],
};
