# Integrating the Microsoft and BluAge Authentication Libraries

The following list of files in the repo have the changes required to integrate MSAL library into the modern application front-end code. You can use these as an example of how to integrate MSAL and BluAge Auth libraries for your application.
 

- app.module.ts
- app-routing.module.ts
- app.component.ts
- environment.ts
- term.component.ts
- term.component.html
- package.json
- index.html

# Developing Locally

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.0. We recommend that you deploy your own version of the application and do not copy this code. Use the examples listed above to make changes to your app.

## Development server

Run `ng serve --ssl` for a dev server. Navigate to `https://localhost:4200/`. The app will automatically reload if you change any of the source files.
 For dev environment, update target url in proxy.conf.json.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
For production, update gapwalk-application url in config.json.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](https://www.protractortest.org/#/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
