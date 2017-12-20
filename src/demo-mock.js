var chokidar = require('chokidar');
var ProgressBar = require('progress');
var valueLooker = require('value-looker');
var childProcess = require('child_process');
var progressTimer, progressBar, tickInterval, watcher, mockProcess;
var PORT = 8101;
var mockServerMsg = 'The Mock-Server is started at: http://localhost:' + PORT;
var mockState = 'start';
var progressWidths = { start: 32, restart: 30 };
var progressHints = {
  start: 'Starting the Mock-Server',
  restart: 'Restarting the Mock-Server'
};
var isShowProgress = true;

if (process.argv[2] === 'spawn') {
  createMockServer();
} else {
  // 判断是否直接启桩
  if (process.argv[1].indexOf('mock.js') > -1) {
    initMockServer();
  }
  // 输出启桩函数
  module.exports = function(isShowBar, callback) {
    isShowProgress = isShowBar;
    initMockServer(callback);
  };
 // 监听文件变化后重启桩服务器
  if (!watcher) {
    watcher = chokidar.watch(__dirname).on('change', function(){
      if (mockProcess) {
        mockState = 'restart';
        process.kill(mockProcess.pid, "SIGKILL");
      }
    });
  }
}

/**
 * 根据配置确定是否显示进度条
 * @param callback
 */
function initMockServer(callback) {
  if (isShowProgress) {
    processProgressBar('start');
    mockProcess = createMockProcess(function () {
      processProgressBar('stop', function () {
        valueLooker(mockServerMsg, {title: 'Msg From Mock-Server', theme: 'verbose'});
        if (callback) callback();
      });
    });
  } else {
    mockProcess = createMockProcess(function () {
      valueLooker(mockServerMsg, {title: 'Msg From Mock-Server', theme: 'verbose'});
      if (callback) callback();
    });
  }
  isShowProgress = true;
}

/**
 * 开启和关闭服务器的进度条
 * @param status
 * @param onStopped
 */
function processProgressBar(status, onStopped) {
  if (status === 'start') {
    progressBar = new ProgressBar(progressHints[mockState] + ' [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: progressWidths[mockState],
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
      if (type === '-') tickInterval -= tickInterval * 0.2;

      if (progressBar.complete && status === 'stop') {
        onStopped();
      } else {
        tickFun(type);
      }
    }, tickInterval);
  }
}
/**
 * 创建桩服务器进程
 * @param callback
 * @returns {ChildProcess}
 */
function createMockProcess(callback) {
  var child  = childProcess.spawn('node', [__filename, 'spawn'], {encoding: 'utf-8'});
  child.stdout.on('data', function(data) {
    if (data.toString().indexOf('ok') > -1 && callback) {
      callback();
    }
  });
  child.stderr.on('data', function (err) {
    throw new Error(err);
  });
  child.on('exit', function () {
    initMockServer();
  });
  return child;
}

/**
 * 创建桩服务器
 * @param onCreateEnd
 */
function createMockServer() {
  var restify = require('restify');
  var partition = require('./micro-service/index');
  var server = restify.createServer(null);
  server.use(restify.queryParser());
  server.use(restify.requestLogger());
  server.use(restify.bodyParser());
  partition(server);
  server.listen(PORT, function () {
    console.log('ok');
  });
}
