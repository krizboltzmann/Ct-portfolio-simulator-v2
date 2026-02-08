// ============================================
// CT RESEARCH PORTFOLIO SIMULATOR
// Research-driven capital allocation game
// ============================================

// ============================================
// GAME STATE
// ============================================

const STARTING_CAPITAL = 10000;
let currentPortfolio = STARTING_CAPITAL;
let currentRound = 0;
let currentToken = null;
let selectedResearchFactor = null;
let selectedAllocationPercent = null;
let usedTokens = [];

// ============================================
// TOKEN DATABASE (100+ scenarios)
// ============================================

const tokenDatabase = [
    // GOOD SETUPS (Low risk - 60% pump, 30% chop, 10% dump)
    {
        name: "Solstice Protocol",
        ticker: "SLSTC",
        marketCap: "$45M",
        fdv: "$52M",
        liquidity: "$4M",
        unlocks: "3% quarterly",
        concentration: "8% top holder",
        narrative: "Steady TVL growth. Protocol revenue increasing.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.45, weight: 60, text: "Strong fundamentals paid off. Token rallied on positive metrics." },
            { type: "chop", change: 0.05, weight: 30, text: "Moved sideways. Good fundamentals but market was flat." },
            { type: "dump", change: -0.25, weight: 10, text: "Market-wide selloff dragged everything down, even solid projects." }
        ]
    },
    {
        name: "Nexus Finance",
        ticker: "NEXFI",
        marketCap: "$38M",
        fdv: "$44M",
        liquidity: "$3.5M",
        unlocks: "4% quarterly",
        concentration: "7% top holder",
        narrative: "Established DeFi protocol. Audited and secure.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.52, weight: 60, text: "Security and solid metrics attracted capital. Steady climb." },
            { type: "chop", change: -0.03, weight: 30, text: "No major catalysts. Traded in range despite good fundamentals." },
            { type: "dump", change: -0.20, weight: 10, text: "Sector rotation out of DeFi. Even good protocols sold off." }
        ]
    },
    {
        name: "Titan DAO",
        ticker: "TTNDAO",
        marketCap: "$50M",
        fdv: "$58M",
        liquidity: "$5M",
        unlocks: "2% quarterly",
        concentration: "6% top holder",
        narrative: "Blue chip DAO. Strong community and treasury.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.38, weight: 60, text: "DAO governance proposals passed. Community confidence drove price up." },
            { type: "chop", change: 0.08, weight: 30, text: "Stable but no major movement. Blue chip traded sideways." },
            { type: "dump", change: -0.18, weight: 10, text: "Risk-off environment. Even stable projects corrected." }
        ]
    },
    {
        name: "CoreFi Protocol",
        ticker: "COREFI",
        marketCap: "$42M",
        fdv: "$48M",
        liquidity: "$4.2M",
        unlocks: "5% quarterly",
        concentration: "9% top holder",
        narrative: "Revenue-generating. Product-market fit achieved.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.48, weight: 60, text: "Revenue numbers impressed market. Price responded positively." },
            { type: "chop", change: 0.02, weight: 30, text: "Good metrics but macro headwinds kept price flat." },
            { type: "dump", change: -0.22, weight: 10, text: "Profit-taking after recent gains. Corrected despite fundamentals." }
        ]
    },
    {
        name: "Bastion Finance",
        ticker: "BSTN",
        marketCap: "$55M",
        fdv: "$62M",
        liquidity: "$5.5M",
        unlocks: "3% quarterly",
        concentration: "7% top holder",
        narrative: "Market leader in its niche. Strong moat.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.41, weight: 60, text: "Market dominance attracted institutional interest. Rallied." },
            { type: "chop", change: -0.05, weight: 30, text: "Leadership position maintained but price choppy." },
            { type: "dump", change: -0.19, weight: 10, text: "Competition concerns sparked selloff despite strong position." }
        ]
    },

    // LIQUIDITY TRAPS (Bad setups - 10% pump, 20% chop, 70% dump)
    {
        name: "Eclipse Protocol",
        ticker: "ECLPS",
        marketCap: "$12M",
        fdv: "$15M",
        liquidity: "$140K",
        unlocks: "8% quarterly",
        concentration: "14% top holder",
        narrative: "New DeFi primitive. CT is excited about the innovation.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.35, weight: 10, text: "Hype briefly overcame illiquidity. Pumped but hard to exit at top." },
            { type: "chop", change: -0.08, weight: 20, text: "Thin liquidity made price erratic. Choppy and stressful." },
            { type: "dump", change: -0.52, weight: 70, text: "Illiquid tokens die when hype fades. Exit liquidity vanished." }
        ]
    },
    {
        name: "Phantom Labs",
        ticker: "PHNTM",
        marketCap: "$8M",
        fdv: "$10M",
        liquidity: "$95K",
        unlocks: "6% quarterly",
        concentration: "12% top holder",
        narrative: "Influencer thread went viral. FOMO building.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.42, weight: 10, text: "Viral moment caused brief pump but you couldn't sell much." },
            { type: "chop", change: 0.05, weight: 20, text: "Pump faded quickly. Illiquid chop trapped holders." },
            { type: "dump", change: -0.58, weight: 70, text: "Sub-$100K liquidity means market maker dumped and price cratered." }
        ]
    },
    {
        name: "Zenith Network",
        ticker: "ZNTH",
        marketCap: "$10M",
        fdv: "$12M",
        liquidity: "$110K",
        unlocks: "7% quarterly",
        concentration: "13% top holder",
        narrative: "Partnership with mid-tier CEX announced.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.28, weight: 10, text: "CEX news pumped it but thin liquidity made exit impossible." },
            { type: "chop", change: -0.12, weight: 20, text: "Listing hype died fast. Illiquidity created volatile chop." },
            { type: "dump", change: -0.61, weight: 70, text: "CEX listing didn't fix liquidity problem. Dumped hard after initial pump." }
        ]
    },
    {
        name: "Cascade Finance",
        ticker: "CSCDFN",
        marketCap: "$9M",
        fdv: "$11M",
        liquidity: "$88K",
        unlocks: "9% quarterly",
        concentration: "15% top holder",
        narrative: "Unique tokenomics. CT researchers analyzing.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.31, weight: 10, text: "Research interest created brief pump but liquidity too thin." },
            { type: "chop", change: 0.03, weight: 20, text: "Interest faded. Illiquid tokens chop violently." },
            { type: "dump", change: -0.55, weight: 70, text: "Tokenomics don't matter if you can't trade. Dumped on thin liquidity." }
        ]
    },
    {
        name: "Mirage Protocol",
        ticker: "MIRG",
        marketCap: "$7M",
        fdv: "$9M",
        liquidity: "$72K",
        unlocks: "5% quarterly",
        concentration: "11% top holder",
        narrative: "Early gem. Getting in before everyone else.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.39, weight: 10, text: "Brief pump on discovery but couldn't exit at profit." },
            { type: "chop", change: -0.07, weight: 20, text: "Being early means trapped in illiquidity. Choppy." },
            { type: "dump", change: -0.64, weight: 70, text: "$72K liquidity = death trap. Early entry became early loss." }
        ]
    },

    // UNLOCK BOMBS (Bad setups - 10% pump, 20% chop, 70% dump)
    {
        name: "Apex Protocol",
        ticker: "APEX",
        marketCap: "$35M",
        fdv: "$180M",
        liquidity: "$2.5M",
        unlocks: "55% unlock next month",
        concentration: "11% top holder",
        narrative: "Strong fundamentals. Team executing well.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.22, weight: 10, text: "Pre-unlock speculation pumped it but selling pressure inevitable." },
            { type: "chop", change: -0.15, weight: 20, text: "Market knew unlock was coming. Traded nervously." },
            { type: "dump", change: -0.68, weight: 70, text: "55% unlock crushed price. Fundamentals couldn't save it." }
        ]
    },
    {
        name: "Infinity Labs",
        ticker: "INFLAB",
        marketCap: "$28M",
        fdv: "$150M",
        liquidity: "$2M",
        unlocks: "60% unlock in 3 weeks",
        concentration: "12% top holder",
        narrative: "Roadmap looks solid. Community optimistic.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.18, weight: 10, text: "Optimism pumped it temporarily before unlock reality hit." },
            { type: "chop", change: -0.10, weight: 20, text: "Uncertainty around unlock kept price volatile." },
            { type: "dump", change: -0.72, weight: 70, text: "60% dilution is math. Community sentiment couldn't prevent dump." }
        ]
    },
    {
        name: "Prism Network",
        ticker: "PRISM",
        marketCap: "$30M",
        fdv: "$165M",
        liquidity: "$2.2M",
        unlocks: "50% unlock in 2 weeks",
        concentration: "10% top holder",
        narrative: "Product launch successful. Users growing.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.25, weight: 10, text: "Product success created hope but unlock looming." },
            { type: "chop", change: -0.18, weight: 20, text: "Good news offset by unlock fear. Choppy action." },
            { type: "dump", change: -0.65, weight: 70, text: "User growth irrelevant when supply doubles. Dumped." }
        ]
    },
    {
        name: "Quantum DAO",
        ticker: "QNTDAO",
        marketCap: "$32M",
        fdv: "$170M",
        liquidity: "$2.4M",
        unlocks: "58% unlock next quarter",
        concentration: "13% top holder",
        narrative: "TVL increasing. Protocol healthy.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.20, weight: 10, text: "TVL growth briefly supported price before unlock." },
            { type: "chop", change: -0.12, weight: 20, text: "Healthy metrics but unlock uncertainty created chop." },
            { type: "dump", change: -0.70, weight: 70, text: "58% dilution overwhelmed positive metrics. Heavy dump." }
        ]
    },
    {
        name: "Horizon Finance",
        ticker: "HRZN",
        marketCap: "$26M",
        fdv: "$140M",
        liquidity: "$1.8M",
        unlocks: "62% unlock in 4 weeks",
        concentration: "14% top holder",
        narrative: "Partnerships announced. Ecosystem expanding.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.15, weight: 10, text: "Partnership hype provided brief relief before unlock." },
            { type: "chop", change: -0.20, weight: 20, text: "Announcements couldn't offset unlock fear. Volatile." },
            { type: "dump", change: -0.75, weight: 70, text: "62% new supply = death. Partnerships didn't matter." }
        ]
    },

    // CONCENTRATION RISKS (Bad setups - 10% pump, 20% chop, 70% dump)
    {
        name: "Omega Finance",
        ticker: "OMGFI",
        marketCap: "$18M",
        fdv: "$22M",
        liquidity: "$1.5M",
        unlocks: "6% quarterly",
        concentration: "42% top holder",
        narrative: "Community-driven. Active development.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.32, weight: 10, text: "Whale bought more. Brief pump but you're at their mercy." },
            { type: "chop", change: -0.05, weight: 20, text: "Whale holding but could dump any moment. Stressful." },
            { type: "dump", change: -0.59, weight: 70, text: "42% holder exited. Single wallet crashed the market." }
        ]
    },
    {
        name: "Cipher Labs",
        ticker: "CPHR",
        marketCap: "$16M",
        fdv: "$19M",
        liquidity: "$1.3M",
        unlocks: "7% quarterly",
        concentration: "45% top holder",
        narrative: "Privacy narrative heating up. Tech is solid.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.28, weight: 10, text: "Narrative pumped it but mega whale controls everything." },
            { type: "chop", change: -0.08, weight: 20, text: "Tech is solid but 45% concentration makes it risky." },
            { type: "dump", change: -0.62, weight: 70, text: "Whale decided to exit. Nearly half supply hit market." }
        ]
    },
    {
        name: "Nexus Labs",
        ticker: "NXLABS",
        marketCap: "$14M",
        fdv: "$17M",
        liquidity: "$1.1M",
        unlocks: "5% quarterly",
        concentration: "40% top holder",
        narrative: "Innovative protocol design. Getting attention.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.30, weight: 10, text: "Innovation attracted buyers but whale risk remains." },
            { type: "chop", change: -0.10, weight: 20, text: "Attention didn't reduce concentration risk. Volatile." },
            { type: "dump", change: -0.56, weight: 70, text: "40% holder sold. Innovation can't save you from whale exit." }
        ]
    },
    {
        name: "Vortex Protocol",
        ticker: "VRTX",
        marketCap: "$20M",
        fdv: "$24M",
        liquidity: "$1.6M",
        unlocks: "8% quarterly",
        concentration: "38% top holder",
        narrative: "Yield farming launching. APY looks good.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.26, weight: 10, text: "Farming hype pumped briefly but whale risk looms." },
            { type: "chop", change: -0.12, weight: 20, text: "Good APY but 38% concentration creates uncertainty." },
            { type: "dump", change: -0.60, weight: 70, text: "Whale sold into farming launch. 38% supply crushed price." }
        ]
    },
    {
        name: "Cobalt DAO",
        ticker: "CBLT",
        marketCap: "$15M",
        fdv: "$18M",
        liquidity: "$1.2M",
        unlocks: "6% quarterly",
        concentration: "44% top holder",
        narrative: "Team is doxxed and active. Regular updates.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.24, weight: 10, text: "Transparency helped but 44% concentration is dangerous." },
            { type: "chop", change: -0.15, weight: 20, text: "Updates don't fix whale risk. Price unstable." },
            { type: "dump", change: -0.58, weight: 70, text: "Doxxed team doesn't prevent whale dump. Price crushed." }
        ]
    },

    // NARRATIVE BIAS (Mixed setups - 30% pump, 40% chop, 30% dump)
    {
        name: "AIgenesis",
        ticker: "AIG",
        marketCap: "$48M",
        fdv: "$56M",
        liquidity: "$4M",
        unlocks: "8% annually",
        concentration: "10% top holder",
        narrative: "AI narrative exploding. Everyone buying AI tokens.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.55, weight: 30, text: "AI narrative carried it higher. Riding the wave worked this time." },
            { type: "chop", change: 0.02, weight: 40, text: "AI hype plateaued. Narrative alone wasn't enough." },
            { type: "dump", change: -0.35, weight: 30, text: "Narrative rotated out of AI. You bought the top of the trend." }
        ]
    },
    {
        name: "GameVerse",
        ticker: "GMVR",
        marketCap: "$42M",
        fdv: "$50M",
        liquidity: "$3.5M",
        unlocks: "10% annually",
        concentration: "11% top holder",
        narrative: "Gaming tokens are hot. CT rotating in.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.48, weight: 30, text: "Gaming momentum continued. Narrative play worked." },
            { type: "chop", change: -0.05, weight: 40, text: "Gaming hype cooled. Narrative-only thesis struggled." },
            { type: "dump", change: -0.38, weight: 30, text: "Gaming rotation ended. Narrative buyers got dumped on." }
        ]
    },
    {
        name: "ZK Frontier",
        ticker: "ZKF",
        marketCap: "$52M",
        fdv: "$60M",
        liquidity: "$4.5M",
        unlocks: "7% annually",
        concentration: "9% top holder",
        narrative: "ZK rollups are the future. Scaling narrative.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.51, weight: 30, text: "Scaling narrative gained momentum. Early position paid off." },
            { type: "chop", change: 0.08, weight: 40, text: "ZK narrative present but not driving price. Choppy." },
            { type: "dump", change: -0.32, weight: 30, text: "Market moved on from ZK hype. Narrative buyers trapped." }
        ]
    },
    {
        name: "RealFi Network",
        ticker: "RFI",
        marketCap: "$46M",
        fdv: "$54M",
        liquidity: "$3.8M",
        unlocks: "9% annually",
        concentration: "12% top holder",
        narrative: "RealFi is the new DeFi. Influencers posting.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.44, weight: 30, text: "Influencer wave created sustained momentum. Worked." },
            { type: "chop", change: -0.03, weight: 40, text: "Influencer posts didn't translate to sustained buying." },
            { type: "dump", change: -0.40, weight: 30, text: "By the time influencers posted, smart money was exiting." }
        ]
    },
    {
        name: "MetaWorld DAO",
        ticker: "MTWD",
        marketCap: "$50M",
        fdv: "$58M",
        liquidity: "$4.2M",
        unlocks: "11% annually",
        concentration: "10% top holder",
        narrative: "Metaverse coming back. VCs talking again.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.52, weight: 30, text: "Metaverse comeback was real this time. Narrative worked." },
            { type: "chop", change: 0.05, weight: 40, text: "VC talk didn't materialize into action. Flat." },
            { type: "dump", change: -0.36, weight: 30, text: "Metaverse false alarm. VCs didn't actually buy. Dumped." }
        ]
    },

    // MORE GOOD SETUPS
    {
        name: "Fortress Protocol",
        ticker: "FTRS",
        marketCap: "$48M",
        fdv: "$55M",
        liquidity: "$4.8M",
        unlocks: "4% quarterly",
        concentration: "7% top holder",
        narrative: "Proven track record. Two years of operation.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.43, weight: 60, text: "Track record attracted long-term capital. Steady climb." },
            { type: "chop", change: 0.06, weight: 30, text: "Reliable but no major catalysts. Range-bound." },
            { type: "dump", change: -0.21, weight: 10, text: "Even proven projects correct in bear markets." }
        ]
    },
    {
        name: "Vanguard Finance",
        ticker: "VGRD",
        marketCap: "$52M",
        fdv: "$60M",
        liquidity: "$5.2M",
        unlocks: "3% quarterly",
        concentration: "6% top holder",
        narrative: "Institutional interest growing. Treasury healthy.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.47, weight: 60, text: "Institutional buying drove steady appreciation." },
            { type: "chop", change: -0.04, weight: 30, text: "Interest present but not yet reflected in price." },
            { type: "dump", change: -0.19, weight: 10, text: "Macro selloff affected even institutionally-backed tokens." }
        ]
    },
    {
        name: "Pillar DAO",
        ticker: "PLLR",
        marketCap: "$44M",
        fdv: "$51M",
        liquidity: "$4.4M",
        unlocks: "5% quarterly",
        concentration: "8% top holder",
        narrative: "Consistent execution. Team delivers on roadmap.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.40, weight: 60, text: "Execution credibility built investor confidence. Rallied." },
            { type: "chop", change: 0.03, weight: 30, text: "Good execution but market waiting for next catalyst." },
            { type: "dump", change: -0.23, weight: 10, text: "Execution doesn't prevent macro-driven corrections." }
        ]
    },
    {
        name: "Citadel Protocol",
        ticker: "CTDL",
        marketCap: "$46M",
        fdv: "$53M",
        liquidity: "$4.6M",
        unlocks: "4% quarterly",
        concentration: "7% top holder",
        narrative: "High security standards. Multiple audits passed.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.44, weight: 60, text: "Security focus attracted risk-averse capital. Climbed steadily." },
            { type: "chop", change: 0.07, weight: 30, text: "Security important but not currently driving price." },
            { type: "dump", change: -0.20, weight: 10, text: "Security can't prevent market-wide risk-off moves." }
        ]
    },
    {
        name: "Monolith Finance",
        ticker: "MNLTH",
        marketCap: "$54M",
        fdv: "$62M",
        liquidity: "$5.4M",
        unlocks: "3% quarterly",
        concentration: "6% top holder",
        narrative: "Market leader with competitive moat.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.49, weight: 60, text: "Leadership position recognized by market. Strong rally." },
            { type: "chop", change: -0.02, weight: 30, text: "Leading position but price waiting for growth catalyst." },
            { type: "dump", change: -0.18, weight: 10, text: "Competition concerns sparked temporary selloff." }
        ]
    },

    // MORE LIQUIDITY TRAPS
    {
        name: "Nebula Labs",
        ticker: "NBLA",
        marketCap: "$11M",
        fdv: "$14M",
        liquidity: "$105K",
        unlocks: "7% quarterly",
        concentration: "14% top holder",
        narrative: "Smart contracts innovative. Tech team is strong.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.38, weight: 10, text: "Innovation hype pumped it but you're trapped in illiquidity." },
            { type: "chop", change: 0.04, weight: 20, text: "Tech doesn't fix liquidity. Price erratic and stressful." },
            { type: "dump", change: -0.60, weight: 70, text: "$105K liquidity = no exit. Innovation couldn't save you." }
        ]
    },
    {
        name: "Spark Protocol",
        ticker: "SPRK",
        marketCap: "$9M",
        fdv: "$11M",
        liquidity: "$82K",
        unlocks: "8% quarterly",
        concentration: "13% top holder",
        narrative: "Unique value proposition. Getting discovered.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.36, weight: 10, text: "Discovery phase pumped but thin liquidity trapped you." },
            { type: "chop", change: -0.10, weight: 20, text: "Value prop unclear to market. Illiquid chop continued." },
            { type: "dump", change: -0.57, weight: 70, text: "Sub-$100K liquidity destroyed exit opportunities. Dumped hard." }
        ]
    },
    {
        name: "Vertex Finance",
        ticker: "VRTXFI",
        marketCap: "$10M",
        fdv: "$13M",
        liquidity: "$98K",
        unlocks: "6% quarterly",
        concentration: "12% top holder",
        narrative: "Community fundraising for marketing push.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.40, weight: 10, text: "Marketing hype worked briefly but couldn't exit." },
            { type: "chop", change: 0.02, weight: 20, text: "Marketing spend didn't fix core liquidity issue." },
            { type: "dump", change: -0.63, weight: 70, text: "Marketing can't create exit liquidity. Trapped and dumped." }
        ]
    },
    {
        name: "Sigma Network",
        ticker: "SIGM",
        marketCap: "$8M",
        fdv: "$10M",
        liquidity: "$76K",
        unlocks: "9% quarterly",
        concentration: "15% top holder",
        narrative: "Early stage. Huge upside potential.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.45, weight: 10, text: "Upside potential lured buyers but you're stuck." },
            { type: "chop", change: -0.08, weight: 20, text: "Potential doesn't equal liquidity. Volatile and illiquid." },
            { type: "dump", change: -0.66, weight: 70, text: "$76K liquidity killed upside potential. Exit impossible." }
        ]
    },
    {
        name: "Phoenix Labs",
        ticker: "PHNX",
        marketCap: "$12M",
        fdv: "$15M",
        liquidity: "$118K",
        unlocks: "5% quarterly",
        concentration: "11% top holder",
        narrative: "Rebranding complete. New identity launched.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.33, weight: 10, text: "Rebrand created brief excitement but illiquidity remains." },
            { type: "chop", change: 0.06, weight: 20, text: "New identity didn't fix thin liquidity. Choppy." },
            { type: "dump", change: -0.54, weight: 70, text: "Rebrand is cosmetic. Liquidity problem killed it." }
        ]
    },

    // MORE UNLOCK BOMBS
    {
        name: "Radiant Protocol",
        ticker: "RDNT",
        marketCap: "$33M",
        fdv: "$175M",
        liquidity: "$2.3M",
        unlocks: "52% unlock in 5 weeks",
        concentration: "12% top holder",
        narrative: "Staking rewards attractive. Users locking tokens.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.19, weight: 10, text: "Staking temporarily supported price but unlock looms." },
            { type: "chop", change: -0.16, weight: 20, text: "Locked tokens don't prevent unlock dump. Nervous trading." },
            { type: "dump", change: -0.69, weight: 70, text: "52% unlock overwhelmed staking demand. Crushed." }
        ]
    },
    {
        name: "Stratos Finance",
        ticker: "STRS",
        marketCap: "$29M",
        fdv: "$160M",
        liquidity: "$2.1M",
        unlocks: "57% unlock next month",
        concentration: "13% top holder",
        narrative: "Community growing rapidly. Social metrics up.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.23, weight: 10, text: "Community growth provided hope before unlock." },
            { type: "chop", change: -0.14, weight: 20, text: "Social metrics don't offset dilution fear. Choppy." },
            { type: "dump", change: -0.73, weight: 70, text: "57% new supply crushed social momentum. Dumped hard." }
        ]
    },
    {
        name: "Aether Labs",
        ticker: "AETH",
        marketCap: "$31M",
        fdv: "$168M",
        liquidity: "$2.2M",
        unlocks: "54% unlock in 3 weeks",
        concentration: "11% top holder",
        narrative: "Diamond hands community. HODLers committed.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.21, weight: 10, text: "Diamond hands narrative pumped briefly before reality." },
            { type: "chop", change: -0.17, weight: 20, text: "Commitment rhetoric couldn't ease unlock concerns." },
            { type: "dump", change: -0.71, weight: 70, text: "HODLers can't stop VCs from selling. 54% unlock dumped." }
        ]
    },
    {
        name: "Frontier Protocol",
        ticker: "FRNT",
        marketCap: "$27M",
        fdv: "$145M",
        liquidity: "$1.9M",
        unlocks: "59% unlock next quarter",
        concentration: "14% top holder",
        narrative: "New features rolling out. Product improving.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.17, weight: 10, text: "Features briefly distracted from unlock threat." },
            { type: "chop", change: -0.19, weight: 20, text: "Product improvements couldn't overcome unlock fear." },
            { type: "dump", change: -0.74, weight: 70, text: "59% dilution killed momentum. Features didn't matter." }
        ]
    },
    {
        name: "Nebula Finance",
        ticker: "NBLFI",
        marketCap: "$34M",
        fdv: "$185M",
        liquidity: "$2.6M",
        unlocks: "56% unlock in 2 months",
        concentration: "10% top holder",
        narrative: "Revenue model validated. Cash flow positive.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.24, weight: 10, text: "Positive cash flow bought time but unlock coming." },
            { type: "chop", change: -0.13, weight: 20, text: "Revenue didn't eliminate unlock concerns. Volatile." },
            { type: "dump", change: -0.67, weight: 70, text: "Cash flow can't prevent 56% supply increase. Dumped." }
        ]
    },

    // MORE CONCENTRATION RISKS
    {
        name: "Titanium DAO",
        ticker: "TTNM",
        marketCap: "$17M",
        fdv: "$21M",
        liquidity: "$1.4M",
        unlocks: "7% quarterly",
        concentration: "41% top holder",
        narrative: "Governance active. Proposals passing regularly.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.29, weight: 10, text: "Active governance attracted buyers but whale controls fate." },
            { type: "chop", change: -0.11, weight: 20, text: "Proposals don't reduce 41% concentration risk. Unstable." },
            { type: "dump", change: -0.61, weight: 70, text: "Whale exited despite active governance. 41% supply dumped." }
        ]
    },
    {
        name: "Pulse Labs",
        ticker: "PLS",
        marketCap: "$19M",
        fdv: "$23M",
        liquidity: "$1.5M",
        unlocks: "6% quarterly",
        concentration: "43% top holder",
        narrative: "Token burn scheduled. Supply reduction coming.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.27, weight: 10, text: "Burn hype pumped briefly but whale still in control." },
            { type: "chop", change: -0.13, weight: 20, text: "Burns don't fix concentration. Price uncertain." },
            { type: "dump", change: -0.63, weight: 70, text: "43% holder sold before burn. Concentration killed it." }
        ]
    },
    {
        name: "Meridian Protocol",
        ticker: "MERI",
        marketCap: "$21M",
        fdv: "$25M",
        liquidity: "$1.7M",
        unlocks: "5% quarterly",
        concentration: "39% top holder",
        narrative: "Security audits clean. No vulnerabilities found.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.31, weight: 10, text: "Security confidence helped but whale risk remains." },
            { type: "chop", change: -0.09, weight: 20, text: "Clean audits don't eliminate 39% concentration. Volatile." },
            { type: "dump", change: -0.58, weight: 70, text: "Security means nothing when whale dumps. 39% sold." }
        ]
    },
    {
        name: "Obsidian Finance",
        ticker: "OBSD",
        marketCap: "$16M",
        fdv: "$20M",
        liquidity: "$1.3M",
        unlocks: "8% quarterly",
        concentration: "37% top holder",
        narrative: "Liquidity locked. Rug-proof design.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.25, weight: 10, text: "Locked liquidity attracted buyers but token concentrated." },
            { type: "chop", change: -0.14, weight: 20, text: "LP locked but 37% token concentration still risky." },
            { type: "dump", change: -0.59, weight: 70, text: "37% holder dumped token. LP lock didn't help." }
        ]
    },
    {
        name: "Quantum Labs",
        ticker: "QNTM",
        marketCap: "$18M",
        fdv: "$22M",
        liquidity: "$1.4M",
        unlocks: "6% quarterly",
        concentration: "40% top holder",
        narrative: "Partnerships with multiple protocols.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.28, weight: 10, text: "Partnership announcements pumped but whale in control." },
            { type: "chop", change: -0.12, weight: 20, text: "Partnerships don't reduce 40% concentration. Uncertain." },
            { type: "dump", change: -0.60, weight: 70, text: "40% whale sold into partnership news. Trapped holders." }
        ]
    },

    // MORE NARRATIVE BIAS
    {
        name: "NexGen Finance",
        ticker: "NXGN",
        marketCap: "$44M",
        fdv: "$52M",
        liquidity: "$3.6M",
        unlocks: "9% annually",
        concentration: "11% top holder",
        narrative: "Modular blockchain narrative. Next cycle's theme.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.50, weight: 30, text: "Modular narrative gained traction. Theme investing worked." },
            { type: "chop", change: 0.04, weight: 40, text: "Theme present but not driving this specific token." },
            { type: "dump", change: -0.34, weight: 30, text: "Modular hype faded. You bought the narrative peak." }
        ]
    },
    {
        name: "Orion Protocol",
        ticker: "ORION",
        marketCap: "$40M",
        fdv: "$48M",
        liquidity: "$3.2M",
        unlocks: "10% annually",
        concentration: "12% top holder",
        narrative: "Infrastructure play. Essential for ecosystem.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.46, weight: 30, text: "Infrastructure thesis played out. Essential = valuable." },
            { type: "chop", change: -0.06, weight: 40, text: "Infrastructure important but price not reflecting it." },
            { type: "dump", change: -0.37, weight: 30, text: "'Essential' narrative doesn't guarantee returns. Dumped." }
        ]
    },
    {
        name: "Stellar Labs",
        ticker: "STLR",
        marketCap: "$49M",
        fdv: "$57M",
        liquidity: "$4.1M",
        unlocks: "8% annually",
        concentration: "10% top holder",
        narrative: "Interoperability narrative. Cross-chain future.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.53, weight: 30, text: "Cross-chain narrative momentum built. Riding wave worked." },
            { type: "chop", change: 0.07, weight: 40, text: "Interoperability buzz didn't translate to price action." },
            { type: "dump", change: -0.33, weight: 30, text: "Market rotated away from interop. Narrative buyers trapped." }
        ]
    },
    {
        name: "DegenFi",
        ticker: "DGNFI",
        marketCap: "$38M",
        fdv: "$46M",
        liquidity: "$3M",
        unlocks: "11% annually",
        concentration: "13% top holder",
        narrative: "Meme narrative returning. Degen season starting.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.58, weight: 30, text: "Degen season was real. Meme momentum carried it." },
            { type: "chop", change: 0.03, weight: 40, text: "Meme hype lukewarm. Narrative didn't sustain." },
            { type: "dump", change: -0.41, weight: 30, text: "Degen season ended quickly. Late buyers got rekt." }
        ]
    },
    {
        name: "SocialChain",
        ticker: "SOCL",
        marketCap: "$43M",
        fdv: "$51M",
        liquidity: "$3.5M",
        unlocks: "9% annually",
        concentration: "11% top holder",
        narrative: "SocialFi wave. Web3 social coming.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.49, weight: 30, text: "SocialFi wave lifted all boats. Narrative timing right." },
            { type: "chop", change: -0.04, weight: 40, text: "Web3 social buzz present but price flat." },
            { type: "dump", change: -0.36, weight: 30, text: "SocialFi hype cycle ended. You rode it down." }
        ]
    },

    // ADDITIONAL MIXED SCENARIOS
    {
        name: "Apex Network",
        ticker: "APXN",
        marketCap: "$25M",
        fdv: "$80M",
        liquidity: "$1.8M",
        unlocks: "32% unlock in 8 weeks",
        concentration: "16% top holder",
        narrative: "Bullish CT sentiment. Lots of discussion.",
        correctFactor: "unlocks",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.35, weight: 30, text: "Sentiment pumped it before unlock concerns set in." },
            { type: "chop", change: -0.10, weight: 40, text: "CT buzz couldn't overcome unlock uncertainty." },
            { type: "dump", change: -0.48, weight: 30, text: "32% unlock hit. CT sentiment didn't prevent dump." }
        ]
    },
    {
        name: "Velocity Protocol",
        ticker: "VLCTY",
        marketCap: "$22M",
        fdv: "$90M",
        liquidity: "$1.6M",
        unlocks: "38% unlock next quarter",
        concentration: "15% top holder",
        narrative: "Product launched successfully. Usage growing.",
        correctFactor: "unlocks",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.30, weight: 30, text: "Product success outweighed unlock fear short-term." },
            { type: "chop", change: -0.12, weight: 40, text: "Growth positive but unlock created uncertainty." },
            { type: "dump", change: -0.52, weight: 30, text: "38% dilution overwhelmed product momentum." }
        ]
    },
    {
        name: "Crimson Labs",
        ticker: "CRSN",
        marketCap: "$13M",
        fdv: "$16M",
        liquidity: "$800K",
        unlocks: "8% quarterly",
        concentration: "26% top holder",
        narrative: "Whale just accumulated. Following smart money.",
        correctFactor: "concentration",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.38, weight: 30, text: "Whale bought more. Price followed smart money up." },
            { type: "chop", change: -0.08, weight: 40, text: "Whale holding but not adding. Price stagnant." },
            { type: "dump", change: -0.45, weight: 30, text: "Smart money exited. Following whales can backfire." }
        ]
    },
    {
        name: "Twilight Finance",
        ticker: "TWLT",
        marketCap: "$14M",
        fdv: "$17M",
        liquidity: "$900K",
        unlocks: "7% quarterly",
        concentration: "28% top holder",
        narrative: "Long-term accumulation zone. Building position.",
        correctFactor: "concentration",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.34, weight: 30, text: "Accumulation phase worked. Support held and rallied." },
            { type: "chop", change: -0.06, weight: 40, text: "Accumulation didn't prevent 28% concentration risk." },
            { type: "dump", change: -0.42, weight: 30, text: "28% holder dumped. Accumulation zone broken." }
        ]
    },

    // FINAL BATCH - VARIETY
    {
        name: "Zenith Finance",
        ticker: "ZNTHFI",
        marketCap: "$47M",
        fdv: "$54M",
        liquidity: "$4.5M",
        unlocks: "4% quarterly",
        concentration: "8% top holder",
        narrative: "Sustainable yield model. Real revenue.",
        correctFactor: "sizing",
        riskProfile: "good",
        outcomes: [
            { type: "pump", change: 0.42, weight: 60, text: "Sustainable model attracted serious capital. Rallied." },
            { type: "chop", change: 0.04, weight: 30, text: "Revenue solid but market waiting for acceleration." },
            { type: "dump", change: -0.22, weight: 10, text: "Even sustainable models correct in risk-off." }
        ]
    },
    {
        name: "Catalyst Protocol",
        ticker: "CTLST",
        marketCap: "$6M",
        fdv: "$8M",
        liquidity: "$68K",
        unlocks: "10% quarterly",
        concentration: "16% top holder",
        narrative: "Hidden gem. Not discovered yet.",
        correctFactor: "liquidity",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.41, weight: 10, text: "Discovery pumped it violently but exit impossible." },
            { type: "chop", change: -0.09, weight: 20, text: "Hidden gem = hidden liquidity. Price erratic." },
            { type: "dump", change: -0.65, weight: 70, text: "$68K liquidity = hidden trap. Gem became loss." }
        ]
    },
    {
        name: "Dynasty Finance",
        ticker: "DYNFI",
        marketCap: "$24M",
        fdv: "$125M",
        liquidity: "$1.7M",
        unlocks: "48% unlock in 6 weeks",
        concentration: "14% top holder",
        narrative: "Partnerships expanding. Ecosystem growing.",
        correctFactor: "unlocks",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.20, weight: 10, text: "Partnerships briefly supported price before unlock." },
            { type: "chop", change: -0.18, weight: 20, text: "Growth offset by unlock fear. Choppy and nervous." },
            { type: "dump", change: -0.70, weight: 70, text: "48% unlock destroyed partnership momentum." }
        ]
    },
    {
        name: "Elysium Protocol",
        ticker: "ELYS",
        marketCap: "$15M",
        fdv: "$19M",
        liquidity: "$1.2M",
        unlocks: "9% quarterly",
        concentration: "35% top holder",
        narrative: "Community very engaged. Active Discord.",
        correctFactor: "concentration",
        riskProfile: "bad",
        outcomes: [
            { type: "pump", change: 0.26, weight: 10, text: "Engagement helped but 35% concentration looms." },
            { type: "chop", change: -0.11, weight: 20, text: "Active community can't fix whale risk. Volatile." },
            { type: "dump", change: -0.57, weight: 70, text: "35% holder dumped. Discord couldn't prevent it." }
        ]
    },
    {
        name: "Lumina Network",
        ticker: "LMNA",
        marketCap: "$51M",
        fdv: "$59M",
        liquidity: "$4.3M",
        unlocks: "7% annually",
        concentration: "9% top holder",
        narrative: "Layer 1 season coming. L1s rotating back in.",
        correctFactor: "narrative",
        riskProfile: "mixed",
        outcomes: [
            { type: "pump", change: 0.54, weight: 30, text: "L1 rotation was real. Sector momentum carried it." },
            { type: "chop", change: 0.06, weight: 40, text: "L1 talk present but not yet impacting price." },
            { type: "dump", change: -0.35, weight: 30, text: "L1 season delayed. Narrative buyers trapped." }
        ]
    }
];

