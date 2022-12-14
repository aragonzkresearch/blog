# SHA512 and its implementation in Noir

*2022-12-14 by [Ahmad Afuni](https://github.com/ax0)*

The SHA-2 family of hash functions, of which SHA256 and SHA512 are particular instances, are ubiquitous in cryptographic applications due to their ease of computation on modern computers. In this blog post, we discuss the SHA512 hash function and its implementation in Aztec's Noir, a domain-specific language for constructing and verifying zero-knowledge (ZK) proofs.

## Noir
### What is Noir?
In a nutshell, [Noir](https://aztec.network/noir/) is a programming language with [Rust](https://www.rust-lang.org/)-like syntax that allows you to compile programs to an intermediate language that may then be further compiled to an *[arithmetic circuit](https://tlu.tarilabs.com/cryptography/rank-1#arithmetic-circuits)* or *[rank-1 constraint system](https://tlu.tarilabs.com/cryptography/rank-1#rank-1-constraint-systems)*, thereby facilitating the construction and verification of zero-knowledge proofs. Its main draws are its ease of use, its familiar syntax and its abstracting away of the underlying arithmetic circuit required to construct a proof. In other words, a background in ZK proofs is _not_ necessary for using Noir. It supports different proving systems as backends, and, by analogy with Rust's *[cargo](https://doc.rust-lang.org/cargo/)*, it comes with the *[nargo](https://noir-lang.github.io/book/getting_started/nargo.html)* package manager. It also generates *[smart contracts](https://ethereum.org/en/developers/docs/smart-contracts/)* that verify its proofs.

### Demonstration
To illustrate the simplicity of Noir, here is a screencast where we

- create a project,
- build a proof,
- verify a proof, and
- create a smart contract verifying the proof

using _nargo_, Noir's package manager:

<script id="asciicast-3ICFfvTVoDb2hQyOtBLFnyEsx" src="https://asciinema.org/a/3ICFfvTVoDb2hQyOtBLFnyEsx.js" async></script>

Installation instructions for various platforms may be found in the official [documentation](https://noir-lang.github.io/book/index.html).

### Language features
Analogously to Rust, Noir has the usual unsigned integer data types (e.g. `u8`, `u32` and `u64`), but it also has a backend-dependent `Field` data type, which is modeled on a [finite field](https://ncatlab.org/nlab/show/finite+field); with the primary backend, it is none other than $\mathbb{F}_{p}$, where `p=0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001`, i.e. the order of the BN254 ([alt_bn128](https://github.com/scipr-lab/libff/blob/674e437446216ade040194105b4fc9ff3d8db6f1/libff/algebra/curves/alt_bn128/alt_bn128.sage)) curve or, alternatively, the order of the base field of the [Baby Jubjub curve](https://eips.ethereum.org/EIPS/eip-2494). Noir also has tuples, record types and fixed-length array types. At the time of writing, it has no vector or slice support, but there is some support for function signatures including arrays of unspecified length, which we made use of in our implementation of SHA512.

## Hash functions in a nutshell
### The idea
In brief, a *[hash function](https://en.wikipedia.org/wiki/Cryptographic_hash_function)* $h$ is a mapping taking a message of any length as input and returning a number, called a _message digest_ (or _hash_) as output. A hash function $h$ should be

- _collision-resistant_ in the sense that it should be hard to find $x_{1}\neq x_{2}$ such that $h(x_{1}) = h(x_{2})$, and
- _one-way_ in the sense that given a number $y$, it should be hard to find an $x$ such that $h(x) = y$, i.e. it should be difficult to guess the message belonging to a particular message digest. 

Hash functions are ubiquitous in the digital world, where they are used for data integrity checks and data hiding. A hash function should be relatively fast to compute, and its output should be seemingly random, despite its deterministic nature.

### Construction
There are many different hash functions in current use, the choice depending on a compromise between security and computation speed. That being said, many of them are constructed by means of an iterative process typically consisting of the following steps:

- **Compression**: Define a so-called _compression function_ $C:X^{n}\times H\rightarrow H$ that takes a message of some fixed length $n$ (i.e. a sequence of $n$ elements of some set $X$) and an element of $H$ as input and returns an element of $H$ as output. $H$ is typically the set where the message digest will reside. Depending on the particular construction, some form of collision resistance may be assumed of $C(\cdot, \chi)$ for fixed $\chi\in H$.
- **Padding**: Given an arbitrary message $m\in X^{i}$, $i\in\mathbb{N}$, append (or prepend) elements of $X$ to it to obtain a new message $m'\in X^{kn}$ for some $k\in\mathbb{N}$.
- **Block decomposition**: Split $m'$ up into blocks $m_{1},m_{2},\dots, m_{k}\in X^{n}$ with $m' = m_{1}||\dots ||m_{k}$, where $||$ denotes [concatenation](https://en.wikipedia.org/wiki/Concatenation).
- **Absorption**: Apply some rule that absorbs all of the $m_{i}$'s and returns a value in $H$ through appropriate applications of $C$, e.g. fix some $h_{0}\in H$ and compute the sequence $\{h_{i}\}_{i=1}^{k}$ according to the rule $h_{i} = C(m_{i}, h_{i-1})$.
- **Squeezing** (optional): Apply more operations to the output obtained from the preceding step. In the concrete case mentioned in the preceding step, this could be a matter of computing $f(h_{k})$ for some function $f:H\rightarrow H'$.
- **Output**: Return (a combination of) the output from the preceding step(s) and call that the message digest.

The result of the above steps is that we obtain a mapping $h:\bigcup_{i=1}^{\infty}X^{i}\rightarrow H$. $X$ is typically taken to be $\{0,1\}$ (i.e. the set of bits) or a [prime field](https://ncatlab.org/nlab/show/prime+field), and $H$ is usually the integers modulo $N$ for some $N\in\mathbb{N}$.

Two constructions that are variations on the above theme are the *[Merkle-Damgård](https://en.wikipedia.org/wiki/Merkle%E2%80%93Damg%C3%A5rd_construction)* and *[sponge](https://keccak.team/sponge_duplex.html)* constructions. The [SHA-1 and SHA-2](https://csrc.nist.gov/publications/detail/fips/180/4/final) families of hash functions are based on the former construction and the [SHA-3](https://www.nist.gov/publications/sha-3-standard-permutation-based-hash-and-extendable-output-functions) family on the latter. We now turn our attention to a particular member of the SHA-2 family. 

## SHA512 and its implementation
### The algorithm in short
The SHA512 hash function takes a sequence of bits, i.e. an element of $\bigcup_{i=1}^{\infty}\{0,1\}^{i}$, as its input and returns a 512-bit message digest as its output. Its official specification may be found [here](https://doi.org/10.6028/NIST.FIPS.180-4), and we shall refer back to this specification in the following discussion.

As remarked earlier, SHA512 is constructed along the lines of the iterative process outlined earlier, processing a message 1024 bits at a time. Concretely:

- **Compression**: Define a certain compression function $C:\{0,1\}^{1024}\times\{0,1\}^{512}\rightarrow\{0,1\}^{512}$ that applies a combination of bitwise operations, bit shifts, rotations and additions modulo $2^{64}$ to its inputs (see §6.4.2 on p. 24 of the spec). Note that the message portion of the input to $C$ consists of 1024 bits, which suggests that we should pad the input message so that its bit-length is a multiple of 1024.
- **Padding**: Given an arbitrary message $m\in\{0,1\}^{i}$, append a $1$ bit, $z$ zero bits, and the 128-bit representation of $i$, where $z\in\mathbb{N}\cup\{0\}$ is the smallest number such that the length of this new message is a multiple of 1024, i.e. $m'\in\{0,1\}^{k\cdot 1024}$ for some $k\in\mathbb{N}$.
- **Block-decomposition**: Split $m'$ up into blocks $m_{1},\dots, m_{k}\in\{0,1\}^{1024}$ with $m'=m_{1}||\dots||m_{k}$.
- **Absorption**: Let $h_{0}\in\{0,1\}^{512}$ be the concatenation of the first 64 bits of the fractional parts of the square roots of the first 8 prime numbers in ascending order (see §6.3.5 on p. 15 of the spec) and for $i\in\{1,\dots, k\}$, compute $h_{i} = C(m_{i},h_{i-1}) + h_{i-1}$ (modulo $2^{64}$).
- **Output**: Return $h_{k}$.

To illustrate the padding process, in ASCII, the string "kebab" has binary representation `01101011 01100101 01100010 01100001 01100010` (`0x6b65626162` in hex), which is of bit-length 40. After padding, we obtain the following number:

`01101011 01100101 01100010 01100001 01100010`
`10000000 00000000 ... 00000000` ($1$ followed by $1024-40-1-128 = 855$ zero bits)
`00000000 ... 00000000 00101000` (128-bit representation of the bit-length of the string, i.e. 40).

In general, a message $m$ of bit-length $l$ admits a unique decomposition of the form $m_{1}|| \dots || m_{N-1} || m_{N}$ for some $N\in\mathbb{N}$ such that $m_{i}$ is of bit-length $1024$ for $i\in\{1,\dots, N-1\}$ and $m_{N}$ is of bit-length $n= l\mod 1024\in\{0, \dots, 1023\}$, where a message of bit-length $0$ is interpreted as the empty string. In the case above, $N=1$ and $n=40$ so that we have $1024-40 = 984$ bits in the current block to apply the padding rule. In the case where $n$ is so large (i.e. greater than $1024-1-128 = 895$) that we cannot simply apply the padding rule to complete $m_{N}$ to a block $m_{N}'$ of bit-length $1024$, we would append a 1 bit followed by $1024-n-1$ zero bits to make $m_{N}$ a $1024$-bit block, then append an additional 1024-bit block consisting of $1024-128 = 896$ zero bits followed by the 128-bit representation of the bit-length of the message. An example of this may be found [here](https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA512.pdf).

### Implementation in Noir
Our implementation of SHA512, which is now part of the Noir standard library, may be found [here](https://github.com/noir-lang/noir/blob/master/noir_stdlib/src/sha512.nr). Rather than processing messages one bit at a time, we process them one _byte_ at a time and return the message digest as a byte array, which is typical of implementations of the SHA-2 family. We now do a rundown of the code.

Lines 6-39 define the relevant auxiliary bit manipulation functions from the spec (cf. §4.1.3 on p. 11 of the spec), lines 41-57 define the so-called _expanded message block function_ which applies some of the aforementioned bit manipulation functions to the message block being processed to prepare it for further processing in the compression function, whose definition is on lines 60-82. These functions operate on `u64` numbers rather than bytes, since they rely on 64-bit operations; a helper function for this conversion is defined on lines 85-98, and appropriate conversions are made throughout the hash function (here called `digest`), which may be found on lines 101-192.

A quick comparison of the code with the specification shows an almost direct translation with the exception of the function `digest`. Instead of padding the message at the start, we allocate a message block array (of type `[u8; 128]`) and fill it up as we move along the bytes of the message until we have a 128-byte (1024-bit) block to absorb, at which point we absorb it, obtaining the _intermediate hash_ $h_{1}$, then fill the message block array with the next 128-byte block, which is then absorbed to yield an intermediate hash $h_{2}$, and continue this process until the end of the message is reached; in other words, given an input message $m$, we make use of the decomposition $m = m_{1}||\dots || m_{N}$ outlined in the preceding section and absorb message blocks $m_{1},\dots, m_{N-1}$. The relevant code is on lines 109-124. Lines 128-179 then append the 1 bit to the final (incomplete) message block $m_{N}$ and check the resulting message block, $m_{N}||1$, which consists of $l + 1 \mod 128$ bytes, where $l$ is the length of $m$, to determine whether it is possible to simply complete it (see discussion of padding in the preceding section).

Note that the alternative of pre-allocating a padded message array is not available to us at the time of writing, as there is no mechanism for dynamically allocating arrays. Despite this, it is possible to define functions whose signatures contain arrays of unspecified lengths. Also, in the aforementioned code, there are a couple of instances of for loops with somewhat arbitrary-looking bounds with an unused loop variable (lines 138 and 156); these were dictated by the constraint that only certain expressions involving compile-time constants (including array lengths) are allowed in for loop bounds, and there is no alternative loop construction.

### Illustration of implementation
It may be checked using any implementation of SHA-512 that the ASCII string ``"kebab"`` has message digest `0xf5f5bd14be042c2568709b6f5a2cd77840eec1209f9ce8ede4679a7be631228dc33880f43e582a3e41cfb5221af89567c1ba893d96a1412f37ea7dcbeaebfa6b`. We may construct a ZK proof that a prover knows a 5-byte string with this message digest and verify it using our implementation of SHA512 as follows: First create a new project by running

`nargo new sha512_test`

and populate `sha512_test/src/main.nr` with the following code:

```
use dep::std;

fn main(x: [u8; 5]) -> pub [u8; 64] {
        std::sha512::digest(x)
}
```

Running `nargo build` builds the constraint system. Now populate `sha512_test/Prover.toml` with

```
x = [0x6b, 0x65, 0x62, 0x61, 0x62]
return = [0xf5, 0xf5, 0xbd, 0x14, 0xbe, 0x04, 0x2c, 0x25, 0x68, 0x70, 0x9b, 0x6f, 0x5a, 0x2c, 0xd7, 0x78, 0x40, 0xee, 0xc1, 0x20, 0x9f, 0x9c, 0xe8, 0xed, 0xe4, 0x67, 0x9a, 0x7b, 0xe6, 0x31, 0x22, 0x8d, 0xc3, 0x38, 0x80, 0xf4, 0x3e, 0x58, 0x2a, 0x3e, 0x41, 0xcf, 0xb5, 0x22, 0x1a, 0xf8, 0x95, 0x67, 0xc1, 0xba, 0x89, 0x3d, 0x96, 0xa1, 0x41, 0x2f, 0x37, 0xea, 0x7d, 0xcb, 0xea, 0xeb, 0xfa, 0x6b]
```

Running `nargo prove proof` and `nargo verify proof` will construct and verify the proof.

## Concluding remarks
We detailed the implementation of SHA512 in Noir above and went through an example making use of it in a ZK proof. If you followed the example closely, you may have noticed the somewhat long proof generation and verification times; on my 5-year-old laptop for example, these processes take several minutes and consume quite a bit of memory. Digging deeper reveals why: Bitwise operations are expensive in arithmetic circuits!

While SHA512 is nice to have, there are hash functions that are better suited to this setting, such as [Poseidon](https://www.poseidon-hash.info/), which relies on natural field operations, viz. addition and multiplication, rather than bit manipulations. It is for this reason that the concentration of our current efforts is on the implementation of such hash functions, as well as cryptographic primitives necessary for their construction.
