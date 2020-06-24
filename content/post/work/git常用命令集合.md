---
title: git常用命令集合
tag: [git]
category: 
  - 技术
date: 2016-09-17 19:44:52
updated: 2016-09-17 19:44:52
comment: true
---
## status
`git status`是最常用的命令之一,查看当前项目文件的状态

## init
当一个文件夹不是 `git` 管理的时候,无法使用 `git` 命令,会报下面错误:
```shell
fatal:Not a git repository(当前目录还不是一个git仓库)
```
使用`git status`即可使当前目录初始化为一个 `git` 仓库

## add
`git add 文件` 提交文件到 `git` 仓库,一般使用`git add .`添加所有的文件  
使用`git reset`可以移除使用 `add` 提交的文件

## commit
`git commit -m "提交信息"`将 `add` 上去的文件进行确认。  
使用较多的是`git commit -a -m ""`,综合了 `add` 的功能。

## branch
`git branch`显示所有的分支  
`git checkout a`切换到a分支(可以用来撤销还没有进暂存区,但是已经改变的文件)  
`git checkout [-b] a` `-b`表示新建a分支并直接切换到a分支  
`git branch -d a`删除分支,前提a分支不是当前使用的分支  
`git branch -D a`强制删除  
`git merge`合并当前分支的代码到 `master` 分支

## tag
可以给某个阶段的代码添加一个标签标记,比如`git tag v1.0`  
使用`git checkout v1.0`可以切换到该标签下的版本

## pull、push
`git pull [origin] [master]`更新代码到本地

`git push [origin] [master]`把本地代码推到服务器

## clone
`git clone 地址 [本地项目名]`  
克隆服务器代码到本地,若不写本地项目名,则和服务器的项目名称一致

### ssh
克隆代码的时候可以使用两种方式`https`和`ssh`,使用`ssh`的话,可以不用输入密码。  
使用命令`ssh-keygen -t rsa`会在本地生成`.ssh/id_rsa.pub`公钥,将里面的内容复制到服务器的 `ssh` 设置里即可。

## stash
`stash` 表示一个隐藏片段,用于将当前改动存到一个区域中,并清空当前所有的改动,恢复到上次提交的状态,常用于紧急修复其他 `bug`,修复完以后再恢复隐藏片段  
相关命令有:
`git stash` 隐藏当前工作区
`git stash apply [id]` 恢复工作区,可以指定特定id
`git stash list` 列出所有隐藏片段
`git stash pop` 恢复最近的隐藏片段并删除
`git stash drop [id]` 丢弃隐藏片段
`git stash clean` 清楚隐藏片段

## reset
`reset` 可以改变本地提交的 `commit`
```bash
git reset —soft|hard [提交记录] :在这条记录之后的都重置
# soft:不清除改变，hard:清除改变
```

## rebase
`git rebase branch` 将新链表的节点全部移到分支头部  

重新创建分支
```bash
# 先在分支上使用
git reset —hard hash 到最初状态

git rebase -i master
# 挑选分支
r(eword) #编辑注释
s(quash) #合并提交
```

## reflog
`git reflog` 查看所有历史记录

## 将本地项目传到远端
过程如下:
- 在GitHub中新建项目
- 使用`git remote add origin 地址`将本地项目与GitHub关联
- 使用`git add .`和`git commit -m ""`提交代码
- 使用`git push origin master`推送代码到远端

使用`git remote -v`可以查看当前项目有哪些远程仓库
## 其他
设置
`git config --global user.name "kiyonlin"` 和 
`git config --global user.mail "kiyonlin@163.com"`,会在 `commit` 中显示出来  
使用`git config --global alias.co checkout`创建别名快捷键

### 修改bug
需要修改`bug`或者完成`issue`的时候的流程
```bash
# 新建分支
git checkout -b fix-feature | issue-24
# 完成分支功能后进行合并
git merge fix-feature
# 删除分支
git branch -d fix-feature
```