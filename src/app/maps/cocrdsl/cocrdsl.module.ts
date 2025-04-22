import { NgModule } from '@angular/core';
import { CocrdslCcrdslaComponent } from './cocrdsl-ccrdsla.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { CocrdslComponentsMap, CocrdslSubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [CocrdslCcrdslaComponent]
})
export class CocrdslModule {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(CocrdslComponentsMap);
    mapRegistryService.registerModuleSubComponents(CocrdslSubComponentsMap);
  }
}

