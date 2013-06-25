---
layout: post
title: Enterprise Software Sucks
---
## Why does Enterprise Software suck so much?
It's pretty hard not to see how quickly computing technologies, and even their accompanying software languages and frameworks have evolved recently. Think about the first time you started using a web browser or a software application. Now think of your experience today. What if I then told you that you had to go back to using older technologies in your daily life. Remember when there was no Gmail, iTunes, or Excel before 2010 was released? Ugh! that would really suck. Clearly evolution in technologies has improved our relationship with computers.

So why do so many enterprise applications seem so stuck in the past? Why do we have to use cumbersome applications in our work environments?

1.  The first major reason is enterprise applications typically support some key business drivers - revenue, sales,
    reporting, accounting - we can't just swap out new technologies and replace them without thoroughly understanding the implications of doing so.
2.  The second major reason is cost. Developing custom applications or even purchasing licenses can be very expensive
    and it may be difficult to prove the ultimate ROI from these costs.

However, I would argue that there is an answer to both of these issues.

## Inflexibility is the Symptom of Highly-Coupled Architectures

A fundamental problem with business software is that it's often difficult to replace parts without gutting the entire application and starting from scratch. A change in database (changing from Oracle to Sql Server or even Redis) or a dramatic change in the UI (going from classic ASP.NET to MVC3) can literally require an application rewrite. However, this is typically an architectural problem and it doesn't need to be this way. The issue is that this application was developed in a highly-coupled way.

### Poor Separation of Concerns
In my experience, it rears its ugly head the most with applications that rely on a SQL database. A major trend of the early two-thousands was to build relational databases where stored procedures, triggers, and views allowed developers to create data-driven applications. A stored procedure was often used to perform basic CRUD applications, and to even create highly-complex business driven data operations. This in principle sounded like a great idea. But it does start to break down over time.

*   They are difficult to test in an automated way. Tracking bugs and issues in stored procedures is much more time
    intensive, and dependent on data available.
*   They don't properly separate concerns between business logic and pure CRUD logic. It is far easier for a developer,
    to rewrite logic in code than it is to modify highly coupled data access. In general, database access code should be very simple and generic.
*   Performance may degrade over time. A stored procedure written today may slow down tomorrow because the tables have
    grown much larger. However, code is often a lot easier to tune.
*   Result sets from stored procedures are weakly typed when they are returned from the database, which means that
    extra code needs to be written to transform them into typed objects. If a developer doesn't do this, they introduce performance issues and potential run-time bugs. For instance, unboxing/boxig data from a DataTable object is 300% less efficient than just using a type for data; this is can be very expensive when running algorithms over large data sets. Columns in the stored procedure may also change names or get dropped. There is no way for the developer to know this until they hit run-time bug.

Thankfully there are many, many ORM tools available now. If your application is using stored procedures, you should start moving over to an ORM tool soon.

#### Lack of Inversion of Control

This issue can be a little more subtle. A lot of .NET based applications are written in the traditional N-Tier pattern where code is typically separated into layers for the User Interface, Business Logic, and Data Access Layer. These code libraries are meant to create high level separations so that you can move an application from one UI framework to another easily or even share business logic code across many applications. It also makes automated testing easier.

In general this architectural pattern can be very powerful. But for applications that have very long lifecycles or complex business logic, you may want to consider architectures that utilize inversion of control. These architectures promote highly-cohesive, loosely-coupled code - in the end more flexible software. It promotes highly-cohesive code, because programmers are forced to program to interfaces. It's loosely-coupled because the interfaces are implemented at run-time. The actual implementation of your code is a delayed decision making your development more Agile and flexible.

The onion architecture is one of these patterns in the .NET world. You can check out a presentation that I put together on this <a href="http://jared-jenkins.com/blog/onion-architecture-presentation/" target="_blank">here</a>. These blog articles also describe it very well: <a href="http://blog.tonysneed.com/2011/10/08/peeling-back-the-onion-architecture/" target="_blank">Peeling Back the Onion Architecture by Tony Sneed</a> and <a href="http://jeffreypalermo.com/blog/the-onion-architecture-part-1/" target="_blank">The Onion Architecture by Jeff Palermo</a>. I found Tony Sneed's demo very helpful for learning. Jeff Palermo is the creator of the Onion Architecture. This idea originally started with Alistair Cockburn in his <a href="http://alistair.cockburn.us/Hexagonal+architecture" target="_blank">Hexagonal Architecture</a>.

For a general understanding of inversion of control, check out this blog <a href="http://blog.vuscode.com/malovicn/archive/2007/01/19/dependency-injection-and-service-locator.aspx">post</a>. Lots of good examples here.

## Inflexible Software is Costing You More than You Think

As a consultant, I have seen how legacy systems can make a user's work life painful. People develop workarounds and intricate processes just to work with older, inflexible software. Often times, a process can take up hours of their day, and because it is so inefficient they are less enthusiastic and motivated to use the product. That's less time spent working with customers, driving revenue, or growing the business. Training becomes difficult and cumbersome. Data quality and integrity might also be issues, if the application can't be flexible to new requirements.

When assessing the return on investment in software development, businesses need to take into account time savings. They also need to understand that a user's relationship with software can dictate how productive they are willing to be. Great tools are exciting and they motivate people in powerful ways.

In the end, enterprise software doesn't have to be so bad. A good user experience doesn't need to be a Facebook-only quality, <a href="http://peopleprocesstech.com/2011/12/05/why-techcrunch-is-boring-sap-is-not-and-the-world-has-gone-mad/" target="_blank">enterprise applications matter, too</a>.
