---
layout: post
title: 'Stop the Abstraction Madness!'
---

I was in the middle of a fairly large project to rewrite a proprietary accounting tool for a private equity client. The projects was replacing an outdated and unstable native client application that had been written 8 years prior. In many ways our new tool was a God-send, but it was the largest project that I had ever taken on and I was finally groking C# and OOP.

I was responsible for building the backend of the accounting system. The most complicating aspect of this project was the problem domain: private equity investments can have multiple vehicles, partnerships, and deals; accountants needed to enter data at the highest level and the lowest levels. 

My instinct thought was a tree. This seemed so natural for the problem domain: the parent investments would be distributed to their child entities, the leaves of the tree would sum up to the parent. 

However, as the project went on we baked more and more logic into the tree: validation, CRUD, etc. It became an abstraction nightmare.

Frustrated with my decisions, I talked with my friend Andy about my problem. This turned into one of the more conversations pivotal conversations that changed how I thought about software engineering since I left college. The coup d'grace was when Andy asked me: 

"What do we do when"

# Stop the Abstraction Madness!