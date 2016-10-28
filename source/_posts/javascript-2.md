---
title: javascript-2 函数
tag: [javascript, 函数, 闭包]
category: [技术, javascript]
date: 2016-10-26 16:24:48
updated: 2016-10-26 16:24:48
---
参考：
- [mozilla JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 6入门](http://es6.ruanyifeng.com/)
- [JavaScript 秘密花园](https://bonsaiden.github.io/JavaScript-Garden/zh/)

# 作用域和函数堆栈(Scope and Function stack)递归(recursion)
## 命名冲突
当同一个闭包作用域下两个参数或者变量同名时，就会产生命名冲突。更近的作用域有更高的优先权，所以最近的优先级最高，最远的优先级最低。这就是作用域链。链的第一个元素就是最里面的作用域，最后一个元素便是最外层的作用域。

```javascript
function outside() {
  var x = 10;
  function inside(x) {
    return x;
  }
  return inside;
}
result = outside()(20); // returns 20 instead of 10
```
命名冲突发生在return x上，inside的参数x和外部变量x发生了冲突。这里的作用链域是{inside, outside, 全局对象}。因此inside具有最高优先权，返回了传入的20而不是外部函数的变量值10。

# 闭包(Closures)
使用闭包时要小心避免一些陷阱。如果一个闭包的函数用外部函数的变量名定义了同样的变量，那在外部函数域将再也无法指向该变量。
```javascript
var createPet = function(name) {  // Outer function defines a variable called "name"
  return {
    setName: function(name) {    // Enclosed function also defines a variable called "name"
      name = name;               // ??? How do we access the "name" defined by the outer function ???
    }
  }
}
```
闭包中的神奇变量`this`是非常诡异的。使用它必须十分的小心，因为`this`指代什么完全取决于函数在何处被调用，而不是`在何处被定义`。一篇绝妙而详尽的关于闭包的文章可以在[这里](http://jibbering.com/faq/notes/closures/)找到。
# 使用arguments对象
# 函数参数(Function parameter)
从ECMAScript 6开始，有两个新的类型的参数：默认参数(default parameters)，剩余参数(rest parameters)。

## 默认参数(default parameter)
```javascript
function multiply(a, b = 1) {
  return a*b;
}

multiply(5); // 5
```
## 剩余参数(rest parameters)

剩余参数语法允许将不确定数量的参数表示为数组。在下面的例子中，使用剩余参数收集从第二个到最后参数。然后，将这个数组的每一个数与第一个参数相乘。这个例子是使用了一个箭头函数，这将在下一节介绍。
```javascript
function multiply(multiplier, ...theArgs) {
  return theArgs.map(x => multiplier * x);
}

var arr = multiply(2, 1, 2, 3);
console.log(arr); // [2, 4, 6]
```
# 箭头函数(Arrow functions)
箭头函数表达式（也称胖箭头函数, `fat arrow function`）具有较短的语法相比函数表达式和词法绑定此值。箭头函数总是匿名的。参考hacks.mozilla.org 博客文章：“[深度了解ES6：箭头函数](https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/)”。

## 更简洁的函数

在一些功能性的模式，更简洁的函数是受欢迎的。比如下面：
```javascript
var a = [
  "Hydrogen",
  "Helium",
  "Lithium",
  "Beryl­lium"
];

var a2 = a.map(function(s){ return s.length });

var a3 = a.map( s => s.length );
```
## this的词法

在箭头函数出现之前，每一个新函数都重新定义了自己的this值（在严格模式下，一个新的对象在构造函数里是未定义的，通过上下文对象调用的函数被称为“对象方法”等）。面向对象的编程风格着实有点恼人。

```javascript
function Person() {
  // The Person() constructor defines `this` as itself.
  this.age = 0;

  setInterval(function growUp() {
    // In nonstrict mode, the growUp() function defines `this`
    // as the global object, which is different from the `this`
    // defined by the Person() constructor.
    this.age++;
  }, 1000);
}

var p = new Person();
```
在ECMAScript 3/5里，通过把this的值赋值给一个变量可以修复这个问题。
```javascript
function Person() {
  var self = this; // Some choose `that` instead of `self`.
                   // Choose one and be consistent.
  self.age = 0;

  setInterval(function growUp() {
    // The callback refers to the `self` variable of which
    // the value is the expected object.
    self.age++;
  }, 1000);
}
```
另外，创建一个[约束函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)(bound function)可以使得this值被正确传递给growUp()函数。

箭头功能捕捉闭包上下文的this值，所以下面的代码工作正常。
```javascript
function Person(){
  this.age = 0;

  setInterval(() => {
    this.age++; // |this| properly refers to the person object
  }, 1000);
}

var p = new Person();
```
