module['exports'] = function () {
  var restify = require('restify');
  var server = restify.createServer(null);
  var partition = require('./partition/index');
  var valueLooker = require('value-looker');
  var PORT = process.env.PORT || 8101;

  server.use(restify.queryParser());
  server.use(restify.requestLogger());
  server.use(restify.bodyParser());
  partition(server);

  server.listen(8101, function (/*req, res*/) {
    var mockServerMsg = 'Mock Server is Started and listening on Port: ' + PORT;
    valueLooker(mockServerMsg, {title: 'Msg From Mock-Server', theme: 'verbose'});
  });
};
