---
title: 鸟哥Linux基础-主机规划和磁盘分割
tag: [Linux基础]
date: 2017-01-04 16:58:49
updated: 2017-01-04 16:58:49
category: [技术,linux]
---

装置	装置在Linux内的档名
SCSI/SATA/USB硬碟机	/dev/sd[ap]
USB快闪碟	/dev/sd[ap] (与SATA相同)
VirtI/O界面	/dev/vd[ap] (用于虚拟机器内)
软碟机	/dev/fd[0-1]
印表机	/dev/lp[0-2] (25针印表机) 
/dev/usb/lp[0-15] (USB介面)
滑鼠	/dev/input/mouse[0-15] (通用) 
/dev/psaux (PS/2界面) 
/dev/mouse (当前滑鼠)
CDROM/DVDROM	/dev/scd[0-1] (通用) 
/dev/sr[0-1] (通用，CentOS较常见) 
/dev/cdrom (当前CDROM)
磁带机	/dev/ht0 (IDE界面) 
/dev/st0 (SATA/SCSI界面) 
/dev/tape (当前磁带)
IDE硬碟机	/dev/hd[ad] (旧式系统才有)