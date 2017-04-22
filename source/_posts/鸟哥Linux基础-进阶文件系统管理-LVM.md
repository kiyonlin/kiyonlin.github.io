---
title: 鸟哥Linux基础-进阶文件系统管理-LVM
tag:
  - Linux
  - LVM
category:
  - 技术
  - linux
date: 2017-04-21 10:02:09
updated: 2017-04-21 10:02:09
---
原文[鸟哥的 Linux私房菜](http://linux.kiyon.org/)  

# 什么是LVM
LVM 的全名是Logical Volume Manager，逻辑卷轴管理员。LVM 的作法是将几个物理的partitions (或disk) 通过软件组合成为一块看起来是独立的大磁盘(VG) ，然后将这块大磁盘再经过分割成为可使用分区(LV)，最终就能够挂载使用了。但是为什么这样的系统可以进行filesystem 的扩充或缩小呢？其实与一个称为PE 的项目有关。

## Physical Volume, PV, 物理卷轴
我们实际的partition (或Disk)需要调整系统识别码(system ID)成为8e (LVM的识别码)，然后再经过pvcreate的指令将它转成LVM最底层的物理卷轴(PV) ，之后才能够将这些PV加以利用！调整system ID的方是就是通过gdisk进行！

## Volume Group, VG, 卷轴群组
所谓的LVM 大磁盘就是将许多PV 整合成这个VG ！所以VG 就是LVM 组合起来的大磁盘！那么这个大磁盘最大可以到多少容量呢？这与底下要说明的PE 以及LVM 的格式版本有关。在预设的情况下， 使用32位的Linux 系统时，基本上LV 最大仅能支持到65534 个PE 而已，若使用预设的PE为4MB 的情况下， 最大容量则仅能达到约256GB 而已。不过，这个问题在64位的Linux 系统上面已经不存在了！LV 几乎没有啥容量限制！

## Physical Extent, PE, 物理范围区块
LVM预设使用4MB的PE区块，而LVM的LV在32位系统上最多仅能含有65534个PE (lvm1的格式)，因此预设的LVM的LV会有4M*65534/(1024M/G )=256G。PE是整个LVM最小的储存区块，也就是说，其实我们的文件资料都是藉由写入PE来处理的。简单的说，这个PE就有点像文件系统里面的block大小。所以调整PE会影响到LVM的最大容量！不过，在CentOS 6.x以后，由于直接使用lvm2的各项格式功能，以及系统转为64位，因此这个限制已经不存在了。

## Logical Volume, LV, 逻辑卷轴
最终的VG还会被切成LV，这个LV就是最后可以被格式化使用的类似分区的东西！那么LV是否可以随意指定大小呢？当然不可以！既然PE是整个LVM的最小储存单位，那么LV的大小就与在此LV内的PE总数有关。为了方便使用者利用LVM来管理其系统，因此LV的设备档名通常指定为『 /dev/vgname/lvname』的样式！

此外，我们刚刚有谈到LVM 可弹性的变更filesystem 的容量，那是如何办到的？其实就是通过『交换PE 』来进行资料转换， 将原本LV 内的PE 移转到其他设备中以降低LV 容量，或将其他设备的PE 加到此LV 中以加大容量！

# LVM 操作流程

## 0. Disk 阶段(实际的磁盘)
```bash
[root@study ~]# gdisk -l /dev/vda
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048            6143   2.0 MiB     EF02
   2            6144         2103295   1024.0 MiB  0700
   3         2103296        65026047   30.0 GiB    8E00
   4        65026048        67123199   1024.0 MiB  8300  Linux filesystem
   5        75511808        77608959   1024.0 MiB  8E00  Linux LVM
   6        69220352        71317503   1024.0 MiB  8E00  Linux LVM
   7        71317504        73414655   1024.0 MiB  8E00  Linux LVM
   8        73414656        75511807   1024.0 MiB  8E00  Linux LVM
   9        77608960        79706111   1024.0 MiB  8E00  Linux LVM
# 其实system ID不改变也没关系！只是为了让我们管理员清楚知道该partition的内容，
# 所以这里建议还是修改成正确的磁盘内容较好！
```

上面的/dev/sda{5,6,7,8} 这4 个分区就是我们的物理分区！也就是底下会实际用到的信息！至于/dev/sda9 则先保留下来不使用。注意看，那个8e 的出现会导致system 变成『 Linux LVM 』！其实没有设定成为8e 也没关系， 不过某些LVM 的侦测指令可能会侦测不到该partition。

## 1. PV 阶段
要建立PV 其实很简单，只要直接使用pvcreate 即可！
- pvcreate ：将物理partition 建立成为PV ；
- pvscan ：搜寻目前系统里面任何具有PV 的磁盘；
- pvdisplay ：显示出目前系统上面的PV 状态；
- pvremove ：将PV 属性移除，让该partition 不具有PV 属性。

```bash

# 1.检查有无PV在系统上，然后将/dev/sda{5-8}建立成为PV格式 
[root@study ~]# pvscan
  PV /dev/sda3   VG centos          lvm2 [30.00 GiB / 14.00 GiB free]
    Total: 1 [30.00 GiB] / in use: 1 [30.00 GiB] / in no VG: 0 [0   ]
# 其实安装的时候，我们就有使用LVM 了喔！所以会有/dev/vda3 存在的！

[root@study ~]# pvcreate /dev/sda{5,6,7,8}
  Physical volume "/dev/sda5" successfully created.
  Physical volume "/dev/sda6" successfully created.
  Physical volume "/dev/sda7" successfully created.
  Physical volume "/dev/sda8" successfully created.
# 这个指令可以一口气建立这四个partition 成为PV ！注意大括号的用途

[root@study ~]# pvscan
  PV /dev/sda3   VG centos          lvm2 [30.00 GiB / 14.00 GiB free]
  PV /dev/sda7                      lvm2 [1.00 GiB]
  PV /dev/sda8                      lvm2 [1.00 GiB]
  PV /dev/sda6                      lvm2 [1.00 GiB]
  PV /dev/sda5                      lvm2 [1.00 GiB]
  Total: 5 [34.00 GiB] / in use: 1 [30.00 GiB] / in no VG: 4 [4.00 GiB]
# 这就分别显示每个PV 的信息与系统所有PV 的信息。尤其最后一行，显示的是：
# 整体PV 的量 / 已经被使用到VG 的PV 量 / 剩余的PV 量

# 2.更详细的列示出系统上面每个PV的个别信息： 
[root@study ~]# pvdisplay /dev/sda5
  "/dev/sda5" is a new physical volume of "1.00 GiB"
  --- NEW Physical volume ---
  PV Name               /dev/sda5
  VG Name
  PV Size               1.00 GiB
  Allocatable           NO
  PE Size               0
  Total PE              0
  Free PE               0
  Allocated PE          0
  PV UUID               hiIqyY-CcAj-qImn-6MWn-07Ed-XJgf-3wzMul
# 由于PE 是在建立VG 时才给予的参数，因此在这里看到的PV 里头的PE 都会是 0
# 而且也没有多余的PE 可供分配(allocatable)。
```

## 2. VG 阶段
- vgcreate ：建立VG 的指令。
- vgscan ：搜寻系统上面是否有VG 存在；
- vgdisplay ：显示目前系统上面的VG 状态；
- vgextend ：在VG 内增加额外的PV ；
- vgreduce ：在VG 内移除PV；
- vgchange ：设定VG 是否启动(active)；
- vgremove ：删除一个VG。

与PV 不同的是， VG 的名称是自定义的！我们知道PV 的名称其实就是partition 的设备文件名， 但是这个VG 名称则可以随便自己取。建立这个 VG 的流程是这样的：
```bash
# vgcreate [-s N[mgt]] VG名称PV名称
# 选项与参数：
# -s ：后面接PE 的大小(size) ，单位可以是m, g, t (大小写均可)

# 1.将/dev/sda5-7建立成为一个VG，且指定PE为16MB！
[root@study ~]# vgcreate -s 16M kiyonvg /dev/sda{5,6,7}
  Volume group "kiyonvg" successfully created

[root@study ~]# vgscan
  Reading volume groups from cache.
  Found volume group "kiyonvg" using metadata type lvm2
  Found volume group "centos" using metadata type lvm2

[root@study ~]# pvscan 
  PV /dev/sda5   VG kiyonvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sda6   VG kiyonvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sda7   VG kiyonvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sda3   VG centos          lvm2 [30.00 GiB / 14.00 GiB free]
  PV /dev/sda8                      lvm2 [1.00 GiB]
  Total: 5 [33.95 GiB] / in use: 4 [32.95 GiB] / in no VG: 1 [1.00 GiB]
# 有三个PV 被用去，剩下1 个/dev/sda8 的PV 没被用掉！

[root@study ~]# vgdisplay kiyonvg
  --- Volume group ---
  VG Name               kiyonvg
  System ID
  Format                lvm2
  Metadata Areas        3
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                0
  Open LV               0
  Max PV                0
  Cur PV                3
  Act PV                3
  VG Size               2.95 GiB
  PE Size               16.00 MiB
  Total PE              189
  Alloc PE / Size       0 / 0
  Free  PE / Size       189 / 2.95 GiB
  VG UUID               cBoibr-y9mY-90Cl-SRSr-1DAY-lLAZ-Ecbl4u
# 最后那三行指的就是PE 能够使用的情况！由于尚未切出LV，因此所有的PE 均可自由使用。
```

这样就建立一个VG 了！假设我们要增加这个VG 的容量，因为我们还有/dev/sda8 ！此时可以这样做：
```bash
# 2.将剩余的PV (/dev/sda8)丢给kiyonvg
[root@study ~]# vgextend kiyonvg /dev/sda8
  Volume group "kiyonvg" successfully extended

[root@study ~]# vgdisplay kiyonvg 
# ....(前面省略)....
  VG Size               3.94 GiB
  PE Size               16.00 MiB
  Total PE              252
  Alloc PE / Size       0 / 0
  Free  PE / Size       252 / 3.94 GiB
  VG UUID               cBoibr-y9mY-90Cl-SRSr-1DAY-lLAZ-Ecbl4u
```

## 3. LV 阶段
创造出VG 这个大磁盘之后，再来就是要建立分割区啦！这个分割区就是所谓的LV ！假设我要将刚刚那个 kiyonvg 磁盘，分割成为kiyonlv ，整个VG 的容量都被分配到kiyonlv 里面去。
- lvcreate ：建立LV！
- lvscan ：查询系统上面的LV ；
- lvdisplay ：显示系统上面的LV 状态！
- lvextend ：在LV 里面增加容量！
- lvreduce ：在LV 里面减少容量；
- lvremove ：删除一个LV ！
- lvresize ：对LV 进行容量大小的调整！

命令详解：
`lvcreate [-LN[mgt]] [-n LV名称] VG名称`
`lvcreate [-l N] [-n LV名称] VG名称`
选项与参数：
- -L ：后面接容量，容量的单位可以是M,G,T 等，要注意的是，最小单位为PE，
      因此这个数量必须要是PE 的倍数，若不相符，系统会自行计算最相近的容量。
- -l ：后面可以接PE 的『个数』，而不是数量。若要这么做，得要自行计算PE 数。
- -n ：后面接的就是LV 的名称！

```bash
# 1.将kiyonvg分2GB给kiyonlv！
[root@study ~]# lvcreate -L 2G -n kiyonlv kiyonvg
  Logical volume "kiyonlv" created
# 由于本案例中每个PE 为16M ，如果要用PE 的数量来处理的话，那使用下面的指令也OK！
# lvcreate -l 128 -n kiyonlv kiyonvg

[root@study ~]# lvscan 
  ACTIVE            '/dev/kiyonvg/kiyonlv' [2.00 GiB] inherit
  ACTIVE            '/dev/centos/root'     [10.00 GiB] inherit
  ACTIVE            '/dev/centos/home'     [5.00 GiB] inherit
  ACTIVE            '/dev/centos/swap'     [1.00 GiB] inherit

[root@study ~]# lvdisplay /dev/kiyonvg/kiyonlv
  --- Logical volume ---
  LV Path                /dev/kiyonvg/kiyonlv
  LV Name                kiyonlv
  VG Name                kiyonvg
  LV UUID                1t1324-TfsC-bx5M-P9Ee-MeMK-Cjs3-m94yH2
  LV Write Access        read/write
  LV Creation host, time study.centos.kiyon, 2017-04-21 14:18:30 +0800
  LV Status              available
  # open                 0
  LV Size                2.00 GiB
  Current LE             128
  Segments               3
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:3
```

如此一来，整个LV partition也准备好了！接下来，就是针对这个LV来处理！要特别注意的是， VG的名称为kiyonvg ，但是LV的名称必须使用全名/dev/kiyonvg/kiyonlv才对！后续的处理都是这样的！

## 文件系统阶段
```bash
# 1.格式化、挂载与观察我们的LV吧！
[root@study ~]# mkfs.xfs /dev/kiyonvg/kiyonlv  #<==注意LV全名！
meta-data=/dev/kiyonvg/kiyonlv   isize=512    agcount=4, agsize=131072 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0, sparse=0
data     =                       bsize=4096   blocks=524288, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0

[root@study ~]# mkdir /srv/lvm 
[root@study ~]# mount /dev/kiyonvg/kiyonlv /srv/lvm 
[root@study ~]# df -Th /srv/lvm
Filesystem                  Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonlv xfs   2.0G   33M  2.0G   2% /srv/lvm

[root@study ~]# cp -a /etc /var/log /srv/lvm 
[root@study ~]# df -Th /srv/lvm
Filesystem                  Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonlv xfs   2.0G   74M  2.0G   4% /srv/lvm
```

## 放大LV 容量
1. VG阶段需要有剩余的容量：因为需要放大文件系统，所以需要放大LV，但是若没有多的VG容量，那么更上层的LV与文件系统就无法放大的。因此要用尽各种方法来产生多的VG容量才行。一般来说，如果VG容量不足，最简单的方法就是再加硬盘！然后将该硬盘使用上面讲过的pvcreate及vgextend增加到该VG内即可！

2. LV阶段产生更多的可用容量：如果VG的剩余容量足够了，此时就可以利用lvresize这个指令来将剩余容量加入到所需要增加的LV设备内！过程相当简单！

3. 文件系统阶段的放大：我们的Linux实际使用的其实不是LV啊！而是LV这个设备内的文件系统！所以一切最终还是要以文件系统为依归！目前在Linux环境下，可以放大的文件系统有XFS以及EXT家族！至于缩小仅有EXT家族，目前XFS文件系统并不支持文件系统的容量缩小！要注意！要注意！XFS放大文件系统通过简单的xfs_growfs指令即可！

针对/srv/lvm 再增加500M 的容量
```bash
# 1.由前面的过程我们知道/srv/lvm是/dev/kiyonvg/kiyonlv这个设备，所以检查kiyonvg吧！
[root@study ~]# vgdisplay kiyonvg
  --- Volume group ---
  VG Name               kiyonvg
  System ID
  Format                lvm2
  Metadata Areas        4
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                1
  Open LV               1
  Max PV                0
  Cur PV                4
  Act PV                4
  VG Size               3.94 GiB
  PE Size               16.00 MiB
  Total PE              252
  Alloc PE / Size       128 / 2.00 GiB
  Free  PE / Size       124 / 1.94 GiB
  VG UUID               cBoibr-y9mY-90Cl-SRSr-1DAY-lLAZ-Ecbl4u
# 既然VG 的容量够大了！所以直接来放大LV 吧！！

# 2.放大LV吧！利用lvresize的功能来增加！
[root@study ~]# lvresize -L +500M /dev/kiyonvg/kiyonlv
  Rounding size to boundary between physical extents: 512.00 MiB.
  Size of logical volume kiyonvg/kiyonlv changed from 2.00 GiB (128 extents) to 2.50 GiB (160 extents).
  Logical volume kiyonvg/kiyonlv successfully resized.
# 这样就增加了LV 了！lvresize 的语法很简单，基本上同样通过-l 或-L 来增加！

[root@study ~]# lvscan 
  ACTIVE            '/dev/kiyonvg/kiyonlv' [2.50 GiB] inherit
  ACTIVE            '/dev/centos/root' [10.00 GiB] inherit
  ACTIVE            '/dev/centos/home' [5.00 GiB] inherit
  ACTIVE            '/dev/centos/swap' [1.00 GiB] inherit
# 可以发现/dev/kiyonvg/kiyonlv 容量由2G 增加到2.5G ！

[root@study ~]# df -Th /srv/lvm
Filesystem                  Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonlv xfs   2.0G   74M  2.0G   4% /srv/lvm
```
最终的结果中LV 真的有放大到2.5GB ！但是文件系统却没有相对增加！我们的LVM 可以线上直接处理，并不需要特别umount ！使用xfs_growfs 来处理一下！

```bash
# 3.1先看一下原本的文件系统内的superblock记录情况吧！
[root@study ~]# xfs_info /srv/lvm 
meta-data=/dev/mapper/kiyonvg-kiyonlv isize=512    agcount=4, agsize=131072 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=524288, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0

[root@study ~]# xfs_growfs /srv/lvm   #这一步骤才是最重要的！
[root@study ~]# xfs_info /srv/lvm 
meta-data=/dev/mapper/kiyonvg-kiyonlv isize=512    agcount=5, agsize=131072 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=655360, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0

[root@study ~]# df -Th /srv/lvm
Filesystem                  Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonlv xfs   2.5G   74M  2.5G   3% /srv/lvm

[root@study ~]# ls -l /srv/lvm
total 16
drwxr-xr-x. 78 root root 8192 Apr 21 11:17 etc
drwxr-xr-x.  8 root root 4096 Apr 19 14:40 log
# 刚刚复制进去的资料可还是存在的！并没有消失不见！
```

在上表中，注意看两次xfs_info 的结果，你会发现到1)整个block group (agcount) 的数量增加一个！那个block group 就是纪录新的设备容量之文件系统所在！而你也会2)发现整体的block 数量增加了！这样整个文件系统就给他放大了！同时，使用df 去查阅时，就真的看到增加的量了！文件系统的放大可以在On-line 的环境下操作。

