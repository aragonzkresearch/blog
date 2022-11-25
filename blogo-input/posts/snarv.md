# SNARVs: Succinct Non-Interactive Arguments of Voting -- protocols for cost-effective, off-chain e-voting.

*2022-11-25 by [Vincenzo Iovino](https://sites.google.com/site/vincenzoiovinoit) and [Matan Prasma](https://sites.google.com/site/matanprasma/artifact).*

Currently, voting protocols for DAOs are carried out without any privacy, that is, the preference of each voter is publicly visible to everybody. Moreover, to tally the result, a large amount of gas is consumed on the Ethereum network. To address this problem, Aragon's ZK-research team has developed [OVOTE](https://research.aragon.org/ovote.html)${}^{(1)}$ as a solution to minimise gas consumption on-chain. This is done by moving the voting procedure off-chain and verifieng the result using an on-chain SNARK proof. General-purpose SNARKs like the one of $\text{Groth}^{(2)}$, allow the proof to be verified in constant time, precisely using $3$ pairings and $t$ exponentiations where $t$ is the number of elements of the public statement. 

### SNARV

In an upcoming paper$^{(3)}$ we propose a general model that encompasses both anonymous and non-anonymous e-voting, which we call **Succinct Non-Interactive Arguments of Voting (SNARV).** Both *OVOTE* and two new protocols, *BatRaVot* and *SchnorrVot*, on which we'll ellaborate in a subsequent post, can be seen as special cases of *SNARV*. 

A *SNARV* is comprised of the following algorithms.

* There is a **parameters generation** (PPT) algorithm *Gen* that, on input the security parameter, outputs the public parameters *pp*.

* We suppose that at most $n$ voters $V_1,...,V_n$, with corresponding public keys (PKs) $PK_1,...,PK_n$, can register themselves in the system at any moment. Each voter $V_i$ keeps private the corresponding secret-key (SK) $SK_i$. The pair $(PK_i,SK_i)$ is produced by voter $V_i$ by means of a **setup** algorithm *Setup* on input the public parameters *pp*.

* From the $n$ possible PKs, an administrator may compute a **census** $r$ by means of a **census algorithm** *Census*, executed with input the list of all PKs $(PK_1,...,PK_n)$. The census can be used to increase efficiency by replacing the list of all PKs with a shorter string, so that verification of the election will be done with respect to the census and not  the full list of PKs.

* Each voting procedure (i.e. election) is identified by a public **election identifier** $id$. In the **voting phase**, a generic voter $V_i$ can submit to a Blockchain, possibly different from Ethereum, the **first message** $(i,v_i,Blt_i)$, where $Blt_i$ is a bit string called the **ballot** of voter $i$ computed by means of a **voting** algorithm *Vote* that takes as input the election identifier $id$, the voter's preference $v_i$ and its SK $SK_i$.

* There is a **ballot verification** algorithm *BalVerify* that on input the PK $PK$ of a voter, an election identifier $id$, a voter's preference $v\in \{0,1\}$ ($0$ denotes NO and $1$ denotes YES) and ballot $Blt$ returns $1$ or $0$ depending on whether the ballot was genuinely computed by the voter in an election for identifier $id$ or not. The ballot verification allows to discard (off-chain) invalid ballots, including double votes. The votes corresponding to the valid ballots can then be publicly tallied.


* Let $m_0,m_1$ be the number of NO and YES cast by eligible voters and let $S_0,S_1\subseteq [n]$ be the set of indices of voters who submitted a NO or YES respectively. Thus, $m_0 = \#S_0$ and $m_1 = \#S_1$. 
Now, a Prover *Prov* wants to convince a Verifier *Ver* with low resources (e.g., a smart contract that implements a transfer of funds) that the election result is $(m_0,m_1)$. The **prover** algorithm *Prov*, on input $(S_0,S_1)$, $(PK_i,v_i,Blt_i)_{i\in S_0}$  $(PK_i,v_i,Blt_i)_{i\in S_1}$, the election identifier $id$, the census $r$ and the claimed result $(m_0,m_1)$, outputs a **proof** $\pi$ of the fact that $(m_0,m_1)$ is the tally of the election.

* There is a **verifier** algorithm *Ver* that, with RAM access to all possible PKs $(PK_1,...,PK_n)$, the election identifier $id$, the census $r$, the claimed result $(m_0,m_1)$ and a proof $\pi$ outputs $1$ or $0$ to denote acceptance or rejection of the result. If the output is $1$ the funds are transferred, and are not transferred otherwise.

* There is **public-key verification** algorithm *PKVerify* that, on input the public parameters *pp* and a PK $PK$, outputs a bit $1$ to denote that the public-key is honestly computed with respect to the public parameters.  

### Security

For security, we require that no adversary is able to forge a proof for e.g., a number of YES strictly greater than the number of observed signatures for a given election. 

More formally, we define a **strong soundness** experiment for a given *SNARV*. During the experiment, an adversary can corrupt voters getting their secret-keys or controlling the generation of their public-keys. For any integer $n$, a set $C\subsetneq [n]$ and a list of $n-|C|$ elements $\{SK_i\}_{i\in [n]-C}$, we assume to have a *VoteOracle* algorithm (for non-corrupted users) $VO_{(\left\{SK_i\right\}_{i\in [n]-C},[n]-C)}(\cdot,\cdot,\cdot)$ that, on input $(id,v,i)$, outputs $Vote(id,v,SK_i)$ if $v\in\left\{0,1\right\}$ and $i\in [n]-C$ and *ERROR* otherwise.

Consider the following **strong soundness experiment** parameterized by an integer $n$, a security parameter $\lambda$, a SNARV $%(Gen,Setup,Vote,BalVerify,Prov,Ver,PKVerify)$ and an efficient adversary $A := \left\{A_\lambda\right\}_\lambda$.
	
1. **Parameters Generation Phase.**
We sample a random string of $\lambda$ bits, $s\leftarrow  \left\{0,1 \right\}^\lambda$ and generate the public prameters $\textit{pp} \leftarrow Gen(1^\lambda;s).$

2. **Corruption Phase.** 
The adversary $A$ chooses a set of "corrupted users" $C\leftarrow A(s)$ such that $C \subsetneq [n]$. 

3. **Setup Phase.** 
We generate public- and secret-keys for all non-corrupted users: $\forall i\in[n]-C$, $(PK_i,SK_i)_{i\in [n]-C}\leftarrow Setup(1^\lambda)$.


4. **Voting Phase.** 
The adversary $A$ is allowed to query *VoteOracle* to produce verifiable Ballots for any non-corrupted user. Then, $A$ is required to output an election result $(id,m_0,m_1)$ together with a proof $\pi$ of its correctness and the list of PKs for the corrupted users it has chosen in the start.
$(id,m_0,m_1,S_0,S_1,\pi,\left\{PK_i\right\}_{i\in C})\leftarrow$
$\;\;\;\;\;\;\;\;\;\;\;\;\;\;\;\;A^{VO_{(\left\{SK_i\right\}_{i\in [n]-C},[n]-C)}(\cdot,\cdot,\cdot)} (\left\{ PK_i \right\}_{i\in [n]-C}).$
Using the PKs from the setup algorithm together with the PKs of the corrupted users that $A$ provided, a census $r$ is created.
$r\leftarrow Census(PK_1,...,PK_n)$.

5. **Winning Conditions.** For any $v\in \left\{0,1\right\}$, let $S_v^q\subseteq [n]$ be such that $i\in S_v^q$ iff $A$ asked the query $(id,v,i)$ to *VoteOracle*. 
The output of the experiment is $1$ ($A$ wins) iff all the following conditions hold:
*  $\textit{Ver}(PK_1,...,PK_n,id,r,m_0,m_1,\pi)=1$.
* $S_0\cup S_1 \setminus (S_0^q\cup S_1^q\cup C) \neq \emptyset.$
* $\forall i\in[n]:\ \textit{PKVerify}(\textit{pp},PK_i)=1$. 
*  $\forall i\neq j\in [n]:\ PK_i\neq PK_j$.

A *SNARV* satisfies **strong soundness** if for all efficient adversaries $A$, the probability that $A$ wins in the strong soundness experiment is a negligible function of the security parameter $\lambda$.

With this mind, we prove

$\underline{Theorem}:$ Under the Computational Diffie-Hellman assumption, our *SNARV* protocols *BatRaVot* and *SchnorrVot* satisfy strong soundness.

### Conclusion

Our new model *SNARV* serves as a general framework for e-voting protocols. *OVOTE* and two other voting protocols BatRaVot and SchnorrVot are examples of SNARVs and one can reason about security of these protocols in a unified way. 

Furthermore, as we will explain in an upcoming post, *BatRaVot* and *SchnorrVot* improve on the gas cost compared to OVOTE when the number of voters is not to large, and offer additional security guarantees. 

Stay tuned!

### References

(1) Arnaucube, Pau Escrich, Roger Baig, and Alex Kampa. Ovote (v0.5) : Off-chain voting with on-chain trustless execution. 2022.
https://github.com/aragonzkresearch/research/blob/main/ovote/ovote.pdf.

(2) Jens Groth. On the size of pairing-based non-interactive arguments. 2016.

(3) Vincenzo Iovino, Alex Kampa and Matan Prasma. SNARV: Succinct Non-Interactive Arguments of Voting (in preparation).

