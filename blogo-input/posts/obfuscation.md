# Indistinguishability obfuscation (iO) for general circuits

*2023-10-23 by Razvan Rosie*

Links: [**Paper**](https://github.com/aragonzkresearch/blog/blob/main/pdf/CAN23_p27.pdf)

In this blogpost, we propose a construction for indistinguishability obfuscation (iO) for general circuits. The scheme is concocted from four main ingredients: (1) selectively indistinguishably-secure functional encryption for general circuits having its encryption procedure in complexity class NC1; (2) universal circuits; (3) puncturable pseudorandom functions having evaluation in NC1; (4) indistinguishably-secure affine-determinant programs, a notion proposed by works in submission that particularizes iO for specific circuit classes and acts as "depleted" obfuscators. The scheme can be used to build iO for all polynomial-sized circuits in a simplified way. Instantiations can be obtained from sub-exponentially secure learning with errors (LWE).


Indistinguishability obfuscation (iO) is a central goal in the cryptographic community. Its prime purpose is to make functionally equivalent circuits indistinguishable. Its plethora of applications includes functional encryption, searchable encryption or non-interactive key-exchange protocols. iO can be realized from multilinear maps, multi-input functional encryption or compact functional encryption. Nowadays schemes achieving security under well-established assumptions exist.


**Functional encryption and iO.** Functional encryption(FE) provides targeted access over encrypted data. Using the public parameters (abbreviated $mpk$), any input $inp$ taken from a specified domain can be encrypted as ciphertext CT. Using FE's secret key (abbreviated $msk$), a functional key - $sk_f$ - can be issued for any function f represented as a polynomial-sized circuit C. One recovers $C(inp)$ whenever CT is decrypted under $sk_f$ . The major security notion to be accomplished is indistinguishability: as long as $C(m_0) = C(m_1)$ for two different messages $m_0$ and $m_1$, it is hard for any computationally bounded adversary to distinguish if CT encrypts $m_0$ or $m_1$ given access to $sk_f$ and $mpk$ (and CT).


Indistinguishability obfuscation appears, at first sight, unrelated to functional encryption. Its interface has the following specification: consider two functionally equivalent circuits: $C_0$ and $C_1$ , both implementing the same function f. An indistinguishability obfuscator iO takes as input one of them – say $C_b$ – for a bit b sampled uniformly at random. It releases $C'$, such that it is hard for any computationally bounded adversary to distinguish if $C'$ was obtained from $C_0$ or $C_1$ (the indistinguishability property). We will use the term depleted obfuscator to refer to an iO obfuscator for very restricted sub-classes of P.


**Placing our work in the Context of iO Schemes.** This work follows, from a high level, the recipe put forth in: an obfuscator is used to compute a functional ciphertext, and a functional key is issued to decrypt iO's outputs. There are, though, major differences: builds a compact functional encryption (cFE) scheme using generically an exponentially-efficient obfuscator (XiO); the cFE is then used through a sequence of convoluted transforms to build iO. XiO is an obfuscator that is slightly smaller than a lookup table (the trivial obfuscator). Perhaps, at the time, the line of thought therein was focused on provably obtaining iO while focus on the realization of a less demanding primitive - the XiO obfuscator.


The energy is put on building an indistinguishable obfuscator for a very restricted (depleted) class of circuits. We depart from the usage of an XiO and go for a direct construction assuming the existence of: (1) FE with encryption in NC1, universal circuits (Uc), puncturable pseudorandom functions (pPRF) with evaluation in NC1 and affine determinant programs (ADP).


The main idea is to generate a functional key for the Uc. Then, using a different type of obfuscator - the ADP - we can produce functional ciphertexts for messages having their form: "$C||inp$" for some binary representation of circuit $C$ and input $inp$. By the correctness of FE, we get that:     

$$
    FE.Dec(FE.KGen(msk, Uc), FE.Enc(mpk,C||inp)) = C(inp)~. 
$$


The ADP (our depleted obfuscator) is used having the master public key of an FE scheme and a (puncturable) PRF key hard-coded. It will produce functional ciphertexts, to be decrypted under the functional key evaluating Uc. A preview of the inner working of our obfuscator is:
$$
    iO.Setup(C) := (ADP.\Setup(mpk, C, dk), FE.KGen(msk, Uc) )
$$

$$
	iO.Eval(inp) := FE.Dec(sk_{Uc}, ADP.Eval(FE.Enc(mpk, C||inp; pPRF(dk, inp))))
$$


The proof for the obfuscator described above steps through hybridizing over all inputs: considering two functionally equivalent $C_0$ and $C_1$, we will use the indistinguishability of ADP to switch to a setting where pPRF's key is replaced by one punctured in the hybrid game's input. Then, we use pPRF's security to replace the randomness used to produce the FE ciphertext in the current challenge point by true random coins. Next, we use the indistinguishability of the functional encryption for the current input, to replace the ciphertext encoding $C_0||inp^*$ with $C_1||inp^*$. Finally we switch back. Clearly, the number of hybrids is exponential in input length.


**iO from INDADP-secure Affine Determinant Programs**
Our construction of iO (preprint) from the INDADP secure affine determinant programs will appear in the proceedings of International Conference on Cryptology and Network Security (CANS), Springer, 2023.
