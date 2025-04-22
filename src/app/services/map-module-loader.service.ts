import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MapModuleLoaderService {

  private moduleLoadPromiseMap: { [moduleName: string]: Promise<boolean> | boolean } = {}

  /**
   * Registers the module as in progress and wraps the promise
   *
   * @param moduleName name of the module
   * @param loadModulePromise the promise of the process loading the module
   * @returns wrapped promise
   */
  registerModuleLoad(moduleName: string, loadModulePromise: Promise<boolean>): Promise<boolean> {
    let result: Promise<boolean> = loadModulePromise.then((loaded: boolean) => {
      this.moduleLoadPromiseMap[moduleName] = loaded;
      return loaded;
    });
    this.moduleLoadPromiseMap[moduleName] = result;
    return result;
  }

  /**
   * Check if the module load was initiated
   *
   * @param moduleName name of the module
   *
   * @returns true if load is progress
   */
  isModuleLoadInitiated(moduleName: string): boolean {
    return moduleName in this.moduleLoadPromiseMap;
  }

  isModuleLoadInProgress(moduleName: string): boolean {
      return moduleName in this.moduleLoadPromiseMap && this.moduleLoadPromiseMap[moduleName] instanceof Promise;
  }

  /**
   * Fetch the wrapped promise for the module load
   * Check for isModuleLoadInitiated before calling this
   *
   * @param moduleName name of the module
   * @returns wrapped promise
   */
  fetchModuleLoad(moduleName: string): Promise<boolean> {
    return Promise.resolve(this.moduleLoadPromiseMap[moduleName]);
  }

}
