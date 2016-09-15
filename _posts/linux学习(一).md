---
title: linux学习(一)
tag: [linux, shell]
category: [技术,linux]
date: 2016-09-12 20:49:07
updated: 2016-09-12 20:49:07
---
# 常用操作
```shell
#清屏
ctrl+l / command+r
#删除行
ctrl+u
#到行首
ctrl+a
#到行尾
ctrl+e
#后台运行
ctrl+z
#输出当前工作目录print work directory
pwd
```
# 输出重定向
显示重定向到文件中
```shell
#两个'>'表示追加
命令 &>> 文件
#丢弃文件,俗称linux黑洞
命令 &> /dev/null
#正确追加到文件1,错误追加到文件2
命令 >> 文件1 2>> 文件2
```
# 输入重定向
多用于打补丁
```shell
wc命令 统计行、词、字
#结束
ctrl+d
```
# 命令管道符
有";" "&&" "||"  
下面命令用于 机器判断命令是否正确运行
```shell
ls && ceho yes || echo no
```

```shell
命令1 | 命令2
```
表示命令1正确执行后,其结果为命令2的参数  
例子
```shell
#部分展示etc目录下的文件信息
ls -l /etc | more
#当前建立连接的数目
netstat -an | grep ESTABLISHED | wc -l
```
# 通配符
```shell
?匹配一个
*匹配多个
[]匹配任意一个
[-]匹配范围
[^]逻辑非
```
# shell运算
```shell
a=1
#输出$a字符串
echo '$a'
#输出$a的值
echo "$a"
#``反引号包含命令,与$()相同
a = `ls`
#\表示转义符
```