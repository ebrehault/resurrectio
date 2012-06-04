Resurrectio
===========

**Any phantom deserves a resurrection.**

Resurrection is a Chrome extension allowing to record a sequence of browser
actions and to produce the corresponding `CasperJS  <http://casperjs.org/>`_
script.

Compare to Selenium, **CasperJS evaluates Javascript**, so your test will not
be limited to pure HTML interactions.

Resurrection also provides a way to produce screenshots alongside your test
scenario.

Installation
============

CasperJS / PhantomJS
--------------------

Install `PhantomJS <http://code.google.com/p/phantomjs/wiki/Installation>`_,
be careful CasperJS requires PhantomJS >= 1.5.

Install `CasperJS <http://casperjs.org/installation.html>`_.

Resurrection installation
-------------------------

Get Github sources::
    git clone git://github.com/ebrehault/resurrectio.git

It will produce a ./resurrection folder.

Then, in Chrome:
- go to **Tools / Extensions**,
- expand **Developer mode**,
- click **Load unpacked extension**,
- select the .resurrection folder.

Usage
=====

Click on the Resurrection extension icon.

Enter the start URL, and click Go.

Then execute your usage scenario, all the events will be recorded.

By right-clicking on the page, you might also record some assertion (about the
current url, about existing text, etc.).

You can require a **screenshot** at any moment (they will be produced everytime
you run the resulting test).

You might also record some comments (click again on the extension icon, and
click **Add comment**).

When you are done, click again on the extension icon, and
click **Stop recording**.

Now, generate the CasperJS test script by clicking **Export Casper test**.

Copy/paste the resulting code into a local file, and run the test::
    casperjs my_scenario.js

It will play your entire scenario and produce the screenshots.

Future feature
==============

Export comments + screenshots in ReStructuredText in order to generate
documentation automatically from the tests.

Credits
=======

Author
------

* Eric BREHAULT <eric.brehault@makina-corpus.org>

* Resurrectio event recorder is based on the zope.recorder tool, created by
Brian Lloyd <brian@zope.com>

Companies
---------
|makinacom|_

* `Planet Makina Corpus <http://www.makina-corpus.org>`_
* `Contact us <mailto:python@makina-corpus.org>`_


.. |makinacom| image:: http://depot.makina-corpus.org/public/logo.gif
.. _makinacom:  http://www.makina-corpus.com