// ============================================
// ANSWER OPTIONS
// ============================================

const researchFactors = [
    { id: "liquidity", label: "Liquidity risk" },
    { id: "unlocks", label: "Unlock / vesting risk" },
    { id: "concentration", label: "Holder concentration" },
    { id: "narrative", label: "Narrative bias" },
    { id: "sizing", label: "Position sizing discipline" }
];

// ============================================
// DOM ELEMENTS
// ============================================

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

const startBtn = document.getElementById('startBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

const portfolioValue = document.getElementById('portfolioValue');
const portfolioPnL = document.getElementById('portfolioPnL');

const tokenName = document.getElementById('tokenName');
const tokenTicker = document.getElementById('tokenTicker');
const marketCap = document.getElementById('marketCap');
const fdv = document.getElementById('fdv');
const liquidity = document.getElementById('liquidity');
const unlocks = document.getElementById('unlocks');
const concentration = document.getElementById('concentration');
const narrative = document.getElementById('narrative');

const researchSection = document.getElementById('researchSection');
const optionsContainer = document.getElementById('optionsContainer');

const allocationSection = document.getElementById('allocationSection');
const availableCapital = document.getElementById('availableCapital');
const allocationAmount = document.getElementById('allocationAmount');

const outcomeSection = document.getElementById('outcomeSection');
const outcomeLabel = document.getElementById('outcomeLabel');
const outcomeChange = document.getElementById('outcomeChange');
const outcomeText = document.getElementById('outcomeText');
const positionPnL = document.getElementById('positionPnL');

const roundCounter = document.getElementById('roundCounter');

const finalPortfolio = document.getElementById('finalPortfolio');
const finalPnL = document.getElementById('finalPnL');
const finalRounds = document.getElementById('finalRounds');
const gameOverTitle = document.getElementById('gameOverTitle');

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(percent) {
    const sign = percent >= 0 ? '+' : '';
    return sign + (percent * 100).toFixed(1) + '%';
}

function updatePortfolioDisplay() {
    portfolioValue.textContent = formatCurrency(currentPortfolio);
    
    const pnlAmount = currentPortfolio - STARTING_CAPITAL;
    const pnlPercent = (pnlAmount / STARTING_CAPITAL);
    
    portfolioPnL.textContent = formatCurrency(pnlAmount) + ' (' + formatPercent(pnlPercent) + ')';
    portfolioPnL.classList.remove('positive', 'negative');
    
    if (pnlAmount > 0) {
        portfolioPnL.classList.add('positive');
    } else if (pnlAmount < 0) {
        portfolioPnL.classList.add('negative');
    }
}

function selectWeightedOutcome(outcomes) {
    const totalWeight = outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const outcome of outcomes) {
        random -= outcome.weight;
        if (random <= 0) {
            return outcome;
        }
    }
    
    return outcomes[outcomes.length - 1];
}

