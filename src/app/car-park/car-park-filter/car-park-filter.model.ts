import { Region } from './region.enum';

export class CarParkFilterModel {

  code: string;
  region: Region;
  area: string;

  constructor() {
    this.code = '';
  }
}