目前的XFS 文件系统中，并没有缩小文件系统容量的设计！也就是说，文件系统只能放大不能缩小喔！如果你想要保有放大、缩小的本事， 那还请回去使用EXT 家族最新的EXT4 文件系统啰！XFS 目前是办不到的！

# 使用LVM thin Volume 让LVM 动态自动调整磁盘使用率
LVM thin Volume 的概念是：先建立一个可以实支实付、用多少容量才分配实际写入多少容量的磁盘容量储存池(thin pool)， 然后再由这个thin pool 去产生一个『指定要固定容量大小的LV 设备』，这个LV 就有趣了！虽然你会看到『表面上，它的容量可能有10GB ，但实际上， 该设备用到多少容量时，才会从thin pool 去实际取得所需要的容量』！可能thin pool 仅有1GB 的容量， 但是可以分配给一个10GB 的LV 设备！而该设备实际使用到500M 时，整个thin pool 才分配500M 给该LV ！当然啦！在所有由thin pool 所分配出来的LV 设备中，总实际使用量绝不能超过thin pool 的最大实际容量！如这个案例说的， thin pool 仅有1GB， 那所有的由这个thin pool 建置出来的LV 设备内的实际用量，就绝不能超过1GB ！

实际操作：
- 由kiyonvg 的剩余容量取出1GB 来做出一个名为kiyontpool 的thin pool LV 设备，这就是所谓的磁盘容量储存池(thin pool)
- 由kiyonvg 内的kiyontpool 产生一个名为kiyonthin 的10GB LV 设备
- 将此设备实际格式化为xfs 文件系统，并且挂载于/srv/thin 目录内！

