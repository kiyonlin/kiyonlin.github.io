---
title: iptables详解-4-规则匹配
tags: [iptables]
categories: [iptables]
date: 2018-08-21 14:35:08
comment: true
---

本章介绍更多的规则匹配条件。
::: warning 注意
本系列文章测试环境为 `centos 7`，`iptables` 版本 `1.4.21`。
:::

<!-- more -->

## 源IP地址
> 指定多个IP地址
```bash {1,2,5,6}
iptables -I INPUT -s 10.211.55.9,10.211.55.10 -j DROP
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 40 packets, 2652 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DROP       all  --  *      *       10.211.55.10         0.0.0.0/0
    0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```

> 指定某个网段
```bash {1,2,5}
iptables -I INPUT -s 10.211.0.0/16 -j ACCEPT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 27 packets, 2293 bytes)
 pkts bytes target     prot opt in     out     source               destination
   40  2772 ACCEPT     all  --  *      *       10.211.0.0/16        0.0.0.0/0
    0     0 DROP       all  --  *      *       10.211.55.10         0.0.0.0/0
    0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```

> 对源IP地址取反
```bash {1,2,3,6}
iptables -F INPUT
iptables -A INPUT ! -s 10.211.55.9 -j ACCEPT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination
   53  4145 ACCEPT     all  --  *      *      !10.211.55.9          0.0.0.0/0
```

上述规则的意思为报文的源IP地址不是 `10.211.55.9` 的，都执行 `ACCEPT` 操作。
让我们使用测试机 `ping` 一下：
```bash {1,8}
ping 10.211.55.19                                  
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
64 bytes from 10.211.55.19: icmp_seq=1 ttl=64 time=0.401 ms
64 bytes from 10.211.55.19: icmp_seq=2 ttl=64 time=0.261 ms
64 bytes from 10.211.55.19: icmp_seq=3 ttl=64 time=0.258 ms
^C
--- 10.211.55.19 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2001ms
rtt min/avg/max/mdev = 0.258/0.306/0.401/0.069 ms
```

我们可以看到，测试机仍然可以 `ping` 通目标机器。这是因为，当所有规则都未匹配时，会使用链的默认策略执行操作，而现在 `INPUT` 链的默认规则为 `ACCEPT`。查看 `INPUT` 链情况：
```bash {1,2}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 3 packets, 252 bytes)
 pkts bytes target     prot opt in     out     source               destination
  505 41315 ACCEPT     all  --  *      *      !10.211.55.9          0.0.0.0/0
```
从输出结果可以看到，默认策略接受了3个报文，总大小为252b。

## 目标IP地址
`iptables` 使用 `-d, --destination` 选项指定目标IP地址，表示报文要发到哪里去。
查看当前机器的IP地址：
```bash {1}
ifconfig | awk '/inet\>/ {print $2}'
10.211.55.19
127.0.0.1
192.168.122.1
```

> 拒绝向 `192.168.122.1` 发送报文
```bash {1,2,5}
iptables -I INPUT -d 192.168.122.1 -j DROP
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DROP       all  --  *      *       0.0.0.0/0            192.168.122.1
 5192  416K ACCEPT     all  --  *      *      !10.211.55.9          0.0.0.0/0
```

`-d` 和 `-s` 选项一样，支持多地址以及网段，也可以取反。

## 协议
`-p, --protocol` 选项指定匹配报文的协议。
> 拒绝来自 `10.211.55.9` 的 `tcp` 报文

```bash {1,2,3,6}
iptables -F INPUT
iptables -I INPUT -s 10.211.55.9 -d 10.211.55.19 -p tcp -j REJECT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 32 packets, 2092 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     tcp  --  *      *       10.211.55.9          10.211.55.19         reject-with icmp-port-unreachable
```

使用测试机 `telnet` 一下:
``` bash {1,3}
telnet 10.211.55.19 22                              
Trying 10.211.55.19...
telnet: connect to address 10.211.55.19: Connection refused
```

再用测试机 `ping` 一下:
``` {1,8}
ping 10.211.55.19                                   
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
64 bytes from 10.211.55.19: icmp_seq=1 ttl=64 time=0.240 ms
64 bytes from 10.211.55.19: icmp_seq=2 ttl=64 time=0.237 ms
64 bytes from 10.211.55.19: icmp_seq=3 ttl=64 time=0.284 ms
^C
--- 10.211.55.19 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2000ms
rtt min/avg/max/mdev = 0.237/0.253/0.284/0.028 ms
```

这时候查看 `INPUT` 链:
```bash {1,4}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 428 packets, 34304 bytes)
 pkts bytes target     prot opt in     out     source               destination
    1    60 REJECT     tcp  --  *      *       10.211.55.9          10.211.55.19         reject-with icmp-port-unreachable
```

拒绝了一个报文。

`-p` 选项包含的协议如下：
- tcp
- udp
- icmp
- udplite
- icmpv6
- esp
- ah
- sctp
- mh
- all(所有协议)

不指定 `-p` 选项时，相当于 `-p all`。

