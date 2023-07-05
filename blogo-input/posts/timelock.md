# TLCS protocols for time-locked encryption

*2023-07-05*

While working on a private voting project for Nouncs DAO, we realised that it would be very useful to have a time-lock service. We therefore developed two time-locked cryptgraphy protocols, as well as the concept of a public time-locked encryption service. This is described in a paper published on **[our github](https://github.com/aragonzkresearch/blog/blob/main/pdf/azkr-timelock-zone.pdf)**.

### Summary

We describe two protocols that can be used for time-locked encryption under the assumption that a trusted parts publishes a certain type of random beacon at regular intervals. The first protocol, called zk-TLCS, is quite simple but the parties participating in the key-generation process are required to send a ZK proof of the correctness of its parameters. The second protocol, TLCS, does not require a ZK proof, making it much more efficient and generic.

We then present our *timelock.zone* service, which will be based on the TLCS protocol. It will enable anyone to encrypt data for decryption in the future, or to commit data for opening in the future. It has the following key characteristics:

* Public keys for periods far into the future are always available;
* Support for many cryptographic schemes;
* Relies on trusted randomness (drand beacon) published by the League of Entropy;
* Possibility of public participation;
* The correctness and security of the scheme is guaranteed as long as a single party participating in the public key computation is honest;
* These parties do not need to be present when the private key is revealed.

<div style="text-align:center; margin:40px;">
<a href="https://github.com/aragonzkresearch/blog/blob/main/pdf/azkr-timelock-zone.pdf" target="_blank" class="alert alert-primary" role="alert">
  <i class="bi bi-file-earmark-text" style="font-size: 1.5rem;"></i> timelock.zone
</a>
</div>