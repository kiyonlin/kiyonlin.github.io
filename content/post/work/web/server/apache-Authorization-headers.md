---
title: apache Authorization headers
tags: [apache, php]
categories: [web]
date: 2016-09-29T09:26:10+08:00
updated: 2016-09-29T09:26:10+08:00
---
来源于[stackoverflow](http://stackoverflow.com/questions/17018586/apache-2-4-php-fpm-and-authorization-headers)
<!-- more -->
> Various Apache modules will strip the Authorization header, usually for "security reasons". They all have different obscure settings you can tweak to overrule this behaviour, but you'll need to determine exactly which module is to blame.
  
>  You can work around this issue by passing the header directly to PHP via the env:
  
>  `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1`

apache通常会因为"安全原因"阻止Authorization header，需要在配置文件中开启。
