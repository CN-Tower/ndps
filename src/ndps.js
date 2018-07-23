const fs = require('fs');
const fn = require('funclib');
const http = require('http');
const httpProxy = require('http-proxy');

let proxies, proxyIdx, proxyStr, proxyServer, httpServer, proxyErrFlag
  , port, proxyConfPath, proxiesAnchor, proxyIdxAnchor, beforeProxyChange;

let isSysOnInit = true;
let isSysAvailable = true;
let sockets = [];

module['exports'] = opt => {
  getNdpsConfig(opt);
  getProxyConfig();
  initProxyServer();
  watchProxyConfigFile();
}

function getNdpsConfig(opt) {
  const getOrRaise = (path, errMsg) => {
    if (fn.get(opt, path)) {
      return fn.get(opt, path);
    } else {
      throw new Error(errMsg);
    }
  }
  port = getOrRaise('/ndpsPort', 'NDPS port error!');
  proxyConfPath = getOrRaise('/proxyConfPath', 'Proxy Conf path error!');
  proxiesAnchor = getOrRaise('/proxiesAnchor', 'Proxies Anchor error!');
  proxyIdxAnchor = getOrRaise('/proxyIdxAnchor', 'proxy Index Anchor error!');
  beforeProxyChange = fn.get(opt, '/beforeProxyChange', 'fun');
}

function getProxyConfig() {
  if (!isSysOnInit) {
    fn.log('Checking changes...', { title: 'Msg From NDPS', color: 'cyan' });
  }
  proxyErrFlag = false;
  isSysAvailable = false;
  const proxyData = fn.rd(proxyConfPath).replace(/\s*/mg, '');
  try {
    eval(`proxies = ${proxyData.split(proxiesAnchor)[1]}`);
  } catch (e) {
    const errHint = 'Proxy Config Error, please make sure the proxy config correct!';
    if (isSysOnInit) {
      throw new Error(errHint);
    } else {
      proxyErrFlag = true;
      isSysAvailable = true;
      fn.log(errHint, { title: 'Msg From NDPS', color: 'red' });
    }
  }
  proxyIdx = parseInt(proxyData.split(proxyIdxAnchor)[1].substr(0, 3));
}

function initProxyServer() {
  if (proxyErrFlag) return;
  if (!proxies.hasOwnProperty(proxyIdx)) {
    const errHint = 'Proxy Index error, please select again!';
    if (isSysOnInit) {
      throw new Error(errHint);
    } else {
      isSysAvailable = true;
      fn.log(errHint, { title: 'Msg From NDPS', color: 'red' });
    }
  }
  else if (proxies[proxyIdx] === proxyStr) {
    isSysAvailable = true;
    fn.log('No changes were detected!', { title: 'Msg From NDPS', color: 'yellow' });
  }
  else {
    proxyStr = proxies[proxyIdx];
    if (beforeProxyChange) {
      const ndpsInfo = {
        isInit: isSysOnInit, proxyIdx: proxyIdx, proxyTarget: proxyStr
      };
      if (beforeProxyChange.length === 2) {
        beforeProxyChange(ndpsInfo, () => startProxyServer());
      } else {
        beforeProxyChange(ndpsInfo);
        startProxyServer();
      }
    } else {
      startProxyServer();
    }
  }
}

function startProxyServer() {
  httpServer ? reCreateProxyServer() : createProxyServer();
}

function createProxyServer() {
  if (!isSysOnInit) {
    fn.progress.start({ title: 'Creating new Proxy Server', width: 33 });
  }
  sockets = [];
  proxyServer = httpProxy.createProxyServer({ target: proxyStr });
  proxyServer.on('error', function () {
    isSysAvailable = true;
    fn.log('Proxy Server error!', { title: 'Msg From NDPS', color: 'red' });
  });
  httpServer = http.createServer(function (request, response) {
    proxyServer.web(request, response);
  });
  httpServer.on("connection", function (socket) {
    sockets.push(socket);
    socket.once("close", function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
  });
  httpServer.listen(port, function () {
    if (isSysOnInit) {
      isSysOnInit = false;
      isSysAvailable = true;
      fn.log(`The NDPS(Node-Dynamic-Proxy-Server) is started!\nThe http-proxy target is: ${proxyStr}`, {
        title: 'Msg From NDPS', color: 'cyan'
      });
    } else {
      fn.progress.stop(() => {
        isSysAvailable = true;
        fn.log(`The new proxy target is: ${proxyStr}`, {
          title: 'Msg From NDPS', color: 'cyan'
        });
      });
    }
  });
}

function reCreateProxyServer() {
  fn.progress.start({ title: 'Stopping old Proxy Server', width: 33 });
  sockets.forEach(socket => socket.destroy());
  proxyServer.close();
  fn.timeout(1000, () => {
    httpServer.close(() => fn.progress.stop(() => createProxyServer()));
  });
}

function watchProxyConfigFile() {
  fs.watchFile('./proxy.conf.js', { persistent: true, interval: 500 }, status => {
    if (status && isSysAvailable) {
      getProxyConfig();
      initProxyServer();
    }
  });
}
