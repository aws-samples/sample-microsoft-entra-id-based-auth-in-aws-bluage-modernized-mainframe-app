import { NgModule } from '@angular/core';
import { Cotrn00Cotrn0aComponent } from './cotrn00-cotrn0a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cotrn00ComponentsMap, Cotrn00SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cotrn00Cotrn0aComponent]
})
export class Cotrn00Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cotrn00ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cotrn00SubComponentsMap);
  }
}

