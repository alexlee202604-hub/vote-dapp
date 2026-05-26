# 去中心化众筹 + ZK 隐私投票 DApp 计划

## TL;DR

> **Quick Summary**: 构建一个完整的企业级 DApp，包含去中心化众筹平台和基于零知识证明的隐私投票系统，具备 90%+ 测试覆盖率、Foundry 模糊测试、Sepolia 部署和精美前端。

> **Deliverables**:
> - Solidity 智能合约（Crowdfunding + DAOToken + ZKVoting + Verifier）
> - Circom ZK 电路（membership + anonymous_vote）
> - Foundry 测试套件（单元测试 + 模糊测试，覆盖 90%+）
> - Next.js 前端 DApp（众筹 + 投票界面）
> - UI/UX 设计（ui-ux-pro-max-skill + Google Stitch）
> - 部署到 Sepolia 测试网 + Vercel
> - 完整的 README（架构图、部署地址、安全考量）

> **Estimated Effort**: XL（大型项目，预计 500+ 文件）
> **Parallel Execution**: YES - 4 个并行 waves
> **Critical Path**: ZK Circuit → Verifier.sol → ZKVoting.sol → 前端集成

---

## Context

### Original Request
用户需要创建一个具有以下功能的完整企业级 DApp 工程：

1. **去中心化众筹平台**：
   - 创建众筹项目（目标 ETH/USDC，截止日期）
   - 用户投入资金，资金锁定在合约中
   - 达到目标 → 项目方提取；失败 → 出资人退款

2. **ZK 隐私投票系统**：
   - 匿名投票（证明 DAO 成员身份，不泄露钱包地址）
   - Circom 生成 ZK 电路
   - 浏览器内生成 Proof，链上验证

3. **企业级质量**：
   - Foundry 测试，90%+ 覆盖率，模糊测试
   - 部署到 Sepolia 测试网
   - 前端部署到 Vercel
   - 惊艳的 README（架构图、部署地址、安全考量）
   - UI/UX Pro Max 设计 + Google Stitch

### Technical Stack
- **智能合约**: Solidity ^0.8.20, Foundry
- **ZK 电路**: Circom 2.0, snarkjs (Groth16)
- **前端**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Web3**: Wagmi, Viem, RainbowKit, SnarkJS
- **测试**: Foundry (forge test, fuzz), Forge Coverage
- **部署**: Foundry 脚本 → Sepolia, Vercel → 前端

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js + Vercel)                │
│  ┌──────────────────┐  ┌────────────────────────────────┐   │
│  │  Crowdfunding UI  │  │  ZK Voting UI                  │   │
│  │  - Campaign List  │  │  - Proposal List               │   │
│  │  - Create Form    │  │  - Generate Proof (Browser)    │   │
│  │  - Contribute     │  │  - Submit Vote                 │   │
│  │  - Withdraw/Refund│  │  - Tally Results               │   │
│  └────────┬─────────┘  └────────┬───────────────────────┘   │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │ (Wagmi/Viem)                          │
│              ┌───────┴────────┐                              │
│              │  RainbowKit    │                              │
│              │  Wallet Connect│                              │
│              └───────┬────────┘                              │
└──────────────────────┼───────────────────────────────────────┘
                       │
              ┌────────┴────────────┐
              │  Sepolia Testnet    │
              │                     │
┌─────────────┼─────────────────────┼──────────────┐
│             │                     │              │
│  ┌──────────▼──────┐  ┌──────────▼──────────┐   │
│  │ Crowdfunding    │  │ ZKVoting            │   │
│  │ Contract        │  │ Contract            │   │
│  │ - createCampaign│  │ - createProposal    │   │
│  │ - contribute    │  │ - vote(proof)       │   │
│  │ - withdraw      │  │ - tally             │   │
│  │ - refund        │  └──────────┬──────────┘   │
│  └────────┬────────┘             │               │
│           │                      │               │
│  ┌────────▼────────┐  ┌──────────▼──────────┐   │
│  │ DAOToken (ERC20)│  │ Verifier.sol        │   │
│  │ - membership    │  │ (Groth16 Verify)    │   │
│  └─────────────────┘  └─────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘

