# Adding Vote Delegation to Anonymous E-Voting Schemes

*2022-05-06 by [Vincenzo Iovino]*

Anonymous e-voting systems, often based on SNARK proof systems, provide the following features and security properties:
        **Easy tallying.** The votes appear on the bulletin board in the clear, so the tally can be easily computed and checked at hand as in traditional paper-based elections.
     **Anonymity.**               A vote cannot be associated to any of the eligible voters. However, only eligible voters are allowed to cast one and only one valid vote.
        **Individual and universal verifiability.** Each eligible voter can quickly check that its vote was counted. Moreover, everyone, even a third party who did not participate in the election, can check that the election process was run faithfully.
        **No authority is trusted for privacy.** There is no authority or participant in the electronic election that is able to guess what a voter voted for. Moreover, no authority or participant is even able to detect whether a voter casted a vote.


One example of such voting schemes based on SNARK proofs is [VocDoni](https://aragon.org/vocdoni) developed by Aragon Labs.
## Delegation
We would like to add a new feature, namely *delegation.*
This means that a *delegator* can issue to a *delegatee* a *token* $T_f$ relative a predicate $f$ so that the delegatee will be able to only submit a vote $v$ for the election identified by the identifier $id$ iff $f(v,id)=1$.
Observe that in this framework we can capture all delegation mechanisms. For instance, the predicate $f$ can just check that the identifier $id$ corresponds to the identifiers of the elections running in 2022 and 2023 or can check that $v$ belongs to a subset of options.


## Snark-based anoynmous e-voting schemes
Before describing our proposal to add delegation, we present a construction of a typical SNARK-based anonymous e-voting scheme. The following description is generic and does not describe a specific implementation.

A typical anonymous e-voting scheme from SNARKs look as follows.

*Setup Phase.* Let $n$ be the number of eligible voters. For each $i=1,\ldots,n$, we assume voter $i$ registers in the system with a public-key $ok_i$ for the signature scheme and retains privately the corresponding secret-key $sk_i$.
All public-keys $(pk_1,\ldots,pk_n)$ of all eligible voters are published on a blockchain.

The setup algorithm builds a Merkle tree $M$ (called the *census*) from $(pk_1,\ldots,pk_N)$ and publishes it on the blockchain. Let us call $R$ the root of $M$. The setup procedure outputs $R$ as public-key of the e-voting scheme. Note that the voter's public-keys are the leaves of $M$.

We assume a public identifier $id$ is chosen for this election and published on the blockchain The string $id$ can be for instance the day in which the election is run along with other information about the election.

*Cast Phase.* Each eligible voter $V$ who decides to cast a vote $v$ proceeds as follows.

Let $v$ be the intended vote that $V$ wants to cast. The string $v$ can be both a valid voting option (e.g., the name of a candidate) or an arbitrary string representing an invalid vote. 

Let $sk_V$ be the secret-key of $V$ corresponding to public-key $pk_V$, and let $h_V=H(sk_V,id).$

Let $p$ be the Merkle-path in $M$ that proves that $R$ is the root of a tree that has $pk_V$ as leaf.
Note that the length of $p$ is logarithmic in $M$.

Let $C^{R,v,h_V,id}$ be the following Boolean circuit with one output gate.

$C^{R,v,h_v,id}$ depends on the constants $R,v,h_V,id$, takes as input a pair $w=(p,sk_V)$ and outputs $1$ if and only if *all* the following conditions are verified:
**(1)** The string $p$ is a Merkle-path from $R$ to $pk_V$.
**(2)** $sk_V$ is a secret-key corresponding to the public-key $pk_V$. 
**(3)** $h_v=H(sk_V,id)$.

Note that the values $R,v,h_V,id$, and thus $C^{R,v,h_v,id}$, will represent public information while $w$ is only known to $V$.
The voter $V$ use the SNARK prover to compute a proof $\pi_V$ of the fact that $C^{R,v,h_v,id}$ is satisfied by witness $w$.

$V$ publishes on the blockchain her ballot $B_V=(v,h_V,\pi_V)$.
*Discarding invalid votes and duplicates.*
When a voter sends a ballot $(v,h_V,\pi_V)$ to the PBB, we assume that if the proof $\pi_V$ is not accepted by the SNARK verifier, an error symbol $\bot$ is written next to the ballot to indicate that $v$ should not be considered for the tally.

Moreover, if two ballots $B_1=(v_1,h_1,\pi_1)$ and $B_2=(v_2,h_2,\pi_2)$ with $h_1=h_2$ are found, they should be considered a *duplicate* vote.
Indeed, the purpose of the hash $H(sk_V,id)$ is to tie the voter $V$ with the election $id$ so to be able to detect whether $V$ (without revealing the identity of $V$) voted multiple times.
According to the election policy, both ballots can be discarded or only the second one can be discarded.



*Tallying Phase.*
The tally can be now publicly computed from all votes $v$ in each ballot. Note that $v$ can be still an invalid voting option but we have the insurance that one of the voters (we do not know which) intended to write $v$ on the blockchain.


## Adding delegation
We propose the following.

When Alice wants to delegate to Bob a token for predicate $f$, Alice does the following.
First, let $(pk,sk)$ be the public- and secret- key pair of Alice. We suppose that $pk$ is in the census Merkle Tree.
Alice generate a new pair of public- and secret- key $(pk',sk')$ for the digital signature scheme (the same used to create the public- and secret- keys of the census Merkle Tree).

(Observe that the previous version of VocDoni does not use signatures directly, but still the Merkle Tree consists of public-keys of a digital signature scheme.)

Alice signs the string $(vk'||f)$ with secret-key $sk$, that is Alice generates the signature $\sigma\=Sign(sk,(vk'||f))$.
Finally, Alice sets as token $T_f$ the following:
$$T_f= (sk', \sigma).$$

Alice can pass the token $T_f$ to Bob and Bob can use it to vote for any option satisfying $f(v,id)=1$ where $id$ is the identifier of the election.

The circuit for the SNARK proof is changed as follows. The public statement consists of the vote $v$, the nullifier but also the function $f$. The witness input by Bob consists of the token $T_f$ and a path in the Merle Tree to $vk$.
The circuit checks that the path points to $vk$ and that $\sigma$ is a valid signature with respect to $vk$ of message $vk'||f$ and that $f(v,id)=1$ (where $id$ is the identifier of the election). Moreover, the circuit does the usual check on the nullifier to prevent double voting but the secret-key used to compute the nullifier is $sk'$.

Note that if Alice wants to vote, she can vote by simulating this delegation to herself.


#### Allowing the voter to change mind before the end of the election.
In the previous proposal, once the vote is delegated the delegator cannot change mind.
If this is necessary the scheme can be changed as follows.
The public statement will include a bit $b$ indicating whether the vote is a direct vote from a voter or is a delegated vote.
Delegated vote will work as before setting the bit to $1$ but direct vote will work setting the bit to $0$ and the circuit will work as described above in the version without delegation.

Now, if there are two nullifiers in the blockchain, one of which with the bit set to $1$ and one with the bit set to $0$, only the one with bit set to $0$ will be counted to indicated that delegated vote has to be discarded to give priority to direct vote.

#### Distributing a token to multiple delegatees.
Notice that the mechanism allows distribution of a token to multiple delegatees. Then, depending on the policy, only one vote submitted by these delegatees will be counted. It can be thought like delegating the trust to anyone in a given group and at the same time trying to increase the chance that one of them will actually submit a vote.

## Conclusion 
The idea of delegating voting capability traces back to Charles Dodgson (more commonly known by his pseudonym Lewis Carroll), the author of the novel Alice in Wonderland, who first envisioned  the ability to transfer votes related to the modern concept of Liquid Democracy.
In recent years, delegation of voting rights has been proposed as a potential solution to the problems in [coin voting](https://vitalik.ca/general/2021/08/16/voting3.html?msclkid=48c0f9a9ceef11ec994d3e607dcc1d8c).

We showed a simple and elegant way to add delegation capability to current SNARK-based anonymous e-voting  scheme like [VocDoni](https://aragon.org/vocdoni). Our proposal does not significantly increase the complexity and does not rely on new assumptions.

$\mathrm{\blacksquare}$
