var path = require('path');
var proxies, proxyTarget, isEnableNDPS, ndpsConf, proxyConf;
/**
 * 【后端环境列表】在此处设置常用的后端环境
 *************************************************************************************/
/*proxies*/proxies = {
  0: 'http://localhost:8101',
  1: 'http://10.93.128.155:10080',
  2: 'http://10.62.107.136:10080',
  ...

}/*proxies*/;
/**
 * 【目标后端环境】在此处选择你需要的后端环境
 *************************************************************************************/
proxyTarget = proxies[ 0 ];
/**
 * 【NDPS功能开关】在此处设置是否开启动态代理
 *************************************************************************************/
isEnableNDPS = false;

/**
 * 【代理配置】NDPS和cli dev-server的代理配置
 *************************************************************************************/
ndpsConf = {
  ndpsPort: 8181,
  mockServerIdx: 0,
  proxiesAnchor: '/*proxies*/',
  proxyIdxAnchor: 'proxies[',
  proxyConfPath: path.join(__dirname, 'proxy.conf.js'),
  mockServerPath: path.join(__dirname, 'src/mock/mock.js')
};

proxyConf = [{
  context: ["/api"],
  target: proxyTarget,
  secure: false
}];

/**
 * 【打印输出】打印和输出上面的代理配置
 *************************************************************************************/
if (process.argv[1].indexOf('proxy.conf.js') > -1) {
  if (isEnableNDPS) {
    require('ndps')(ndpsConf);
  } else if (proxyTarget === proxies[ndpsConf.mockServerIdx]) {
    require(ndpsConf.mockServerPath)(false);
  }
} else {
  var valueLooker = require('value-looker');
  if (isEnableNDPS) {
    valueLooker('The NDPS(Node-Dynamic-Proxy-Server) is Enabled!', {title: 'Msg From proxy.conf.js', theme: 'verbose'});
    proxyConf[0].target = 'http://localhost:' + ndpsConf.ndpsPort;
  } else {
    valueLooker('The Http-Proxy target is: ' + proxyTarget, {title: 'Msg From proxy.conf.js', theme: 'verbose'});
  }
  module.exports = proxyConf;
}

