---
title: javascript-3 数字和日期
tags: [javascript]
categories: [web, javascript]
date: 2016-10-27 08:29:49
updated: 2016-10-27 08:29:49
---
参考：
- [mozilla JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 6入门](http://es6.ruanyifeng.com/)
- [JavaScript 秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/)

## 数字
在 `JavaScript` 里面，数字都是双精度浮点类型的（也就是说一个数字只能在 -(2^53^ -1) 和 2^53^ -1之间）。没有特定的整型数据类型。除了能够表示浮点数，数字类型有三个符号值: `+Infinity`、`-Infinity`和 `NaN` (not-a-number)。
### 十进制数字(Decimal numbers)
```javascript
1234567890
42

// 数字第一个为零的注意事项：

0888 // 888 将被当做十进制处理
0777 // 在非严格格式下会被当做八进制处理 (用十进制表示就是511)
```
**请注意**，十进制可以以0开头，后面接其他十进制数字，但是假如后面接的十进制数字小于8，那么该数字将会被当做八进制处理。
## 数字对象
```javascript
Number.MIN_SAFE_INTEGER;	// -9007199254740991
Number.MAX_SAFE_INTEGER;	// 9007199254740991

// 判断传递的值是否为整数。
Number.isInteger('123');	// false
Number.isInteger(123);	// true
Number.isInteger(a);	// false
Number.isInteger('');	// false
Number.isInteger(12.1);	// false
Number.isInteger(12a);	// Uncaught SyntaxError: missing ) after argument list
Number.isInteger(12.0);	// true

```
### `Number.prototype`的方法
`toFixed()` 方法使用定点表示法来格式化一个数。
```javascript

var numObj = 12345.6789;

numObj.toFixed();         // 返回 "12346"：进行四舍五入，不包括小数部分
numObj.toFixed(1);        // 返回 "12345.7"：进行四舍五入

numObj.toFixed(6);        // 返回 "12345.678900"：用0填充

(1.23e+20).toFixed(2);    // 返回 "123000000000000000000.00"

(1.23e-10).toFixed(2);    // 返回 "0.00"

2.34.toFixed(1);          // 返回 "2.3"

-2.34.toFixed(1);         // 返回 -2.3 （由于操作符优先级，负数不会返回字符串）

(-2.34).toFixed(1);       // 返回 "-2.3" （若用括号提高优先级，则返回字符串）
```
`toExponential()` 方法以指数表示法返回该数值字符串表示形式。
**参数**
`fractionDigits`
可选。一个整数，用来指定小数点后有几位数字。默认情况下用尽可能多的位数来显示数字。
**返回值**
一个用幂的形式 (科学技术法) 来表示Number 对象的字符串。小数点后以fractionDigits 提供的值来四舍五入。如果 fractionDigits 参数被忽略了，小数点后的将尽可能用最多的位数来表示该数值。

*对数值字面量使用 toExponential() 方法，且该数值没有小数点和指数时，应该在该数值与该方法之间隔开一个空格，以避免点号被解释为一个小数点。也可以使用两个点号调用该方法*。

如果一个数值的小数位数多余 fractionDigits 参数所提供的，则该数值将会在 fractionDigits 指定的小数位数处四舍五入。可以查看 toFixed() 方法描述中关于四舍五入的讨论，同样应用于 toExponential() 方法。
```javascript
var numObj = 77.1234;

alert("numObj.toExponential() is " + numObj.toExponential()); //输出 7.71234e+1

alert("numObj.toExponential(4) is " + numObj.toExponential(4)); //输出 7.7123e+1

alert("numObj.toExponential(2) is " + numObj.toExponential(2)); //输出 7.71e+1

alert("77.1234.toExponential() is " + 77.1234.toExponential()); //输出 7.71234e+1

alert("77 .toExponential() is " + 77 .toExponential()); //输出 7.7e+1
```

`toPrecision()` 方法以指定的精度返回该数值对象的字符串表示。
```javascript
var numObj = 5.123456;
console.log("numObj.toPrecision()  is " + numObj.toPrecision());  //输出 5.123456
console.log("numObj.toPrecision(5) is " + numObj.toPrecision(5)); //输出 5.1235
console.log("numObj.toPrecision(2) is " + numObj.toPrecision(2)); //输出 5.1
console.log("numObj.toPrecision(1) is " + numObj.toPrecision(1)); //输出 5

// 注意：在某些情况下会以指数表示法返回
console.log((1234.5).toPrecision(2)); // "1.2e+3"
```

## 日期对象
`JavaScript` 处理日期数据类似于Java。这两种语言有许多一样的处理日期的方法，也都是以1970年1月1日00:00:00以来的`毫秒`数来储存数据类型的。
Date 对象的范围是相对距离 UTC 1970年1月1日 的`前后 100,000,000 天。`
### Date对象的方法
处理日期时间的Date对象方法可分为以下几类：

- "set" 方法, 用于设置Date对象的日期和时间的值。
- "get" 方法,用于获取Date对象的日期和时间的值。
- "to" 方法,用于返回Date对象的字符串格式的值。
- parse 和UTC 方法, 用于解析Date字符串。

通过“get”和“set”方法，你可以分别设置和获取秒，分，时，日，星期，月份，年。这里有个getDay方法可以放回星期，但是没有相应的setDay方法用了设置星期，因为星期事自动设置的。这些方法用整数来代表以下这些值：

- 秒，分： 0 至 59
- 时： 0 至 23
- 星期： 0 (周日) 至 6 (周六)
- 日期：1 至 31
- 月份： 0 (一月) to 11 (十二月)
- 年份： 从1900开始的年数

## 数值的扩展 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/number)  

### Number.EPSILON
ES6在Number对象上面，新增一个极小的常量`Number.EPSILON`。
```javascript
Number.EPSILON
// 2.220446049250313e-16
Number.EPSILON.toFixed(20)
// '0.00000000000000022204'
```
引入一个这么小的量的目的，在于为浮点数计算，设置一个误差范围。我们知道浮点数计算是不精确的。
```javascript
0.1 + 0.2
// 0.30000000000000004

0.1 + 0.2 - 0.3
// 5.551115123125783e-17

5.551115123125783e-17.toFixed(20)
// '0.00000000000000005551'
```
但是如果这个误差能够小于`Number.EPSILON`，我们就可以认为得到了正确结果。
```javascript
5.551115123125783e-17 < Number.EPSILON
// true
```
因此，`Number.EPSILON`的实质是一个可以接受的误差范围。
一个误差检查函数:
```javascript
function withinErrorMargin (left, right) {
  return Math.abs(left - right) < Number.EPSILON;
}
withinErrorMargin(0.1 + 0.2, 0.3)
// true
withinErrorMargin(0.2 + 0.2, 0.3)
// false
```
### Math对象的扩展
#### Math.trunc()
`Math.trunc`方法用于去除一个数的小数部分，返回整数部分。
```javascript
Math.trunc(4.1) // 4
Math.trunc(4.9) // 4
Math.trunc(-4.1) // -4
Math.trunc(-4.9) // -4
Math.trunc(-0.1234) // -0
```
对于没有部署这个方法的环境，可以用下面的代码模拟。
```javascript
Math.trunc = Math.trunc || function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};
```
