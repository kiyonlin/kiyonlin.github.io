---
title: iptables详解-3-规则管理
tag: [iptables]
category: [iptables]
date: 2018-08-15 14:19:31
comment: true
---

本章学习如何对 `iptables` 规则进行管理。
::: warning 注意
本系列测试环境为 `centos 7`，`iptables` 版本 `1.4.21`。
:::
<!-- more -->

## 准备工作
iptables 中最常用的匹配条件就是源ip，源端口，目标ip，目标端口等。最常用的动作有 `ACCEPT`、`DROP`、`REJECT`等。

### 初始化
让我们先清空系统提供的默认规则，准备一个初始化环境：
```bash {1,2}
iptables -F INPUT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 298 packets, 30644 bytes)
 pkts bytes target     prot opt in     out     source               destination
```

因为 `filter` 表的 `INPUT` 链默认策略为 `ACCEPT` ，所以所有到达本机的报文都会通过。

### 测试机
准备另一台测试机，接下来的规则都会针对这台测试机而做：
```bash {1}
ping 10.211.55.19
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
64 bytes from 10.211.55.19: icmp_seq=1 ttl=64 time=0.458 ms
64 bytes from 10.211.55.19: icmp_seq=2 ttl=64 time=0.268 ms
64 bytes from 10.211.55.19: icmp_seq=3 ttl=64 time=0.266 ms
^C
--- 10.211.55.19 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 0.266/0.330/0.458/0.092 ms
```

## 增加规则

> 添加一条规则，拒绝所有来自 `10.211.55.9` 的报文

```bash {1,2}
iptables -t filter -I INPUT -s 10.211.55.9 -j DROP
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 93 packets, 8970 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```

再使用测试机 `ping` 一下，会发现不通：
```bash {1,5}
ping 10.211.55.19                                      
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
^C
--- 10.211.55.19 ping statistics ---
11 packets transmitted, 0 received, 100% packet loss, time 10003ms
```

但是目标机器的报文量会增加(11个报文，总大小924b)：
```bash {1,4}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 445 packets, 48402 bytes)
 pkts bytes target     prot opt in     out     source               destination
   11   924 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```


> 追加一条规则，接受所有来自 `10.211.55.9` 的报文

```bash {2,6}
iptables -A INPUT -s 10.211.55.9 -j ACCEPT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 30 packets, 2072 bytes)
 pkts bytes target     prot opt in     out     source               destination
   11   924 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
    0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
```

再次用测试机 `ping`，还是不通:
```bash {1,5}
ping 10.211.55.19                                      
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
^C
--- 10.211.55.19 ping statistics ---
5 packets transmitted, 0 received, 100% packet loss, time 4001ms
```

查看现在规则情况:
```bash {4,5}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 904 packets, 100K bytes)
 pkts bytes target     prot opt in     out     source               destination
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
    0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
```

我们可以看到第一条规则报文量更新了，但是第二条规则并未收到任何数据。

> 添加一条规则，接受所有来自 `10.211.55.9` 的报文

```bash {1,2,5}
iptables -I INPUT -s 10.211.55.9 -j ACCEPT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 92 packets, 8870 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
    0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
```

现在第一条规则接受所有来自 `10.211.55.9` 的报文，再使用测试机 `ping` 一下：
```bash {1,7}
ping 10.211.55.19                                      
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
64 bytes from 10.211.55.19: icmp_seq=1 ttl=64 time=0.367 ms
64 bytes from 10.211.55.19: icmp_seq=2 ttl=64 time=0.296 ms
64 bytes from 10.211.55.19: icmp_seq=3 ttl=64 time=0.278 ms
^C
--- 10.211.55.19 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2001ms
rtt min/avg/max/mdev = 0.278/0.313/0.367/0.043 ms
```

又可以 ping 通了，而且第一条规则的报文数据也发生了改变：
```bash {1,4}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 15096 packets, 1693K bytes)
 pkts bytes target     prot opt in     out     source               destination
    3   252 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
    0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
```

从这里，我们可以看出 `iptables` 的工作机制：只要匹配了一条规则，就不会再去匹配接下来的规则。

> 在指定顺序规则前添加一条规则

```bash {1,2,6}
iptables -I INPUT 2 -s 10.211.55.9 -j DROP
iptables -nvL INPUT --line
Chain INPUT (policy ACCEPT 236 packets, 23798 bytes)
num   pkts bytes target     prot opt in     out     source               destination
1        3   252 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
2        0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
3       16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
4        0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
```

## 删除规则
删除规则有两种方式：
- 根据序号删除
- 根据匹配条件删除

> 根据序号删除指定规则

先查看一下目前所有的规则：
```bash {1}
iptables -nvL INPUT --line
Chain INPUT (policy ACCEPT 236 packets, 23798 bytes)
num   pkts bytes target     prot opt in     out     source               destination
1        3   252 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
2        0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
3       16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
4        0     0 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
```

删除第4条规则，命令如下:
```bash {1,2}
iptables -D INPUT 4
iptables -nvL INPUT --line
Chain INPUT (policy ACCEPT 108 packets, 8771 bytes)
num   pkts bytes target     prot opt in     out     source               destination
1        3   252 ACCEPT     all  --  *      *       10.211.55.9          0.0.0.0/0
2        0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
3       16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```

> 根据匹配条件进行删除

我们删除 `target` 是 `ACCEPT` 的规则：
```bash {1}
iptables -D INPUT -s 10.211.55.9 -j ACCEPT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 79 packets, 5905 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```

> 删除所有规则

使用 `-F` 选项即可，我们在准备工作中已经操作过。

