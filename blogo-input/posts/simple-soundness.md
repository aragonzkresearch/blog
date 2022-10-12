# Simple Soundness Proofs

*2022-10-12 by [Alex Kampa](https://github.com/alex-kampa)*

We present a general method to simplify soundness proofs under certain conditions. Given an adversary $\mathcal{A}$ able to break a scheme $S$ with non-negligible probability $t$, we define the concept of *trace* of a *winning configuration*, which is already implicitly used in soundness proofs. If a scheme can be constructed that (1) takes a random configuration $e$, being the inputs and execution environment of $\mathcal{A}$, (2) "guesses" a trace, (3) modifies $e$ based on its guess so that the modified configuration $e'$ is statistically indistinguishable from the original one, (4) is then able to execute $\mathcal{A}$ correctly under the condition that $e'$ is a winning configuration and that $B$'s guess of the trace was correct, and finally (5) that during its execution $\mathcal{A}$ is unable extract any information about $B$'s guess, then the probability of $B$ winning can be expressed as a simple function of $t$ and the bit-length of the trace, namely $\frac{t}{2^m}$. Soundness then results if $2^m$ is polynomial in the security parameter.

To illustrate the concept, a concrete application of this method to a simple binary voting scheme is then described in detail.

Link to the paper: https://github.com/aragonzkresearch/blog/blob/main/pdf/simple-soundness.pdf


## Introduction

Soundness proofs tend to be quite long and technical. Here, we describe a general method to significantly simplify and shorten such proofs if some specific conditions are met.

## Simple Soundness Proofs

A common method of proving the soundness of a cryptographic scheme S is the following. We first assume that there exists an adversary $\mathcal{A}$ that can break the scheme with some non-negligible probability. We then construct a scheme B which uses $\mathcal{A}$ in a simulated environment to break a known-to-be-hard problem P, also with some non-negligible probability.


**Description of $\mathcal{A}$ in its native environment**

$\mathcal{A}$ is a deterministic polynomial-time algorithm. There exists a finite set of \textit{execution configurations} $E(\lambda)$ for $\mathcal{A}$, where $\lambda$ is the security parameter. Each such configuration includes inputs to $\mathcal{A}$ and completely determines the execution of $\mathcal{A}$. Given a randomly selected execution configuration $e \in E(\lambda)$, $\mathcal{A}$ breaks the scheme $S$ with probability $t(\lambda)$, where $t$ is a polynomial function. We then say that $\mathcal{A}$ wins. In that case, $e$ is said to be a \textit{winning configuration}.

**The scheme $B_r$ able to correctly execute $\mathcal{A}$**

We denote by $B_r$ (where "r" stands for "real") a scheme that simulates the real execution environment of $\mathcal{A}$. Usually, this will require the knowledge of extra information about some elements of the execution configuration. For example, the execution configuration may include a sequence of group elements, and it may be necessary to know the discrete log of these elements in order to be able to always complete the execution of $\mathcal{A}$. If $G$ is a group with $q$ elements and generator $g$, a set $\{ g_i \}_{i \in [n]}$ of random elements of $G$ can be produced by first sampling $x_i \leftarrow \mathbb{Z}_q$ and outputting $\{ g^{x_i} \}$. In general, it is  not difficult to generate random execution environments such that $B_r$ has all the necessary extra information.

**A modified scheme $B$ to break $P$**

To attempt to break $P$ using $\mathcal{A}$, the scheme $B$ will usually need to modify the execution environment slightly. Given the modified environment $e'$, we say that $B$ wins if it is able to complete the execution of $\mathcal{A}$, and $\mathcal{A}$ wins. In that case, $B$ also breaks the problem $P$. In some cases, however, $B$ will be unable to complete the execution of $\mathcal{A}$. Running $\mathcal{A}$ in this simulation is therefore not equivalent of running $\mathcal{A}$ in its normal execution environment. This fact usually complicates the soundness proof, as conditional probabilities must be introduced to deal with cases where $B$ has to abort.

**Conditions for a simple soundness proof**

We now describe the conditions necessary for applying our method.

When $\mathcal{A}$ wins, this is characterised by a unique \textit{trace} of its winning configuration $e$, denoted $tr(e)$, which we can think of as a very small subset of its full execution trace. The maximal bit-length m of the trace must be such that $2^m$ is polynomial in $\lambda$. The trace will typically be a tuple of numbers, group elements, etc.

There is a well-defined procedure by which, after generating a random configuration $e$ and "guessing" a trace $tr'$ by randomly sampling from $\{0,1\}^m$, $B$ is able to modify $e$ based on $tr'$. This results in a new configuration $e'$. The following must hold:

* the probability space of $e'$ is the same as the probability space of $e$;

* $\mathcal{A}$ learns nothing about $B$'s guess during the execution, unless $B$ aborts - at which stage $B$ cannot win anyway so it has no impact on the result;
    
* if $e'$ is a winning configuration, and $B$ guessed the trace $tr(e')$ correctly, then $B$ is able to finish the execution of $\mathcal{A}$ and therefore win.

