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

## setTimeout和setInterval
基于 `JavaScript` 引擎的计时策略，以及本质上的单线程运行方式，所以其它代码的运行可能会阻塞此线程。 因此没法确保函数会在 `setTimeout` 指定的时刻被调用。

作为第一个参数的函数将会在全局作用域中执行，因此函数内的 `this` 将会指向这个全局对象。
```javascript
function Foo() {
    this.value = 42;
    this.method = function() {
        // this 指向全局对象
        console.log(this.value); // 输出：undefined
    };
    setTimeout(this.method, 500);
}
new Foo();
```
注意: `setTimeout` 的第一个参数是函数对象，一个常犯的错误是这样的 `setTimeout(foo(), 1000)`， 这里回调函数是 `foo` 的返回值，而不是`foo`本身。 大部分情况下，这是一个潜在的错误，因为如果函数返回 undefined，`setTimeout` 也不会报错。
`setInterval` 的堆调用

`setTimeout` 只会执行回调函数一次，不过 `setInterval` - 正如名字建议的 - 会每隔 X 毫秒执行函数一次。 但是却不鼓励使用这个函数。

当回调函数的执行被阻塞时，`setInterval` 仍然会发布更多的回调指令。在很小的定时间隔情况下，这会导致回调函数被堆积起来。
```javascript
function foo(){
    // 阻塞执行 1 秒
}
setInterval(foo, 100);
```
上面代码中，`foo` 会执行一次随后被阻塞了一秒钟。

在 `foo` 被阻塞的时候，`setInterval` 仍然在组织将来对回调函数的调用。 因此，当第一次 `foo` 函数调用结束时，已经有 10 次函数调用在等待执行。

处理可能的阻塞调用

最简单也是最容易控制的方案，是在回调函数内部使用 `setTimeout` 函数。
```javascript
function foo(){
    // 阻塞执行 1 秒
    setTimeout(foo, 100);
}
foo();
```
这样不仅封装了 `setTimeout` 回调函数，而且阻止了调用指令的堆积，可以有更多的控制。 `foo` 函数现在可以控制是否继续执行还是终止执行。

**结论**

绝对不要使用字符串作为 `setTimeout` 或者 `setInterval` 的第一个参数， 这么写的代码明显质量很差。当需要向回调函数传递参数时，可以创建一个匿名函数，在函数内执行真实的回调函数。

另外，应该避免使用 `setInterval`，因为它的定时执行不会被 JavaScript 阻塞。

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
### 使用 `hasOwnProperty` 过滤
```javascript
// foo 变量是上例中的
for(var i in foo) {
    if (foo.hasOwnProperty(i)) {
        console.log(i);
    }
}
```
这个版本的代码是唯一正确的写法。由于使用了 `hasOwnProperty`，所以这次只输出 `moo`。 如果不使用 `hasOwnProperty`，则这段代码在原生对象原型（比如 `Object.prototype`）被扩展时可能会出错。

类库 `Prototype` 就扩展了原生的 `JavaScript` 对象。 因此，当这个类库被包含在页面中时，不使用 `hasOwnProperty` 过滤的 `for in` 循环难免会出问题。

总结

推荐使用 `hasOwnProperty`。不要对代码运行的环境做任何假设，不要假设原生对象是否已经被扩展了。

### 显式的设置 `this`
```javascript
function foo(a, b, c) {}

var bar = {};
foo.apply(bar, [1, 2, 3]); // 数组将会被扩展，如下所示
foo.call(bar, 1, 2, 3); // 传递到foo的参数是：a = 1, b = 2, c = 3
```
当使用 `Function.prototype` 上的 `call` 或者 `apply` 方法时，函数内的 `this` 将会被 显式设置为函数调用的第一个参数。

因此函数调用的规则在上例中已经不适用了，在 `foo` 函数内 `this` 被设置成了 `bar`。

注意：在对象的字面声明语法中，`this` 不能用来指向对象本身。 因此 `var obj = {me: this}` 中的 me 不会指向 obj，这个例子中，如果是在浏览器中运行，obj.me 等于 window 对象。


### 常见误解

尽管大部分的情况都说的过去，不过第一个规则（译者注：这里指的应该是第二个规则，也就是直接调用函数时，`this` 指向全局对象） 被认为是JavaScript语言另一个错误设计的地方，因为它从来就没有实际的用途。
```javascript
Foo.method = function() {
    function test() {
        // this 将会被设置为全局对象（译者注：浏览器环境中也就是 window 对象）
    }
    test();
}
```
一个常见的误解是 `test` 中的 `this` 将会指向 `Foo` 对象，实际上不是这样子的。

