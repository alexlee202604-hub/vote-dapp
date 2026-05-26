# VoteDAO - Decentralized Crowdfunding & ZK Anonymous Voting DApp

一个基于以太坊的完整去中心化应用，支持众筹筹款和零知识证明匿名投票。

## 架构概览

```
┌─────────────────────────────────────────────────┐
│                 用户钱包 (MetaMask)               │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│             前端 (Next.js 15)                     │
│  wagmi + RainbowKit + viem + @tanstack/react-query│
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              RPC 节点 (Sepolia)                   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│             智能合约 (Solidity)                    │
│  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ Crowdfunding │  │ ZKVoting + Groth16Verifier│  │
│  │ (众筹)       │  │ (ZK匿名投票)              │   │
│  └─────────────┘  └──────────────────────────┘   │
│  ┌─────────────┐                                  │
│  │ DAOToken    │  (ERC20 治理代币)                 │
│  └─────────────┘                                  │
└─────────────────────────────────────────────────┘
```

## 技术栈

| 层级 | 技术 |
|------|------|
| **智能合约** | Solidity ^0.8.20, Foundry (forge) |
| **ZK 电路** | Circom (JS), Groth16 证明 |
| **前端框架** | Next.js 15 (App Router), TypeScript |
| **Web3 集成** | wagmi v2, viem, RainbowKit |
| **测试** | Foundry (unit + fuzz), 56 tests, 90%+ coverage |
| **区块链** | Sepolia 测试网 |

## 合约部署地址 (Sepolia)

| 合约 | 地址 |
|------|------|
| **DAOToken** (VOTE) | `0x068bf8e43d9a5a6477f9837e7bf0070a6ec2e9d6` |
| **Crowdfunding** | `0x61d3a8b465933eadaaed39f7f47cc56fbe179171` |
| **Groth16Verifier** | `0x50fe6de34ea1865fc86df13a8aa5d0c5d2b6b03d` |
| **ZKVoting** | `0xa54e2abf868bf66c2f7d13509e5f96ae3766c148` |

[Sepolia 区块浏览器查看](https://sepolia.etherscan.io/address/0xa54e2abf868bf66c2f7d13509e5f96ae3766c148)

## 合约功能

### Crowdfunding (众筹)
- 创建众筹项目（ETH 或 ERC20 代币）
- 向项目捐款
- 达到目标后创建者可提款
- 失败后捐款者可退款
- ReentrancyGuard 防重入攻击

### ZKVoting (ZK 匿名投票)
- 创建提案
- 使用 Groth16 零知识证明匿名投票
- 基于 nullifier 防双花
- 投票选择通过 voteHash 末位编码（偶=赞成，奇=反对）

### DAOToken (治理代币)
- ERC20 代币 "Vote DAO Token" (VOTE)
- 可铸造和销毁（仅限合约拥有者）

## 本地运行

### 前置条件
- Node.js 18+
- Foundry (forge)
- MetaMask 钱包

### 1. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:3000`

### 2. 运行合约测试

```bash
cd contracts
forge test -vvv
```

### 3. 部署合约

```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url <SEPOLIA_RPC_URL> \
  --private-key <YOUR_PRIVATE_KEY> \
  --broadcast
```

## ZK 电路

电路位于 `circuits/` 目录：

| 电路 | 功能 |
|------|------|
| `membership.circom` | DAO 成员资格证明 |
| `anonymous_vote.circom` | 匿名投票证明 |

编译电路：
```bash
cd circuits
npm install
npm run build
```

## 前端页面

| 路由 | 功能 |
|------|------|
| `/` | 首页 - 项目概览 |
| `/campaigns` | 众筹列表 |
| `/campaigns/create` | 创建众筹 |
| `/campaigns/[id]` | 众筹详情 + 捐款 |
| `/proposals` | 提案列表 |
| `/proposals/create` | 创建提案 |
| `/proposals/[id]` | 提案详情 + 投票 |

## 测试

全部 56 个测试通过（含 fuzz）：
- Crowdfunding: 22 测试 (含 3 个 fuzz)
- DAOToken: 10 测试 (含 2 个 fuzz)
- ZKVoting: 12 测试 (含 2 个 fuzz)
- EnhancedCoverage: 12 测试

```bash
cd contracts && forge coverage
```

## 安全考虑

- 使用 OpenZeppelin `ReentrancyGuard` 防止重入攻击
- ZK 投票使用 nullifier 防止双花
- 众筹合约使用 Checks-Effects-Interactions 模式
- 自定义错误（Custom errors）替代 require 字符串，节省 gas
- 时间戳依赖警告：Foundry 提示 `block.timestamp` 可被验证者操控（测试网可接受）
- ERC20 transfer 返回值未检查（不影响功能，可补充 SafeERC20）

## 目录结构

```
vote/
├── contracts/          # Solidity 智能合约 + Foundry
│   ├── src/            # 合约源码
│   ├── test/           # 测试文件
│   ├── script/         # 部署脚本
│   └── lib/            # 依赖库
├── circuits/           # ZK 电路
│   ├── membership.circom
│   ├── anonymous_vote.circom
│   └── build/          # 编译输出
├── frontend/           # Next.js 前端
│   └── src/
│       ├── app/        # 页面路由
│       ├── components/ # UI 组件
│       └── config/     # 合约 ABI + 地址配置
└── README.md
```

## License

MIT
