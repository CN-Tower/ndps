module['exports'] = function () {
  var fs = require('fs');
  var http = require('http');
  var httpProxy = require('http-proxy');
  var valueLooker = require('value-looker');
  var ProgressBar = require('progress');

  var proxies, proxyStr;
  var proxyServer, httpServer;
  var progressTimer, progressBar, tickInterval;

  var progressHints = {
    create: 'Creating new Proxy Server',
    close: 'Stopping old Proxy Server'
  };

  var isMockStarted = false;
  var isServerOnInit = true;
  var isSysAvailable = true;
  var isHaveNewTask = false;

  var proxyPath = 'proxy.conf.js';
  var PORT = 8181;
  var sockets = [];

  getProxyConfig();
  watchProxyConfigFile();


  /**
   * 监听代理配置文件
   ***************************************************************************/
  function watchProxyConfigFile() {
    fs.watchFile('./proxy.conf.js', {persistent: true, interval: 500}, function(status) {
      if (status) {
        if (isSysAvailable) {
          getProxyConfig();
        } else {
          isHaveNewTask = true;
        }
      }
    });
  }

  /**
   * 获取配置文件的代理配置
   ***************************************************************************/
  function getProxyConfig() {
    isSysAvailable = false;

    if (!isServerOnInit) valueLooker('Checking changes...', {title: 'Msg From Proxy-Server', theme: 'verbose'});

    fs.readFile(proxyPath, 'utf8', function (err, proxyData) {
      if(err) throw err;

      proxyData = proxyData.replace(/\s*/mg, '');

      var proxyCode = parseInt(proxyData.split('proxies[')[1].substr(0, 3));

      eval(proxyData.split('/*proxies*/')[1]);

      if (!proxies.hasOwnProperty(proxyCode)) {
        var proxyErrHint = 'Proxy target error, please select again!';
        if (isServerOnInit) throw new Error(proxyErrHint);
        valueLooker(proxyErrHint, {title: 'Msg From Proxy-Server', theme: 'error'});
        checkTaskStatusOnMissionEnd();

      } else if (proxies[proxyCode] === proxyStr) {
        valueLooker('No changes were detected!', {title: 'Msg From Proxy-Server', theme: 'warn'});
        checkTaskStatusOnMissionEnd();

      } else {
        if (proxyCode === 0 && !isMockStarted) createMockProxyServer();
        proxyStr = proxies[proxyCode];
        httpServer ? closeHttpProxyServer() : initHttpProxyServer();
      }
    });
  }

  /**
   * 创建代理服务器
   ***************************************************************************/
  function initHttpProxyServer() {
    if (!isServerOnInit) processProgressBar('create', 'start');

    proxyServer = httpProxy.createProxyServer({target: proxyStr});

    proxyServer.on('error', function(){
      checkTaskStatusOnMissionEnd();
      valueLooker('Proxy Server error!', {title: 'Msg From Proxy-Server', theme: 'error'});
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

    httpServer.listen(PORT, function () {
      if (!isServerOnInit) {
        processProgressBar('create', 'stop', function() {
          valueLooker('The proxy target is: ' + proxyStr, {title: 'Msg From Proxy-Server', theme: 'verbose'});
          checkTaskStatusOnMissionEnd();
        });
      } else {
        isServerOnInit = false;
        valueLooker('The proxy target is: ' + proxyStr, {title: 'Msg From Proxy-Server', theme: 'verbose'});
        checkTaskStatusOnMissionEnd();
      }
    });
  }

  /**
   * 关闭代理服务器
   ***************************************************************************/
  function closeHttpProxyServer() {
    processProgressBar('close', 'start');

    sockets.forEach(function(socket){
      socket.destroy();
    });

    proxyServer.close();

    setTimeout(function(){
      httpServer.close(function() {
        processProgressBar('close', 'stop', function () {
          initHttpProxyServer();
        });
      });
    }, 1000);
  }

  /**
   * 任务执行完毕时检测配置文件是否产生新变化
   ***************************************************************************/
  function checkTaskStatusOnMissionEnd() {
    isSysAvailable = true;
    if (isHaveNewTask) {
      isHaveNewTask = false;
      getProxyConfig();
    }
  }

  /**
   * 开启和关闭代理时的进度条
   ***************************************************************************/
  function processProgressBar(type, status, onStopped) {
    if (status === 'start') {
      progressBar = new ProgressBar(progressHints[type] + ' [:bar] :percent', {
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

  /**
   * 启动桩服务器
   ***************************************************************************/
  function createMockProxyServer() {
    isMockStarted = true;
    require('./mock_server')();
  }
};
