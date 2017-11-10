var fs = require('fs');
var proxyPath = 'proxy.conf.js';
var isDev = process.argv[2] && process.argv[2] === 'dev';

if (!isDev) {
  createMockProxyServer();
} else {
  readProxyConfig();
}
/**
 * 读取代理设置
 ***************************************************************************/
function readProxyConfig() {
  var isUseMockProxy, isUseDynamicProxy;
  fs.readFile(proxyPath, 'utf8', function (err, proxyData) {
    if(err) throw err;
    proxyData = proxyData.replace(/\s*/mg, '');
    isUseDynamicProxy = proxyData.split('useDynamicProxy=')[1].substr(0, 4) === 'true';
    isUseMockProxy = proxyData.split('proxies[')[1].substr(0, 1) === '0';

    if (isUseDynamicProxy) {
      createDynamicProxyServer();
    } else if (isUseMockProxy) {
      createMockProxyServer();
    }
  });
}


/**
 * 启动桩服务器
 ***************************************************************************/
function createMockProxyServer() {
  require('./mock_server')();
}

/**
 * 启动动态代理服务器
 ***************************************************************************/
function createDynamicProxyServer() {
  require('./dynamic_proxy')();
}

