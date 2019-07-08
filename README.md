# Y-Label
Let anyone search and label text with active learning and no servers
<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/3aa977fa20524ed4abc90e540d43a33b" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>
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

## Goals
- Support any language without any assumptions about vocabulary or tokenization
- Work in the Browser with no communication to any server
- Be Dead easy for non-technical people to use
- Make exploring and labeling text datasets fast and easy. 


## Status
### What this does now
 - Upload data as a JSON array of objects and choose one field to label
 - Stores data in IndexDB
 - Creates a Trigram index on the data + Uses the index for regular search
 - Regex search (but with no indexing)
 - Add classes and classify each document
### What it will do soon (By Mid July 2019)
 - Export the labels as JSON
 - Allow CSV upload
 - Active Learning for document classification on index DB

## Roadmap / Plan
We are now at V0.0.0 Until say V0.0.X (X<5), we're doing 3 things
1. Adding all the cool features we can think about
2. Add support for span annotations
2. Getting a feel for usability and settle on a look and feel

Between V0.0.X and V1 we'll be
1. Figuring out stable API
2. Rewriting this with clean code, tests and conformity to the APIs above.

### Backends
The crucial thing for the second phase of V0 is figuring out APIs that will support swappable backends, so that users can for instance
1. Add there own storage and data sources
2. Implement their own search logic
3. Bring in their own active learning models

The idea being that what the user can express should be confined, but what happens to those expressions should be configurable. 
**However** The goal for **NOW** is to figure out what this is, so we are writing dirty non-extensible code so that we can move fast.

## Theoretical Inspiration

YLabel has a few inspiring papers and ideas that are worth looking at
1. [Why Label when you can Search? Alternatives to Active Learning for Applying Human Resources to Build Classification Models Under Extreme Class Imbalance] (http://pages.stern.nyu.edu/~fprovost/Papers/guidedlearning-kdd2010.pdf). This paper talks about the value of searching when we label data.
2. [Closing the Loop: Fast, Interactive Semi-Supervised Annotation With Queries on Features and Instances](https://www.aclweb.org/anthology/D11-1136) talks about searching and "feature" labeling along side active learning, with an old implementation in Java
3. [Active Learning Literature Survey](http://burrsettles.com/pub/settles.activelearning.pdf) The defintive guide on Active Learning
4. [Deep Active Learning for Named Entity Recognition](https://www.aclweb.org/anthology/W17-2630) A paper that shows that **Deep** Active Learning on text (For NER) is feasible and effective
5. [Neural Machine Translation in Linear Time](https://arxiv.org/abs/1610.10099) A deep learning model for text that works at the charachter level and is (maybe) fast enough to work in the browser. 

## Who is Behind this. 
This is [Tal Perry's](https://www.linkedin.com/in/tal-perry-b561212a/) "side-project". By day, I'm the founder and CEO of [LightTag - The Text Annotation Tool for Teams](https://lighttag.io), and this is where I get to try out new ideas, because they won't let me touch the code anymore. 