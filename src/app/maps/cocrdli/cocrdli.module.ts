import { NgModule } from '@angular/core';
import { CocrdliCcrdliaComponent } from './cocrdli-ccrdlia.component';
import { SharedModule } from '../../shared.module';
import { MapRegistryService } from '../../services/map-registry.service';
import { CocrdliComponentsMap, CocrdliSubComponentsMap } from '.';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [CocrdliCcrdliaComponent]
})
export class CocrdliModule {
  constructor(mapRegistryService: MapRegistryService) {
    mapRegistryService.registerModuleComponents(CocrdliComponentsMap);
    mapRegistryService.registerModuleSubComponents(CocrdliSubComponentsMap);
  }
}

