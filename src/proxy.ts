import { IncomingMessage, ServerResponse, ClientRequest, Server } from 'http';
import { http, https, RedirectableRequest } from 'follow-redirects';
import { parse } from 'querystring';
import * as url from 'url';
import { Transform } from 'stream';
import * as type from 'content-type';

const protocolMap = { http, https };
const portMap = { http: 80, https: 443 };

let refererUrl = '';
function onRequest(req: IncomingMessage, res: ServerResponse) {
  const originUrl = url.parse(req.url!);
  const qs = parse(originUrl.query!);
  let targetUrl = qs['target'] as string;
  if (!targetUrl) {
    targetUrl = url.resolve(refererUrl, originUrl.path!);
  }

  const proxy = proxyRequest(targetUrl, res);
  if (proxy) {
    req.pipe(proxy, {
      end: true
    });
  }
}

function proxyRequest(targetUrl: string, res: ServerResponse) {
  const target = url.parse(targetUrl);
  const protocol = target.protocol!.slice(0, -1);
  if (protocol !== 'http' && protocol !== 'https') {
    res.statusCode = 500;
    res.end(`${protocol} is not supported yet.`);
    return;
  }

  const options = {
    hostname: target.hostname,
    port: target.port || portMap[protocol!],
    path: target.path,
    method: 'GET'
  };

  const proxy: RedirectableRequest<ClientRequest, IncomingMessage> = protocolMap[protocol].request(options, (_res: IncomingMessage) => {
    // Copy headers
    const fieldsToRemove = ['x-frame-options', 'content-security-policy'];
    Object.keys(_res.headers).forEach(field => {
      if (!fieldsToRemove.includes(field.toLocaleLowerCase())) {
        res.setHeader(field, _res.headers[field]!);
      }
    });
    const transformed = transformBody(_res, targetUrl);

    transformed.pipe(res, {
      end: true
    });
  });

  return proxy;
}

function transformBody(res: IncomingMessage, targetUrl: string) {
  const rawType = res.headers['content-type'] || '';
  // Do not transform unknown content
  if (!rawType) {
    return res;
  }
  const contentType = type.parse(rawType).type;
  // Do not transform non-text content
  if (contentType.indexOf('text') === -1) {
    return res;
  }

  function replaceUrl(match: string, p1: string, p2: string, offset: number, s: string) {
    let prefixed = p2;
    if (!p2.startsWith('http')) {
      prefixed = url.resolve(targetUrl, p2);
    }
    prefixed = proxyUrl(prefixed);
    return `${p1}${prefixed}`
  }
  let transformer = new Transform({
    transform(chunk, encoding, callback) { callback(); }
  });
  // Replace HTML img src, script src, link href
  if (contentType === 'text/html') {
    transformer = new Transform({
      transform(chunk, encoding, callback) {
        let content = chunk.toString();
        // Replace <img src, <script src
        content = content.replace(/(<(?:img|script)\s+[^>]*src=['"])([^'"]+)/g, replaceUrl);
        // Replace <link href
        content = content.replace(/(<link\s+[^>]*href=['"])([^'"]+)/g, replaceUrl);
        // Remove <link integrity, <script integrity
        content = content.replace(/(<(?:link|script)\s+[^>]*)(integrity=\S+)/g, '$1');
        this.push(content);
        callback();
      }
    });
    // Assume the comming HTML is the next page to show
    refererUrl = targetUrl;
  }
  // Replace CSS url()
  else if (contentType === 'text/css') {
    transformer = new Transform({
      transform(chunk, encoding, callback) {
        let content = chunk.toString();
        // replace url(xxx)
        content = content.replace(/(url\(['"]?)([^'")]+)/g, replaceUrl);
        this.push(content);
        callback();
      }
    });
  }

  return res.pipe(transformer);
}

let server: Server;
let port: number;
export function start() {
  port = 21707 + process.pid % 1024;
  console.log(`Proxy server is starting at ${port} .`);
  server = http.createServer(onRequest).listen(port);
}

export function stop() {
  console.log(`Proxy server at ${port} stopped.`);
  server.close();
}

export function proxyUrl(target?: string) {
  return `http://localhost:${port}/?target=${target ? encodeURIComponent(target) : ''}`;
}
