---
layout: post
title: HTTP in Unity
status: publish
type: post
published: true
---
I just spent the past month building the new version of our <a href="http://www.playnomics.com" target="_blank">Playnomics</a> <a href="http://u3d.as/content/playnomics/play-rm/3SK" target="_blank">PlayRM SDK</a> for <a href="http://unity3d.com/" target="_blank">Unity</a>. Unity is designed to be a cross-platform write-once, deploy-everywhere game engine making it a very popular tool for publishers looking to reach web, native desktop, and mobile audiences with a single game. Most of my background has not been in games, so learning Unity was both an opportunity to see how our customers work with it and to build some great new features for our SDK.

Our SDK provides game developers with tools for tracking player behavior and engagement so that they can:
<ul>
	<li>Better understand and segment their audience</li>
	<li>Reach out to new like-minded players</li>
	<li>Retain their current audience</li>
	<li>Ultimately generate more revenue for their games</li>
</ul>
The SDK is designed to be easy to install and it needs to be light-weight. It shouldn't minimize the amount of work done of the UI thread, and it should never crash or negatively affect game play.

The more I worked with Unity, the more I realized that Unity's feature set is constrained by the fact that it supports so many different platforms. While this is a completely valid architecture constraint, it made working with some thing as simple as an HTTP request challenging. I spent a lot of time looking for answers only to get frustrated with Unity's docs. Forum Q &amp; A was helpful, but most of the information was scattered, and some of it was just plain wrong. This post is an attempt to assemble all of this information so that you can avoid some of the same headaches we had.

