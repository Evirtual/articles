# When my CSS experiment became an AI experiment

*I posted CSS 3D Lab expecting a conversation about CSS. Around 20,000 views later, the more interesting experiment was the conversation around how it had been made.*

## What I posted

A couple of weeks ago I started playing around with CSS 3D and Claude Code. There wasn't a big plan behind it. I was curious how far AI could go creating 3D objects with CSS, so I started asking it to make different things and seeing what happened.

As usually happens with these experiments, it grew. I kept adding models, removing things that didn't work, fixing others and building tools around the whole thing. Recording and export became their own problem. Checks accumulated. Eventually I built a ledger because I wanted to know which models had actually been checked and whether those checks were still valid after the code changed.

By the time I shared it, CSS 3D Lab wasn't just a folder of generated snippets. It was a live gallery with more than a hundred models, editors, model pages, recording and export, automated checks and a ledger. I had already written two articles about how it happened: [CSS 3D Lab](https://articles.edgarasneverdauskas.com/css-3d-lab/) and [the Ledger](https://articles.edgarasneverdauskas.com/css-3d-lab-ledger/).

Then I posted it to r/css.

I wasn't trying to make a statement about AI. I thought people might look at the models, inspect the CSS, tell me which ones looked bad or suggest something interesting to try.

Some people did. But pretty quickly the conversation became about something else.

## The conversation changes

One of the first reactions was simply: "What on earth is the point of this?" Another said the site "screams made with AI."

That part wasn't surprising. AI was heavily involved. That was the experiment.

I replied that I had mostly built it out of curiosity: I wanted to see what kinds of 3D models AI could create using CSS and how far I could push it. Instead of settling the question, that explanation opened a much bigger one.

If Claude generated the implementation, what exactly had I made?

One commenter eventually reduced it to: I hadn't made anything or learned anything. Another person described the process sarcastically as asking AI to make 144 models and then telling it when one of them sucked.

At that point we weren't really discussing transforms, perspective or browser rendering anymore. We were discussing what counts as creating.

## People start investigating the project

The interesting part was that some people didn't stop at the Reddit post. They opened the repository.

Claude's involvement wasn't hidden. The Git history openly records Claude as co-author, and one commenter quoted the first commit: 21 live 3D demos, the Vite and TypeScript gallery, filters, detail views and standalone snippets — 6,462 lines in that initial commit.

Others read the articles and looked at the surrounding system. The discussion moved from "this looks AI-generated" to questions about how the experiment itself should have been documented.

Which models did I use? How much did the API usage cost? How many tokens were used? Which subscriptions and tools were involved? How much time did it take compared with doing it manually? What exactly did I learn? Should every source of inspiration be recorded? Could somebody reproduce the experiment?

Some of those are good questions.

They just weren't questions I had set out to answer.

At first the intensity felt strange. I had spent a couple of weeks playing with AI and CSS because I found it interesting, while parts of the discussion began to feel like I had submitted an academic paper with an incomplete methodology section.

But that became interesting too.

## The questions get bigger than CSS

The disagreement wasn't really about whether a cube rendered correctly.

People were evaluating the process that produced it. For some, Claude generating a large part of the implementation changed the meaning of the result itself. The amount of manual coding seemed connected to whether the project represented learning, skill or authorship.

Other people saw it differently. Some defended the experiment specifically because using AI in this way was the point. Others didn't seem particularly concerned about who typed each line as long as there was something interesting to inspect.

I don't think either reaction can be reduced to a simple "AI good" or "AI bad" argument.

There are reasonable questions about quality, attribution, low-effort generated content and what happens to technical communities when producing code becomes extremely cheap. At the same time, there is also a strange question appearing underneath all of this: if an idea can now be implemented with much less manual effort, does that make the idea less worth trying?

For me, no. But that doesn't mean every community has to reach the same conclusion.

## The community was already debating AI

While this was happening I came across an r/css poll about AI-assisted content.

46% of the votes shown in the poll preferred no AI-assisted content. Another 35% wanted a distinction between "AI slop" and meaningful AI-assisted work. Smaller groups supported AI-assisted products or AI-written posts in particular circumstances.

So my post hadn't entered a neutral room. It landed in a community that was already deciding how it wanted to treat AI-assisted work.

That changed how I looked at the reaction.

Some people were judging CSS 3D Lab as a project. Some were judging the process used to build it. Some were effectively discussing what kind of content they wanted r/css to be a place for.

Those are different questions, even though they all ended up underneath the same post.

## Then the post disappeared

The post kept moving while the argument continued. Before it was removed, the Reddit analytics showed about 19,600 views, 65 upvotes, 91 shares and 31 comments.

Then the moderators removed it.

I don't know the exact reason, and I don't want to invent one. The screenshot only says that the post was removed by the moderators. It could have been related to AI, self-promotion, another rule or something else entirely.

I also don't have a problem with the basic idea that a community gets to decide what belongs there. If r/css wants a particular boundary around AI-assisted content, that is ultimately for that community to work out.

What interested me more was that by the time the post disappeared, removal almost felt like the least interesting part of the story.

## The experiment I didn't plan

I started with a fairly simple question: how far can I push AI and CSS 3D?

I ended up accidentally running another experiment.

I got to watch what happened when something openly built with AI was placed in front of a technical community where the process of writing code matters to many of the people participating.

There wasn't one reaction. There was curiosity, dismissal, technical criticism, jokes, support, arguments about authorship, people inspecting commits, people reading the process articles, suggestions for a more rigorous experiment, a community poll and finally moderation.

And somewhere inside all of that was a useful point I hadn't considered when I started.

Someone can look at CSS 3D Lab and think my experiment is badly designed. Maybe I should have tracked every prompt, token, model, dollar and hour. Maybe the models should have been compared under controlled conditions. Maybe there should have been a stricter definition of what counts as success.

That actually sounds like an interesting experiment.

They can build it.

The cost of trying these ideas is getting lower. My experiment doesn't need to be the definitive version, and somebody else's doesn't need to invalidate mine. We can ask different questions and make different things.

For me the process was simple. I had an idea, experimented with it, rejected things, changed direction, kept things that worked and built more infrastructure when new problems appeared. Claude did a huge amount of the implementation. That's not something I'm trying to hide. It is one of the reasons the project exists.

I expected CSS 3D Lab to teach me something about CSS and AI.

After posting it, I ended up learning something about people too.
