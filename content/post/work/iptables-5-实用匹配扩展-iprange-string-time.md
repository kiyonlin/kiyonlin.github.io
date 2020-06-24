---
title: iptables详解-5-实用匹配扩展iprange,string,time
tag: [iptables, iptables扩展]
category: [iptables]
date: 2018-08-22 08:59:15
comment: true
---

本章介绍三个实用的规则匹配扩展模块[^1]：`iprange` 、`string` 和 `time`。
[^1]: man iptables-extensions 8
::: warning 注意
本系列文章测试环境为 `centos 7`，`iptables` 版本 `1.4.21`。
:::

<!-- more -->

## iprange 扩展
`iptables` 匹配IP地址时，`-s` 和 `-d` 选项只能指定离散的IP地址，不能指定连续的IP地址，这时候就需要 `iprange` 扩展模块。该模块包含了两个选项：
- [!] --src-range from[-to]
- [!] --dst-range from[-to]

> 拒绝来自 `10.211.54.111` 到 `10.211.55.11` 范围的IP地址报文
```bash {1,2,5}
iptables -I INPUT -m iprange --src-range 10.211.55.3-10.211.55.11 -j DROP
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 34 packets, 2308 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DROP       all  --  *      *       0.0.0.0/0            0.0.0.0/0            source IP range 10.211.55.3-10.211.55.11
```