<h2>C# ... but not all of it</h2>
Before I joined Playnomics, most of my background was concentrated in the .NET Framework with some exposure to open-source projects and languages. (Since then I have seen the light from working in a Linux environment, but that's for another blog post.) I got excited when I learned Unity supported writing code in C# (via the Mono Project implementation of the C# <a href="http://www.ecma-international.org/publications/standards/Ecma-334.htm" target="_blank">ECMA spec</a>). I still think C# is probably one of the best programming languages out there; it has a myriad of features that Java is still lacking and it's working hard to support some of the nicer features of languages like Ruby and Python: lambdas, dynamic typing, etc.

A major component of PlayRM, like many SDKs, is an HTTP client that can communicate with a RESTful web service. Many of the HTTP requests in the SDK are fire-and-forget, because the game rarely needs any feedback that the request completed successfully. Our SDK internally manages a queue of requests and saves them back to local storage when they can't be processed or the game is being shutdown. To keep the SDK lightweight I was hoping to run most of our SDK calls on a background thread.

Unity does provide a class as part of the UnityEngine.dll called <a href="http://docs.unity3d.com/Documentation/ScriptReference/WWW.html" target="_blank">WWW</a>, but I wasn't very pleased with its offering:
<ul>
	<li>You have no control over timeouts.</li>
	<li>It's error property is also just a string, making it hard to discern exactly why something failed. Typed exceptions are really helpful for that.</li>
	<li>No generic response object: the responses are canned to either a text string or texture image.</li>
	<li>Not to mention, no library in the UnityEngine.dll can be considered thread-safe. Yuck!</li>
</ul>
Having worked with C# before, I was already familiar with the System.Net library; it makes sending http requests and reading their responses dead-simple. With that library, you get typed-exceptions and you can read the stream into a generic byte array for a nice separation of concerns: let the caller decide what they want to do with the response.

[gist id=5421868]

This worked perfectly in the web player and the Unity Editor, but when we started testing on mobile phones nothing worked. It was pretty anticlimactic after so much work. I spent a lot of time cycling in the logging-building-debugging-repeat process. I eventually found out that Unity doesn't support System.Net.HttpRequest on every platform! Officially they only support TCP/IP Sockets via System.Net.Sockets or WWW.

Now you might say that hey, "You big dummy! You should have looked this up first!", and given how much time was poured into this pursuit I'd agree with you. However, I feel like this is an oversight on Unity's part. MonoTouch, a project which lets you write C# code and deploy it to both Android and iOS supports <a href="http://docs.xamarin.com/guides/ios/advanced_topics/assemblies" target="_blank">System.Net</a>. There are some security considerations when deploying Unity games to the web, which I'll discuss later, but that's a question of usage, not of implementation. HTTP is such a common protocol and the fact that Unity has such an inflexible implementation of it, can really make things difficult.

At the very least, the Unity build should have generated warnings when I used libraries that aren't supported on all platforms.
<h2>Sockets ... but only if you pay me</h2>
So the alternative was to rewrite the HTTP client using TCP/IP Sockets. While it's frustrating that you need to do this just to have a better HTTP client, this is a viable solution. The downside is that if you want to use System.Net.Sockets on all platforms you need the Unity Pro licensing which costs a pretty good chunk of change. Playnomics builds tools to help every game studios from UbiSoft to a one-man army producing games and managing them; we can't afford to just cut-off potential customers.

We were stuck with using WWW.
<h2>Solution ... coroutines</h2>
While Unity may not provide the best support for what we needed, they do understand the need to keep HTTP requests from blocking the UI thread. They do this through using coroutines. Coroutines allow a subroutine to yield execution back to a caller while maintaining state, so that everything will continue where it left off the next time the subroutine is called. It's essentially a snapshot of the stack-frame. The canonical example is an iterator over a <a href="http://msdn.microsoft.com/en-us/library/vstudio/dscyy5s0.aspx" target="_blank">list or some process</a>.

In Unity, coroutines are a major building block of their engine. It's a neat trick to <a href="http://docs.unity3d.com/Documentation/ScriptReference/index.Coroutines_26_Yield.html" target="_blank">let an animation run for a set amount of time or until the HTTP request has completed</a>. From what I have seen in forum posts, some speculate that Unity is maintaining an internal data structure of each coroutine state when yield is called, and then checks each state after the Update event is called on the MonoBehavior. We can't be sure unless we inspect the code Unity generates, but the important take-aways are that if you use WWW:
<ul>
	<li>You should take advantage of coroutines.</li>
	<li>You should yield the call on the http request so that you don't block the UI thread.</li>
	<li>All of the work with HTTP request, before and after it is complete needs to be done on the UI thread.</li>
	<li>Whatever class that encapsulates this logic must inherit from MonoBehavior.</li>
</ul>
If you look at this, you might be thinking … man this sucks, what if I have lots of parallel requests? The truth is you can! And it's a very subtle thing with coroutines which you'll see when you look at some of our final code:

[gist id=5421985]
<h2>A word about threading</h2>
If we had been capable of working with sockets on a separate thread, we would need a way for code on the background thread to talk with code on the Unity thread, because there are scenarios when we want to notify the UI of some request completion: a creative for a message has been downloaded. Communication going the other way is a trivial problem. <a href="https://developer.android.com/training/multiple-threads/communicate-ui.html" target="_blank">Android</a> and <a href="http://www.raywenderlich.com/4295/multithreading-and-grand-central-dispatch-on-ios-for-beginners-tutorial" target="_blank">iOS</a> both provide avenues for notifying the UI of some event, but Unity's lack of thread-safety makes this a little precarious.

Your best case is to build a thread-safe data structure which both threads can interact with. The Mono Project doesn't include System.Collections.Concurrent but you can write a pretty simple thread-safe queue like this:

[gist id=5421892]

You can then poll the data structure in the Update call of a MonoBehavior:

[gist id=5421919]
<h2>Security</h2>
In the Unity web player, you're restricted in the browser to what resources it can access, because of cross-origin scripting protections. By default, you can only access resources from the same origin domain, eg: your game is hosted on http://myawesomegame.com, so it can only GET or POST to resources on http://myawesomegame.com. The one exception is that you can retrieve images for textures from different sites, with some limitations. If you need to hit REST service outside of your own domain, the other domain needs to add a crossdomain.xml file to the root of its domain:

[gist id=5433610]

These security issues also apply to sockets, but the implementation is a little different; it depends on what the ports you are opening and what port the policy is available at. You can read more about this and other security considerations in the Unity Web player <a href="http://docs.unity3d.com/Documentation/Manual/SecuritySandbox.html" target="_blank">here</a>.

<h2>Detecting Offline Mode</h2>
<a href="http://developer.apple.com/library/ios/#samplecode/Reachability/Introduction/Intro.html">iOS</a> and <a href="http://developer.android.com/reference/android/net/ConnectivityManager.html">Android</a> both provide ways of detecting if the device has connectivity, but Unity doesn't appear to have any insights into this. You can of course, call those native libraries through Unity's <a href="http://docs.unity3d.com/Documentation/Manual/Plugins.html" target="_blank">plugins architecture</a>.

Due to time constraints, we didn't have time to add this functionality to our SDK. Our current hueristic is to add a geometrically increasing wait time to each web request so that we wait for increasingly larger sets of time with each failure.
<h2>Going forward</h2>
Despite some of the nuances with HTTP in Unity, it still is a great game engine with a great community of developers; we're happy to be one of their partners. We realize that making a great HTTP client is not Unity's main focus, they are focused on building great technologies for game studios, not technologies for third party tools.

Unity also supports marshaling of C++ code through its <a href="http://docs.unity3d.com/Documentation/Manual/Plugins.html" target="_blank">plugins architecture</a>; this is one avenue that we may look into for improving the overall performance of our SDK in future releases because we can hopefully utilize cURL, our own process queue, and have the ability to allocate separate worker threads as we see fit. However, using native C++ is limited to only desktop and mobile platforms. Customers writing code for the desktop would also need to have a Unity Pro license.

This somewhat, fractured solution highlights our challenge as a third party tool for Unity game developers. The solution going forward may be C ++ marshaling for mobile, and only WWW for web and desktop games. It's not ideal, but performance and loss of connectivity are much larger issues for mobile games.

I'll keep you posted on our progress.
