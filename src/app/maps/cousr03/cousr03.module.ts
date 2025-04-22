import { NgModule } from '@angular/core';
import { Cousr03Cousr3aComponent } from './cousr03-cousr3a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cousr03ComponentsMap, Cousr03SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cousr03Cousr3aComponent]
})
export class Cousr03Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cousr03ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cousr03SubComponentsMap);
  }
}

