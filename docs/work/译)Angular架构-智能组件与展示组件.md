---
title: (译)Angular架构-智能组件与展示组件
tag: [angular, architecture, component]
category: [angular, architecture]
date: 2018-10-15 14:04:46
comment: true
---
这篇文章是正在进行的`Angular`架构系列的一部分，我们将在视图层和服务层一级介绍常见的设计问题和解决方案。 这是完整系列：
- 视图层架构-智能组件与展示组件
- 视图层架构-容器与展示组件常见缺陷
- 服务层架构-如何使用`Observable`数据服务构建`Angular`应用程序
- 服务层架构-`Redux`和`Ngrx Store`-何时使用`Store`？为什么？
- 服务层架构-`Ngrx Store`-架构指南

<!-- more -->
## 视图层架构简介
在构建`Angular`应用程序时，我们在开始时遇到的最常见问题是：我们如何构建应用程序？

我们可能会找到的直接答案是：我们将所有内容拆分为组件！ 但我们很快发现还有更多问题：
- 有哪些类型的组件？
- 组件应如何互动？
- 我应该将服务注入任何组件吗？
- 如何使我的组件可以跨视图重用？

我们将尝试通过将组件基本上分成两种类型来解答这个问题和其他问题（但还有更多内容）：
- 智能组件：有时也称为应用程序级组件，容器组件或控制器组件
- 展示组件：有时也称为纯组件或哑组件

让我们找出这两种组件之间的差异，我们何时应该使用它们以及为什么！

