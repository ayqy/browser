const $ = document.querySelector.bind(document);
const vscode = acquireVsCodeApi();

let autocomplete = null;
const historyStack = {
  // Has been restored from storage
  isFullyRestored: false,
  stack: [],
  push(url = '') {
    const index = this.stack.indexOf(url);
    if (index !== -1) {
      this.stack.splice(index, 1);
    }
    this.stack.unshift(url);
    // Update state
    vscode.setState({ historyStack: this.stack });
    if (this.isFullyRestored) {
      executeCommand('storage.set', 'historyStack', this.stack);
    }
  },
  pop() {
    const top = this.stack.shift();
    // Update state
    vscode.setState({ historyStack: this.stack });
    executeCommand('storage.set', 'historyStack', this.stack);
    return top;
  },
  peek() {
    return this.stack[0];
  },
  restore(stack = []) {
    if (Array.isArray(stack) && stack.length) {
      if (!this.stack.length) {
        this.stack = stack;
      }
      else {
        // Merge
        stack.forEach(url => {
          if (this.stack.indexOf(url) === -1) {
            this.stack.push(url);
          }
        });
      }
      if (autocomplete) {
        autocomplete.list = this.stack;
      }
    }
  }
};

const callbacks = [];
/**
 * Send messages to extension
 * @param {string} command Custom commands
 * @param  {...any} params Other parameters, which can be serialized
 */
function executeCommand(command, ...params) {
  const callback = params[params.length - 1];
  if (typeof callback === 'function') {
    callbacks.push(params.pop());
  }
  const id = callbacks.length - 1;

  // Send: webview -> extension
  console.log([command, params]);
  vscode.postMessage({
    action: command,
    params,
    id
  });
}

/**
 * Receive messages from extension
 */
function onMessage() {
  // Receive: extension -> webview
  window.addEventListener('message', event => {
    console.log(event);
    const message = event.data;
    switch (message.action) {
      case 'some action':
        currentCount = Math.ceil(currentCount * 0.5);
        counter.textContent = currentCount;
        break;
      default:
        const id = message.id;
        if (typeof id === 'number' && callbacks[id]) {
          callbacks[id].call(null, message.result);
        }
        break;
    }
  });
}

const alert = executeCommand.bind(null, 'error');
const log = executeCommand.bind(null, 'log');
// Debug only
// window.onerror = function(error) {
//   alert(`${error.message || error.toString()}${error.stack ? error.stack : ''}`);
// };


function init() {
  addListeners();
  onMessage();
  restoreHistory();
  loadUrl();
  initAutoComplete();
}

/**
 * Handle DOM events
 */
function addListeners() {
  $('#search').addEventListener('submit', (e) => {
    const inputUrl = $('#address').value || '';
    if (inputUrl.trim().length) {
      loadUrl(inputUrl);
    }
    e.preventDefault();
    return false;
  });
  $('#backward').addEventListener('click', () => {
    window.history.back();
  });
  $('#forward').addEventListener('click', () => {
    window.history.forward();
  });
  $('#refresh').addEventListener('click', () => {
    loadUrl();
  });
}

/**
 * Load input URL inside iframe
 * @param {string} targetUrl the target URL
 */
function loadUrl(targetUrl = '') {
  targetUrl = targetUrl.trim() || historyStack.peek() || '';
  const $iframe = $('#iframe');
  if (targetUrl) {
    $iframe.src = proxy(targetUrl);
    console.log(`Load ${targetUrl}`);
    // Fill address when init and refresh
    if (!arguments.length) {
      $('#address').value = targetUrl;
    }
    historyStack.push(targetUrl);
  }
}

/**
 * Wrap url with proxy prefix
 * @param {string} url HTTP/HTTPS URL
 */
function proxy(url) {
  if (window.proxyUrl) {
    return `${proxyUrl}${encodeURIComponent(url)}`;
  }
  return url;
}

function restoreHistory() {
  const state = vscode.getState();
  console.log(state);
  historyStack.restore(state && state.historyStack);
  executeCommand('storage.get', 'historyStack', (stack) => {
    historyStack.isFullyRestored = true;
    if (stack && stack.length) {
      const blank = !historyStack.stack.length;
      historyStack.restore(stack);
      console.log('historyStack', stack);
      if (blank) {
        loadUrl();
      }
    }
  });
}

function initAutoComplete() {
  const $address = $('#address');
  autocomplete = new Awesomplete($address, {
    list: historyStack.stack
  });
  $address.addEventListener('awesomplete-selectcomplete', ({ text, origin }) => {
    loadUrl(text);
  });
}

init();