```bash
# 1.先以lvcreate来建立kiyontpool这个thin pool设备： 
[root@study ~]# lvcreate -L 1G -T kiyonvg/kiyontpool   #最重要的建置指令 
  Using default stripesize 64.00 KiB.
  Logical volume "kiyontpool" created.
[root@study ~]# lvdisplay /dev/kiyonvg/kiyontpool
  --- Logical volume ---
  LV Name                kiyontpool
  VG Name                kiyonvg
  LV UUID                dGEm2n-ARFT-OjI4-7Q85-bIp1-unqJ-X98pRu
  LV Write Access        read/write
  LV Creation host, time study.centos.kiyon, 2017-04-21 15:02:50 +0800
  LV Pool metadata       kiyontpool_tmeta
  LV Pool data           kiyontpool_tdata
  LV Status              available
  # open                 0
  LV Size                1.00 GiB       # 总共可分配出去的容量 
  Allocated pool data    0.00%          # 已分配的容量百分比 
  Allocated metadata     0.24%          # 已分配的中介资料百分比
  Current LE             64
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:6
# 非常有趣吧！竟然在LV 设备中还可以有再分配(Allocated) 的项目！果然是储存池！

[root@study ~]# lvs kiyonvg   #语法为lvs VGname 
  LV         VG      Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  kiyonlv    kiyonvg -wi-ao---- 2.50g
  kiyontpool kiyonvg twi-a-tz-- 1.00g             0.00   0.24
#这个lvs指令的输出更加简单明了！直接看比较清晰！

# 2.开始建立kiyonthin这个有10GB的设备，注意！必须使用--thin与kiyontpool连结！
[root@study ~]# lvcreate -V 10G -T kiyonvg/kiyontpool -n kiyonthin
  Using default stripesize 64.00 KiB.
  WARNING: Sum of all thin volume sizes (10.00 GiB) exceeds the size of thin pool kiyonvg/kiyontpool and the size of whole volume group (3.94 GiB)!
  For thin pool auto extension activation/thin_pool_autoextend_threshold should be below 100.
  Logical volume "kiyonthin" created.
  
[root@study ~]# lvs kiyonvg
  LV         VG      Attr       LSize  Pool       Origin Data%  Meta%  Move Log Cpy%Sync Convert
  kiyonlv    kiyonvg -wi-ao----  2.50g
  kiyonthin  kiyonvg Vwi-a-tz-- 10.00g kiyontpool        0.00
  kiyontpool kiyonvg twi-aotz--  1.00g                   0.00   0.27
# 很有趣吧！明明连kiyonvg 这个VG 都没有足够大到10GB 的容量，通过thin pool
# 竟然就产生了10GB 的kiyonthin 这个设备！

# 3.开始建立文件系统 
[root@study ~]# mkfs.xfs /dev/kiyonvg/kiyonthin 
[root@study ~]# mkdir /srv/thin 
[root@study ~]# mount /dev/kiyonvg/kiyonthin /srv/thin 
[root@study ~]# df -Th /srv/thin
Filesystem                    Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonthin xfs    10G   33M   10G   1% /srv/thin
# 真的有10GB！！

# 4.测试一下容量的使用！建立500MB的文件，但不可超过1GB的测试为宜！
[root@study ~]# dd if=/dev/zero of=/srv/thin/test.img bs=1M count=500 
[root@study ~]# lvs kiyonvg
  LV         VG      Attr       LSize  Pool       Origin Data%  Meta%  Move Log Cpy%Sync Convert
  kiyonlv    kiyonvg -wi-ao----  2.50g
  kiyonthin  kiyonvg Vwi-aotz-- 10.00g kiyontpool        4.99
  kiyontpool kiyonvg twi-aotz--  1.00g                   49.93  2.00
# 很要命！这时已经分配出49%以上的容量了！而kiyonthin却只看到用掉5%而已！
# 所以鸟哥认为，这个thin pool 非常好用！但是在管理上，得要特别特别的留意！
```

