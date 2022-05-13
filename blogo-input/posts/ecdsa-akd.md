## rwc2022 : Threshold ECDSA with additive key derivation and presignatures : an attack, and a solution
*2022-05-11 by Rebekah*

During rwc2022, Victor Shoup presented joint work with Jens Groth on the
security of additive key derivation and pre-signatures for ECDSA.  Additive key
derivation (AKD) is used widely throughout the cryptocurrency space as it's
specified in BIP32, the de facto cryptocurrency standard for a heirarchical and
deterministic key derivation process. BIP32 is used to derive keys in both
Ledger and Trezor hardware wallets, and a large number of software wallets that
have adopted BIP32 -- a search on github reveals 203,000 mentions.

Before digging into the security proof and attacks identified, we'll define
both AKD and presignatures and recap what ECDSA itself looks like.

Keypairs for ECDSA look like `k`, `K = kG`, where `G` is a generator of an
elliptic curve group, and `k` is a randomly selected element from the scalar
field.

The signing algorithm for signing a message `m` with key `k` is given as
follows :
```
h = hash(m) (to the scalar field)
r randomly generated from the scalar field
R = rG t = F(R) // where F is a function that maps R back to the
                // scalar field (commonly taking the x coordinate)
if t == 0 || h + tk == 0, fail
else s = r^{-1} (h + td)
return sigma = (s, t)
```

And the verification algorithm is simply that the verifier, given `sigma`, and `m`,
and knowing `K`, performs the following :
```
h = hash(m)
R = s^{-1}hG + s^{-1}tK
if R == 0 || F(R) != t, fail
else signature is valid
```

### Additive key derivation

Additive key derivation is a process of taking the public key from the key generation
algorithm given above and adding another number to it, so that the new secret key can be
computed only by the holder of the original one. Often this is done by
generating a random element `j`, with `J = jG`, and then `k' = k + j`, and
`K' = K + J (= kG + jG = (k+j)G)`. In BIP32's case, the element `j` is instead
derived from some information in a deterministic way, which is where the name
hierarchical deterministic key derivation comes from. The elements `J` and `j` do
not need to be private for the process to be secure (where security here means that
only the original holder of `k` can compute `k + j` and sign transactions corresponding
to the new key pair).

#### Why is this useful?

Key derivation protocols are useful because they increase the number of key
pairs that can be created with knowledge of just one long term secret. For
cryptocurrency wallets (both hardware and software based), the 24 word seed
phrase is used to derive the initial base key pair, and then all others are
derived from that one using BIP32. This means that in the case you lose your
hardware wallet or forget credentials for a software wallet, you can re-derive
all of your keypairs with just the one seed phrase. The reason why addition is
used over some more complicated key derivation process is mainly due to
efficiency and simplicity.

### Presignatures

Presignatures take into account that one of the threads of computation of the
ECDSA signing algorithm doesn't depend on the message being signed at all.
It's perfectly possible to generate `r` at random, then compute
`R = rG and t = F(R)` before the message itself is known.

#### Why is this useful?

The value `R` is referred to as a presignature, and it's main value is found when
computing threshold ECDSA. In a threshold implementation, the value `k` is shared
across parties, with no one party knowing the true value of `k`. Each party's
share is represented `[k]`. In this setting, it's also possible to precompute, for
a random scalar `u`, sharings `[r]`, `[u]`, `[r′] = [ru]`, and `[k′] = [ku]`.

With these precomputed shares, to sign a given message `m`, the parties only need
to locally compute `h = hash(m)`, and `[v] = h[u] + t[k′]`,
and then they can share their values `[v]` and `[r']` (opening the secret sharings,
to reveal `v` and `r` themselves), which allows
```
s = v/r' = (hu + tku)/ru = (h + tk)/r
```
to be computed with only one round of interaction between parties after the message `m`
is decided, rather than the two rounds that would be needed otherwise.

## ECDSA + presignatures + additive key derivation -- an attack

The verification algorithm for ECDSA is that given `sigma`, `m`, `K`:
```
h = hash(m)
R = s^{-1}hG + s^{-1}tK
if R == 0 || F(R) != t, fail
else signature is valid
```
Rewriting this we have `sR = hG + tK`. For additive key derivation, this equation
instead becomes `sR = hG + t(K + jG)`, or rewritten, `sR = (h + tj)G + tK`.

We then have a weakening of security due to being able to manipulate (h + tj).
The attack works by quering a presignature oracle to get an `R`, computing
`t = F(R)` (as normal), and then finding `m, j, m*, j*` satisfying
`h + tj = h* + tj*`. Given a signature for `m`, using `j` to change the key `k`,
and with `R` as the pre-signature,
you then also have a valid signature on `m*` using `j*` using `k`, and `R` as
pre-signature (without knowledge of `k` itself). This constitutes a forgery,
and is not good.

### What does this attack mean for threshold ECDSA with presignatures and AKD?

With security parameter `lambda`, the ability to forge a proof by finding
`m, j, m*, j*` that satisfy `h + tj = h* + tj*` lowers the complexity of
breaking ECDSA in this sitaution from `O(lambda^1/2)` to `O(lambda^1/3)`, equivalent
to security of 85 bits rather than 128. That's not good! But there are mitigations.

### Mitigations

The main mitigation suggested is to rerandomise `R` at time of use, by some
public value only generated at time of signing. `R` would then instead become
`R + deltaG`, which eliminates the possibility
of `t` being known in advance, meaning that an attacker no longer has enough
information to solve `h + tj = h* + tj*` for any `h, j, h*, j*`, as `t` itself
is not known in advance. In a cryptocurrency setting, it's easy to think of
sources for this public randomness, for example the blockhash of the previous
block, etc. And then the attack is eliminated!
