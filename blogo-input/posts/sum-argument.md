### A rust implementation of DualRing's sum argument
*2022-12-22 by Rebekah*

Recently at Aragon we’ve been looking for ways to enable efficient,
decentralised private voting. As part of that, we’ve been looking into the
state of the art of private linkable membership proofs, as they’re very
suitable to act as the base of a private voting protocol (or, in a more general
sense, as the base of a private cryptocurrency itself, as in Monero’s case).

The current state of the art in discrete log based linkable membership proofs
without any trusted parties, which are also known as linkable ring signatures,
is a May 2022 ESORICS paper called [DualDory](https://dualdory.github.io).
DoryDory builds from a previous work called
[DualRing](https://eprint.iacr.org/2021/1213), extending the ideas presented in
that paper to offer both linkability, and also logarithmic verification time,
which it does by introducing a pairing based preprocessing stage.

DualRing builds from a long line of work that builds ring signatures in
a ‘ring-like’ sense, with the ring representing a circle (usually of
challenges) with the final link only being able to be created by a party with
some trapdoor information. The trapdoor information in the case of a ring
signature is the secret key that corresponds to any of the public keys which
are in the ‘ring’ of public keys, which is known to everyone. A ring signature
then proves that the signer holds one of the corresponding secret keys, without
revealing which specific one that they possess.

The initial ring signatures were constructed based on sigma protocol OR proofs.
The prover would use the ability to simulate sigma protocols when the challenge
can be selected out of order, and would generate n-1 of those sigma protocols,
and then when responding to the real challenge, they would simply subtract all
of their simulated challenges from the real challenge, and use the result to
produce the last sigma protocol. They would then send the n sub-challenges, as
well as the n last messages of the sigma protocols, real and simulated. This
technique is very neat, but it results in a proof that is linear sized in the
number of parties in the ring.

[Bulletproofs](https://eprint.iacr.org/2017/1066) build from the work of [Bootle
et al](https://eprint.iacr.org/2016/263) which presents a membership proof with
logarithmic communication. At a high level, it acheives this by, rather than
sending the elements of the proof in the clear, recursively applying a proving
function which halves the length needed to be sent to convince the verifier.
Due to the recursive halfing, the final set of elements needing to be sent is
logarithmic in the size of the initial proof, which in our case was linear.
Bootle et al uses an inner product proof to acheive this, but the authors of
DualRing noticed that in the case of membership proofs, rather than needing to
prove `<a, b> = c`, with `c` a committed value, we instead only need to prove
`<a, 1^n> = c`, which allows use of a sum argument, and enables this section of
the proving computation to be halved.

Our implementation of this section of the paper can be found at [this github
link](https://github.com/aragonzkresearch/sum-argument), and hopefully will
continue to be developed in the future! The implementation is based on the 
inner product argument of the [dalek bulletproofs
implementation](https://github.com/dalek-cryptography/bulletproofs), which I'd
highly recommend you also check out if you're interested in membership proofs
that go fast! 
