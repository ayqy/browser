import * as vscode from 'vscode';
import WebviewPanel from './WebviewPanel';
import { start, stop } from './proxy';
import stroage from './storage';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('browser.open', () => {
      WebviewPanel.createOrShow(context.extensionPath);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('browser.close', () => {
      if (WebviewPanel.currentPanel) {
        WebviewPanel.currentPanel.close();
      }
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(WebviewPanel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        WebviewPanel.revive(webviewPanel, context.extensionPath);
      }
    });
  }

  // Bind global storage context
  stroage.bindContext(context);

  // Start local proxy server
  start();
}

// this method is called when your extension is deactivated
export function deactivate() {
  stop();
}
