import { NgModule } from '@angular/core';
import { Cousr02Cousr2aComponent } from './cousr02-cousr2a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cousr02ComponentsMap, Cousr02SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cousr02Cousr2aComponent]
})
export class Cousr02Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cousr02ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cousr02SubComponentsMap);
  }
}

