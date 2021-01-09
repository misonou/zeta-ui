/**
  * Prompts a modal alert box.
  * @param message Message to be shown in the alert box.
  * @param action Label of the confirm button.
  * @param title Title of the alert box.
  * @param data Data object where values will be binded to the template defined in the message parameter.
  * @param callback Operation to be executed after user has clicked the confirmation button.
  * @returns A promise object which will be resolved when user has closed the alert box.
  */
export function alert(message: string): Promise<true>;
export function alert(message: string, action: string): Promise<true>;
export function alert(message: string, action: string, title: string): Promise<true>;
export function alert<T>(message: string, data: object, callback: (response: true) => T | Promise<T>): Promise<T>;
export function alert<T>(message: string, action: string, data: object, callback: (response: true) => T | Promise<T>): Promise<T>;
export function alert<T>(message: string, action: string, title: string, data: object, callback: (response: true) => T | Promise<T>): Promise<T>;

/**
 * Prompts a modal confirm box.
 * @param message Message to be shown in the confirm box.
 * @param action Label of the confirm button.
 * @param title Title of the alert box.
 * @param data Data object where values will be binded to the template defined in the message parameter.
 * @param callback Operation to be executed after user has clicked the confirmation button.
 * @returns A promise object which will be resolved when user has clicked OK; or rejected when use has closed the confirm box.
 */
export function confirm(message: string): Promise<boolean>;
export function confirm(message: string, action: string): Promise<boolean>;
export function confirm(message: string, action: string, title: string): Promise<boolean>;
export function confirm<T>(message: string, data: object, callback: (response: boolean) => T | Promise<T>): Promise<T>;
export function confirm<T>(message: string, action: string, data: object, callback: (response: boolean) => T | Promise<T>): Promise<T>;
export function confirm<T>(message: string, action: string, title: string, data: object, callback: (response: boolean) => T | Promise<T>): Promise<T>;

/**
 * Prompts a modal prompt box.
 * @param message Message to be shown in the prompt box.
 * @param value An optional initial value.
 * @param action Label of the confirm button.
 * @param title Title of the alert box.
 * @param description Description to be displayed above the input field.
 * @param data Data object where values will be binded to the template defined in the message parameter.
 * @param callback Operation to be executed after user has clicked the confirmation button.
 * @returns A promise object which will be resolved when user has clicked OK; or rejected when use has closed the confirm box.
 */
export function prompt(message: string): Promise<string>;
export function prompt(message: string, value: string): Promise<string>;
export function prompt(message: string, value: string, action: string): Promise<string>;
export function prompt(message: string, value: string, action: string, title: string): Promise<string>;
export function prompt(message: string, value: string, action: string, title: string, description: string): Promise<string>;
export function prompt<T>(message: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
export function prompt<T>(message: string, value: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
export function prompt<T>(message: string, value: string, action: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
export function prompt<T>(message: string, value: string, action: string, title: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;
export function prompt<T>(message: string, value: string, action: string, title: string, description: string, data: object, callback: (response: string) => T | Promise<T>): Promise<T>;

/**
 * Creates a notification.
 * @param message Message to be shown.
 * @param [kind] CSS class to be applied. Built-in supported values includes: "success", "warn" and "error".
 * @param [timeout] Number of milliseconds before the norification is dismissed. If the value is 0 or unspecified, the notification will not be automatically dismissed.
 * @param [within] A DOM element in which the notification will be shown.
 * @param [data] Data to be binded to the message.
 */
export function notify(message: string, kind?: string, timeout?: number, within?: Node, data?: object): void;
