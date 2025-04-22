import { NgModule } from '@angular/core';
import { CoactupCactupaComponent } from './coactup-cactupa.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { CoactupComponentsMap, CoactupSubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [CoactupCactupaComponent]
})
export class CoactupModule {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(CoactupComponentsMap);
    mapRegistryService.registerModuleSubComponents(CoactupSubComponentsMap);
  }
}

