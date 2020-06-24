---
title: C预处理器
tags:
  - C
  - 预处理器
categories:
  - 计算机
date: 2017-05-01 08:58:02
updated: 2017-05-01 08:58:02
---
## 翻译程序的第一步
- 编译器把源代码中出现的字符映射到源字符集，该过程处理多字节字符和三字符序列；
- 编译器定位每个反斜杠后面跟着换行符的实例，并删除它们。因为预处理表达式的长度必须是一个逻辑行，一个逻辑行可以是多个物理行；
- 编译器把文本划分成预处理记号（记号表示空格、制表符或换行符）序列、空白序列和注释序列；

## 明示常量：#defind
明示常量（manifest constant），也叫做符号常量。
每行 #defind（逻辑行）由三部分组成：
1. #define 指令本身；
2. 宏，有些宏代表数值，称为object-like macro，有些宏代表函数，称为function-like macro；
3. 替换列表或替换体（双引号中的宏不会被替换）。

### 在 #define 中使用参数
带有参数的宏看上去很像函数。必要时要使用足够多的圆括号来确保运算和结合的正确顺序。

`避免用++x作为宏参数`

#### #运算符
C允许在字符串中包含宏参数。在类函数宏的替换体中，#号作为一个预处理运算符，可以把记号转换成字符串。
```C
#define PSQR(x) printf("The square of" #x " is %d.\n", ((x)*(x)))

int y = 5;
PSQR(y);
// The square of y is 25.

PSQR(2 + 4);
// The square of 2 + 4 is 36.
```

#### ##运算符：预处理器粘合剂
```C
#define XNAME(n) x ## n
int XNAME(1) = 14;  // 变成int x1 = 14
```

#### 变参宏： ...和__VA_ARGS__
```c
#include <stdio.h>
#define pr(...) printf(__VA_ARGS__)
int main(void) {
	pr("hello world\n");
	pr("Thanks\n");
	return 0;
}
```

省略号只能代表最后的宏参数。

## 宏和函数的选择
- 宏不用担心变量类型
- 宏可能产生副作用
- 在程序中只使用一次的宏无法明显减少程序的运行时间
- 在嵌套循环中使用宏有助于提高效率

## 文件包含： #include
- #include <> 尖括号告诉预处理器在标准系统目录中查找文件
- #include "" 双引号告诉预处理器在当前目录或者指定目录中查找该文件，未找到再查找标准系统目录

## 其他指令
- #undef
- #ifdef、#ifndef
- #else
- #endif
- #if
- #elif
- #line
- #error
- #pragma

## 内联函数（C99）
把函数变成内联函数建议尽可能快地调出该函数，其具体效果由实现定义。内联函数应该比较短小。
