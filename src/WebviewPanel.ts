import * as path from 'path';
import * as vscode from 'vscode';
import homePage from './index.html';
import { proxyUrl } from './proxy';
import storage from './storage';

/**
 * Manages webview panel
 */
export default class WebviewPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: WebviewPanel | undefined;

  public static readonly viewType = 'browser.webview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (WebviewPanel.currentPanel) {
      WebviewPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      WebviewPanel.viewType,
      'Browser',
      vscode.ViewColumn.Two,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // Enable retainContextWhenHidden by default
        retainContextWhenHidden: true,
        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, 'media/'))
        ]
      }
    );

    WebviewPanel.currentPanel = new WebviewPanel(panel, extensionPath);
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    WebviewPanel.currentPanel = new WebviewPanel(panel, extensionPath);
  }

  public static clearHistory() {
    storage.set('historyStack', []);
  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    // Set the webview's initial html content
    this.open(panel.webview);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    // this._panel.onDidChangeViewState(
    //   e => {
    //     if (this._panel.visible) {
    //       this._update();
    //     }
    //   },
    //   null,
    //   this._disposables
    // );

    // Handle messages from the webview
    const webview = panel.webview;
    webview.onDidReceiveMessage(
      message => {
        console.log(message);
        const params = message.params || [];
        switch (message.action) {
          case 'error':
            vscode.window.showErrorMessage.apply(vscode.window, params);
            break;
          case 'log':
            console.log.apply(console, params);
            break;
          case 'storage.get':
            const value = storage.get.apply(storage, params);
            webview.postMessage({
              action: '_',
              id: message.id,
              result: value
            });
            break;
          case 'storage.set':
            storage.set.apply(storage, params);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public close() {
    this._panel.dispose();
  }

  public clearHistory() {
    const webview = this._panel.webview;
    webview.postMessage({
      action: 'clearHistory'
    });
  }

  public dispose() {
    WebviewPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private open(webview: vscode.Webview) {
    this._panel.title = 'Browser';
    this._panel.webview.html = this.getHomePage(webview);
  }

  private getHomePage(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const resourceRoot =
      webview
        .asWebviewUri(vscode.Uri.file(path.join(this._extensionPath, 'media')))
        .toString() + '/';

    return homePage(resourceRoot, proxyUrl());
  }
}
