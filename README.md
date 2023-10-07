# About

This is a very old (written in ~2013) partial implementation of an even older game called
"Erix" that I played as a kid on my Ericsson mobile phone (maybe it was
T20s?) in around year 2002. It's only a prototype and it's not finished. It was written as a fun private project only.

An example of how it worked at the time on the phone can be seen in [this YT video](https://youtu.be/tegllLEz-tU?si=YEaXAZXkCKczPGtG&t=273) (not mine).

## Instructions

Use arrow keys to move.
When moving with the arrow keys the "pen" will draw an active line. When the line is connected
at both sides the contained area will be filled and the line is no longer
active. If a ball hits the pen or an active line, you lose a life. The
goal is to try to fill as much area as possible. When filled as much % of
the area as required, the level is completed. The larger area you fill,
the more points you'll get. If you also capture one or more balls you'll
get even more points for the filled area.

## Future

To fully implement the game, the following features should be added at the least:

<ul>
  <li>Dynamic lives</li>
  <li>Dynamic levels</li>
  <li>Dynamic ball speed</li>
  <li>% requirement should be shown to the user and should grow with level difficulty</li>
  <li>High score (localStorage first, then database if public, etc...)</li>
  <li>Game over screen</li>
  <li>Pause</li>
  <li>Sound</li>
  <li>Reponsive design</li>
  <li>...</li>
</ul>

## Disclaimer

This is just a basic implementation of the game as I was learning programming at the time. It is not finished and it is not optimized. It is just a proof of concept, using [EaselJS](https://createjs.com/easeljs).
If I'd go and work on this now, I'd probably just rewrite the whole thing from scratch.
