---
active: true
iteration: 2
max_iterations: 500
completion_promise: "DONE"
initial_completion_promise: "DONE"
started_at: "2026-05-26T06:55:15.402Z"
session_id: "ses_19cef11f7ffes7ci8B3ZSZ6iGP"
ultrawork: true
strategy: "continue"
message_count_at_start: 0
---
帮我创建一个具有以下功能，构思一个完整的具备企业级商业运营的工程,必须自己完成测试才算完成。代码规范与测试（最重要）：
在你的 GitHub 仓库里，测试代码的覆盖率必须达到 90% 以上。使用 Foundry 编写单元测试和模糊测试（Fuzz Testing），并在 README 中展示测试结果。这能直接证明你具备生产环境的严谨态度。

不要只在 Localhost 运行：
把你的 DApp 部署到公链测试网（如 Sepolia、Arbitrum Sepolia），前端部署到 Vercel。在简历上直接放上可以点击访问的 Demo 链接和开源 GitHub 链接。

写一份惊艳的 README：
写明系统架构图、合约部署地址、如何本地运行，以及你做出的安全考量
需要安装ui-ux-pro-max-skill之后设计页面，并把设计图通过mcp传到我的google stitch
包含去中心化众筹平台，核心功能有：核心功能：
用户可以创建众筹项目，设定目标金额（ETH/USDC）和截止日期。
支持其他用户投入资金，资金暂时锁定在合约中。
条件触发： 若在截止日期前达到目标，项目方可提取资金；若失败，出资人可自行调用合约退款。
和基于 ZK-Proof（零知识证明）的隐私投票或凭证系统，核心功能：
匿名投票： 用户证明自己属于某个 DAO（持有特定代币），但可以在不泄露自己具体钱包地址的情况下，对某项决议投出匿名票。
使用 Circom 生成零知识证明电路，在前端（浏览器内）生成证明（Proof），并由链上智能合约进行验证。