Circom Circuits:
┌─────────────────────┐  ┌─────────────────────────┐
│ membership.circom   │  │ anonymous_vote.circom    │
│ - Prove token holding│  │ - Cast vote anonymously │
│ - Generate nullifier│  │ - Hidden vote choice     │
│ → Groth16 Proof     │  │ → Groth16 Proof          │
└─────────────────────┘  └─────────────────────────┘
```

---

## Work Objectives

### Core Objective
构建一个可部署到 Sepolia 测试网的企业级 DApp，包含去中心化众筹和 ZK 隐私投票功能，具备 90%+ 测试覆盖率并通过 Foundry 模糊测试验证。

### Concrete Deliverables
1. `contracts/src/Crowdfunding.sol` - 众筹合约
2. `contracts/src/DAOToken.sol` - DAO 成员身份 ERC20 代币
3. `contracts/src/ZKVoting.sol` - ZK 隐私投票合约
4. `contracts/src/Verifier.sol` - Groth16 验证器（snarkjs 生成）
5. `circuits/membership.circom` - 成员身份证明电路
6. `circuits/anonymous_vote.circom` - 匿名投票电路
7. `contracts/test/*.t.sol` - Foundry 测试套件
8. `contracts/script/Deploy.s.sol` - 部署脚本
9. `frontend/` - Next.js 前端应用
10. `README.md` - 完整文档
11. `.opencode/skills/ui-ux-pro-max/` - UI/UX 设计系统

### Must Have
- [ ] Crowdfunding: 创建、出资、提取、退款全部功能通过测试
- [ ] ZK Voting: 匿名投票 Proof 生成 + 链上验证通过
- [ ] Foundry 测试覆盖率 ≥ 90%（单元测试 + 模糊测试）
- [ ] 合约部署到 Sepolia 测试网
- [ ] 前端部署到 Vercel
- [ ] README 包含架构图、部署地址、本地运行说明、安全考量
- [ ] UI/UX Pro Max 设计系统集成
- [ ] 每次 commit 前运行测试套件全部通过

### Must NOT Have (Guardrails)
- ❌ 不部署到主网（仅测试网）
- ❌ 不在生产环境使用真实资产
- ❌ 不使用未审计的合约处理真实资金
- ❌ 不存储用户私钥或敏感信息
- ❌ 不跳过任何测试步骤直接声称完成
- ❌ 不创建"简化版"或"演示版"功能 - 全部功能完整实现

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Foundry)
- **Automated tests**: TDD - Red/Green/Refactor for each contract
- **Framework**: Foundry (forge test, forge coverage)
- **Coverage Target**: ≥ 90%

### QA Policy
Every task MUST include agent-executed QA scenarios.
- **Smart Contracts**: forge test -vvv, forge coverage
- **Frontend**: npm run build, manual browser verification
- **ZK Proof**: Generate proof, verify on anvil local chain

---

## Execution Waves

```
Wave 1 (Foundation + Core Contracts):
├── Task 1: Crowdfunding.sol - 众筹合约完整实现
├── Task 2: DAOToken.sol - ERC20 代币合约
├── Task 3: membership.circom - ZK 成员身份电路
├── Task 4: anonymous_vote.circom - ZK 匿名投票电路
├── Task 5: 编译电路 + snarkjs trusted setup + Verifier.sol 生成
└── Task 6: ZKVoting.sol - ZK 投票合约 (依赖 Task 5)

Wave 2 (Testing + Frontend Foundation):
├── Task 7: Crowdfunding.t.sol - 众筹测试（单元 + 模糊测试）
├── Task 8: DAOToken.t.sol - 代币测试
├── Task 9: ZKVoting.t.sol - 投票测试（单元 + 模糊测试）
├── Task 10: 覆盖率分析 + 补测试到 90%+
├── Task 11: 前端项目配置 + Wallet 连接 (RainbowKit + Wagmi)
└── Task 12: 前端众筹页面（列表 + 创建 + 详情）

Wave 3 (Frontend + ZK Integration):
├── Task 13: 前端众筹交互（出资、提取、退款）
├── Task 14: 前端 ZK 投票页面（提案列表 + 投票）
├── Task 15: 浏览器内 Proof 生成 + 提交
├── Task 16: UI/UX Pro Max 设计系统应用
└── Task 17: Google Stitch 导出设计图

Wave 4 (Deployment + Documentation + Verification):
├── Task 18: Deploy.s.sol - Foundry 部署脚本
├── Task 19: 部署到 Sepolia 测试网
├── Task 20: 前端部署到 Vercel
├── Task 21: README 完整文档（架构图、部署地址、安全考量）
└── Task F1-F4: Final Verification (Plan Compliance, Code Quality, QA, Scope)
```

---

## TODOs

- [ ] 1. **Crowdfunding.sol** - 去中心化众筹合约

  **What to do**:
  - 实现 `createCampaign(address token, uint256 target, uint256 deadline)` - 创建众筹项目
  - 实现 `contribute(uint256 campaignId) payable` - 出资（支持 ETH 和 USDC）
  - 实现 `withdraw(uint256 campaignId)` - 项目方在成功后提取资金
  - 实现 `refund(uint256 campaignId)` - 出资人在失败后退款
  - 使用 OpenZeppelin ReentrancyGuard 防止重入攻击
  - Campaign 结构体：id, creator, token, target, deadline, raised, status
  - 状态管理：Active, Success, Failed, Claimed
  - 事件：CampaignCreated, ContributionMade, CampaignSuccess, CampaignFailed, FundsWithdrawn, RefundIssued

  **Must NOT do**:
  - 不要处理真实主网资产
  - 不要在未测试情况下部署

  **Recommended Agent Profile**:
  - Category: `deep` - 需要深入的 Solidity 安全考量
  - Skills: 无特殊技能需求

  **Acceptance Criteria**:
  - [ ] forge test --match-path test/Crowdfunding.t.sol -vvv → PASS
  - [ ] 所有功能点都有单元测试覆盖
  - [ ] 包含 fuzz 测试

- [ ] 2. **DAOToken.sol** - DAO 成员身份代币

  **What to do**:
  - ERC20 代币，用于 DAO 成员身份标识
  - `mint(address to, uint256 amount)` - 铸造（仅 owner）
  - `burn(address from, uint256 amount)` - 销毁
  - 用于 ZK 电路中的成员身份证明

  **Acceptance Criteria**:
  - [ ] forge test --match-path test/DAOToken.t.sol -vvv → PASS

- [ ] 3. **membership.circom** - ZK 成员身份证明电路

  **What to do**:
  - 输入：
    - 私有: 用户的以太坊私钥/地址（作为私有输入）
    - 公共: DAOToken 合约地址, 空值器 (nullifier)
  - 电路逻辑：
    - 证明用户持有至少 1 个 DAOToken
    - 生成唯一 nullifier 防止双重投票
    - 不泄露用户具体地址
  - 使用 circomlib 的 Poseidon hash 和比较器

  **Acceptance Criteria**:
  - [ ] npx circom circuits/membership.circom --r1cs --wasm --sym -o circuits/build/ → 成功
  - [ ] snarkjs groth16 setup 完成

- [ ] 4. **anonymous_vote.circom** - ZK 匿名投票电路

  **What to do**:
  - 输入：
    - 私有: 成员身份 proof, 投票选择 (0/1)
    - 公共: proposal ID, nullifier
  - 电路逻辑：
    - 验证投票者确实是 DAO 成员
    - 对投票选择进行承诺 (commitment)
    - 确保一个 nullifier 只能投一次
  - 输出：可验证的投票证明

  **Acceptance Criteria**:
  - [ ] npx circom circuits/anonymous_vote.circom --r1cs --wasm --sym -o circuits/build/ → 成功

- [ ] 5. **编译电路 + Trusted Setup + Verifier.sol**

  **What to do**:
  - 编译两个电路 → .r1cs, .wasm, .sym
  - snarkjs powersoftau (POT) ceremony (测试用, 非生产)
  - snarkjs groth16 setup
  - snarkjs zkey export solidityverifier → Verifier.sol
  - 将 Verifier.sol 复制到 contracts/src/

  **Acceptance Criteria**:
  - [ ] Verifier.sol 生成并可通过编译
  - [ ] 可以用 snarkjs 生成 proof 并验证

- [ ] 6. **ZKVoting.sol** - ZK 隐私投票合约

  **What to do**:
  - 使用生成的 Verifier.sol 验证 Groth16 proof
  - `createProposal(string description, uint256 deadline)` - 创建提案
  - `vote(uint256 proposalId, bytes calldata proof, uint256[2] calldata publicSignals)` - 投票
  - `tally(uint256 proposalId)` - 统计结果
  - 存储每个 nullifier 防止双重投票
  - Proposal 结构体：id, description, deadline, yesVotes, noVotes, nullifiers

  **Acceptance Criteria**:
  - [ ] forge test --match-path test/ZKVoting.t.sol -vvv → PASS

- [ ] 7. **Crowdfunding.t.sol** - 众筹测试套件

  **What to do**:
  单元测试:
  - 创建众筹项目（验证事件、状态）
  - ETH 出资（验证余额、贡献记录）
  - USDC 出资
  - 达到目标后提取
  - 失败后退款
  - 边界条件：截止日期到达、精确目标金额

  模糊测试 (Fuzz):
  - 随机金额出资
  - 随机时间点操作
  - 多用户并发出资

  **Acceptance Criteria**:
  - [ ] forge test --match-path test/Crowdfunding.t.sol -vvv → PASS
  - [ ] 覆盖率 > 90%

- [ ] 8. **DAOToken.t.sol** - 代币测试

  **What to do**:
  - 铸造测试
  - 转账测试
  - 销毁测试
  - 授权测试

- [ ] 9. **ZKVoting.t.sol** - 投票测试套件

  **What to do**:
  单元测试:
  - 创建提案
  - 生成 proof 并投票
  - 防止双重投票（相同 nullifier）
  - 非成员不能投票
  - 截止日期后不能投票

  模糊测试:
  - 随机投票结果统计

- [ ] 10. **覆盖率分析 + 补测试到 90%+**

  **What to do**:
  - 运行 forge coverage
  - 分析未覆盖代码
  - 补充测试至 90%+
  - 生成覆盖率报告

  **Acceptance Criteria**:
  - [ ] forge coverage → ≥ 90%

- [ ] 11. **前端项目配置 + Wallet 连接**

  **What to do**:
  - 配置 Wagmi + RainbowKit + Viem
  - 配置 Sepolia 网络
  - Wallet 连接按钮（MetaMask, WalletConnect, Coinbase）
  - 全局 Providers 封装
  - 响应式布局框架

- [ ] 12. **前端众筹页面（列表 + 创建 + 详情）**

  **What to do**:
  - `/campaigns` - 所有众筹项目列表
  - `/campaigns/create` - 创建新众筹（表单：目标金额、代币类型、截止日期）
  - `/campaigns/[id]` - 项目详情（进度、出资、提取、退款）

- [ ] 13. **前端众筹交互（出资、提取、退款）**

  **What to do**:
  - 出资表单 + 交易发送
  - 提取按钮 + 交易
  - 退款按钮 + 交易
  - 实时进度显示
  - 交易状态通知

- [ ] 14. **前端 ZK 投票页面**

  **What to do**:
  - `/proposals` - 提案列表
  - `/proposals/create` - 创建提案
  - `/proposals/[id]` - 投票详情
  - 投票选择（赞成/反对）

- [ ] 15. **浏览器内 Proof 生成 + 提交**

  **What to do**:
  - 加载 .wasm 和 .zkey 文件
  - 使用 snarkjs 在浏览器生成 Groth16 proof
  - 提交 proof 到合约
  - 验证状态显示

- [ ] 16. **UI/UX Pro Max 设计系统应用**

  **What to do**:
  - 使用 ui-ux-pro-max-skill 生成完整设计系统
  - 应用色彩方案、排版、间距
  - 确保所有页面设计一致性
  - 组件级设计优化

- [ ] 17. **Google Stitch 导出设计图**

  **What to do**:
  - 设计关键页面（首页、众筹列表、投票界面）
  - 通过 MCP 导出到 Google Stitch

- [ ] 18. **Deploy.s.sol** - Foundry 部署脚本

  **What to do**:
  - Foundry Script 部署所有合约
  - 构造函数参数配置
  - 验证部署 (etherscan)

- [ ] 19. **部署到 Sepolia 测试网**

  **What to do**:
  - 部署 DAOToken
  - 部署 Crowdfunding
  - 部署 ZKVoting + Verifier
  - 记录部署地址

- [ ] 20. **前端部署到 Vercel**

  **What to do**:
  - Vercel 配置
  - 环境变量设置
  - 部署命令配置

- [ ] 21. **README 完整文档**

  **What to do**:
  - 项目概述
  - 系统架构图（Mermaid）
  - 合约部署地址
  - 本地运行指南
  - 测试结果展示（覆盖率徽章）
  - 安全考量
  - 技术栈说明
  - Demo 链接

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  检查所有 Must Have 是否实现，Must NOT Have 是否违反

- [ ] F2. **Code Quality Review** — `unspecified-high`
  forge build, lint, code review

- [ ] F3. **Real Manual QA** — `unspecified-high`
  端到端测试：合约部署 → 前端交互 → Proof 生成 → 链上验证

- [ ] F4. **Scope Fidelity Check** — `deep`
  检查所有功能是否完整实现，无遗漏

---

## Commit Strategy

- **Wave 1**: `feat(contracts): crowdfunding, token, zk circuits and voting`
- **Wave 2**: `test(contracts): comprehensive test suite with fuzz`
- **Wave 3**: `feat(frontend): dapp ui with crowdfunding and zk voting`
- **Wave 4**: `docs: deployment, readme, and final verification`
