export class ElementUtils {
  static findClassStartingWith(element: Element, query: string): string {
    let result: string;
    element.classList.forEach((elementClass: string) => {
      if (elementClass.startsWith(query)) {
        result = elementClass;
      }
    });
    return ElementUtils.sanitizeClass(result);
  }

  static hasClass(element: Element, query: string): boolean {
    return element.classList.contains(query);
  }

  static sanitizeClass(value: string):string {
    return value.replace(/[^\w\-]/g, '')
  }
}
