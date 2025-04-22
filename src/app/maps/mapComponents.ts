import { UtilityComponentsMap, UtilitySubComponentsMap } from "./utility/";

export const mapSubComponents = {
    ...UtilitySubComponentsMap
};

export const mapComponents = {
    ...UtilityComponentsMap
};

// Use this map to relate component with a module (for lazy loading)
export const componentModuleMap: {[component: string] : string} = {
}