// ============================================
// GAME LOGIC
// ============================================

function startGame() {
    currentPortfolio = STARTING_CAPITAL;
    currentRound = 0;
    usedTokens = [];
    
    updatePortfolioDisplay();
    
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    loadNextRound();
}

function loadNextRound() {
    // Check if portfolio is wiped out
    if (currentPortfolio <= 100) {
        showGameOver('Portfolio Wiped Out');
        return;
    }
    
    currentRound++;
    roundCounter.textContent = `Round ${currentRound}`;
    
    // Get unused token
    const availableTokens = tokenDatabase.filter(token => !usedTokens.includes(token));
    
    if (availableTokens.length === 0) {
        usedTokens = [];
        availableTokens.push(...tokenDatabase);
    }
    
    // Select random token
    currentToken = availableTokens[Math.floor(Math.random() * availableTokens.length)];
    usedTokens.push(currentToken);
    
    // Reset selections
    selectedResearchFactor = null;
    selectedAllocationPercent = null;
    
    // Display token
    displayToken(currentToken);
    
    // Show research section
    renderResearchOptions();
    researchSection.style.display = 'block';
    
    // Hide allocation and outcome sections
    allocationSection.classList.add('hidden');
    outcomeSection.classList.add('hidden');
}

function displayToken(token) {
    tokenName.textContent = token.name;
    tokenTicker.textContent = token.ticker;
    marketCap.textContent = token.marketCap;
    fdv.textContent = token.fdv;
    liquidity.textContent = token.liquidity;
    unlocks.textContent = token.unlocks;
    concentration.textContent = token.concentration;
    narrative.textContent = token.narrative;
}

