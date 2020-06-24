---
title: javascript-1 语法和数据类型
tags: [javascript]
categories: [web, javascript]
date: 2016-10-20 20:07:11
updated: 2016-10-20 20:07:11
---

系统学一遍javascript
参考：
- [mozilla JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 6入门](http://es6.ruanyifeng.com/)
- [JavaScript 秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/)

## 声明
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

### 变量的作用域
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
### 变量声明提升(Variable hoisting)
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

### 变量的解构赋值用途

#### 交换变量的值
```javascript
[x, y] = [y, x];
```
上面代码交换变量x和y的值，这样的写法不仅简洁，而且易读，语义非常清晰。

#### 从函数返回多个值

函数只能返回一个值，如果要返回多个值，只能将它们放在数组或对象里返回。有了解构赋值，取出这些值就非常方便。
```javascript
// 返回一个数组

function example() {
  return [1, 2, 3];
}
var [a, b, c] = example();

// 返回一个对象

function example() {
  return {
    foo: 1,
    bar: 2
  };
}
var { foo, bar } = example();
```
#### 函数参数的定义

解构赋值可以方便地将一组参数与变量名对应起来。
```javascript
// 参数是一组有次序的值
function f([x, y, z]) { ... }
f([1, 2, 3]);

// 参数是一组无次序的值
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});
```
#### 提取JSON数据

解构赋值对提取JSON对象中的数据，尤其有用,快速提取JSON数据的值。
```javascript
var jsonData = {
  id: 42,
  status: "OK",
  data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]
```

#### 函数参数的默认值
```javascript
jQuery.ajax = function (url, {
  async = true,
  beforeSend = function () {},
  cache = true,
  complete = function () {},
  crossDomain = false,
  global = true,
  // ... more config
}) {
  // ... do stuff
};
```
指定参数的默认值，就避免了在函数体内部再写v`ar foo = config.foo || 'default foo';`这样的语句。

#### 遍历Map结构

任何部署了Iterator接口的对象，都可以用for...of循环遍历。Map结构原生支持Iterator接口，配合变量的解构赋值，获取键名和键值就非常方便。
```javascript
var map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}
// first is hello
// second is world
```
如果只想获取键名，或者只想获取键值，可以写成下面这样。
```javascript
// 获取键名
for (let [key] of map) {
  // ...
}

// 获取键值
for (let [,value] of map) {
  // ...
}
```
#### 输入模块的指定方法

加载模块时，往往需要指定输入那些方法。解构赋值使得输入语句非常清晰。
```javascript
const { SourceMapConsumer, SourceNode } = require("source-map");

```
### 函数提升（Function hoisting）
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
### 常量(Constants)
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

## 数据结构和类型
### 数据类型
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

### 数据类型的转换(Data type conversion)

JavaScript是一种动态类型语言(dynamically typed language)。这意味着你声明变量时可以不必指定数据类型，而数据类型会在脚本执行时根据需要自动转换。  
在涉及加法运算符(+)的数字和字符串表达式中，JavaScript 会把数字值转换为字符串。例如，假设有如下的语句：
```javascript
x = "The answer is " + 42 // "The answer is 42"
y = 42 + " is the answer" // "42 is the answer"
```
在涉及其它运算符（译注：如下面的减号'-'）时，JavaScript语言不会把数字变为字符串。例如（译注：第一例是数学运算，第二例是字符串运算）：
```javascript
"37" - 7 // 30
"37" + 7 // "377"
```
### 字符串转换为数字(converting strings to numbers)
#### parseInt()和parseFloat()
#### 单目加法运算符

将字符串转换为数字的另一种方法是使用单目加法运算符。
```javascript
"1.1" + "1.1" = "1.11.1"
(+"1.1") + (+"1.1") = 2.2   // 注：加入括号为清楚起见，不是必需的。

```
## 字面量 (Literals)
### 数组字面量 (Array literals)
#### 数组字面值中的多余逗号

声明时，不必列举数组字面值中的所有元素。若在同一行中连写两个逗号（,），数组中就会产生一个没有被指定的元素，其初始值是undefined。以下示例创建了一个名为fish的数组：
```javascript
var fish = ["Lion", , "Angel"];
```
在这个数组中，有两个已被赋值的元素，和一个空元素（fish[0]是"Lion"，fish[1]是undefined，而fish[2]是"Angel"，此时数组的长度属性fish.length是3)。

如果在元素列表的尾部添加了一个逗号，它将会被忽略。在下面的例子中，数组的长度是3，并不存在myList[3]这个元素。元素列表中其它所有的逗号都表示一个新元素（的开始）。  

在自己写代码时：**显式地将缺失的元素声明为undefined，将大大提高你的代码的清晰度和可维护性。**

#### length 属性

