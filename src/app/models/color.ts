import { ScaleType } from '@swimlane/ngx-charts';

export interface Color {
  name?: string;
  selectable?: boolean;
  group?: ScaleType;
  domain: string[];
}
