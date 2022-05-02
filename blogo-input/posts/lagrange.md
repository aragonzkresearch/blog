# Lagrange bases in subgroups of $F_p^*$: a hands-on introduction

*2022-05-02 by [Alex Kampa](https://github.com/alex-kampa)*


Our first **[Maths Seminar note](https://github.com/aragon/research/blob/main/blog/001_Lagrange/lagrange.pdf)** is about Lagrange bases in subgroups of $F_p^*$, which happen to have a simple and explicit formula. This paper provides an easy to follow introduction to Lagrange bases, lots of of hands-on examples as well as a detailed proof of the main result, which is (cf below for notations):

\begin{equation}
    L_i(x) = \frac{1}{n} \cdot \sum _{k=0}^{n-1} \omega^{-ik} x^k
\end{equation}


## Introduction

Lagrange polynomials, also called Lagrange bases, or Lagrange basis polynomials, allow us to define polynomials via their values at certain points, instead of defining them by their coefficients. Lagrange bases have recently been used in the construction of a popular zk-SNARK scheme called PLONK.

In general, given a set of $k+1$ points $X = \{ x_j \} _{j \in [0 .. k]}$, which we can call the basis set, the Lagrange bases $L_i$ are polynomials of the form:

$$
L_i(x) = \prod _{\substack{j \in J \\ j \neq i}} \frac{(x - x_j)}{(x_i - x_j)}
$$

These polynomials have the property of being equal to 0 at all but one points of the base set, and to 1 at the remaining point:

$$
\forall x \in X, \;\; L_i(x) =
  \begin{cases}
    1 \text{   for } x = x_i\\
    0 \text{   otherwise}
  \end{cases} 
$$

If we are now told that a polynomial $P(x)$ of degree at most $k$ takes the values $v_i$ over the elements of $X$, then this polynomial can be expressed as a simple linear combination of the Lagrange bases:

$$
P(x) = v_0 L_0(x) + v_1 L_1(x) + ... + v _{k} L _{k}(x)
$$

In general, when dealing with an arbitrary set $X$ in an arbitrary field, there is nothing specific we can say about the structure of Lagrange bases. But when we place ourselves in a very particular context of subgroups of $F_p^*$, with the basis set being all the points of the subgroup, these Lagrange bases have a very definite structure. 

## Lagrange Polynomials in subgroups of $F_p^*$

We are in the field $\mathbb{F}_p$ where $p$ is prime. The element $\omega \neq 0$ is a generator of order $n$ of a multiplicative subgroup $H$ of $\mathbb{F}_p^{\ast}$. Obviously, $n$ divides $p-1$, which is the order of $\mathbb{F}_p^{*}$, and we have:

$$
    H = \{ 1, \omega, \omega^2, ..., \omega^{n-1} \}
$$

The Lagrange bases on $H$ are the set of polynomials $L_i$ defined for $0 \le i < n-1$ as follows:

\begin{equation}
    \forall x \in H, \;\; L_i(x) =
    \begin{cases}
      1 \text{   for } x = \omega^i\\
      0 \text{   otherwise}
    \end{cases} 
\end{equation}

It is also useful to define the polynomial $L(x)$ which has roots at exactly all the element of H:

\begin{equation}
    L(x) = \prod_{j=0}^{n-1} (x - \omega^j)
\end{equation}

What we find is that there is a rather simple way to express these polynomials. For L(x) we find:


\begin{equation}
    L(x) = x^n - 1
\end{equation}

As for the Lagrange bases, we obtain the simple formula:

\begin{equation}
    L_i(x) = \frac{\omega^i}{n} \cdot \frac{x^n - 1}{x - \omega^i} = \frac{1}{n} \cdot \sum _{k=0}^{n-1} \omega^{-ik} x^k
\end{equation}

$\mathrm{\blacksquare}$

https://github.com/aragon/research/blob/main/blog/001_Lagrange/lagrange.pdf
