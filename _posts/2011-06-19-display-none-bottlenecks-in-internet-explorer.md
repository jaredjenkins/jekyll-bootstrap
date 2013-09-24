---
layout: post
title: Display None Bottlenecks in Internet Explorer
---
While Internet Explorer has certainly improved in recent years, it still can still be a nightmare to work with. If you ask any web developer they spend a lot of time navigating the treacherous world of cross-browser development. The reality, however, is that Internet Explorer is still used prevalently. If you work on enterprise web applications like I do, you'll find that most businesses operate on IE.

Most often you will just need to alter your CSS rules or HTML layout to get things back to normal. This is typically an iterative process, but something that becomes easier with experience.

## The Problem

A more subtle issue is that IE has a hard time processing large amounts of elements which are marked as invisible; the page loading will run very slowly or even crash. Usually this has a negligible effect on page load times, but when dealing with a lot of data it becomes **very** noticeable.

For instance, you might have a grid which displays a table of items. To display this table in ASP.NET you might utilize a DataGrid or Repeater control. Each item might have a link to that then opens another div so that you can edit or delete this item. Let's also assume that the edit div has some drop down lists which help you edit the item. Typically to keep this div hidden on the initial page load, you would create something like:

```html
<div id="divEditItem" runat="server" style="display:none">
	<!-- Your edit controls here -->
</div>
<div runat="server" id="divGrid" style="display:block">
	<table>
		<thead>
			<tr>
				<th>
					<!-- table headers here -->
				</th>
			</tr>
		</thead>
		<tbody>
			<asp:Repeater id="rptGrid" runat="server">
				<ContentTemplate>
					<tr>
						<!-- row level data from your data objects -->
					</tr>
				</ContentTemplate>

			</asp:Repeater>
		</tbody>
	</table>
</div>
```

Now, let's suppose you want to bind all of your dropdown lists on the initial page load so that editing these items will be fairly fast. You might even try to keep divEditItem hidden until the asynchronous PostBack completes with a JavaScript <a href="http://msdn.microsoft.com/en-us/library/bb311028.aspx" target="newTab">endRequest callback function<a/>. Normally, this doesn't cause any issues; the page will load just fine. But if your lists are sufficiently large or you are binding a lot of data to the invisible control, you may notice that the page will load slowly or IE may even crash.

These problems can also arise when using jQuery. For instance, if you have a large jQuery DataTable that you are initializing while it is invisible the script might crash.

## The Solution

Try to bind the data-intensive controls only when you are showing the control. If you want to prevent the need for rebinding controls every time use a ViewState boolean to keep track of whether or not the control has been loaded. The cost of the ViewState variable will be less taxing on your user's experience, than it will be waiting to for IE to process and render invisible elements in your DOM. Expensive jQuery operations like the DataTables initialization should only be called only on visible DOM elements.

While this doesn't create the slickest UI, your users will be much more frustrated with applications that crash their browser.
