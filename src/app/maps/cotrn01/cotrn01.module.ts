import { NgModule } from '@angular/core';
import { Cotrn01Cotrn1aComponent } from './cotrn01-cotrn1a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Cotrn01ComponentsMap, Cotrn01SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Cotrn01Cotrn1aComponent]
})
export class Cotrn01Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Cotrn01ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Cotrn01SubComponentsMap);
  }
}

