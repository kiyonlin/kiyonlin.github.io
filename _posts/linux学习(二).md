---
title: linux学习(二)
date: 2016-09-13 14:43:33
category: [技术, linux]
tag: [linux, shell]
---
# 基本命令格式
~表示当前所在目录(家目录)  
\#表示超级用户标示  
$表示普通用户

## ls命令
格式:
```shell
ls [选项] [文件或目录]
```
-l会列出详细信息,最前面的10位表示权限  
\-(文件类型,d目录,l软链接文件)      rw\-(u所有者)      r\-\-(g所属组)     r\-\-(o其他人) 

## find命令
格式:
```shell
find [搜索范围] [搜索条件]
条件可以用-a(and) 和 -o(or)进行添加
```

例子  
### 根据名称查找
```shell
# 不推荐使用根目录'/'进行大范围搜索,效率很低
find / -name install.log
# 不区分文件大小写使用-iname
find / -iname install
```

### 根据时间查找
```shell
# 查找10天前修改的文件
find /var/log/ -mtime +10
# -10:十天内;10:第十天;+10:十天前
# 还有atime文件访问时间,ctime改变文件属性时间
```
### 根据文件大小查找
```shell
find . -size 25k
# k使用小写,M使用大写
```

### 详细例子
查找当前目录下,大于20kb并且小于50kb的文件,并显示详细信息
```shell
find . -size +20k -a -size -50k -exec ls -lh {} \;
```

## grep命令
格式
```shell
grep [选项] 字符串 文件名
选项:
-i 忽略大小写
-v 排除指定字符串,即取反,不包含
```

## VIM使用
vim打开文件
```shell
vim abc     打开abc文件,光标定位第一行
vim + abc   打开abc文件,光标定位最后一行
vim +3 abc  打开abc文件,光标定位第三行
vim +/imooc abc 打开abc文件,光标定位imooc所在行(N下一个)
vim aa bb cc    打开三个文件,:n切换,:N逆向切换
```

vim分command mode、insert mode、last line mode  
command mode下  
```shell
I   输入命令
o   光标下插一行并输入
dd  删除一行
yy  复制所在行
p   在所在行下行粘贴
h   光标左移
j   光标下移
k   光标上移
l   光标右移
ctrl+f(ront)    向下翻页
ctrl+b(ack)     向上翻页
ctrl+d(own)     下半页
ctrl+u(p)       上半页
```
last line mode下
```shell
:w      写
:q      退出
:!      强制
:ls     列出文件
:15     第15行
/xxx    向后搜索
?xxx    向前搜索
```
