var fs = require('fs');
var proxyPath = 'proxy.conf.js';
var isDev = process.argv[2] && process.argv[2] === 'dev';

isDev ? readProxyConfig() : createMockProxyServer(true);

/**
 * 获取http代理配置
 ***************************************************************************/
function readProxyConfig() {
  var isUseMockProxy, isEnableNDPS;
  fs.readFile(proxyPath, 'utf8', function (err, proxyData) {
    if(err) throw err;
    proxyData = proxyData.replace(/\s*/mg, '');
    isEnableNDPS = proxyData.split('isEnableNDPS=')[1].substr(0, 4) === 'true';
    isUseMockProxy = proxyData.split('proxies[')[1].substr(0, 1) === '0';

    if (isEnableNDPS) {
      createDynamicProxyServer();
    } else if (isUseMockProxy) {
      createMockProxyServer(false);
    }
  });
}

/**
 * 启动动态代理服务器
 ***************************************************************************/
function createDynamicProxyServer() {
  require('./ndps')();
}

/**
 * 启动桩服务器
 ***************************************************************************/
function createMockProxyServer(isShowBar) {
  require('./mock')(isShowBar);
}