这就是用多少算多少的thin pool 操作方式！基本上，用来骗人挺吓人的！小小的一个磁盘可以模拟出好多容量！但实际上，真的可用容量就是实际的磁盘储存池内的容量！如果突破该容量，这个thin pool 可是会爆炸而让资料损毁！要注意！要注意！

# LVM 的LV 磁盘快照
快照就是将当时的系统信息记录下来，就好像照相记录一般！未来若有任何资料更动了，则原始资料会被搬移到快照区，没有被更动的区域则由快照区与文件系统共享。
快照区与被快照的LV必须要在同一个VG上头。

## 传统快照区的建立
```bash
# 1.先观察VG还剩下多少剩余容量 
[root@study ~]# vgdisplay kiyonvg 
# ....(其他省略)....
  Total PE              252
  Alloc PE / Size       226 / 3.53 GiB
  Free  PE / Size       26 / 416.00 MiB
# 就只有剩下26个PE了！全部分配给kiyonsnap1！

# 2.利用lvcreate建立kiyonlv的快照区，快照被取名为kiyonsnap1，且给予26个PE 
[root@study ~]# lvcreate -s -l 26 -n kiyonsnap1 /dev/kiyonvg/kiyonlv
  Logical volume "kiyonsnap1" created
# 上述的指令中最重要的是那个-s 的选项！代表是snapshot 快照功能的意思！
# -n 后面接快照区的设备名称， /dev/.... 则是要被快照的LV 完整档名。
# -l 后面则是接使用多少个PE 来作为这个快照区使用。

[root@study ~]# lvdisplay /dev/kiyonvg/kiyonsnap1
  --- Logical volume ---
  LV Path                /dev/kiyonvg/kiyonspan1
  LV Name                kiyonspan1
  VG Name                kiyonvg
  LV UUID                08alSG-10xu-dRnP-CgfI-smCX-y8Xx-IPxtjw
  LV Write Access        read/write
  LV Creation host, time study.centos.kiyon, 2017-04-22 09:13:12 +0800
  LV snapshot status     active destination for kiyonlv
  LV Status              available
  # open                 0
  LV Size                2.50 GiB
  Current LE             160
  COW-table size         416.00 MiB
  COW-table LE           26
  Allocated to snapshot  0.00%
  Snapshot chunk size    4.00 KiB
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:11
  ```
  
  /dev/kiyonvg/kiyonsnap1 快照区就被建立起来了！而且它的VG 量与原本的/dev/kiyonvg/kiyonlv 相同！也就是说，如果真的挂载这个设备时，看到的资料会跟原本的kiyonlv 相同！
  
