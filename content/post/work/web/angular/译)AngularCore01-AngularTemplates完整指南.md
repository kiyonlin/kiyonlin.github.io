---
title: (译)Angular Core 01 - Angular Templates 完全指南
tags: [angular, core, templates]
categories: [web, angular]
date: 2018-10-24 08:25:08
comment: false
---
在这篇文章([原文链接](https://blog.angular-university.io/angular-ng-template-ng-container-ngtemplateoutlet/))中，我们将深入探讨`Angular Core`的一些高级功能！

您可能已经遇到过`ng-template`这个`Angular`核心指令，例如在使用`ngIf/else`或`ngSwitch`时。

`ng-template`指令和相关的`ngTemplateOutlet`指令是非常强大的`Angular`功能，支持各种高级用例。

这些指令经常与`ng-container`一起使用，因为这些指令被设计为一起使用，所以如果我们一次性学习它们将会有所帮助，因为我们将围绕每个指令有更多的上下文。

然后让我们看看这些指令启用的一些更高级的用例。 注意：本文的所有代码都可以在此[Github repository](https://github.com/angular-university/ng-template-example)中找到。

<!-- more -->

## `ng-template`指令简介
与名称一样，`ng-template`指令表示`Angular`模板：这意味着此标记的内容将包含模板的一部分，然后可以与其他模板一起组合以形成最终的组件模板。

`Angular`已经在我们一直使用的许多结构指令中使用了`ng-template`：`ngIf`，`ngFor`和`ngSwitch`。

让我们开始学习`ng-template`并举例说明。 这里我们定义一个选项卡组件的两个选项卡按钮（稍后会详细介绍）：
```ts
@Component({
  selector: 'app-root',
  template: `      
      <ng-template>
          <button class="tab-button" 
                  (click)="login()">{{loginText}}</button>
          <button class="tab-button" 
                  (click)="signUp()">{{signUpText}}</button>
      </ng-template>
  `})
export class AppComponent {
    loginText = 'Login';
    signUpText = 'Sign Up'; 
    lessons = ['Lesson 1', 'Lessons 2'];

    login() {
        console.log('Login');
    }

    signUp() {
        console.log('Sign Up');
    }
}
```


## 你会注意到关于`ng-template`的第一件事
如果您尝试上面的示例，您可能会惊讶地发现此示例不会向屏幕*呈现任何内容*！

这是正常的，这是预期的行为。 这是因为使用`ng-template`标签我们只是定义一个模板，但我们还没有使用它。

然后让我们找一个示例，我们可以使用一些最常用的`Angular`指令来渲染输出。

### `ng-template`指令和`ngIf`
您可能在实现`if/else`方案时第一次遇到`ng-template`，例如这个：
```html
<div class="lessons-list" *ngIf="lessons else loading">
  ... 
</div>

<ng-template #loading>
    <div>Loading...</div>
</ng-template>
```

这是`ngIf/else`功能的一种非常常见的用法：我们在等待数据从后端到达时显示备用`loading`模板。

我们可以看到，`else`子句指向一个名称为`loading`的模板。 使用`#loading`语法通过模板引用为其分配了名称。

但除了那个模板之外，使用`ngIf`还会创建第二个隐式`ng`模板！ 让我们来看看幕后发生的事情：
```html
<ng-template [ngIf]="lessons" [ngIfElse]="loading">
   <div class="lessons-list">
     ... 
   </div>
</ng-template>

<ng-template #loading>
    <div>Loading...</div>
</ng-template>
```

这就是内部发生的事情，因为`Angular`解析了简洁的`*ngIf`结构指令语法糖。 让我们分解一下语法糖解析期间发生了什么：
- 应用结构指令`ngIf`的元素已移至`ng-template`中
- 使用`[ngIf]`和`[ngIfElse]`模板输入变量语法将`*ngIf`的表达式拆分并应用于两个单独的指令

这只是`ngIf`特定情况的一个例子。 但是使用`ngFor`和`ngSwitch`也会发生类似的过程。

这些指令都是非常常用的，因此这意味着这些模板在`Angular`中无处不在，无论是隐式还是显式。

但基于这个例子，可能会想到一个问题：

> 如果有多个结构指令应用于同一个元素，这是如何工作的？

## 多种结构指令
让我们看看如果我们尝试在同一元素中使用`ngIf`和`ngFor`会发生什么：
```html
<div class="lesson" *ngIf="lessons" 
       *ngFor="let lesson of lessons">
    <div class="lesson-detail">
        {{lesson | json}}
    </div>
</div>  
```

这行不通！ 相反，我们会收到以下错误消息：
```sh
Uncaught Error: Template parse errors:
Can't have multiple template bindings on one element. Use only one attribute 
named 'template' or prefixed with *
```

这意味着它不可能将两个结构指令应用于同一个元素。 为了做到这一点，我们必须做类似的事情：
```html
<div *ngIf="lessons">
    <div class="lesson" *ngFor="let lesson of lessons">
        <div class="lesson-detail">
            {{lesson | json}}
        </div>
    </div>
</div>
```

在这个例子中，我们已经将`ngIf`指令移动到外部包装`div`，但为了使其工作，我们必须创建额外的`div`元素。

这个解决方案已经可以工作了，但有没有办法将结构指令应用到页面的一部分而不必创建额外的元素？

这正是`ng-container`结构指令允许我们做的！

## `ng-container`指令
为了避免创建额外的`div`，我们可以改为使用`ng-container`指令：
```html
<ng-container *ngIf="lessons">
    <div class="lesson" *ngFor="let lesson of lessons">
        <div class="lesson-detail">
            {{lesson | json}}
        </div>
    </div>
</ng-container>
```

正如我们所看到的，`ng-container`指令为我们提供了一个元素，我们可以将结构指令附加到页面的一部分，而不必为此创建额外的元素。

`ng-container`指令还有另一个主要用途：它还可以提供一个占位符，用于动态地将模板注入页面。

## 使用`ngTemplateOutlet`指令创建动态模板
能够创建模板引用并将它们指向其他指令（例如`ngIf`）只是一个开始。

我们也可以使用模板本身并使用`ngTemplateOutlet`指令在页面的任何位置实例化它：
```html
<ng-container *ngTemplateOutlet="loading"></ng-container>
```

我们可以在这里看到`ng-container`如何帮助这个例子：我们使用它来在页面上实例化我们在上面定义的加载模板。

我们通过其模板引用`#loading`引用加载模板，我们使用``ngTemplateOutlet``结构指令来实例化模板。

我们可以根据需要向页面添加尽可能多的`ngTemplateOutlet`标记，并实例化许多不同的模板。 传递给该指令的值可以是任何计算模板引用的表达式，稍后将详细介绍。

现在我们知道了如何实例化模板，让我们来谈谈模板可以访问的内容。

## 模板上下文
关于模板的一个关键问题是，它们内部可见什么？

> 模板是否有自己独立的变量范围，模板可以看到哪些变量？

在`ng-template`标签主体内部，我们可以访问外部模板中可见的相同上下文变量，例如`lessons`变量。

这是因为所有`ng-template`实例也可以访问嵌入它们的相同上下文。

但是每个模板也可以定义自己的输入变量集！ 实际上，每个模板都关联一个包含所有模板特定输入变量的上下文对象。

我们来看一个例子：
```ts
@Component({
  selector: 'app-root',
  template: `      
<ng-template #estimateTemplate let-lessonsCounter="estimate">
    <div> Approximately {{lessonsCounter}} lessons ...</div>
</ng-template>
<ng-container 
   *ngTemplateOutlet="estimateTemplate;context:ctx">
</ng-container>
`})
export class AppComponent {

    totalEstimate = 10;
    ctx = {estimate: this.totalEstimate};
  
}
```

以下是此示例的解释：
- 这个模板，与以前的模板不同，还有一个输入变量（也可能有几个）
- 输入变量名为`lessonsCounter`，它是通过`ng-template`属性使用前缀`let-`定义的
- 变量`lessonsCounter`在`ng-template`主体内部可见，但外部不可见
- 此变量的内容由其分配给属性`let-lessonsCounter`的表达式确定
- 该表达式针对上下文对象进行评估，与模板一起传递给`ngTemplateOutlet`以进行实例化
- 然后，对于要在模板内显示的任何值，此上下文对象必须具有名为`estimate`的属性
- `context`对象通过`context`属性传递给`ngTemplateOutlet`，该属性可以接收任何求值为*对象*的表达式

鉴于上面的示例，这将呈现给屏幕：
```
Approximately 10 lessons ...
```

这为我们提供了如何定义和实例化我们自己的模板的良好概述。

我们还可以做的另一件事是在组件本身的层次上以编程方式与模板交互：让我们看看我们如何做到这一点。

## Template References
与我们使用模板引用引用加载模板的方式相同，我们也可以使用`ViewChild`装饰器将模板直接注入到我们的组件中：
```ts
@Component({
  selector: 'app-root',
  template: `      
      <ng-template #defaultTabButtons>
          <button class="tab-button" (click)="login()">
            {{loginText}}
          </button>
          <button class="tab-button" (click)="signUp()">
            {{signUpText}}
          </button>
      </ng-template>
`})
export class AppComponent implements OnInit {

    @ViewChild('defaultTabButtons')
    private defaultTabButtonsTpl: TemplateRef<any>;

    ngOnInit() {
        console.log(this.defaultTabButtonsTpl);
    }

}
```

正如我们所看到的，通过向`ViewChild`装饰器提供模板引用名称`defaultTabButtons`，可以像任何其他`DOM`元素或组件一样注入模板。

这意味着模板也可以在组件类的级别访问，我们可以做一些事情，例如将它们传递给子组件！

我们想要这样做的一个例子是创建一个更可定制的组件，其中不仅可以传递配置参数或配置对象：我们还可以*将模板作为输入参数传递*。

## 具有模板部分`@Inputs`的可配置组件
让我们以`tab`容器为例，我们希望为组件的用户提供配置`tab`按钮外观的可能性。

下面是这样的，我们首先要为父组件中的按钮定义自定义模板：
```ts
@Component({
  selector: 'app-root',
  template: `      
<ng-template #customTabButtons>
    <div class="custom-class">
        <button class="tab-button" (click)="login()">
          {{loginText}}
        </button>
        <button class="tab-button" (click)="signUp()">
          {{signUpText}}
        </button>
    </div>
</ng-template>
<tab-container [headerTemplate]="customTabButtons"></tab-container>      
`})
export class AppComponent implements OnInit {

}
```

然后在`tab`容器组件上，我们可以定义一个`input`属性，它也是一个名为`headerTemplate`的模板：
```ts
@Component({
    selector: 'tab-container',
    template: `
    
<ng-template #defaultTabButtons>
    
    <div class="default-tab-buttons">
        ...
    </div>
    
</ng-template>
<ng-container 
  *ngTemplateOutlet="headerTemplate ? headerTemplate: defaultTabButtons">
    
</ng-container>
... rest of tab container component ...
`})
export class TabContainerComponent {
    @Input()
    headerTemplate: TemplateRef<any>;
}
```

在最后的组合示例中，这里有几件事情正在发生。 让我们逐一来看：
- 为选项卡按钮定义了一个默认模板，名为`defaultTabButtons`
- 仅当`input`属性`headerTemplate`未定义时，才会使用此模板
- 如果定义了属性，则通过`headerTemplate`传递的自定义输入模板将用于显示按钮
- `headerTemplate`使用`ngTemplateOutlet`属性在`ng-container`占位符中实例化
- 决定使用哪个模板（默认或自定义）是使用三元表达式，但如果该逻辑很复杂，我们也可以将其委托给控制器方法

此设计的最终结果是，如果未提供自定义模板，则`tab`容器将显示`tab`按钮的默认外观，但如果自定义模板可用，它将使用自定义模板。

## 总结和结论
核心指令`ng-container`，`ng-template`和`ngTemplateOutlet`结合在一起，使我们能够创建高度动态和可定制的组件。

我们甚至可以根据输入模板完全改变组件的外观和感觉，我们可以定义模板并在应用程序的多个位置实例化。

这只是这些功能可以组合的一种可能方式！
