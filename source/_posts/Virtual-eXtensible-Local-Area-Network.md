---
title: Virtual eXtensible Local Area Network
tag: [网络, VXLAN]
category:
  - 技术
  - 网络
  - VXLAN
date: 2017-07-07 08:25:58
updated: 2017-07-07 08:25:58
---
翻译自[原文地址](https://tools.ietf.org/html/rfc7348)

# 虚拟可扩展局域网(VXLAN): 覆盖三层网络之上的虚拟二层网络架构

> 摘要  
本文描述了虚拟可扩展局域网(VXLAN)，用于解决在容纳多个租户的虚拟化数据中心内覆盖网络的需求。该方案和相关协议可用于云服务提供商和企业数据中心的网络。本备忘录录可部署的VXLAN协议，以便互联网社区受益。

# 简介
服务器虚拟化对物理网络基础架构的需求逐渐增加。物理服务器可以有多个虚拟机（VM），每个虚拟机都有自己的媒体访问控制（MAC）地址。因为成千上万的虚拟机之间有着潜在的连接和通信，所以需要交换以太网中拥有较大的MAC地址表。

在数据中心的虚拟机根据虚拟局域网（VLAN）进行分组的情况下，根据虚拟机属于的特定组，可能需要数千个VLAN对流量进行分区。在这种情况下，目前VLAN的4094个数量限制是远远达不到要求的。

数据中心通常需要托管多个租户，每个租户都有自己的隔离网域。由于通过专用基础架构实现这一点并不经济，网络管理员可以选择通过共享网络实现隔离。在这种情况下，一个常见的问题是每个租户可以独立地分配MAC地址和VLAN ID，导致在物理网络上有着潜在的重复。

使用第2层物理基础设施的虚拟化环境的一个重要要求是在整个数据中心或甚至数据中心之间拥有第2层网络规模，以便有效地分配计算，网络和存储资源。在这样的网络中，使用诸如生成树协议（STP）等传统方法进行无环路拓扑可能会导致大量禁用链路。

最后一种情况是网络运营商更喜欢的使用IP来互连物理基础架构（例如，通过等价多路径（ECMP）实现多径可扩展性，从而避免被禁用的链路）。即使在这样的环境中，也需要保留用于VM间通信的第2层模型。

上述情况促使了覆盖网络的需求。 该覆盖网络用于携带来自各个VM的MAC流量，这些流量以一定的格式封装，并通过逻辑“隧道”传输。
   The scenarios described above lead to a requirement for an overlay
   network.  This overlay is used to carry the MAC traffic from the
   individual VMs in an encapsulated format over a logical "tunnel".

本文档详细介绍了一个称为“虚拟可扩展局域网（VXLAN）”的框架，该框架提供了这种封装方案来满足上述各种要求。 此备忘录记录可部署的VXLAN协议，以便互联网社区受益。


## 缩略语和定义

|缩略语|定义|
|-------|-------|
|ACL|Access Control List|
|ECMP|Equal-Cost Multipath|
|IGMP|Internet Group Management Protocol|
|IHL|Internet Header Length|
|MTU|Maximum Transmission Unit|
|PIM|Protocol Independent Multicast|
|SPB|Shortest Path Bridging|
|STP|Spanning Tree Protocol|
|ToR|Top of Rack|
|TRILL|Transparent Interconnection of Lots of Links|
|VLAN|Virtual Local Area Network|
|VM|Virtual Machine|
|VNI|VXLAN Network Identifier (or VXLAN Segment ID)|
|VTEP|VXLAN Tunnel End Point.  An entity that originates and/or terminates VXLAN tunnels|
|VXLAN|Virtual eXtensible Local Area Network|
|VXLAN Segment|VXLAN Layer 2 overlay network over which VMs communicate|
|VXLAN Gateway|an entity that forwards traffic between VXLANs|

# 本文档中使用的约定
本文档中的“必须”，“不得”，“必须”，“应该”，“不应该”，“应该”，“不应该”，“推荐”，“可能”和“可选” 按照 [RFC 2119](https://tools.ietf.org/html/rfc2119)中所述解释。


# VXLAN问题陈述
本节提供有关VXLAN需要解决的领域的更多详细信息。重点是数据中心内的网络基础设施和与之相关的问题。

## 生成树和VLAN范围所引起的限制
当前的第2层网络使用IEEE 802.1D生成树协议802.1P）[ 802.1D ](https://tools.ietf.org/html/rfc7348#ref-802.1D)，以避免由于重复的路径而导致的网络环路。STP阻止链接的使用，以避免帧的重复和循环。一些数据中心运营商认为这是二层网络的一个问题，因为使用STP，他们支付了更多的端口和链路的费用，但是实际上真正能使用的却没有那么多。另外，由于多路径的弹性，从而不能用于STP模型。TRILL [ RFC6325 ](https://tools.ietf.org/html/rfc6325)和SPB [ 802.1aq ](https://tools.ietf.org/html/rfc7348#ref-802.1aq)等较新的举措已经被提出来了，用来帮助多路径和超越STP的一些问题。STP限制也可以通过将机架内的服务器配置在相同的第3层网络上，同时在机架内和机架之间的第3层进行切换进行避免。但是，这与用于VM 间通信的第2层模型不兼容。

第二层数据中心网络的一个关键特性是它们使用虚拟LAN（VLAN）来提供广播隔离。以太网数据帧中使用12位VLAN ID，将较大的二层网络划分为多个广播域。对于需要少于4094个VLAN的许多数据中心，这一点很好。随着虚拟化的日益普及，这一上限受到压力。此外，由于STP，几个数据中心限制了可以使用的VLAN数量。此外，多租户环境的要求加快了对更大VLAN数量的需求，如第3.3节所述。

## 多租户环境
云计算涉及针对多租户环境的按需弹性配置资源。云计算最常见的例子是公有云，云服务提供商通过相同的物理基础设施向多个客户/租户提供这些弹性服务。

租户的网络流量隔离可以通过二层或三层网络进行。对于第2层网络，VLAN通常用于隔离流量，例如不同租户可以通过自己的VLAN来标识。由于云提供商可能会服务大量租户，4094 个VLAN数量往往明显不足。在此外，经常出现每个租户拥有多个VLAN的情况，这也加剧了问题。

相关的用例是cross-pod扩展。一个pod通常由一个或多个服务器机架组成，具有关联的网络和存储连接。租户可以从一个pod开始，由于扩展，特别是在另一个pod上的租户没有充分利用所有资源的情况下，需要其他pod上的服务器或者VM。此用例需要连接各个服务器/VM的“延伸”第2层环境。

 第三层网络也不是多租户的综合解决方案。两个租户可能在其网络中使用相同的第3层地址集，这要求云提供商以其他形式提供隔离。此外，这还要求所有租户使用IP不包括依赖于直接第2层或非IP层3协议的客户进行VM间通信。

## ToR交换机表容量不足
今天的虚拟化环境对连接到服务器的架顶式（ToR）交换机的MAC 地址表提出了额外的要求。ToR现在必须学习各个虚拟机的MAC地址（可能范围在每个服务器数百个），而不是每个服务器链接只有一个MAC地址。这是必要的，因为到/从VM到物理网络的其余部分的流量将遍历服务器和交换机之间的链路。典型的ToR交换机可以连接24或48个服务器，具体取决于其面向服务器端口的数量。数据中心可能由几个机架组成，因此每个ToR交换机将需要维护跨各种物理服务器的通信虚拟机的地址表。与非虚拟化环境相比，这对表容量的需求大大增加。

如果表溢出，交换机可能会停止学习新地址，直到空闲记录被清除，这将导致后续未知地址帧的显着洪泛。

# VXLAN
VXLAN（虚拟可扩展局域网）在多租户环境中存在VM的情况下，满足了第2层和第3层数据中心网络基础设施的上述要求。它运行在现有的网络基础设施上，并提供了“拉伸”二层网络的手段。简而言之，VXLAN是第3层网络上的二层覆盖方案。每个叠加层称为VXLAN 段。只有同一VXLAN段内的VM才能相互通信。每个VXLAN段通过称为“VXLAN网络标识符（VNI）”的24位段ID来标识。这种架构允许多达16 M(2^24) VXLAN段在同一个管理域内共存。

VNI确定了由单个VM产生的内部MAC帧的范围。由于流量使用VNI进行隔离，因此可以跨段重叠MAC地址，但不会有流量“交叉”。VNI位于封装了VM发起的内部MAC帧的外部报头中。在以下部分中，术语“VXLAN段” 与术语“VXLAN覆盖网络”通用。

由于这种封装技术，VXLAN也可以被称为隧道方案，以覆盖第3层网络之上的第2层网络。该隧道是无状态的，所以每个帧根据一组规则进行封装。以下部分中讨论的隧道的终点（VXLAN Tunnel End Point或VTEP）位于承载VM的服务器上的管理程序中。因此，VNI和VXLAN相关的隧道/外部报头封装仅对VTEP可见，而VM看不到它（见图1）。需要注意的是， VTEP还可以在物理交换机或物理服务器上，也可以在软件或硬件中实现。第6节VXLAN部署方案有一个VTEP是物理交换机的用例。

以下部分将使用一种类型的控制方案（数据平面学习）来讨论VXLAN环境中的典型流量场景。在这里，VM的MAC与VTEP的IP地址的关联是通过源地址学习来发现的。组播用于携带未知的目的地，广播和多播帧。

除了基于学习的控制平面之外，还有其他方案可以将VTEP IP分发到VM MAC映射信息。例如单个VTEP的基于中央授权/目录的查找，中央机构将映射信息分发给VTEP等等。这些有时分别被称为推拉模型。本文将重点介绍数据平面学习方案作为VXLAN的控制平面。

## 单播VM到VM通信

假设有一台VXLAN覆盖网络内的VM，这个VM不知道VXLAN。想要在不同的主机上与虚拟机进行通信，VM会照常发送一个MAC帧到目标机器。 VTEP上的物理主机查找与此虚拟机关联的VNI。然后确定目的MAC是否在同一段，并确认目的MAC地址是否映射到远程VTEP。如果是的话，外部报头将外部MAC，外部IP报头和VXLAN报头（参见第5节框图格式的图1）组合起来置于原来的MAC帧之前。封装的数据包转发到远程VTEP。远程VTEP接收后，验证VNI的有效性以及该VNI上是否有VM使用和内部目的地MAC匹配的MAC地址。如果是的话，数据包封装头会被解封装并传递给目标虚拟机。目的地VM永远不会知道关于VNI或者该帧是用VXLAN封装后传输的。

除了将数据包转发到目标VM之外，远程VTEP还会学习内部源MAC到外部源IP地址的映射。它将映射关系存储在表中，使得当目的地VM发送响应分组时，不需要响应分组的“未知目的地”泛洪。
   
确定目标VM之前的MAC地址源VM的传输与非VXLAN一样执行环境，除了第4.2节所述。 广播帧
       被使用，但是被详细地封装在多播包中
       在第4.2节。
   Determining the MAC address of the destination VM prior to the
   transmission by the source VM is performed as with non-VXLAN
   environments except as described in Section 4.2.  Broadcast frames
   are used but are encapsulated within a multicast packet, as detailed
   in the Section 4.2.

## 广播通信和组播映射
考虑源主机上的VM尝试使用IP 与目标VM 通信。假设它们都在同一子网上，则VM发出地址解析协议（ARP）广播帧。在非VXLAN环境中，将使用MAC广播在所有携带该VLAN的交换机上发送此帧。
使用VXLAN，包含VXLAN VNI的报头与IP报头和UDP报头一起插入数据包的开头。该广播分组被发送到实现该VXLAN覆盖网络的IP组播组。
   With VXLAN, a header including the VXLAN VNI is inserted at the
   beginning of the packet along with the IP header and UDP header.
   However, this broadcast packet is sent out to the IP multicast group
   on which that VXLAN overlay network is realized.

   To effect this, we need to have a mapping between the VXLAN VNI and
   the IP multicast group that it will use.  This mapping is done at the
   management layer and provided to the individual VTEPs through a
   management channel.  Using this mapping, the VTEP can provide IGMP
   membership reports to the upstream switch/router to join/leave the
   VXLAN-related IP multicast groups as needed.  This will enable
   pruning of the leaf nodes for specific multicast traffic addresses
   based on whether a member is available on this host using the
   specific multicast address (see [RFC4541]).  In addition, use of
    multicast routing protocols like Protocol Independent Multicast -
   Sparse Mode (PIM-SM see [RFC4601]) will provide efficient multicast
   trees within the Layer 3 network.

   The VTEP will use (*,G) joins.  This is needed as the set of VXLAN
   tunnel sources is unknown and may change often, as the VMs come up /
   go down across different hosts.  A side note here is that since each
   VTEP can act as both the source and destination for multicast
   packets, a protocol like bidirectional PIM (BIDIR-PIM -- see
   [RFC5015]) would be more efficient.

   The destination VM sends a standard ARP response using IP unicast.
   This frame will be encapsulated back to the VTEP connecting the
   originating VM using IP unicast VXLAN encapsulation.  This is
   possible since the mapping of the ARP response's destination MAC to
   the VXLAN tunnel end point IP was learned earlier through the ARP
   request.

   Note that multicast frames and "unknown MAC destination" frames are
   also sent using the multicast tree, similar to the broadcast frames.

4.3.  Physical Infrastructure Requirements

   When IP multicast is used within the network infrastructure, a
   multicast routing protocol like PIM-SM can be used by the individual
   Layer 3 IP routers/switches within the network.  This is used to
   build efficient multicast forwarding trees so that multicast frames
   are only sent to those hosts that have requested to receive them.

   Similarly, there is no requirement that the actual network connecting
   the source VM and destination VM should be a Layer 3 network: VXLAN
   can also work over Layer 2 networks.  In either case, efficient
   multicast replication within the Layer 2 network can be achieved
   using IGMP snooping.

   VTEPs MUST NOT fragment VXLAN packets.  Intermediate routers may
   fragment encapsulated VXLAN packets due to the larger frame size.
   The destination VTEP MAY silently discard such VXLAN fragments.  To
   ensure end-to-end traffic delivery without fragmentation, it is
   RECOMMENDED that the MTUs (Maximum Transmission Units) across the
   physical network infrastructure be set to a value that accommodates
   the larger frame size due to the encapsulation.  Other techniques
   like Path MTU discovery (see [RFC1191] and [RFC1981]) MAY be used to
   address this requirement as well.


5.  VXLAN Frame Format

   The VXLAN frame format is shown below.  Parsing this from the bottom
   of the frame -- above the outer Frame Check Sequence (FCS), there is
   an inner MAC frame with its own Ethernet header with source,
   destination MAC addresses along with the Ethernet type, plus an
   optional VLAN.  See Section 6 for further details of inner VLAN tag
   handling.

   The inner MAC frame is encapsulated with the following four headers
   (starting from the innermost header):

   VXLAN Header:  This is an 8-byte field that has:

      - Flags (8 bits): where the I flag MUST be set to 1 for a valid
        VXLAN Network ID (VNI).  The other 7 bits (designated "R") are
        reserved fields and MUST be set to zero on transmission and
        ignored on receipt.

      - VXLAN Segment ID/VXLAN Network Identifier (VNI): this is a
        24-bit value used to designate the individual VXLAN overlay
        network on which the communicating VMs are situated.  VMs in
        different VXLAN overlay networks cannot communicate with each
        other.

      - Reserved fields (24 bits and 8 bits): MUST be set to zero on
        transmission and ignored on receipt.

   Outer UDP Header:  This is the outer UDP header with a source port
      provided by the VTEP and the destination port being a well-known
      UDP port.

      -  Destination Port: IANA has assigned the value 4789 for the
         VXLAN UDP port, and this value SHOULD be used by default as the
         destination UDP port.  Some early implementations of VXLAN have
         used other values for the destination port.  To enable
         interoperability with these implementations, the destination
         port SHOULD be configurable.

      -  Source Port:  It is recommended that the UDP source port number
         be calculated using a hash of fields from the inner packet --
         one example being a hash of the inner Ethernet frame's headers.
         This is to enable a level of entropy for the ECMP/load-
         balancing of the VM-to-VM traffic across the VXLAN overlay.
         When calculating the UDP source port number in this manner, it
         is RECOMMENDED that the value be in the dynamic/private port
         range 49152-65535 [RFC6335].

      -  UDP Checksum: It SHOULD be transmitted as zero.  When a packet
         is received with a UDP checksum of zero, it MUST be accepted
         for decapsulation.  Optionally, if the encapsulating end point
         includes a non-zero UDP checksum, it MUST be correctly
         calculated across the entire packet including the IP header,
         UDP header, VXLAN header, and encapsulated MAC frame.  When a
         decapsulating end point receives a packet with a non-zero
         checksum, it MAY choose to verify the checksum value.  If it
         chooses to perform such verification, and the verification
         fails, the packet MUST be dropped.  If the decapsulating
         destination chooses not to perform the verification, or
         performs it successfully, the packet MUST be accepted for
         decapsulation.

   Outer IP Header:  This is the outer IP header with the source IP
      address indicating the IP address of the VTEP over which the
      communicating VM (as represented by the inner source MAC address)
      is running.  The destination IP address can be a unicast or
      multicast IP address (see Sections 4.1 and 4.2).  When it is a
      unicast IP address, it represents the IP address of the VTEP
      connecting the communicating VM as represented by the inner
      destination MAC address.  For multicast destination IP addresses,
      please refer to the scenarios detailed in Section 4.2.

   Outer Ethernet Header (example):  Figure 1 is an example of an inner
      Ethernet frame encapsulated within an outer Ethernet + IP + UDP +
      VXLAN header.  The outer destination MAC address in this frame may
      be the address of the target VTEP or of an intermediate Layer 3
      router.  The outer VLAN tag is optional.  If present, it may be
      used for delineating VXLAN traffic on the LAN.

    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1

   Outer Ethernet Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |             Outer Destination MAC Address                     |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Outer Destination MAC Address | Outer Source MAC Address      |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                Outer Source MAC Address                       |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |OptnlEthtype = C-Tag 802.1Q    | Outer.VLAN Tag Information    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Ethertype = 0x0800            |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+



   Outer IPv4 Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |Version|  IHL  |Type of Service|          Total Length         |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |         Identification        |Flags|      Fragment Offset    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |  Time to Live |Protocl=17(UDP)|   Header Checksum             |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                       Outer Source IPv4 Address               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                   Outer Destination IPv4 Address              |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Outer UDP Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           Source Port         |       Dest Port = VXLAN Port  |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           UDP Length          |        UDP Checksum           |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   VXLAN Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |R|R|R|R|I|R|R|R|            Reserved                           |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                VXLAN Network Identifier (VNI) |   Reserved    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Inner Ethernet Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |             Inner Destination MAC Address                     |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Inner Destination MAC Address | Inner Source MAC Address      |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                Inner Source MAC Address                       |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |OptnlEthtype = C-Tag 802.1Q    | Inner.VLAN Tag Information    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Payload:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Ethertype of Original Payload |                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               |
   |                                  Original Ethernet Payload    |
   |                                                               |
   |(Note that the original Ethernet Frame's FCS is not included)  |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Frame Check Sequence:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |   New FCS (Frame Check Sequence) for Outer Ethernet Frame     |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

            Figure 1: VXLAN Frame Format with IPv4 Outer Header

   The frame format above shows tunneling of Ethernet frames using IPv4
   for transport.  Use of VXLAN with IPv6 transport is detailed below.

    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1

   Outer Ethernet Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |             Outer Destination MAC Address                     |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Outer Destination MAC Address | Outer Source MAC Address      |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                Outer Source MAC Address                       |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |OptnlEthtype = C-Tag 802.1Q    | Outer.VLAN Tag Information    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Ethertype = 0x86DD            |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Outer IPv6 Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |Version| Traffic Class |           Flow Label                  |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |         Payload Length        | NxtHdr=17(UDP)|   Hop Limit   |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   +                                                               +
   |                                                               |
   +                     Outer Source IPv6 Address                 +
   |                                                               |
   +                                                               +
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   +                                                               +
   |                                                               |
   +                  Outer Destination IPv6 Address               +
   |                                                               |
   +                                                               +
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+


   Outer UDP Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           Source Port         |       Dest Port = VXLAN Port  |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           UDP Length          |        UDP Checksum           |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   VXLAN Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |R|R|R|R|I|R|R|R|            Reserved                           |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                VXLAN Network Identifier (VNI) |   Reserved    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Inner Ethernet Header:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |             Inner Destination MAC Address                     |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Inner Destination MAC Address | Inner Source MAC Address      |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                Inner Source MAC Address                       |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |OptnlEthtype = C-Tag 802.1Q    | Inner.VLAN Tag Information    |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Payload:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   | Ethertype of Original Payload |                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               |
   |                                  Original Ethernet Payload    |
   |                                                               |
   |(Note that the original Ethernet Frame's FCS is not included)  |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

   Frame Check Sequence:
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |   New FCS (Frame Check Sequence) for Outer Ethernet Frame     |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

            Figure 2: VXLAN Frame Format with IPv6 Outer Header

6.  VXLAN Deployment Scenarios

   VXLAN is typically deployed in data centers on virtualized hosts,
   which may be spread across multiple racks.  The individual racks may
   be parts of a different Layer 3 network or they could be in a single
   Layer 2 network.  The VXLAN segments/overlay networks are overlaid on
   top of these Layer 2 or Layer 3 networks.

   Consider Figure 3, which depicts two virtualized servers attached to
   a Layer 3 infrastructure.  The servers could be on the same rack, on
   different racks, or potentially across data centers within the same
   administrative domain.  There are four VXLAN overlay networks
   identified by the VNIs 22, 34, 74, and 98.  Consider the case of
   VM1-1 in Server 1 and VM2-4 on Server 2, which are on the same VXLAN
   overlay network identified by VNI 22.  The VMs do not know about the
   overlay networks and transport method since the encapsulation and
   decapsulation happen transparently at the VTEPs on Servers 1 and 2.
   The other overlay networks and the corresponding VMs are VM1-2 on
   Server 1 and VM2-1 on Server 2, both on VNI 34; VM1-3 on Server 1 and
   VM2-2 on Server 2 on VNI 74; and finally VM1-4 on Server 1 and VM2-3
   on Server 2 on VNI 98.

   +------------+-------------+
   |        Server 1          |
   | +----+----+  +----+----+ |
   | |VM1-1    |  |VM1-2    | |
   | |VNI 22   |  |VNI 34   | |
   | |         |  |         | |
   | +---------+  +---------+ |
   |                          |
   | +----+----+  +----+----+ |
   | |VM1-3    |  |VM1-4    | |
   | |VNI 74   |  |VNI 98   | |
   | |         |  |         | |
   | +---------+  +---------+ |
   | Hypervisor VTEP (IP1)    |
   +--------------------------+
                         |
                         |
                         |
                         |   +-------------+
                         |   |   Layer 3   |
                         |---|   Network   |
                             |             |
                             +-------------+
                                 |
                                 |
                                 +-----------+
                                             |
                                             |
                                      +------------+-------------+
                                      |        Server 2          |
                                      | +----+----+  +----+----+ |
                                      | |VM2-1    |  |VM2-2    | |
                                      | |VNI 34   |  |VNI 74   | |
                                      | |         |  |         | |
                                      | +---------+  +---------+ |
                                      |                          |
                                      | +----+----+  +----+----+ |
                                      | |VM2-3    |  |VM2-4    | |
                                      | |VNI 98   |  |VNI 22   | |
                                      | |         |  |         | |
                                      | +---------+  +---------+ |
                                      | Hypervisor VTEP (IP2)    |
                                      +--------------------------+

    Figure 3: VXLAN Deployment - VTEPs across a Layer 3 Network

   One deployment scenario is where the tunnel termination point is a
   physical server that understands VXLAN.  An alternate scenario is
   where nodes on a VXLAN overlay network need to communicate with nodes
   on legacy networks that could be VLAN based.  These nodes may be
   physical nodes or virtual machines.  To enable this communication, a
   network can include VXLAN gateways (see Figure 4 below with a switch
   acting as a VXLAN gateway) that forward traffic between VXLAN and
   non-VXLAN environments.

   Consider Figure 4 for the following discussion.  For incoming frames
   on the VXLAN connected interface, the gateway strips out the VXLAN
   header and forwards it to a physical port based on the destination
   MAC address of the inner Ethernet frame.  Decapsulated frames with
   the inner VLAN ID SHOULD be discarded unless configured explicitly to
   be passed on to the non-VXLAN interface.  In the reverse direction,
   incoming frames for the non-VXLAN interfaces are mapped to a specific
   VXLAN overlay network based on the VLAN ID in the frame.  Unless
   configured explicitly to be passed on in the encapsulated VXLAN
   frame, this VLAN ID is removed before the frame is encapsulated for
   VXLAN.

   These gateways that provide VXLAN tunnel termination functions could
   be ToR/access switches or switches higher up in the data center
   network topology -- e.g., core or even WAN edge devices.  The last
   case (WAN edge) could involve a Provider Edge (PE) router that
   terminates VXLAN tunnels in a hybrid cloud environment.  In all these
   instances, note that the gateway functionality could be implemented
   in software or hardware.


   +---+-----+---+                                    +---+-----+---+
   |    Server 1 |                                    |  Non-VXLAN  |
   (VXLAN enabled)<-----+                       +---->|  server     |
   +-------------+      |                       |     +-------------+
                        |                       |
   +---+-----+---+      |                       |     +---+-----+---+
   |Server 2     |      |                       |     |  Non-VXLAN  |
   (VXLAN enabled)<-----+   +---+-----+---+     +---->|    server   |
   +-------------+      |   |Switch acting|     |     +-------------+
                        |---|  as VXLAN   |-----|
   +---+-----+---+      |   |   Gateway   |
   | Server 3    |      |   +-------------+
   (VXLAN enabled)<-----+
   +-------------+      |
                        |
   +---+-----+---+      |
   | Server 4    |      |
   (VXLAN enabled)<-----+
   +-------------+

           Figure 4: VXLAN Deployment - VXLAN Gateway

6.1.  Inner VLAN Tag Handling

   Inner VLAN Tag Handling in VTEP and VXLAN gateway should conform to
   the following:

   Decapsulated VXLAN frames with the inner VLAN tag SHOULD be discarded
   unless configured otherwise.  On the encapsulation side, a VTEP
   SHOULD NOT include an inner VLAN tag on tunnel packets unless
   configured otherwise.  When a VLAN-tagged packet is a candidate for
   VXLAN tunneling, the encapsulating VTEP SHOULD strip the VLAN tag
   unless configured otherwise.

7.  Security Considerations

   Traditionally, Layer 2 networks can only be attacked from 'within' by
   rogue end points -- either by having inappropriate access to a LAN
   and snooping on traffic, by injecting spoofed packets to 'take over'
   another MAC address, or by flooding and causing denial of service.  A
   MAC-over-IP mechanism for delivering Layer 2 traffic significantly
   extends this attack surface.  This can happen by rogues injecting
   themselves into the network by subscribing to one or more multicast
   groups that carry broadcast traffic for VXLAN segments and also by
   sourcing MAC-over-UDP frames into the transport network to inject
   spurious traffic, possibly to hijack MAC addresses.

   This document does not incorporate specific measures against such
   attacks, relying instead on other traditional mechanisms layered on
   top of IP.  This section, instead, sketches out some possible
   approaches to security in the VXLAN environment.

   Traditional Layer 2 attacks by rogue end points can be mitigated by
   limiting the management and administrative scope of who deploys and
   manages VMs/gateways in a VXLAN environment.  In addition, such
   administrative measures may be augmented by schemes like 802.1X
   [802.1X] for admission control of individual end points.  Also, the
   use of the UDP-based encapsulation of VXLAN enables configuration and
   use of the 5-tuple-based ACL (Access Control List) functionality in
   physical switches.

   Tunneled traffic over the IP network can be secured with traditional
   security mechanisms like IPsec that authenticate and optionally
   encrypt VXLAN traffic.  This will, of course, need to be coupled with
   an authentication infrastructure for authorized end points to obtain
   and distribute credentials.

   VXLAN overlay networks are designated and operated over the existing
   LAN infrastructure.  To ensure that VXLAN end points and their VTEPs
   are authorized on the LAN, it is recommended that a VLAN be
   designated for VXLAN traffic and the servers/VTEPs send VXLAN traffic
   over this VLAN to provide a measure of security.

   In addition, VXLAN requires proper mapping of VNIs and VM membership
   in these overlay networks.  It is expected that this mapping be done
   and communicated to the management entity on the VTEP and the
   gateways using existing secure methods.
