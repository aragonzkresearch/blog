# E-voting: State of the Art

*2023-06-08 by [Vincenzo Iovino](https://sites.google.com/site/vincenzoiovinoit)*

In this post we summarize a review of the state of the art in e-voting that we published  on [our github](https://github.com/aragonzkresearch/blog/blob/main/pdf/evoting_review.pdf).
The review is meant to provide a background on the most popular cryptographic techniques and the desirable properties for e-voting, and to present e-voting solutions that are specifically suitable for web3, highlighting the main issues that arise in that setting. 

## Building cryptographic blocks

First, we summarize the topics we covered in the review starting from the cryptographic building blocks used to construct e-voting protocols.
### TLS/HTTPS
Most e-voting protocols require the voters to communicate privately with a server or establish P2P channels with other parties. The popular TLS and HTTPS protocols serve this purpose and to establishment of private authenticated channels.

### Bulletin boards
Bulletin boards are the core of modern e-voting protocols. They represent the source of truth where voters and authorities post their ballots and other cryptographic objects. Blockchains enable perfect bulletin boards in a decentralized way.
### Cryptographic hash functions
Hash functions allow compression of information in a short string called the digest. Traditional hash functions like SHA256 have been replaced in anonymous voting protocols for web3 with more "Zero-knowledge friendly" hash functions like Pedersen and Poseidon/Poseidon2.
### Digital signatures and public key encryption
These tools allow privacy and authentication and are the core of modern cryptographic protocols, including blockchains themselves that internally are based on digital signatures for authentication.
Public key encryption (PKE) can be homomorphic: for instance ciphertexts encrypting different voting options can be tallied together to get a single ciphertext that encrypts the sum of the voting options. Several modern e-voting systems are based on homomorphic PKE.
### Commitments
Commitments are the digital equivalent of locks where one can deposit a string that later on can be opened in a non-ambigous way and turn out to have many applications to e-voting.

### Zero-knowledge Proof Systems
Zero-knowledge (ZK) is at the core of modern e-voting protocols and blockchain applications. A ZK protocol allows a prover Alice to convince a verifier Bob that she knows a secret without revealing any information to him.
They can be used in e-voting for example to prove that a ciphertext encrypts a given message without need of disclosing the secret key of the PKE system (which would allow decryption of other ciphertexts).

### Secret Sharing and Threshold Cryptography
Secret sharing is a protocol run by a set of participants to share a secrer in a way that no sufficiently large subset of participants can recover the secret.


## Popular approaches to e-voting

We now summarize the most popular approaches to e-voting

### Threshold and homomorpic PKE-based protocols
In a toy e-voting scheme, voters encrypt their voting options with respect to a public key (PK) of some authority and then the authority can decrypt the ciphertexts and compute the tally.
There are two problems with this approach. The first one is that the authority can know which voting option each voter casted. The second problem is that the authority could cheat by announcing a fake tally result.

The first problem can be solved using homomorphic PKE and secret sharing.
The voters encrypt their voting options with a homomorphic PKE system. The ciphertexts are tallied together to get a single ciphertext encrypting the sum of the voting options, that is the tally of the election.
Then one assumes that the secret key of the PKE system is shared among a set of authorities that can decrypt the ciphertext in a so called threshold way. 

The second problem can be solved using ZK proofs: the authorities are required to provide ZK proofs of correctness of their operations so they cannot subvert the election result.
Also, the voters use ZK proofs to prove that their ciphertext encrypt valid voting options.

### Shuffle-based e-voting
In shuffle-based protocols the voters submit their votes in encrypted form but the list of ciphertexts is subject to what is called a shuffle: the ciphertexts are re-randomized and permuted so to get a new list of ciphertexts.
The reason is that if the authorities decrypt each ciphertext in the new list they will see voting options $v$ but the only information they can infer is that $v$ was casted by one of the many voters, but they may not know which one.
The security is under the assumption that the authority cannot collude with the party who made the shuffle. 
The shuffle can be repeated by multiple parties so as to distribute the trust.
### Everlasting privacy
In some situations it may be required that a voter's preference can never be disclosed. This property is called everlasting privacy and special techniques based on commitments can be used to that purpose. The voters commit to their voting options to the authorities in a threshold way so that the authorities can tally the voting options but if they do not collude all together they cannot get any information about individual voting preferences. The commitments are chosen to be statistically hiding to guarantee the everlasting property. We defer to the review for an example of e-voting system that achieves everlasting privacy.

### Protocols based on membership proofs

A popular approach, especially in the web3 domain, is the following.

One assumes that the census of the eligible voters is represented by a vector commitment $T$ whose values contain the public-keys of the voters for a digital signature scheme.
A traditional choice for the vector commitment is Merkle trees but nowadays new and more efficient vector commitment schemes are available and can be used for this task, for example Verkle trees. 
In an election identified by a string $id$, a voter with public-key $PK$ and corresponding secret key $SK$, submits to the bulletin board the voting option $v$ in the clear, a value $h=H(SK,id)$, where $H$ is a cryptographic hash function such as SHA256 or Poseidon, and a ZK proof of the following fact: there exists a signature $\sigma$ of $v$ with respect to a public-key $PK$ that is contained in the vector commitment $T$.

The value $h$ is called nullifier and it is used to prevent a voter casting their vote twice. If this occurred there would be two equal nullifiers $h_1,h_2$ appearing on the bulletin board and the corresponding votes will be discarded. Since the votes appear on the bulletin board in the clear, the tally can be easily computed.

In the review we also present alternative approaches based on ring and group signatures.

### Protocols based on blind signatures
In a blind signature protocol, two parties $P_1,P_2$ interact together in the following way: At the beginning of the interaction, $P_1$ has a private message $m$ and a public-key $PK$ for a digital signature scheme, and $P_2$ has the corresponding secret-key $SK$. At the end of the interaction $P_1$ gets a signature of $m$ that is verified under $PK$ in a way that $P_2$ does not leak any information about $m$ and $P_1$ does not leak any information about $SK$.

This protocol can be used by a voter to request a digital signature of his voting option that later on can be posted on the bulletin board.
In this way, anyone can check the eligibility of the voter but the authority cannot link any pair of voting option and signature to a specific voter.
The authority must be decentralized, as in most e-voting protocols, to prevent the authority easily generating signatures of voting options.
## E-voting in the web3 domain

In the web3 domain, e-voting is usually done not for political reasons, but to take decisions regarding financial decisions on DAOs.
There are some peculiarities and features that are specific to the web3 domain:

 * Scalability: In Ethereum any computation costs gas and this has to be minimized. 
    
 * Crypto primitives optimized for web3: Ethereum offers a limited number of cryptographic operations. Technically it is possible to implement any computer program in the Ethereum Virtual Machine (EVM) but it is preferable to make use of cryptographic tools that are optimized for Ethereum and specifically the precompiles. For example, only some specific bilinear groups are available on Ethereum as precompiles such as the bn128 curve.
    
 * Token voting: In the context of web3, elections may be based on, e.g. NFT ownership. Here the census should be implicitly linked to the NFT ownership data stored on Ethereum.
    
* Hiding voting power: In voting based on NFT ownership, a desirable property is that it should not be possible to infer whether a given voter owns a large amount of tokens, hence "whales" should not be identifiable. In practice it may be known that Bob is the major token holder so knowing that a particular ballot was cast by someone with a very high amount of tokens implies that the relevant ballot was likely cast by Bob.
  
 * Fairness: E-voting in the web3 domain is usually performed using proofs of membership as described before. If e-voting protocols based on simple membership proofs, voter preferences sent to the smart contract are publicly visible. This poses the problem of fairness: the voters who have not yet cast a ballot can be influenced by the partial tally that is publicly visible on the blockchain.
    
 * Equity of costs: The gas fees are paid by whoever submits a transaction and this has consequences. In traditional e-voting systems, computing a tally at the end of the election carries a negligible cost. In Ethereum, however, one has to prefer solutions in which the cost of tallying the result is fairly divided among the voters. If, for instance, a system were such that the last voter needs to compute the tally on-chain in an expensive way, his transaction would cost more gas than for previous voters and this would raise an equity issue.
    
 * Storage: The cost of storage in Ethereum is very high. Preference must therefore be given to solutions in which only a short digest is published on-chain,i.e. on Ethereum, and the full data is stored off-chain.

    The cost of storage also poses some equity problems. In a system where each voter needs to add an element to a set, if this cost grows linearly with the number of elements in the set and the number of voters is very high ($> 10k$), the last voters would pay more than the first voters.
    
    ## E-voting projects and the Nouns DAO call
    
    We defer to the [review](https://github.com/aragonzkresearch/blog/blob/main/pdf/evoting_review.pdf) for a list of recent e-voting projects including one by [Aragon ZK Research](https://research.aragon.org/) and by the [VocDoni](https://vocdoni.io/) guild. The list has not be meant to be exhaustive and there are other ongoing projects. Moreover, we gave preference to the recent [Nouns DAO]({https://prop.house/nouns/private-voting-research-sprint}) call to which we of Aragon ZK Research participated along with Aztec. This is ongoing research and we invite you to stay updated on our blog to see the next progress in the coming months!
    ## Acknowledgements
    The document was reviewed by Ivan Visconti (University of Salerno). We also thank Alex Kampa and Andrew Barnes for corrections and improvements.
    ## References
    [E-voting: State of the Art](https://github.com/aragonzkresearch/blog/blob/main/pdf/evoting_review.pdf)
