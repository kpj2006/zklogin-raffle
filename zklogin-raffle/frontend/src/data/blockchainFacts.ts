export interface BlockchainFact {
  id: string;
  title: string;
  description: string;
  category: 'technology' | 'history' | 'economics' | 'fun';
  source?: string;
}

export const blockchainFacts: BlockchainFact[] = [
  {
    id: '1',
    title: 'First Bitcoin Transaction',
    description: 'The first Bitcoin transaction was made on January 12, 2009, when Satoshi Nakamoto sent 10 bitcoins to Hal Finney.',
    category: 'history',
  },
  {
    id: '2',
    title: 'Pizza for Bitcoin',
    description: 'The first commercial Bitcoin transaction was for 2 pizzas costing 10,000 BTC on May 22, 2010 - now worth hundreds of millions!',
    category: 'fun',
  },
  {
    id: '3',
    title: 'Sui\'s Parallel Execution',
    description: 'Sui can process thousands of transactions in parallel thanks to its object-centric data model and Move programming language.',
    category: 'technology',
  },
  {
    id: '4',
    title: 'zkLogin Innovation',
    description: 'Sui\'s zkLogin allows users to create wallets using familiar OAuth providers like Google and Facebook without compromising privacy.',
    category: 'technology',
  },
  {
    id: '5',
    title: 'Gas Fee Economics',
    description: 'On Sui, gas fees are predictable and low because of efficient execution and the ability to sponsor transactions for users.',
    category: 'economics',
  },
  {
    id: '6',
    title: 'Storage Rebates',
    description: 'Sui incentivizes developers to clean up unused objects by providing storage rebates when data is deleted from the blockchain.',
    category: 'economics',
  },
  {
    id: '7',
    title: 'Move Language Safety',
    description: 'Move\'s resource-oriented programming model prevents common smart contract vulnerabilities like reentrancy attacks.',
    category: 'technology',
  },
  {
    id: '8',
    title: 'Consensus Innovation',
    description: 'Sui uses a novel consensus mechanism that can bypass consensus for simple transactions, enabling sub-second finality.',
    category: 'technology',
  },
  {
    id: '9',
    title: 'NFT Standards',
    description: 'The first NFT was created in 2014 on Bitcoin, but Ethereum\'s ERC-721 standard in 2017 made NFTs mainstream.',
    category: 'history',
  },
  {
    id: '10',
    title: 'Cryptographic Proofs',
    description: 'Zero-knowledge proofs allow you to prove you know something without revealing what you know - like proving your age without showing your birthday.',
    category: 'technology',
  },
  {
    id: '11',
    title: 'Blockchain Energy',
    description: 'Proof-of-Stake blockchains like Sui use 99.95% less energy than Bitcoin\'s Proof-of-Work consensus mechanism.',
    category: 'economics',
  },
  {
    id: '12',
    title: 'Smart Contract Origin',
    description: 'The term "smart contract" was coined by cryptographer Nick Szabo in 1994, years before blockchain technology existed.',
    category: 'history',
  },
  {
    id: '13',
    title: 'Sponsored Transactions',
    description: 'On Sui, applications can pay gas fees on behalf of users, enabling gasless user experiences like traditional web apps.',
    category: 'technology',
  },
  {
    id: '14',
    title: 'Validator Economics',
    description: 'Sui validators are incentivized through both transaction fees and storage fund rewards, aligning long-term network health.',
    category: 'economics',
  },
  {
    id: '15',
    title: 'Cross-Chain Future',
    description: 'The future of blockchain is multi-chain, with protocols like IBC and bridges enabling seamless asset transfers between networks.',
    category: 'technology',
  },
  {
    id: '16',
    title: 'Randomness on Blockchain',
    description: 'Generating true randomness on deterministic blockchains is challenging - Sui uses verifiable random functions (VRFs) for fair randomness.',
    category: 'technology',
  },
  {
    id: '17',
    title: 'DeFi Innovation',
    description: 'Decentralized Finance (DeFi) has recreated traditional financial instruments like loans, insurance, and derivatives on blockchain.',
    category: 'economics',
  },
  {
    id: '18',
    title: 'Lost Bitcoin',
    description: 'An estimated 3-4 million Bitcoin (worth billions) are lost forever due to forgotten private keys and lost hardware wallets.',
    category: 'fun',
  },
  {
    id: '19',
    title: 'Blockchain Immutability',
    description: 'Once data is written to a blockchain and confirmed by the network, it becomes practically impossible to alter or delete.',
    category: 'technology',
  },
  {
    id: '20',
    title: 'Web3 Identity',
    description: 'Blockchain enables self-sovereign identity where users control their own data without relying on centralized authorities.',
    category: 'technology',
  },
];

export function getRandomFact(): BlockchainFact {
  const randomIndex = Math.floor(Math.random() * blockchainFacts.length);
  return blockchainFacts[randomIndex];
}

export function getFactsByCategory(category: BlockchainFact['category']): BlockchainFact[] {
  return blockchainFacts.filter(fact => fact.category === category);
}
