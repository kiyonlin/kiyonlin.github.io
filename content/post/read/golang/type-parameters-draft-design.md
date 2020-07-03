---
title: "(译)Golang类型参数草案设计"
date: 2020-07-03T08:25:05+08:00
lastmod: 2020-07-03T08:25:05+08:00
tags: [golang, generic]
categories: [golang, generic]
draft: true
---
{{< blockquote author="Ian Lance Taylor, Robert Griesemer" source="June 16, 2020" link="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md" >}}
  Type Parameters - Draft Design: https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md
{{< /blockquote >}}

## 摘要
我们建议扩展Go语言，以便为类型和函数添加可选的类型参数。类型参数可能受接口类型的约束。我们还建议扩展用作类型约束的接口类型，以允许列出可能分配给它们的类型集。在许多情况下，都支持通过统一算法进行类型推断，从而可以从函数调用中省略类型实参。该设计与Go 1完全向后兼容。
{{< expand "原文" >}}
<p>We suggest extending the Go language to add optional type parameters to types and functions. Type parameters may be constrained by interface types. We also suggest extending interface types, when used as type constraints, to permit listing the set of types that may be assigned to them. Type inference via a unification algorithm is supported to permit omitting type arguments from function calls in many cases. The design is fully backward compatible with Go 1.</p>
{{< /expand >}}

## 如何阅读这份设计草案
这份草案很长，下面一些有关如何阅读的指南。
{{< expand "原文" >}}
<p>this document is long. here is some guidance on how to read it.</p>
{{< /expand >}}

- 我们从一个高层次的概述开始，非常简要地描述这些概念。
- 然后，我们从头开始解释完整的设计，并通过简单的示例介绍我们需要的细节。
- 完整描述设计之后，我们将讨论实现，设计中的一些问题以及与其他泛型方法的比较。
- 然后，我们提供有关如何在实践中使用此设计的几个完整示例。
- 在示例之后的附录中讨论了一些次要细节。
{{< expand "原文" >}}
<li>We start with a high level overview, describing the concepts very briefly.</li>
<li>We then explain the full design starting from scratch, introducing the details as we need them, with simple examples.</li>
<li>After the design is completely described, we discuss implementation, some issues with the design, and a comparison with other approaches to generics.</li>
<li>We then present several complete examples of how this design would be used in practice.</li>
<li>Following the examples some minor details are discussed in an appendix.</li>
{{< /expand >}}

## 高层次概述
本节非常简短地解释了设计草案建议的更改，适用于已经熟悉泛型如何在Go之类的语言中工作的人们。这些概念将在以下各节中详细说明。
{{< expand "原文" >}}
<p>This section explains the changes suggested by the design draft very briefly. This section is intended for people who are already familiar with how generics would work in a language like Go. These concepts will be explained in detail in the following sections.</p>
{{< /expand >}}

- 函数可以具有由关键字`type`引入的其他类型参数列表：`func F（type T）（p T）{...}`。
- 这些类型参数可以在函数参数和函数体内使用。
- 类型也可以具有类型参数列表：`type M(type T) []T`。
- 每个类型参数可以具有可选的类型约束：`func F(type T Constraint)(p T) { ... }`。
- 类型约束是接口类型。
- 用作类型约束的接口类型可以具有预先声明的类型列表，只有基础类型是类型列表中的类型才能实现该接口。
- 使用泛型函数或类型需要传递类型实参。
- 在通常情况下，类型推断允许省略类型参数。
- 如果类型参数具有类型约束，则其类型参数必须实现约束接口。
- 泛型函数只能使用类型约束所允许的操作。
{{< expand "原文" >}}
<li>Functions can have an additional type parameter list introduced by the keyword <code>type</code>: <code>func F(type T)(p T) { ... }</code>.</li>
<li>These type parameters can be used by the regular parameters and in the function body.</li>
<li>Types can also have a type parameter list: <code>type M(type T) []T</code>.</li>
<li>Each type parameter can have an optional type constraint: <code>func F(type T Constraint)(p T) { ... }</code>.</li>
<li>Type constraints are interface types.</li>
<li>Interface types used as type constraints can have a list of predeclared types; only types whose underlying type is one of those types can implement the interface.</li>
<li>Using a generic function or type requires passing type arguments.</li>
<li>Type inference permits omitting the type arguments in common cases.</li>
<li>If a type parameter has a type constraint its type argument must implement the interface.</li>
<li>Generic functions may only use operations permitted by the type constraint.</li>
{{< /expand >}}

