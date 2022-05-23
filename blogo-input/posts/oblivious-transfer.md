# The Bellare-Micali Oblivious Transfer

*2022-05-03 by [Alex Kampa](https://github.com/alex-kampa)*

Oblivious transfer (OT) is a cryptographical primitive introduced by Michael Rabin in 1981. It is fundamental for secure multiparty computation. It can also be combined with Garbled Circuits to construct 2-party semi-honest secure function evaluation protocols, as shown in the seminal work of Yao.

A 1-2 oblivious transfer protocol can be described as follows. Bob has 2 messages $m_0$ and $m_1$ and Alice can retrieve one, and only one, of these messages. Bob should not learn which message Alice obtained. This can be generalised to 1-n (one out of n) and k-n (k out of n) oblivious transfer protocols.

In this post, we will stick with the 1-2 protocol, for which Bellare and Micali provided a simple and elegant construction in 1989. 

## The Bellare-Micali trick

We have a group $G$ of prime order $q$ and publicly known generator $g$. As usual, the discrete log problem in $G$ is assumed to be suitably hard. The OT protocol of Bellare and Micali relies on the following fact:

Given an element $c \in G$ for which the discrete log is not known, it is impossible to find a pair $(k_0, k_1)$ such that $k_0 k_1 = c$ while knowing the discrete logs of both $k_0$ and $k_1$. It is however easy to find such a pair so that the discrete log of one of the elements is known.

As any element of $G$ can be seen as a public key, and therefore used for encrypting data, an OT protocol can be now constructed quite easily. 

## The Bellare-Micali OT protocol

The protocol works as follws:

**(1)** Bob selects a random $c \in G$ and sends it to Alice. To do that, Bob could take some random $r \in Z_q$ and set $c = g^r$. However, the knowledge of $r$ is actually not necessary. In some settings, such as a group of points on an elliptic curve, the random point could be chosen without any knowledge of its discrete log.

Note that $c$ could also be a publicly known element for which no-one knows the discrete log. This would make this first step redundant.

**(2)** Alice generates two elements $k_0, k_1 \in G$ such that $k_0 k_1 = c$. Given that Alice does not know the discrete log of $c$, the only way to achieve this is to select a random $z \in Z_q$ and to set $k_0 = g^z$ and then $k_1 = c g^{-z}$. Note that Alice does not know the discrete log of $k_1$. Alice now sends Bob one of the ordered pairs $(k_0, k_1)$ or $(k_1, k_0)$.

Note that Alice could have chosen some random $k_0$ for which she does not know the discrete log. As she will, in general, be able to compute the inverse of $k_0$, she can set $k_1 = c k_0^{-1}$ to obtain the desired relation $k_0 k_1 = c$. However, then she would not know the discrete log of any of the two points! 

Also note that if Alice does not choose $z$ randomly in step (2), she may leak information to Bob. For example, if she sent the pair $(c g^{-1}, g)$, Bob could easily find out that Alice knows the discrete log of the second point, and is therefore interested in message $m_1$.

**(3)** Bob receives the pair $(k, k')$ and verifies that $k k' = c$. If that is the case, he can be confident that Alice knows the discrete log of one, and only one, of these two points. However, if Alice has chosen $z$ randomly, Bob will not know for which one of the two group elements Alice knows the discrete log.

Using the group elements $(k, k')$ as public keys, Bob generates the encryptions $Enc(k, m_0)$ and $Enc(k', m_1)$ and sends them to Alice. Here, $Enc$ designates some suitable encryption protocol.

**(4)** Alice can now decrypt one (and only one) of these encrypted  messages. If she sent $(k_0, k_1)$ in step (2), she will be able to decrypt the message $m_0$ but not message $m_1$. And if she sent $(k_1, k_0)$ in step (2), then she will be able to decrypt the message $m_1$ but not message $m_0$.

## Conclusion

The Bellare-Micali oblivious transfer protocol can easily be extended to a 2-3 OT protocol, or more generally to a (n-1)-(n) protocol.

An extended abstract of the original paper can be found here, some of the notations are not the same as above though:

https://cseweb.ucsd.edu/~mihir/papers/niot.pdf

$\mathrm{\blacksquare}$
