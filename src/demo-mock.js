const fn = require('funclib');
const chokidar = require('chokidar');
const child_process = require('child_process');
const exec  = child_process.exec;
const spawn = child_process.spawn;

const PORT = 8101;
const progress = {
  width: { start: 34, restart: 32 },
  title: {
    start: 'Starting the Mock-Server',
    restart: 'Restarting the Mock-Server'
  }
} 

let mockState = 'start';
let isShowProgress = true;
let watcher, mockProcess;

// 检测到桩变化并重启桩服务器
if (process.argv[2] === 'spawn') {
  createMockServer();
}
// 非变化检测启桩
else {
  module.exports = function(isShowBar, callback) {
    isShowProgress = isShowBar;
    initMockServer(callback);
  };
  if (process.argv[1].indexOf('mock.js') > -1) {
    initMockServer();
  }
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
 * 检测桩是否运行,根据配置确定是否显示进度条并创建桩进程
 * @param callback
 */ 
function initMockServer(callback) {
  const mockServerMsg = 'The Mock-Server is started at: http://localhost:' + PORT;
  exec(`netstat -apn | grep ${PORT} | cut -d "/" -f 1`, (e , stdout , stderr) => {
    if (stdout) {
      const mockPid = parseInt(stdout.toString().split('LISTEN')[1]);
      if (mockPid) {
        fn.log(`Killing old mock process(pid: ${mockPid})`, {
          title: 'Msg From Mock-Server', color: 'cyan'
        });
        exec(`kill -9 ${mockPid}`);
      }
    }
    if (isShowProgress) {
      fn.progress.start({title: progress.title[mockState], width: progress.width[mockState]});
      mockProcess = createMockProcess(() => {
        fn.progress.stop(() => {
          fn.log(mockServerMsg, {title: 'Msg From Mock-Server', color: 'cyan'});
          if (callback) callback();
        });
      });
    } else {
      mockProcess = createMockProcess(() => {
        fn.log(mockServerMsg, {title: 'Msg From Mock-Server', color: 'cyan'});
        if (callback) callback();
      });
    }
    isShowProgress = true;
  });
}

/**
 * 创建桩服务器子进程
 * @param callback
 * @returns {ChildProcess}
 */
function createMockProcess(callback) {
  const child = spawn('node', [__filename, 'spawn'], {encoding: 'utf-8'});
  child.stdout.on('data', data => {
    if (data.toString().indexOf('ok') > -1 && callback) {
      callback();
    }
  });
  child.stderr.on('data', err => {
    throw new Error(err);
  });
  child.on('exit', () => initMockServer());
  return child;
}

/**
 * 创建桩服务器
 * @param onCreateEnd
 */
function createMockServer() {
  const restify = require('restify');
  const partition = require('./micro-service/index');
  const server = restify.createServer(null);
  server.use(restify.queryParser());
  server.use(restify.requestLogger());
  server.use(restify.bodyParser());
  partition(server);
  server.listen(PORT, () => console.log('ok'));
}
