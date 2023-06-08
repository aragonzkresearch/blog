# Fast Consensus in Weakly Byzantine Asynchronous Environments

*2023-05-29 by [Alex Kampa](https://github.com/alex-kampa)*

This is a summary of a paper presented at the *5th Distributed Ledger Technology Workshop (DLT 2023)* which took place on 25-26 May 2023 in Bologna, Italy. The workshop was organised by the [Italian Distributed Ledger Technology Working Group](https://dltgroup.dmi.unipg.it).

Links: [**Paper**](https://github.com/aragonzkresearch/blog/blob/main/pdf/Fast_Consensus_in_AWB.pdf) - [**Presentation**](https://github.com/aragonzkresearch/blog/blob/main/pdf/Fast_Consensus_in_AWB_slides.pdf)

### Introduction

Distributed systems rely on consensus protocols, and it is therefore important that such protocols reach consensus in the smallest possible number of communication steps. While robust consensus protocols must tolerate a range of adversarial conditions such as crashes, Byzantine behaviour and slow networks, in reality crashes and Byzantine behaviour are relatively rare and networks are generally reliable and fast. In addiiton, weaker fault-tolerance assumptions can be acceptable for certain use cases.

Our objective is to achieve one-step consensus when conditions are favorable, and to fall back to a generic protocol when necessary. To achieve this goal, we combine three methods:

1. Reduce fault tolerance assumptions
2. Introduce asymmetric consensus
3. Wait for more messages than standard protocols

The first and third of these can be used in general, while asymmetric consensus can be used when we know beforehand what the most likely decision value is. This is in particular true in leader-based consensus protocols, such as the one used by COSMOS chains.

When all three methods can be combined, consenus can often be reached in a single communication step in favourable circumstances, with only a slight weakening of fault tolerance assumptions. For example, a network of 13 nodes can tolerate 4 faulty nodes, of which 3 can be Byzantine, and still often achieve one-step consensus.


### Model

We are in the classic context in which $n$ nodes, each with an initial value of $0$ or $1$, aim to reach consensus using a predetermined randomised protocol. This is called binary consensus. The nodes that follow the protocol are said to be correct. At most $t$ nodes are faulty. Among the faulty nodes, at most $t'$ are Byzantine, the remaining $t - t'$ being crash-prone. When $t' < t$, this is called a **weakly Byzantine environment**.

The nodes communicate over a reliable asynchronous network. An adversary has control over the faulty nodes, can see the content of messages, can decide the order in which messages are delivered and can delay message delivery. However, the adversary cannot impersonate nodes and must eventually deliver all messages.

We will require the usual conditions from our protocol: *agreement* (all correct nodes decide the same value), *validity* (a correct node can only decide a value initially proposed by a correct node) and *termination* (all correct nodes decide with probability $1$). Under these assumptions, *unanimity* (if all correct nodes propose the same value, then this must be the consensus value) is implied by validity. Finally, we also require *finality*: once a correct node decides on a value, that decision is irreversible.

### Definitions

We denote by **AWB** an asynchronous weakly Byzantine environment.

A **symmetrical consensus protocol** treats both input values in a similar way, without giving preference to one or the other. An **asymmetric protocol** favours one of the two values.

A **one-step protocol** allows a decision in one communication step under certain conditions. A protocol is **strongly one-step** if it allows a one-step decision when all correct nodes have the same initial value. It is **weakly one-step** it allows a one-step decision when all correct nodes have the same initial value and there are no faulty nodes in the system.

### Binary consensus

We find that in an AWB environment, a consensus protocol requires:

$$n > 2t + t'$$

In the classic Byzantine environment, where $t = t'$, we obtain the well-known condition $n > 3t$. When $t' = 0$ we are in a crash-prone environment and we obtain the equally well-known condition $n > 2t$.

The paper states that it remains an open question whether this is, in general, an optimal bound. The following very simple proof was found shortly after the paper was submitted for publication. When $t' = 0$ the bound is know to be optimal, so we assume $t' > 0$. Assume we have $n = 2t + t'$ nodes, with the set $N_0$ of $t$ correct nodes having an initial value 0, and the set $N_1$ of $t$ correct nodes having an initial value 1. The adversary can (1) delay messages between $N_0$ and $N_1$ for as long as necessary (2) make all Byzantine nodes pretend to have initial value $0$ when communicatins with nodes in $N_0$ and (3) make all Byzantine nodes pretend to have initial value $1$ when communicatins with nodes in $N_1$. Because of unanimity, all nodes in $N_0$ must decide $0$, and all nodes in $N_1$ must decide $1$, which is a contradiction.


### Symmetric one-step consensus

We find that one-step binary consensus in an AWB environment is possible with the following conditions:

- A weakly one-step protocol requires $n > 3t + 2t'$ nodes
- A strongly one-step protocol requires $n > 3t + 4t'$ nodes 

We introduce the W-Bosco algorithm for weakly Byzantine environments, which generalises the Bosco algorithm proposed by Yee Jiun Song and Robbert van Renesse. W-Bosco does not improve on Bosco, but it introduces an element of choice: if less Byzantine failures can be tolerated, crash resilience can be increased.


### Asymmetric consensus

Sometimes it is known in advance that one of the binary values is more likely to occur as the consensus value. This could be the case, for example, when the nodes must decide if the proposal of a "round leader" is valid or not. In most cases, such a proposal is expected to be accepted. One-step consensus can then be achieved more easily for that value. We introduce the W-Bosco-0 protocol which favours the value $0$ in the first step and find that: 

- W-Bosco-0 is weakly one-step for the value $0$ if $n > 2t + 2t'$
- W-Bosco-0 is strongly one-step for the value $0$ if $n > 2t + 3t'$


### Waiting for more messages to speed up consensus

Another way to achieve one-step consensus is to wait for more than the canonical n-t messages. The additional waiting time should be proportional for the time it took to receive the first $n - t$ messages. This method can be used in cases when receiving additional messages is likely and will expedite consensus.

A one-step decision in the asymmetric case is possible when > t + 2t’ identical messages are received. If we want to increase fault tolerance for a given n, while still allowing for a one-step decision in some cases, we must choose t and t’ such that:

$$n – t ≤ t + 2t’ < n$$

For a given n, there are multiple pairs (t, t’) that can be chosen.


### An example with 50 nodes

With 50 nodes, we know that a generic consensus protocol can tolerate up to t = t’ = 16 Byzantine nodes. Assume we want a protocol that tolerates 16 Crash-prone nodes. Let’s see how many Byzantine nodes we can tolerate under different assumptions.

|                                   | wait   | t  | t' |
|-----------------------------------|--------|----|----|
| Underlying consensus              | 34 msg | 16 | 16 |
| Weakly 1-step, symmetric          | 34 msg | 16 | 0  |
| Weakly 1-step, asymmetric         | 34 msg | 16 | 8  |
| Weakly 1-step, asymmetric, wait+7 | 41 msg | 16 | 12 |

Conclusion: by waiting for 41 messages instead of 34, one-step consensus can be achieved in favourable conditions, while still tolerating a significant number of crash-prone and Byzantine nodes.

---