---
title: 鸟哥Linux基础-文件与目录管理
tag:
  - Linux
category:
  - 技术
  - linux
date: 2017-01-07 09:20:36
updated: 2017-01-07 09:20:36
---
原文[鸟哥的 Linux私房菜 第六章、Linux 文件与目录管理](http://linux.vbird.org/linux_basic/0220filemanager.php#import)  
文件／档 数据 截取 检测 字符 磁盘 程序 查找 硬盘 软件
文件    数据 截取 检测 字符 磁盘 程序 查找 硬盘 软件

🔯 本章主要内容：在不同的目录间变换、 建立与删除目录、建立与删除文件，还有寻找文件、查阅文件内容等等。

# 复制、删除、移动：cp、rm、mv
## cp(复制文件或目录)
cp 除了单纯的复制之外，还可以建立快捷方式，比对两文件的新旧而予以更新， 以及复制整个目录等等的功能。
不同身份者执行这个指令会有不同的结果产生，尤其是那个-a, -p的选项， 对于不同身份来说，差异则非常的大。
### cp的选项与参数：
cp [-adfilprsu]源文件(source)目标文件(destination) 
cp [options] source1 source2 source3 .... directory 
- -a ：相当于-dr --preserve=all的意思，至于dr请参考下列说明；(⭐常用)
- -d ：若源文件为链接的属性(link file)，则复制链接属性而非文件本身；
- -f ：为强制(force)的意思，若目标文件已经存在且无法开启，则移除后再尝试一次；
- -i ：若目标文件(destination)已经存在时，在覆盖时会先询问动作的进行(⭐常用)
- -l ：进行硬链接(hard link)的链接建立，而非复制文件本身；
- -p ：连同文件的属性(权限、用户、时间)一起复制过去，而非使用默认属性(⭐备份常用)；
- -r ：递回持续复制，用于目录的复制行为；(⭐常用)
- -s ：复制成为符号链接(symbolic link)，亦即『快捷方式』文件；
- -u ：destination 比source 旧才更新destination，或destination 不存在的情况下才复制。
- --preserve=all ：除了-p 的权限相关参数外，还加入SELinux 的属性, links, xattr 等也复制了。

⭐⭐最后需要注意的，如果源文件有两个以上，则最后一个目的文件一定要是『目录』才行！

```bash
# 范例一：用root身份，将家目录下的.bashrc复制到/tmp下，并更名为bashrc 
[root@study tmp]# cp ~/.bashrc /tmp/bashrc
[root@study tmp]# cp -i ~/.bashrc /tmp/bashrc
cp：是否覆盖"/tmp/bashrc"？ n
#重复作两次动作，由于/tmp底下已经存在bashrc了，加上-i选项后，
# 则在覆盖前会询问使用者是否确定！可以按下n 或者y 来二次确认呢！

# 范例二：变换目录到/tmp，并将/var/log/wtmp复制到/tmp且观察属性：
[root@study tmp]# cd /tmp/
# 想要复制到目前的目录，最后的.不要忘 
[root@study tmp]# cp /var/log/wtmp .
[root@study tmp]# ls -l /var/log/wtmp wtmp
-rw-rw-r--. 1 root utmp 6912 1月   6 21:36 /var/log/wtmp
-rw-r--r--. 1 root root 6912 1月   6 22:24 wtmp
# 在不加任何选项的情况下，文件的某些属性/权限会改变；
# 这是个很重要的特性！连文件建立的时间也不一样了！
# 那如果你想要将文件的所有特性都一起复制过来该怎办？可以加上-a ！如下所示：

[root@study tmp]# cp -a /var/log/wtmp wtmp_2
[root@study tmp]# ls -l /var/log/wtmp wtmp_2
-rw-rw-r--. 1 root utmp 6912 1月   6 21:36 /var/log/wtmp
-rw-rw-r--. 1 root utmp 6912 1月   6 21:36 wtmp_2
# 整个数据特性完全一模一样！
```
在默认的条件中， cp的源文件与目的文件的权限是不同的，目的文件的拥有者通常会是指令操作者本身。由于具有这个特性，因此当我们在进行备份的时候，某些需要特别注意的特殊权限文件， 例如密码文件(/etc/shadow) 以及一些配置文件，就不能直接以cp 来复制，而必须要加上-a 或者是-p 等等可以完整复制文件权限的选项才行！

```bash

# 范例三：复制/etc/这个目录下的所有内容到/tmp底下 
[root@study tmp]# cp /etc/ /tmp
cp: 略过目录"/etc/"    # 如果是目录则不能直接复制，要加上-r的选项 
[root@study tmp]# cp -r /etc/ /tmp 
# 还是要再次的强调喔！-r是可以复制目录，但是，文件与目录的权限可能会被改变
# 所以，也可以利用『 cp -a /etc /tmp 』来下达指令！尤其是在备份的情况下！

# 范例四：将范例一复制的bashrc建立一个链接(symbolic link) 
[root@study tmp]# ls -l bashrc 
-rw-r--r--. 1 root root 176 1月   6 22:23 bashrc   # 先观察一下文件情况 
[root@study tmp]# cp -s bashrc bashrc_slink 
[root@study tmp]# cp -l bashrc bashrc_hlink 
[root@study tmp]# 
 -rw-r--r--. 2 root root 176 1月   6 22:23 bashrc        # 与原始文件不太一样了！
 -rw-r--r--. 2 root root 176 1月   6 22:23 bashrc_hlink
 lrwxrwxrwx. 1 root root   6 1月   6 22:29 bashrc_slink -> bashrc
 
# 范例五：若~/.bashrc比/tmp/bashrc新才复制过来 
[root@study tmp]# cp -u ~/.bashrc /tmp/bashrc 
#这个-u的特性，是在目标文件与来源文件有差异时，才会复制的。
# 所以，比较常被用于『备份』的工作当中

# 范例六：将范例四造成的bashrc_slink复制成为bashrc_slink_1与bashrc_slink_2 
[root@study tmp]# cp bashrc_slink bashrc_slink_1 
[root@study tmp]# cp -d bashrc_slink bashrc_slink_2 
[root@study tmp]# 
-rw-r--r--. 2 root root 176 1月   6 22:23 bashrc
lrwxrwxrwx. 1 root root   6 1月   6 22:29 bashrc_slink -> bashrc
-rw-r--r--. 1 root root 176 1月   6 22:33 bashrc_slink_1             # 与原始文件相同
lrwxrwxrwx. 1 root root   6 1月   6 22:33 bashrc_slink_2 -> bashrc   # 是链接！
# 原本复制的是链接，但是却将链接的实际文件复制过来了
# 也就是说，如果没有加上任何选项时，cp复制的是原始文件，而非链接的属性！
# 若要复制链接的属性，就得要使用-d 的选项了！如bashrc_slink_2 所示。

# 范例七：将家目录的.bashrc及.bash_history复制到/tmp底下 
[root@study tmp]# cp ~/.bashrc ~/.bash_history /tmp 
#可以将多个数据一次复制到同一个目录去！最后面一定是目录！
```

总之，由于cp 有种种的文件属性与权限的特性，所以，在复制时，你必须要清楚的了解到：
- 是否需要完整的保留来源文件的资讯？
- 来源文件是否为链接(symbolic link file)？
- 源文件是否为特殊的文件，例如FIFO, socket 等？
- 源文件是否为目录？

# 文件内容查找
- cat 由第一行开始显示文件内容
- tac 从最后一行开始显示，可以看出tac 是cat 的倒着写！
- nl 显示的时候，顺道输出行号！
- more 一页一页的显示文件内容
- less 与more 类似，但是比more 更好的是，他可以往前翻页！
- head 只看头几行
- tail 只看末尾几行
- od 以二进制的方式读取文件内容！

## 直接查看文件内容
直接查阅一个文件的内容可以使用cat/tac/nl 这几个指令！
### cat (concatenate)
cat 是Concatenate (连续) 的简写， 主要的功能是将一个文件的内容连续的印出在屏幕上面！
格式： cat [-AbEnTv] 文件
选项与参数： 
- -A ：相当于-vET 的整合选项，可列出一些特殊字符而不是空白而已；
- -b ：列出行号，仅针对非空白行做行号显示，空白行不标行号！
- -E ：将结尾的断行字符$ 显示出来；
- -n ：列印出行号，连同空白行也会有行号，与-b 的选项不同；
- -T ：将[tab] 按键以^I 显示出来；
- -v ：列出一些看不出来的特殊字符

```bash
# 范例一：查看/etc/issue这个文件的内容 
[root@study ~]# cat /etc/issue
\S
Kernel \r on an \m

# 范例二：承上题，如果还要加印行号呢？
[root@study ~]# cat -n /etc/issue
     1 \S
     2 Kernel \r on an \m
     3
# 所以这个文件有三行！这对于大文件要找某个特定的行时，有点用处！
# 如果不想要编排空白行的行号，可以使用『cat -b /etc/issue』，自己测试看看：

# 范例三：将/etc/man_db.conf的内容完整的显示出来(包含特殊字符) 
[root@study ~]# cat -A /etc/man_db.conf 
# $ 
# ....(中间省略).. .. 
MANPATH_MAP ^I /bin ^I^I^I /usr/share/man $ 
MANPATH_MAP ^I /usr/bin ^I^I /usr/share/man $ 
MANPATH_MAP ^I /sbin ^I^I^I / usr/share/man $ 
MANPATH_MAP ^I /usr/sbin ^I^I /usr/share/man $ 
# .....(底下省略)..... 
```

### tac (反向列示)
功能就跟cat相反， cat是由『第一行到最后一行连续显示在屏幕上』，而tac则是『 由最后一行到第一行反向在屏幕上显示出来』
```bash
[root@study ~]# tac /etc/issue

Kernel \r on an \m
\S
# 与刚刚上面的范例一比较，是由最后一行先显示！
```

### nl (添加行号列印)
nl 可以将输出的文件内容自动的加上行号！其默认的结果与cat -n 有点不太一样， nl 可以将行号做比较多的显示设计，包括位数与是否自动补齐0 等等的功能呢。

格式：nl [-bnw] 文件

选项与参数：
- -b ：指定行号指定的方式，主要有两种：
    - -ba ：表示不论是否为空行，也同样列出行号(类似cat -n)；
    - -bt ：如果有空行，空的那一行不要列出行号(默认值)；
- -n ：列出行号表示的方法，主要有三种：
    - -n ln ：行号在屏幕的最左方显示；
    - -n rn ：行号在自己栏位的最右方显示，且不加0 ；
    - -n rz ：行号在自己栏位的最右方显示，且加0 ；
- -w ：行号栏位的占用的字符数。

```bash
# 范例一：用nl列出/etc/issue的内容 
[root@study ~]# nl /etc/issue
     1 \S
     2 Kernel \r on an \m

# 注意看，这个文件其实有三行，第三行为空白(没有任何字符)，
# 因为他是空白行，所以nl 不会加上行号喔！如果确定要加上行号，可以这样做：

[root@study ~]# nl -ba /etc/issue
     1 \S
     2 Kernel \r on an \m
     3
# 行号加上来啰～那么如果要让行号前面自动补上0 呢？可这样

[root@study ~]# nl -ba -n rz /etc/issue
000001 \S
000002 Kernel \r on an \m
000003
# 嘿嘿！自动在自己栏位的地方补上0 了～默认栏位是六位数，如果想要改成3 位数？

[root@study ~]# nl -ba -n rz -w 3 /etc/issue
001 \S
002 Kernel \r on an \m
003
# 变成仅有3 位数了
```

## 可翻页查看
### more (一页一页翻动)
```bash
[root@study ~]# more /etc/man_db.conf
#
#
# This file is used by the man-db package to configure the man and cat paths.
# It is also used to provide a manpath for those without one by examining
# their PATH environment variable. For details see the manpath(5) man page.
#
#.....(中间省略)..... 
--More--(28%)   # 重点在这一行喔！你的游标也会在这里等待你的指令
```

如果more 后面接的文件内容行数大于屏幕输出的行数时， 就会出现类似上面的图示。重点在最后一行，最后一行会显示出目前显示的百分比， 而且还可以在最后一行输入一些有用的指令:
- 空白键(space)：代表向下翻一页；
- Enter ：代表向下翻『一行』；
- /字串 ：代表在这个显示的内容当中，向下查找『字串』这个关键字；
- :f ：立刻显示出文件名以及目前显示的行数；
- q ：代表立刻离开more ，不再显示该文件内容。
- b 或[ctrl]-b ：代表往回翻页，不过这动作只对文件有用，对管线无用。

### less (一页一页翻动)
```bash
[root@study ~]# less /etc/man_db.conf
#
#
# This file is used by the man-db package to configure the man and cat paths.
# It is also used to provide a manpath for those without one by examining
# their PATH environment variable. For details see the manpath(5) man page.
#
#.....(中间省略)..... 
: # 这里可以等待你输入指令！   
```
- 
基本上，可以输入的指令有：
- 空白键 ：向下翻动一页；
- [pagedown]：向下翻动一页；
- [pageup] ：向上翻动一页；
- /字串 ：向下查找『字串』的功能；
- ?字串 ：向上查找『字串』的功能；
- n ：重复前一个查找(与/ 或? 有关！)
- N ：反向的重复前一个查找(与/ 或? 有关！)
- g ：前进到这个数据的第一行去；
- G ：前进到这个数据的最后一行去(注意大小写)；
- q ：离开less 这个程序；

## 数据截取
我们可以将输出的数据作一个最简单的截取，那就是取出文件前面几行(head) 或取出后面几行(tail) 文字的功能。不过，要注意的是， head 与tail 都是以『行』为单位来进行数据截取的！
### head (取出前面几行)
格式： head [-n number] 文件
选项与参数：
- -n ：后面接数字，代表显示几行的意思

```bash
[root@study ~]# head /etc/man_db.conf 
#默认的情况中，显示前面十行！若要显示前20行，就得要这样： 
[root@study ~]# head -n 20 /etc/man_db.conf

# 范例：如果后面100行的数据都不列印，只列印/etc/man_db.conf的前面几行，该如何是好？
[root@study ~]# head -n -100 /etc/man_db.conf
```
head 的英文意思就是『头』啦，那么这个东西的用法自然就是显示出一个文件的前几行！若没有加上-n 这个选项时，默认只显示十行，若只要一行呢？那就加入『 head -n 1 filename 』即可！

另外那个-n 选项后面的参数较有趣，如果接的是负数，例如上面范例的-n -100时，代表列前的所有行数， 但不包括后面100行。举例来说CentOS 7.1 的/etc/man_db.conf 共有131行，则上述的指令『head -n -100 /etc/man_db.conf』 就会列出前面31行，后面100行不会列印出来了。

### tail (取出后面几行)
格式： tail [-n number]文件
选项与参数：
- -n ：后面接数字，代表显示几行的意思
- -f ：表示持续检测后面所接的文件名，要等到按下[ctrl]-c才会结束tail的检测

```bash
[root@study ~]# tail /etc/man_db.conf 
#默认的情况中，显示最后的十行！若要显示最后的20行，就得要这样： 
[root@study ~]# tail -n 20 /etc/man_db.conf

# 范例一：如果不知道/etc/man_db.conf有几行，却只想列出100行以后的数据时？
[root@study ~]# tail -n +100 /etc/man_db.conf

# 范例二：持续检测/var/log/messages的内容 
[root@study ~]# tail -f /var/log/messages 
  #[ctrl]-c之后才会离开tail这个指令的检测！
```
有head 自然就有tail ( 尾巴) ！没错！这个tail 的用法跟head 的用法差不多类似，只是显示的是后面几行就是了！默认也是显示十行，若要显示非十行，就加 -n number 的选项即可。

至于范例二中，由于/var/log/messages随时会有数据写入，你想要让该文件有数据写入时就立刻显示到屏幕上， 就利用-f 这个选项，他可以一直检测/var/log/messages这个文件，新写入的数据都会被显示到屏幕上。直到你按下[ctrl]-c才会离开tail的检测喔！由于messages 必须要root 权限才能看，所以该范例得要使用root 来查询！

## 非纯文字文件： od
格式： od [-t TYPE] 文件
选项或参数：
- -t ：后面可以接各种『类型(TYPE)』的输出，例如：
    - a ：利用默认的字符来输出；
    - c ：使用ASCII 字符来输出
    - d[size] ：利用十进位(decimal)来输出数据，每个整数占用size bytes ；
    - f[size] ：利用浮点数值(floating)来输出数据，每个数占用size bytes ；
    - o[size] ：利用八进位(octal)来输出数据，每个整数占用size bytes ；
    - x[size] ：利用十六进位(hexadecimal)来输出数据，每个整数占用size bytes ；

```bash
# 范例一：请将/usr/bin/passwd的内容使用ASCII方式来展现！
[root@study ~]# od -tc /usr/bin/passwd
0000000 177 ELF 002 001 001 \0 \0 \0 \0 \0 \0 \0 \0 \0
0000020 003 \0 > \0 001 \0 \0 \0 364 3 \0 \0 \0 \0 \0 \0
0000040 @ \0 \0 \0 \0 \0 \0 \0 xe \0 \0 \0 \0 \0 \0
0000060 \0 \0 \0 \0 @ \0 8 \0 \t \0 @ \0 035 \0 034 \0
0000100 006 \0 \0 \0 005 \0 \0 \0 @ \0 \0 \0 \0 \0 \0 \0
#.....(后面省略)....
# 最左边第一栏是以8 进位来表示bytes数。以上面范例来说，第二栏0000020代表开头是
# 第16 个byes (2x8) 的内容之意。

# 范例二：请将/etc/issue这个文件的内容以8进位列出储存值与ASCII的对照表 
[root@study ~]# od -t oCc /etc/issue
0000000 134 123 012 113 145 162 156 145 154 040 134 162 040 157 156 040
          \ S \n K ernel \ ron
0000020 141 156 040 134 155 012 012
          an \ m \n \n
0000027
# 如上所示，可以发现每个字符可以对应到的数值为何！要注意的是，该数值是8 进位喔！
# 例如S 对应的记录数值为123 ，转成十进位：1x8^2+2x8+3=83。
```

## 修改文件时间或创建新文件： touch
每个文件在linux底下都会记录许多的时间参数，其实是有三个主要的变动时间：
- modification time (mtime)：
当该文件的『内容数据』变更时，就会更新这个时间！内容数据指的是文件的内容，而不是文件的属性或权限！
- status time (ctime)：
当该文件的『状态(status)』改变时，就会更新这个时间，举例来说，像是权限与属性被更改了，都会更新这个时间。 
- access time (atime)：
当『该文件的内容被读取』时，就会更新这个读取时间(access)。举例来说，我们使用cat去读取/etc/man_db.conf ，就会更新该文件的atime了。

```bash
[kiyon@study ~]$ date; ls -l /etc/man_db.conf ; ls -l --time=atime /etc/man_db.conf ; ls -l --time=ctime /etc/man_db.conf
2017年 01月 07日 星期六 01:31:49 CST                              # 目前的时间啊！
-rw-r--r--. 1 root root 5171 6月  10 2014 /etc/man_db.conf      # 在2014/06/10建立的内容(mtime) 
-rw-r--r--. 1 root root 5171 1月   6 09:11 /etc/man_db.conf     # 在2017/01/06读取过内容(atime) 
-rw-r--r--. 1 root root 5171 1月   5 17:00 /etc/man_db.conf     # 在2017/01/05更新过状态(ctime)
```
在默认的情况下，ls显示出来的是该文件的mtime ，也就是这个文件的内容上次被更动的时间。

### touch
格式： touch [-acdmt]文件
选项与参数：
- -a ：仅修改access time；
- -c ：仅修改文件的时间，若该文件不存在则不建立新文件；
- -d ：后面可以接想要修改的日期而不用目前的日期，也可以使用--date="日期或时间"
- -m ：仅修改mtime ；
- -t ：后面可以接想要修改的时间而不用目前的时间，格式为[YYYYMMDDhhmm]

```bash
# 范例一：新建一个空的文件并观察时间 
[kiyon@study ~]$ cd /tmp
[kiyon@study tmp]$ touch testtouch
[kiyon@study tmp]$ ls -l testtouch
-rw-rw-r--. 1 kiyon kiyon 0 1月   7 01:39 testtouch
#这个文件的大小是0！在默认的状态下，如果touch后面有接文件，
# 则该文件的三个时间(atime/ctime/mtime) 都会更新为目前的时间。若该文件不存在，
# 则会主动的建立一个新的空的文件喔！例如上面这个例子！
 
# 范例二：将~/.bashrc复制成为bashrc，假设复制完全的属性，查看其日期 
[kiyon@study tmp]$ cp -a ~/.bashrc bashrc
[kiyon@study tmp]$ date; ll bashrc; ll --time=atime bashrc; ll --time=ctime bashrc
2017年 01月 07日 星期六 01:42:09 CST                  # 这是目前的时间
-rw-r--r--. 1 kiyon kiyon 262 1月   6 15:57 bashrc  # 这是mtime
-rw-r--r--. 1 kiyon kiyon 262 1月   6 21:34 bashrc  # 这是atime  
-rw-r--r--. 1 kiyon kiyon 262 1月   7 01:41 bashrc  # 这是ctime

# 范例三：修改案例二的bashrc文件，将日期调整为两天前 
[kiyon@study tmp]$ touch -d "2 days ago" bashrc
[kiyon@study tmp]$ date; ll bashrc; ll --time=atime bashrc; ll --time=ctime bashrc
2017年 01月 07日 星期六 01:45:33 CST
-rw-r--r--. 1 kiyon kiyon 262 1月   5 01:44 bashrc
-rw-r--r--. 1 kiyon kiyon 262 1月   5 01:44 bashrc
-rw-r--r--. 1 kiyon kiyon 262 1月   7 01:44 bashrc

# 范例四：将上个范例的bashrc日期改为2014/06/15 2:02 
[kiyon@study tmp]$ touch -t 201701010202 bashrc
[kiyon@study tmp]$ date; ll bashrc; ll --time=atime bashrc; ll --time=ctime bashrc
2017年 01月 07日 星期六 01:47:48 CST
-rw-r--r--. 1 kiyon kiyon 262 1月   1 02:02 bashrc
-rw-r--r--. 1 kiyon kiyon 262 1月   1 02:02 bashrc
-rw-r--r--. 1 kiyon kiyon 262 1月   7 01:47 bashrc
# 日期在atime 与mtime 都改变了，但是ctime 则是记录目前的时间！
```

# 文件与目录的默认权限与隐藏权限
除了基本r, w, x权限外，在Linux传统的Ext2/Ext3/Ext4文件系统下，我们还可以设定其他的系统隐藏属性，这部份可使用`chattr`来设定，而以`lsattr` 来查看，最重要的属性就是可以设定其不可修改的特性！让连文件的拥有者都不能进行修改！这个属性可是相当重要的，尤其是在安全机制上面(security)！比较可惜的是，在CentOS 7.x当中利用xfs作为默认文件系统，但是xfs就没有支持所有的`chattr`的参数了！仅有部份参数还有支持而已！

## 文件默认权限：umask
umask就是指定『目前使用者在建立文件或目录时候的权限默认值』
```bash
[kiyon@study ~]$ umask
0002    #与一般权限有关的是后面三个数字
[kiyon@study ~]$ umask -S
u=rwx,g=rwx,o=rx
# 修改umask 
[kiyon@study ~]$ umask 022
```
umask的数值指的是『该默认值需要减掉的权限！』

## 文件隐藏属性
隐藏的属性对于系统有很大的帮助,尤其是在系统安全(Security)上面！不过要强调的是，底下的`chattr`指令只能在Ext2/Ext3/Ext4的Linux传统文件系统上面完整生效
### chattr (配置文件隐藏属性)
格式： chattr [+-=][ASacdistu] 文件或目录名称
选项与参数：
-  \+ ：增加某一个特殊参数，其他原本存在参数则不动。
- \- ：移除某一个特殊参数，其他原本存在参数则不动。
- = ：设定一定，且仅有后面接的参数

- S ：一般文件是非同步写入磁盘的(原理请参考前一章sync的说明)，如果加上S这个属性时，当你进行任何文件的修改，该更动会『同步』写入磁盘中。
- a ：当设定a 之后，这个文件将只能增加数据，而不能删除也不能修改数据，只有root 才能设定这属性
- d ：当dump 程序被执行的时候，设定d 属性将可使该文件(或目录)不会被dump 备份
- i ：这个i 可就很厉害了！他可以让一个文件『不能被删除、改名、设定链接也无法写入或新增数据！』对于系统安全性有相当大的助益！只有root 能设定此属性
- A ：当设定了A 这个属性时，若你有存取此文件(或目录)时，他的存取时间atime 将不会被修改，可避免I/O 较慢的机器过度的存取磁盘。(目前建议使用文件系统挂载参数处理这个项目)
- c ：这个属性设定之后，将会自动的将此文件『压缩』，在读取的时候将会自动解压缩，但是在储存的时候，将会先进行压缩后再储存(看来对于大文件似乎蛮有用的！)
- s ：当文件设定了s 属性时，如果这个文件被删除，他将会被完全的移除出这个硬盘空间，所以如果误删了，完全无法救回来了喔！
- u ：与s 相反的，当使用u 来设置文件时，如果该文件被删除了，则数据内容其实还存在磁盘中，可以使用来救援该文件喔！
⭐⭐注意1：属性设定常见的是a 与i 的设定值，而且很多设定值必须要身为root 才能设定
⭐⭐注意2：xfs 文件系统仅支援AadiS

```bash
# 范例：请尝试到/tmp底下建立文件，并加入i的参数，尝试删除看看。
[root@study ~]# cd /tmp/
[root@study tmp]# touch attrtest
[root@study tmp]# chattr +i attrtest
[root@study tmp]# rm attrtest
rm：是否删除普通空文件 "attrtest"？y
rm: 无法删除"attrtest": 不允许的操作
# 连root 也没有办法将这个文件删除

# 范例：将该文件的i属性取消！
[root@study tmp]# chattr -i attrtest
```

这个指令是很重要的，尤其是在系统的数据安全上面！由于这些属性是隐藏的性质，所以需要以 `lsattr` 才能看到该属性！其中，最重要的当属+i与+a这个属性了。+i可以让一个文件无法被更动，对于需要强烈的系统安全的人来说，真是相当的重要的！里头还有相当多的属性是需要root才能设定！

此外，如果是log file这种的日志文件，就更需要+a这个可以增加，但是不能修改旧有的数据与删除的参数了！

### lsattr (显示文件隐藏属性)
格式： lsattr [-adR] 文件或目录
选项与参数：
- -a ：将隐藏文件的属性也秀出来；
- -d ：如果接的是目录，仅列出目录本身的属性而非目录内的文件名；
- -R ：连同子目录的数据也一并列出来！ 

```bash
[root@study tmp]# chattr +aiS attrtest 
[root@study tmp]# lsattr attrtest
--S-ia---------- attrtest
```

## 文件特殊权限： SUID, SGID, SBIT
看看／tmp和／usr／bin／passwd的权限，还有其他的特殊权限( s跟t )
```bash
[root@study tmp]#  ls -ld /tmp ; ls -l /usr/bin/passwd
drwxrwxrwt. 7 root root 140 1月   7 02:20 /tmp
-rwsr-xr-x. 1 root root 27832 6月  10 2014 /usr/bin/passwd
```
### Set UID
当s这个标志出现在文件拥有者的x权限上时，例如刚刚提到的/usr/bin/passwd这个文件的权限状态：『-rw s r-xr-x』，此时就被称为Set UID，简称为SUID的特殊权限，基本上SUID有这样的限制与功能：
- SUID 权限仅对二进制程序(binary program)有效；
- 执行者对于该程序需要具有x 的可执行权限；
- 本权限仅在执行该程序的过程中有效(run-time)；
- 执行者将具有该程序拥有者(owner) 的权限。

举个例子，我们的Linux系统中，所有帐号的密码都记录在/etc/shadow这个文件里面，这个文件的权限为：『---------- 1 root root』，意思是这个文件仅有root可读且仅有root可以强制写入。既然这个文件仅有root可以修改，那么一般帐号使用者能否自行修改自己的密码呢？你可以使用你自己的帐号输入『passwd』这个指令来看看！一般使用者当然可以修改自己的密码了！有没有冲突啊！明明/etc/shadow 就不能让一般帐户去存取的，为什么一般用户还能够修改这个文件内的密码呢？这就是SUID 的功能啦！
- 一般用户 对于/usr/bin/passwd 这个程序来说是具有x 权限的，表示一般用户 能执行passwd；
- passwd 的拥有者是root 这个帐号；
- 一般用户 执行passwd 的过程中，会『暂时』获得root 的权限；
- /etc/shadow 就可以被一般用户 所执行的passwd 所修改。

SUID仅可用在binary program上，不能够用在shell script上面！这是因为shell script只是将很多的binary执行文件叫进来执行而已！所以SUID的权限部分，还是得要看shell script呼叫进来的程序的设定，而不是shell script本身。⭐当然，SUID对于目录也是无效的。

### Set GID
s 在群组的x 时则称为Set GID, SGID 
```bash
[root@study ~]# ll /usr/bin/locate
-rwx--s--x. 1 root slocate 40512 11月  5 23:07 /usr/bin/locate
```
与SUID 不同的是，SGID 可以针对文件或目录来设定！如果是对文件来说， SGID 有如下的功能：
- SGID 对二进制程序有用；
- 程序执行者对于该程序来说，需具备x 的权限；
- 执行者在执行的过程中将会获得该程序群组的支持

举例来说，上面的/usr/bin/locate 这个程序可以去查找/var/lib/mlocate/mlocate.db 这个文件的内容(详细说明会在下节讲述)， mlocate.db 的权限如下：
```bash
[root@study ~]# ll /usr/bin/locate /var/lib/mlocate/mlocate.db
-rwx--s--x. 1 root slocate  40512 11月  5 23:07 /usr/bin/locate
-rw-r-----. 1 root slocate 662595 1月   7 02:49 /var/lib/mlocate/mlocate.db
```
与SUID 非常的类似，若使用一般帐号去执行locate 时，那一般账号将会取得slocate 群组的支援， 因此就能够去读取mlocate.db。
除了binary program 之外，事实上SGID 也能够用在目录上，这也是非常常见的一种用途！当一个目录设定了SGID 的权限后，他将具有如下的功能：
- 使用者若对于此目录具有r 与x 的权限时，该使用者能够进入此目录；
- 使用者在此目录下的有效群组(effective group)将会变成该目录的群组；
- 用途：若使用者在此目录下具有w 的权限(可以新建文件)，则使用者所建立的新文件，该新文件的群组与此目录的群组相同。

SGID对于团队开发来说是非常重要，因为这涉及群组权限的问题。
```bash
# 创建组和用户
[root@study ~]# groupadd project         # 增加新的群组 
[root@study ~]# useradd -G project alex  # 建立alex帐号，且属于project 
[root@study ~]# useradd -G project arod  # 建立arod帐号，且属于project 
[root@study ~]# id alex                  # 查阅alex帐号的属性 
uid=1001(alex) gid=1002(alex) 组=1002(alex),1001(project)
[root@study ~]# id arod 
uid=1002(arod) gid=1003(arod) 组=1003(arod),1001(project)

# 建立所需要开发的团队目录：
[root@study ~]# mkdir /srv/ahome 
[root@study ~]# ll -d /srv/ahome
drwxr-xr-x. 2 root root 6 1月   7 03:02 /srv/ahome/
# 从上面的输出结果可发现alex 与arod 都不能在该目录内建立文件，因此需要进行权限与属性的修改。由于其他人均不可进入此目录，因此该目录的群组应为project，权限应为770才合理。
[root@study ~]# chgrp project /srv/ahome 
[root@study ~]# chmod 770 /srv/ahome 
[root@study ~]# ll -d /srv/ahome 
drwxrwx---. 2 root project 6 1月   7 03:02 /srv/ahome
# 从上面的权限结果来看，由于alex/arod均属于project，因此似乎没问题了！

# 实际分别以两个使用者来测试看看，情况会是如何？先用alex 建立文件，然后用arod 去处理看看。
[root@study ~]# su - alex
[alex@study ~]$ cd /srv/ahome/
[alex@study ahome]$ touch abck
[alex@study ahome]$ exit

[root@study ~]# su - arod
[arod@study ~]$ cd /srv/ahome/
[arod@study ahome]$ ll abck
-rw-rw-r--. 1 alex alex 0 1月   7 03:08 abck
# 仔细看一下上面的文件，由于群组是alex ，arod并不支持！
# 因此对于abcd这个文件来说， arod应该只是其他人，只有r的权限而已！
[arod@study ahome]$ exit

# 由上面的结果我们可以知道，若单纯使用传统的rwx而已，则对刚刚alex建立的abck这个文件来说， arod可以删除他，但是却不能编辑他！

# 加入SGID 的权限在里面，并进行测试
[root@study ~]# chmod 2770 /srv/ahome/
[root@study ~]# ll -d /srv/ahome/
drwxrws---. 2 root project 18 1月   7 03:08 /srv/ahome/

# 测试：使用alex去建立一个文件，并且查阅文件权限看看
[root@study ~]# su - alex
[alex@study ~]$ cd /srv/ahome/
[alex@study ahome]$ touch 1234
[alex@study ahome]$ ll 1234
-rw-rw-r--. 1 alex project 0 1月   7 03:13 1234
# 没错！这才是我们要的样子！现在alex, arod建立的新文件所属群组都是project，
# 由于两人均属于此群组，加上umask 都是002，这样两人才可以互相修改对方的文件！
```

### Sticky Bit
这个Sticky Bit, SBIT 目前只针对目录有效，对于文件已经没有效果了。SBIT 对于目录的作用是：
- 当使用者对于此目录具有w, x 权限，亦即具有写入的权限时；
- 当使用者在该目录下建立文件或目录时，仅有自己与root 才有权力删除该文件
换句话说：当甲这个使用者于A目录是具有群组或其他人的身份，并且拥有该目录w的权限，这表示『甲使用者对该目录内任何人建立的目录或文件均可进行"删除/重命名/移除"等动作。』不过，如果将A目录加上了SBIT的权限项目时，则甲只能够针对自己建立的文件或目录进行删除/更名/移动等动作，而无法删除他人的文件。

举例来说，我们的/tmp 本身的权限是『drwxrwxrwt』， 在这样的权限内容下，任何人都可以在/tmp 内新增、修改文件，但仅有该文件/目录建立者与root 能够删除自己的目录或文件。这个特性也是挺重要的！你可以这样做个简单的测试：
1. 以root 登入系统，并且进入/tmp 当中；
2. touch test，并且更改test 权限成为777 ；
3. 以一般使用者登入，并进入/tmp；
4. 尝试删除test 这个文件！

### SUID/SGID/SBIT 权限设定
- 4 为SUID
- 2 为SGID
- 1 为SBIT

```bash
[root@study ~]# cd /tmp 
[root@study tmp]# touch test                   # 建立一个测试用空文件 
[root@study tmp]# chmod 4755 test; ls -l test  # 加入具有SUID的权限 
-rwsr-xr-x. 1 root root 0 1月   7 03:21 test
[root@study tmp]# chmod 6755 test; ls -l test  # 加入具有SUID/SGID的权限 
-rwsr-sr-x. 1 root root 0 1月   7 03:21 test
[root@study tmp]# chmod 1755 test; ls -l test  # 加入SBIT的功能！
-rwxr-xr-t. 1 root root 0 1月   7 03:21 test
[root@study tmp]# chmod 7666 test; ls -l test  # 具有空的SUID/SGID权限 
-rwSrwSrwT. 1 root root 0 1月   7 03:21 test
```

最后一个例子就要特别小心啦！因为s与t都是取代x这个权限的，但是下达的是7666命令！也就是说， user, group以及others都没有x这个可执行的标志(因为666)，所以，这个S, T代表的就是『空的』！SUID是表示『该文件在执行的时候，具有文件拥有者的权限』，但是文件拥有者都无法执行了，哪里来的权限给其他人使用？当然就是空的啦！

而除了数字法之外，你也可以通过符号法来处理喔！其中SUID 为u+s ，而SGID 为g+s ，SBIT 则是o+t ！来看看如下的范例：

```bash
#设定权限成为-rws--x--x的模样： 
[root@study tmp]# chmod u=rwxs,go=x test; ls -l test 
-rws--x--x. 1 root root 0 1月   7 03:21 test

#加上SGID与SBIT在上述的文件权限中！
[root@study tmp]# chmod g+s,o+t test; ls -l test
-rws--s--t. 1 root root 0 1月   7 03:21 test
```

## 查看文件类型：file
如果你想要知道某个文件的基本数据，例如是属于ASCII 或者是data 文件，或者是binary ， 且其中有没有使用到动态函式库(share library) 等等的资讯，就可以利用file 这个指令来查看！举例来说：
```bash
[root@study ~]# file ~/.bashrc 
/root/.bashrc: ASCII text   # 告诉我们是ASCII的纯文本文件！
[root@study ~]# file /usr/bin/passwd
/usr/bin/passwd: setuid ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=1e5735bf7b317e60bcb907f1989951f6abd50e8d, stripped 
# 执行文件的数据可就多的不得了！包括这个文件的suid 权限、相容于Intel x86-64 等级的硬体平台
# 使用的是Linux核心2.6.32的动态函式库链接等等。
[root@study ~]# file /var/lib/mlocate/mlocate.db 
/var/lib/mlocate/mlocate.db: data   # 这是data文件！
```
通过这个指令，我们可以简单的先判断这个文件的格式是什么！包括未来你也可以用来判断使用tar 压缩包时，该tarball 文件是使用哪一种压缩方式！

# 指令与文件的查找
因为我们常常需要知道文件放在哪里，才能够对该文件进行一些修改或维护等动作。有些时候某些软件配置文件的文件名是不变的，但是各distribution 放置的目录则不同。此时就得要利用一些查找指令将该配置文件的完整文件名找出来，这样才能修改。

## 指令文件名的查找
### which (寻找『执行文件』)
格式： which [-a] command 
选项或参数：
- -a ：将所有由PATH 目录中可以找到的指令均列出，而不止第一个被找到的指令名称

```bash
# 范例一：查找locate这个指令的完整文件名 
[root@study ~]# which locate
/bin/locate 

# 范例二：用which去找出which的文件名为何？
[root@study ~]# which which
alias which='alias | /usr/bin/which --tty-only --read-alias --show-dot --show-tilde'
	/bin/alias
	/usr/bin/which
# 竟然会有两个which ，其中一个是alias 这玩意儿呢！那是啥？
# 那就是所谓的『命令别名』，意思是输入which 会等于后面接的那串指令啦！

# 范例三：请找出history这个指令的完整文件名 
[root@study ~]# which history
/usr/bin/which: no history in (/usr/local/sbin:/usr/local/bin:/sbin:/bin:
/usr/sbin:/usr/bin:/root/bin)

[root@study ~]# history --help
-bash: history: --: 无效选项
history: 用法:history [-c] [-d 偏移量] [n] 或 history -anrw [文件名] 或 history -ps 参数 [参数...]
```
这个指令是根据『PATH』这个环境变数所规范的路径，去查找『执行文件』的文件名～所以，重点是找出『执行文件』而已！且which后面接的是『完整文件名』！若加上-a选项，则可以列出所有的可以找到的同名执行文件，而非仅显示第一个。

最后一个范例最有趣，怎么history这个常用的指令竟然找不到？这是因为history是『bash内建的指令』！但是which默认是找PATH内所规范的目录，所以当然一定找不到的啊(有bash就有history！)！

## 文件文件名的查找
在Linux中通常find 不很常用的！因为速度慢之外， 也很操硬盘！一般我们都是先使用whereis 或者是locate 来查看，如果真的找不到了，才以find 来查找！因为whereis 只找系统中某些特定目录底下的文件而已，locate 则是利用数据库来查找文件名，当然两者就相当的快速， 并且没有实际的查找硬盘内的文件系统状态，比较省时间！
### whereis (由一些特定的目录中寻找文件文件名)
格式： whereis [-bmsu] 文件或目录名
选项与参数：
- -l :可以列出whereis 会去查询的几个主要目录而已
- -b :只找binary 格式的文件
- -m :只找在说明文件manual 路径下的文件
- -s :只找source 来源文件
- -u :查找不在上述三个项目当中的其他特殊文件

```bash
# 范例一：请找出ifconfig这个文件名 
[root@study ~]# whereis ifconfig
ifconfig: /sbin/ifconfig /usr/share/man/man8/ifconfig.8.gz

# 范例二：只找出跟passwd有关的『说明文件』文件名(man page) 
[root@study ~]# whereis passwd      #全部的文件名通通列出来！
passwd: /usr/bin/passwd /etc/passwd /usr/share/man/man1/passwd.1.gz
[root@study ~]# whereis -m passwd   #只有在man里面的文件名才抓出来！
passwd: /usr/share/man/man1/passwd.1.gz
```

whereis 只找几个特定的​​目录而已～并没有全系统去查询。所以说，whereis 主要是针对/bin /sbin 底下的执行文件， 以及/usr/share/man 底下的man page 文件，跟几个比较特定的目录来处理而已。想要知道whereis 到底查了多少目录？可以使用whereis -l 来确认一下即可！

### locate / updatedb
格式： locate [-ir] keyword 
选项与参数：
- -i ：忽略大小写的差异；
- -c ：不输出文件名，仅计算找到的文件数量
- -l ：仅输出几行的意思，例如输出五行则是-l 5
- -S ：输出locate 所使用的数据库文件的相关资讯，包括该数据库纪录的文件/目录数量等
- -r ：后面可接正规表示法的显示方式

```bash
# 范例一：找出系统中所有与passwd相关的文件名，且只列出5个 
[root@study ~]# locate -l 5 passwd
/etc/passwd
/etc/passwd-
/etc/pam.d/passwd
/etc/security/opasswd
/usr/bin/gpasswd

# 范例二：列出locate查询所使用的数据库文件之文件名与各数据数量 
[root@study ~]# locate -S
数据库 /var/lib/mlocate/mlocate.db:
	4,306 文件夹
	32,498 文件
	1,357,708 文件名中的字节数
	658,786 字节用于存储数据库
```

但是，locate还是有使用上的限制的！因为locate寻找的数据是由『已建立的数据库/var/lib/mlocate/』里面的数据所查找到的，所以不用直接在去硬盘当中存取数据，当然是很快速。而数据库的建立默认是在每天执行一次(每个distribution 都不同，CentOS 7.x 是每天更新数据库一次！)，所以当你新建立起来的文件， 却还在数据库更新之前查找该文件，那么locate 会告诉你『找不到！』因为必须要更新数据库！

更新locate 数据库的方法非常简单，直接输入『 updatedb 』就可以了！updatedb 指令会去读取/etc/updatedb.conf 这个配置文件的设定，然后再去硬盘里面进行查找文件名的动作， 最后就更新整个数据库文件！因为updatedb 会去查找硬盘，所以当你执行updatedb 时，可能会等待数分钟的时间！
- updatedb：根据/etc/updatedb.conf 的设定去查找系统硬盘内的文件名，并更新/var/lib/mlocate 内的数据库文件；
- locate：依据/var/lib/mlocate 内的数据库记载，找出使用者输入的关键字文件名。

### find
格式： find [PATH] [option] [action] 
选项与参数：
#### 与时间有关的选项
共有-atime, -ctime 与-mtime ，以-mtime 说明
- -mtime n ：n 为数字，意义为在n 天之前的『一天之内』被更动过内容的文件；
- -mtime +n ：列出在n 天之前(不含n 天本身)被更动过内容的文件文件名；
- -mtime -n ：列出在n 天之内(含n 天本身)被更动过内容的文件文件名。
- -newer file ：file 为一个存在的文件，列出比file 还要新的文件文件名

```bash
# 范例一：将过去系统上面24小时内有更动过内容(mtime)的文件列出 
 [root@study ~]# find / -mtime 0 
 #那个0是重点！0代表目前的时间，所以，从现在开始到24小时前，
 # 有变动过内容的文件都会被列出来！那如果是三天前的24 小时内？
 # find / -mtime 3 有变动过的文件都被列出的意思！
 
 # 范例二：寻找/etc底下的文件，如果文件日期比/etc/passwd新就列出 
 [root@study ~]# 
 # -newer用在分辨两个文件之间的新旧关系是很有用的！
```
- +4代表大于等于5天前的文件名：ex> find /var -mtime +4
- -4代表小于等于4天内的文件文件名：ex> find /var -mtime -4
- 4则是代表4-5那一天的文件文件名：ex> find /var -mtime 4

#### 与使用者或群组名称有关的参数
- -uid n ：n 为数字，这个数字是使用者的帐号ID，亦即UID ，这个UID 是记录在/etc/passwd 里面与帐号名称对应的数字。
- -gid n ：n 为数字，这个数字是群组名称的ID，亦即GID，这个GID 记录在/etc/group。
- -user name ：name 为使用者帐号名称
- -group name：name 为群组名称喔，例如users ；
- -nouser ：寻找文件的拥有者不存在/etc/passwd 的人！
- -nogroup ：寻找文件的拥有群组不存在于/etc/group 的文件！当你自行安装软件时，很可能该软件的属性当中并没有文件拥有者，这是可能的！在这个时候，就可以使用-nouser 与-nogroup 查找。

```bash
# 范例三：查找/home底下属于dmtsai的文件 
[root@study ~]# find /home -user kiyon 
# 这个东西也很有用的～当我们要找出任何一个使用者在系统当中的所有文件时，
# 就可以利用这个指令将属于某个使用者的所有文件都找出来！

# 范例四：查找系统中不属于任何人的文件 
[root@study ~]# find / -nouser 
#通过这个指令，可以轻易的就找出那些不太正常的文件。如果有找到不属于系统任何人的文件时，
# 不要太紧张，那有时候是正常的～尤其是你曾经以原始码自行编译软件时。
```

#### 与文件权限及名称有关的参数
- -name filename：查找文件名称为filename 的文件；
- -size [+-]SIZE：查找比SIZE 还要大(+)或小(-)的文件。这个SIZE 的规格有：c: 代表byte， k: 代表1024bytes。所以，要找比50KB还要大的文件，就是『 -size +50k 』
- -type TYPE ：查找文件的类型为TYPE 的，类型主要有：一般正规文件(f), 装置文件(b, c),目录(d), 链接(l), socket (s), 及FIFO (p) 等属性。
- -perm mode ：查找文件权限『刚好等于』 mode 的文件，这个mode 为类似chmod的属性值，举例来说， -rwsr-xr-x 的属性为4755 ！
- -perm -mode ：查找文件权限『必须要全部囊括mode 的权限』的文件，举例来说，我们要查找-rwxr--r-- ，亦即0744 的文件，使用-perm -0744，当一个文件的权限为-rwsr-xr-x ，亦即4755 时，也会被列出来，因为-rwsr-xr-x 的属性已经囊括了-rwxr--r-- 的属性了。
- -perm /mode ：查找文件权限『包含任一mode 的权限』的文件，举例来说，我们查找-rwxr-xr-x ，亦即-perm /755 时，但一个文件属性为-rw-------也会被列出来，因为他有-rw.... 的属性存在！

```bash
# 范例五：找出文件名为passwd这个文件 
[root@study ~]# find / -name passwd

# 范例五-1：找出文件名包含了passwd这个关键字的文件 
[root@study ~]# find / -name "*passwd*" 
#利用这个-name可以查找文件名啊！默认是完整文件名，如果想要找关键字，
# 可以使用类似* 的任意字符来处理

# 范例六：找出/run目录下，文件类型为Socket的文件名有哪些？
[root@study ~]# find /run -type s 
#这个-type的属性也很有帮助！尤其是要找出那些怪异的文件，
# 例如socket 与FIFO 文件，可以用find /run -type p 或-type s 来找！

# 范例七：查找文件当中含有SGID或SUID或SBIT的属性 
[root@study ~]# find / -perm /7000 
#所谓的7000就是---s--s--t ，那么只要含有s或t的就列出，所以当然要使用/7000，
# 使用-7000 表示要同时含有---s--s--t 的所有三个权限。
```

#### 额外可进行的动作：
- -exec command ：command 为其他指令，-exec 后面可再接额外的指令来处理查找到的结果。
- -print ：将结果打印到屏幕上，这个动作是默认动作！
```bash
# 范例八：将上个范例找到的文件使用ls -l列出来～ 
[root@study ~]# find /usr/bin /usr/sbin -perm /7000 -exec ls -l {} \; 
#注意到，那个-exec后面的ls -l就是额外的指令，指令不支持命令别名，
# 所以仅能使用ls -l 不可以使用ll 喔！注意注意！

# 范例九：找出系统中，大于1MB的文件 
[root@study ~]# find / -size +1M
```

范例八中特殊的地方有{} 以及\; 还有-exec 这个关键字，这些东西的意义为：
- {} 代表的是『由find 找到的内容』，find 的结果会被放置到{} 位置中；
- -exec 一直到\; 是关键字，代表find 额外动作的开始(-exec) 到结束(\;) ，在这中间的就是find 指令内的额外动作。在本例中就是『 ls -l {} 』！
- 因为『 ; 』在bash 环境下是有特殊意义的，因此利用反斜线来转义。

# 极重要的复习！权限与指令间的关系
1. 让使用者能进入某目录成为『可工作目录』的基本权限是什么：
    - 可使用的指令：例如cd 等变换工作目录的指令；
    - 目录所需权限：使用者对这个目录至少需要具有x的权限
    - 额外需求：如果使用者想要在这个目录内利用ls 查阅文件名，则使用者对此目录还需要r 的权限。
2. 使用者在某个目录内读取一个文件的基本权限为何？
    - 可使用的指令：例如本章谈到的cat, more, less等等
    - 目录所需权限：使用者对这个目录至少需要具有x 权限；
    - 文件所需权限：使用者对文件至少需要具有r的权限才行！
3. 让使用者可以修改一个文件的基本权限为何？
    - 可使用的指令：例如nano、vi、vim编辑器等；
    - 目录所需权限：使用者在该文件所在的目录至少要有x 权限；
    - 文件所需权限：使用者对该文件至少要有r, w权限
4. 让一个使用者可以建立一个文件的基本权限为何？
    - 目录所需权限：使用者在该目录要具有w,x的权限，重点在w啦！
5. 让使用者进入某目录并执行该目录下的某个指令之基本权限为何？
    - 目录所需权限：使用者在该目录至少要有x 的权限；
    - 文件所需权限：使用者在该文件至少需要有x 的权限

# 重点回顾
- 与目录相关的指令有：cd, mkdir, rmdir, pwd 等重要指令；
- rmdir 仅能删除空目录，要删除非空目录需使用『 rm -r 』指令；
- 使用者能使用的指令是依据PATH 变量所规定的目录去查找的；
- ls 可以查看文件的属性，尤其-d, -a, -l 等选项特别重要！
- 文件的复制、删除、移动可以分别使用：cp, rm , mv等指令来操作；
- 查看文件的内容(读文件)可使用的指令包括有：cat, tac, nl, more, less, head, tail, od 等
- cat -n 与nl 均可显示行号，但默认的情况下，空白行会不会编号并不相同；
- touch 的目的在修改文件的时间参数，但亦可用来建立空文件；
- 一个文件记录的时间参数有三种，分别是access time(atime), status time (ctime), modification time(mtime)，ls 默认显示的是mtime。
- 除了传统的rwx权限之外，在Ext2/Ext3/Ext4/xfs文件系统中，还可以使用chattr与lsattr设定及观察隐藏属性。常见的包括只能新增数据的+a 与完全不能更动文件的+i 属性。
- 新建文件/目录时，新文件的默认权限使用umask 来规范。默认目录完全权限为drwxrwxrwx， 文件则为-rw-rw-rw-。
- 文件具有SUID的特殊权限时，代表当使用者执行此一binary程序时，在执行过程中使用者会暂时具有程序拥有者的权限
- 目录具有SGID的特殊权限时，代表使用者在这个目录底下新建的文件之群组都会与该目录的群组名称相同。
- 目录具有SBIT的特殊权限时，代表在该目录下使用者建立的文件只有自己与root能够删除！
- 观察文件的类型可以使用file 指令来观察；
- 查找指令的完整文件名可用which 或type ，这两个指令都是透过PATH 变量来查找文件名；
- 查找文件的完整文件名可以使用whereis 找特定目录或locate 到数据库去查找，而不实际查找文件系统；
- 利用find 可以加入许多选项来直接查询文件系统，以获得自己想要知道的文件名。