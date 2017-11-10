var valueLooker = require('value-looker');
var proxies, proxyTarget, useDynamicProxy, proxyStr;
// ========================================================
// 代理列表
// ========================================================
/*proxies*/
proxies = {
  0: 'http://localhost:8101',
  1: 'http://10.63.240.91:10080',
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
  19: 'http://10.92.244.219:8482'
};
/*proxies*/

// 选择目标代理
proxyTarget = proxies[ 6 ];

// 动态代理开关
useDynamicProxy = true;

// ========================================================
// 设置webServer工程实际代理
// ========================================================
proxyStr = 'The Http-Proxy is: ' + proxyTarget;
if (useDynamicProxy) proxyTarget = 'http://localhost:8181';
const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/blueprint",
      "/openoapi",
      "/catalog",
      "/swr"
    ],
    target: proxyTarget,
    secure: false
  }
];

valueLooker(proxyStr, {title: 'Msg From proxy.conf.js', theme: 'verbose'});
module.exports = PROXY_CONFIG;
