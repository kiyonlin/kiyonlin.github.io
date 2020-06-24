---
title: 鸟哥Linux基础-基础指令和帮助
tag: []
date: 2017-01-06 09:15:10
updated: 2017-01-06 09:15:10
category:
---
原文[鸟哥的 Linux私房菜 第四章、首次登入與線上求助](http://linux.keyword.org/linux_basic/0160startlinux.php)  

## 基础命令
### 显示日期与时间的指令： date
```bash
[kiyon@study ~]$ date
2017年 01月 06日 星期五 09:24:21 CST
[kiyon@study ~]$ date +%Y/%m/%d
2017/01/06
[kiyon@study ~]$ date +%H:%M
09:24
```
### 显示日历的指令： cal
```bash
 #语法为   cal [month] [year]
 
[kiyon@study ~]$ cal
      一月 2017
日 一 二 三 四 五 六
 1  2  3  4  5  6  7
 8  9 10 11 12 13 14
15 16 17 18 19 20 21
22 23 24 25 26 27 28
29 30 31
[kiyon@study ~]$ cal 2017
                               2017

        一月                   二月                   三月
日 一 二 三 四 五 六   日 一 二 三 四 五 六   日 一 二 三 四 五 六
 1  2  3  4  5  6  7             1  2  3  4             1  2  3  4
 8  9 10 11 12 13 14    5  6  7  8  9 10 11    5  6  7  8  9 10 11
15 16 17 18 19 20 21   12 13 14 15 16 17 18   12 13 14 15 16 17 18
22 23 24 25 26 27 28   19 20 21 22 23 24 25   19 20 21 22 23 24 25
29 30 31               26 27 28               26 27 28 29 30 31

        四月                   五月                   六月
日 一 二 三 四 五 六   日 一 二 三 四 五 六   日 一 二 三 四 五 六
                   1       1  2  3  4  5  6                1  2  3
 2  3  4  5  6  7  8    7  8  9 10 11 12 13    4  5  6  7  8  9 10
 9 10 11 12 13 14 15   14 15 16 17 18 19 20   11 12 13 14 15 16 17
16 17 18 19 20 21 22   21 22 23 24 25 26 27   18 19 20 21 22 23 24
23 24 25 26 27 28 29   28 29 30 31            25 26 27 28 29 30
30
 ....(以下省略)....
 
 [kiyon@study ~]$ cal 10 2017
       十月 2017
 日 一 二 三 四 五 六
  1  2  3  4  5  6  7
  8  9 10 11 12 13 14
 15 16 17 18 19 20 21
 22 23 24 25 26 27 28
 29 30 31
 
 [kiyon@study ~]$ cal 13 2017
 cal: illegal month value: use 1-12
```
### 简单好用的计算机： bc
```bash
## + 加法
## - 减法
## * 乘法
## / 除法
## ^ 指数
## % 余数
[kiyon@study ~]$ bc
bc 1.06.95
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006 Free Software Foundation, Inc.
This is free software with ABSOLUTELY NO WARRANTY.
For details type 'warranty'.
1+2+3+4   <==只有加法时
10
7-8+3
2
10*52
520
10%3      <==计算余数
1
10^2
100
10/100
0
#如果要输出小数点下位数，那么就必须要执行scale=number ，那个number就是小数点位数
scale=3     
1/3
.333
340/2349
.144
quit      <==离开bc这个计算器
```
### man page
man是manual(操作说明)的简写
```bash
[kiyon@study ~]$ man date
DATE(1)                                                                       User Commands                                                                      DATE(1)

NAME
       date - print or set the system date and time

SYNOPSIS
       date [OPTION]... [+FORMAT]
       date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]

DESCRIPTION
       Display the current time in the given FORMAT, or set the system date.

       Mandatory arguments to long options are mandatory for short options too.
```
在查询资料的后面的数字是有意义的,DATE(1) 的1表示一般使用者可使用的指令。

|代号	|代表内容|
|:------|:------|
|1:star:️	|**使用者在shell环境中可以操作的指令或可执行档**|
|2	|系统核心可呼叫的函数与工具等|
|3	|一些常用的函数(function)与函式库(library)，大部分为C的函式库(libc)|
|4	|设备文件的说明，通常在/dev下的设备|
|5:star:️	|**配置文件或者是某些文件的格式**|
|6	|游戏(games)|
|7	|惯例与协议等，例如Linux文件系统、网络协议、ASCII code等等的说明|
|8:star:️	|**系统管理员可用的管理指令**|
|9	|跟kernel有关的文件|

上表中的1, 5, 8这三个号码特别重要！
man page的内容也分成好几个部分来加以介绍该指令。

|代号	|内容说明|
|:------|:------|
|NAME	|简短的指令、资料名称说明|
|SYNOPSIS	|简短的指令下达语法(syntax)简介|
|DESCRIPTION	|较为完整的说明，这部分最好仔细看看！|
|OPTIONS	|针对SYNOPSIS 部分中，有列举的所有可用的选项说明|
|COMMANDS	|当这个程序(软件)在执行的时候，可以在此程序(软件)中下达的指令|
|FILES	|这个程序或资料所使用或参考或连结到的某些文件|
|SEE ALSO	|可以参考的，跟这个指令或资料有相关的其他说明！|
|EXAMPLE	|一些可以参考的范例|

查询建议：
1. 先察看NAME的项目，约略看一下这个资料的意思；
2. 再详看一下DESCRIPTION，这个部分会提到很多相关的资料与使用时机，从这个地方可以学到很多小细节；
3. 而如果这个指令其实很熟悉了(例如上面的date)，那么主要就是查询关于OPTIONS的部分了！可以知道每个选项的意义，这样就可以下达比较细致的指令内容！
4. 最后，再看一下跟这个资料有关的还有哪些东西可以使用的？举例来说，上面的SEE ALSO就告知我们还可以利用『info coreutils date』来进一步查阅资料；
5. 某些说明内容还会列举有关的文件(FILES 部分)来提供我们参考！这些都是很有帮助的！

在man page常用的按键

|按键	|进行工作|
|:------|:------|
|空白键	|向下翻一页|
|[Page Down]	|向下翻一页|
|[Page Up]	|向上翻一页|
|[Home]	|去到第一页|
|[End]	|去到最后一页|
|/string	|向『下』查找string 这个字串，如果要查找keyword的话，就输入/keyword|
|?string	|向『上』查找string 这个字串|
|n, N	|利用/ 或? 来查找字串时，可以用n 来继续下一个查找(不论是/ 或?) ，可以利用N 来进行『反向』查找。举例来说，我以/keyword 查找keyword 字串， 那么可以n 继续往下查询，用N 往上查询。若以?keyword 向上查询keyword 字串， 那我可以用n 继续『向上』查询，用N 反向查询。|
|q	|结束这次的man page|

