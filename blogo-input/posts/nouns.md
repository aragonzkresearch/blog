# Nouns Private Voting Research Sprint - General Report

*2022-08-21 by AZKR*

## 1 Abstract

This document is a summary report detailing the results of the joint implementation between Aragon ZK Research Association and Aztec Labs to implement a private voting proof of concept (PoC) for NounsDAO. These two organizations submitted a joint proposal to the NounsDAO [Private Voting Research Sprint](https://prop.house/nouns/private-voting-research-sprint) and have been working closely together on the implementation. This summary report also describes what remains to be done to achieve a private voting MVP for Nouns DAO, and makes an estimation of the efforts required to do so.


## 2 Introduction

In February 2023, the [Nouns DAO](https://nouns.wtf/) launched a call for proposals to fund 3 research projects – "Calling all ZK/cryptography researchers to research solutions to private voting for Nouns DAO and beyond!"[^1]. The set of requirements that the solutions had to meet made the challenge enormous. 

[Aragon ZK Research Association (AZKR)](https://research.aragon.org/) has been doing research on e-voting since early 2022. Our experience indicated that the use of Storage Proofs would lead to an elegant design for a private voting implementation. However, the major obstacle at the time was that, to the best of our knowledge, there were no production-ready software solutions implementing such proofs. Building on previous collaborative work between AZKR and [Aztec Labs](https://aztec.network/), this research sprint presented an ideal scenario to tackle the challenge. Aztec Labs focused on the core research regarding the technology and necessary primitives that would unlock storage proofs in Noir, Rust-based programming language enabling safe, seamless construction of privacy-preserving zero-knowledge circuits, while AZKR focused on the design and implementation of a comprehensive voting solution leveraging these proofs.

Under this premise, our teams created a [joint proposal](https://prop.house/nouns/private-voting-research-sprint/3954), which received the second most votes from NounsDAO holders  (thus, becoming one of the three proposals that were formally selected). During the execution phase of the last 3 months, we have issued 4 progress reports and have had 3 meetings with the sponsor; one at the beginning, one at mid term, and one at the end. 

For technical details, this report references our final technical report, which is part of the deliverables of this project. Along the development phase, we have made several modifications to the initial proposed design to accommodate our findings and to incorporate comments we have received from third parties. In this report, we only refer to the latest versions of the design and of the implementations.


## 3 Research questions

The main goal of any research project is to answer a set of research questions and shed light on the next steps (e.g. the remaining unanswered research questions). To this end, making some progress in the state of the art is usually required. In our case, we formalized the research questions as follows:



1. Up to which point is it possible to build a **user-friendly**, **trustless** (decentralized), **fair** (no one can count votes before a given time), **weighed** (voting power depends on the amount of tokens hold/delegated) and **ballot-secret** (it is impossible to link a voter with a choice) voting system in Ethereum?
2. If all these properties cannot be met at once, which are incompatible and why?
3. If all these properties cannot be met at once, what are the recommended trade-offs  and why?
4. What is needed to make the recommended combination available to the Nouns community? (Resources needed, roadmap, etc.)

The expected progress in the state of the art was twofold:



1. Advances in storage proof technology.
2. Leverage these advances to finally achieve an e-voting system with a set of clearly-defined properties that had never been implemented together before our project.. More precisely, our main priority was to meet the following properties jointly: ballot-secrecy and fairness in a highly trustless manner. We believe that these are the hardest properties to put together – thus, these are the right ones to start from for creating a base system, and once these are met, it should be possible to achieve additional properties through modifications and enhancements of this base system.


## 4 Methodology

The methodology we wanted to apply was eminently practical. We also foresaw the production of some software Proofs of Concept (PoC) and experimental libraries. For clarity, PoCs are experimental code with command line interface (CLI).


## 5 Outputs

The project has the following main deliverables:



1. Documentation
    1. **This report**, which has the answers to our research questions and can be used as a hub to the rest of outputs of the project.
    2. The [**Final technical report**](nouns-tech.html), which provides the technicalities of the work done.
    3. The [Timelock.zone blog post](https://research.aragon.org/timelock.html).
    4. The [Interim Progress reports](https://hackmd.io/130yRfVARSC5AU5aT2w8Lw).
2. Software
    5. The following experimental software repositories maintained by AZKR:
        1. **[Nouns-anonymous-voting](https://github.com/aragonzkresearch/nouns-anonymous-voting)**: voter client library, tally CLI, and smart contracts (including zkRegistry)
        2. **[Noir-trie-proofs](https://github.com/aragonzkresearch/noir-trie-proofs)**: RLP decoding and Ethereum state and storage proof verification in Noir
        3. **[tlcs-c](https://github.com/aragonzkresearch/tlcs-c)**: Timelock Cryptographic Service Protocol C implementation (currently used in Timelock.zone)
        4. **[tlcs-rust](https://github.com/aragonzkresearch/tlcs-rust)**: Timelock Cryptographic Service Protocol rust implementation (to be used in Timelock.zone when put in production)
        5. **[tlcs-chain](https://github.com/aragonzkresearch/tlcs-chain)**: Cosmos Blockchain which provides a Time Lock Cryptography Service
        6. **[zk-registry-ui](https://github.com/aragonzkresearch/zk-registry-ui-demo)**: Simple web UI for users to register their keys in the ZK Registry smart contract. Relies on MetaMask.
    6. A few highlights of what Aztec Labs R&D’d as a part of the sprint:
        7. **[UltraPlonk in Noir](https://github.com/noir-lang/noir/pull/1114)**: Improvements in the proving speed of Noir programs with an UltraPlonk proving system with optimizations like custom gates and lookup tables.
        8. **[Recursive Aggregation in Noir](https://github.com/noir-lang/noir/blob/9b417da0eef28a29dbe0f339ee19b8dd9859dc4d/noir_stdlib/src/lib.nr#L27-L28)**: Unlocks aggregation of multiple proofs into one and unlocks parallel proving for further speed-ups. For this research particularly, it unlocks proving of complex Noir programs (e.g. Ethereum storage proofs) in web browsers, circumventing memory limits in web browsers through incremental proving.
        9. **[Keccak256 in Noir](https://github.com/noir-lang/noir/pull/1249)**: Unlocks proving of Keccak256 hashes (commonly seen on Ethereum, both within its architecture as well as across smart contracts). For this research particularly it unlocks Ethereum storage proofs in Noir which taps into Ethereum’s architecture that uses Keccak256 hashes.
        10. **[ECDSA verification in Noir](https://github.com/noir-lang/noir/pull/1294)**: Unlocks verifying of Ethereum wallet signatures directly in Noir, smoothening users’ experience with the authentication of ZK dApps transactions (e.g. authenticating votes in this research).
        11. **Technical optimizations**: a considerable number of optimizations were also introduced in both Noir and UltraPlonk to unlock the use case of research, including but not limited to [plookup dynamic arrays](https://github.com/noir-lang/noir/pull/1282), [multi-threaded proving](https://github.com/AztecProtocol/barretenberg/pull/434), [low constraint Recursive Aggregation](https://github.com/AztecProtocol/barretenberg/pull/414), etc. 
3. Demos:
    7. [All in one](https://demo.azkr.ch/nouns-full-voting-process-with-web.mp4)
    8. [CLI](https://hackmd.io/5vFz0a1BRTikynTf7ga-eg?view) 
    9. [ZK Registry](https://www.timelock.zone/MakeKeysAndRegister.mp4)
    10. [Timelock.zone](https://www.timelock.zone/TLCS-Nouns-Slideshow-1080p.mp4)
4. Services:
    11. zkRegistry: [https://zkreg.com/](https://zkreg.com/) 
    12. Timelock.zone: [https://www.timelock.zone/](https://www.timelock.zone/) 


## 6 User flow

This section outlines how a voting process using the POC code would work in practice. 



1.  **Wallet registration (strictly only once per wallet)**: 

    Every wallet must have been registered before the voting process is created. This must only be done once per address. The owner of the wallet does not need to save any extra data because the key pair is generated deterministically.


    Connect metamask to the zkRegistry [webapp](https://zkreg.com/keygen), register the public key, and copy the private key (needed for voting).

2.  **Voting process setup (a.k.a Proposal creation)**: 

    Anyone can create a voting process. Note: Additional logic can be easily implemented at the smart contract level, like limiting to only wallets with either owned or delegated NFTs.


    Voting process creation is done via CLI with the `create-process` subcommand. An IPFS ID can be provided to bind the process to certain information.

3.  **Vote cast**: 

    Registered wallets that meet the eligibility requirements (i.e. holding NFTs -either non-delegated owned or delegated, at the time of the process creation) can generate a ballot and the corresponding proofs. The vote can be submitted to the voting Nouns voting smart contract (VSC) during the voting period. Vote generation (ballot + proofs)  and submission are performed together through  the CLI. Each wallet can vote only once per voting process with the full weight of their voting power (it is not possible to split the vote between options).


    Done via CLI with the `vote` subcommand.

4. **Tally**:

    After the voting period ends and the decryption key is released anyone can verify the outcome of the voting process by tallying the results. This is done via CLI with the `tally` subcommand. The subcomand does not return an output if called before the end of the voting period.



## 7 Formal properties

Technically speaking, we were looking for an e-voting system with the following properties:



* **Ballot secrecy** It is impossible to link a voter with a choice.
* **Eligibility** Only legitimate voters can vote.
* **Eligibility verifiability** Anyone can verify that each vote in the set of all cast votes was cast by an eligible voter.
* **Fairness** No early results can be obtained which could influence the remaining voters.
* **Individual verifiability (IV)** A voter can verify that their vote is included in the set of all cast votes.
* **Proxy** **vote** An eligible voter may delegate their voting power to a representative.
* **Robustness** The system should be robust to a certain degree of malfunction or corruption and still deliver correct results.
* **Unconditional privacy** Nobody should be able to learn any additional information even several centuries after the voting process.
* **Universal verifiability (UV)** Anyone can check that the election outcome corresponds to the ballots published on the bulletin board.
* **Uniqueness** No voter should be able to vote more than one time.
* **Weighted voting** Votes inherently vary in strength depending on the voter.

We also wanted the system to fulfill the following requirements:



* **Eligible voters:** Nouns DAO NFT holders or delegates
* **Census creation:** Automatic
* **Choices:** _yes, no, abstain_
* **Multisig support**
* **Hardware wallets support: **in addition to software wallets such as MetaMask
* **Voting steps:** minimize; ideally 1, directly to Ethereum
* **Voting process execution:** Automatic after an initial manual setup
* **Output:** The tally (no further actions required)
* **Optimistic approach:** discouraged

Security assumptions:



* Same as in Ethereum.
* Fairness also depends on [League of Entropy](https://www.cloudflare.com/leagueofentropy/).

## 8 Main deviations


### 8.1 Deviations from the call



1. **Lack of multisig**: Multisig support was a requirement of the research sprint that was explicitly excluded in our proposal. Multisig support is part of our future research in this domain.
2. **Ballot batching**: In order to enable weighted voting without leaking information through voting power, we proposed a batching system (e.g. Tornado cash) in the first instance. However, given the amount of research effort we believe this solution requires, we explicitly excluded its development during the sprint. AZKR can join efforts if some other party is interested in exploring this option.


### 8.2 Deviations from our proposal



3. **Addition of _zkRegistry_**: At the time of the proposal, we believed that our design would not require this component. However, during the sprint we realized that we could not avoid it with the current state of the art. The practical consequence is that every voter must register their wallet once to a smart contract before the first voting process that she wants to participate in is created. The voter is not required to store any additional information. **For clarity, only one registration per wallet is ever required**.
4. **Exclusion of the _Relay-delayer_**: In our design, the main functionalities of the Relay-delayer are: i) enable aggregation of ballots (weighted voting), ii) allow for gas costs payment by third parties, and iii) potentially could add a mixnet layer. During the execution phase, we decided to not develop it due to the lack of time. A practical consequence is the simplification of the voting process phases, because with the relay-delayer model, in order to neutralize the censorship capacity of the nodes, the voting period is split into subphases. In the first one, votes can be cast (to the voting smart contract) either directly or indirectly through relay-delayer nodes. In the second phase, those who have cast through a relay-delayer must check (through a nullifier) that their ballots have been indeed aggregated by the node and if that is not the case, they can cast them directly. 


## 9 Answer to the research questions



1. _Up to which point is it possible to build a **user-friendly**, **trustless** (decentralized), **fair** (no one can count votes before a given time), **weighed** (voting power depends on the amount of tokens hold/delegated) and **ballot-secret** (it is impossible to link a voter with a choice) voting system in Ethereum?_

    **Short Answer**: With the promising progress on both research and development achieved throughout the sprint, it is very possible.


    **Longer Answer**: The key contribution of our work is having achieved fairness and ballot-secrecy in a highly trustless manner, as our design only depends on the League of Entropy. This is groundbreaking because, to the best of our knowledge, it is the first time fairness and ballot-secrecy are achieved together in such a trustless manner.


    However, in terms of user experience drawbacks, our solution i) requires only a one-time additional step (registration of the wallet to the zkRegistry) from the minimum ones (voting process creation, vote cast, tally). ii) It is one-vote per NFT, and, as discussed in Section “Deviations from our proposal”, iii) our proposal to support weighted voting (i.e. the inclusion of a relay-delayer service) involves the addition of extra steps for those who use it. iv) It still lacks in-browser support, and v) vote generation proving times are still considerably high (currently 12 minutes in a i7 U-series processor and 32GB RAM laptop) and vi) ballots must be submitted by fresh addresses. In the near future, although we don’t foresee changes in i) as we don’t consider it a major issue and removing it would increase complexity significantly, expect significant progress can be made to improve ii) to v).


    Mobile browser support, in extension to desktop browser support, would also be an interesting challenge to tackle given the even stricter WASM memory restrictions (4GB → 1GB). One intermediate solution could be proving on desktop while signing from mobile via [WalletConnect](https://walletconnect.com/).


    Overcoming vi) requires specific research, which we propose to be carried out leveraging existing mixnet solutions.



2. _If all these properties cannot be met at once, which are incompatible and why?_

    **Answer**: As a result of the research work done during the sprint, we firmly believe that all can be met jointly.

3. _If all these properties cannot be met at once, which is the recommended combination and why?_

    **Answer**: Not applicable. We believe that they can be met at once.

4. _What is needed to make the recommended combination available to the Nouns community? (Resources needed, roadmap, etc.)_

    **Short answer**: On the one hand, bring to production the components researched during the sprint and, on the other hand, research a solution for multisig support and develop the proposed solution for vote aggregation to eventually bring them to production. Some of the tasks are already part of AZKR’s and Aztec Labs’ roadmaps (e.g. private voting related components/technologies), but some other works would require further facilitation by the Nouns DAO (essentially customisation and integration with Nouns DAO’s governance system). The tasks of AZKR and Aztec Labs roadmaps are be expected to be finished by the end of 2023.


    **Longer answer**:

    1. In-browser support
        1. (Aztec Labs) Provide the technology (Noir)
            1. Through the sprint, we have discovered the need to bring both **UltraPlonk** (for proving speed-ups) and **Recursive Aggregation** (for circumventing web browser’s memory limits) into web browsers to enable in-browser voting.
            2. Getting **UltraPlonk** in browsers has been the engineering priority for the latter portion of the sprint. The [core engineering efforts](https://github.com/AztecProtocol/barretenberg/pull/544) were completed in the weeks following the end of the sprint.
            3. Getting **Recursive Aggregation** in browsers has been progressing since. Testing, identification and fixing of issues for the feature are ongoing.
        2. (AZKR) Integrate the technology
        3. (Nouns) Web app integration
            4. Vote generation
            5. Vote submission
    2. Multisig support
        4. (AZKR) Investigate a solution
        5. (AZKR) Implement the solution
        6. (Nouns) Integration (web app?)
    3. zkRegistry
        7. (AZKR) Review design
        8. (AZKR) Additional users
        9. (Nouns) Web app integration
    4. Timelock.zone
        10. (AZKR) Bring it to production
        11. (AZKR, Aztec Labs + others) Launch and maintain it
    5. Delay-relayer service
        12. (Nouns, with the support of AZKR and through third parties)
    6. In addition, AZKR can look into ballot batching, i.e. explore the possibility of aggregating several votes into one. As this will have an impact on all system components, this will also require a separate feasibility study..


## 10 Future work

Regardless of any further collaboration between Nouns DAO with AZKR or Aztec Labs, the last two will keep working on the core activities developed during the research sprint.


### 10.1 AZKR

AZKR will continue developing the key components of this project in order to make available a voting system with at least the current properties (trustless, ballot secrecy, fairness, etc.) to [Aragon OSX](https://aragon.org/aragonosx) as a plugin. The code name is likely to be zk-POPVOTE (zk Proof-based On-chain Private Voting). The final technical report provides specific details and a tentative roadmap.


### 10.2 Aztec Labs

Aztec Labs will continue contributing to Noir’s development to enhance both the developer and user experiences with trustless private voting. From getting Recursive Aggregation in web browsers, researching in-browser proving optimizations, all the way to R&Ding the next version of our proving backend, we excitedly look forward to the blossoming of ZK DAO Governance that would be unlocked with the technologies.

### Notes

[^1]:
     [https://prop.house/nouns/private-voting-research-sprint](https://prop.house/nouns/private-voting-research-sprint) 

