import { NgModule } from '@angular/core';
import { Coadm01Coadm1aComponent } from './coadm01-coadm1a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Coadm01ComponentsMap, Coadm01SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Coadm01Coadm1aComponent]
})
export class Coadm01Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Coadm01ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Coadm01SubComponentsMap);
  }
}

