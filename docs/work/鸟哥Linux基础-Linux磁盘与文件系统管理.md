---
title: 鸟哥Linux基础-Linux磁盘与文件系统管理
tag:
  - Linux
  - 磁盘管理
  - 文件系统
category:
  - 技术
  - linux
date: 2017-01-09 13:56:50
updated: 2017-01-09 13:56:50
---
原文[鸟哥的 Linux私房菜 第七章、Linux 磁碟与档案系统管理](http://linux.vbird.org/linux_basic/0230filesystem.php)  

在本章我们的重点在于如何制作档案系统，包括分割、格式化与挂载等。:star::star:文字比较多，需要耐心阅读。
## 认识Linux 档案系统
Linux最传统的磁碟档案系统(filesystem)使用的是EXT2！所以要了解Linux的档案系统就得要由认识EXT2开始！而档案系统是建立在磁碟上面的，因此我们得了解磁碟的物理组成才行。重点在于inode, block还有superblock等档案系统的基本部分！
### 档案系统特性
我们都知道磁碟分割完毕后还需要进行格式化(format)，之后作业系统才能够使用这个档案系统。因为每种作业系统所设定的档案属性/权限并不相同， 为了存放这些档案所需的资料，就需要将分割槽进行格式化，以成为作业系统能够利用的『档案系统格式(filesystem )』。

每种作业系统能够使用的档案系统并不相同。举例来说，windows 98以前的微软作业系统主要利用的档案系统是FAT (或FAT16)，windows 2000以后的版本有所谓的NTFS档案系统，至于Linux的正统档案系统则为Ext2 (Linux second extended file system , ext2fs )这一个。此外，在预设的情况下，windows作业系统是不会认识Linux的Ext2的。

传统的磁碟与档案系统的应用中，一个分割槽只能够被格式化成为一个档案系统，所以我们可以说一个filesystem就是一个partition。但是由于新技术的利用，例如我们常听到的LVM与软体磁碟阵列(software raid)，这些技术可以将一个分割槽格式化为多个档案系统(例如LVM)，也能够将多个分割槽合成一个档案系统(LVM, RAID)！所以说，目前我们在格式化时已经不再说成针对partition来格式化了，通常我们可以称呼一个可被挂载的资料为一个档案系统而不是一个分割槽！

那么档案系统是如何运作的呢？这与作业系统的档案资料有关。较新的作业系统的档案资料除了档案实际内容外，通常含有非常多的属性，例如Linux作业系统的档案权限(rwx)与档案属性(拥有者、群组、时间参数等)。 档案系统通常会将这两部份的资料分别存放在不同的区块，权限与属性放置到inode中，至于实际资料则放置到data block区块中。另外，还有一个超级区块(superblock)会记录整个档案系统的整体资讯，包括inode与block的总量、使用量、剩余量等。

每个inode 与block 都有编号，至于这三个资料的意义可以简略说明如下：
- superblock：记录此filesystem 的整体资讯，包括inode/block的总量、使用量、剩余量， 以及档案系统的格式与相关资讯等；
- inode：记录档案的属性，一个档案占用一个inode，同时记录此档案的资料所在的block 号码；
- block：实际记录档案的内容，若档案太大时，会占用多个block 。
由于每个inode 与block 都有编号，而每个档案都会占用一个inode ，inode 内则有档案资料放置的block 号码。因此，我们可以知道的是，如果能够找到档案的inode 的话，那么自然就会知道这个档案所放置资料的block 号码， 当然也就能够读出该档案的实际资料了。这是个比较有效率的作法，因为如此一来我们的磁碟就能够在短时间内读取出全部的资料， 读写的效能比较好。

我们将inode 与block 区块用图解来说明一下，如下图所示，档案系统先格式化出inode 与block 的区块，假设某一个档案的属性与权限资料是放置到inode 4 号(下图较小方格内)，而这个inode 记录了档案资料的实际放置点为2, 7, 13, 15 这四个block 号码，此时我们的作业系统就能够据此来排列磁碟的读取顺序，可以一口气将四个block 内容读出来！那么资料的读取就如同下图中的箭头所指定的模样了。

 ![inode/block 资料存取示意图](http://linux.vbird.org/linux_basic/0230filesystem/filesystem-1.jpg)
inode/block 资料存取示意图

这种资料存取的方法我们称为索引式档案系统(indexed allocation)。那有没有其他的常用档案系统可以比较一下？有的，那就是我们惯用的U盘，U盘使用的档案系统一般为FAT格式。FAT这种格式的档案系统并没有inode存在，所以FAT没有办法将这个档案的所有block在一开始就读取出来。每个block号码都记录在前一个block当中，他的读取方式有点像底下这样：

 ![FAT档案系统资料存取示意图](http://linux.vbird.org/linux_basic/0230filesystem/filesystem-2.jpg)
 FAT档案系统资料存取示意图
 
上图中我们假设档案的资料依序写入1->7->4->15号这四个block 号码中， 但这个档案系统没有办法一口气就知道四个block 的号码，他得要一个一个的将block 读出后，才会知道下一个block 在何处。如果同一个档案资料写入的block 分散的太过厉害时，则我们的磁碟读取头将无法在磁碟转一圈就读到所有的资料， 因此磁碟就会多转好几圈才能完整的读取到这个档案的内容！

常常会听到所谓的『磁碟重组』吧？ 需要磁碟重组的原因就是档案写入的block太过于离散了，此时档案读取的效能将会变的很差所致。 这个时候可以透过磁碟重组将同一个档案所属的blocks汇整在一起，这样资料的读取会比较容易啊！ FAT的档案系统需要三不五时的磁碟重组一下，那么Ext2是否需要磁碟重整呢？

由于Ext2 是索引式档案系统，基本上不太需要常常进行磁碟重组的。但是如果档案系统使用太久， 常常删除/编辑/新增档案时，那么还是可能会造成档案资料太过于离散的问题，此时或许会需要进行重整一下的。不过，基本上不需要在Linux 作业系统上面进行过Ext2/Ext3 档案系统的磁碟重组。

### Linux 的EXT2 档案系统(inode)
标准的Linux档案系统Ext2是一种以inode为基础的档案系统！一开始就将inode与block规划好了，除非重新格式化(或者利用resize2fs等指令变更档案系统大小)，否则inode与block固定后就不再变动。但是如果仔细考虑一下，如果我的档案系统高达数百GB时，那么将所有的inode与block通通放置在一起将是很不智的决定，因为inode与block的数量太庞大，不容易管理。
因此Ext2 档案系统在格式化的时候基本上是区分为多个区块群组(block group) 的，每个区块群组都有独立的 inode/block/superblock 系统。感觉上就好像在军营中，一个营里面有分成数个连，每个连有自己的联络系统， 但最终都向营部回报连上最正确的资讯一般！这样分成一群群的比较好管理！整个来说，Ext2 格式化后有点像底下这样：

![ext2档案系统示意图](http://linux.vbird.org/linux_basic/0230filesystem/ext2_filesystem.jpg)
ext2档案系统示意图

在整体的规划当中，档案系统最前面有一个开机磁区(boot sector)，这个开机磁区可以安装开机管理程式，这是个非常重要的设计，因为如此一来我们就能够将不同的开机管理程式安装到个别的档案系统最前端，而不用覆盖整颗磁碟唯一的MBR，这样才能够制作出多系统的环境！至于每一个区块群组(block group)的六个主要内容说明如下。

#### data block (资料区块)
data block是用来放置档案内容资料的地方，在Ext2档案系统中所支援的block大小有1K, 2K及4K三种而已。在格式化时block的大小就固定了，且每个block都有编号，以方便inode的记录。不过要注意的是，由于block大小的差异，会导致该档案系统能够支援的最大磁碟容量与最大单一档案容量并不相同。因为block大小而产生的Ext2档案系统限制如下：

|Block 大小|1KB|2KB|4KB|
|:--------|:--|:--|:--|
|最大单一档案限制|16GB|256GB|2TB|
|最大档案系统总容量|2TB|8TB|16TB|

需要注意的是，虽然Ext2已经能够支援大于2GB以上的单一档案容量，不过某些应用程式依然使用旧的限制，也就是说，某些程式只能够获取到小于2GB以下的档案而已，这就跟档案系统无关了！

除此之外Ext2 档案系统的block 还有如下限制：
- 原则上，block 的大小与数量在格式化完就不能够再改变了(除非重新格式化)；
- 每个block 内最多只能够放置一个档案的资料；
- 承上，如果档案大于block 的大小，则一个档案会占用多个block 数量；
- 承上，若档案小于block ，则该block 的剩余容量就不能够再被使用了(磁碟空间会浪费)。

#### inode table (inode 表格)
基本上，inode记录的档案资料至少有底下这些
- 该档案的存取模式(read/write/excute)；
- 该档案的拥有者与群组(owner/group)；
- 该档案的容量；
- 该档案建立或状态改变的时间(ctime)；
- 最近一次的读取时间(atime)；
- 最近修改的时间(mtime)；
- 定义档案特性的标记(flag)，如SetUID...；
- 该档案真正内容的指向(pointer)；

inode 的数量与大小也是在格式化时就已经固定了，除此之外inode 还有些以下特色：
- 每个inode 大小均固定为128 bytes (新的ext4 与xfs 可设定到256 bytes)；
- 每个档案都仅会占用一个inode ；
- 承上，因此档案系统能够建立的档案数量与inode 的数量有关；
- 系统读取档案时需要先找到inode，并分析inode 所记录的权限与使用者是否符合，若符合才能够开始实际读取 block 的内容。

简单分析一下EXT2 的inode / block 与档案大小的关系。inode 要记录的资料非常多，但偏偏又只有128bytes 而已， 而inode 记录一个block 号码要花掉4bytes ，假设一个档案有400MB 且每个block 为4K 时， 那么至少也要十万笔block 号码的记录！inode 哪有这么多可记录的资讯？为此我们的系统很聪明的将inode 记录block 号码的区域定义为12个直接，一个间接, 一个双间接与一个三间接记录区。inode 的结构画如下：
![inode 结构示意图](http://linux.vbird.org/linux_basic/0230filesystem/inode.jpg)

上图最左边为inode本身(128 bytes)，里面有12个直接指向block号码的对照，这12笔记录就能够直接取得block号码啦！至于所谓的间接就是再拿一个block来当作记录block号码的记录区，如果档案太大时，就会使用间接的block来记录号码。如上图当中间接只是拿一个block来记录额外的号码而已。同理，如果档案持续长大，那么就会利用所谓的双间接，第一个block仅再指出下一个记录号码的block在哪里，实际记录的在第二个block当中。依此类推，三间接就是利用第三层block来记录号码！

这样子inode 能够指定多少个block 呢？以较小的1K block 来说明，可以指定的情况如下：
- 12个直接指向： 12*1K=12K 
由于是直接指向，所以总共可记录12笔记录，因此总额大小为如上所示；

- 间接： 256*1K=256K 
每笔block号码的记录会花去4bytes，因此1K的大小能够记录256笔记录，因此一个间接可以记录的档案大小如上； 

- 双间接： 256*256*1K=256^2 K 
第一层block会指定256个第二层，每个第二层可以指定256个号码，因此总额大小如上；

- 三间接： 256*256*256*1K=256^3 K 
第一层block会指定256个第二层，每个第二层可以指定256个第三层，每个第三层可以指定256个号码，因此总额大小如上；

- 总额：将直接、间接、双间接、三间接加总，得到12 + 256 + 256*256 + 256*256*256 (K) = 16GB

此时我们知道当档案系统将block格式化为1K大小时，能够容纳的最大档案为16GB，比较一下档案系统限制表的结果可发现是一致的！但这个方法不能用在2K及4K block大小的计算中，因为大于2K的block将会受到Ext2档案系统本身的限制，所以计算的结果会不太符合。

#### Superblock (超级区块)
Superblock 是记录整个filesystem 相关资讯的地方， 没有Superblock ，就没有这个filesystem 了。他记录的资讯主要有：
- block 与inode 的总量；
- 未使用与已使用的inode / block 数量；
- block 与inode 的大小(block 为1, 2, 4K，inode 为128bytes 或256bytes)；
- filesystem 的挂载时间、最近一次写入资料的时间、最近一次检验磁碟(fsck) 的时间等档案系统的相关资讯；
- 一个valid bit 数值，若此档案系统已被挂载，则valid bit 为0 ，若未被挂载，则valid bit 为1 。

Superblock是非常重要的，因为我们这个档案系统的基本资讯都写在这里，因此，如果superblock死掉了，你的档案系统可能就需要花费很多时间去挽救！一般来说， superblock的大小为1024bytes。相关的superblock讯息我们等一下会以dumpe2fs指令来呼叫出来观察！

此外，除了第一个block group 内会含有superblock 之外，后续的block group 不一定含有superblock ， 而若含有superblock 则该superblock 主要是做为第一个block group 内superblock 的备份，这样可以进行superblock的恢复！

#### Filesystem Description (档案系统描述说明)
这个区段可以描述每个block group的开始与结束的block号码，以及说明每个区段(superblock, bitmap, inodemap, data block)分别介于哪一个block号码之间。这部份也能够用dumpe2fs来观察的。

#### block bitmap (区块对照表)
如果你想要新增档案时总会用到block 吧！那你要使用哪个block 来记录呢？当然是选择『空的block 』来记录新档案的资料。那你怎么知道哪个block 是空的？这就得要通过block bitmap 的辅助了。从block bitmap 当中可以知道哪些block 是空的，因此我们的系统就能够很快速的找到可使用的空间来处置档案。

同样的，如果你删除某些档案时，那么那些档案原本占用的block 号码就得要释放出来， 此时在block bitmap 当中相对应到该block 号码的标志就得要修改成为『未使用中』！这就是bitmap 的功能。

#### inode bitmap (inode 对照表)
这个其实与block bitmap 是类似的功能，只是block bitmap 记录的是使用与未使用的block 号码， 至于inode bitmap 则是记录使用与未使用的inode 号码！

#### dumpe2fs： 查询Ext 家族superblock 资讯的指令
了解了档案系统的概念之后，接着是观察这个档案系统！刚刚谈到的各部分资料都与block 号码有关！每个区段与superblock 的资讯都可以使用dumpe2fs 这个指令来查询的！

格式： dumpe2fs [-bh] 设备名称
选项与参数：
- -b ：列出保留为坏轨的部分(一般用不到)
- -h ：仅列出superblock 的资料，不会列出其他的区段内容！

利用dumpe2fs 可以查询到非常多的资讯，依内容主要可以区分为上半部是superblock 内容， 下半部则是每个block group 的资讯了。不过很可惜的是，CentOS 7 现在是以xfs 为预设档案系统， 所以无法使用dumpe2fs 去查询任何档案系统。

### 与目录树的关系
在Linux系统下，每个档案(不管是一般档案还是目录档案)都会占用一个inode ，且可依据档案内容的大小来分配多个block给该档案使用。而目录的内容在记录档名，一般档案才是实际记录资料内容的地方。那么目录与档案在档案系统当中是如何记录资料的呢？基本上可以这样说：
#### 目录
当我们在Linux下的档案系统建立一个目录时，档案系统会分配一个inode与至少一块block给该目录。其中，inode记录该目录的相关权限与属性，并可记录分配到的那块block号码；而block则是记录在这个目录下的档名与该档名占用的inode号码资料。如果想要实际观察root 家目录内的档案所占用的inode 号码时，可以使用ls -i 这个选项来处理：
```bash
[root@study ~]# ls -li
总用量 4
25165923 -rw-------. 1 root root 1835 1月   5 17:03 anaconda-ks.cfg
```

#### 档案：
当我们在Linux 下的ext2 建立一个一般档案时， ext2 会分配一个inode 与相对于该档案大小的block 数量给该档案。例如：假设我的一个block 为4 Kbytes ，而我要建立一个100 KBytes 的档案，那么linux 将分配一个inode 与25 个block 来储存该档案！但同时请注意，由于inode 仅有12 个直接指向，因此还要多一个block 来作为区块号码的记录喔！

#### 目录树读取：
档名的记录是在目录的block当中，因此当我们要读取某个档案时，就会经过目录的inode与block ，然后才能够找到那个待读取档案的inode号码，最终才会读到正确的档案的block内的资料。
由于目录树是由根目录开始读起，因此系统透过挂载的资讯可以找到挂载点的inode 号码，此时就能够得到根目录的inode 内容，并依据该inode 读取根目录的block 内的档名资料，再一层一层的往下读到正确的档名。举例来说，如果想要读取/etc/passwd 这个档案时，系统是如何读取的呢？
```bash
[root@study ~]# ll -di / /etc /etc/passwd
      96 dr-xr-xr-x. 17 root root  224 1月   5 17:03 /
16797793 drwxr-xr-x. 76 root root 8192 1月   7 05:12 /etc
17397013 -rw-r--r--.  1 root root 1132 1月   7 02:58 /etc/passwd
```
该档案的读取流程为:
- /的inode：
透过挂载点的资讯找到inode号码为96的根目录inode，且inode规范的权限让我们可以读取该block的内容(有r与x) ；

- /的block：
经过上个步骤取得block的号码，并找到该内容有etc/目录的inode号码(16797793)； 

- etc/的inode：
读取16797793号inode得知root具有r与x的权限，因此可以读取etc/的block内容； 

- etc/的block：
经过上个步骤取得block号码，并找到该内容有passwd档案的inode号码(17397013)； 

- passwd的inode：
读取17397013号inode得知root具有r的权限，因此可以读取passwd的block内容； 

- passwd的block：
最后将该block内容的资料读出来。

#### filesystem 大小与磁碟读取效能：
关于档案系统的使用效率上，当一个档案系统规划的很大时，例如100GB这么大时，由于磁碟上面的资料总是来来去去的，所以，整个档案系统上面的档案通常无法连续写在一起(block号码不会连续的意思)，而是填入式的将资料填入没有被使用的block当中。如果档案写入的block真的分的很散，此时就会有所谓的档案资料离散的问题发生了。

如前所述，虽然ext2 在inode 处已经将该档案所记录的block 号码都记上了， 所以资料可以一次性读取，但是如果档案真的太过离散，确实还是会发生读取效率低落的问题。因为磁碟读取头还是得要在整个档案系统中来来去去的频繁读取！果真如此，那么可以将整个filesystem 内的资料全部复制出来，将该filesystem 重新格式化， 再将资料给他复制回去即可解决这个问题。

此外，如果filesystem 真的太大了，那么当一个档案分别记录在这个档案系统的最前面与最后面的block 号码中， 此时会造成磁碟的机械手臂移动幅度过大，也会造成资料读取效能的低落。而且读取头在搜寻整个filesystem 时， 也会花费比较多的时间去搜寻！因此， partition 的规划并不是越大越好， 而是真的要针对主机用途来进行规划才行！

### EXT2/EXT3/EXT4 档案的存取与日志式档案系统的功能
上一小节谈到的仅是读取而已，那么如果是新建一个档案或目录时，我们的档案系统是如何处理的呢？这个时候就得要block bitmap 及inode bitmap 的帮忙了！假设我们想要新增一个档案，此时档案系统的行为是：

1. 先确定使用者对于想要新增档案的目录是否具有w 与x 的权限，若有的话才能新增；
2. 根据inode bitmap 找到没有使用的inode 号码，并将新档案的权限/属性写入；
3. 根据block bitmap 找到没有使用中的block 号码，并将实际的资料写入block 中，且更新inode 的block 指向资料；
4. 将刚刚写入的inode 与block 资料同步更新inode bitmap 与block bitmap，并更新superblock 的内容。

一般来说，我们将inode table与data block称为资料存放区域，至于其他例如superblock、 block bitmap与inode bitmap等区段就被称为metadata (元数据)，因为superblock, inode bitmap及block bitmap的资料是经常变动的，每次新增、移除、编辑时都可能会影响到这三个部分的资料。

#### 资料的不一致(Inconsistent) 状态
在一般正常的情况下，上述的新增操作当然可以顺利的完成。但是如果有个万一怎么办？例如档案在写入档案系统时，因为不知名原因导致系统中断(例如突然的停电啊、系统核心发生错误啊等等事情发生时)，所以写入的资料仅有inode table及data block而已，最后一个同步更新元数据的步骤并没有做完，此时就会发生metadata的内容与实际资料存放区产生不一致(Inconsistent)的情况了。

既然有不一致当然就得要克服！在早期的Ext2档案系统中，如果发生这个问题，那么系统在重新开机的时候，就会藉由Superblock当中记录的valid bit (是否有挂载)与filesystem state (clean与否)等状态来判断是否强制进行资料一致性的检查！若有需要检查时则以e2fsck这个程式来进行的。

不过，这样的检查真的是很费时～因为要针对metadata 区域与实际资料存放区来进行比对，得要搜寻整个filesystem 。而且在对Internet 提供服务的伺服器主机上面， 这样的检查真的会造成主机复原时间的拉长～这也就造成后来所谓日志式档案系统的兴起了。

#### 日志式档案系统(Journaling filesystem)
为了避免上述提到的档案系统不一致的情况发生，因此前辈们想到一个方式， 如果在我们的filesystem 当中规划出一个区块，该区块专门在记录写入或修订档案时的步骤， 那不就可以简化一致性检查的步骤了？也就是说：
1. 预备：当系统要写入一个档案时，会先在日志记录区块中纪录某个档案准备要写入的资讯；
2. 实际写入：开始写入档案的权限与资料；开始更新metadata 的资料；
3. 结束：完成资料与metadata 的更新后，在日志记录区块当中完成该档案的纪录。

在这样的程序当中，万一资料的纪录过程当中发生了问题，那么我们的系统只要去检查日志记录区块， 就可以知道哪个档案发生了问题，针对该问题来做一致性的检查即可，而不必针对整块filesystem 去检查， 这样就可以达到快速修复filesystem 的能力了！这就是日志式档案最基础的功能～

### Linux 档案系统的运作
所有的资料都得要载入到记忆体后CPU才能够对该资料进行处理。如果常常编辑一个很大的档案，在编辑的过程中又频繁的要系统来写入到磁碟中，由于磁碟写入的速度要比记忆体慢很多，因此会常常耗在等待磁碟的写入/读取上。

为了解决这个效率的问题，因此Linux 使用的方式是透过一个称为非同步处理(asynchronously) 的方式。所谓的非同步处理是这样的：

当系统加载一个档案到记忆体后，如果该档案没有被更动过，则在记忆体区段的档案资料会被设定为干净(clean)的。 但如果记忆体中的档案资料被更改过了(例如用nano去编辑过这个档案)，此时该记忆体中的资料会被设定为脏的(Dirty)。此时所有的动作都还在记忆体中执行，并没有写入到磁碟中！系统会不定时的将记忆体中设定为『Dirty』的资料写回磁碟，以保持磁碟与记忆体资料的一致性。也可以利用sync指令来手动强迫写入磁碟。

记忆体的速度要比磁碟快的多，因此如果能够将常用的档案放置到记忆体当中，这不就会增加系统性能吗？因此Linux 系统上面档案系统与记忆体有非常大的关系：

- 系统会将常用的​​档案资料放置到主记忆体的缓冲区，以加速档案系统的读/写；
- 承上，因此Linux 的实体记忆体最后都会被用光！这是正常的情况！可加速系统效能；
- 可以手动使用sync 来强迫记忆体中设定为Dirty 的档案回写到磁碟中；
- 若正常关机时，关机指令会主动呼叫sync 来将记忆体的资料回写入磁碟内；
- 但若不正常关机(如跳电、当机或其他不明原因)，由于资料尚未回写到磁碟内， 因此重新开机后可能会花很多时间在进行磁碟检验，甚至可能导致档案系统的损毁(非磁碟损毁)。

### 挂载点的意义(mount point)

每个filesystem都有独立的inode / block / superblock等资讯，这个档案系统要能够连结到目录树才能被我们使用。将档案系统与目录树结合的动作我们称为『挂载』。挂载点一定是目录，该目录为进入该档案系统的入口。 因此并不是有任何档案系统都能使用，必须要『挂载』到目录树的某个目录后，才能够使用该档案系统的。

举例来说，如果安装的是CentOS 7.x的话，那么应该会有三个挂载点，分别是/, /boot, /home三个。如果观察这三个目录的inode号码时，可以发现如下的情况：
```bash
[kiyon@study ~]$ ls -lid / /boot /home
96 dr-xr-xr-x. 17 root root  224 1月   5 17:03 /
96 dr-xr-xr-x.  4 root root 4096 1月   6 08:32 /boot
96 drwxr-xr-x.  5 root root   43 1月   7 02:58 /home
```
因此可以发现最顶层的目录的inode都是96，所以/, /boot, /home为三个不同的filesystem！(因为每一行的档案属性并不相同，且三个目录的挂载点也均不相同。)
根目录下的.与..是相同的东西，因为权限是一模一样的！如果使用档案系统的观点来看，同一个filesystem的某个inode只会对应到一个档案内容而已(因为一个档案占用一个inode)，因此我们可以透过判断inode号码来确认不同档名是否为相同的档案：
```bash
[kiyon@study ~]$ ls -ild / /. /..
96 dr-xr-xr-x. 17 root root 224 1月   5 17:03 /
96 dr-xr-xr-x. 17 root root 224 1月   5 17:03 /.
96 dr-xr-xr-x. 17 root root 224 1月   5 17:03 /..
```
上面的资讯中由于挂载点均为/ ，因此三个档案(/, /., /..) 均在同一个filesystem 内，而这三个档案的inode 号码均为96 号，因此这三个档名都指向同一个inode 号码，当然这三个档案的内容也就完全一模一样了！也就是说，根目录的上层(/..) 就是他自己！

### 其他Linux 支援的档案系统与VFS

虽然Linux 的标准档案系统是ext2 ，且还有增加了日志功能的ext3/ext4 ，事实上，Linux 还支援很多档案系统格式的， 尤其是最近这几年推出了好几种速度很快的日志式档案系统，包括SGI 的XFS 档案系统， 可以适用更小型档案的Reiserfs 档案系统，以及Windows 的FAT 档案系统等等， 都能够被Linux 所支援喔！常见的支援档案系统有：

- 传统档案系统：ext2 / minix / MS-DOS / FAT (用vfat 模组) / iso9660 (光碟)等等；
- 日志式档案系统： ext3 /ext4 / ReiserFS / Windows' NTFS / IBM's JFS / SGI's XFS / ZFS
- 网路档案系统： NFS / SMBFS

#### Linux VFS (Virtual Filesystem Switch)
整个Linux 的系统都是透过一个名为Virtual Filesystem Switch 的核心功能去读取filesystem 的。也就是说，整个Linux 认识的filesystem 其实都是VFS 在进行管理，使用者并不需要知道每个partition 上头的 filesystem 是什么～ VFS 会主动做好读取的动作。

### XFS 档案系统简介
CentOS 7 开始，预设的档案系统已经由原本的EXT4 变成了XFS 档案系统了！为什么CentOS 要舍弃对Linux 支援度最完整的EXT 家族而改用XFS 呢？这是有一些原因存在的。

#### EXT 家族当前较伤脑筋的地方：支援度最广，但格式化超慢！
Ext 档案系统家族对于档案格式化的处理方面，采用的是预先规划出所有的inode/block/meta data 等资料，未来系统可以直接取用， 不需要再进行动态配置的作法。这个作法在早期磁碟容量还不大的时候还算OK 没啥问题，但时至今日，磁碟容量越来越大，连传统的MBR 都已经被GPT 所取代，超大TB 容量也已经不够看了！现在都已经说到PB 或EB 以上容量了！TB 以上等级的传统ext 家族档案系统在格式化的时候，光是系统要预先分配inode 与block 就消耗好多好多的人类时间了...

另外，由于虚拟化的应用越来越广泛，而作为虚拟化磁碟来源的大型档案(单一档案好几个GB 以上！) 也就越来越常见了。这种巨型档案在处理上需要考虑到效能问题，否则虚拟磁碟的效率就会不太好看。因此，从CentOS 7.x 开始， 档案系统已经由预设的Ext4 变成了xfs 这一个较适合高容量磁碟与大型档案效能较佳的档案系统了。

#### XFS档案系统的配置
基本上xfs 就是一个日志式档案系统，而CentOS 7.x 拿它当预设的档案系统，自然就是因为最早之前，这个xfs 就是被开发来用于高容量磁碟以及高效能档案系统之用，因此，相当适合现在的系统环境。此外，几乎所有Ext4 档案系统有的功能， xfs 都可以具备！

xfs 档案系统在资料的分布上，主要规划为三个部份，一个资料区(data section)、一个档案系统活动日志区(log section)以及一个即时运作区(realtime section)。这三个区域的资料内容如下：
- 资料区(data section)

  基本上，资料区就跟我们之前谈到的ext 家族一样，包括inode/data block/superblock 等资料，都放置在这个区块。这个资料区与ext 家族的block group 类似，也是分为多个储存区群组(allocation groups) 来分别放置档案系统所需要的资料。每个储存区群组都包含了
  - 整个档案系统的superblock、 
  - 剩余空间的管理机制、 
  - inode的分配与追踪。
  
  此外，inode与block 都是系统需要用到时， 这才动态配置产生，所以格式化动作超级快！
  
  另外，与ext 家族不同的是， xfs 的block 与inode 有多种不同的容量可供设定，block 容量可由512bytes ~ 64K 调配，不过，Linux 的环境下， 由于记忆体控制的关系(分页档pagesize 的容量)，因此最高可以使用的block 大小为4K ！至于inode 容量可由256bytes 到2M 这么大！不过，大概还是保留256bytes 的预设值就很够用了！
  
- 档案系统活动日志区(log section)

  在日志区这个区域主要被用来纪录档案系统的变化。档案的变化会在这里纪录下来，直到该变化完整的写入到资料区后， 该笔纪录才会被终结。如果档案系统因为某些缘故(例如最常见的停电) 而损毁时，系统会拿这个日志区块来进行检验，看看系统挂掉之前， 档案系统正在运作些啥动作，用来快速的修复档案系统。
  
  因为系统所有动作的时候都会在这个区块做个纪录，因此这个区块的磁碟活动是相当频繁的！xfs 设计有点有趣，在这个区域中， 可以指定外部的磁碟来作为xfs 档案系统的日志区块！例如，可以将SSD 磁碟作为xfs 的日志区，这样当系统需要进行任何活动时， 就可以更快速的进行工作！

- 即时运作区(realtime section)

  当有档案要被建立时，xfs 会在这个区段里面找一个到数个的extent 区块，将档案放置在这个区块内，等到分配完毕后，再写入到data section 的inode 与block 去！这个extent 区块的大小得要在格式化的时候就先指定，最小值是4K 最大可到1G。一般非磁碟阵列的磁碟预设为64K 容量，而具有类似磁碟阵列的stripe 情况下，则建议extent 设定为与stripe 一样大较佳。这个extent 最好不要乱动，因为可能会影响到实体磁碟的效能。
  
#### XFS 档案系统的描述资料观察
使用xfs_info 进行观察
格式： `xfs_info 挂载点|设备名称`
```bash
## 范例一：找出系统/boot这个挂载点底下的档案系统的superblock纪录 
[kiyon@study ~]$ df -T /boot
文件系统       类型   1K-块   已用   可用 已用% 挂载点
/dev/sda2      xfs  1038336 140664 897672   14% /boot
## 可以看得出来是xfs 档案系统的

[kiyon@study ~]$ xfs_info /dev/sda2
meta-data=/dev/sda2              isize=512    agcount=4, agsize=65536 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
```
- 第1 行里面的isize 指的是inode 的容量，每个有512bytes 这么大。至于agcount 则是储存区群组(allocation group) 的个数，共有4 个， agsize 则是指每个储存区群组具有65536 个block 。配合第4 行的block 设定为4K，因此整个档案系统的容量应该就是4*65536*4K 这么大！
- 第2 行里面sectsz 指的是逻辑磁区(sector) 的容量设定为4096bytes 这么大的意思。
- 第4 行里面的bsize 指的是block 的容量，每个block 为4K 的意思，共有262144 个block 在这个档案系统内。
- 第5 行里面的sunit 与swidth 与磁碟阵列的stripe 相关性较高。这部份底下格式化的时候举一个例子来说明。
- 第7 行里面的internal 指的是这个日志区的位置在档案系统内，而不是外部设备的意思。且占用了4K * 2560 个block，总共约10M 的容量。
- 第9 行里面的realtime 区域，里面的extent 容量为4K。不过目前没有使用。

由于没有使用磁碟阵列，因此上头这个装置里头的sunit 与extent 就没有额外的指定特别的值。根据xfs 的说明，这两个值会影响到档案系统性能， 所以格式化的时候要特别留意！

## 档案系统的简单操作
稍微了解了档案系统后，接下来要知道如何查询整体档案系统的总容量与每个目录所占用的容量。
### 磁碟与目录的容量
#### df
列出档案系统的整体磁碟使用量
格式： `df [-ahikHTm] [目录或档名] `
选项与参数：
- -a ：列出所有的档案系统，包括系统特有的/proc 等档案系统；
- -k ：以KBytes 的容量显示各档案系统；
- -m ：以MBytes 的容量显示各档案系统；
- -h ：以人们较易阅读的GBytes, MBytes, KBytes 等格式自行显示；
- -H ：以M=1000K 取代M=1024K 的进位方式；
- -T ：连同该partition 的filesystem 名称(例如xfs) 也列出；
- -i ：不用磁碟容量，而以inode 的数量来显示

```bash
## 范例一：将系统内所有的filesystem列出来！
[kiyon@study ~]$ df
文件系统                   1K-块    已用    可用 已用% 挂载点
/dev/mapper/centos-root 10475520 1124208 9351312   11% /
devtmpfs                  495452       0  495452    0% /dev
tmpfs                     506184       0  506184    0% /dev/shm
tmpfs                     506184   13060  493124    3% /run
tmpfs                     506184       0  506184    0% /sys/fs/cgroup
/dev/sda2                1038336  140664  897672   14% /boot
/dev/mapper/centos-home  5232640   33184 5199456    1% /home
tmpfs                     101240       0  101240    0% /run/user/1000
## 在Linux 底下如果df 没有加任何选项，那么预设会将系统内所有的 
## (不含特殊记忆体内的档案系统与swap) 都以1 Kbytes 的容量来列出来！
## 至于那个/dev/shm 是与记忆体有关的挂载！
```
- Filesystem：代表该档案系统是在哪个partition ，所以列出装置名称；
- 1k-blocks：说明底下的数字单位是1KB！可利用-h或-m来改变容量；
- Used：顾名思义，就是使用掉的磁碟空间啦！
- Available：也就是剩下的磁碟空间大小；
- Use%：就是磁碟的使用率啦！如果使用率高达90%以上时，最好需要注意一下了，免得容量不足造成系统问题！(例如最容易被写爆的/var/spool/mail这个放置邮件的磁碟)
- Mounted on：就是磁碟挂载的目录所在

```bash
## 范例二：将容量结果以易读的容量格式显示出来 
[kiyon@study ~]$ df -h
文件系统                 容量  已用  可用 已用% 挂载点
/dev/mapper/centos-root   10G  1.1G  9.0G   11% /
devtmpfs                 484M     0  484M    0% /dev
tmpfs                    495M     0  495M    0% /dev/shm
tmpfs                    495M   13M  482M    3% /run
tmpfs                    495M     0  495M    0% /sys/fs/cgroup
/dev/sda2               1014M  138M  877M   14% /boot
/dev/mapper/centos-home  5.0G   33M  5.0G    1% /home
tmpfs                     99M     0   99M    0% /run/user/1000
## 不同于范例一，这里会以G/M 等容量格式显示出来，比较容易看啦！

## 范例三：将系统内的所有特殊档案格式及名称都列出来 
[kiyon@study ~]$ df -aT
文件系统                类型           1K-块    已用    可用 已用% 挂载点
rootfs                  -                  -       -       -     - /
sysfs                   sysfs              0       0       0     - /sys
proc                    proc               0       0       0     - /proc
devtmpfs                devtmpfs      495452       0  495452    0% /dev
securityfs              securityfs         0       0       0     - /sys/kernel/security
tmpfs                   tmpfs         506184       0  506184    0% /dev/shm
devpts                  devpts             0       0       0     - /dev/pts
tmpfs                   tmpfs         506184   13060  493124    3% /run
tmpfs                   tmpfs         506184       0  506184    0% /sys/fs/cgroup
## ...省略...
/dev/mapper/centos-root xfs         10475520 1124208 9351312   11% /
selinuxfs               selinuxfs          0       0       0     - /sys/fs/selinux
## ...省略...
/dev/sda2               xfs          1038336  140664  897672   14% /boot
/dev/mapper/centos-home xfs          5232640   33184 5199456    1% /home
tmpfs                   tmpfs         101240       0  101240    0% /run/user/1000
binfmt_misc             binfmt_misc        0       0       0     - /proc/sys/fs/binfmt_misc
## 系统里面其实还有很多特殊的档案系统存在的。那些比较特殊的档案系统几乎
## 都是在记忆体当中，例如/proc 这个挂载点。因此，这些特殊的档案系统
## 都不会占据磁碟空间

## 范例四：将/etc底下的可用的磁碟容量以易读的容量格式显示 
[kiyon@study ~]$ df -h /etc
文件系统                 容量  已用  可用 已用% 挂载点
/dev/mapper/centos-root   10G  1.1G  9.0G   11% /
## 在df 后面加上目录或者是档案时， df
## 会自动的分析该目录或档案所在的partition ，并将该partition 的容量显示出来，
## 通过这个指令就可以知道某个目录底下还有多少容量可以使用

## 范例五：将目前各个partition当中可用的inode数量列出 
[kiyon@study ~]$ df -ih
文件系统                Inode 已用(I) 可用(I) 已用(I)% 挂载点
/dev/mapper/centos-root  5.0M     32K    5.0M       1% /
devtmpfs                 121K     377    121K       1% /dev
tmpfs                    124K       1    124K       1% /dev/shm
tmpfs                    124K     443    124K       1% /run
tmpfs                    124K      16    124K       1% /sys/fs/cgroup
/dev/sda2                512K     330    512K       1% /boot
/dev/mapper/centos-home  2.5M      23    2.5M       1% /home
tmpfs                    124K       1    124K       1% /run/user/1000
## 这个范例则主要列出可用的inode 剩余量与总容量。分析一下与范例一的关系，
## 可以清楚的发现到，通常inode 的数量剩余都比block 还要多
```
由于df 主要读取的资料几乎都是针对一整个档案系统，因此读取的范围主要是在Superblock 内的资讯， 所以这个指令显示结果的速度非常的快速！在显示的结果中需要特别留意的是那个根目录的剩余容量！因为所有的资料都是由根目录衍生出来的，因此当根目录的剩余容量剩下0 时，那Linux 可能就问题很大了。

另外需要注意的是，如果使用-a 这个参数时，系统会出现/proc 这个挂载点，但是里面的东西都是 0 ，因为/proc 的东西都是Linux 系统所需要载入的系统资料，而且是挂载在『记忆体当中』的， 所以没有占任何的磁碟空间！

至于那个/dev/shm/目录，其实是利用记忆体虚拟出来的磁碟空间，通常是总实体记忆体的一半！ 由于是透过记忆体模拟出来的磁碟，因此在这个目录底下建立任何资料档案时，存取速度是非常快速的！(在记忆体内工作)不过，也由于它是记忆体模拟出来的，因此这个档案系统的大小在每部主机上都不一样，而且建立的东西在下次开机时就消失了。

#### du
评估档案系统的磁碟使用量(常用在估计目录所占容量)
格式： `du [-ahskm] 档案或目录名称`
选项与参数：
- -a ：列出所有的档案与目录容量，因为预设仅统计目录底下的档案量。
- -h ：以人们较易读的容量格式(G/M) 显示；
- -s ：列出总量，而不列出每个各别的目录占用容量；
- -S ：不包括子目录下的总计，与-s 有点差别。
- -k ：以KBytes 列出容量显示；
- -m ：以MBytes 列出容量显示；

```bash
## 范例一：列出目前目录下的所有档案容量,每个目录都会列出来,包括隐藏档的目录 
[root@study ~]# du 
28	.           # 这个目录(.)所占用的总量
#直接输入du没有加任何选项时，则du会分析『目前所在目录』
## 的档案与目录所占用的磁碟空间。但是，实际显示时，仅会显示目录容量(不含档案)，
## 因此. 目录有很多档案没有被列出来，所以全部的目录相加不会等于. 的容量！
## 此外，输出的数值资料为1K 大小的容量单位。

## 范例二：同范例一，但是将档案的容量也列出来 
[root@study ~]# du -a
4	./.bash_logout
4	./.bash_profile
4	./.bashrc
4	./.cshrc
4	./.tcshrc
4	./anaconda-ks.cfg
4	./.bash_history
28	.

## 范例三：检查根目录底下每个目录所占用的容量 
[root@study ~]# du -sm /*
0	/bin
105	/boot2333
## ....(中间省略)....
du: 无法访问"/proc/29910/task/29910/fd/4": 没有那个文件或目录
du: 无法访问"/proc/29910/task/29910/fdinfo/4": 没有那个文件或目录
## ....(中间省略)....
0	/proc       # 不会占用硬碟空间
1	/root
13	/run
933	/usr        # 系统初期最大就是它了
90	/var
## 这是个很常被使用的功能～利用* 来代表每个目录，如果想要检查某个目录下，
## 哪个次目录占用最大的容量，可以用这个方法找出来。值得注意的是，如果刚刚安装好Linux 时，
## 那么整个系统容量最大的应该是/usr 。而/proc 虽然有列出容量，但是那个容量是在记忆体中，
## 不占磁碟空间。至于/proc 里头会列出一堆『没有那个文件或目录』 的错误，
## 别担心！因为是记忆体内的程序，程序执行结束就会消失，因此会有些目录找不到，是正确的！
```

与df 不一样的是，du 这个指令其实会直接到档案系统内去搜寻所有的档案资料， 所以上述第三个范例指令的运作会执行一小段时间！此外，在预设的情况下，容量的输出是以KB 来设计的， 如果想要知道目录占了多少MB ，那么就使用-m 这个参数即可！而如果只想要知道该目录占了多少容量的话，使用-s 就可以了！

至于-S 这个选项部分，由于du 预设会将所有档案的大小均列出，因此假设在/etc 底下使用du 时， 所有的档案大小，包括/etc 底下的次目录容量也会被计算一次。然后最终的容量(/etc) 也会加总一次。如果想要列出某目录下的全部资料， 或许也可以加上-S 的选项，减少次目录的加总！

### 实体连结与符号连结： ln
在Linux 底下的连结档有两种，一种是类似Windows 的捷径功能的档案，可以快速的连结到目标档案(或目录)； 另一种则是透过档案系统的inode 连结来产生新档名，而不是产生新档案！这种称为实体连结(hard link)。

#### Hard Link (实体连结)
hard link只是在某个目录下新增一个档名连结到某inode号码的关联记录。
```bash
[root@study ~]# ll -i /etc/crontab
16996535 -rw-r--r--. 1 root root 451 6月  10 2014 /etc/crontab

#建立实体连结的指令 
[root@study ~]# ln /etc/crontab .
[root@study ~]# ll -i /etc/crontab crontab
16996535 -rw-r--r--. 2 root root 451 6月  10 2014 crontab
16996535 -rw-r--r--. 2 root root 451 6月  10 2014 /etc/crontab
```
可以发现两个档名都连结到16996535这个inode号码，所以这两个『档名』其实是一模一样的『档案』。第二个栏位由原本的1变成2了！那个栏位称为『连结』，它的意义为：『有多少个档名连结到这个inode号码』。hard link 只是在某个目录下的block 多写入一个关联资料而已，既不会增加inode 也不会耗用block 数量

:star::star:hard link 是有限制的：
- 不能跨Filesystem；
- 不能link 目录。

#### Symbolic Link (快捷方式)
相对于hard link ，Symbolic link就是在建立一个独立的档案，而这个档案会让资料的读取指向它link的那个档案的档名！由于只是利用档案来做为指向的动作，所以，当源文件被删除之后，symbolic link的档案会『开不了』，会一直说『无法开启某档案！』。实际上就是找不到原始『档名』！

```bash
[root@study ~]# ln -s /etc/crontab crontab2
[root@study ~]# ll -i /etc/crontab /root/crontab2
16996535 -rw-r--r--. 2 root root 451 6月  10 2014 /etc/crontab
25165974 lrwxrwxrwx. 1 root root  12 1月   8 14:17 /root/crontab2 -> /etc/crontab
```
两个档案指向不同的inode号码，当然就是两个独立的档案！而且连结档的重要内容就是它会写上目标档案的『档名』，可以发现为什么上表中连结档的大小为12 bytes呢？因为箭头(->)右边的档名『/etc/crontab』总共有12个英文，每个英文占用1个bytes ，所以档案大小就是12bytes了！

格式：`ln [-sf]来源档目标档`
选项与参数：
- -s ：如果不加任何参数就进行连结，那就是hard link，至于-s就是symbolic link 
- -f ：如果目标档存在时，就强制的将目标档直接移除后再建立！

```bash
## 范例一：将/etc/passwd复制到/tmp底下，并且观察inode与block 
[root@study ~]# cd /tmp 
[root@study tmp]# cp -a /etc/passwd . 
[root@study tmp] du -sb ; df -i . 
1590	.
文件系统                  Inode 已用(I) 可用(I) 已用(I)% 挂载点
/dev/mapper/centos-root 5242880   31793 5211087       1% /
 #利用du与df来检查一下目前的参数～那个du -sb是计算整个/tmp底下有多少bytes的容量！

## 范例二：将/tmp/passwd制作hard link成为passwd-hd档案，并观察档案与容量 
[root@study tmp]# ln passwd passwd-hd 
[root@study tmp]# du -sb ; df -i . 
1607	.
文件系统                  Inode 已用(I) 可用(I) 已用(I)% 挂载点
/dev/mapper/centos-root 5242880   31793 5211087       1% /
## 仔细看，即使多了一个档案在/tmp底下，整个inode与block的容量并没有改变！

[root@study tmp]# ls -il passwd* 
17467403 -rw-r--r--. 2 root root 1132 1月   7 02:58 passwd
17467403 -rw-r--r--. 2 root root 1132 1月   7 02:58 passwd-hd
## 指向同一个inode！另外，那个第二栏的连结数也会增加！

## 范例三：将/tmp/passwd建立一个符号连结 
[root@study tmp]# ln -s passwd passwd-so 
[root@study tmp]# ls -li passwd*
17467403 -rw-r--r--. 2 root root 1132 1月   7 02:58 passwd
17467403 -rw-r--r--. 2 root root 1132 1月   7 02:58 passwd-hd
17467406 lrwxrwxrwx. 1 root root    6 1月   8 14:31 passwd-so -> passwd
## passwd-so指向的inode number不同了！这是一个新的档案～这个档案的内容是指向
## passwd 的。passwd-so 的大小是6bytes ，因为『passwd』 这个单词共有六个字母

[root@study tmp]# du -sb ; df -i . 
1630	.
文件系统                  Inode 已用(I) 可用(I) 已用(I)% 挂载点
/dev/mapper/centos-root 5242880   31794 5211086       1% /
## 整个容量与inode使用数都改变了！

## 范例四：删除原始档案passwd ，其他两个档案是否能够打开？
[root@study tmp]# rm passwd 
[root@study tmp]# cat passwd-hd 
## .....(正常显示完毕！) 
[root@study tmp]# cat passwd-so
cat: passwd-so: 没有那个文件或目录
[root@study tmp]# ll passwd*
-rw-r--r--. 1 root root 1132 1月   7 02:58 passwd-hd
lrwxrwxrwx. 1 root root    6 1月   8 14:31 passwd-so -> passwd
#符号连结果然无法打开！另外，如果符号连结的目标档案不存在，
## 其实档名的部分就会有特殊的颜色显示！
```

#### 关于目录的link 数量
当建立一个新目录名称为/tmp/testing 时，基本上会有三个东西，那就是：
- /tmp/testing
- /tmp/testing/.
- /tmp/testing/..

而其中/tmp/testing与/tmp/testing/.其实是一样的！都代表该目录～而/tmp/testing/..则代表/tmp这个目录，所以说，当建立一个新的目录时， 『新的目录的link数为2 ，而上层目录的link数则会增加1』。
```bash
[root@study tmp]# ls -ld /tmp
drwxrwxrwt. 7 root root 186 1月   8 14:34 /tmp
[root@study tmp]# mkdir /tmp/testing1
[root@study tmp]# ls -ld /tmp
drwxrwxrwt. 8 root root 202 1月   8 15:03 /tmp       #这里的link数量加1了！
[root@study tmp]# ls -ld /tmp/testing1
drwxr-xr-x. 2 root root 6 1月   8 15:03 /tmp/testing1
```

## 磁碟的分割、格式化、检验与挂载
想要在系统里面新增一个磁碟时，有下面动作需要做：
1. 对磁碟进行分割，建立可用的partition ；
2. 对该partition 进行格式化(format)，以建立系统可用的filesystem；
3. 若想要仔细一点，则可对刚刚建立好的filesystem 进行检验；
4. 在Linux 系统上，需要建立挂载点(就是目录)，并将它挂载上来；

### 观察磁碟分割状态
目前磁碟分割主要有MBR以及GPT两种格式，这两种格式所使用的分割工具不太一样！可以使用本章最后才介绍的parted 这个通通都支援的工具来处理，不过，一般建议使用fdisk或者是gdisk来处理分割。

#### lsblk 列出系统上的所有磁碟列表
lsblk 可以看成『 list block device 』的缩写，就是列出所有储存装置的意思！
格式： `lsblk [-dfimpt] [device]`
选项与参数：
- -d ：仅列出磁碟本身，并不会列出该磁碟的分割资料
- -f ：同时列出该磁碟内的档案系统名称
- -i ：使用ASCII 的线段输出，不要使用复杂的编码(在某些环境下很有用)
- -m ：同时输出该装置在/dev 底下的权限资料(rwx 的资料)
- -p ：列出该装置的完整档名！而不是仅列出最后的名字而已。
- -t ：列出该磁碟装置的详细资料，包括磁碟伫列机制、预读写的资料量大小等

```bash
## 范例一：列出本系统下的所有磁碟与磁碟内的分割资讯 
[root@study ~]# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   40G  0 disk            # 一整颗磁碟
├─sda1            8:1    0    2M  0 part
├─sda2            8:2    0    1G  0 part /boot
└─sda3            8:3    0   30G  0 part
  ├─centos-root 253:0    0   10G  0 lvm  /          # 在sda3内的其他档案系统
  ├─centos-swap 253:1    0    1G  0 lvm  [SWAP]
  └─centos-home 253:2    0    5G  0 lvm  /home
sr0              11:0    1 1024M  0 rom
```

从上面的输出可以很清楚的看到，目前的系统主要有个sr0 以及一个sda 的装置，而sda 的装置底下又有三个分割， 其中sda3 甚至还有因为LVM 产生的档案系统！相当的完整！看看预设输出的资讯有哪些：
- NAME：就是装置的档名！会省略/dev 等前导目录！
- MAJ:MIN：其实核心认识的装置都是透过这两个代码来熟悉的！分别是主要：次要装置代码！
- RM：是否为可卸载装置(removable device)，如光碟、USB 磁碟等等
- SIZE：容量！
- RO：Read Only是否为只读装置的意思
- TYPE：是磁碟(disk)、分割槽(partition) 还是只读记忆体(rom) 等输出
- MOUTPOINT：挂载点！

```bash
## 范例二：仅列出/dev/vda装置内的所有资料的完整档名 
[root@study ~]# lsblk -ip /dev/sda
NAME                        MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
/dev/sda                      8:0    0  40G  0 disk
|-/dev/sda1                   8:1    0   2M  0 part
|-/dev/sda2                   8:2    0   1G  0 part /boot
`-/dev/sda3                   8:3    0  30G  0 part
  |-/dev/mapper/centos-root 253:0    0  10G  0 lvm  /
  |-/dev/mapper/centos-swap 253:1    0   1G  0 lvm  [SWAP]
  `-/dev/mapper/centos-home 253:2    0   5G  0 lvm  /home     #完整的档名，由/开始写
```

#### blkid 列出装置的UUID 等参数
虽然lsblk 已经可以使用-f 来列出档案系统与装置的UUID 资料，不过，一般直接使用blkid 来找出装置的UUID！UUID 是全域单一识别码(universally unique identifier)，Linux 会将系统内所有的装置都给予一个独一无二的识别码， 这个识别码就可以拿来作为挂载或者是使用这个装置/档案系统用了。
```bash
[root@study ~]# blkid
/dev/sda1: PARTUUID="34891344-f28d-4793-afd1-8818ba8cb164"
/dev/sda2: UUID="3d9c5cba-0978-45ac-a2f2-d9fe89856434" TYPE="xfs" PARTUUID="4cf9582b-4297-49c5-b563-a83145672e9e"
/dev/sda3: UUID="KW60Zn-VMrL-3LyS-EWzW-jm3V-X0cB-LMbuTw" TYPE="LVM2_member" PARTUUID="76e23eb8-f80d-41f5-a972-176e6c501e7e"
/dev/mapper/centos-root: UUID="100f3f0b-2321-46ac-a883-3ba6098424bf" TYPE="xfs"
/dev/mapper/centos-swap: UUID="dec9d9c9-0f1a-4e11-ab8d-024e0697c15d" TYPE="swap"
/dev/mapper/centos-home: UUID="464e7270-d13b-4952-8c60-bebdd0b5dc51" TYPE="xfs"
```
如上所示，每一行代表一个档案系统，主要列出装置名称、UUID 名称以及档案系统的类型(TYPE)！

#### parted 列出磁碟的分割表类型与分割资讯
格式：`parted device_name print`
```bash
## 范例一：列出/dev/sda磁碟的相关资料 
[root@study ~]# parted /dev/sda print 
Model: ATA study.centos.kiy (scsi)          # 磁碟的模组名称(厂商) 
Disk /dev/sda: 42.9GB                       # 磁碟的总容量
Sector size (logical/physical): 512B/4096B  # 磁碟的每个逻辑/物理磁区容量
Partition Table: gpt                        # 分割表的格式(MBR/GPT)
Disk Flags: pmbr_boot
## 分割资料
Number  Start   End     Size    File system  Name  标志
 1      1049kB  3146kB  2097kB                     bios_grub
 2      3146kB  1077MB  1074MB  xfs
 3      1077MB  33.3GB  32.2GB                     lvm
```

### 磁碟分割： gdisk/fdisk
『MBR分割表请使用fdisk分割， GPT分割表请使用gdisk分割！』 否则会分割失败！另外，这两个工具软体的操作很类似，执行了该软体后，可以透过该软体内部的说明资料来操作，因此不需要硬背！只要知道方法即可。

#### gdisk
格式： `gdisk 装置名称`

```bash
## 范例：由前一小节的lsblk输出，我们知道系统有个/dev/vda，请观察该磁碟的分割与相关资料 
[root@study ~]# gdisk /dev/sda
GPT fdisk (gdisk) version 0.8.6

Partition table scan:
  MBR: protective
  BSD: not present
  APM: not present
  GPT: present

Found valid GPT with protective MBR; using GPT.
## 这里可以让你输入指令动作，可以按问号(?)来查看可用指令
Command (? for help):?
b	back up GPT data to a file
c	change a partition's name
d:star:	delete a partition
i	show detailed information on a partition
l	list known partition types
n:star:	add a new partition
o	create a new empty GUID partition table (GPT)
p:star:	print the partition table
q:star:	quit without saving changes
r	recovery and transformation options (experts only)
s	sort partitions
t	change a partition's type code
v	verify disk
w:star:	write table to disk and exit            # 储存分割操作后离开gdisk
x	extra functionality (experts only)
?	print this menu

Command (? for help):
```
使用gdisk是完全不需要背指令的！如同上面的表格中，只要按下?就能够看到所有的动作！比较重要的动作在上面已经标出来了。其中比较不一样的是『q与w』这两个玩意儿！不管进行了什么动作，只要离开gdisk时按下『q』，那么所有的动作『都不会生效！』相反的，按下『w』就是动作生效的意思。所以，可以随便玩gdisk ，只要离开时按下的是『q』即可。

```bash
Command (? for help): p   # 这里可以输出目前磁碟的状态 
Disk /dev/sda: 83886080 sectors, 40.0 GiB
Logical sector size: 512 bytes
Disk identifier (GUID): 1B818DD4-AA7E-46A0-927D-DD70EB1CDE41
Partition table holds up to 128 entries
First usable sector is 34, last usable sector is 83886046
Partitions will be aligned on 2048-sector boundaries
Total free space is 18862013 sectors (9.0 GiB)

Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048            6143   2.0 MiB     EF02
   2            6144         2103295   1024.0 MiB  0700
   3         2103296        65026047   30.0 GiB    8E00
## 分割编号开始磁区号码结束磁区号码容量大小 
Command (? for help): q 
```
使用『 p 』可以列出目前这颗磁碟的分割表资讯，这个资讯的上半部在显示整体磁碟的状态。这个磁碟共有40GB 左右的容量，共有83886080 个磁区，每个磁区的容量为512bytes。要注意的是，现在的分割主要是以磁区为最小的单位！

下半部的分割表资讯主要在列出每个分割槽的个别资讯项目。每个项目的意义为：
- Number：分割槽编号，1 号指的是/dev/sda1 这样计算。
- Start (sector)：每一个分割槽的开始磁区号码位置
- End (sector)：每一个分割的结束磁区号码位置，与start 之间可以算出分割槽的总容量
- Size：就是分割槽的容量了
- Code：在分割槽内的可能的档案系统类型。Linux 为8300，​​swap 为8200。不过这个项目只是一个提示而已，不见得真的代表此分割槽内的档案系统！
- Name：档案系统的名称等等。

从上表可以发现几件事情：
- 整部磁碟还可以进行额外的分割，因为最大磁区为83886080，但只使用到65026047 号而已；
- 分割槽的设计中，新分割通常选用上一个分割的结束磁区号码数加1 作为起始磁区号码！

这个gdisk只有root才能执行，此外，请注意，使用的『装置档名』不要加上数字，因为partition是针对『整个磁碟装置』而不是某个partition！所以执行『 gdisk /dev/sda1 』就会发生错误！

#### 用gdisk 新增分割槽
假设需要有如下的分割需求：
- 1GB 的xfs 档案系统(Linux)
- 1GB 的vfat 档案系统(Windows)
- 0.5GB 的swap (Linux swap)(这个分割等一下会被删除！)

```bash
[root@study ~]# gdisk /dev/vda 
Command (? for help): p
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048            6143   2.0 MiB     EF02
   2            6144         2103295   1024.0 MiB  0700
   3         2103296        65026047   30.0 GiB    8E00
## 找出最后一个sector的号码很重要！

Command (? for help): ?   # 查一下增加分割的指令为何 
Command (? for help): n   # 就是这个！所以开始新增的行为！
Partition number (4-128, default 4): 4   # 预设就是4号，所以也能enter即可！
First sector (34-83886046, default = 65026048 ) or {+-}size{KMGTP}: 65026048   # 也能enter 
Last sector (65026048-83886046, default = 83886046 ) or {+-}size{KMGTP}: +1G  # 决不要enter 
## 不需要自己去计算磁区号码，透过+容量的这个方式，
## 就可以让gdisk 主动去算出最接近需要的容量的磁区号码！

Current type is ' Linux filesystem '
Hex code or GUID (L to show codes, Enter = 8300 ): # 使用预设值即可～直接enter下去！
## 这里在选择未来这个分割预计使用的档案系统！预设都是Linux档案系统的8300！

Command (? for help): p
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048            6143   2.0 MiB     EF02
   2            6144         2103295   1024.0 MiB  0700
   3         2103296        65026047   30.0 GiB    8E00
   4        65026048        67123199   1024.0 MiB  8300  Linux filesystem
```
重点在『 Last sector 』那一行，那行绝对不要使用预设值！因为预设值会将所有的容量用光！因此它预设选择最大的磁区号码！因为仅要1GB 而已，所以得要加上+1G ！不需要计算sector 的数量，gdisk 会根据填写的数值， 直接计算出最接近该容量的磁区数！每次新增完毕后，请立即『 p 』查看一下结果！继续处理后续的两个分割！最终出现的画面会有点像底下这样！

```bash
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048            6143   2.0 MiB     EF02
   2            6144         2103295   1024.0 MiB  0700
   3         2103296        65026047   30.0 GiB    8E00
   4        65026048        67123199   1024.0 MiB  8300  Linux filesystem
   5        67123200        69220351   1024.0 MiB  0700  Microsoft basic data
   6        69220352        70244351   500.0 MiB   8200  Linux swap
```
基本上，几乎都用预设值，然后透过+1G, +500M 来建置所需要的另外两个分割！一般来说， Linux 大概都是8200/8300/8e00 等三种格式， Windows 几乎都用0700 ，如果忘记这些数字，可以在gdisk 内按下：『 L 』来显示！如果一切的分割状态都正常的话，那么就直接写入磁碟分割表！
```bash
Command (? for help): w

Final checks complete. About to write GPT data. THIS WILL OVERWRITE EXISTING
PARTITIONS!!

Do you want to proceed? (Y/N): y
OK; writing new GUID partition table (GPT) to /dev/sda.
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot.
The operation has completed successfully.
## gdisk 会先警告可能的问题，确定分割是对的，这时才按下y ！不过怎么还有警告？
## 这是因为这颗磁碟目前正在使用当中，因此系统无法立即载入新的分割表～

[root@study ~]# cat /proc/partitions
major minor  #blocks  name

   8        0   41943040 sda
   8        1       2048 sda1
   8        2    1048576 sda2
   8        3   31461376 sda3
  11        0    1048575 sr0
 253        0   10485760 dm-0
 253        1    1048576 dm-1
 253        2    5242880 dm-2
## 可以发现，并没有sda4, sda5, sda6 ！因为核心还没有更新！
```
因为Linux 此时还在使用这颗磁碟，为了担心系统出问题，所以分割表并没有被更新！这个时候有两个方式可以来处理！其中一个是重启！另外一个则是透过partprobe 这个指令来处理！

#### partprobe 更新Linux 核心的分割表资讯
格式： `partprobe [-s]`
```bash
[root@study ~]# partprobe -s     # 加上-s 可以在屏幕上显示信息
/dev/sda: gpt partitions 1 2 3 4 5 6

[root@study ~]# lsblk /dev/sda   # 实际的磁碟分割状态
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   40G  0 disk
├─sda1            8:1    0    2M  0 part
├─sda2            8:2    0    1G  0 part /boot
├─sda3            8:3    0   30G  0 part
│ ├─centos-root 253:0    0   10G  0 lvm  /
│ ├─centos-swap 253:1    0    1G  0 lvm  [SWAP]
│ └─centos-home 253:2    0    5G  0 lvm  /home
├─sda4            8:4    0    1G  0 part
├─sda5            8:5    0    1G  0 part
└─sda6            8:6    0  500M  0 part

[root@study ~]# cat /proc/partitions   # 核心的分割纪录
major minor  #blocks  name

   8        0   41943040 sda
   8        1       2048 sda1
   8        2    1048576 sda2
   8        3   31461376 sda3
   8        4    1048576 sda4
   8        5    1048576 sda5
   8        6     512000 sda6
  11        0    1048575 sr0
 253        0   10485760 dm-0
 253        1    1048576 dm-1
 253        2    5242880 dm-2
## 现在核心也正确的抓到了分割参数了！
```

#### 用gdisk 删除一个分割
```bash
[root@study ~]# gdisk /dev/vda 
Command (? for help): p
Number  Start (sector)    End (sector)  Size       Code  Name
1            2048            6143   2.0 MiB     EF02
2            6144         2103295   1024.0 MiB  0700
3         2103296        65026047   30.0 GiB    8E00
4        65026048        67123199   1024.0 MiB  8300  Linux filesystem
5        67123200        69220351   1024.0 MiB  0700  Microsoft basic data
6        69220352        70244351   500.0 MiB   8200  Linux swap

Command (? for help): d 
Partition number (1-6): 6

Command (? for help): p 
## /dev/sda6不见了！没问题就写入吧！

Command (? for help): w 
## 同样会有一堆讯息！选择y来处理！

[root@study ~]# lsblk 
## 还是有/dev/sda6，因为还没有更新核心的分割表！

[root@study ~]# partprobe -s 
[root@study ~]# lsblk 
## 这个时候，那个/dev/sda6才真的消失不见了！
```

#### fdisk
虽然MBR 分割表在未来应该会慢慢的被淘汰，毕竟现在磁碟容量随便都大于2T 以上了。而对于在CentOS 7.x 中还无法完整支援GPT 的fdisk 来说， 这家伙真的英雄无用武之地了啦！不过依旧有些旧的系统，以及虚拟机器的使用上面，还是有小磁碟存在的空间！这时处理MBR 分割表， 就得要使用fdisk ！

因为fdisk 跟gdisk 使用的方式几乎一样！只是一个使用? 作为指令提示资料，一个使用m 作为提示这样而已。此外，fdisk 有时会使用磁柱(cylinder) 作为分割的最小单位，与gdisk 预设使用sector 不太一样！大致上只是这点差别！另外， MBR 分割是有限制的(Primary, Extended, Logical...)！因为没有MBR 分割表，这里仅列出相关的指令对照参考。

```bash
[root@study ~]# fdisk /dev/sda
WARNING: fdisk GPT support is currently new, and therefore in an experimental phase. Use at your own discretion.
欢迎使用 fdisk (util-linux 2.23.2)。

更改将停留在内存中，直到您决定将更改写入磁盘。
使用写入命令前请三思。

命令(输入 m 获取帮助)：m
命令操作
   d   delete a partition
   g   create a new empty GPT partition table
   G   create an IRIX (SGI) partition table
   l   list known partition types
   m   print this menu
   n   add a new partition
   o   create a new empty DOS partition table
   q   quit without saving changes
   s   create a new empty Sun disklabel
   w   write table to disk and exit
```

### 磁碟格式化(建立档案系统)
分割完毕后自然就是要进行档案系统的格式化！格式化的指令非常的简单，那就是『make filesystem, mkfs』 这个指令！这个指令其实是个综合的指令，它会去呼叫正确的档案系统格式化工具软体！因为CentOS 7 使用xfs 作为预设档案系统， 底下会先介绍mkfs.xfs ，之后介绍新一代的EXT 家族成员mkfs.ext4，最后再聊一聊mkfs 这个综合指令！

#### XFS 档案系统mkfs.xfs
『格式化』其实应该称为『建置档案系统(make filesystem)』！所以使用的指令是mkfs ！要建立xfs 档案系统， 需要使用mkfs.xfs 这个指令。这个指令是这样使用的：
格式： `mkfs.xfs [-b bsize] [-d parms] [-i parms] [-l parms] [-L label] [-f] [-r parms] 装置名称`
选项与参数：
关于单位：底下只要谈到『数值』时，没有加单位则为bytes 值，可以用k,m,g,t,p (小写)等来解释，比较特殊的是s 这个单位，它指的是sector 的『个数』！
- -b ：后面接的是block 容量，可由512 到64k，不过最大容量限制为Linux 的4k ！
- -d ：后面接的是重要的data section 的相关参数值，主要的值有：
    - agcount=数值：设定需要几个储存群组的意思(AG)，通常与CPU 有关
    - agsize=数值：每个AG 设定为多少容量的意思，通常agcount/agsize 只选一个设定即可
    - file ：指的是『格式化的装置是个档案而不是个装置』的意思！(例如虚拟磁碟)
    - size=数值：data section 的容量，也就可以不将全部的装置容量用完的意思
    - su=数值：当有RAID 时，那个stripe 数值的意思，与底下的sw 搭配使用
    - sw=数值：当有RAID 时，用于储存资料的磁碟数量(须扣除备份碟与备用碟)
    - sunit=数值：与su 相当，不过单位使用的是『几个sector(512bytes大小)』的意思
    - swidth=数值：就是su*sw 的数值，但是以『几个sector(512bytes大小)』来设定
- -f ：如果装置内已经有档案系统，则需要使用这个-f 来强制格式化才行！
- -i ：与inode 有较相关的设定，主要的设定值有：
    - size=数值：最小是256bytes 最大是2k，一般保留256 就足够使用了！
    - internal=[0|1]：log 装置是否为内置？预设为1 内置，如果要用外部装置，使用底下设定
    - logdev=device ：log 装置为后面接的那个装置上头的意思，需设定internal=0 才可！
    - size=数值：指定这块登录区的容量，通常最小得要有512 个block，大约2M 以上才行！
- -L ：后面接这个档案系统的标头名称Label name 的意思！
- -r ：指定realtime section 的相关设定值，常见的有：
    - extsize=数值：就是那个重要的extent 数值，一般不须设定，但有RAID 时，最好设定与swidth 的数值相同较佳！最小为4K 最大为1G 。
    
```bash
## 范例：将前一小节分割出来的/dev/sda4格式化为xfs档案系统 
[root@study ~]# mkfs.xfs /dev/sda4
meta-data=/dev/sda4              isize=512    agcount=4, agsize=65536 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0, sparse=0
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
## 很快格是化完毕！都用预设值！较重要的是inode 与block 的数值

[root@study ~]# blkid /dev/sda4
/dev/sda4: UUID="4ce437e1-8091-4236-80f3-4d62cc47640c" TYPE="xfs" PARTLABEL="Linux filesystem" PARTUUID="de7a5281-1794-4884-a7f3-a27e66a298d5"
## 确定建置好xfs 档案系统了！
```
使用预设的xfs 档案系统参数来建置系统即可！速度非常快！如果我们有其他额外想要处理的项目，才需要加上一堆设定值！举例来说，因为xfs 可以使用多个资料流来读写系统，以增加速度，因此那个agcount 可以跟CPU 的核心数来做搭配！举例来说，如果服务器仅有一颗4 核心，但是有启动 Intel 超频功能，则系统会模拟出8 颗CPU 时，那个agcount 就可以设定为8 ！举个例子来瞧瞧：
```bash
## 范例：找出系统的CPU数，并据以设定agcount数值 
[root@study ~]# grep 'processor' /proc/cpuinfo
processor : 0
processor : 1
## 所以就是有两颗CPU 的意思，那就来设定设定xfs 档案系统格式化参数

[root@study ~]# mkfs.xfs -f -d agcount=2 /dev/sda4 
meta-data=/dev/sda4              isize=512    agcount=2, agsize=131072 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0, sparse=0
## .....(底下省略).....
## 可以跟前一个范例对照看看，可以发现agcount 变成2 了！
## 此外，因为已经格式化过一次，因此mkfs.xfs 可能会出现不给格式化的警告！因此需要使用-f
```

#### XFS 档案系统for RAID 效能优化(Optional)
档案系统的读写要能够有最佳化，最好能够搭配磁碟阵列的参数来设计，这样效能才能好起来！也就是说，可以先在档案系统就将stripe 规划好， 那交给RAID 去存取时，它就无须重复进行档案的stripe 过程，效能当然会更好！假设环境：
- 有两个线程的CPU 数量，所以agcount 最好指定为 2
- 当初设定RAID 的stripe 指定为256K 这么大，因此su 最好设定为256k
- 设定的磁碟阵列有8 颗，因为是RAID5 的设定，所以有一个parity (备份碟)，因此指定sw 为 7
- 由上述的资料中，可以发现资料宽度(swidth) 应该就是256K*7 得到1792K，可以指定extsize 为1792k

使用mkfs.xfs的参数来处理格式化的动作：
```bash
[root@study ~]# mkfs.xfs -f -d agcount=2,su=256k,sw=7 -r extsize=1792k /dev/sda4
meta-data=/dev/sda4              isize=512    agcount=2, agsize=131072 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0, sparse=0
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=64     swidth=448 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=1835008 blocks=0, rtextents=0
```

#### EXT4 档案系统mkfs.ext4
格式：`mkfs.ext4 [-b size] [-L label] 装置名称`  
选项与参数：
- -b ：设定block 的大小，有1K, 2K, 4K 的容量，
- -L ：后面接这个装置的标头名称。

```bash
## 范例：将/dev/sda5格式化为ext4档案系统 
[root@study ~]# mkfs.ext4 /dev/sda5
mke2fs 1.42.9 (28-Dec-2013)
Discarding device blocks: 完成
文件系统标签=
OS type: Linux
块大小=4096 (log=2)
分块大小=4096 (log=2)
Stride=0 blocks, Stripe width=0 blocks       # 跟RAID相关性较高 
65536 inodes, 262144 blocks
13107 blocks (5.00%) reserved for the super user
第一个数据块=0
Maximum filesystem blocks=268435456
8 block groups
32768 blocks per group, 32768 fragments per group
8192 inodes per group
Superblock backups stored on blocks:
	32768, 98304, 163840, 229376

Allocating group tables: 完成
正在写入inode表: 完成
Creating journal (8192 blocks): 完成
Writing superblocks and filesystem accounting information: 完成

[root@study ~]# dumpe2fs -h /dev/sda5
dumpe2fs 1.42.9 (28-Dec-2013)
Filesystem volume name:   <none>
Last mounted on:          <not available>
Filesystem UUID:          8ed3527a-cf44-4d0e-a46a-e035814957e9
## ...省略...
Journal backup:           inode blocks
Journal features:         (none)
日志大小:             32M
Journal length:           8192
Journal sequence:         0x00000001
Journal start:            0
```

因为ext4 的预设值已经相当适合使用，大部分的预设值在/etc/mke2fs.conf 这个档案中。因此，无须额外指定inode 的容量，系统都做好预设值设定。

#### 其他档案系统mkfs
mkfs 其实是个综合指令而已，当使用mkfs -t xfs 时，它就会跑去找mkfs.xfs 相关的参数！如果想要知道系统还支援哪种档案系统的格式化功能，直接按[tabl] 就很清楚了！
```bash
[root@study ~]# mkfs
mkfs         mkfs.btrfs   mkfs.cramfs  mkfs.ext2    mkfs.ext3    mkfs.ext4    mkfs.minix   mkfs.xfs
```
所以系统还有支援ext2/ext3 等等多种常用的档案系统！那如果要将刚刚的/dev/sda5 重新格式化为btrfs 档案系统呢？
```bash
[root@study ~]# mkfs -t btrfs -f /dev/sda5
[root@study ~]# blkid /dev/sda5
/dev/sda5: UUID="23399c00-1ea1-47b7-8e97-822e55f2fbf7" UUID_SUB="bd1b20be-7f81-4996-aadf-b32b84ad83e9" TYPE="btrfs" PARTLABEL="Microsoft basic data" PARTUUID="3efade3d-7132-4fc5-adff-b4de2152e7f7"

[root@study ~]# mkfs.ext4 /dev/sda5
[root@study ~]# blkid /dev/sda4 /dev/sda5
## /dev/sda4 是xfs 档案系统，而/dev/sda5 是ext4 档案系统
/dev/sda4: UUID="2aae198b-c64e-40a7-98ef-935cb0188e3f" TYPE="xfs" PARTLABEL="Linux filesystem" PARTUUID="de7a5281-1794-4884-a7f3-a27e66a298d5"
/dev/sda5: UUID="a87fcbb2-9be9-4293-9aa8-7517f69c7778" TYPE="ext4" PARTLABEL="Microsoft basic data" PARTUUID="3efade3d-7132-4fc5-adff-b4de2152e7f7"
```

### 档案系统检验
由于系统在运作时谁也说不准啥时硬体或者是电源会有问题，所以『当机』可能是难免的情况(不管是硬体还是软体)。档案系统运作时会有磁碟与记忆体资料非同步的状况发生，因此莫名其妙的当机非常可能导致档案系统的错乱。不同的档案系统救援的指令不太一样，下面主要针对xfs 及ext4 这两个主流来说明。

#### xfs_repair 处理XFS 档案系统
当xfs 档案系统错乱才需要使用这个指令
格式：`xfs_repair [-fnd] 装置名称`
选项与参数：
- -f ：后面的装置其实是个档案而不是实体装置
- -n ：单纯检查并不修改档案系统的任何资料(检查而已)
- -d ：通常用在单人维护模式底下，针对根目录(/) 进行检查与修复的动作！很危险！不要随便使用

```bash
## 范例：检查一下刚刚建立的/dev/sda4档案系统 
[root@study ~]# xfs_repair /dev/sda4
Phase 1 - find and verify superblock...
Phase 2 - using internal log
        - zero log...
        - scan filesystem freespace and inode maps...
        - found root inode chunk
Phase 3 - for each AG...
        - scan and clear agi unlinked lists...
        - process known inodes and perform inode discovery...
        - agno = 0
        - agno = 1
        - process newly discovered inodes...
Phase 4 - check for duplicate blocks...
        - setting up duplicate extent list...
        - check for inodes claiming duplicate blocks...
        - agno = 0
        - agno = 1
Phase 5 - rebuild AG headers and trees...
        - reset superblock...
Phase 6 - check inode connectivity...
        - resetting contents of realtime bitmap and summary inodes
        - traversing filesystem ...
        - traversal finished ...
        - moving disconnected inodes to lost+found ...
Phase 7 - verify and correct link counts...
done
## 共有7 个重要的检查流程！详细的流程介绍可以man xfs_repair ！

## 范例：检查一下系统原本就有的/dev/centos/home档案系统 
[root@study ~]# xfs_repair /dev/centos/home
xfs_repair: /dev/centos/home contains a mounted filesystem
xfs_repair: /dev/centos/home contains a mounted and writable filesystem

fatal error -- couldn't initialize XFS library
```

xfs_repair 可以检查/修复档案系统，不过，因为修复档案系统是个很庞大的任务！因此，修复时该档案系统不能被挂载！所以，检查与修复/dev/sda4 没啥问题，但是修复/dev/centos/home 这个已经挂载的档案系统时，就出现上述的问题了！没关系，若可以卸载，卸载后再处理即可。

Linux 系统有个装置无法被卸载，那就是根目录！如果根目录有问题怎办？这时得要进入单人维护或救援模式，然后透过-d 这个选项来处理！加入-d 这个选项后，系统会强制检验该装置，检验完毕后就会自动重新开机！

#### fsck.ext4 处理EXT4 档案系统
fsck 是个综合指令，如果是针对ext4 的话，建议直接使用fsck.ext4 来检测比较妥当！
格式：`fsck.ext4 [-pf] [-b superblock] 装置名称`
选项与参数：
- -p ：当档案系统在修复时，若有需要回覆y 的动作时，自动回覆y 来继续进行修复动作。
- -f ：强制检查！一般来说，如果fsck 没有发现任何unclean 的旗标，不会主动进入
      细部检查的，如果想要强制fsck 进入细部检查，就得加上-f选项
- -D ：针对档案系统下的目录进行最佳化配置。
- -b ：后面接superblock 的位置！一般来说这个选项用不到。但是如果的superblock 因故损毁时，
      透过这个参数即可利用档案系统内备份的superblock 来尝试救援。一般来说，superblock 备份在：
      1K block 放在8193, 2K block 放在16384, 4K block 放在32768

```bash
## 范例：找出刚刚建置的/dev/sda5的另一块superblock，并据以检测系统 
[root@study ~]# dumpe2fs -h /dev/sda5 | grep 'Blocks per group'
dumpe2fs 1.42.9 (28-Dec-2013)
Blocks per group:         32768
## 看起来每个block 群组会有32768 个block，因此第二个superblock 应该就在32768 上！
## 因为block 号码为0 号开始编的！

[root@study ~]# fsck.ext4 -b 32768 /dev/sda5
e2fsck 1.42.9 (28-Dec-2013)
/dev/sda5 was not cleanly unmounted, 强制检查.
第一步: 检查inode,块,和大小
第二步: 检查目录结构
第3步: 检查目录连接性
Pass 4: Checking reference counts
第5步: 检查簇概要信息

/dev/sda5: ***** 文件系统已修改 *****      #档案系统被改过，所以这里会有警告！
/dev/sda5: 11/65536 files (0.0% non-contiguous), 12955/262144 blocks
## 当档案系统出问题，它就会要你选择是否修复～如果修复如上所示，按下y 即可！
## 最终系统会告诉你，档案系统已经被更改过，要注意该项目的意思！

## 范例：已预设设定强制检查一次/dev/sda5 
[root@study ~]# fsck.ext4 /dev/sda5
e2fsck 1.42.9 (28-Dec-2013)
/dev/sda5: clean, 11/65536 files, 12955/262144 blocks
## 档案系统状态正常，它并不会进入强制检查！会告诉你档案系统没问题(clean)

## 强制检查加-f
[root@study ~]# fsck.ext4 -f /dev/sda5
e2fsck 1.42.9 (28-Dec-2013)
第一步: 检查inode,块,和大小
第二步: 检查目录结构
第3步: 检查目录连接性
Pass 4: Checking reference counts
第5步: 检查簇概要信息
/dev/sda5: 11/65536 files (0.0% non-contiguous), 12955/262144 blocks
```

无论是xfs_repair或fsck.ext4，这都是用来检查与修正档案系统错误的指令。注意：通常只有身为root且档案系统有问题的时候才使用这个指令，否则在正常状况下使用此一指令，可能会造成对系统的危害！通常使用这个指令的场合都是在系统出现极大的问题，导致在Linux开机的时候得进入单人单机模式下进行维护的行为时，才必须使用此一指令！

另外，如果怀疑刚刚格式化成功的磁碟有问题的时候，也可以使用xfs_repair/fsck.ext4来检查一磁碟！其实就有点像是Windows的scandisk！此外，由于xfs_repair/fsck.ext4在扫瞄磁碟的时候，可能会造成部分filesystem的修订，所以『执行xfs_repair/fsck.ext4时，被检查的partition务必不可挂载到系统上。』

### 档案系统挂载与卸载
在本章一开始时的挂载点的意义当中提过挂载点是目录，而这个目录是进入磁碟分割槽(其实是档案系统！)的入口。不过要进行挂载前，最好先确定几件事：
- 单一档案系统不应该被重复挂载在不同的挂载点(目录)中；
- 单一目录不应该重复挂载多个档案系统；
- 要作为挂载点的目录，理论上应该都是空目录才是。

尤其是上述的后两点！如果要用来挂载的目录里面并不是空的，那么挂载了档案系统之后，原目录下的东西就会暂时的消失。举个例子来说，假设/home原本与根目录(/)在同一个档案系统中，底下原本就有/home/test与/home/vbird两个目录。然后想要加入新的磁碟，并且直接挂载/home底下，那么当挂载上新的分割槽时，则/home目录显示的是新分割槽内的资料，至于原先的test与vbird这两个目录就会暂时的被隐藏掉了！并不是被覆盖掉，而是暂时的隐藏了起来，等到新分割槽被卸载之后，/home原本的内容就会再次的跑出来！

而要将档案系统挂载到Linux 系统上，就要使用mount 这个指令。

格式：
- mount -a 
- mount [-l] 
- mount [-t 档案系统] LABEL=''挂载点 
- mount [-t 档案系统] UUID=''挂载点  #建议用这种方式喔！
- mount [-t 档案系统] 装置档名挂载点

选项与参数：
- -a ：依照设定档/etc/fstab的资料将所有未挂载的磁碟都挂载上来
- -l ：单纯的输入mount 会显示目前挂载的资讯。加上-l 可增列Label 名称！
- -t ：可以加上档案系统种类来指定想要挂载的类型。常见的Linux 支援类型有：xfs, ext3, ext4,
      reiserfs, vfat, iso9660(光碟格式), nfs, cifs, smbfs (后三种为网路档案系统类型)
- -n ：在预设的情况下，系统会将实际挂载的情况即时写入/etc/mtab 中，以利其他程式的运作。
      但在某些情况下(例如单人维护模式)为了避免问题会刻意不写入。此时就得要使用-n 选项。
- -o ：后面可以接一些挂载时额外加上的参数！比方说帐号、密码、读写权限等：
    - async, sync: 此档案系统是否使用同步写入(sync) 或非同步(async) 的记忆体机制，请参考档案系统运作方式。预设为async。
    - atime,noatime: 是否修订档案的读取时间(atime)。为了效能，某些时刻可使用noatime
    - ro, rw: 挂载档案系统成为唯读(ro) 或可读写(rw)
    - auto, noauto: 允许此filesystem 被以mount -a 自动挂载(auto)
    - dev, nodev: 是否允许此filesystem 上，可建立装置档案？dev 为可允许
    - suid, nosuid: 是否允许此filesystem 含有suid/sgid 的档案格式？
    - exec, noexec: 是否允许此filesystem 上拥有可执行binary 档案？
    - user, nouser: 是否允许此filesystem 让任何使用者执行mount ？一般来说，mount 仅有root 可以进行，但下达user 参数，则可让一般user 也能够对此partition 进行mount 。
    - defaults: 预设值为：rw, suid, dev, exec, auto, nouser, and async
    - remount: 重新挂载，这在系统出错，或重新更新参数时，很有用！

基本上，CentOS 7 已经很聪明了，因此不需要加上-t 这个选项，系统会自动的分析最恰当的档案系统来尝试挂载需要的装置！这也是使用blkid 就能够显示正确的档案系统的缘故！那CentOS 是怎么找出档案系统类型的呢？由于档案系统几乎都有superblock ，Linux 可以透过分析superblock 搭配Linux 自己的驱动程式去测试挂载， 如果成功的套和了，就立刻自动的使用该类型的档案系统挂载起来！那么系统有没有指定哪些类型的filesystem 才需要进行上述的挂载测试呢？主要是参考底下这两个档案：
- /etc/filesystems：系统指定的测试挂载档案系统类型的优先顺序；
- /proc/filesystems：Linux系统已经载入的档案系统类型。

Linux 支援的档案系统之驱动程式都写在如下的目录中：
- /lib/modules/$(uname -r)/kernel/fs/

#### 挂载xfs/ext4 等档案系统
```bash
## 范例：找出/dev/sda4的UUID后，用该UUID来挂载档案系统到/data/xfs内 
[root@study ~]# blkid /dev/sda4 
/dev/sda4: UUID="2aae198b-c64e-40a7-98ef-935cb0188e3f" TYPE="xfs" PARTLABEL="Linux filesystem" PARTUUID="de7a5281-1794-4884-a7f3-a27e66a298d5"

[root@study ~]# mount UUID="2aae198b-c64e-40a7-98ef-935cb0188e3f" /data/xfs 
mount: 挂载点 /data/xfs 不存在   # 非正规目录！所以手动建立它！

[root@study ~]# mkdir -p /data/xfs 
[root@study ~]# mount UUID="2aae198b-c64e-40a7-98ef-935cb0188e3f" /data/xfs 
[root@study ~]# df /data/xfs
文件系统         1K-块  已用    可用 已用% 挂载点
/dev/sda4      1038336 32904 1005432    4% /data/xfs
## 顺利挂载，且容量约为1G左右没问题！

## 范例：使用相同的方式，将/dev/sda5挂载于/data/ext4 
[root@study ~]# blkid /dev/sda5
/dev/sda5: UUID="a87fcbb2-9be9-4293-9aa8-7517f69c7778" TYPE="ext4" PARTLABEL="Microsoft basic data" PARTUUID="3efade3d-7132-4fc5-adff-b4de2152e7f7"

[root@study ~]# mkdir /data/ext4 
[root@study ~]# mount UUID="a87fcbb2-9be9-4293-9aa8-7517f69c7778" /data/ext4 
[root@study ~]# df /data/ext4
文件系统        1K-块  已用   可用 已用% 挂载点
/dev/sda5      999320  2564 927944    1% /data/ext4
```

#### 重新挂载根目录与挂载不特定目录
整个目录树最重要的地方就是根目录了，所以根目录根本就不能够被卸载的！问题是，如果挂载参数要改变， 或者是根目录出现『只读』状态时，如何重新挂载呢？最可能的处理方式就是重新开机(reboot)！不过也可以这样做：
```bash
## 范例：将/重新挂载，并加入参数为rw与auto 
[root@study ~]# mount -o remount,rw,auto /
```
重点是那个『 -o remount,xx 』的选项与参数！请注意，要重新挂载(remount) 时， 这是个非常重要的机制！尤其是进入单人维护模式时，根目录常会被系统挂载为只读，这个时候这个指令就太重要了！

另外，也可以利用mount 来将某个目录挂载到另外一个目录去！这并不是挂载档案系统，而是额外挂载某个目录的方法！虽然底下的方法也可以使用symbolic link 来连结，不过在某些不支援符号连结的程式运作中，还是得要透过这样的方法才行。
```bash
## 范例：将/var这个目录暂时挂载到/data/var底下： 
[root@study ~]# mkdir /data/var 
[root@study ~]# mount --bind /var /data/var
[root@study ~]# ls -lid /var /data/var
101 drwxr-xr-x. 19 root root 267 1月   6 08:32 /data/var
101 drwxr-xr-x. 19 root root 267 1月   6 08:32 /var
## 内容完全一模一样！因为挂载目录的缘故！

[root@study ~]# mount | grep var
/dev/mapper/centos-root on /data/var type xfs (rw,relatime,seclabel,attr2,inode64,noquota)
```
透过这个mount --bind 的功能， 可以将某个目录挂载到其他目录去！而并不是整块filesystem 的！所以从此进入/data/var 就是进入/var 的意思！

## umount (将装置档案卸载)
格式：`mount [-fn] 装置档名或挂载点`
选项与参数：
- -f ：强制卸载！可用在类似网路档案系统(NFS) 无法读取到的情况下；
- -l ：立刻卸载档案系统，比-f 还强！
- -n ：不更新/etc/mtab 情况下卸载。

就是直接将已挂载的档案系统卸载！卸载之后，可以使用df 或mount 看看是否还存在目录树中。卸载的方式，可以下达装置档名或挂载点。

```bash
## 范例：将本章之前自行挂载的档案系统全部卸载： 
[root@study ~]# mount 
.....(前面省略)..... 
/dev/sda4 on /data/xfs type xfs (rw,relatime,seclabel,attr2,inode64,sunit=512,swidth=3584,noquota)
/dev/sda5 on /data/ext4 type ext4 (rw,relatime,seclabel,data=ordered)
/dev/mapper/centos-root on /data/var type xfs (rw,relatime,seclabel,attr2,inode64,noquota)
## 先找一下已经挂载的档案系统，如上所示，特殊字体即为刚刚挂载的装置！
## 基本上，卸载后面接装置或挂载点都可以！不过最后一个centos-root 由于有其他挂载，
## 因此，该项目一定要使用挂载点来卸载才行！

[root@study ~]# umount /dev/sda4       # 用装置档名来卸载 
[root@study ~]# umount /data/ext4      # 用挂载点来卸载 
[root@study ~]# umount /data/var       # 一定要用挂载点！因为装置有被其他方式挂载
```

### 磁碟/档案系统参数修订
某些时刻，你可能会希望修改一下目前档案系统的一些相关资讯，举例来说，你可能要修改Label name ， 或者是journal 的参数，或者是其他磁碟/档案系统运作时的相关参数(例如DMA 启动与否～)。这个时候，就得需要底下这些相关的指令功能啰～

【未完待续】