module['exports'] = function (isShowBar, callBack) {
  var restify = require('restify');
  var valueLooker = require('value-looker');
  var ProgressBar = require('progress');
  var partition = require('./partition/index');

  var server = restify.createServer(null);
  var mockFilePath = './src/mock/partition';
  var PORT = process.env.PORT || 8101;

  var progressTimer, progressBar, tickInterval;
  var progressHints = 'Starting the Mock-Server';
  var mockServerMsg = 'The Mock-Server is started at: http://localHost:' + PORT;
  var isSysAvailable = false;

  if (isShowBar) processProgressBar('start');
  server.use(restify.queryParser());
  server.use(restify.requestLogger());
  server.use(restify.bodyParser());
  partition(server);
  serverListenPort();

  /**
   * Start the mock server
   ***************************************************************************/
  function serverListenPort() {
    server.listen(8101, function (/*req, res*/) {
      isSysAvailable = true;
      if (isShowBar) {
        processProgressBar('stop', function () {
          valueLooker(mockServerMsg, {title: 'Msg From Mock-Server', theme: 'verbose'});
          if (callBack) callBack();
        });
      } else {
        valueLooker(mockServerMsg, {title: 'Msg From Mock-Server', theme: 'verbose'});
        if (callBack) callBack();
      }
    });
  }

  /**
   * the mock server progress Bar
   ***************************************************************************/
  function processProgressBar(status, onStopped) {
    if (status === 'start') {
      progressBar = new ProgressBar(progressHints + ' [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 32,
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
};
