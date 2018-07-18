const path = require('path');
const fn = require('funclib');
const ndpsServer = require('./ndps');
const mockServer = require('./src/mock/mock');
let proxies, proxyTarget, isEnableNDPS, ndpsConf, proxyConf, isMockStarted;
/**
 * 【后端环境列表】在此处设置常用的后端环境
 ************************************************************************/
proxies = /*proxies*/{
  0: 'http://localhost:8101',
  1: 'http://10.93.128.155:10080',
  2: 'http://10.62.106.182:10080'
}/*proxies*/;

/**
 * 【目标后端环境】在此处选择你需要的后端环境
 ************************************************************************/
proxyTarget = proxies[ 0 ];

/**
 * 【NDPS功能开关】在此处设置是否开启动态代理
 ************************************************************************/
isEnableNDPS = true;

/**
 * 【代理配置】NDPS和cli dev-server的代理配置
 ************************************************************************/
ndpsConf = {
  ndpsPort: 8181,
  proxiesAnchor: '/*proxies*/',
  proxyIdxAnchor: 'proxies[',
  proxyConfPath: __filename,
  onChangeProxy: (info, done) => {
    if (info.proxyTarget === proxies[0].trim() && !isMockStarted) {
      mockServer(!info.isInit, () => done());
      isMockStarted = true;
    } else {
      done();
    }
  }
};

proxyConf = [{
  context: ["/api"],
  target: proxyTarget,
  secure: false
}];

/**
 * 【打印输出】打印和输出上面的代理配置
 ************************************************************************/
if (process.argv[1].indexOf('proxy.conf.js') > -1) {
  if (process.argv[2] === 'ndps' || isEnableNDPS) {
    ndpsServer(ndpsConf);
  } else if (proxyTarget === proxies[ndpsConf.mockServerIdx]) {
    mockServer(false);
  }
} else {
  if (isEnableNDPS) {
    fn.log('The NDPS(Node-Dynamic-Proxy-Server) is Enabled!', {
      title: 'Msg From proxy.conf.js', color: 'cyan'
    });
    proxyConf[0].target = `http://localhost:${ndpsConf.ndpsPort}`;
  } else {
    fn.log(`The Http-Proxy target is: ${proxyTarget}`, {
      title: 'Msg From proxy.conf.js', color: 'cyan'
    });
  }
  module.exports = proxyConf;
}