## string 扩展
`string` 扩展可以匹配报文中的字符串或者字节流，是一个比较实用的扩展。该扩展的选项如下：
- `--algo {bm|kmp}` 指定字符串匹配算法，必填选项(算法介绍可以参考这两篇文章[bm](http://www.ruanyifeng.com/blog/2013/05/boyer-moore_string_search_algorithm.html)，[kmp](http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html))
- `--from offset` 指定在报文中的起始偏移量，默认为0，可选项
- `--to offset` 指定在报文中的结束偏移量，默认是报文大小，可选项
- `[!] --string pattern` 匹配字符串
- `[!] --hex-string pattern` 匹配十六进制字节流

下面让我们实际应用一下该扩展。这里我们在 `10.211.55.19` 搭建了一个 `http` 服务，包含两个页面：
```bash {1,21,24,43}
curl 10.211.55.19/drop.html -v                      
* About to connect() to 10.211.55.19 port 80 (#0)
*   Trying 10.211.55.19...
* Connected to 10.211.55.19 (10.211.55.19) port 80 (#0)
> GET /drop.html HTTP/1.1
> User-Agent: curl/7.29.0
> Host: 10.211.55.19
> Accept: */*
>
< HTTP/1.1 200 OK
< Server: openresty/1.13.6.1
< Date: Thu, 23 Aug 2018 00:59:18 GMT
< Content-Type: text/html
< Content-Length: 8
< Last-Modified: Wed, 22 Aug 2018 09:11:45 GMT
< Connection: keep-alive
< ETag: "5b7d28d1-8"
< Accept-Ranges: bytes
<
drop
me
* Connection #0 to host 10.211.55.19 left intact
#####################################################
curl 10.211.55.19/hello.html -v                     
* About to connect() to 10.211.55.19 port 80 (#0)
*   Trying 10.211.55.19...
* Connected to 10.211.55.19 (10.211.55.19) port 80 (#0)
> GET /hello.html HTTP/1.1
> User-Agent: curl/7.29.0
> Host: 10.211.55.19
> Accept: */*
>
< HTTP/1.1 200 OK
< Server: openresty/1.13.6.1
< Date: Thu, 23 Aug 2018 00:59:52 GMT
< Content-Type: text/html
< Content-Length: 12
< Last-Modified: Wed, 22 Aug 2018 09:11:59 GMT
< Connection: keep-alive
< ETag: "5b7d28df-c"
< Accept-Ranges: bytes
<
hello world
* Connection #0 to host 10.211.55.19 left intact
```

> 拒绝包含 `world` 字符串的报文

```bash {1,2,3,6}
iptables -F OUTPUT
iptables -I OUTPUT -m string --algo kmp --string "world" -j REJECT
iptables -nvL OUTPUT
Chain OUTPUT (policy ACCEPT 15 packets, 2432 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "world" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
```
因为我们要用测试机获取 `10.211.55.19` 上的页面，所以 `iptables` 规则要写在 `OUTPUT` 链上。
再使用测试机 `curl` 一下 `hello.html` 页面，发现无法获取页面内容：
```bash {1}
curl 10.211.55.19/hello.html -v                     
* About to connect() to 10.211.55.19 port 80 (#0)
*   Trying 10.211.55.19...
* Connected to 10.211.55.19 (10.211.55.19) port 80 (#0)
> GET /hello.html HTTP/1.1
> User-Agent: curl/7.29.0
> Host: 10.211.55.19
> Accept: */*
>
< HTTP/1.1 200 OK
< Server: openresty/1.13.6.1
< Date: Thu, 23 Aug 2018 01:00:03 GMT
< Content-Type: text/html
< Content-Length: 12
< Last-Modified: Wed, 22 Aug 2018 09:11:59 GMT
< Connection: keep-alive
< ETag: "5b7d28df-c"
< Accept-Ranges: bytes
<                       
^C
```

查看 `OUTPUT` 链，拦截了96个报文：
```bash {1,4}
iptables -nvL OUTPUT
Chain OUTPUT (policy ACCEPT 220 packets, 15689 bytes)
 pkts bytes target     prot opt in     out     source               destination
   96  7704 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "world" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
```

> 拒绝包含 `drop\nme` 字节流的报文
查看 `ascii` 表，可以知道 `\n` 的十六进制值为 `0A`。
```bash {1,2,5}
iptables -I OUTPUT -m string --algo kmp --hex-string "drop|0A|me" -j REJECT
iptables -nvL OUTPUT
Chain OUTPUT (policy ACCEPT 31 packets, 4008 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "|64726f700a6d65|" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
  108  8640 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "world" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
```
`"drop|0A|me"` 被转化成了纯字节流字符串 `"|64726f700a6d65|"`。
再使用测试机 `curl` 一下 `drop.html` 页面，发现无法获取页面内容：
```bash {1}
curl 10.211.55.19/drop.html -v                      
* About to connect() to 10.211.55.19 port 80 (#0)
*   Trying 10.211.55.19...
* Connected to 10.211.55.19 (10.211.55.19) port 80 (#0)
> GET /drop.html HTTP/1.1
> User-Agent: curl/7.29.0
> Host: 10.211.55.19
> Accept: */*
>
< HTTP/1.1 200 OK
< Server: openresty/1.13.6.1
< Date: Thu, 23 Aug 2018 01:01:43 GMT
< Content-Type: text/html
< Content-Length: 8
< Last-Modified: Wed, 22 Aug 2018 09:11:45 GMT
< Connection: keep-alive
< ETag: "5b7d28d1-8"
< Accept-Ranges: bytes
<                      
^C
```

查看 `OUTPUT` 链，拦截了54个报文：
```bash {1,4}
iptables -nvL OUTPUT
Chain OUTPUT (policy ACCEPT 490 packets, 34180 bytes)
 pkts bytes target     prot opt in     out     source               destination
   54  4140 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "|64726f700a6d65|" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
  108  8640 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "world" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
```

::: warning 注意
`http` 协议是基于 `tcp` 协议的可靠连接，当客户端未得到响应时，会尝试重传，尝试一定次数后才确认请求失败。所以上述两条规则匹配到的报文数最后都会达到108。
```bash
iptables -nvL OUTPUT
Chain OUTPUT (policy ACCEPT 2202 packets, 279K bytes)
 pkts bytes target     prot opt in     out     source               destination
  108  8208 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "|64726f700a6d65|" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
  108  8640 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "world" ALGO name kmp TO 65535 reject-with icmp-port-unreachable
```
:::

::: warning 注意
实验过程中，发现使用 `bm` 算法时，无法匹配目标字符串。
:::

## time扩展
`time` 扩展可以匹配报文到达时间。该扩展的常用选项有：
- `--datestart YYYY[-MM[-DD[Thh[:mm[:ss]]]]]`
- `--datestop YYYY[-MM[-DD[Thh[:mm[:ss]]]]]`
- `--timestart hh:mm[:ss]`
- `--timestop hh:mm[:ss]`
- `[!] --monthdays day[,day...]` 没有31的月份会忽略31，二月份还会忽略29，30
- `[!] --weekdays day[,day...]` 星期选项可以是 `1-7` 的数字，或者英文缩写 `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`。只使用两个字母也是允许的：`Mo`, `Tu`, `We`, `Th`, `Fr`, `Sa`, `Su`

> 周六周日 00:00-00:06, 21:00-23:59 不提供网页服务

```bash {1,2,3,6}
iptables -F OUTPUT
iptables -I OUTPUT -p tcp -m multiport --dports 80,443 -m time --weekdays Sa,Su --timestart 21:00  --timestop 06:00 -j REJECT
iptables -nvL OUTPUT
Chain OUTPUT (policy ACCEPT 7 packets, 1272 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            multiport dports 80,443 TIME from 21:00:00 to 06:00:00 on Sat,Sun UTC reject-with icmp-port-unreachable
```