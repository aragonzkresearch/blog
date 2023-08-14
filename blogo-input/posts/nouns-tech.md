# Nouns sprint technical report

*2022-08-21*

## Introduction
This is a technical description of the outcomes of the work done by Aragon ZK Research (AZKR) during the exectution of the [joint proposal](https://prop.house/nouns/private-voting-research-sprint/3954) submitted to the Nouns DAO [Private Voting Research Sprint](https://prop.house/nouns/private-voting-research-sprint) by Aztec Labs and AZKR.

This document is part of the final documentation. Read the [Final report](==TODO add link==) for further information.


<div style="border:1px solid black;border-radius:10px;padding:5px;">

This is a research project. The outputs are strictly preliminary results.

</div>

:::warning
This is a research project. The outputs are strictly preliminary results.
:::


### Properties of the e-voting system and security assumptions
As specified in the proposal, the system has been designed to meet the following properties:
* **Ballot secrecy** It is impossible to link a voter with a choice
* **Eligibility** Only legitimate voters can vote
* **Eligibility verifiability** Anyone can verify that each vote in the set of all cast votes was cast by an eligible voter
* **Fairness** No early results can be obtained which could influence the remaining voters
* **Individual verifiability (IV)** A voter can verify that her vote is included in the set of all cast votes
* **Proxy vote** An eligible voter may delegate their voting power to a representative
* **Robustness** The system should be robust to a certain degree of malfunction or corruption and still deliver correct results
* **Unconditional privacy** Nobody should be able to learn any additional information even several centuries after the voting process
* **Universal verifiability (UV)** Anyone can check that the election outcome corresponds to the ballots published on the bulletin board
* **Uniqueness** No voter should be able to vote more than one time
* **Weighted voting** votes inherently vary in strength depending on the voter

Security assumptions:
* Same as in Ethereum.
* Fairness also depends on League of Entropy.

### Components overview

Main components:
- *zkRegistry*
- *Voter client*
- *Tally CLI*
- *Timelock.zone*
- *Delay relayer* (included in the proposal, but not started yet -not shown in the diagram)

![](https://hackmd.io/_uploads/ByhaFpP9n.png)


### Flow overview
0. **Wallet registration (strictly only once per wallet)** Every wallet must have been registered before the voting process is created. This must only be done once per address. The owner of the wallet does not need to save any extra data because  the key pair is generated deterministically.

    Demo: [zkRegistry using MetaMask](https://timelock.zone/MakeKeysAndRegister.mp4)
    
    Webapp: https://zkreg.com/keygen

    Main inputs:
    * Wallet address

    Main outputs:
    * Public key (stored in the regsitry)
    * Private key
     
    Gas cost: ~45k
1. **Voting process setup** Anyone can create a voting process.

    Demo (steps 1-4): [nouns-cli](https://hackmd.io/5vFz0a1BRTikynTf7ga-eg?view)

    Main inputs:
    * IPFS link to proposal
    * Start delay (i.e. time from process submission to beginning of voting period)
    * End date
    
    Main outputs
    * Process ID
    
    Gas cost: ~700k
2. **Vote generation (one per NFT)** Allowed registered wallets (i.e. holding NFTs -either non-delegated owned or delegated, at the time of the process creation) can generate the ballot and the corresponding proofs. 
    Main inputs:
    * Voting process ID
    * NFT ID
    * Private key
    * Choice
    
    Main outputs:
    * Vote (i.e. Random Baby Jubjub public key + ballot encrypted using shared secret between random key and Timelock.zone key + proofs of NFT ownership or delegation)

    Total computation time (zkRegistry + NFT ownership + delegation proofs): ~12 minutes (modern laptop with i7 U-series processor and 32GB RAM)
    
3. **Submission** The vote can be submitted to the voting *Nouns voting* smart contract (VSC) during the voting period. Steps 2. and 3. are performed together by the CLI.
    
    > **Note:** Users are highly recommended to use a fresh/anonymous address to submit the ballot, in order to avoid leaking ballot secrecy.

    Main inputs:
    * Vote (generated in the previous step)
    
    Main outputs:
    * None

    Gas costs: ~690k

4. **Tally**

    Main inputs:
    * Process ID
    
    Main outputs:
    * Results + proof of correctness
    
    Gas costs: ~522k (submission of the proof that the tally is correct)
    
    Constraints:
    
    > **Note:** Only one entity has to carry out the generation and submission of the tallying proof.
    
    * Census up to 16 NFTs: 106k constrains => ~5 minutes (new laptop with i7 U-series processor and 32GB RAM)
    * 256 NFTs : 1.5m constrains => ~2 hours (new laptop with i7 U-series processor and 32GB RAM)

> **Future work**: The computation time is expected to decrease significantly with the upcoming optimisations and new features of Noir

### Main achievements
* Overall, the main requirements of the call have been met:
    * Trustless token-holder census using Ethereum storage proofs
    * Full anonymity (as long as votes are submitted via an anonymized address)
    * Tally fairness with minimal trust: results cannot be known until the end of the voting process
* These results were achieved via:
    * Leveraging new features of Aztec's Noir language to achieve EthTrieProof inside the zkSNARK circuit
    * Creating TLCS, an efficient cryptographical time-lock protocol which will be used in the timelock.zone service and used by the voting protocol to achieve fairness.
    * Creating an on-chain zkRegistry to make the voter's registration ZK-friendly; this registry is of independent interest for future applications.
    * Developing a voting scheme that combines zkSNARKs with encryption and digital signatures to simultaneously achieve full anonymity and fairness.

### Current limitations
* The PoC mostly via CLI
    * The demo is based on a script
    * Timelock.zone is available with API access or Web interface
    * The ZK Registry is available with CLI or Web interface
* Multisig support excluded in the proposal
* Delay-relayer service excluded during the sprint due to lack of time/resources
    * 1 vote per NFT. No ballot aggregation.
* Performance limitations:
    * Vote generation takes several minutes per NFT (there is room for optimization)
    * Tally generation: over 10 minutes for a census of 256 NFTs (can be improved; not so worrying as the vote generation time because this can be run on powerful servers)

### Main next steps
* Noir proving speed-ups via:
    * Multi-threading
    * WebGPU
    * also considering alternatives
* Delay-relayer service (through partnerships)
* Multisig support
* In-browser version (23Q4 in Aragon OSX): all user journey in-browser
    * Pending for Noir recursion in browser

## zkRegistry
This is the first component of the system the user must interact with. It is a registry that stores a map between Ethereum Addresses and Public Keys or Commitments. This allows the users to register a new Secret Key for their wallet, that can be then efficiently used by cryptographic protocols.

The current design allows to use new types of Secret Keys, besides the Ethereum Secp256k1 Private Key. This can make protocols, especially working with ZK, a lot more efficient. In this project, we are particularly interested in the first point, which allows us to use BabyJubJub keys. Specifically, the commitment is a BJJ public key which corresponds to a private key that is obtained from the signature (via hardware wallet or Metamask) of a pre-established text.

Website: https://zkreg.com

## Timelock.zone
Timelock.zone is a public time-locked cryptographic service enabling anyone to encrypt data for decryption in the future, with support for the most common cryptographic schemes. Time-locked cryptography (TLE) are cryptographic systems which guarantee that ciphertexts will be decipherable only at a certain time in the future. Such systems are also variously referred to as time-lapse, time-based, time-dependent, delayed unlocking etc. cryptographic protocols.

We use TLE to ensure that no one has access to the choices of the ballots before the end of the voting period. timelock.zone was started as part of the nouns private voting period but it has been developed as an independent service, given the number of potential applications it has beyond e-voting. We call the protocol TLCS (Time Lock Cryptographic Service) and the service timelock.zone.

Key features:
1. Public keys for periods far into the future are always available;
2. Support for many cryptographic schemes;
3. Relies on trusted randomness (Drand beacon) published by the [League of Entropy](https://www.cloudflare.com/leagueofentropy/);
4. Possibility of public participation;
5. The correctness and security of the scheme is guaranteed as long as a single party participating in the public key computation is honest;
6. These parties do not need to be present when the private key is revealed.

From a pragmatic standpoint, here we just look at timelock.service as a service that provides public keys for encrypting the ballots ensuring that the corresponding private keys are only made available once the voting period is finished.

For technical details see:
* [Timelock.zone paper](https://github.com/aragonzkresearch/blog/blob/main/pdf/azkr-timelock-zone.pdf)
* [Initial concept note](https://hackmd.io/WYp7A-jPQvK8xSB1pyH7hQ?view)

:::warning
The Timelock.zone service and the TLCS protocol are in early alpha stage.
:::

Website: [Timelock.zone](https://www.timelock.zone/)
API: https://hackmd.io/WVF0GVWgQZmPFIV_lT9F4A
 

> **Future work**: We plan to launch Timelock.zone by year-end.

## Voting protocol
* [Initial concept note](https://hackmd.io/8572_wduTQiXNWNCwIu5-A)

### Setup
The following subsections will assume that the different parties have access to:
- timelock.zone:
   - Public key for time $t$: $T_{pk}$
- zkRegistry: has the relation between the Voter Ethereum Address and its Registry Public Key: $V_{ADDR} \longleftrightarrow VR_{pk}$
- Voter
    - Voter zkRegistry secret key: $VR_{sk}$
    - Voter zkRegistry public key: $VR_{pk} = g^{VR_{sk}}$
- TokenContract storage root & zkRegistryContract storage root $R_{token}, R_{zkreg}$

For simplicity, we define the string $id$ as follows, $id=\{chain_{ID}, process_{ID}, contract_{ADDR}\}$.

Algorithms used:
- $H_s$: a snark friendly hash function (in constraint number).
- $H_e$: a EVM friendly hash function (in gas costs).
- $DS$: a snark friendly signature scheme.
    The Sign algorithm is for a DS scheme that has the following property: it is hard for an adversary to produce two different signatures of the same message (BLS and RSA have this property).
    In other words, $\sigma$ is for a deterministic unique signature. Alternatively we can use PLUME in future. For the moment we will use EdDSA. 

### Process creation

In order to create a new process, anyone can send a tx calling the `newProcess` method from the VSC.

> **Customization** Restrictions/checks can be added to the VSC to avoid spam (e.g. just NFT holders can call `newProcess`).

Data sent to the VSC to create a process:
- IPFS CIDv1 link to proposal (raw binary; sha2-256 digest)
- Token StorageRoot: $R_{token}$
- zkRegistry StorageRoot: $R_{zkreg}$
- Block number at which the census is taken
- Block number at which the voting period begins
- Voting period duration in Ethereum blocks
- Timelock.zone PublicKey: $T_{pk}$
- Timelock.zone round number

Both $R_{token}, R_{zkreg}$ must be under the same Ethereum Storage Root for the given EthBlockNumber (i.e. the one that establishes the census for the given process).

> **Future work**: In the current iteration it is left to the users to ensure that the values match (which is done automatically by the provided library). But in a future iteration, when creating a new process the tx will include also a SNARK proof proving that $R_{token}, R_{zkreg}$ are included in the Ethereum State (under Ethereum's state root) for the given block number.

> **Customization**: In the current implementation, for simplicity, the processes are started immediately. An extra parameter can be added to delay the beginning of the voting process until a specific Ethereum start block number.

> **Future work**: Modify the design to allow the registration at the zkRegistry between the process creation and the start of the voting period.

### Voter proof

++Vote's choice (Noir). Run by the voter in a 'personal' server++:
1. Signatures $\sigma=DS.Sign(VR_{sk},~(NFT_{id},id)),~ \tau=DS.Sign(VR_{sk},v),$ where $v$ is the voter's choice and $VR_{sk}$ is used as signing key (so that $VR_{pk}$ will be the corresponding verification key).
2. nullifier $N=H_s(\sigma)$.
3. $A=g^{r},~ K={T_{pk}}^{r}$, for some randomness $r\in Z_p$.
    - note that $K = g^{r\cdot T_{sk}}$
4. $B=H_s(K, v, id)$
5. $h_{id}=H_s(NFT_{id},id)$
6. The path $p_1$ from the root $R_{token}$ to the relevant information needed to prove ownership of the token $NFT_{id}$ and the path $p_2$ to the zkRegistry commitment key $RCK_i$ under $R_{zkreg}$, and the path(s) $p_3$ needed to prove that $NFT_{id}$ is not delegated under the $R_{token}$. 

The voter sends to the 'personal' server the tuple $(VR_{pk},N,id,NFT_id,h_{id},r,v,A,K,B,\sigma,\tau,p_1,p_2,p_3)$.

++Vote's proof generation (Noir). Run by the voter in a 'personal' server++:
Public inputs: $(A,B,N,id,R, T_{pk})$
Private inputs: $(v,\sigma,address,\tau, NFT_{id}, h_{id}, K,VR_{pk},p_1,p_2,p_3)$
Output: proof $\pi$ computed as follows:

1. Check that $DS.Ver(VR_{pk},\sigma,(NFT_{id},id))=1$, that is that $\sigma$ is a signature of $(NFT_{id},id)$ under pubk $VR_{pk}$.
2. Check that $DS.Ver(VR_{pk},\tau,v)=1$, that is that $\tau$ is a signature of $v$ under pubk $VR_{pk}$.
3. Check that $h_{id}=H_s(NFT_{id},id)$.
4. Check that $N=H_s(\sigma)$.
5. Check correct encryption of the vote:
    - 5.1. $g^{r}=A$ and $K={T_{pk}}^{r}$.
    - 5.2. $B =H_s(K, v,id)$.
    - 5.3. $v\in\{0,1,2\}$.
6. Use the path $p_1$ to check that the Ethereum state committed to in $R$ includes in the zkRegistry $RCK_i$ that is associated with a voter's Ethereum address.
7. Use the path $p_2$ to check that the Ethereum state committed to in $R$ contains a token with identifier $NFT_{id}$ owned by some address $a$.
8. If the value associated with proof $p_3$ is null (i.e. there is no delegation), check that $a = \mbox{address}$. Else, verify storage proof $p_3$ and confirm that tokens belonging to address $a$ have been delegated to $\mbox{address}$.
9. **(Not yet implemented)** Check that signature randomness is deterministic $r = H_s(msg ~||~ H_s(VR_{sk}))$

> **Future work**: According to the proposal, our goal is to move the 'personal' server computations to in-browser computations when Noir allows to do so. During the sprint Aztec has made significant progress in this regard.

The voter sends to the VSC $(A,B,N,\pi)$.

The VSC keeps a value $B_K$ that is initialised to zero. For each received ballot $(A,B,N,\pi)$ with a valid proof, we assign $B_K \leftarrow H_e(B_K,B)$.

If $N$ voters submitted valid proofs we call $(A_i,B_i,N_i,\pi_i)$, for $i\in[N]$, the values such voter sent to the VSC.

A nullifier ensures uniqueness of the vote.

> **Future work**: Modify the design to allow vote recast (currently seen as the most effective anti-coercion measure).

> **Future work**: Modify the design to make the proof non-deterministic (probably an (the most?) effective anti-vote-buying measure).

> **Future work**: Modify the design to merge the two previous enhancements.

### Tally proof

$t$: time to decrypt votes, known by the VSC
Ethereum end blocknum: Ethereum block until which voters can submit votes

++Tally (Noir). Can be run by anyone++:
1. Fetch data from the VSC
    - Fetch $A_i$ for $\forall i \in \{1, \ldots, n\}$
    - Fetch $B_i$ for $\forall i \in \{1, \ldots, n\}$
    - Fetch secret key of timelock.zone $T_{sk}$
    - Fetch value $B_K$ from the VSC.
2. For each voter, get option for a voter $i$:
    - Compute $A_i^{T_{sk}} = g^{r_i T_{sk}} = K_i$.
    - Find the first value $v_i\in \{0,1,2\}$ such that
         - $B_i = H_s(K_i, v_i, id)$. (We will be able to find such value $v_i$ because the voter's ZK proof was verified successfully.)
3. Prove vote aggregation:
    - Sum all $v_i$ for each vote option to compute an array $vote_{count}$ storing # votes for, # votes against, # votes abstain.
    $$
    \text{no} = |v_i| ~\text{s.t.}~ v_i==0\\
    \text{yes} = |v_i| ~\text{s.t.}~ v_i==1\\
    \text{abs} = |v_i| ~\text{s.t.}~ v_i==2
    $$
    - Given public inputs $B_K$, $chain_{ID}$, $process_{ID}$, $contract_{ADDR}$, $vote_{count}$ and witnesses $(K_i,v_i)$ we generate a zk proof of the following program:
        - For all $i\in[n]$, the program computes $B_i = H_s(K_i, v_i, id)$
        - Compute $B_K' = H_e(B_i, H_e(B_{i-1}, H_e(...)) ~\forall i \in [n]$ and verify that $B_K = B_K'$
        - Verify that the votes have been correctly counted, i.e. all $j\in{0,1,2}$ $vote_{count}[j]$ equals $|\{v_i|v_i=j\}|$
        - Output $1$ iff all verifications passed
    
++Verifier (Solidity). Part of the Voting Smart Contract (VSC):++
Inputs (to verify the proof):
- `vote_count [(uint256, uint256, uint256)]`  Triple storing # votes for, # votes against, # votes abstain)
- `ballots_hash [uint256]` aggregated $B_K$ of all ballots known to smart contract
- `tally_proof`

In addition, the VSC has access to the following information:
- `process_id`
- `chain_id`
- `contract_addr`

If the `tally_proof` is correct, the VSC then sets the tally fields with the provided voting result, which can be then be publicly queried by other smart contracts.

A check in the VSC prevents from accepting a second tally.


### Connecting Voter proof with Tally proof
The previous sections describe the voting protocol. In this one we intend to provide a visual representation to help understanding the relation between the different variables defined. We use different font colors to this end.

<div class="row" style="margin-bottom:30px;">
  <div class="column">

**Voter**

1. $\sigma=DS.Sign(VR_{sk},(NFT_{id},id)),~\\\tau=DS.Sign(VR_{sk},v),$
2. $N=H_s(\sigma)$.
3. $\color{orange}{A}=g^{r},~ \color{blue}{K}={\color{teal}{T_{pk}}}^{r}$, for $r\in^R Z_p$.
    - note that $\color{blue}{K} = g^{r\cdot \color{teal}{T_{sk}}}$
4. $\color{violet}{B}=H_s(\color{blue}{K}, v, id)$
5. $h_{id}=H_s(NFT_{id},id)$
6. fetch $p_1,p_2,p_3$

The VSC computes $\color{purple}{B_K} = H_e(\color{violet}{B_i}, H_e(\color{violet}{B_{i-1}}, H_e(...)) ~\forall i \in [n]$

  </div>
  <div class="column" style="border-left:1px solid black;">

**Tally**

1. fetch
    - from VSC history: $\color{orange}{A_i}, \color{violet}{B_i} ~\forall i \in \{1, \ldots, n\}$
    - from timelock.zone: $\color{teal}{T_{sk}}$
    - from VSC state: $\color{purple}{B_K}$
3. $\forall i \in [n]$:
    - Compute $\color{orange}{A_i}^{\color{teal}{T_{sk}}} = \color{orange}{g}^{\color{orange}{r_i} \color{teal}{T_{sk}}} = \color{blue}{K_i}$.
    - Find $v_i\in \{0,1,2\}$ s.t.
         - $\color{violet}{B_i} = H_s(\color{blue}{K_i}, v_i, id)$
4. zkproof proving (among other checks) that
    - $\forall i\in[n]$: $\color{violet}{B_i} = H_s(\color{blue}{K_i}, v_i, id)$
    - $\color{purple}{B_K'} = H_e(\color{violet}{B_i}, H_e(\color{violet}{B_{i-1}}, H_e(...)) \forall i \in [n]$
    - check $\color{purple}{B_K} = \color{purple}{B_K'}$

  </div>
</div>

As we can see, the Tally proof must include all the voters $\color{violet}{B_i}$ that have been sent by voters to the VSC, in order to pass the proof verification.
In order to obtain the valid $\color{violet}{B_i}$, the tally prover needs first to obtain the valid $\color{blue}{K_i}$, which can only be obtained once the $\color{teal}{T_{sk}}$ from the timelock.zone is published, by computing $\color{blue}{K_i} = \color{orange}{A_i}^{\color{teal}{T_{sk}}}$.

<pre class="mermaid">
flowchart LR
Tsk[Tₛₖ]
  style Tsk color:teal
Tpk[Tₚₖ]
  style Tpk color:teal
Ai[Aᵢ]
  style Ai color:orange
Ki[Kᵢ]
  style Ki color:blue
Bi[Bᵢ]
  style Bi color:violet
Bk[Bₖ]
  style Bk color:purple

Bi1["Bᵢ₊₁"]
  style Bi1 color:violet
etc[...]

subgraph voteri[Voter i]
    Ai-->Ki
    Tsk-->Tpk
    Tpk-->Ki
    Ki-->Bi
end

subgraph voteri1[Voter i+1]
    etc-->Bi1
end

subgraph VSC
    Bi-->Bk
    Bi1-->Bk
end
</pre>

### Full flow

<pre class="mermaid">
sequenceDiagram
    Participant NFT as NFT / Token
    Participant zkRegistry
    actor Voter
    Participant TLCS as Timelock.zone
    actor Anyone
    Participant VSC
    
    alt Registry phase (once for all DAOs)
        Voter->>zkRegistry: VR_pk
    end
    alt Process creation
        TLCS->>Anyone: T_pk
        Anyone->>VSC: newProcess
    end
    alt Voting phase
        zkRegistry->>Voter: storageProof
        NFT->>Voter: storageProof
        TLCS->>Voter: T_pk
        Voter->>VSC: Vote
    end
    Note over VSC: Ethereum end blocknumber
    Note over TLCS: T_sk released
    alt Tally phase
        TLCS->>Anyone: T_sk
        VSC->>Anyone: A_i B_i B_k
        Anyone->>VSC: Tally + proof
    end
</pre>


## Further work
From now on, AZKR will continue developing the key components of this project in order to make available a voting system with at least the current properties (trustless, ballot secrecy, fairness, etc.) to [Aragon OSX](https://aragon.org/aragonosx) as a plugin. The code name is likely to be zk-POPVOTE (zk Proof-based On-chain Private Voting).

**zkRegistry**
Main objectives:
* Transform it into a more generic service

Main tasks:
* Review design
* Invite other partners to join efforts
* Consider to submit a proposal of an EIP

Note that in the long term this component may become obsolete if something like [Plume](https://eprint.iacr.org/2022/1255.pdf) becomes available in hardware wallets and Metamask.

**Timelock.zone**
Main objectives:
* Put the service in beta
* Set up a minimal participants coalition

Main tasks:
* Peer-review design and security proof
* Software testing
* Node deployment
* Governance: Coalition agreement

**Protocol**
Main objective:
* Provide a user-friendly experience (simple UX, vote generation for several NFTs, vote generation time < 2 minutes)

Main tasks:
* Reduce computation costs
* Generic (non-Nouns specific)

**Delay-relayer service**
Main objective:
* To have the service in place by year-end

Main tasks:
* Find suitable partner to implement this
* Review current design, in particular concerning payment of gas costs

**Ethereum evolution**
Main objective:
* keep compatibility along new releases

Main tasks:
* Adapt to new Ethereum block header

**Ballot batching**
Main objective:
* Enable weighted voting (without braking any other property e.g ballot-secrecy)

Main tasks:
* Research for a solution (most likely, it will impact on almost every existing component)
* Implement the solution

## Implementation

### Quirks
* **Archive node requirement**. With the exception of very short voting processes, the census block will lie more than 256 blocks in the past, which means the two storage proofs needed for vote submission will have to be fetched from an *archive node*. Fortunately, Infura provides storage nodes (free to use for up to 25k archive requests per day), and their nodes are used by MetaMask by default.
* **Ethereum fork requirement**. As part of the census snapshot that is taken at process creation time, a zero-knowledge proof that the storage hashes submitted arise from the block hash of the corresponding block, and this entails providing the block header to the circuit as private input. Part of this proof involves checking that this block header is a valid block header, which means a choice of Ethereum fork must be made. Currently, we assume that the underlying blockchain is the *Shanghai fork*. Later this year, there will be a new fork -- the *Cancún fork* -- and our code will have to be updated appropriately by taking the new block header fields into account. Note also that certain local blockchain implementations (e.g. [Ganache](https://github.com/trufflesuite/ganache/issues/2099)) do not implement the Shanghai fork.

### Repositories
- [nouns-anonymous-voting](https://github.com/aragonzkresearch/nouns-anonymous-voting): voter client library, tally CLI, and smart contracts (including zkRegistry)
- [noir-trie-proofs](https://github.com/aragonzkresearch/noir-trie-proofs): RLP decoding and Ethereum state and storage proof verification in Noir
- [tlcs-c](https://github.com/aragonzkresearch/tlcs-c): Timelock Cryptographic Service Protocol C implementation (currently used in Timelock.zone)
- [tlcs-rust](https://github.com/aragonzkresearch/tlcs-rust): Timelock Cryptographic Service Protocol rust implementation (to be used in Timelock.zone when put in production)
- [tlcs-chain](https://github.com/aragonzkresearch/tlcs-chain): Cosmos Blockchain which provides a Time Lock Cryptography Service
- [zk-registry-ui-demo](https://github.com/aragonzkresearch/zk-registry-ui-demo): Web based UI using MetaMask for zk registry registration

<style>

/* Create two equal columns that floats next to each other */
.column {
  float: left;
  width: 50%;
  padding: 10px;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

</style>