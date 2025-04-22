import { Injectable } from '@angular/core';
import {componentModuleMap, mapComponents, mapSubComponents} from '../maps/mapComponents';

@Injectable({
    providedIn: 'root'
})
export class MapRegistryService {

  /**
   * Registers the components in the map provided
   *
   * @param componentsMap Object whose keys are componentId and values are componentType
   */
  public registerModuleComponents(componentsMap: any): void {
    Object.assign(mapComponents, componentsMap);
  }

  /**
   * Registers the subcomponents in the map provided
   *
   * @param subcomponentsMap Object whose keys are componentId and values are componentType
   */
  public registerModuleSubComponents(subcomponentsMap: any): void {
    Object.assign(mapSubComponents, subcomponentsMap);
  }

  public fetchComponent(componentName: string):any {
    return mapComponents[componentName];
  }

  public fetchSubComponent(subComponentName: string): any {
    return mapSubComponents[subComponentName];
  }

  public getModuleNameByComponent(mapName: string): string {
    return componentModuleMap[mapName] ?? mapName.split('-')[0];
  }
}
