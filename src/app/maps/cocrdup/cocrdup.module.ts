import { NgModule } from '@angular/core';
import { CocrdupCcrdupaComponent } from './cocrdup-ccrdupa.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { CocrdupComponentsMap, CocrdupSubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [CocrdupCcrdupaComponent]
})
export class CocrdupModule {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(CocrdupComponentsMap);
    mapRegistryService.registerModuleSubComponents(CocrdupSubComponentsMap);
  }
}

