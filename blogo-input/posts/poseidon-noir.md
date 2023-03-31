# The Poseidon hash function and its implementation in Noir
*2023-03-31 by [Ahmad Afuni](https://github.com/ax0)*

The Poseidon hash function, introduced by [Grassi, Khovratovich, Rechberger, Roy and Schofnegger](https://eprint.iacr.org/2019/458.pdf), is a hash function particularly suited to zero-knowledge applications, owing to its efficient implementation in terms of arithmetic circuits and thus in ZK languages more generally. In this blog post, we provide a brief description of this hash function, which provides a contrast with the SHA-2 family of hash functions discussed in a [previous post](sha512-noir.html), and discuss its implementation in Aztec's [Noir](https://noir-lang.org/) language.


# The Poseidon permutation

There are various hash functions in circulation referred to as the *Poseidon hash function*. Underlying all of them is a certain parameter-dependent construction known as the *Poseidon permutation*, which we introduce in this section.

Let $\mathbb{F}$ be a finite field of prime order $p$ and introduce the following constants:

-   $t\in\mathbb{N}$ at least $2$ (*width*)
-   $R_{f}\in \mathbb{N}$ even and $R_{p}\in\mathbb{N}$ (number of *full* and *partial* rounds respectively)
-   $\alpha\in\mathbb{N}$ (*S-box power*)
-   $\textup{ark}:=\{\textup{ark}_{i}\in \mathbb{F}^{t}: i\in\{1,\dots, R_{f} + R_{p}\}\}$ (*additive round keys* or *round constants*)
-   $\textup{mds}:=\{\textup{mds}^{i}_{j}: i,j\in\{1,\dots,t\}\}$ (*maximal distance separable (MDS) matrix*)

We write these constants as a tuple $\mathfrak{P}:=(t,R_{f},R_{p},\alpha,\textup{ark},\textup{mds})$ and call it a *Poseidon permutation configuration*. Given such a configuration, we define for each $i\in\{1,\dots, R_{p} + R_{f}\}$ the so-called $i$th *full* and *partial round functions* $\rho_{f}(\mathfrak{P})_{i},\rho_{p}(\mathfrak{P})_{i}:\mathbb{F}^{t}\rightarrow\mathbb{F}^{t}$ by

$$\begin{aligned}\rho_{f}(\mathfrak{P})_{i}(x) &= \textup{mds}(\textup{pow}(x+\textup{ark}_{i},\alpha))\\\rho_{p}(\mathfrak{P})_{i}(x) &=\textup{mds}(\textup{pow}_{1}(x+\textup{ark}_{i},\alpha)), \end{aligned}$$

where $\textup{pow}(\cdot, \alpha), \textup{pow}_{1}(\cdot,\alpha):\mathbb{F}^{t}\rightarrow\mathbb{F}^{t}$ denote the *full* and *partial [S-box](https://en.wikipedia.org/wiki/S-box) functions* obtained by raising all components of $x\in\mathbb{F}^{t}$ to the power $\alpha$ in the former case and raising only the first component to the power $\alpha$ in the latter case, i.e.

$$\begin{aligned}\textup{pow}(x,\alpha)&=((x^{1})^{\alpha},\dots,(x^{t})^{\alpha})\\ \textup{pow}_{1}(x,\alpha)&= ((x^{1})^{\alpha},x^{2},\dots,x^{t}). \end{aligned}$$

With the above definitions in mind, the *Poseidon permutation* $\pi(\mathfrak{P}):\mathbb{F}^{t}\rightarrow\mathbb{F}^{t}$ is defined as the composition

$$\pi(\mathfrak{P})=\rho_{f}(\mathfrak{P})_{R_{p}+R_{f}}\circ\dots\circ \rho_{f}(\mathfrak{P})_{R_{p} +\frac{R_{f}}{2} + 1}\circ\rho_{p}(\mathfrak{P})_{R_{p} + \frac{R_{f}}{2}}\circ\dots\circ\rho_{p}(\mathfrak{P})_{1 + \frac{R_{f}}{2}}\circ \rho_{p}(\mathfrak{P})_{\frac{R_{f}}{2}}\circ\dots\circ\rho_{p}(\mathfrak{P})_{1}.$$

In words, it subjects its input to a total of $R_{f} + R_{p}$ *rounds* of function applications, the first $R_{f}/2$ being *full rounds*, the next $R_{p}$ *partial rounds* and the last $R_{f}/2$ full rounds again.

One possible definition of the Poseidon *hash* function is then the projection of the Poseidon *permutation* function onto its first component. However, this is not the only hash function used in practice (see the following section).

While the definition above is fairly straightforward, it relies on a careful choice of the constants in $\mathfrak{P}$ to be useful in practice. In particular, they should be chosen in such a way that for a given input $x\in \mathbb{F}^{t}$, $\pi(\mathfrak{P})(x)$ should look more or less random. Briefly, $\alpha$ should be chosen such that $\textup{gcd}(\alpha,p-1)=1$ and the $\textup{mds}$ matrix and additive round keys (thus also the number of rounds) are chosen in such a way as to mitigate invariant subspace attacks. [Sage scripts](https://extgit.iaik.tugraz.at/krypto/hadeshash) are provided to generate appropriate constants so as to attain various levels of security and a discussion of this may be found in Appendix C  of the [paper](https://eprint.iacr.org/2019/458.pdf).

While the Poseidon permutation is in widespread use in a number of ZK projects for fields such as those associated with the BN254 and BLS12-381 curves, there is no universally agreed upon collection of constants that define *the* Poseidon permutation for a given field and width. In the case of the field of the same order as the BN254 curve, the *de facto* standard permutation configuration is [that used by the *Circom* project](https://raw.githubusercontent.com/iden3/circomlib/master/circuits/poseidon_constants.circom), which is also used [here](https://github.com/arnaucube/poseidon-rs).

Our implementation of $\pi(\mathfrak{P})$ in Noir is a straightforward adaptation of the above definition and is the function `permute` defined [here](https://github.com/ax0/noir/blob/master/noir_stdlib/src/hash/poseidon.nr) for a general Poseidon permutation configuration and [here](https://github.com/ax0/noir/blob/master/noir_stdlib/src/hash/poseidon/bn254.nr) for a version specialised to the configuration specific to the field of the same order as BN254 mentioned above. In both cases, we loop through the rounds, though in the more general one we have to embed an `if` statement in the `for` loop to use the round bounds due to a technical limitation. Moreover, the $\textup{mds}$ matrices and additive round keys used are implemented as arrays representing the underlying matrices in row-major form. The configurations used may be found [here](https://github.com/ax0/noir/blob/master/noir_stdlib/src/hash/poseidon/bn254/consts.nr).

# The Poseidon sponge function

In certain applications, we may want to hash strings of elements of $\mathbb{F}$ of arbitrary length without instantiating a different Poseidon permutation for each such string; that is to say, we wish to fix a Poseidon permutation configuration $\mathfrak{P}$ once and for all, appropriately extend the corresponding permutation to a mapping $\mathbb{F}^{\ast} = \bigcup_{i=1}^{\infty}\mathbb{F}^{i}\rightarrow\mathbb{F}^{t}$ to 'absorb' an arbitrary string, then further process the output to obtain the desired hash subject to appropriate security requirements. The sponge construction provides a natural method of doing so.

The idea behind the *absorption* phase of the sponge construction in this context is as follows: We fix a constant $r\in\{1,\dots, t-1\}$, called the *rate* of our sponge, call $c:=t-r$ the *capacity*, and fix a so-called *initial state* $s\in\mathbb{F}^{t}$. Given a string $x=(x^{1},\dots,x^{n})\in\mathbb{F}^{n}$, we take the first $r$ components of $x$, add them to the *last* $r$ components of $s$ and apply $\pi(\mathfrak{P})$ to this element of $\mathbb{F}^{t}$. If $n < t$, then we treat it as an element of $\mathbb{F}^{r}$ by tacking zeros on to the end of it. This gives rise to a new state $s'\in\mathbb{F}^{t}$ and a new string $(x^{r+1},\dots,x^{n})$, which may possibly be empty. This procedure is iterated until we are left with the empty string as our new string, the final state being the desired Poseidon absorption function output.

More formally, given $r,c\in\{1,\dots,t-1\}$ with $r+c = t$ and $\mathfrak{P}$ a Poseidon permutation configuration as before, we call the symbol $\mathfrak{P}_{r,c}$ a *Poseidon sponge configuration* and define for each *initial state* $s\in\mathbb{F}^{t}$ the Poseidon absorption $\pi(\mathfrak{P}_{c,r,s})(s,\cdot):\mathbb{F}^{\ast}\rightarrow\mathbb{F}^{t}$ as follows: For the empty string $()$,

$$\pi(\mathfrak{P}_{r,c})(s,()) = s,$$

and whenever $x=(x^{1},\dots,x^{n})\in\mathbb{F}^{n}$, if $n \geq r$, then

$$\pi(\mathfrak{P}_{r,c})(s,x) = \pi(\mathfrak{P}_{r,c})(\pi(\mathfrak{P}(s^{1},\dots,s^{c},s^{c+1}+x^{1},\dots,s^{c+r}+x^{r})),(x^{r+1},\dots,x^{t})),$$

else

$$\pi(\mathfrak{P}_{r,c})(s,x) = \pi(\mathfrak{P}_{r,c})(s,(x^{1},\dots,x^{n},\underbrace{0,\dots,0}_{t-n\ \textup{times}})).$$

In addition to the absorption, a *squeezing* may be carried out as follows: Fix $o\in\{1,\dots,r\}$, let $y=\pi(\mathfrak{P}_{r,c})(s,x)$ and define the sequence $a_{i} = (\pi(\mathfrak{P})^{i}(y)^{1},\dots, \pi(\mathfrak{P})^{i}(y)^{o})$, i.e. we iterate the Poseidon permutation on the output of the absorption phase and select the first $o$ components of the resulting vector. Depending on the application and desired level of security, the vector obtained by concatenating $a_{0},\dots, a_{N}$ for some fixed $N$ may be defined as the output of a Poseidon hash function. An implementation of this sponge construction may be found in the [Arkworks library](https://github.com/arkworks-rs/crypto-primitives/tree/main/src/sponge/poseidon).

We have implemented the absorption phase in Noir as the function `absorb` [here](https://github.com/ax0/noir/blob/master/noir_stdlib/src/hash/poseidon.nr) for a general configuration and [here](https://github.com/ax0/noir/blob/master/noir_stdlib/src/hash/poseidon/bn254.nr) for the field associated with BN254. Moreover, in the latter case, we have implemented the function `sponge` in accordance with a recommendation in §3 of the [paper](https://eprint.iacr.org/2019/458.pdf), which is the projection onto the second coordinate, i.e. the first coordinate of the 'rate part', of an absorption with width $t=5$ and rate $r=4$; note that this contrasts with the convention typically used e.g. by Circom where the Poseidon hash function is defined to be the projection onto the first coordinate, i.e. the 'capacity part' of the permutation.


# Conclusions on Poseidon and ZK

An comparison of the above expressions to those defining hash functions such as those in the SHA-2 family reveals that the computation of a Poseidon hash function requires far fewer multiplications due to the lack of bit manipulations, and this is reflected in our implementations in Noir. This is a key factor in choosing Poseidon over other families of hash functions, since in the context of ZK proofs, it results in smaller proof sizes, thus more efficient programs. In fact, the above formulation may be optimised further by appropriately swapping the order of operations in the partial rounds and modifying the additive round keys appropriately. Details may be found in Appendix B of the [paper](https://eprint.iacr.org/2019/458.pdf).

In our own ZK applications, we have employed the Poseidon hash function in the [circuits](https://github.com/aragonzkresearch/ovote/blob/main/circuits) underlying [OVOTE](https://forum.aragon.org/t/we-present-ovote-offchain-voting-with-onchain-trustless-execution/3603). Moreover, we have submitted our [implementation](https://github.com/noir-lang/noir/pull/768) of the Poseidon family of hash functions to Aztec's Noir project for inclusion in the Noir standard library and hope to make use of it in our future projects.


<a id="orgab7ab08"></a>

# References

-   [Grassi et al. - Poseidon: A New Hash Function for Zero-Knowledge Proof Systems](https://eprint.iacr.org/2019/458.pdf)
-   [Grassi et al. - Poseidon2: A Faster Version of the PoseidonHash Function](https://eprint.iacr.org/2023/323.pdf)
- [Poseidon | Filecoin Spec](https://spec.filecoin.io/algorithms/crypto/poseidon/)