## 修改规则
使用 `-R(--replace)` 选项替换指定编号规则内容。
> 修改规则， `target` 从 `DROP` 改为 `REJECT`，源IP不变
```bash {1,5}
iptables -R INPUT 1 -s 10.211.55.9 -j REJECT
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 282 packets, 24058 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     all  --  *      *       10.211.55.9          0.0.0.0/0            reject-with icmp-port-unreachable
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```
::: warning 注意
若不指定 `-s` 内容，则默认会被设置为 `0.0.0.0/0`，这可能会导致严重错误（例如 `DROP`  或者 `REJECT` 了所有报文，那么当前连接也会断开）。所以使用 `-R` 命令可以理解为替换当前顺序的规则的所有内容，这些内容必须写全，而不能写一部分；也可以理解为先删除这条指定的规则，再在同一位置插入新规则。
:::

### `DROP` 和 `REJECT` 的区别
将 `DROP` 替换为 `REJECT` 后，我们使用测试机 `ping` 一下，看看两者的区别：
```bash {1,3,8}
ping 10.211.55.19                             
PING 10.211.55.19 (10.211.55.19) 56(84) bytes of data.
From 10.211.55.19 icmp_seq=1 Destination Port Unreachable
From 10.211.55.19 icmp_seq=2 Destination Port Unreachable
From 10.211.55.19 icmp_seq=3 Destination Port Unreachable
^C
--- 10.211.55.19 ping statistics ---
3 packets transmitted, 0 received, +3 errors, 100% packet loss, time 2000ms
```
我们可以看到，`REJECT` 会给出明确的回应，而不像 `DROP` 体现为毫无反应。

此时我们再看看规则情况，第一条规则报文量也发生了改变，说明匹配到了这条规则：
```bash {1,4}
iptables -nvL INPUT
Chain INPUT (policy ACCEPT 2844 packets, 248K bytes)
 pkts bytes target     prot opt in     out     source               destination
    3   252 REJECT     all  --  *      *       10.211.55.9          0.0.0.0/0            reject-with icmp-port-unreachable
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0
```

### 修改默认策略
使用 `-P(--policy)` 选项修改链的默认策略，当链中没有规则，或者所有规则都未匹配时，则使用默认规则：
```bash {1,2,8}
iptables -P FORWARD DROP
iptables -nvL
Chain INPUT (policy ACCEPT 112 packets, 8478 bytes)
 pkts bytes target     prot opt in     out     source               destination
    3   252 REJECT     all  --  *      *       10.211.55.9          0.0.0.0/0            reject-with icmp-port-unreachable
   16  1344 DROP       all  --  *      *       10.211.55.9          0.0.0.0/0

Chain FORWARD (policy DROP 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 ACCEPT     all  --  *      virbr0  0.0.0.0/0            192.168.122.0/24     ctstate RELATED,ESTABLISHED
    0     0 ACCEPT     all  --  virbr0 *       192.168.122.0/24     0.0.0.0/0
    0     0 ACCEPT     all  --  virbr0 virbr0  0.0.0.0/0            0.0.0.0/0
    0     0 REJECT     all  --  *      virbr0  0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable
    0     0 REJECT     all  --  virbr0 *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable

Chain OUTPUT (policy ACCEPT 80 packets, 7108 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 ACCEPT     udp  --  *      virbr0  0.0.0.0/0            0.0.0.0/0            udp dpt:68
```

## 保存规则
通常情况下，我们对 `iptables` 做的操作都是临时的。就好比在 `word` 中写了一段话，假如强制关闭了 `word` 或者重启了电脑，那么刚才所些的那段话也会消失。当我们保存成 `word` 文件后， 那段话就不会丢失。同理，设置 `iptables` 后也需要保存。

因为在 `centos 7` 中，默认的防火墙服务是 `firewalld` ，而不是 `iptables` 。所以我们需要安装 `iptables` 服务，替换默认防火墙。
```bash
yum install -y iptables-services
# 关闭 firewalld 服务
systemctl stop firewalld
# 禁止 firewalld 服务开机启动
systemctl disable firewalld
# 开启 iptables 服务
systemctl start iptables
# 设置 iptables 服务开机启动
systemctl enable iptables
```

安装 iptables 服务成功后，即可保存规则：
```bash
service iptables save
iptables: Saving firewall rules to /etc/sysconfig/iptables:[  OK  ]
```

我们可以看到，所有的规则被写入了 `/etc/sysconfig/iptables` 文件。

这里还有一种手动保存方法，当我们运行 `iptables-save` 命令时，会有将所有当前的规则输出：
```bash{1}
iptables-save
# Generated by iptables-save v1.4.21 on Fri Aug 17 16:51:10 2018
*security
:INPUT ACCEPT [2409:202386]
...
*raw
:PREROUTING ACCEPT [2413:203008]
...
*mangle
:PREROUTING ACCEPT [2413:203008]
...
*nat
:PREROUTING ACCEPT [4:622]
...
*filter
...
-A INPUT -s 10.211.55.9/32 -j REJECT --reject-with icmp-port-unreachable
-A INPUT -s 10.211.55.9/32 -j DROP
...
COMMIT
# Completed on Fri Aug 17 16:51:10 2018
```

所以只要将输出重定向到 `/etc/sysconfig/iptables` 文件，也可以完成保存操作:
```bash
iptables-save > /etc/sysconfig/iptables
```

同时可以使用 `iptables-restore` 命令恢复 `iptables` 规则，现有规则会被覆盖:
```bash
iptables-restore < /etc/sysconfig/iptables
```