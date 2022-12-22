### A rust implementation of DualRing's sum argument
Recently at Aragon we’ve been looking for ways to enable efficient,
decentralised private voting. As part of that, we’ve been looking into the
state of the art of private linkable membership proofs, as they’re very
suitable to act as the base of a private voting protocol. We implemented an
interesting subsection of the state of the art in ring signatures, and this
post explains why that's interesting! 

*2022-12-22 by Rebekah*
