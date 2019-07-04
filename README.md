# Y-Label
Let anyone search and label text with active learning and no servers

## Problem it solves
Typical usage scenario is company X has some domain experts (Doctor, trader, lawyer) and lots of text data and they want the expert to label the data. 
Often their is a lot of data and lots of it isn't relevant so it's an inefficient process that doesn't pan out. 
You can solve this with either [guided learning](http://pages.stern.nyu.edu/~fprovost/Papers/guidedlearning-kdd2010.pdf) or [active learning](http://burrsettles.com/pub/settles.activelearning.pdf), but both of these typically need some engineering work (e.g. client server +ML/search)  and that's a lot of overhead for an adhoc project.

## Solution
Y-Label tried to solve the above by 
- Being completely in browser, so there is no engineering work
- Providing full text search / trigram indexing 
- Implementing a deep active learning module that helps select the most relevant data
- Use IndexDB to give the user persistence without relying on a server

## Status
As of now this is way before the V0 release and we're still figuring things out. The search funtionality works