你也可以通过[视频](https://youtu.be/TzrZNpSfswA)学习，它将一个组件重构为两个组件，视频中的示例我们将在下面描述。

## 将应用程序拆分为不同类型的组件
为了理解两种类型组件之间的区别，让我们从一个简单的应用程序开始，其中尚不存在组件分离。

我们开始构建应用程序的主屏幕，并为单个模板添加了多个功能：
```ts
@Component({
  selector: 'app-home',
  template: `
    <h2>All Lessons</h2>
    <h4>Total Lessons: {{lessons?.length}}</h4>
    <div class="lessons-list-container v-h-center-block-parent">
        <table class="table lessons-list card card-strong">
            <tbody>
            <tr *ngFor="let lesson of lessons" (click)="selectLesson(lesson)">
                <td class="lesson-title"> {{lesson.description}} </td>
                <td class="duration">
                    <i class="md-icon duration-icon">access_time</i>
                    <span>{{lesson.duration}}</span>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
`,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    lessons: Lesson[];

  constructor(private lessonsService: LessonsService) {
  }

  ngOnInit() {
      this.lessonsService.findAllLessons()
          .do(console.log)
          .subscribe(
              lessons => this.allLessons = lessons
          );
  }

  selectLesson(lesson) {
    ...
  }

}
```

### 理解问题
虽然这个主页组件仍然非常简单，但它已经开始具有相当大的尺寸。 例如，我们已经实现了一个包含`lesson`列表的表。

但是应用程序的其他部分可能还需要此功能，例如，假设我们有另一个屏幕显示给定`course`的目录。

在该屏幕中，我们还希望显示`lesson`列表，但仅显示属于该`course`的`lesson`。 在这种情况下，我们需要的东西与我们在主屏幕中实现的内容非常相似。

我们不应该只是跨组件复制粘贴，我们应该创建一个可重用的组件。

## 让我们创建一个展示组件
在这种情况下我们想要做的是将屏幕的表部分提取到一个单独的组件中，让我们称之为`LessonsListComponent`：
```ts
import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {Lesson} from "../shared/model/lesson";

@Component({
  selector: 'lessons-list',
  template: `
      <table class="table lessons-list card card-strong">
          <tbody>
          <tr *ngFor="let lesson of lessons" (click)="selectLesson(lesson)">
              <td class="lesson-title"> {{lesson.description}} </td>
              <td class="duration">
                  <i class="md-icon duration-icon">access_time</i>
                  <span>{{lesson.duration}}</span>
              </td>
          </tr>
          </tbody>
      </table>  
  `,
  styleUrls: ['./lessons-list.component.css']
})
export class LessonsListComponent {

  @Input()
  lessons: Lesson[];

  @Output('lesson')
  lessonEmitter = new EventEmitter<Lesson>();

    selectLesson(lesson:Lesson) {
        this.lessonEmitter.emit(lesson);
    }

}
```

现在让我们仔细看看这个组件：它没有通过构造函数注入`lesson`服务。 相反，它通过`@Input`接收输入属性中的`lessons`。

这意味着组件本身不知道`lessons`的来源：
- `lessons`可能是所有`lessons`的清单
- 或者`lessons`可能是特定`course`所有`lessons`的清单
- 甚至`lessons`可能是任何给定搜索列表中的页面

我们可以在所有这些场景中重用此组件，因为`lesson-list`组件不知道数据来自何处。 组件的责任纯粹是向用户呈现数据而不是从特定位置获取数据。

这就是我们通常将这种类型的组件称为展示组件的原因。 但是`Home`组件发生了什么？

## 让我们创建一个智能组件
如果我们回到`Home`组件，这就是重构后的样子：
```ts
import { Component, OnInit } from '@angular/core';
import {LessonsService} from "../shared/model/lessons.service";
import {Lesson} from "../shared/model/lesson";

@Component({
  selector: 'app-home',
  template: `
      <h2>All Lessons</h2>
      <h4>Total Lessons: {{lessons?.length}}</h4>
      <div class="lessons-list-container v-h-center-block-parent">
          <lessons-list [lessons]="lessons" (lesson)="selectLesson($event)"></lessons-list>
      </div>
`,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    lessons: Lesson[];

  constructor(private lessonsService: LessonsService) {
  }

  ngOnInit() {
     ...
  }

  selectLesson(lesson) {
    ...
  }

}
```

我们可以看到，我们已经用新的可重用`lessons-list`组件替换了主屏幕的列表部分。 主组件仍然知道如何从服务中检索`lesson`列表，以及这是什么类型的列表（如果这些`lesson`是某个`course`的`lesson`等）。

但Home组件不知道如何向用户提供`lesson`。

## Home组件是什么类型的组件？
让我们给这种类型的组件命名，类似于home组件，它是一个特定于应用程序的组件：让我们称之为智能组件。

这种类型的组件固有地绑定到应用程序本身，因此我们可以看到它在构造函数中接收一些特定于应用程序的依赖项，如`LessonsService`。

> 在另一个应用程序中使用此组件将非常困难。

我们视图的顶级组件可能永远是智能组件。 即使我们将数据加载转移到路由器数据解析器，该组件仍然至少必须将`ActivatedRoute`服务注入其中。

因此，我们希望通过使用一组展示组件在内部编写来实现顶级智能组件。 这就是那么简单。

## 智能组件和展示组件之间的典型交互
我们在这里看到的示例非常频繁，我们让智能组件通过`@Input`将数据注入展示组件，并接收展示组件可能通过`@Output`触发的任何操作。

在这种情况下，我们使用自定义`lesson`事件来指示我们已在列表中选择了给定`lesson`。

使用`@Output`，展示组件通过明确定义的界面与智能组件保持隔离：
- `lesson-list`展示组件只知道它发出了一个事件，但不知道事件的接收者是什么，或接收者为响应事件做了什么
- `Home`智能组件订阅`lesson`自定义事件并对事件做出反应，但它不知道是什么触发了事件。 用户是否双击`lesson`列表或用户是否单击了视图按钮？ 这对智能组件是透明的。

所以这一切都清楚简单，这里可能出现什么问题？

## 拆分智能与展示组件的明确方法？
有了这个，我们可能会在这一点上得出结论，构建我们的应用程序就像使所有顶级组件成为智能组件一样简单，并使用本地展示组件树构建它们。

但问题是，它有时并不那么简单，因为像`lesson`这样的自定义事件不会冒泡。 因此，如果您有一个深层组件，并且您希望上面有多个级别的组件来了解该事件，则该事件不会冒泡。

## 导致自定义事件不冒泡的问题是什么？
假设`lesson`列表和`Home`组件之间只有一层嵌套，我们有几个级别：`lesson`列表位于选项卡面板内的可折叠面板内。

`lesson`列表仍然希望通过`lesson`事件通知`Home`组件已选择`lesson`。 但是中间`TabPanel`和`CollapsiblePanel`中的两个组件是非特定于应用程序的展示组件。

> 想象它们是Angular Material库的组成部分！

这些展示组件不了解`lesson`事件，因此无法将其冒泡。 那么我们如何实现这一点，以及为什么自定义事件不能简单地冒泡？

## 为什么自定义事件不会冒泡，就像点击DOM事件一样？
这不是偶然的，它是设计的，可能是为了避免`event soup`场景，使用类似于`AngularJs`的`$scope.$emit()`和`$scope.$broadcast()`的服务总线的解决方案往往会意外创建。

这些类型的机制往往最终会在应用程序的不同位置之间创建紧密的依赖关系，这些依赖关系不应该彼此意识到，事件最终会被触发多次或依次触发，只看一个文件时就不明显了。

因此，展示组件的自定义事件只能由其父组件可见，而不能在更深的组件树可见。

如果由于某种原因我们确实需要冒泡行为，我们仍然可以使用`Javascript`原生的`element.dispatchEvent()`实现它。 但大多数情况下，这不是我们想要实施的。

## 那么我们如何解决选项卡面板场景中可折叠面板内`lesson`列表的情况呢？
我们仍然应该为`lesson`列表创建一个展示组件。 提供`lesson`的功能可以被隔离，因此`LessonsListComponent`的版本仍然适用，它只是在应用程序的各个地方使用的东西。 但是这个列表如何通知`Home`组件？

为此，有几种解决方案。 我们应该研究的一个解决方案，特别是在构建大规模应用程序时，应该研究像`ngrx/store`这样的解决方案。

但即使使用`store`解决方案，我们也可能不希望在展示组件中注入`store`。 因为选择`lesson`的结果可能并不总是将事件分派给`store`。

为了简化示例，让我们首先创建一个专门的类似于`store`的服务来解决这个`lesson`选择问题：
```ts
@Injectable()
export class LessonSelectedService {

    private _selected: BehaviorSubject<Lesson> = new BehaviorSubject(null);

    public selected$ = this._selected.asObservable().filter(lesson => !!lesson);
    
    
    select(lesson:Lesson) {
         this._selected.next(lesson);
    }

}
```

正如我们所看到的，`LessonSelectedService`公开了一个可观察的`selected$`，它将在每次选择新`lesson`时发出一个值。

请注意，我们在服务内部创建了一个`subject`，但我们没有将它暴露给外部。 这是因为`subject`本质上是一个事件总线，因此我们希望控制谁可以在服务中发出事件。

如果我们公开`subject`，我们会给应用程序的任何其他部分代表服务发出事件的能力，这是应该避免的。

那么如何使用这个服务，因为我们不能将它注入`LessonsListComponent`，对吧？ 我们将讨论该部分，现在让我们首先看看如何在`Home`组件中使用这个新服务。

## 在`Home`组件中使用新服务
`Home`组件将做的是，它将在其构造函数中注入新组件：
```ts
@Component({...})
export class HomeComponent implements OnInit {

    lessons: Lesson[];

  constructor(
        private lessonsService: LessonsService, 
        private lessonSelectedService: LessonSelectedService) {
  }

  ngOnInit() {
      ....
      this.lessonSelectedService.selected$.subscribe(lesson => this.selectLesson(lesson));
  }

  selectLesson(lesson) {
    ...
  }

}
```

正如我们所看到的，我们订阅了`selected$`这个`Observable`，它发出了新的`lesson`，我们触发了组件的特定逻辑来处理选择。

但请注意，`Home`组件不知道`lesson`列表，它只知道应用程序的其他部分触发了`lesson`选择。 应用程序的两个部分仍然是隔离的：
- 选择的`Emitter`不知道`Home`组件
- `Home`组件不知道该`lesson`
- 两个角色只知道`LessonSelectedService`

所以我们已经解决了这个问题吗？ 还没有，因为我们仍然不想在`LessonListComponent`中注入新服务，这将使它成为一个智能组件，我们希望将它保持为展示组件。 那么如何解决这个问题呢？

## 如何将`LessonsListComponent`保持为展示组件？
实际上，解决问题的一种方法是使其成为智能组件;-)我们可以得出结论，在该表存在的应用程序的任何地方，我们总是想要触发对`LessonSelectedService`的调用。

