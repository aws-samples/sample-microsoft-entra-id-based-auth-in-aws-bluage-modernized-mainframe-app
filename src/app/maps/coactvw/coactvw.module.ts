import { NgModule } from '@angular/core';
import { CoactvwCactvwaComponent } from './coactvw-cactvwa.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { CoactvwComponentsMap, CoactvwSubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [CoactvwCactvwaComponent]
})
export class CoactvwModule {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(CoactvwComponentsMap);
    mapRegistryService.registerModuleSubComponents(CoactvwSubComponentsMap);
  }
}

