module['exports'] = function (opt) {
  var fs = require('fs');
  var http = require('http');
  var httpProxy = require('http-proxy');
  var valueLooker = require('value-looker');
  var ProgressBar = require('progress');

  var proxies, proxyStr;
  var proxyServer, httpServer;
  var progressTimer, progressBar, tickInterval;
  var port, proxyConfPath, proxiesAnchor, proxyIdxAnchor, isExistMockServer, mockServerPath, mockServerIdx;

  var progressHints = {
    create: 'Creating new Proxy Server',
    close: 'Stopping old Proxy Server'
  };

  var isMockStarted = false;
  var isSysAfterInit = false;
  var isSysAvailable = true;

  var sockets = [];


  if(opt && opt.hasOwnProperty('ndpsPort') && opt.ndpsPort) {
    port = opt.ndpsPort;
  } else {
    throw new Error('NDPS port error!');
  }
  if(opt && opt.hasOwnProperty('proxyConfPath') && opt.proxyConfPath) {
    proxyConfPath = opt.proxyConfPath;
  } else {
    throw new Error('Proxy Conf path error!');
  }
  if(opt && opt.hasOwnProperty('proxiesAnchor') && opt.proxiesAnchor) {
    proxiesAnchor = opt.proxiesAnchor;
  } else {
    throw new Error('Proxies Anchor error!');
  }
  if(opt && opt.hasOwnProperty('proxyIdxAnchor') && opt.proxyIdxAnchor) {
    proxyIdxAnchor = opt.proxyIdxAnchor;
  } else {
    throw new Error('proxy Index Anchor error!');
  }

  getProxyConfig();
  watchProxyConfigFile();

  /**
   * 监听代理配置文件(proxy.conf.js)
   ***************************************************************************/
  function watchProxyConfigFile() {
    fs.watchFile('./proxy.conf.js', {persistent: true, interval: 500}, function(status) {
      if (status && isSysAvailable) {
        getProxyConfig();
      }
    });
  }

  /**
   * 获取具体代理配置
   ***************************************************************************/
  function getProxyConfig() {
    isSysAvailable = false;

    if (isSysAfterInit) valueLooker('Checking changes...', {title: 'Msg From NDPS', theme: 'verbose'});

    fs.readFile(proxyConfPath, 'utf8', function (err, proxyData) {
      if(err) throw err;

      proxyData = proxyData.replace(/\s*/mg, '');

      var proxyIdx = parseInt(proxyData.split(proxyIdxAnchor)[1].substr(0, 3));

      proxies = eval(proxyData.split(proxiesAnchor)[1]);

      if (!proxies.hasOwnProperty(proxyIdx)) {
        var proxyErrHint = 'Proxy Index error, please select again!';
        if (!isSysAfterInit) throw new Error(proxyErrHint);
        isSysAvailable = true;
        valueLooker(proxyErrHint, {title: 'Msg From NDPS', theme: 'error'});

      } else if (proxies[proxyIdx] === proxyStr) {
        isSysAvailable = true;
        valueLooker('No changes were detected!', {title: 'Msg From NDPS', theme: 'warn'});

      } else {
        proxyStr = proxies[proxyIdx];
        isExistMockServer = opt && opt.hasOwnProperty('mockServerPath') && opt.mockServerPath;
        mockServerPath = isExistMockServer ? opt.mockServerPath : '';
        mockServerIdx = isExistMockServer && opt.hasOwnProperty('mockServerIdx') ? opt.mockServerIdx : NaN;
        if (isExistMockServer && proxyIdx === mockServerIdx && !isMockStarted) {
          isMockStarted = true;
          require(mockServerPath)(isSysAfterInit, function () {
            httpServer ? closeHttpProxyServer() : initHttpProxyServer();
          });
        } else {
          httpServer ? closeHttpProxyServer() : initHttpProxyServer();
        }
      }
    });
  }

  /**
   * 创建代理服务器
   ***************************************************************************/
  function initHttpProxyServer() {
    if (isSysAfterInit) processProgressBar('start', progressHints['create']);

    proxyServer = httpProxy.createProxyServer({target: proxyStr});

    proxyServer.on('error', function(){
      isSysAvailable = true;
      valueLooker('Proxy Server error!', {title: 'Msg From NDPS', theme: 'error'});
    });

    httpServer = http.createServer(function (request, response) {
      proxyServer.web(request, response);
    });

    sockets = [];
    httpServer.on("connection",function(socket){
      sockets.push(socket);
      socket.once("close",function(){
        sockets.splice(sockets.indexOf(socket), 1);
      });
    });

    httpServer.listen(port, function () {
      if (isSysAfterInit) {
        processProgressBar('stop', progressHints['create'], function() {
          isSysAvailable = true;
          valueLooker('The new proxy target is: ' + proxyStr, {title: 'Msg From NDPS', theme: 'verbose'});
        });
      } else {
        isSysAfterInit = true;
        isSysAvailable = true;
        var ndpsStartedMsg = 'The NDPS(Node-Dynamic-Proxy-Server) is started!\nThe http-proxy target is: ' + proxyStr;
        valueLooker(ndpsStartedMsg, {title: 'Msg From NDPS', theme: 'verbose'});
      }
    });
  }

  /**
   * 关闭代理服务器
   ***************************************************************************/
  function closeHttpProxyServer() {
    processProgressBar('start', progressHints['close']);

    sockets.forEach(function(socket){
      socket.destroy();
    });

    proxyServer.close();

    setTimeout(function(){
      httpServer.close(function() {
        processProgressBar('stop', progressHints['close'], function () {
          initHttpProxyServer();
        });
      });
    }, 1000);
  }

  /**
   * 更换代理时的进度条
   ***************************************************************************/
  function processProgressBar(status, progressMsg, onStopped) {
    if (status === 'start') {
      progressBar = new ProgressBar(progressMsg + ' [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 31,
        total: 20
      });
      clearTimeout(progressTimer);
      tickInterval = 250;
      tickFun('+');
    }
    if (status === 'stop') {
      clearTimeout(progressTimer);
      tickInterval = 600;
      tickFun('-');
    }

    function tickFun(type) {
      progressTimer = setTimeout(function () {
        progressBar.tick();
        if (type === '+') tickInterval += 300;
        if (type === '-') tickInterval -= tickInterval * 0.25;

        if (progressBar.complete && status === 'stop') {
          onStopped();
        } else {
          tickFun(type);
        }
      }, tickInterval);
    }
  }
};
