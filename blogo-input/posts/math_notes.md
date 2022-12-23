### Notes on elliptic curves over finite fields and their pairings

*2022-12-23 by [Matan Prasma](https://sites.google.com/site/matanprasma/)*



I'd like to share notes that grew as part of a mathematical cryptography seminar I gave in Aragon Association during 2022. 
Since the construction of Miller's algorithm, the cryptography community started to use elliptic curves and their pairing extensively. 
By now, many publicly available code libraries allow one to efficiently compute Elliptic curves over finite fields and evaluate their pairings.
However, compared to machine learning, where the mathematical pre-requisites consist of linear algebra, calculus and basic statistics, elliptic curves require more background and are usually taught at a master level in pure mathematics. This state of affairs poses a challenge to engineers and others who wish to understand the mathematical building blocks. 

To assist overcoming the challenge mentioned above, these notes aim to give a self-contained, rigorous and elementary account of most of the material required for pairing-based cryptography. I collected material from several standard sources, and sometimes formulated elementary arguments to replace non-elementary explanations I found in the literature. 
In particular, I completely avoid relying on Galois theory or algebraic geometry unlike most textbooks on the subject. 

At the moment, the material includes: 

* Naive set theory.
* Finite abelian groups.
* Vector spaces over finite fields.
* Finite fields and algebraic closure.
* Elliptic curves over finite fields.
* Rational functions and divisors over an elliptic curve.
* Weil pairing.
* Tate pairing.

Please feel invited to send me comments or remarks you might have.

[manuscript can be found here](https://github.com/aragonzkresearch/blog/blob/matan/pdf/Aragon_Math_Seminar.pdf)
