# NDPS(node-dynamic-proxy-server)

在一个比较大的Angular项目中，开发和测试的环境往往都会有很多。所以在Angular前端的开发过程中，有时需要经常性的切换后端环境。

在angular-cli工程和webpack工程中都提供了修改的方法： 在angular-cli工程中使用指令ng server -pc proxy.conf.json(.js)就能传入一个环境代理配置，在webpack工程中则可以在webpack.config.js中通过配置devServer的proxy来实现。

但是，不论是angular-cli工程还是webpack工程，在开发模式下每次更换代理往往都需要重新start工程来使代理生效，而重新start就意味着一个webpack compile的过程，这对一个大型Angular工程来说时间开消是很大的，严重影响开发效率。

有没有一种办法，能让Angular工程在更改完http代理后不需要重新start就能自动生效呢？

这时候NDPS(node-dynamic-proxy-serve)就能派上用场了！
