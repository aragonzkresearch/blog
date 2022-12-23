### Notes on Elliptic curves over finite fields and their pairings

I'd like to share notes that grew as part of a Mathematical Cryptography seminar I gave in Aragon Association during 2022. 
Since the construction of Miller's algorithm, the Cryptography community started to use Elliptic curves and their pairing extensively. 
By now, many publicly available code libraries allow one to efficiently compute Elliptic curves over finite fields and evaluate their pairings.
However, compared to Machine Learning, where the mathematical pre-requisites consist of Linear Algebra, Calculus and basic Statistics, Elliptic curves require more background and are usually taught at a master level in pure Mathematics. This state of affairs poses a challenge to engineers and others who wish to understand the mathematical building blocks. 

To assist overcoming the challenge mentioned above, these notes aim to give a self-contained, rigorous and elementary account of most of the material required for pairing-based Cryptography. I collected material from several standard sources, and sometimes formulated elementary arguments to replace non-elementary explanations I found in the literature. 
In particular, I completely avoid relying on Galois Theory or Algebraic Geometry unlike most textbooks on the subject. 

At the moment, the material includes: 

* Naive set theory.
* Finite abelian groups.
* Vector spaces over finite fields.
* Finite fields and algebraic closure.
* Elliptic curves over finite fields.
* Rational functions and Divisors over an Elliptic curve.
* Weil pairing.
* Tate pairing.

Please feel invited to send me comments or remarks you might have.

https://github.com/aragonzkresearch/blog/blob/matan/pdf/Aragon_Math_Seminar.pdf
