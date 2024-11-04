import { Participations } from './participations';

export interface Olympics {
  id: number;
  country: string;
  participations: Participations[];
}
