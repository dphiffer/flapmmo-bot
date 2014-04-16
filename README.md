FlapMMO-bot
===========

A simple JavaScript bot that uses computer vision and the Canvas API to cheat at [FlapMMO](http://flapmmo.com).

*Note: I've gotten the best results using Safari.app on OS X (untested in Windows/Linux)*

Bookmarklet
-----------

To install, copy and paste [the bookmarklet text file](https://raw.githubusercontent.com/dphiffer/flapmmo-bot/master/flapmmo-bot-bookmarklet.txt) into a new browser bookmark. The URL of the bookmark should be `javascript:(function(){var%20FlapMMObot={...`

To activate FlapMMO-bot, select the bookmark (or click on the button if it's in your bookmark toolbar) while at [flapmmo.com](http://flapmmo.com/). You just need to click once, and the bot should start flying by itself.

Userscript
----------

You can also install FlapMMO-bot as a [Greasemonkey](http://greasespot.net/) userscript. If you have Greasemonkey installed, loading the [raw userscript file](https://github.com/dphiffer/flapmmo-bot/raw/master/flapmmo-bot.user.js) will trigger it to install.

Once installed, you just visit the [FlapMMO](http://flapmmo.com/) website, and it should start working all on its own.

Links
-----

* [FlapMMO](http://flapmmo.com/)
* [Demo video](https://www.youtube.com/watch?v=Wbn5h3D0a2g)
* [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) (particularly [getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#getImageData%28%29))
* [Bookmarklet Crunchinator](http://ted.mielczarek.org/code/mozilla/bookmarklet.html)
* On Twitter: [Dan Phiffer](https://twitter.com/dphiffer), [FlapMMO](https://twitter.com/flapmmo)
