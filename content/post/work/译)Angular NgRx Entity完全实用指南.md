---
title: (译)Angular NgRx Entity完全实用指南
tag: [angular-university, ngrx, ngrx-store, ngrx-entity]
category: [ngrx]
date: 2018-10-12 14:48:58
comment: true
---

使用 NgRx 构建我们的应用程序时，我们要做的第一件事就是**确定在`store`中存储数据的最佳格式**。

我们需要在任何 NgRx 应用程序中处理集中存储中的业务数据，但如果我们必须提出自己的临时解决方案，则该过程*可能是重复且耗时*的。

我们经常发现自己为不同类型的数据手写完全相同的 reducer 逻辑和 selector，这很容易出错并且会减慢开发过程。

在这篇文章中，我们将了解 NgRx 实体如何真正帮助我们处理`store`中的业务数据。

我们将**详细了解 NgRx 实体及其使用的实体状态格式的价值主张是什么**，我们将准确了解 NgRx 实体解决的问题，并知道何时使用它以及为什么使用它。
<!-- more -->

## 前言
请注意，这篇文章建立在其他`store`概念的基础上，例如action，reducers 和 selectors。 如果您正在寻找 NgRx `store`架构的介绍，请看看这篇文章：[Angular Service Layers: Redux, RxJs and Ngrx Store - When to Use a Store And Why?](https://blog.angular-university.io/angular-2-redux-ngrx-rxjs/)。

如果您正在寻找帮助设置 NgRx 开发环境的指南，包括 DevTools，带集成 router 的 time travelling 调试器和 NgRx Store Freeze，请查看：[Angular Ngrx DevTools: Important Practical Tips](https://blog.angular-university.io/angular-ngrx-devtools/)。

所以，不用多说了，让我们开始深入了解我们的 NgRx 实体！ 让我们从头开始，首先了解什么是实体。

## 什么是实体(Entity)？
在 NgRx 中，我们在`store`中存储不同类型的状态，这通常包括：
- 业务数据，例如在线课程平台的 Course 或 Lesson
- 一些 UI 状态，例如用户设置 UI

> 实体代表某种业务数据，因此 Course 和 Lesson 就是实体类型的示例。

在我们的代码中，实体被定义为Typescript类型。 例如，在在线课程系统中，最重要的实体是 Course 和 Lesson，使用这两种自定义对象类型定义：
```ts
export interface Course {
    id:number;
    description:string;
    iconUrl?: string;
    courseListIcon?: string;
    longDescription?: string;
    category:string;
    seqNo: number;
    lessonsCount?:number;
    promo?:boolean;
}

export interface Lesson {
    id: number;
    description: string;
    duration: string;
    seqNo: number;
    courseId?: number;
    videoId?: string;
}
```

### 实体唯一标识符
我们可以看到，两个实体都有一个名为id的唯一标识符字段，可以是字符串或数字。 这是一个技术标识符，对于给定的实体实例是唯一的：例如，没有两个课程具有相同的ID。

> 我们存储在`store`中的大多数数据都是实体！

## 如何在`store`中存储实体集合？
让我们假设我们想在内存`store`中存储一系列课程：我们将如何做到这一点？一种方法是在 `courses` 属性下将 courses 存储在一个数组中。

完整的`store`状态看起来像这样：
```ts
{
  courses: [
      {
        id: 0,
        description: "Angular Ngrx Course",
        category: 'BEGINNER',
        seqNo: 1
    },
    {
        id: 1,
        description: "Angular for Beginners",
        category: 'BEGINNER',
        seqNo: 2      
    },
    {
        id: 2,
        description: 'Angular Security Course - Web Security Fundamentals',
        category: 'ADVANCED',
        seqNo: 3      
    },
    ...
  ],
  lessons: [
    {
        id: 1,
        "description": "Angular Tutorial For Beginners - Build Your First App - Hello World Step By Step",
        "duration": "4:17",
        "seqNo": 1,
        courseId: 1
    },
    {
        id: 2,
        "description": "Building Your First  Component - Component Composition",
        "duration": "2:07",
        "seqNo": 2,
        courseId: 1
    },        
     ...
  ]   
}
```

### 为什么不在数组中存储相关实体？
我们首先想到的是以数组的形式在`store`中存储实体，但这种方法可能会导致几个潜在的问题：
- 如果我们想根据它的已知id查找课程，我们将不得不遍历整个集合，这对于非常大的集合来说可能是低效的
- 更重要的是，通过使用数组，我们可能会意外地在数组中存储相同课程的不同版本（具有相同的id）
- 如果我们将所有实体存储为数组，我们的 reducers 对于每个实体看起来几乎相同
- 例如，假设将新实体添加到集合中的简单情况。 我们将重新实现几次完全相同的逻辑，用于向集合中添加新实体并重新排序数组以获取特定的自定义排序顺序

我们可以看到，我们将实体存储在`store`中的格式对我们的程序有很大影响。

> 然后让我们试着找出在`store`中存储实体的理想格式。

## 设计实体`store`状态：数组或映射？
`store`的一个角色是充当内存客户端数据库，该数据库包含整个数据库的一部分，我们从客户端通过 selector 派生我们的视图模型。

这与传统的设计相反，后者包括通过 API 调用从服务器引入视图模型。 因为存储是内存数据库，所以将业务实体存储在它们自己的内存数据库“表”中是有意义的，并为它们提供类似于主键的唯一标识符。

然后可以将数据扁平化，并使用实体唯一标识符链接在一起，就像在数据库中一样。

一种很好的建模方法是将实体集合存储在 Javascript 对象的形式下，就像映射一样。 在此设置中，实体的键将是唯一ID，值将是整个对象。

在这种新格式中，整个`store`状态的是这样的：
```ts
{
    courses: {
        0: {
              id: 0,
              description: "Angular Ngrx Course",
              category: 'BEGINNER',
              seqNo: 1
           },
        },
        1: {
              id: 1,
              description: "Angular for Beginners",
              category: 'BEGINNER',
              seqNo: 2                  
        },
        2: {
              id: 2,
              description: "Angular Security Course - Web Security Fundamentals",
              category: 'BEGINNER',
              seqNo: 3                  
        }
    },
    lessons: {
        1: {
            id: 1,
            "description": "Angular Tutorial For Beginners - Build Your First App - Hello World Step By Step",
            "duration": "4:17",
            "seqNo": 1,
            courseId: 1
        },
        2: {
            id: 2,
            "description": "Building Your First  Component - Component Composition",
            "duration": "2:07",
            "seqNo": 2,
            courseId: 1
        },
        ....
        35: {
            id: 35,
            "description": "Unidirectional Data Flow And The Angular Development Mode",
            "duration": "7:07",
            "seqNo": 6,
            courseId: 0
        }
    }
}
```

### 设计id查找的状态
我们可以看到，这种格式使得通过id查找实体非常简单，这是一种非常常见的操作。 例如，为了查找id为1的 course，我们只需编写：

```ts
state.courses[1]
```

它还使状态变得扁平化，使得组合多个实体并通过 selector 查询“连接”它们变得更加简单。 但是只有一个问题：我们丢失了关于集合*顺序*的信息！

这是因为与数组不同，Javascript 对象的属性没有关联它们的顺序。 是否有任何仍然通过id在映射中存储我们的数据，并仍保留有关顺序信息的方法？

### 设计保存实体顺序的状态
是的，我们只需要同时使用映射和数组！ 我们将对象存储在一个映射（称为 entities）中，然后将顺序信息存储在一个数组中（称为 ids）：
```ts
{
    courses: {
        ids: [0, 1, 2],
        entities: {
            0: {
                  id: 0,
                  description: "Angular Ngrx Course",
                  category: 'BEGINNER',
                  seqNo: 1                      
               },
            },
            1: {
                  id: 1,
                  description: "Angular for Beginners",
                  category: 'BEGINNER',
                  seqNo: 2                                            
            },
            2: {
                  id: 2,
                  description: "Angular Security Course - Web Security Fundamentals",
                  category: 'BEGINNER',
                  seqNo: 3                                            
            }
        }
    },
    lessons: {
        ids: [1, 2, ... 35],
        entities: {
            1: {
                id: 1,
                "description": "Angular Tutorial For Beginners - Build Your First App - Hello World Step By Step",
                "duration": "4:17",
                "seqNo": 1,
                courseId: 1
            },
            2: {
                id: 2,
                "description": "Building Your First  Component - Component Composition",
                "duration": "2:07",
                "seqNo": 2,
                courseId: 1
            },
            ....
            35: {
                id: 35,
                "description": "Unidirectional Data Flow And The Angular Development Mode",
                "duration": "7:07",
                "seqNo": 6,
                courseId: 0
            }
        }
    }
}
```

### 实体状态格式
这种状态格式将实体映射与id数组合在一起称为实体状态格式(Entity State format)。

这是将业务实体存储在集中式存储中的理想格式，但是如果我们必须从头开始手动编写它们，则在编写 reducer 和 selector 时保持此状态会带来额外的负担。

例如，如果我们必须编写一些类型定义来表示完整的存储状态，它们看起来像这样：
```ts
export interface StoreState {
    courses: CourseState:
    lessons: LessonsState;
}


export interface CoursesState {
     ids: number[];
     entities: {[key:number]: Course};
} 

export interface LessonsState {
     ids: number[];
     entities: {[key:number]: Lesson};
}
```

正如我们所看到的，我们已经在这里做了一些重复工作，因为类型 CoursesState 和 LessonsState 几乎相同。 更重要的是，这两个实体的所有 reducer 和 selector 代码也非常相似。

### 编写支持实体状态格式的reducer
例如，一个用于 LoadCourse action 的 reducer，它接受当前的 CoursesState，并为其添加一个新的 course，并根据 seqNo 字段重新排序该集合。

以下就是 LoadCourse action 的 reducer 逻辑：
```ts
const initialCoursesState: CoursesState = {
    ids: [],
    entities: {}
}

function sortBySeqNo(e1: Course, e2: Course) {
      return e1.seqNo - e2.seqNo;
}

export function coursesReducer(
   state = initialCoursesState, 
    action: CourseActions): CoursesState {
    switch (action.type) {
        case CourseActionTypes.COURSE_LOADED:
             // push new id to array and re-order
             const ids = state.ids.slice(0);
             ids.push(action.course.id);
             ids.sort(sortBySeqNo);
             // build a new courses state
             return {
                 ids,
                 entities: {
                     ...state.entities, 
                     action.payload.course
                 }
             };
        default: 
            return state;
    }
}
```

正如我们所看到的，只需在`store`中添加 course 即可。 问题是我们必须为其他常见操作编写类似的代码，例如更新`store`中的 course 或删除它。

### 避免重复的 reducer 逻辑
但是比这更大的问题是，将一个 Lesson 加载到 LessonsState 中的等效 LoadLesson 操作的代码几乎相同：
```ts
const initialLessonsState: LessonsState = {
    ids: [],
    entities: {}
}

function sortBySeqNo(e1: Lesson, e2: Lesson) {
      return e1.seqNo - e2.seqNo;
}

export function lessonsReducer(
    state = initialLessonsState, 
    action: LessonActions): LessonsState {
    switch (action.type) {
        case CourseActionTypes.LESSON_LOADED:
             // push new id to array and re-order
             const ids = state.ids.slice(0);
             ids.push(action.lesson.id);
             ids.sort(sortBySeqNo);
             return {
                 ids,
                 entities: {
                     ...state.entities, 
                     action.payload.lesson
                 }
             };
        default: 
            return state;
    }
}
```

除了使用 Lesson 类型而不是 Course 之外，此代码几乎与我们之前编写的 reducer 逻辑完全一样！

我们可以看到，将我们的实体保留在这个双数组和映射场景中会产生大量重复代码。

### 避免重复的selector逻辑
除了重复的类型定义，重复的初始状态和几乎相同的 reducer 逻辑之外，我们还会有很多几乎相同的 selector 逻辑。

例如，以下是 Course 实体的一些常用selector，它选择`store`中可用的所有 course：
```ts
export const selectCoursesState = 
      createFeatureSelector<CoursesState>("courses");

export const selectAllCourses = createSelector(
    selectCoursesState,
    coursesState => {
        const allCourses = Object.values(coursesState.entities)
        allCourses.sort(sortBySeqNo);
        return allCourses;
    }
);
```

### 功能selector的快速说明
注意 selectCoursesState 功能 selector，这是一个辅助 selector，它只接受整个`store`状态的 `courses` 属性，如下所示：
```ts
storeState["courses"]
```

使用此实用程序的优点是类型安全，并且可以很容易地定义延迟加载的 selector，这些 selector 无法访问根 `store` 状态的类型定义。

selector selectAllCourses 获取 `store` 中的所有 courses 并将它们放入数组中，并根据 seqNo 字段对数组进行排序。

问题是我们需要一些几乎相同的逻辑用于 Lesson 实体：
```ts
export const selectLessonsState = 
      createFeatureSelector<LessonsState>("lessons");

export const selectAllLessons = createSelector(
    selectLessonsState,
    lessonsState => {
        const allLessons = Object.values(lessonsState.entities)
        allLessons.sort(sortBySeqNo);
        return allLessons;
    }
);
```

我们可以看到，这段代码几乎与我们之前为 Course 实体编写的 selector 完全相同。

### 大量重复代码
让我们总结一下到目前为止我们看到的几乎相同的代码类型：
- 实体状态定义（如 CoursesState 和 LessonsState）
- 初始reducer状态（如 initialCoursesState 和 initialLessonsState）
- reducer 逻辑
- selector 逻辑

大量的重复代码，只是为了将这种采用优化的实体状态格式的数据保存在我们的数据库中。 问题是，这是在`store`中存储相关实体的理想格式，如果我们不使用它，我们可能最终会遇到其他问题。

> 好消息是我们可以通过利用NgRx实体来避免几乎所有这些重复的代码！

## 什么是 NgRx 实体，何时使用它？
NgRx 实体是一个小型库，可帮助我们将实体保持在这种理想的实体状态格式（ID数组加上实体映射）。

该库旨在与NgRx Store结合使用，实际上是 NgRx 生态系统的关键部分。 从我们的项目开始使用 NgRx 实体，而不是尝试使用我们自己的特殊内存数据库格式，这样做要好得多。

现在让我们学习 NgRx 实体提供给我们编写 NgRx 应用程序的许多方法。

### 定义实体状态
回到我们的 Course 实体，让我们现在使用 NgRx 实体重新定义实体状态：
```ts
export interface CoursesState extends EntityState<Course> {

}
```

这与我们之前编写的类型定义相同，但我们现在不必为每个单独的实体定义 id 和 entities 属性。 相反，我们可以简单地从 EntityState 继承，同时具有相同的类型安全性，以及更少的代码。

## NgRx实体适配器(Entity Adapter)
为了能够使用NgRx Entity的其他功能，我们需要首先创建一个实体适配器。 适配器是一个实用程序类，它提供了一系列实用程序函数，旨在更简单地操作实体状态。

适配器允许我们以更简单的方式编写所有初始实体状态，reducers 和 selector，同时仍然将我们的实体保持为标准的 EntityState 格式。

以下是 Course 实体的适配器，配置为使用 seqNo 字段对实体进行排序：
```ts
export const adapter : EntityAdapter<Course> = 
   createEntityAdapter<Course>({
       sortComparer: sortBySeqNo
   });
```

## 定义默认实体排序顺序
请注意，我们使用了可选的 sortComparer 属性，该属性用于设置 Course 实体的排序顺序，这将决定该实体的id数组的顺序。

如果我们不使用此可选属性，则将使用id字段对 Course 进行排序。

## 使用 NgRx 实体编写更简单的 reducer
现在让我们使用适配器并使用它来定义我们的 Reducer 所需的初始状态。

然后我们将实现与以前相同的 reducer 逻辑：
```ts
export const initialCoursesState: CoursesState = 
      adapter.getInitialState();

export function lessonsReducer(
    state = initialLessonsState, 
    action: LessonActions): LessonsState {
    switch (action.type) {
        case LessonActionTypes.LESSON_LOADED:
             return adapter.addOne(action.payload.lesson, state);
        default: 
            return state;
    }
}
```

注意现在使用适配器编写 reducer 逻辑会更容易。 适配器将帮助我们操作现有的 CourseState，方法是在 addOne 中调用我们之前手动执行的所有操作：
- addOne 将创建现有状态对象的副本，而不是改变现有状态
- 然后 addOne 将创建一个 ids 数组的副本，它将在正确的排序位置添加新的 Course
- 将创建实体对象的副本，该副本指向所有先前的 Course 对象，而无需通过深层副本重新创建这些对象
- 新实体对象将添加新 Course

### 使用实体适配器的好处
正如我们所看到的，通过使用适配器编写我们的 reducer，我们可以节省大量的工作并避免常见的 reducer 逻辑错误，因为这种类型的逻辑很容易出错。

偶然地改变存储状态并不常见，这可能会导致问题，特别是如果我们在我们的应用程序中使用`OnPush`更改检测。

使用适配器可以防止所有这些问题，同时减少编写 reducer 所需的大量代码。

### NgRx Entity适配器支持的操作
除了 addOne 之外，NgRx 实体适配器还支持一系列常见的集合修改操作，否则我们必须亲自实现。

以下是所有受支持操作的完整示例：
```ts
export function coursesReducer(
    state = initialCoursesState, 
    action: CourseActions): CoursesState {
  switch (action.type) {
    case CourseActions.ADD_COURSE: {
      return adapter.addOne(action.payload.course, state);
    }

    case CourseActions.UPSERT_COURSE: {
      return adapter.upsertOne(action.payload.course, state);
    }

    case CourseActions.ADD_COURSES: {
      return adapter.addMany(action.payload.courses, state);
    }

    case CourseActions.UPSERT_COURSES: {
      return adapter.upsertMany(action.payload.courses, state);
    }

    case CourseActions.UPDATE_COURSE: {
      return adapter.updateOne(action.payload.course, state);
    }

    case CourseActions.UPDATE_COURSES: {
      return adapter.updateMany(action.payload.courses, state);
    }

    case CourseActions.DELETE_COURSE: {
      return adapter.removeOne(action.payload.id, state);
    }

    case CourseActions.DELETE_COURSES: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case CourseActions.LOAD_COURSES: {
      return adapter.addAll(action.payload.courses, state);
    }

    case CourseActions.CLEAR_COURSES: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}
```

适配器方法的行为方式如下：

- addOne：向集合中添加一个实体
- addMany：添加多个实体
- addAll：用新的集合替换整个集合
- removeOne：删除一个实体
- removeMany：删除多个实体
- removeAll：清除整个集合
- updateOne：更新一个现有实体
- updateMany：更新多个现有实体
- upsertOne：更新或插入一个实体
- upsertMany：更新或插入多个实体

现在想象一下，如果我们必须自己实现所有这些 reducer 逻辑，那会是什么样的！

## 使用NgRx Entity Selectors
NgRx 实体帮助我们的另一件事是使用常用的 selector，例如 selectAllCourses 和 selectAllLessons。

通过运行以下命令，我们可以随时生成一系列常用的 selector：
```ts
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal

} = adapter.getSelectors();
```

这些 selector 都可以直接在我们的组件中使用，也可以作为构建其他 selector 的起点。

请注意，这些 selector 都以与实体无关的方式命名，因此如果在同一文件中需要多个 selector，建议按以下方式导入它们：
```ts
import * as fromCourses from './courses.reducers';

// 这相当于我们之前手动编写的 selectAllCourses
const selectAllCourses = fromCourses.selectAll;
```

这些 selector 随时可以使用，并且与我们自己手动编写的 selector 一样安全。

## NgRx实体的目的不是为了做什么
请注意，尽管 NgRx Entity 使得编写 Course 实体的状态，reducer 和 selector 逻辑变得更加容易，但我们仍然必须编写 reducer 函数本身，尽管这样使用适配器的方式更简单。

使用 NgRx 实体不会避免必须为每个实体编写 reducer 逻辑，尽管这使它更简单。

这意味着对于 Lesson 实体，我们必须做一些非常相似的事情。 惯例是将所有这些密切相关的代码直接放在我们定义了实体 reducer 函数的同一文件中。

对于 Lesson 实体，这就是完整的 lesson.reducers.ts 文件的样子：
```ts
export interface LessonsState extends EntityState<Lesson> {

}

export const adapter : EntityAdapter<Lesson> =
  createEntityAdapter<Lesson>({sortComparer: sortBySeqNo});


const initialLessonsState = adapter.getInitialState();

export function lessonsReducer(
    state = initialLessonsState,
    action: LessonActions): LessonsState {

  switch(action.type) {
    case CourseActionTypes.LESSON_LOADED:
             return adapter.addOne(action.payload.course, state);
    default:
      return state;
  }
}

export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal

} = adapter.getSelectors();
```

实际上，每个实体的 reducer 逻辑略有不同，因此 reducer 功能之间不会重复代码。

如果您正在寻找更进一步的解决方案，并且无需编写实体特定的 reducer 逻辑，请查看[ngrx-data](https://github.com/johnpapa/angular-ngrx-data)。

## 配置自定义唯一ID字段
正如我们所提到的，我们程序中的实体都应该有一个名为id的技术标识符字段。 但如果由于某种原因，这个领域：

- 在给定实体中不可用
- 或者它有不同的名称
- 或者我们只是想使用恰好是 natural key 的另一个属性

我们仍然可以通过向适配器提供自定义 idselector 功能来实现。 这是一个例子：
```ts
export const adapter : EntityAdapter<Lesson> = 
      createEntityAdapter<Lesson>({
        sortComparer: sortBySeqNo,
        selectId: lesson => lesson.courseId + '-' + lesson.seqNo
    });
```

适配器将调用此函数以从给定实体中提取唯一键。

在此示例中，我们通过将 courseId 属性与 Lesson 序号连接来为 Lesson 实体创建唯一标识符，该序号对于给定的 Lesson 是唯一的。

### 处理自定义状态属性
到目前为止，我们只是通过扩展 EntityState 类型来定义我们的实体状态。 但可能我们的实体状态还具有除标准ID和实体之外的其他自定义属性。

假设对于 Course 实体，我们还需要一个额外的标志来指示 courses 是否已经加载。 我们可以在 CoursesState 中定义额外的状态属性，然后使用适配器在 reducer 逻辑中更新该属性。

以下是 CoursesState reducer 文件 courses.reducers.ts 的完整示例，现在包括额外的 state 属性：
```ts
export interface CoursesState extends EntityState<Course> {
  allCoursesLoaded:boolean;
}

export const adapter : EntityAdapter<Course> =
  createEntityAdapter<Course>();

export const initialCoursesState: CoursesState = 
      adapter.getInitialState({
        allCoursesLoaded: false
    });

export function coursesReducer(
  state = initialCoursesState , 
  action: CourseActions): CoursesState {
  switch(action.type) {
    case CourseActionTypes.COURSE_LOADED:
      return adapter.addOne(action.payload.course, state);
    case CourseActionTypes.ALL_COURSES_LOADED:
      return adapter.addAll(
                action.payload.courses, {
                    ...state, 
                  allCoursesLoaded:true
                });
    default: {
      return state;
    }
  }
}

export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal

} = adapter.getSelectors();
```

以下是我们必须要做的事情，包括这个额外的属性：
- 首先，我们将 allCoursesLoaded 属性添加到 CoursesState 的类型定义中
- 接下来，我们需要通过将一个可选对象传递给对 getInitialState() 的调用来在 initialCoursesState 中定义此属性的初始值
- 我们现在可以在我们的 reducer 逻辑中设置这个属性，就像我们在ALL_COURSES_LOADED reducer中一样。
- 为此，我们简单地需要使用spread（...运算符）制作 CourseState 的副本，然后我们修改属性并将这个新状态对象传递给适配器调用

## 使用NgRx Schematics脚手架生成实体
如果您想快速生成我们在本文中展示的 reducer 文件，您可以通过使用NgRx Schematics获得一个非常好的开始。

要使用实体 Schematics，我们需要做的第一件事是设置此CLI属性：
```sh
ng config cli.defaultCollection @ngrx/schematics
```

在此之后，我们可以通过运行以下命令生成一个全新的Lesson reducer文件：
```sh
ng generate entity --name Lesson --module courses/courses.module.ts
```

### NgRx实体 Schematics 生成什么？
现在让我们查看上面命令生成的输出。 首先，我们有一个空的Entity模型文件：
```ts
export interface Lesson {
  id: string;
}
```

Schematics 命令还将生成一个完整的 Action 文件，每个 Action 对应于实体适配器中的一个状态修改方法：
```ts
export enum LessonActionTypes {
  LoadLessons = '[Lesson] Load Lessons',
  AddLesson = '[Lesson] Add Lesson',
  UpsertLesson = '[Lesson] Upsert Lesson',
  AddLessons = '[Lesson] Add Lessons',
  UpsertLessons = '[Lesson] Upsert Lessons',
  UpdateLesson = '[Lesson] Update Lesson',
  UpdateLessons = '[Lesson] Update Lessons',
  DeleteLesson = '[Lesson] Delete Lesson',
  DeleteLessons = '[Lesson] Delete Lessons',
  ClearLessons = '[Lesson] Clear Lessons'
}

export class LoadLessons implements Action {
  readonly type = LessonActionTypes.LoadLessons;

  constructor(public payload: { lessons: Lesson[] }) {}
}

export class AddLesson implements Action {
  readonly type = LessonActionTypes.AddLesson;

  constructor(public payload: { lesson: Lesson }) {}
}

export class UpsertLesson implements Action {
  readonly type = LessonActionTypes.UpsertLesson;

  constructor(public payload: { lesson: Lesson }) {}
}

export class AddLessons implements Action {
  readonly type = LessonActionTypes.AddLessons;

  constructor(public payload: { lessons: Lesson[] }) {}
}

export class UpsertLessons implements Action {
  readonly type = LessonActionTypes.UpsertLessons;

  constructor(public payload: { lessons: Lesson[] }) {}
}

export class UpdateLesson implements Action {
  readonly type = LessonActionTypes.UpdateLesson;

  constructor(public payload: { lesson: Update<Lesson> }) {}
}

export class UpdateLessons implements Action {
  readonly type = LessonActionTypes.UpdateLessons;

  constructor(public payload: { lessons: Update<Lesson>[] }) {}
}

export class DeleteLesson implements Action {
  readonly type = LessonActionTypes.DeleteLesson;

  constructor(public payload: { id: string }) {}
}

export class DeleteLessons implements Action {
  readonly type = LessonActionTypes.DeleteLessons;

  constructor(public payload: { ids: string[] }) {}
}

export class ClearLessons implements Action {
  readonly type = LessonActionTypes.ClearLessons;
}

export type LessonActions =
 LoadLessons
 | AddLesson
 | UpsertLesson
 | AddLessons
 | UpsertLessons
 | UpdateLesson
 | UpdateLessons
 | DeleteLesson
 | DeleteLessons
 | ClearLessons;
 ```

### 查看Actions文件的内容
此文件遵循 Actions 文件的正常建议结构：
- 一个枚举 LessonActionTypes，每个 Lesson action 一个条目
- 每个 action 一个类，数据通过 payload 属性传递给 action 
- 底部的一个联合类型 LessonActions，包含此文件的所有 action 类

最后一个联合类型对于编写 reducer 逻辑特别有用。 多亏了它，我们可以在 Reducer 的 case 块中进行完整的类型推断和 IDE auto-completion。
## NgRx实体 `Update<T>` 类型
另请注意，在某些操作的定义中，我们使用的是`Update <Lesson>`类型。 这是NgRx实体提供的辅助类型，用于帮助模型部分实体更新。

此类型具有标识更新实体的属性标识，以及另一个名为 changes 的属性，该属性指定对实体进行的修改。

以下是 Course 类型的有效更新对象示例：
```ts
const update: Update<Course> = {
    id: 1,
    changes: {
        description: "NgRx In Depth",
        category: 'INTERMEDIATE'
    }
};
```

### 查看 reducer 文件的内容
NgRx Entity Schematics 命令还将如期生成Entity reducer文件和 test 文件。 以下是reducer文件的内容：
```ts
export interface State extends EntityState<Lesson> {

}

export const adapter: EntityAdapter<Lesson> = 
      createEntityAdapter<Lesson>();

export const initialState: State = 
      adapter.getInitialState({});

export function reducer(
  state = initialState,
  action: LessonActions
): State {
  switch (action.type) {
    case LessonActionTypes.AddLesson: {
      return adapter.addOne(action.payload.lesson, state);
    }

    case LessonActionTypes.UpsertLesson: {
      return adapter.upsertOne(action.payload.lesson, state);
    }

    case LessonActionTypes.AddLessons: {
      return adapter.addMany(action.payload.lessons, state);
    }

    case LessonActionTypes.UpsertLessons: {
      return adapter.upsertMany(action.payload.lessons, state);
    }

    case LessonActionTypes.UpdateLesson: {
      return adapter.updateOne(action.payload.lesson, state);
    }

    case LessonActionTypes.UpdateLessons: {
      return adapter.updateMany(action.payload.lessons, state);
    }

    case LessonActionTypes.DeleteLesson: {
      return adapter.removeOne(action.payload.id, state);
    }

    case LessonActionTypes.DeleteLessons: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case LessonActionTypes.LoadLessons: {
      return adapter.addAll(action.payload.lessons, state);
    }

    case LessonActionTypes.ClearLessons: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
```

### 如何最好地使用 Schematics 输出？
请注意生成的 Schematics 文件（与生成CLI的任何其他文件一样）并不意味着保持不变。

实际上，您可能甚至不想使用 actions 文件，而是使用给定的一组约定编写自己的操作，例如[本演讲](https://www.youtube.com/watch?v=JmnsEvoy-gY&feature=youtu.be)中推荐的约定。

此外，可能并非所有操作都需要在应用程序中进行，因此仅保留我们需要的操作并对其进行调整非常重要。 像往常一样，Schematics 生成的文件只是一个有用的开端，需要根据具体情况进行调整。
## Github 仓库中可运行的例子
有关如何将 NgRx 实体与我们在示例中使用的两个实体（Course 和 Lesson）一起使用的小型应用程序的完整运行示例，请查看此[仓库](https://github.com/angular-university/angular-ngrx-course)。

以下是NgRx DevTools，显示了两个实体的`store`内容：
![NgRx DevTools](/angular-university/ngrx-entity-2.png)
## 结论
NgRx 实体是一个非常有用的包，但为了理解它首先要熟悉基本存储概念（如Actions，Reducers 和 Selectors）以及一般的`store`体系结构。

如果我们已经熟悉这些概念，我们可能已经尝试找到构建`store`内数据的最佳方法。

NgRx 实体通过为我们的业务实体提供实体状态格式来为此提供答案，该格式针对id进行查找而优化，同时仍保留实体订单信息。

NgRx 实体适配器与 NgRx Schematics 一起使得使用 NgRx 实体来存储我们的数据变得非常简单。

> 但请注意，并非所有`store`都需要使用NgRx实体！

NgRx Entity 专门用于处理我们`store`中的业务实体，使得以方便的方式将它们存储在内存中。

### 了解有关 NgRx 生态系统的更多信息
我希望这篇文章能帮助您开始使用Ngrx Entity，并且希望您喜欢它！

如果您希望了解如何开始使用NgRx生态系统，您可能需要查看本系列之前的博文：
- [Angular Service Layers: Redux, RxJs and Ngrx Store - When to Use a Store And Why?](https://blog.angular-university.io/angular-2-redux-ngrx-rxjs/)
- [Angular Ngrx DevTools: Important Practical Tips](https://blog.angular-university.io/angular-ngrx-devtools/)

