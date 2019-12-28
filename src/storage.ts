import { ExtensionContext } from 'vscode';

class Storage {
  context: ExtensionContext | null;

  public constructor() {
    this.context = null;
  }

  bindContext(context: ExtensionContext) {
    this.context = context;
  }

  set(key: string, value: any) {
    this.context?.globalState.update(key, value);
  }

  get(key: string) {
    return this.context?.globalState.get(key);
  }
}

export default new Storage();