为了在 `test` 中获取对 `Foo` 对象的引用，我们需要在 `method` 函数内部创建一个局部变量指向 `Foo` 对象。
```javascript
Foo.method = function() {
    var that = this;
    function test() {
        // 使用 that 来指向 Foo 对象
    }
    test();
}
```
that 只是我们随意起的名字，不过这个名字被广泛的用来指向外部的 `this` 对象。 在 闭包 一节，我们可以看到 `that` 可以作为参数传递。

# javascript秘密花园
## 闭包和引用

闭包是 `JavaScript` 一个非常重要的特性，这意味着当前作用域总是能够访问外部作用域中的变量。 因为 函数是 `JavaScript` 中唯一拥有自身作用域的结构，因此闭包的创建依赖于函数。

### 模拟私有变量
```javascript

function Counter(start) {
    var count = start;
    return {
        increment: function() {
            count++;
        },

        get: function() {
            return count;
        }
    }
}

var foo = Counter(4);
foo.increment();
foo.get(); // 5
```
这里，`Counter` 函数返回两个闭包，函数 `increment` 和函数 `get`。 这两个函数都维持着对外部作用域 `Counter` 的引用，因此总可以访问此作用域内定义的变量 `count`.

### 避免引用错误

为了正确的获得循环序号，最好使用 匿名包装器（译者注：其实就是我们通常说的自执行匿名函数）。
```javascript
for(var i = 0; i < 10; i++) {
    (function(e) {
        setTimeout(function() {
            console.log(e);  
        }, 1000);
    })(i);
}
```
外部的匿名函数会立即执行，并把 `i` 作为它的参数，此时函数内 `e` 变量就拥有了 `i` 的一个拷贝。

当传递给 `setTimeout` 的匿名函数执行时，它就拥有了对 `e` 的引用，而这个值是不会被循环改变的。

### arguments 对象

`JavaScript` 中每个函数内都能访问一个特别变量 `arguments`。这个变量维护着所有传递到这个函数中的参数列表。

注意: 由于 `arguments` 已经被定义为函数内的一个变量。 因此通过 `var` 关键字定义 `arguments` 或者将 `arguments` 声明为一个形式参数， 都将导致原生的 `arguments` 不会被创建。
`arguments` 变量不是一个数组（Array）。 尽管在语法上它有数组相关的属性 `length`，但它不从 `Array.prototype` 继承，实际上它是一个对象（Object）。

因此，无法对 `arguments` 变量使用标准的数组方法，比如 `push`, `pop` 或者 `slice`。 虽然使用 `for` 循环遍历也是可以的，但是为了更好的使用数组方法，最好把它转化为一个真正的数组。

#### 转化为数组

下面的代码将会创建一个新的数组，包含所有 `arguments` 对象中的元素。
```javascript
Array.prototype.slice.call(arguments);
```
这个转化比较慢，在性能不好的代码中不推荐这种做法。

#### 传递参数

下面是将参数从一个函数传递到另一个函数的推荐做法。
```javascript
function foo() {
    bar.apply(null, arguments);
}
function bar(a, b, c) {
    // 干活
}
```
另一个技巧是同时使用 `call` 和 `apply`，创建一个快速的解绑定包装器。
```javascript
function Foo() {}

Foo.prototype.method = function(a, b, c) {
    console.log(this, a, b, c);
};

// 创建一个解绑定的 "method"
// 输入参数为: this, arg1, arg2...argN
Foo.method = function() {

    // 结果: Foo.prototype.method.call(this, arg1, arg2... argN)
    Function.call.apply(Foo.prototype.method, arguments);
};
```
译者注：上面的  `Foo.method` 函数和下面代码的效果是一样的:
```javascript
Foo.method = function() {
    var args = Array.prototype.slice.call(arguments);
    Foo.prototype.method.apply(args[0], args.slice(1));
};
```
有一种情况会显著的影响现代 `JavaScript` 引擎的性能。这就是使用 `arguments.callee`。
```javascript
function foo() {
    arguments.callee; // do something with this function object
    arguments.callee.caller; // and the calling function object
}

function bigLoop() {
    for(var i = 0; i < 100000; i++) {
        foo(); // Would normally be inlined...
    }
}
```
上面代码中，`foo` 不再是一个单纯的内联函数 `inlining`（译者注：这里指的是解析器可以做内联处理）， 因为它需要知道它自己和它的调用者。 这不仅抵消了内联函数带来的性能提升，而且破坏了封装，因此现在函数可能要依赖于特定的上下文。

因此强烈建议大家不要使用 `arguments.callee` 和它的属性。

**ES5 提示**: 在严格模式下，`arguments.callee` 会报错 `TypeError`，因为它已经被废除了。

## 构造函数