在以下各节中，我们将详细介绍这些语言更改。你可能希望跳到这些[示例](#示例)，看看设计草案的代码在实践中的使用。

{{< expand "原文" >}}
<p>In the following sections we work through each of these language changes in great detail. You may prefer to skip ahead to the examples to see what generic code written to this design draft will look like in practice.</p>
{{< /expand >}}

## 背景
该版本的设计草案与2019年7月31日提出的版本有很多相似之处，但`contracts`已被删除并由`interface types`代替。
{{< expand "原文" >}}
<p>This version of the design draft has many similarities to the one presented on July 31, 2019, but contracts have been removed and replaced by interface types.</p>
{{< /expand >}}

有许多要求为Go[添加泛型编程支持的请求](https://github.com/golang/go/wiki/ExperienceReports#generics)。并在[issue](https://golang.org/issue/15292)和[活动文档](https://docs.google.com/document/d/1vrAy9gMpMoS3uaVphB32uVXX4pi-HnNjkMEgyAHX4N4/view)中进行了广泛的讨论。
{{< expand "原文" >}}
<p>There have been many requests to add additional support for generic programming in Go. There has been extensive discussion on the issue tracker and on a living document.</p>
{{< /expand >}}

可以通过上面的链接找到多种添加类型参数的建议。这里提出的许多想法以前都曾出现过。此处描述的主要新功能是对语法和约束接口类型的仔细研究。
{{< expand "原文" >}}
<p>There have been several proposals for adding type parameters, which can be found through the links above. Many of the ideas presented here have appeared before. The main new features described here are the syntax and the careful examination of interface types as constraints.</p>
{{< /expand >}}

本设计草案建议扩展Go语言，以添加一种形式的参数多态性，其中类型参数不受声明的子类型关系（如在某些面向对象的语言中）的约束，而受显式定义的结构约束的约束。
{{< expand "原文" >}}
<p>This design draft suggests extending the Go language to add a form of parametric polymorphism, where the type parameters are bounded not by a declared subtyping relationship (as in some object oriented languages) but by explicitly defined structural constraints.</p>
{{< /expand >}}

此设计不支持模板元编程或任何其他形式的编译时编程。
{{< expand "原文" >}}
<p>This design does not support template metaprogramming or any other form of compile time programming.</p>
{{< /expand >}}

由于术语`泛型`在Go社区中被广泛使用，因此我们将在下文中将其用作表示具有类型参数的函数或类型的简写。不要将本设计中使用的`泛型`一词与其他语言（例如C++，C＃，Java或Rust）中的同一术语混淆；它们有相似之处，但不相同。
{{< expand "原文" >}}
<p>As the term generic is widely used in the Go community, we will use it below as a shorthand to mean a function or type that takes type parameters. Don't confuse the term generic as used in this design with the same term in other languages like C++, C#, Java, or Rust; they have similarities but are not the same.</p>
{{< /expand >}}

## 设计
我们将基于简单的示例分阶段描述完整的设计。

{{< expand "原文" >}}
<p>We will describe the complete design in stages based on simple examples.</p>
{{< /expand >}}

### 类型参数
泛型代码是指使用延迟指定类型的代码。未指定的类型称为`type parameter`。运行泛型代码时，`type parameter`将设置为`type argument`。
{{< expand "原文" >}}
<p>Generic code is code that is written using types that will be specified later. An unspecified type is called a <I>type parameter</I>. When running the generic code, the type parameter will be set to a <I>type argument</I>.</p>
{{< /expand >}}

这是一个打印出切片中每个元素的函数，其中切片的元素类型（这里称为`T`）是未知的。这是我们要允许以支持泛型编程的函数类型的一个简单例子。（稍后我们还将讨论[泛型类型](#泛型类型)）。
{{< expand "原文" >}}
<p>Here is a function that prints out each element of a slice, where the element type of the slice, here called <code>T</code>, is unknown. This is a trivial example of the kind of function we want to permit in order to support generic programming. (Later we'll also discuss generic types).</p>
{{< /expand >}}

```go
// Print 打印切片的元素。
// 可以使用任何切片值来调用它。
func Print(s []T) { // 只是一个示例，而不是建议的语法。
	for _, v := range s {
		fmt.Println(v)
	}
}
```

使用这种方法，首先要做出的决定是：应如何声明类型参数`T`？在Go这样的语言中，我们希望每个标识符都以某种方式声明。
{{< expand "原文" >}}
<p>With this approach, the first decision to make is: how should the type parameter <code>T</code> be declared? In a language like Go, we expect every identifier to be declared in some way.</p>
{{< /expand >}}

在这里，我们进行设计决策：类型参数与普通的非类型函数参数相似，因此应与其他参数一起列出。但是，类型参数与非类型参数不同，因此，尽管它们出现在参数列表中，但我们还是要加以区分。这导致我们做出下一个设计决策：我们定义一个附加的，可选的参数列表，描述类型参数。此参数列表出现在常规参数之前。它以关键字`type`开头，并列出类型参数。
{{< expand "原文" >}}
<p>Here we make a design decision: type parameters are similar to ordinary non-type function parameters, and as such should be listed along with other parameters. However, type parameters are not the same as non-type parameters, so although they appear in the list of parameters we want to distinguish them. That leads to our next design decision: we define an additional, optional, parameter list, describing type parameters. This parameter list appears before the regular parameters. It starts with the keyword <code>type</code>, and lists type parameters.</p>
{{< /expand >}}

```go
// Print 打印任意切片的元素。
// Print 具有类型参数T，并且具有单个（非类型）参数s，是该类型参数的切片
func Print(type T)(s []T) {
	// 和👆一样
}
```

这表示在函数`Print`中，标识符`T`是一个类型参数，当前是未知的类型，但是在调用该函数时会知道。如上所述，当描述普通的非类型参数时，类型参数可以用作类型。它也可以在函数体内使用。
{{< expand "原文" >}}
<p>This says that within the function <code>Print</code> the identifier <code>T</code> is a type parameter, a type that is currently unknown but that will be known when the function is called. As seen above, the type parameter may be used as a type when describing the ordinary non-type parameters. It may also be used within the body of the function.</p>
{{< /expand >}}

由于`Print`具有类型参数，因此任何`Print`调用都必须提供类型参数。稍后，我们将看到通常如何通过使用[函数参数类型推断](#函数参数类型推断)从非类型参数推导出该类型参数。现在，我们将显式传递类型参数。类型实参的传递与声明类型实参的传递非常相似：作为单独的参数列表。在函数调用时，不需要使用`type`关键字。
{{< expand "原文" >}}
<p>Since <code>Print</code> has a type parameter, any call of <code>Print</code> must provide a type argument. Later we will see how this type argument can usually be deduced from the non-type argument, by using function argument type inference. For now, we'll pass the type argument explicitly. Type arguments are passed much like type parameters are declared: as a separate list of arguments. At the call site, the <code>type</code> keyword is not used.</p>
{{< /expand >}}

```go
	// 用 []int 调用 Print.
	// Print 的类型参数为T，我们要传递 []int，
	// 因此我们通过编写 Print(int) 来传递 int 的类型参数。
	// 函数 Print(int) 期望 []int 作为参数。

	Print(int)([]int{1, 2, 3})

	// 打印:
	// 1
	// 2
	// 3
```

### 约束条件
让我们的例子稍微复杂一些。我们将其变成一个可以通过在每个元素上调用`String`方法将任何类型的切片转换为`[]string`的函数。
{{< expand "原文" >}}
<p>Let‘s make our example slightly more complicated. Let’s turn it into a function that converts a slice of any type into a <code>[]string</code> by calling a <code>String</code> method on each element.</p>
{{< /expand >}}

```go
// 这个方法是非法的。
func Stringify(type T)(s []T) (ret []string) {
	for _, v := range s {
		ret = append(ret, v.String()) // 非法
	}
	return ret
}
```

乍一看似乎可以，但是在此示例中，`v`具有类型`T`，我们对`T`一无所知。特别是，我们不知道`T`具有`String`方法。因此，对`v.String()`的调用是非法的。
{{< expand "原文" >}}
<p>This might seem OK at first glance, but in this example <code>v</code> has type <code>T</code>, and we don‘t know anything about <code>T</code>. In particular, we don’t know that <code>T</code> has a <code>String</code> method. So the call to <code>v.String()</code> is invalid.</p>
{{< /expand >}}

自然而然地，在支持泛型编程的其他语言中也会出现相同的问题。例如，在C++中，泛型函数（用C++术语来说是函数模板）可以对泛型类型的值调用任何方法。也就是说，在C++方法中，可以调用`v.String()`。如果使用没有`String`方法的类型实参调用该函数，则使用该类型实参编译对`v.String`的调用时将报告错误。这些错误可能很长，因为在错误发生之前可能有几层泛型函数调用，因此必须报告所有错误以了解出了什么问题。
{{< expand "原文" >}}
<p>Naturally, the same issue arises in other languages that support generic programming. In C++, for example, a generic function (in C++ terms, a function template) can call any method on a value of generic type. That is, in the C++ approach, calling <code>v.String()</code> is fine. If the function is called with a type argument that does not have a <code>String</code> method, the error is reported when compiling the call to <code>v.String</code> with that type argument. These errors can be lengthy, as there may be several layers of generic function calls before the error occurs, all of which must be reported to understand what went wrong.</p>
{{< /expand >}}

对于Go语言，C++方法将是一个糟糕的选择。原因之一是语言的风格。在Go中，我们不会引用名称，例如`String`，而是希望它们存在。找到它们时，Go会将所有名称解析为其声明。
{{< expand "原文" >}}
<p>The C++ approach would be a poor choice for Go. One reason is the style of the language. In Go we don't refer to names, such as, in this case, <code>String</code>, and hope that they exist. Go resolves all names to their declarations when they are seen.</p>
{{< /expand >}}

另一个原因是Go旨在支持大规模编程。我们必须考虑以下情况：泛型函数定义（上面的`Stringify`）和对泛型函数的调用（未显示，但可能在其他软件包中）相距甚远。通常，所有泛型代码都希望类型参数满足某些要求。我们将这些要求称为约束（其他语言也有类似的想法，称为类型界限或特征界限或概念）。在这种情况下，约束非常明显：类型必须具有`String() string`方法。在其他情况下，它可能不那么明显。
{{< expand "原文" >}}
<p>Another reason is that Go is designed to support programming at scale. We must consider the case in which the generic function definition (<code>Stringify</code>, above) and the call to the generic function (not shown, but perhaps in some other package) are far apart. In general, all generic code expects the type arguments to meet certain requirements. We refer to these requirements as constraints (other languages have similar ideas known as type bounds or trait bounds or concepts). In this case, the constraint is pretty obvious: the type has to have a <code>String() string</code> method. In other cases it may be much less obvious.</p>
{{< /expand >}}

我们不想从`Stringify`发生的任何事情中获得约束（在这种情况下，请调用`String`方法）。如果这样做，对`Stringify`的微小更改可能会更改约束。这意味着较小的更改可能导致调用该函数的代码太远而意外中断。 `Stringify`故意更改其约束并强迫用户进行更改是很好的。我们要避免的是`Stringify`意外更改其约束。
{{< expand "原文" >}}
<p>We don‘t want to derive the constraints from whatever <code>Stringify</code> happens to do (in this case, call the <code>String</code> method). If we did, a minor change to <code>Stringify</code> might change the constraints. That would mean that a minor change could cause code far away, that calls the function, to unexpectedly break. It’s fine for <code>Stringify</code> to deliberately change its constraints, and force users to change. What we want to avoid is <code>Stringify</code> changing its constraints accidentally.</p>
{{< /expand >}}

这意味着约束必须对调用者传递的类型参数和泛型函数中的代码都设置限制。调用者只能传递满足约束的类型参数。泛型函数只能以约束所允许的方式使用这些值。我们认为这是一条重要规则，适用于在Go中定义泛型编程的任何尝试：泛型代码只能使用已知其类型参数实现的操作。
{{< expand "原文" >}}
<p>This means that the constraints must set limits on both the type arguments passed by the caller and the code in the generic function. The caller may only pass type arguments that satisfy the constraints. The generic function may only use those values in ways that are permitted by the constraints. This is an important rule that we believe should apply to any attempt to define generic programming in Go: generic code can only use operations that its type arguments are known to implement.</p>
{{< /expand >}}

### 任何类型都允许的操作
在进一步讨论约束之前，让我们简要地指出在没有约束的情况下会发生什么。如果泛型函数没有为类型参数指定约束，就像上面的`Print`方法一样，则该参数允许使用任何类型参数。泛型函数只能与该类型参数的值一起使用的操作是允许用于任何类型的值的那些操作。在上面的示例中，`Print`函数声明一个变量`v`，其类型为类型参数`T`，并将该变量传递给函数。
{{< expand "原文" >}}
<p>Before we discuss constraints further, let's briefly note what happens in their absence. If a generic function does not specify a constraint for a type parameter, as is the case for the <code>Print</code> method above, then any type argument is permitted for that parameter. The only operations that the generic function can use with values of that type parameter are those operations that are permitted for values of any type. In the example above, the <code>Print</code> function declares a variable <code>v</code> whose type is the type parameter <code>T</code>, and it passes that variable to a function.</p>
{{< /expand >}}

任何类型允许的操作是：
{{< expand "原文" >}}
<p>The operations permitted for any type are:</p>
{{< /expand >}}

- 声明那些类型的变量
- 将相同类型的其他值分配给这些变量
- 将这些变量传递给函数或从函数返回它们
- 取那些变量的地址
- 将这些类型的值转换或分配给类型`interface{}`
- 将`T`类型的值转换为`T`类型（允许，但无用）
- 使用类型断言将接口值转换为类型
- 在类型`switch`中将类型用作`case`
- 定义和使用使用这些类型的复合类型，例如该类型的切片
- 将类型传递给一些内置函数，例如`new`
{{< expand "原文" >}}
<li>declare variables of those types</li>
<li>assign other values of the same type to those variables</li>
<li>pass those variables to functions or return them from functions</li>
<li>take the address of those variables</li>
<li>convert or assign values of those types to the type <code>interface{}</code></li>
<li>convert a value of type <code>T</code> to type <code>T</code> (permitted but useless)</li>
<li>use a type assertion to convert an interface value to the type</li>
<li>use the type as a case in a type switch</li>
<li>define and use composite types that use those types, such as a slice of that type</li>
<li>pass the type to some builtin functions such as <code>new</code></li>
{{< /expand >}}

尽管目前预计不会进行任何操作，但将来的语言更改可能还会添加其他此类操作。
{{< expand "原文" >}}
<p>It's possible that future language changes will add other such operations, though none are currently anticipated.</p>
{{< /expand >}}

### 定义约束
Go已经具有与我们需要的约束接近的构造：接口类型。接口类型是一组方法。可以分配给接口类型的变量的唯一值是那些类型实现相同方法的值。除了任何类型允许的操作之外，只能使用接口类型的值执行的操作是调用方法。
{{< expand "原文" >}}
<p>Go already has a construct that is close to what we need for a constraint: an interface type. An interface type is a set of methods. The only values that can be assigned to a variable of interface type are those whose types implement the same methods. The only operations that can be done with a value of interface type, other than operations permitted for any type, are to call the methods.</p>
{{< /expand >}}

用类型参数调用泛型函数类似于分配给接口类型的变量：类型参数必须实现类型参数的约束。编写泛型函数就像使用接口类型的值：泛型代码只能使用约束所允许的操作（或任何类型所允许的操作）。
{{< expand "原文" >}}
<p>Calling a generic function with a type argument is similar to assigning to a variable of interface type: the type argument must implement the constraints of the type parameter. Writing a generic function is like using values of interface type: the generic code can only use the operations permitted by the constraint (or operations that are permitted for any type).</p>
{{< /expand >}}

在这种设计中，约束只是接口类型。实现约束只是实现接口类型。（稍后，我们将看到如何为方法调用以外的操作定义约束，例如二进制运算符）。
{{< expand "原文" >}}
<p>In this design, constraints are simply interface types. Implementing a constraint is simply implementing the interface type. (Later we'll see how to define constraints for operations other than method calls, such as binary operators).</p>
{{< /expand >}}

{{< expand "原文" >}}
<p>For the Stringify example, we need an interface type with a String method that takes no arguments and returns a value of type string.</p>
{{< /expand >}}


## 示例

### 泛型类型

### 函数参数类型推断