function renderResearchOptions() {
    optionsContainer.innerHTML = '';
    
    researchFactors.forEach(factor => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = factor.label;
        btn.onclick = () => handleResearchSelection(factor.id);
        optionsContainer.appendChild(btn);
    });
}

function handleResearchSelection(factorId) {
    selectedResearchFactor = factorId;
    
    // Mark selected
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === researchFactors.find(f => f.id === factorId).label) {
            btn.classList.add('selected');
        }
    });
    
    // Show allocation section
    showAllocationSection();
}

function showAllocationSection() {
    availableCapital.textContent = formatCurrency(currentPortfolio);
    allocationAmount.textContent = '$0';
    
    allocationSection.classList.remove('hidden');
    
    // Set up allocation buttons
    const allocationBtns = document.querySelectorAll('.allocation-btn');
    allocationBtns.forEach(btn => {
        btn.classList.remove('selected');
        btn.onclick = () => handleAllocationSelection(parseInt(btn.dataset.percent));
    });
}

function handleAllocationSelection(percent) {
    selectedAllocationPercent = percent;
    
    // Mark selected
    const buttons = document.querySelectorAll('.allocation-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.percent) === percent) {
            btn.classList.add('selected');
        }
    });
    
    // Update preview
    const allocAmount = currentPortfolio * (percent / 100);
    allocationAmount.textContent = formatCurrency(allocAmount);
    
    // Execute trade after short delay
    setTimeout(() => executeTrade(), 800);
}

