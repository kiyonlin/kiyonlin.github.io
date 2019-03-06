(window.webpackJsonp=window.webpackJsonp||[]).push([[39],{225:function(a,t,s){"use strict";s.r(t);var n=s(2),r=Object(n.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var a=this,t=a.$createElement,s=a._self._c||t;return s("div",{staticClass:"content"},[s("h2",{attrs:{id:"apply和call"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#apply和call","aria-hidden":"true"}},[a._v("#")]),a._v(" apply和call")]),a._v(" "),s("p",[a._v("apply和call的作用一致，只是接受的参数方式不同")]),a._v(" "),s("div",{staticClass:"language-javascript line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[a._v("func"),s("span",{attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{attrs:{class:"token function"}},[a._v("apply")]),s("span",{attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{attrs:{class:"token keyword"}},[a._v("this")]),s("span",{attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" "),s("span",{attrs:{class:"token punctuation"}},[a._v("[")]),a._v("arg1"),s("span",{attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" arg2"),s("span",{attrs:{class:"token punctuation"}},[a._v("]")]),s("span",{attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\nfunc"),s("span",{attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{attrs:{class:"token function"}},[a._v("call")]),s("span",{attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{attrs:{class:"token keyword"}},[a._v("this")]),s("span",{attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" arg1"),s("span",{attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" arg2"),s("span",{attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br")])]),s("h2",{attrs:{id:"bind"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#bind","aria-hidden":"true"}},[a._v("#")]),a._v(" bind")]),a._v(" "),s("p",[a._v("bind()方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的 this, 之后的一序列参数将会在传递的实参前传入作为它的参数。")]),a._v(" "),s("h3",{attrs:{id:"语法"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#语法","aria-hidden":"true"}},[a._v("#")]),a._v(" 语法")]),a._v(" "),s("p",[s("code",[a._v("fun.bind(thisArg[, arg1[, arg2[, ...]]])")])]),a._v(" "),s("h3",{attrs:{id:"参数"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#参数","aria-hidden":"true"}},[a._v("#")]),a._v(" 参数")]),a._v(" "),s("h4",{attrs:{id:"thisarg"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#thisarg","aria-hidden":"true"}},[a._v("#")]),a._v(" thisArg")]),a._v(" "),s("p",[a._v("当绑定函数被调用时，该参数会作为原函数运行时的 this 指向。当使用new 操作符调用绑定函数时，该参数无效。")]),a._v(" "),s("h4",{attrs:{id:"arg1-arg2"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#arg1-arg2","aria-hidden":"true"}},[a._v("#")]),a._v(" arg1, arg2, ...")]),a._v(" "),s("p",[a._v("当绑定函数被调用时，这些参数将置于实参之前传递给被绑定的方法。")]),a._v(" "),s("h3",{attrs:{id:"返回值"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#返回值","aria-hidden":"true"}},[a._v("#")]),a._v(" 返回值")]),a._v(" "),s("p",[a._v("返回由指定的this值和初始化参数改造的原函数拷贝")]),a._v(" "),s("h3",{attrs:{id:"描述"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#描述","aria-hidden":"true"}},[a._v("#")]),a._v(" 描述")]),a._v(" "),s("p",[a._v("bind() 函数会创建一个新函数（称为绑定函数），新函数与被调函数（绑定函数的目标函数）具有相同的函数体（在 ECMAScript 5 规范中内置的call属性）。当目标函数被调用时 this 值绑定到 bind() 的第一个参数，该参数不能被重写。绑定函数被调用时，bind() 也接受预设的参数提供给原函数。一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。")]),a._v(" "),s("h3",{attrs:{id:"注意点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#注意点","aria-hidden":"true"}},[a._v("#")]),a._v(" 注意点")]),a._v(" "),s("p",[a._v("多次 bind() 是无效的。更深层次的原因， bind() 的实现，相当于使用函数在内部包了一个 call / apply ，第二次 bind() 相当于再包住第一次 bind() ,故第二次以后的 bind 是无法生效的。")]),a._v(" "),s("h2",{attrs:{id:"总结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#总结","aria-hidden":"true"}},[a._v("#")]),a._v(" 总结")]),a._v(" "),s("ul",[s("li",[a._v("apply 、 call 、bind 三者都是用来改变函数的this对象的指向的；")]),a._v(" "),s("li",[a._v("apply 、 call 、bind 三者第一个参数都是this要指向的对象，也就是想指定的上下文；")]),a._v(" "),s("li",[a._v("apply 、 call 、bind 三者都可以利用后续参数传参；")]),a._v(" "),s("li",[a._v("bind是返回对应函数，便于稍后调用；apply、call则是立即调用 。")])])])}],!1,null,null,null);r.options.__file="javascript中的apply-call-bind.md";t.default=r.exports}}]);