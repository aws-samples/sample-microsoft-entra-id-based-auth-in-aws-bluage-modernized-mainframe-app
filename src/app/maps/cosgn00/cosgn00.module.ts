import { NgModule } from '@angular/core';
import { Cosgn00Cosgn0aComponent } from './cosgn00-cosgn0a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cosgn00ComponentsMap, Cosgn00SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cosgn00Cosgn0aComponent]
})
export class Cosgn00Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cosgn00ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cosgn00SubComponentsMap);
  }
}

