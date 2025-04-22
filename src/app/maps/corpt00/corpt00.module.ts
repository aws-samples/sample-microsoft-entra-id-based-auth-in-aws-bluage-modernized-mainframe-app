import { NgModule } from '@angular/core';
import { Corpt00Corpt0aComponent } from './corpt00-corpt0a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Corpt00ComponentsMap, Corpt00SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Corpt00Corpt0aComponent]
})
export class Corpt00Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Corpt00ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Corpt00SubComponentsMap);
  }
}

