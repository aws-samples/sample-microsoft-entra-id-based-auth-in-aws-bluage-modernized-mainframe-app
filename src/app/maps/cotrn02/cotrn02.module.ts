import { NgModule } from '@angular/core';
import { Cotrn02Cotrn2aComponent } from './cotrn02-cotrn2a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cotrn02ComponentsMap, Cotrn02SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cotrn02Cotrn2aComponent]
})
export class Cotrn02Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cotrn02ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cotrn02SubComponentsMap);
  }
}