这将使`lesson-list`组件成为应用程序特定组件，无论如何它可能已经存在。 例如，我们可能不会发布此组件并在多个应用程序中使用它。

因此，这将解决问题，这意味着像`Home`组件这样的顶级应用程序组件可能由不仅仅是展示组件的组件树组成。

## 智能组件不仅仅是顶级组件
智能组件不必仅是顶级路由器组件。 我们可以看到树中可能还有其他组件也会注入像`LessonSelectedService`这样的服务，并且不一定只从`@Input()`获取它们的数据。

## 将`LessonsListComponent`保持为展示组件的另一种解决方案
解决问题的另一种方法是保持`lesson-list`组件不变，并在需要的地方使用它。 但在这种情况下，我们可以将它包装在一个智能组件中，该组件将注入`LessonSelectedService`：
```ts
@Component({
  selector: 'custom-lessons-list',
  template: `
       <lessons-list [lessons]="lessons" (lesson)="selectLesson($event)"></lessons-list>  
  `
})
export class CustomLessonsListComponent {

   constructor(private lessonSelectedService: LessonSelectedService) {

   }

   selectLesson(lesson) {
       this.lessonSelectedService.select(lesson); 
   }

}
```

在此我们创建了一个包装器智能组件，并将其称为`CustomLessonsListComponent`。 在这种情况下，我们包装了我们自己的展示组件，但我们也可以包装来自第三方库的组件。

