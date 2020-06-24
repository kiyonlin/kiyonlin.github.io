---
title: apache开启websocket反向代理
tags: [apache, websocket, 反向代理]
categories: [web]
date: 2017-05-05 09:10:30
updated: 2017-05-05 09:10:30
---

## 环境
Mac OS X 10.12.4

Apache/2.4.25 (Unix)

## 配置
httpd.conf配置，开启代理模块
```
LoadModule proxy_module libexec/apache2/mod_proxy.so
LoadModule proxy_wstunnel_module libexec/apache2/mod_proxy_wstunnel.so
## mod_proxy_balancer负载均衡模块可选，不开也可以使用
#LoadModule proxy_balancer_module libexec/apache2/mod_proxy_balancer.so
```

虚拟站点配置
```
<VirtualHost *:80>
    #配置站点的域名
    ServerName ws.xxx.com

    #off表示开启反向代理，on表示开启正向代理
    ProxyRequests Off
    ProxyMaxForwards 100
    ProxyPreserveHost On
    #这里表示要将现在这个虚拟主机跳转到本机的2222端口
    ProxyPass / ws://127.0.0.1:2222/
    ProxyPassReverse / ws://127.0.0.1:2222/

    <Proxy *>
        Order Deny,Allow
        Allow from all
    </Proxy>
</VirtualHost>
```

重启apache
