---
title: javascript(1) 语法和数据类型
tag: [javascript]
category: [技术, javascript]
date: 2016-10-20 20:07:11
updated: 2016-10-20 20:07:11
---

系统学一遍javascript
参考：
- [mozilla JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 6入门](http://es6.ruanyifeng.com/)
- [JavaScript 秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/)

# 声明
JavaScript有三种声明。

`var`
声明一个变量，可选择将其初始化为一个值。  
`let`
声明一个块作用域的局部变量(block scope local variable)，可选择将其初始化为一个值。  
`const`
声明一个只读的常量。  

用 `var` 或 `let` 声明的且未赋初值的变量，值会被设定为 `undefined`。  
试图访问一个未声明的变量或者访问一个使用 `let` 声明的但未初始化的变量会导致一个 `ReferenceError` 异常被抛出：  
```javascript
var a;
// a 的值是 undefined
console.log("The value of a is " + a);

// Uncaught ReferenceError: b is not defined
console.log("The value of b is " + b);

// c 的值是 undefined
console.log("The value of c is " + c);
var c;

// Uncaught ReferenceError: x is not defined
console.log("The value of x is " + x);
let x;
```

可以使用 `undefined` 来判断变量是否已赋值。以下的代码中，变量input未被赋值，因而if条件语句的求值结果是true。
```javascript
var input;
if(input === undefined){
  doThis();
} else {
  doThat();
}
```
undefined 值在布尔类型环境中会被当作 false。例如，下面的代码将会执行函数 myFunction，因为数组myArray中的元素未被赋值：
```javascript
var myArray = [];

if (!myArray[0]) {
  myFunction();
}
```
数值类型环境中 undefined 值会被转换为 NaN。
```javascript
var a;
// 计算为 NaN
a + 2;
```
对一个 null 变量求值时，空值 null 在数值类型环境中会被当作0来对待，而布尔类型环境中会被当作 false。例如：
```javascript
var n = null;
console.log(n * 32); // 0
```

## 变量的作用域
在所有函数之外声明的变量，叫做**全局变量**，因为它可被当前文档中的任何其他代码所访问。在函数内部声明的变量，叫做**局部变量**，因为它**只能在该函数内部访问**。

ECMAScript 6 之前的JavaScript没有 语句块 作用域；相反，语句块中声明的变量将成为语句块所在代码段的局部变量。例如，如下的代码将在控制台输出 5，因为 x 的作用域是声明了 x 的那个函数（或全局范围），而不是 if 语句块。
```javascript
if (true) {
  var x = 5;
}
console.log(x); // 5
```
如果使用 ECMAScript 6 中的 let 声明，上述行为将发生变化。
```javascript
if (true) {
  let y = 5;
}
console.log(y); // ReferenceError: y is not defined
```
## 变量声明提升(Variable hoisting)
JavaScript 变量的另一特别之处是，可以引用稍后声明的变量而不会引发异常。这一概念称为*变量声明提升*(hoisting)；JavaScript 变量感觉上是被“提升”或移到了所有函数和语句之前。然而提升后的变量将返回 `undefined` 值。所以在使用或引用某个变量之后进行声明和初始化操作，这个被提升的引用仍将得到 `undefined` 值。
```javascript
/**
 * Example 1
 */
console.log(x === undefined); // logs "true"
var x = 3;


/**
 * Example 2
 */
// will return a value of undefined
var myvar = "my value";

(function() {
  console.log(myvar); // undefined
  var myvar = "local value";
})();
```

**由于存在变量声明提升，一个函数中所有的var语句应尽可能地放在接近函数顶部的地方。这将大大提升程序代码的清晰度。**  

在 ECMAScript 2015 中，let（const）将**不会提升变量**到代码块的顶部。因此，在变量声明之前引用这个变量，将抛出错误`ReferenceError`。这个变量将从代码块一开始的时候就处在一个“暂时性死区”，直到这个变量被声明为止。
```javascript
console.log(x); // ReferenceError
let x = 3;
```

## 函数提升（Function hoisting）
对于函数，只有函数声明会被提升到顶部，而不包括函数表达式。
```javascript
/* 函数声明 */

foo(); // "bar"

function foo() {
  console.log("bar");
}


/* 函数表达式   表达式定义的函数，成为匿名函数。匿名函数没有函数提升。*/

baz(); // TypeError: baz is not a function
//此时的"baz"相当于一个声明的变量，类型为undefined。
由于baz只是相当于一个变量，因此浏览器认为"baz()"不是一个函数。
var baz = function() {
  console.log("bar2");
};
```
## 常量(Constants)
在同一作用域中，不能使用与变量名或函数名相同的名字来命名常量。例如：
```javascript
// THIS WILL CAUSE AN ERROR
function f() {};
const f = 5;

// THIS WILL CAUSE AN ERROR ALSO
function f() {
  const g = 5;
  var g;

  //statements
}
````
然而,**对象属性是不受保护的**,所以可以使用如下语句来执行。
```javascript
const MY_OBJECT = {"key": "value"};
MY_OBJECT.key = "otherValue";
```

# 数据结构和类型
## 数据类型
JavaScript语言可以识别下面 7 种不同类型的值：

- 六种 原型 数据类型:
    - Boolean.  布尔值，true 和 false.
    - null. 一个表明 null 值的特殊关键字。 JavaScript 是大小写敏感的，因此 null 与 Null、NULL或其他变量完全不同。
    - undefined.  变量未定义时的属性。
    - Number.  表示数字，例如： 42 或者 3.14159。
    - String.  表示字符串，例如："Howdy"
    - Symbol ( 在 ECMAScript 6 中新添加的类型).。一种数据类型，它的实例是唯一且不可改变的。
- 以及 Object 对象
`Objects` 和 `functions` 是本语言的其他两个基本要素。你可以将对象视为存放值的命名容器，而将函数视为应用程序能够执行的过程(procedures)。