## 网卡接口
当机器中有多个网卡时，可以使用 `-i, --in-interface` 选项指定具体的网卡接口。
下面是 10.211.55.19 所在网卡的信息:
```bash {1,2}
ifconfig
br0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.211.55.19  netmask 255.255.255.0  broadcast 10.211.55.255
        inet6 fe80::21c:42ff:fe14:8ef3  prefixlen 64  scopeid 0x20<link>
```

> 拒绝流入 `br0` 网卡的 `ping` 报文

```bash {1}
iptables -F INPUT
iptables -I INPUT -i br0 -p icmp -j DROP
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 54 packets, 4185 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DROP       icmp --  br0    *       0.0.0.0/0            0.0.0.0/0
```

使用测试机 ping 一下:
```bash {1,5}
ping 10.211.55.19                                   
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
^C
--- 10.211.55.19 ping statistics ---
4 packets transmitted, 0 received, 100% packet loss, time 3000ms
```

查看 `INPUT` 链:
```bash {1,4}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 409 packets, 33105 bytes)
 pkts bytes target     prot opt in     out     source               destination
    4   336 DROP       icmp --  br0    *       0.0.0.0/0            0.0.0.0/0
```

`-i` 选项只适用于 `PREROUTING`、`INPUT`、`FORWARD` 这三个链，因为只有它们涉及流入网卡。
同理，`-o, --out-interface` 选项适用 `OUTPUT`、`FORWARD`、`POSTROUTING` 这三个链。

另外，`-i` 和 `-o` 都支持取反 `!` 操作，而且参数以 `+` 结尾时，表示以参数开头的网卡都能匹配到。

## 扩展匹配
除了基本匹配条件以为，还有很多扩展匹配条件。这些匹配条件基于各个匹配模块，使用 `-m, --match` 选项可以指定模块，然后就可以使用模块中的各种选项。

`tcp` 模块中包含了端口匹配条件：`[!] --source-port,--sport port[:port]`, `[!] --destination-port,--dport port[:port]`。

> 拒绝 来自 `10.211.55.9` 且目标端口为 22 的报文

```bash {1,2,3,6}
iptables -F INPUT
iptables -I INPUT -p tcp -m tcp -s 10.211.55.9 --dport 22 -j REJECT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 28 packets, 1932 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp dpt:22 reject-with icmp-port-unreachable
```

使用测试机 `ssh` 连接:
```bash {1,2}
ssh root@10.211.55.19                              
ssh: connect to host 10.211.55.19 port 22: Connection refused
```

查看 `INPUT` 链:
```bash {1,4}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 496 packets, 40260 bytes)
 pkts bytes target     prot opt in     out     source               destination
    1    60 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp dpt:22 reject-with icmp-port-unreachable
```

当使用 `-p` 选项时，会默认添加 `-m 协议名`。比如 `-p udp` 相当于 `-p udp -m udp`。

`--dport` 和 `--sport` 都支持端口范围。

> 拒绝 来自 `10.211.55.9` 且源端口范围 `30-40` 的报文

```bash {1,2,5}
iptables -I INPUT -p tcp -s 10.211.55.9 --sport 30:40 -j REJECT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 8 packets, 540 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp spts:30:40 reject-with icmp-port-unreachable
    1    60 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp dpt:22 reject-with icmp-port-unreachable
```

端口范围可以省略数字，比如 `8080:` 表示 `8080:65535`， `:3306` 表示 `0:3306`。

```bash {1,2,3,6,7}
iptables -I INPUT -p tcp -s 10.211.55.9 --sport 8080: -j REJECT
iptables -I INPUT -p tcp -s 10.211.55.9 --sport :3306 -j REJECT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 10 packets, 688 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp spts:0:3306 reject-with icmp-port-unreachable
    0     0 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp spts:8080:65535 reject-with icmp-port-unreachable
    0     0 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp spts:30:40 reject-with icmp-port-unreachable
    1    60 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            tcp dpt:22 reject-with icmp-port-unreachable
```
### multiport模块
`--dport` 和 `--sport` 只支持连续的端口范围，但不支持离散的端口范围。
这时候需要使用 `multiport` 模块的 
- `[!] --source-ports,--sports port[,port|,port:port]...`
- `[!] --destination-ports,--dports port[,port|,port:port]...`
- `[!] --ports port[,port|,port:port]...` 

选项来指定离散端口。其中 `--ports` 会匹配源端口和目标端口。

```bash {1,2,3,6}
iptables -F INPUT
iptables -I INPUT -p tcp -s 10.211.55.9 -m multiport --dports 22,23,80:88,9000 -j REJECT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 34 packets, 2248 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     tcp  --  *      *       10.211.55.9          0.0.0.0/0            multiport dports 22,23,80:88,9000 reject-with icmp-port-unreachable
```

::: warning 注意
`multiport` 模块只能结合 `tcp` 、 `udp` 、 `udplite` 、 `dccp` 和 `sctp` 协议使用。
且最多支持15个离散端口，其中范围端口算作两个端口。
:::
