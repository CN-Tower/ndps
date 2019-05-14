const fn = require('funclib');
const ndpsServer = require('ndps');

/**
 * Proxies list
 */
const proxies = /*proxies*/{
  0: 'http://localhost:8101',
  1: 'http://120.77.183.99:80',
  2: 'http://149.129.128.193:80',

}/*proxies*/;

/**
 * Target Proxy
 */
const proxyTarget = proxies[ 2  ];

/**
 * NDPS Switch
 */
const isEnableNDPS = true;

/**
 * Configs of NDPS & Dev-server
 */
const ndpsConf = {
  ndpsPort: 8181,
  proxiesAnchor: '/*proxies*/',
  proxyIdxAnchor: 'proxies[',
  proxyConfPath: __filename
};

const proxyConf = [{
  context: [ 'api', 'volume', 'network' ],
  target: proxyTarget,
  secure: false
}];

if (isEnableNDPS) {
  ndpsServer(ndpsConf);
  fn.log('The NDPS(Node-Dynamic-Proxy-Server) is Enabled!', 'Msg From proxy.conf.js');
  proxyConf[0].target = `http://localhost:${ndpsConf.ndpsPort}`;
} else {
  fn.log(`The Http-Proxy target is: ${proxyTarget}`, 'Msg From proxy.conf.js');
}

module.exports = proxyConf;
