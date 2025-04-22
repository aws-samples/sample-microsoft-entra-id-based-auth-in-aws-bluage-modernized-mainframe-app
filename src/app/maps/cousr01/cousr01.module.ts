import { NgModule } from '@angular/core';
import { Cousr01Cousr1aComponent } from './cousr01-cousr1a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cousr01ComponentsMap, Cousr01SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cousr01Cousr1aComponent]
})
export class Cousr01Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cousr01ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cousr01SubComponentsMap);
  }
}

