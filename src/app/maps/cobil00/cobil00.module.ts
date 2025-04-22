import { NgModule } from '@angular/core';
import { Cobil00Cobil0aComponent } from './cobil00-cobil0a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cobil00ComponentsMap, Cobil00SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cobil00Cobil0aComponent]
})
export class Cobil00Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cobil00ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cobil00SubComponentsMap);
  }
}