length 属性的 getter 方式会简单的返回数组的长度，而 setter 方式会截断数组。
```javascript
var foo = [1, 2, 3, 4, 5, 6];
foo.length = 3;
foo; // [1, 2, 3]

foo.length = 6;
foo; // [1, 2, 3]
```
在 Firebug 中查看此时 foo 的值是： [1, 2, 3, undefined, undefined, undefined] 但是这个结果并不准确，如果你在 Chrome 的控制台查看 foo 的结果，你会发现是这样的： [1, 2, 3] 因为在 JavaScript 中 undefined 是一个变量，注意是变量不是关键字，因此上面两个结果的意义是完全不相同的。
```javascript
// 译者注：为了验证，我们来执行下面代码，看序号 5 是否存在于 foo 中。
5 in foo; // 不管在 Firebug 或者 Chrome 都返回 false
foo[5] = undefined;
5 in foo; // 不管在 Firebug 或者 Chrome 都返回 true
```
为 `length` 设置一个更小的值会截断数组，但是增大 `length` 属性值不会对数组产生影响。

结论

为了更好的性能，推荐使用普通的 for 循环并缓存数组的 `length` 属性。 使用 for in 遍历数组被认为是不好的代码习惯并倾向于产生错误和导致性能问题。

### 整数 (Intergers)
整数可以用十进制（基数为10）、十六进制（基数为16）、八进制（基数为8）以及二进制（基础为2）表示。

- 十进制整数字面量由一串数字序列组成，且没有前缀0。
- 八进制的整数以 0（或0O、0o）开头，只能包括数字0-7。
- 十六进制整数以0x（或0X）开头，可以包含数字（0-9）和字母 a~f 或 A~F。
- 二进制整数以0b（或0B）开头，只能包含数字0和1。
**严格模式下**，八进制整数字面量必须以0o或0O开头，而不能以0开头。

### 浮点数字面量 (Floating-point literals)

浮点数字面值可以有以下的组成部分：

- 一个十进制整数，可以带正负号（即前缀“+”或“ - ”），
- 小数点（“.”），
- 小数部分（由一串十进制数表示），
- 指数部分。
指数部分以“e”或“E”开头，后面跟着一个整数，可以有正负号（即前缀“+”或“-”）。浮点数字面量至少有一位数字，而且必须带小数点或者“e”（大写“E”也可）。

简言之，其语法是：
```javascript
[(+|-)][digits][.digits][(E|e)[(+|-)]digits]
```

### 对象字面量 (Object literals)

对象字面值是封闭在花括号对(`{}`)中的一个对象的零个或多个"属性名-值"对的（元素）列表。不能在**一条语句的开头**就使用对象字面值，这将导致错误或产生超出预料的行为， 因为此时左花括号（{）会被认为是一个语句块的起始符号。

对象属性名字可以是任意字符串，包括空串。如果对象属性名字不是合法的javascript标识符，它必须用""包裹。属性的名字不合法，那么便不能用.访问属性值，而是通过类数组标记("[]")访问和赋值。
```javascript
var unusualPropertyNames = {
  "": "An empty string",
  "!": "Bang!"
}
console.log(unusualPropertyNames."");   // 语法错误: Unexpected string
console.log(unusualPropertyNames[""]);  // An empty string
console.log(unusualPropertyNames.!);    // 语法错误: Unexpected token !
console.log(unusualPropertyNames["!"]); // Bang!
```
请注意：
```javascript
var foo = {a: "alpha", 2: "two"};
console.log(foo.a);    // alpha
console.log(foo[2]);   // two
//console.log(foo.2);  // Error: missing ) after argument list
//console.log(foo[a]); // Error: a is not defined
console.log(foo["a"]); // alpha
console.log(foo["2"]); // two
```

### RegExp 字面值

一个正则表达式是字符被斜线（译注：正斜杠“/”）围成的表达式。下面是一个正则表达式文字的一个例子。
```javascript
var re = /ab+c/;
```
### 字符串字面量 (String literals)
在ES2015中，还提供了一种模板字符串（template literals），模板字符串提供了一些语法糖来帮你构造字符串。这与Perl、Python还有其他语言中的字符串插值（string interpolation）的特性非常相似。除此之外，可以在通过模板字符串前添加一个tag来自定义模板字符串的解析过程，这可以用来防止注入攻击，或者用来建立基于字符串的高级数据抽象。
```javascript
// Basic literal string creation
`In JavaScript '\n' is a line-feed.`

// Multiline strings
`In JavaScript this is
 not legal.`

// String interpolation
var name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`

// Construct an HTTP request prefix is used to interpret the replacements and construction
POST`http://foo.org/bar?a=${a}&b=${b}
     Content-Type: application/json
     X-Credentials: ${credentials}
     { "foo": ${foo},
       "bar": ${bar}}`(myOnReadyStateChangeHandler);
```
