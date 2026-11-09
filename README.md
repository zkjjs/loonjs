# loonjs

Loon 分流规则、插件和配套脚本。仓库也收录了独立的 Egern 模块与 ClashMi 配置片段。

## Loon 分流规则

从下表复制原始文件链接，在 Loon 的远程规则中添加。对未指定策略的规则，在导入时选择对应策略。规则命中情况可在 Loon 的请求记录中核对。

| 规则 | 用途 | 原始文件 |
| --- | --- | --- |
| LINE | 匹配 LINE 相关域名，导入时选择自己的 LINE 代理策略。 | [LINE.list](https://raw.githubusercontent.com/zkjjs/loonjs/main/rules/LINE.list) |
| 保卫萝卜 3 | 按已核实的主机名分流，导入时选择 `DIRECT`。 | [BaoWeiLuoBo3.list](https://raw.githubusercontent.com/zkjjs/loonjs/main/rules/BaoWeiLuoBo3.list) |
| 动漫共和国 | 为文件中列出的域名指定 `DIRECT`。 | [AnimeRepublic_CN_Direct.list](https://raw.githubusercontent.com/zkjjs/loonjs/main/AnimeRepublic_CN_Direct.list) |

其他规则见 [MEXC](Rules/MEXC.lsr)、[Soul](Soul.lsr) 和 [小红书](XiaoHongShu.lsr)。链接区分大小写，仓库中同时有 `Rules/` 和 `rules/`。

## Loon 插件

在 Loon 的插件管理里添加原始文件链接。插件引用的 JavaScript 由客户端加载。

| 插件 | 用途 | 原始文件 |
| --- | --- | --- |
| 美团外卖开屏广告 | 匹配已知的开屏广告素材。 | [Meituan_NoSplashAD.lpx](https://raw.githubusercontent.com/zkjjs/loonjs/main/plugins/Meituan_NoSplashAD.lpx) |
| 今日水印相机 | 按域名拦截开屏广告相关请求。 | [JinRiCamera_Splash_AdBlock.plugin](https://raw.githubusercontent.com/zkjjs/loonjs/main/JinRiCamera_Splash_AdBlock.plugin) |
| WeTalk | 签到与视频奖励脚本。 | [WeTalk.plugin](https://raw.githubusercontent.com/zkjjs/loonjs/main/WeTalk/WeTalk.plugin) |
| PingMe | 签到与视频奖励脚本。 | [PingMe.plugin](https://raw.githubusercontent.com/zkjjs/loonjs/main/PingMe.plugin) |

包含 `[MITM]` 或远程脚本的插件，启用前可查看其匹配域名和脚本来源。详见 [Loon 订阅规则](https://nsloon.app/docs/Rule/sub_rule/)和 [Loon 插件文档](https://nsloon.app/docs/Plugin/)。

## 其他客户端

- **Egern**。 [IPTest_Egern.yaml](Egern/IPTest_Egern.yaml) 是节点质量查询模块。将 `POLICY` 填为 Egern 中节点或策略组的完整名称。
- **ClashMi**。 [clashmi-loopback.yaml](clashmi-loopback.yaml) 和 [clashmi-loopback-ios27.yaml](clashmi-loopback-ios27.yaml) 是 `tun.loopback-address` 配置片段，按需合并到现有配置。