```bash
[root@study ~]# mkdir /srv/snapshot1 
[root@study ~]# mount -o nouuid /dev/kiyonvg/kiyonsnap1 /srv/snapshot1 
[root@study ~]# df -Th /srv/lvm /srv/ snapshot1
Filesystem                     Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonlv    xfs   2.5G   74M  2.5G   3% /srv/lvm
/dev/mapper/kiyonvg-kiyonspan1 xfs   2.5G   74M  2.5G   3% /srv/snapshot1
# /dev/kiyonvg/kiyonsnap1 会主动记录原kiyonlv 的内容！
```
因为XFS 不允许相同的UUID 文件系统的挂载，因此得要加上那个nouuid 的参数，让文件系统忽略相同的UUID 所造成的问题！

## 利用快照区复原系统
要注意的是，要复原的资料量不能够高于快照区所能负载的实际容量。由于原始资料会被搬移到快照区，如果快照区不够大，若原始资料被更动的实际资料量比快照区大，那么快照区当然容纳不了，这时候快照功能会失效！

我们的/srv/lvm 已经有/srv/lvm/etc, /srv/lvm/log 等目录了，接下来将这个文件系统的内容作个变更， 然后再以快照区资料还原看看：
```bash
# 1.先将原本的/dev/kiyonvg/kiyonlv内容作些变更，增增减减一些目录吧！
[root@study ~]# cp -a /usr/share/doc /srv/lvm 
[root@study ~]# rm -rf /srv/lvm/log 
[root@study ~]# rm -rf /srv/lvm /etc/sysconfig 
[root@study ~]# df -Th /srv/lvm /srv/snapshot1
Filesystem                     Type  Size  Used Avail Use% Mounted on
/dev/mapper/kiyonvg-kiyonlv    xfs   2.5G  115M  2.4G   5% /srv/lvm
/dev/mapper/kiyonvg-kiyonspan1 xfs   2.5G   74M  2.5G   3% /srv/snapshot1
[root@study ~]# ll /srv/lvm /srv/snapshot1
/srv/lvm:
total 28K
drwxr-xr-x. 284 root root  12K Apr 19 14:26 doc
drwxr-xr-x.  77 root root 8.0K Apr 22 09:38 etc

/srv/snapshot1:
total 16K
drwxr-xr-x. 78 root root 8.0K Apr 21 11:17 etc
drwxr-xr-x.  8 root root 4.0K Apr 19 14:40 log
# 两个目录的内容看起来已经不太一样了！

[root@study ~]# lvdisplay /dev/kiyonvg/kiyonsnap1
  --- Logical volume ---
  LV Path /dev/kiyonvg/kiyonsnap1
# ....(中间省略).... 
  Allocated to snapshot  13.12%
# 列出最重要的部份: 全部的容量已经被用掉了13.12%！

# 2.利用快照区将原本的filesystem备份，使用xfsdump来处理！
[root@study ~]# xfsdump -l 0 -L lvm1 -M lvm1 -f /home/lvm.dump /srv/snapshot1 
# 此时就会有一个备份资料/home/lvm.dump了！
```
为什么要备份呢？为什么不可以直接格式化/dev/kiyonvg/kiyonlv 然后将/dev/kiyonvg/kiyonsnap1 直接复制给kiyonlv 呢？要知道kiyonsnap1 其实是kiyonlv 的快照，因此如果你格式化整个kiyonlv 时，原本的文件系统所有资料都会被搬移到kiyonsnap1。那如果kiyonsnap1 的容量不够大(通常也真的不够大)，那么部分资料将无法复制到kiyonsnap1 内，资料当然无法全部还原啊！所以才要在上面制作出一个备份文件！

