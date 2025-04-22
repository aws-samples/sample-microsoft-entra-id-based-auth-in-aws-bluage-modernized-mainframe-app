import { NgModule } from '@angular/core';
import { Comen01Comen1aComponent } from './comen01-comen1a.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { Comen01ComponentsMap, Comen01SubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [Comen01Comen1aComponent]
})
export class Comen01Module {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(Comen01ComponentsMap);
    mapRegistryService.registerModuleSubComponents(Comen01SubComponentsMap);
  }
}

