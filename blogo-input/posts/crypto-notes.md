# Selected Topics in Cryptography: from the basics to e-voting

*2022-12-23 by [Vincenzo Iovino](https://sites.google.com/site/vincenzoiovinoit)*

In this post we present the first set of cryptographic notes that we published [here](https://github.com/aragonzkresearch/blog/blob/main/pdf/crypto-notes.pdf).
The purpose of these notes is to provide a self-contained introduction to relevant concepts in cryptography with an eye on e-voting. We will present a toy e-voting system as as a motivational example to introduce several crypto primitives needed to implement it. In particular, we will touch basic number theory, encryption, digital signatures, hash functions, commitments, secret sharing, proof systems, zero-knowledge, secure function evaluation, and distributed key generation. 


In particular, the topics we covered are the following.
## Basic probability and complexity theory
We introduce axiomatic probability theory with a focus on the discrete case with examples coming from cryptography. We give a basic introduction to complexity theory and in particular we cover the concepts of NP relations and hard languages that are at the core of modern cryptography.

## Public-key encryption
We present the basics of number theory with the objective of introducing secure algebraic groups like the group of quadratic residues modulo a prime number.
We then proceed to formalize the concept of public-key encryption and we present the well known ElGamal encryption scheme whose homomorphic property are useful for e-voting.

## Zero-knowledge Proof Systems
We start introducing the concept of an interactive zero-knowledge proof (ZK-IP) system using the framework of interactive machines. We then move to sigma protocols that are a special case of IP-ZK systems suitable for practical applications and we show how to transform them into non-interactive zero-knowledge (NIZK) proofs using the celebrated Fiat-Shamir transform. We employ sigma protocols to construct a simple e-voting protocol with the following property. The verifiability is unconditional: no set of participants or voters can subvert the result of the election. The privacy is however guaranteed only assuming a single trusted authority.

## Secret Sharing and Threshold Cryptography
The previous e-votign protocol suffers from a major problem. There is a single trusted authority that can break privacy. We show how to mitigate thiss problem introducing the concept of secret sharing, and in particular the polynomial secret  sharing of Shamir.
In addition, we demonstrate how the secret sharing of Shamir can be used to construct a protocol to allow a set of participants to jointly evaluate a public function $F$ on a set of secret inputs $x_i$, where $x_i$ is known only by party $P_i$.
## Proof of knowledge and Digital Signatures
An IP system guarantees that a malicious prover cannot prove false theorems. An extension of it also ensures that if a proof is accepted by the verifier the prover actually knows the witness (e.g., the secret) used to compute the prover.
We show that proofs of knowledge are essential to tweak our toy e-voting scheme in order to withstand re-randomization and malleability attacks.
Moreover, we introduce the concept of digital signatures and their construction from proofs of knowledge and we use digital signatures to add a census of the voters to our toy e-voting scheme.

## Commitments and applications to ZK
We introduce the concept of commitment scheme that allows a party to commit to a string and later on to open it in a unique way.
We show applications of commitments to zero-knowledge, in particular the celebrated "MPC in the head" paradigm to construct zero-knowledge protocols from secure function evaluation and commitment schemes.
We present several constructions of commitment schemes from different primitives: hash functions, specific number-theoretic assumptions and sigma protocols.
We show that our toy e-voting scheme suffers from a security issue that can be solved using commitments.

## Verifiable shuffles
Our toy e-voting scheme is well suited for referenda. For more general tally functions, the homomorphic property of ElGamal is not sufficient. We introduce the concept of verifiable shuffles that can be used to construct e-voting schemes for general tally functions and can be used to construct anonymous e-voting schemes as well, that is e-voting scheme in which, not only what a voter voted for is hidden but also whether a voter actually cast a vote is not revealed.

## Polynomial commitments and applications to distributed key generation

Our previous toy e-voting scheme can be instantied either supposing that all authorities participate in the decryption procedure or using a Shamir's secret sharing. 
The Shamir's secret sharing when applied to e-voting introduces the need for a so called trusted dealer. This party, if malicious, can compute wrong shares, and subvert the result of the election.
To withstand this issue, we provide a construction of a distributed key generation (DKG) protocol to share a public-key in a secure way without a trusted dealer and later on reconstruct the corresponding secret-key among an arbitrary subset of participants of sufficiently large cardinality.
In particular, we provide a construction of DKG from the polynomial commitment scheme of KZG. 

## Conclusions
In these  set of notes, we provided not only a set of cryptographic primitives of independent interest but explained how to reason about the security properties of protocol, in particular e-voting. Our final toy e-voting scheme was indeed constructed through different iterations in which at each step we solved a previously identified issue. 
What is not covered in these notes are more recent topics like succinct proofs that we at Aragon ZK Research will explore in future blog posts, notes and papers.
