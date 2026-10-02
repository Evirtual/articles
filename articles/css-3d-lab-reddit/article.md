# When my CSS experiment became an AI experiment

*I posted CSS 3D Lab expecting people to talk about CSS. The discussion became something else: AI, authorship, learning, community rules, and what it means to make something.*

A couple of weeks ago I started playing around with CSS 3D and Claude Code. There wasn't a big plan behind it. I was curious how far AI could go creating 3D objects with CSS, so I started asking it to make different things and seeing what happened.

As usually happens with these experiments, it grew. I kept adding models, removing things that didn't work, fixing others and building tools around the whole thing. Recording and export became their own problem. Checks accumulated. Eventually I built a ledger because I wanted to know which models had actually been checked and whether those checks were still valid after the code changed.

I wrote about both parts of that process already: CSS 3D Lab and the ledger.

Then I posted CSS 3D Lab to r/css.

I expected people might look at the models, inspect the CSS, tell me which ones looked bad or suggest something interesting to try. Some people did. But pretty quickly the discussion became much less about CSS and much more about AI.

People noticed Claude in the Git history. That wasn't hidden; the commits openly record Claude as co-author. From there, people started digging through the repository, reading the articles and asking increasingly detailed questions about how the project had been made.

Some of those questions were genuinely interesting. Which models did I use? How much did the API usage cost? How many tokens were used? How much time did I spend? What did I learn from the process? One commenter suggested that an experiment like this should document those things much more systematically.

At first the intensity felt a little strange. I had spent a couple of weeks playing with AI and CSS because I found it interesting, while parts of the discussion began to feel like I had submitted an academic paper with an incomplete methodology section.

But that became interesting too.

The comments weren't only evaluating whether a cube looked good or whether the CSS was clever. People were evaluating the process that produced it. For some, the fact that Claude had generated a large part of the implementation changed the meaning of the result itself. Questions about the project became questions about authorship, learning and whether using AI this way counted as making something.

Other people saw it differently. Some liked the experiment precisely because AI was part of it. Others didn't seem particularly concerned about who typed the CSS as long as there was something interesting to inspect.

Then I found that r/css had already been discussing this before my post arrived. A community poll asked how AI-assisted content should be handled. The largest group preferred no AI-assisted content, while another large group wanted to distinguish between useful AI-assisted work and what they considered AI slop.

That put the reaction into a different context. I thought I had submitted a CSS experiment, but I had also dropped it into a community that was already trying to decide whether this kind of work belonged there at all.

The post kept moving anyway. Before it disappeared it had reached roughly 20,000 views, 65 upvotes, dozens of comments and 91 shares. Then the moderators removed it.

I don't know the exact reason for the removal, so I don't want to turn that into a conclusion it can't support. It may have been related to AI, self-promotion, another subreddit rule, or simply a moderation decision I don't know about. And in any case, it is their community. Communities are allowed to decide what kind of material they want.

What interested me more was everything that happened before the removal.

Without intending to, the project had become a small test of something beyond CSS. The original question was simply how far I could push AI-generated CSS 3D. Once it was public, another question appeared: what does making something mean when the implementation can increasingly be generated for you?

I don't think there is a clean answer.

For me, the process still felt like making something. I had the curiosity, kept the experiment going, looked at the results, rejected things, changed direction, tested things and built more infrastructure when new problems appeared. Claude did a huge amount of the implementation. That isn't something I want to disguise; it was part of the experiment from the beginning.

Someone else can reasonably care about a different part of the process. They might want every prompt, model, token, dollar and hour recorded. They might want a controlled comparison between models. They might care much more about whether the person conducting the experiment could reproduce every piece manually.

That could be an interesting experiment too. It just isn't the one I happened to make.

And maybe this is one of the more interesting consequences of these tools. If somebody looks at CSS 3D Lab and thinks, "I could do this much better," the barrier to actually trying their version is getting lower. They don't need mine to be the definitive way of doing it. They can build another one, measure different things and arrive somewhere else.

I started CSS 3D Lab because I was curious about what AI could make with CSS. Posting it gave me something I hadn't planned to investigate: how people react when the process of making software changes underneath a skill and a community built around it.

I expected to learn something about CSS. I ended up learning something about people too.
