### Decentralised Private Voting
*2022-12-21 by Rebekah*

There are several ways to achieve secure decentralised private voting,
which we will go through within the document. Decentralisation is being
stressed in the title of this blog post and within the document due to the
fact that many voting schemes that exist in the current body of work rely on
a trusted party for vote integrity, or voter privacy, or for a combination of
these two alongside availability of the voting system itself.
[Helios](https://vote.heliosvoting.org)
is one such voting scheme, which is used for private voting in, for example,
[IACR elections](https://vote.heliosvoting.org/helios/elections/e32be530-2dbf-11ec-af80-e2b5f37f7c96/view). 
However, in Helios an authority needs to be trusted for
privacy.  We do not wish for this to be the case in the scheme that we adopt.

We will be using an Ethereum smart contract as a bulletin board and vote
counter, but a constraint imposed by this model is that the contract cannot
have any private state at all, which means that any system in which the
‘authority’ needs to generate some private randomness is not available to use
in this situation. This means that we need to provide a protocol where anyone
who sees the votes can compute the final result themselves, without being able
to reveal any information about the votes (except that which is revealed by
the final vote itself). A final constraint is that computation is very
expensive on Ethereum, and so we desire a protocol with a verification step
that is as lightweight as possible. There are existing papers that provide
a thorough overview of currently implemented and deployed cryptocurrency based
voting schemes, for example Nomana Ayesha Majeed's brilliant [Review on
Blockchain based e-Voting
Systems](https://monami.hs-mittweida.de/frontdoor/deliver/index/docId/13092/file/DruckversionNomanaAyeshaMajeed.pdf).

The document linked below talks through several different approaches to
achieving private decentralised voting, and their trade-offs. The approaches
are : 
- linkable (private) membership proofs (SNARK-based or not SNARK-based,
  depending on the computational power expectations of the voters)
- plain digital signatures and tallyable encrypted votes
- membership proofs + tallyable encrypted votes
- commit and reveal (in the case that privacy is not desired)

The document can be found
[here](https://github.com/aragonzkresearch/blog/tree/main/pdf/private-voting.pdf).
