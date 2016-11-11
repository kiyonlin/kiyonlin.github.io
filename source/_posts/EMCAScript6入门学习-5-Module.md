---
title: EMCAScript6入门学习-5 Module
tag:
  - EMCAScript6
  - ES6
  - Module
category:
  - EMCAScript6
date: 2016-11-11 15:23:10
updated: 2016-11-11 15:23:10
---
源自[ECMAScript 6入门](http://es6.ruanyifeng.com/)

ES6模块的设计思想，是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。
ES6模块不是对象，而是通过`export`命令显式指定输出的代码，输入时也采用静态命令的形式。
除了静态加载带来的各种好处，ES6模块还有以下好处:
- 不再需要`UMD`模块格式了，将来服务器和浏览器都会支持ES6模块格式。目前，通过各种工具库，其实已经做到了这一点。
- 将来浏览器的新`API`就能用模块格式提供，不再必要做成全局变量或者`navigator`对象的属性。
- 不再需要对象作为命名空间（比如`Math`对象），未来这些功能可以通过模块提供。
# 严格模式
ES6的模块**自动**采用严格模式，不管有没有在模块头部加上`"use strict";`。

严格模式主要有以下限制:
- 变量必须声明后再使用
- 函数的参数不能有同名属性，否则报错
- 不能使用`with`语句
- 不能对只读属性赋值，否则报错
- 不能使用`前缀0`表示八进制数，否则报错
- 不能删除不可删除的属性，否则报错
- 不能删除变量`delete prop`，会报错，只能删除属性`delete global[prop]`
- `eval`不会在它的外层作用域引入变量
- `eval`和`arguments`不能被重新赋值
- `arguments`不会自动反映函数参数的变化
- 不能使用`arguments.callee`
- 不能使用`arguments.caller`
- 禁止`this`指向全局对象
- 不能使用`fn.caller`和`fn.arguments`获取函数调用的堆栈
- 增加了保留字（比如`protected`、`static`和`interface`）

# export命令
模块功能主要由两个命令构成：`export`和`import`。`export`命令用于规定模块的对外接口，`import`命令用于输入其他模块提供的功能。

一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用`export`关键字输出该变量。下面是一个JS文件，里面使用`export`命令输出变量。
```javascript
// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;

// 或者
// 使用大括号指定所要输出的一组变量
// 应该优先考虑使用这种写法
export {firstName, lastName, year};

// 可以使用as关键字重命名。
export {
  firstName as streamV1,
  lastName as streamV2,
  year as streamLatestVersion
};
```
# import命令
使用`export`命令定义了模块的对外接口以后，其他JS文件就可以通过`import`命令加载这个模块（文件）。
```javascript
// main.js

// 大括号里面的变量名，必须与被导入模块（profile.js）对外接口的名称相同。
// 可以使用as关键字重命名。
import {firstName, lastName as surname, year} from './profile';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```
**注意**，`import`命令具有提升效果，会提升到整个模块的头部，首先执行。

# 模块的整体加载
```javascript
// 写法
import * as circle from './circle';

console.log('圆面积：' + circle.area(4));
console.log('圆周长：' + circle.circumference(14));
```
# export default命令
`export default`命令，为模块指定默认输出。
```javascript
// export-default.js
export default function () {
  console.log('foo');
}

// 其他模块加载该模块时，import命令可以为该匿名函数指定任意名字。

// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

`export default`命令用于指定模块的默认输出。显然，一个模块只能有一个默认输出，因此`export default`命令只能使用一次。所以，`import`命令后面才不用加大括号，因为只可能对应一个方法。

本质上，`export default`就是输出一个叫做`default`的变量或方法，然后系统允许你为它取任意名字。

有了`export default`命令，输入模块时就非常直观了，以输入jQuery模块为例。
```javascript
import $ from 'jquery';
```
如果想在一条`import`语句中，同时输入默认方法和其他变量，可以写成下面这样。
```javascript
import customName, { otherMethod } from './export-default';
```
# 模块的继承
```javascript
// circleplus.js

export * from 'circle';
export var e = 2.71828182846;
export default function(x) {
  return Math.exp(x);
}
```

上面代码中的`export *`，表示再输出`circle`模块的所有属性和方法。注意，`export *`命令会忽略`circle`模块的`default`方法。然后，上面代码又输出了自定义的`e`变量和默认方法。

这时，也可以将`circle`的属性或方法，改名后再输出。

```javascript
// circleplus.js

export { area as circleArea } from 'circle';
```

上面代码表示，只输出`circle`模块的`area`方法，且将其改名为`circleArea`。

加载上面模块的写法如下。

```javascript
// main.js

import * as math from 'circleplus';
import exp from 'circleplus';
console.log(exp(math.e));
```

上面代码中的`import exp`表示，将`circleplus`模块的默认方法加载为`exp`方法。

# 循环加载

ES6处理“循环加载”与`CommonJS`有本质的不同。ES6模块是动态引用，如果使用`import`从一个模块加载变量（即`import foo from 'foo'`），那些变量不会被缓存，而是成为一个指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值。

```javascript
// a.js如下
import {bar} from './b.js';
console.log('a.js');
console.log(bar);
export let foo = 'foo';

// b.js
import {foo} from './a.js';
console.log('b.js');
console.log(foo);
export let bar = 'bar';
```

上面代码中，`a.js`加载`b.js`，`b.js`又加载`a.js`，构成循环加载。执行`a.js`，结果如下。

```bash
$ babel-node a.js
b.js
undefined
a.js
bar
```

上面代码中，由于`a.js`的第一行是加载`b.js`，所以先执行的是`b.js`。而`b.js`的第一行又是加载`a.js`，这时由于`a.js`已经开始执行了，所以不会重复执行，而是继续往下执行`b.js`，所以第一行输出的是`b.js`。

接着，`b.js`要打印变量`foo`，这时`a.js`还没执行完，取不到`foo`的值，导致打印出来是`undefined`。`b.js`执行完，开始执行`a.js`，这时就一切正常了。

再看一个稍微复杂的例子（摘自 Dr. Axel Rauschmayer 的[《Exploring ES6》](http://exploringjs.com/es6/ch_modules.html)）。

```javascript
// a.js
import {bar} from './b.js';
export function foo() {
  console.log('foo');
  bar();
  console.log('执行完毕');
}
foo();

// b.js
import {foo} from './a.js';
export function bar() {
  console.log('bar');
  if (Math.random() > 0.5) {
    foo();
  }
}
```

按照CommonJS规范，上面的代码是没法执行的。`a`先加载`b`，然后`b`又加载`a`，这时`a`还没有任何执行结果，所以输出结果为`null`，即对于`b.js`来说，变量`foo`的值等于`null`，后面的`foo()`就会报错。

但是，ES6可以执行上面的代码。

```bash
$ babel-node a.js
foo
bar
执行完毕

// 执行结果也有可能是
foo
bar
foo
bar
执行完毕
执行完毕
```

上面代码中，`a.js`之所以能够执行，原因就在于ES6加载的变量，都是动态引用其所在的模块。只要引用存在，代码就能执行。

下面，我们详细分析这段代码的运行过程。

```javascript
// a.js

// 这一行建立一个引用，
// 从`b.js`引用`bar`
import {bar} from './b.js';

export function foo() {
  // 执行时第一行输出 foo
  console.log('foo');
  // 到 b.js 执行 bar
  bar();
  console.log('执行完毕');
}
foo();

// b.js

// 建立`a.js`的`foo`引用
import {foo} from './a.js';

export function bar() {
  // 执行时，第二行输出 bar
  console.log('bar');
  // 递归执行 foo，一旦随机数
  // 小于等于0.5，就停止执行
  if (Math.random() > 0.5) {
    foo();
  }
}
```

我们再来看ES6模块加载器SystemJS给出的一个例子。
```javascript
// even.js
import { odd } from './odd'
export var counter = 0;
export function even(n) {
  counter++;
  return n == 0 || odd(n - 1);
}

// odd.js
import { even } from './even';
export function odd(n) {
  return n != 0 && even(n - 1);
}
```
上面代码中，`even.js`里面的函数`even`有一个参数`n`，只要不等于0，就会减去1，传入加载的`odd()`。`odd.js`也会做类似操作。

运行上面这段代码，结果如下。
```bash
$ babel-node
> import * as m from './even.js';
> m.even(10);
true
> m.counter
6
> m.even(20)
true
> m.counter
17
```
上面代码中，参数`n`从10变为0的过程中，`even()`一共会执行6次，所以变量`counter`等于6。第二次调用`even()`时，参数`n`从20变为0，`even()`一共会执行11次，加上前面的6次，所以变量`counter`等于17。

这个例子要是改写成`CommonJS`，就根本无法执行，会报错。

```javascript
// even.js
var odd = require('./odd');
var counter = 0;
exports.counter = counter;
exports.even = function(n) {
  counter++;
  return n == 0 || odd(n - 1);
}

// odd.js
var even = require('./even').even;
module.exports = function(n) {
  return n != 0 && even(n - 1);
}
```

上面代码中，`even.js`加载`odd.js`，而`odd.js`又去加载`even.js`，形成“循环加载”。这时，执行引擎就会输出`even.js`已经执行的部分（不存在任何结果），所以在`odd.js`之中，变量`even`等于`null`，等到后面调用`even(n-1)`就会报错。

```bash
$ node
> var m = require('./even');
> m.even(10)
TypeError: even is not a function
```

# 跨模块常量
# ES6模块的转码