**Applying the method**

If the above conditions are met, the configuration $e'$ generated by B is indistinguishable from a uniformly sampled configuration of $E$. Therefore, with probability $t$, it will be a winning configuration. The trace $tr'$ will then be equal to $tr(e')$ with probability $\frac{1}{2^m}$, and this will be independent of the probability that $e'$ is a winning configuration. If $B$ guessed the trace correctly, it will be able to complete the execution of $A$ and, as a result, break $P$, with probability of at least $\frac{t}{2^m}$.

$\mathrm{\blacksquare}$

*The paper then proceeds to show in detail how this method can be applied to prove the soundness of a simple binary voting scheme.*

$\mathrm{\blacksquare}$

## Randomly replacing values in vectors

The method described above relies on the following simple fact.

### From one uniformly random configuration to another

Let $G$ be a finite set and $n$ a positive integer. Let $H = G^n$ and $E = [n] \times G \times H$. The uniform distributions on these sets are denoted $Pr_H$ and $Pr_E$. Elements of $H$ are denoted $\vec{h}$ while elements of $E$ are denoted $(k, u, \vec{g})$. Elements of a vector $\vec{v}$ are denoted $v(i)$. Given a vector $\vec{v}$, we denote by $r(\vec{v}, k, u)$ the vector obtained from $\vec{v}$ by replacing its $k$-th element by $u$:

\begin{equation}
r(\vec{v}, k, u)(i) =\begin{cases}
			v(i) & \text{if $i \neq k$}\\
            u & \text{if $i = k$}
		 \end{cases}
\end{equation}

The set of all elements in $H$ which are equal to a vector $\vec{h}$ except at some fixed index $k \in [n]$ is denoted $H(\vec{h}, k)$:

\begin{equation}
    H(\vec{h}, k) = \{ \vec{v} \in H \; | \; \forall i \in [n] \setminus \{k\}, \; v(i) = h(i) \}
\end{equation}

Note that $\forall (\vec{h}, k), |H(\vec{h}, k)| = |G|$. We further define the function $\rho$ as  follows:

\begin{equation}
    \begin{aligned}
        \rho : \:\: & E               & \longrightarrow \: & H \\
                 & (k, u, \vec{g}) & \longrightarrow  \: & \vec{h} = r(\vec{v}, k, u)
    \end{aligned}
\end{equation}

With fixed $\vec{h} \in H$ and $\kappa \in [n]$, we have:

\begin{equation}
    Pr_E( \rho = \vec{h} \: | \: k = \kappa) = \frac{|H(\vec{h}, \kappa)|}{|E|} = \frac{|G|}{n|G|^{n+1}} = \frac{1}{n|G|^n}
\end{equation}

As a result:

\begin{equation}
    Pr_E( \rho = \vec{h}) = \sum_{\kappa \in [n]} Pr_E( \rho = \vec{h} \: | \: k = \kappa) = n \frac{1}{n|G|^n}  = \frac{1}{|G|^n} = Pr_H(\vec{h})
\end{equation}

Therefore the random variable $\rho$ is uniform on $H$. This is not at all surprising: if we take a random vector in $G^n$, then select a random $k \in [n]$ and a random $u \in G$ and replace the $k$-th value of the vector with $u$, we naturally expect the result to also be random.  

### Extending the result

We can modify the definitions of $E$ as follows: instead of $E = [n] \times G \times G^n$, we define $E = R \times G \times G^n$ where $R \subseteq [n]$. It is clear that we will obtain the same result.

Another observation is that if we have for example $E = [n] \times G \times G^n \times H^m \times ...$, we can extend $f$ and $f_{\kappa}$ in an obvious way, resulting in a uniform distribution on $G^n \times H^m \times ...$.

Finally, it is also clear that the process can be repeated several times. For example, if our initial sample space is $G^n \times H^m$, we can randomly replace one or more values in $G^n$, then randomly replace one or more values in $H^m$, and the resulting distribution will remain uniformly random.

$\mathrm{\blacksquare}$

https://github.com/aragonzkresearch/blog/blob/main/pdf/simple-soundness.pdf