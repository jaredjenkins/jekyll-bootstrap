---
layout: post
title: Representing State with Integers and Bitwise Operators
---
*Update 2012-11-23:* A couple of my software engineering friends brought to my attention that a bitwise operation is not that great for database performance. I added some notes for this below. 

For a lot of people the information in this post may be fairly obvious, especially those who've worked in a lot of C or C++. What I am also saying is by no means novel or ground-breaking, but after a few years working in managed languages and with lots of preexisting code projects, I felt like a lot of people are not taking advantage of bitwise operators.

If you started developing software in more recent years with a managed, statically-typed language like Java or C#, you probably don't agonize over data type choices.  If you working in a dynamically, typed language, you're probably even less concerned. Most primitive data type choices are obvious (integers can represent ids, counters, and the like and floating-point numbers can represent non-integer, real numbers like dollar amounts or percentages, etc). In the context of arithmetic computation or entity identifiers, primitive number types have pretty clear purposes. At a high level of abstraction, its easy to forget how these types are implemented - binary.

For instance, integers come in 4 different lengths in the .NET framework: 8-, 16-, 32-, and 64-bits called byte, short, int, and long, respectively. Each type represents increasingly large values, where a bit is  a component  of the binary representation of that number. The maximum number you can represent grows even larger if you don't care if the number is signed (meaning its always positive). With all of those bits you can represent a lot more than just simple numerical value.

How about a filter or set of permissions?

<h2>Bitwise Operator Basics</h2>

Bitwise operations are that the core of this discussion, and if you're not that familiar with them, check out this wiki article <a href="http://en.wikipedia.org/wiki/Bitwise_operation" target="_blank">here</a>. Bitwise operations are a direct corollary to the <a href="http://en.wikipedia.org/wiki/Logic_gate" target="_blank">logic gate operations</a> built with NMOS gates used in all modern hardware.

Some examples in C#:

[gist id=4076054]

When we write code today, we don't typically utilize them because, we prefer readability to efficiency in most applications. You could write a <a href="http://geeki.wordpress.com/2007/12/12/adding-two-numbers-with-bitwise-and-shift-operators/" target="_blank">full adder</a>; with just <em><strong>XOR</strong></em>, <em><strong>SHIFT</strong></em>, and <em><strong>AND</strong></em> bitwise operators, but more often than not we'll just defer to using <em><strong>+</strong></em>?

But we can use integers and bitwise operations to represent state (like a filter settings for a group or security permissions) in a very elegant way. A canonical example that you might be familiar is file permissions:

[gist id=4092649]

A couple of things to notice: 
<ul>
<li>Each distinct value needs to be some power of 2. This will allow each state to be a distinct value.</li>
<li>None of our values are 0. Things would get weird if they did.</li>
<li>Combinations are the results of OR operations. Notice that I have made the ReadWrite the result of the bitwise OR of two both Read and Write. Similarly, Full is just an OR of everything.</li>
</ul>

If you have lots of states, it can get kind of annoying to keep multiplying by two, but don't worry ... left shift operator to the rescue!

[gist id=0460efc74214ced765f5]

This is how this permission would work in practice:

[gist id=03dca23b611e98d9fe93]

You're also limited by the capacity of your chosen integer implementation (32-bit, 64-bit). If the integer type is signed you're limited to half of those bits, assuming you don't use negative numbers. Using an unsigned 64-bit integer, will give you the ability to represent ... you guessed it 64 distinct states! In C#, you only use bitwise operations with 32- or 64-bit integers. 

<h2>Enumerations and the FlagsAttribute in C#</h2>

If you work in C#, you're probably already familiar with the Enum type or its more popular short hand enum. They are awesome! Enumerations provide a light-weight way to create readable, maintainable types for describing things. An enum, by default, will inherit from a 32-bit integer (int) and each entry will increment by 1 at compile-time, unless you explicitly state what their underlying value is. To simplify inclusion/exclusion checking, you can use the FlagsAttribute class.

[gist id=4092851]

[gist id=44b63953df40e2ce5d8b]

While most data stores support bitwise operators, they may not be that performant. In a relational database, since you are using the operator to determine if a row falls into a particular set; this can result in a full table scan which isn't very performant. Ideally, we'd like to use an index to keep our queries performant:

[gist id=fbf952e904a195bacaf7]

Another caveat with enumerations is that if you saving their values to disk (probably a database), you need to be careful. It's a good idea to explicitly specify what each value is, even if you aren't using bitwise operations. Not doing so can cause some major headaches if someone inserts or removes a value into/from the enum later on; the compiler will just shift the numbers and things will get messy. You can also avoid that by either storing the string representation.  
