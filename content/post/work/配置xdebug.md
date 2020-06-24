---
title: 配置xdebug
date: 2016-09-15 18:11:34
tag: [xdebug, php, phpstorm]
category: [技术,php] 
---

## PHPSTORM中配置xdebug
使用homebrew安装与php版本相对应的xdebug  
会自动生成配置文件(使用php --ini可以查看php的所有配置文件)
```shell
/usr/local/etc/php/7.0/conf.d/ext-xdebug.ini
```
可以在ext-xdebug.ini中完善配置个性化信息，一般只加载扩展就可以运行
```
[xdebug]
zend_extension="/usr/local/opt/php70-xdebug/xdebug.so"
;下面都是默认配置


;允许远程IDE调试
xdebug.remote_enable        = 1
;远程主机
xdebug.remote_host          = localhost
xdebug.remote_port          = 9000 ;默认端口 9000
xdebug.profiler_autostart   = 1
xdebug.profiler_enable      = 1
;临时跟踪信息输出
xdebug.profiler_output_dir  = "~/tmp"
xdebug.idekey = PHPSTORM
```

打开PHPSTORM配置,在Languages & Frameworks的PHP中,配置php language level和interpreter(没有需要新增)  
在菜单栏RUN-Edit Configurations中添加PHP Web Application