而快照还有另外一个功能，就是你可以比对/srv/lvm 与/srv/snapshot1 的内容，就能够发现到最近你到底改了啥！
```bash
# 3.将kiyonsnap1卸载并移除(因为里面的内容已经备份起来了) 
[root@study ~]# umount /srv/snapshot1 
[root@study ~]# lvremove /dev/kiyonvg/kiyonsnap1 
Do you really want to remove active logical volume "kiyonsnap1"? [y/n]: y
  Logical volume "kiyonsnap1" successfully removed

[root@study ~]# umount /srv/lvm 
[root@study ~]# mkfs.xfs -f /dev/kiyonvg/kiyonlv 
[root@study ~]# mount /dev/kiyonvg/kiyonlv /srv/lvm 
[root @study ~]# xfsrestore -f /home/lvm.dump -L lvm1 /srv/lvm 
[root@study ~]# ll /srv/lvm
total 16K
drwxr-xr-x. 78 root root 8.0K Apr 21 11:17 etc
drwxr-xr-x.  8 root root 4.0K Apr 19 14:40 log
```

# LVM 的关闭
如果没有将LVM 关闭就直接将那些partition 删除或转为其他用途的话，系统是会发生很大的问题的！所以必须要知道如何将LVM 的设备关闭并移除才行！依据以下的流程来处理即可：
- 先卸载系统上面的LVM 文件系统(包括快照与所有LV)；
- 使用lvremove 移除LV ；
- 使用vgchange -an VGname 让VGname 这个VG 不具有Active 的标志；
- 使用vgremove 移除VG：
- 使用pvremove 移除PV；
- 最后，使用fdisk 修改ID 回来！

