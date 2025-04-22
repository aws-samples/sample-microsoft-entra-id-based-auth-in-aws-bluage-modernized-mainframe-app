import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
export class LocalStorageService {

    constructor() {
    }

    public getItem(name: string){
        var jsonVal = localStorage.getItem(name);
        if(jsonVal){
            return JSON.parse(jsonVal);
        } 
        return null;
    }

    public setItem(name: string, value: any){
        localStorage.setItem(name, JSON.stringify(value));
    }
}