想象一下`MyCustomCountrySelectDropdown`，它包含一个通用下拉列表并使用来自具体服务的数据注入它。

## 如何确定要构建的组件？
在开始构建我们的应用程序时，并不总是很明显区分什么是智能组件，什么是展示组件。

那么如何在许多组件中拆分应用程序？ 即使页面的标题只使用一次，它应该是一个组件吗？

组织和可读性是创建组件的唯一原因，即使它仅在一个地方使用。 在较小的文件中分隔内容有助于保持代码库的可维护性，并且使用`Angular CLI`在创建新组件时没有任何开销：使用单个命令，我们有一个工作组件，可以在几秒钟内粘贴标头。

## 如何进行组件设计
解决这个问题的一种方法是避免从一开始就定义什么是组件以及什么类型：我们可以从仅使用纯HTML和第三方组件构建顶级组件开始。

只有当模板开始变大时，我们才开始将其分解为组件。 如果在屏幕的多个部分中使用了某些内容并且总是触发给定的操作（如调用`store`调度），我们可能会考虑重构为较小的智能组件。

如果稍后我们意识到我们需要呈现与我们刚刚创建的智能组件相同的数据，我们可以将展示部分从它中提取到展示组件中。

获得一组精心设计的组件的最佳方法是通过连续重构，这可以通过使用`Angular CLI`无负担地完成。

## 结论
在构建应用程序时，我们可以寻找机会将纯展示逻辑提取到展示组件中：这些只使用`@Input`和`Output`，并且在我们需要隔离展示逻辑并重用它时非常有用。

如果我们想要保持两个组件分离并且彼此不知道，则可以使用共享服务或`store`来完成组件树中的不同级别的智能组件之间或甚至兄弟之间的通信。

但我们可能还希望将组件完全注入到彼此中并创建紧密耦合，有时这是最佳解决方案。 在这种情况下，通过例如`@ViewChild`将组件相互注入可能是最好的方法。

### 智能与展示组件是有用的区别
一般而言，智能与展示组件之间的区别是非常好记的，但它可能不适用于应用程序的所有组件。

我们可以拥有一个既知道服务又可以在树中更深层次地呈现一些数据的小组件，就像在`lesson`选择时调用`store`的`lesson`列表。

将此组件进一步拆分为智能和展示组件可能并非总是必要的。

智能与展示组件在自我省问时促进我们的思维方式：
- 这种展示逻辑在应用程序的其他地方是否有用？
- 将事情进一步分解会有用吗？
- 我们是否在应用中创建了意外的紧耦合？

我们不一定需要将构建的每个组件的所有渲染逻辑提取到单独的展示组件中。 它更多的是在任何给定时间构建对我们的应用程序最有意义的组件，并且如果需要在`CLI`的简单连续迭代过程中进行重构。

我希望你喜欢这篇文章，并且它有助于开始使用视图层设计。 请务必查看上面链接的架构系列上的其他文章！