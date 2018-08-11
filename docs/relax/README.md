---
title: relax
layout: Category
---
[[toc]]

# Hello Relax

[[toc]]

# Hello VurPress
## Table
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is :tada: :100:| right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

## Image
![An image](/ics.png)


[这里]("{{ $site.pages[1].path }}")

## Custom Containers
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

::: danger STOP
Danger zone, do not proceed
:::


## Line Highlighting in Code Blocks

``` js{2-4,7}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
## vue
{{ 1 + 1 }}

<span v-for="i in 3">{{ i }} </span>

{{ $page.path }}
{{ $site }}

## Escaping <Badge text="beta" type="warn"/>

v-pre不解析{{}}

::: v-pre
`{{ This will be displayed as-is }}`
:::