```bash
[root@study ~]# umount /srv/lvm /srv/thin /srv/snapshot1 
[root@study ~]# lvs kiyonvg
  LV         VG      Attr       LSize  Pool       Origin Data%  Meta%  Move Log Cpy%Sync Convert
  kiyonlv    kiyonvg -wi-a-----  2.50g
  kiyonthin  kiyonvg Vwi-a-tz-- 10.00g kiyontpool        4.99
  kiyontpool kiyonvg twi-aotz--  1.00g                   49.93  1.83
# 要注意！按顺序删除kiyonthin --> kiyontpool --> kiyonlv 比较好！

[root@study ~]# lvremove /dev/kiyonvg/kiyonthin
[root@study ~]# lvremove /dev/kiyonvg/kiyonlv 
[root@study ~]# vgchange -an kiyonvg
  0 logical volume(s) in volume group "kiyonvg" now active

[root@study ~]# vgremove kiyonvg
  Volume group "kiyonvg" successfully removed

[root@study ~]# pvremove /dev/sda{5,6,7,8}
  Labels on physical volume "/dev/sda5" successfully wiped.
  Labels on physical volume "/dev/sda6" successfully wiped.
  Labels on physical volume "/dev/sda7" successfully wiped.
  Labels on physical volume "/dev/sda8" successfully wiped.
```