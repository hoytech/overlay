import canonicalJsonStringify from 'json-stable-stringify';

const initialReconnectTimeout = 500;
const reconnectTimeCeiling = 8000;

export default class WSClient {
  constructor(opts) {
    this.opts = opts;

    this.nextId = 1;
    this.cbs = {};
    this.timeoutHandles = {};
    this.pendingMessagesToSend = [];
    this.reconnectTimeout = initialReconnectTimeout;

    this.heartBeatInterval = setInterval(() => {
      if (this.ws === undefined || this.ws.readyState !== 1) return;
      this.send({"ping":1}, () => {});
    }, (this.opts.pingFreqMilliseconds || 55000));
  }

  connect() {
    if (this.ws) { this.ws.close(); }
    this.ws = new this.opts.WebSocket(this.opts.endpoint);

    this.ws.onopen = () => {
      if (this.opts.onConnect) this.opts.onConnect(this);

      this.reconnectTimeout = initialReconnectTimeout;

      for (let msg of this.pendingMessagesToSend) {
        this.ws.send(msg);
      }

      this.pendingMessagesToSend = [];
    };

    this.ws.onmessage = (msg) => {
      let body = JSON.parse(msg.data);

      let cb = this.cbs[body.id];
      if (!cb) return; // probably already unsubscribed

      cb(null, body);
    };

    this.ws.onclose = () => {
      if (this.shuttingDown) return;
      this.ws = undefined;

      if (this.timeoutWatcher) {
        clearTimeout(this.timeoutWatcher);
      }
      this.timeoutWatcher = setTimeout(() => this.connect(), this.reconnectTimeout);

      this.reconnectTimeout *= 2;
      if (this.reconnectTimeout > reconnectTimeCeiling) this.reconnectTimeout = reconnectTimeCeiling;

      if (this.opts.onDisconnect) this.opts.onDisconnect(this);
    };

    this.ws.onerror = (e) => {
      let ws = this.ws;
      delete this.ws;
      ws.close();
    };
  }


  send(body, cb, idOverride, timeout) {
    let id = idOverride || this.nextId++;
    body.id = id;

    let msg = canonicalJsonStringify(body);

    if (cb) {
      this.cbs[id] = cb;
      if (timeout) {
        this.timeoutHandles[id] = setTimeout(() => {
          this.clearId(id);
          cb(`timeout after ${timeout}ms`, null); 
        }, timeout);
      }
    }

    if (this.ws === undefined || this.ws.readyState !== 1) {
      this.pendingMessagesToSend.push(msg);
    } else {
      this.ws.send(msg);
    }

    return id;
  }

  async sendAsync(body, timeout) {
    if (!timeout) timeout = 5000;

    let response = await new Promise((resolve, reject) => {
      this.send(body, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }, undefined, timeout);
    });

    return response;
  }



  clearId(id) {
    delete this.cbs[id];
    if (this.timeoutHandles[id]) {
      clearTimeout(this.timeoutHandles[id]);
      delete this.timeoutHandles[id];
    }
  }


  shutdown() {
    this.shuttingDown = true;
    if (this.ws) this.ws.close();
    this.ws = undefined;
    if (this.heartBeatInterval) clearInterval(this.heartBeatInterval);
    this.heartBeatInterval = undefined;
  }
}