function executeTrade() {
    // Calculate position size
    const positionSize = currentPortfolio * (selectedAllocationPercent / 100);
    
    // Select outcome based on token risk profile
    const outcome = selectWeightedOutcome(currentToken.outcomes);
    
    // Calculate P&L
    const positionPnL = positionSize * outcome.change;
    currentPortfolio += positionPnL;
    
    // Update display
    updatePortfolioDisplay();
    
    // Show outcome
    showOutcome(outcome, positionSize, positionPnL);
}

function showOutcome(outcome, positionSize, pnl) {
    // Hide previous sections
    researchSection.style.display = 'none';
    allocationSection.classList.add('hidden');
    
    // Set outcome label
    outcomeLabel.textContent = outcome.type.charAt(0).toUpperCase() + outcome.type.slice(1);
    outcomeLabel.className = 'outcome-label ' + outcome.type;
    
    // Set outcome change
    outcomeChange.textContent = formatPercent(outcome.change);
    outcomeChange.className = 'outcome-change ' + (outcome.change >= 0 ? 'positive' : 'negative');
    
    // Build outcome text
    let feedbackText = outcome.text;
    
    // Add research factor feedback
    if (selectedResearchFactor === currentToken.correctFactor) {
        if (outcome.type === 'pump') {
            feedbackText += " You identified the right factor and sized appropriately.";
        } else if (outcome.type === 'chop') {
            feedbackText += " Your research was correct, but the market didn't cooperate.";
        } else {
            feedbackText += " Even correct research doesn't guarantee wins. Markets are unpredictable.";
        }
    } else {
        feedbackText += ` The key factor was ${researchFactors.find(f => f.id === currentToken.correctFactor).label.toLowerCase()}.`;
    }
    
    outcomeText.textContent = feedbackText;
    
    // Set position P&L
    positionPnL.textContent = formatCurrency(pnl) + ' (' + formatPercent(pnl / positionSize) + ')';
    positionPnL.className = 'impact-value ' + (pnl >= 0 ? 'positive' : 'negative');
    
    // Show outcome section
    outcomeSection.classList.remove('hidden');
}

function showGameOver(reason) {
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');
    
    gameOverTitle.textContent = reason;
    finalPortfolio.textContent = formatCurrency(currentPortfolio);
    
    const totalPnL = currentPortfolio - STARTING_CAPITAL;
    const pnlPercent = (totalPnL / STARTING_CAPITAL);
    finalPnL.textContent = formatCurrency(totalPnL) + ' (' + formatPercent(pnlPercent) + ')';
    finalPnL.className = 'value ' + (totalPnL >= 0 ? 'positive' : 'negative');
    
    finalRounds.textContent = currentRound;
}

function resetGame() {
    if (confirm('Are you sure you want to reset? Your current progress will be lost.')) {
        currentPortfolio = STARTING_CAPITAL;
        currentRound = 0;
        usedTokens = [];
        updatePortfolioDisplay();
        loadNextRound();
    }
}

function playAgain() {
    gameOverScreen.classList.remove('active');
    startScreen.classList.add('active');
}

// ============================================
// EVENT LISTENERS
// ============================================

startBtn.addEventListener('click', startGame);
nextRoundBtn.addEventListener('click', loadNextRound);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', playAgain);

// ============================================
// INITIALIZE
// ============================================

// Game starts on start screen
