import { NgModule } from '@angular/core';
import { Cousr00Cousr0aComponent } from './cousr00-cousr0a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cousr00ComponentsMap, Cousr00SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cousr00Cousr0aComponent]
})
export class Cousr00Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cousr00ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cousr00SubComponentsMap);
  }
}

