import { Participations } from './participations';

export interface Olympics {
  id: string;
  country: string;
  participations: Participations[];
}
