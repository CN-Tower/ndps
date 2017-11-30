var valueLooker = require('value-looker');
var proxies, proxyTarget, isEnableNDPS, proxyConf;
/**
 * 【后端环境列表】在此处设置常用的后端环境。
 *************************************************************************************/
/*proxies*/
proxies = {
  0: 'http://localhost:8101',
  1: 'http://10.93.128.155:10080',
  2: 'http://10.62.107.136:10080',
  3: 'http://10.63.240.89:10080',
  4: 'http://10.93.128.180:10080',
  5: 'http://10.62.49.203:10080',
  6: 'http://10.62.106.19:10080',
  7: 'http://10.93.128.121:10080',
  8: 'http://10.93.128.122:10080',
  9: 'http://10.63.241.139:5000',
  10: 'http://10.63.244.243:10080',
  11: 'http://10.63.240.99:10080',
  12: 'http://10.62.40.240:10080',
  13: 'http://10.62.48.59:10080',
  14: 'http://10.47.181.121:10080',
  15: 'http://10.93.128.227:10080',
  16: 'http://10.62.106.67:10080',
  17: 'http://10.93.128.224:10080',
  18: 'http://10.96.32.162:8482',
  19: 'http://10.92.244.219:8482',
  20: 'http://10.93.128.155:10080'
};
/*proxies*/
/**
 * 【目标后端环境】在此处选择你需要的后端环境。
 *************************************************************************************/
proxyTarget = proxies[ 0 ];

/**
 * 【NDPS功能开关】NDPS，设为true启用NDPS。
 *************************************************************************************/
isEnableNDPS = true;

/**
 * 【关于NDPS的说明】NDPS(Node-Dynamic-Proxy-Server)是一个基于nodeJS的动态代理服务器，
 * 如果在npm start前启用了NDPS，Angular-cli内置的dev-server的目标代理(proxyTarget)
 * 就会被设定到NDPS(http://localhost:8181),此时，NDPS则会读取和监听上面的环境配置，并
 * 根据配置的把http请求转发到对应的后端服务器上。这样做的主要好处是方便Start后需要更换后端
 * 环境的场景，NDPS可以在start的状态下动态切换环境，避免了重新运行npm start的时间消耗。
 * 更多关于NDPS的介绍请参见：https://dev.zte.com.cn/topic/#/41481 或 https://github.com/CN-Tower/n-dps
 *************************************************************************************/

/**
 * 【代理配置】根据环境设置配置cli中dev-server的http代理。
 *************************************************************************************/
proxyConf = [{
  context: [
    "/api",
    "/blueprint",
    "/openoapi",
    "/catalog",
    "/swr"
  ],
  target: proxyTarget,
  secure: false
}];

if (isEnableNDPS) {
  var ndpsMsg = 'The NDPS(Node-Dynamic-Proxy-Server) is Enabled!';
  valueLooker(ndpsMsg, {title: 'Msg From proxy.conf.js', theme: 'verbose'});
  proxyConf[0].target = 'http://localhost:8181';
} else {
  valueLooker('The Http-Proxy target is: ' + proxyTarget, {title: 'Msg From proxy.conf.js', theme: 'verbose'});
}
module.exports = proxyConf;