`JavaScript` 中的构造函数和其它语言中的构造函数是不同的。 通过 `new` 关键字方式调用的函数都被认为是构造函数。

在构造函数内部 - 也就是被调用的函数内 - `this` 指向新创建的对象 `Object`。 这个新创建的对象的 `prototype` 被指向到构造函数的 `prototype`。

如果被调用的函数没有显式的 `return` 表达式，则隐式的会返回 `this` 对象 - 也就是新创建的对象。
```javascript
function Foo() {
    this.bla = 1;
}

Foo.prototype.test = function() {
    console.log(this.bla);
};

var test = new Foo();
```
上面代码把 `Foo` 作为构造函数调用，并设置新创建对象的 `prototype` 为 `Foo.prototype`。

显式的 `return` 表达式将会影响返回结果，但仅限于返回的是一个对象。
```javascript
function Bar() {
    return 2;
}
new Bar(); // 返回新创建的对象

function Test() {
    this.value = 2;

    return {
        foo: 1
    };
}
new Test(); // 返回的对象
```
译者注：`new Bar()` 返回的是新创建的对象，而不是数字的字面值 `2`。 因此 `new Bar().constructor === Bar`，但是如果返回的是数字对象，结果就不同了，如下所示
```javascript
function Bar() {
    return new Number(2);
}
new Bar().constructor === Number
```
译者注：这里得到的 `new Test()` 是函数返回的对象，而不是通过 `new` 关键字新创建的对象，因此：
```javascript
(new Test()).value === undefined
(new Test()).foo === 1
```
如果 `new` 被遗漏了，则函数不会返回新创建的对象。
```javascript
function Foo() {
    this.bla = 1; // 获取设置全局参数
}
Foo(); // undefined
```
虽然上例在有些情况下也能正常运行，但是由于 `JavaScript` 中 `this` 的工作原理， 这里的 `this` 指向***全局对象***。

### 变量声明提升（Hoisting）

`JavaScript` 会提升变量声明。这意味着 `var` 表达式和 `function` 声明都将会被提升到当前作用域的顶部。
```javascript
bar();
var bar = function() {};
var someValue = 42;

test();
function test(data) {
    if (false) {
        goo = 1;

    } else {
        var goo = 2;
    }
    for(var i = 0; i < 100; i++) {
        var e = data[i];
    }
}
```
上面代码在运行之前将会被转化。`JavaScript` 将会把 `var` 表达式和 `function` 声明提升到当前作用域的顶部。
```javascript
// var 表达式被移动到这里
var bar, someValue; // 缺省值是 'undefined'

// 函数声明也会提升
function test(data) {
    var goo, i, e; // 没有块级作用域，这些变量被移动到函数顶部
    if (false) {
        goo = 1;

    } else {
        goo = 2;
    }
    for(i = 0; i < 100; i++) {
        e = data[i];
    }
}

bar(); // 出错：TypeError，因为 bar 依然是 'undefined'
someValue = 42; // 赋值语句不会被提升规则（hoisting）影响
bar = function() {};

test();
```
没有块级作用域不仅导致 `var` 表达式被从循环内移到外部，而且使一些 `if` 表达式更难看懂。

在原来代码中，`if` 表达式看起来修改了全局变量 `goo`，实际上在提升规则被应用后，却是在修改局部变量。

译者注：在 `Nettuts+` 网站有一篇介绍 `hoisting` 的文章，其中的代码很有启发性。

// 译者注：来自 `Nettuts+` 的一段代码，生动的阐述了 `JavaScript` 中变量声明提升规则
```javascript
var myvar = 'my value';  

(function() {  
    alert(myvar); // undefined  
    var myvar = 'local value';  
})();  
```

### 命名空间

只有一个全局作用域导致的常见错误是命名冲突。在 `JavaScript`中，这可以通过 匿名包装器 轻松解决。
```javascript
(function() {
    // 函数创建一个命名空间

    window.foo = function() {
        // 对外公开的函数，创建了闭包
    };

})(); // 立即执行此匿名函数
```
匿名函数被认为是 表达式；因此为了可调用性，它们首先会被执行。
```javascript
( // 小括号内的函数首先被执行
function() {}
) // 并且返回函数对象
() // 调用上面的执行结果，也就是函数对象
```
有一些其他的调用函数表达式的方法，比如下面的两种方式语法不同，但是效果一模一样。
```javascript
// 另外两种方式
+function(){}();
(function(){}());
```
结论

推荐使用匿名包装器（译者注：也就是自执行的匿名函数）来创建命名空间。这样不仅可以防止命名冲突， 而且有利于程序的模块化。

另外，使用全局变量被认为是不好的习惯。这样的代码容易产生错误并且维护成本较高。
