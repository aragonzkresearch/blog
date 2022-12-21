### rwc2022 : Threshold ECDSA with additive key derivation and presignatures : an attack, and a solution

Additive key derivation is used widely throughout the cryptocurrency space, as defined in BIP32.
Presignatures are used to reduce the round complexity of threshold ECDSA. Though both used
very frequently, and often in combination, a security proof for the construction was missing until 
this point. Shoup and Groth find an attack on threshold ECDSA when using both AKD and presignatures,
and present a solution. 

*2022-05-11 by Rebekah*
