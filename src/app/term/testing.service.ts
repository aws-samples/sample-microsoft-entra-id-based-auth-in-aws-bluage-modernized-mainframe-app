import { Injectable } from '@angular/core';
import { BackendMessage, AddComponents, Map } from './message';

@Injectable()
export class TestingService {

    public buildTestMessage(args:string): BackendMessage {

        // For now consider that each space-separated argument is the name of a component to add
        const components = args.split(' ');
        const maps = components.map(this.buildComponentMap);

        // Build a corresponding logical message
        let addComponents = new AddComponents();
        addComponents.command = 'addComponents';
        addComponents.maps = maps;

        // Craft backend-like message
        let result = new BackendMessage();
        result.serverDescription = 'Test message generated for component(s) ' + args;
        result.messages = [ addComponents ];
        return result;
    }

    private buildComponentMap(componentId:string): Map {
        let result = new Map();
        result.component = componentId;
        // TODO Get component fields reflexively? Would help in setting them with interesting values
        result.fields = []; // Avoid an "undefined" error in decodeFields
        return result;
    }
}