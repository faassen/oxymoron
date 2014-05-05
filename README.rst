Oyxmoron Templates for React
============================

The React client side framework doesn't have a template
language. Instead it lets you generate HTML using JavaScript objects
that represent DOM nodes, i.e. ``React.DOM.div()``. Or you can use
JSX, which extends JavaScript with a new syntax that lets you generate
DOM nodes in a way that looks more like HTML.

But it doesn't have a template language. It's proud it doesn't have a
template language. Oxymoron is the missing template language for
React.

Example
-------

::

  <ul let="a = ['hello', 'React', '!']">
    <li repeat="item in a">{{item}}</li>
  </ul>

is rendered as this::

  <ul>
    <li>hello</li>
    <li>React</li>
    <li>!</li>
  </ul>

Features
--------

* Performance similar to hand-written React JavaScript. During
  compilation, Oxymoron templates are transformed into JavaScript
  functions.

* Fully benefits from React's DOM diffing approach to update the DOM
  efficiently.

* Interpolation is the double stache ``{{foo}}``. You have the ability
  to use any JavaScript expression in them.

* Looping, conditionals, again with full support for JavaScript
  expressions.

* Templates are valid HTML 5 fragments. (XXX)

* Internationalized templates. Mark up translatable text in the
  template, extract it automaticaly and do Gettext-style translation.

data-let
--------

Define variables in element scope::

  <div data-let="a = 1, b = 2">
     {{a}} and {{b}}
  </div>

is rendered as::

  <div>
    1 and 2
  </div>

data-if
-------

Only render element if expression evaluates to true::

  <div data-if="foo === bar">
    foo is really bar
  </div>

if ``foo === bar``, then it's rendered like this::

  <div>
    foo is really bar
  </div>

and if ``foo !== bar`` then no element is rendered.

``data-if`` also supports ``data-else``::

  <div data-if="foo === bar">
    foo is really bar
  </div>
  <div data-else>
    foo isn't bar at all!
  </div>

if ``foo === bar`` then it's rendered like this::

  <div>
    foo is really bar
  </div>

and otherwise it's rendered like this::

  <div>
    foo isn't bar at all!
  </div>

data-repeat
-----------

Repeat an element multiple times::

  <ul>
    <li data-repeat="item in [1, 2, 3]">
     {{item}}
    </li>
  </ul>

this is rendered like this::

  <ul>
    <li>
       1
    </li>
    <li>
       2
    </li>
    <li>
       3
    </li>
  </ul>

Combining directives
--------------------

What happens if you add multiple directives to the same element?
``data-repeat`` applies first, then ``data-if``, then ``data-let``.

So::

  <ul>
   <li data-repeat="item in [1, 2, 3, 4]"
       data-if="item >= 3"
       data-let="squared = item * item">
     {{squared}}
   </li>
  </ul>

is rendered like this::

  <ul>
    <li>
      9
    </li>
    <li>
      16
    </li>
  </ul>

i18n
----

Basics
~~~~~~

Oxymoron has i18n support. This means that you can offer translations
for text strings in your template that need to be available in
multiple languages. If this is in your template::

  <p>Your input was wrong!</p>

Then ``Your input was wrong!`` is translatable text, and in Dutch
it would look like this::

  <p>Uw invoer was fout!</p>

You can tell Oxymoron that the contents of an element is translatable text
using ``data-t``::

  <p data-t>Your input was wrong!</p>

Now extraction tools can find this text, and you can provide
translations for it.

You can also indicate an attribute contains translatable text::

  <input type="submit" value="Submit" data-t-value>

Variables
~~~~~~~~~

What if you add a variable to the text? That works too::

  <p data-t>I saw {{thing}}.</p>

The translatable text will now be::

  I saw {{thing}}.

And in the translation you can place ``{{thing}}`` where you want it. Here's
the Dutch translation::

  Ik heb {{thing}} gezien.

What if the variable contains an expression instead of a name? For
instance::

  The title is: {{book.title()}}

We don't want to expose translators to such expressions, so this is an
error in a translatable text. You can use ``data-let`` to give them
local translatable names.

Pluralization
~~~~~~~~~~~~~

Consider this example::

  <p data-t>{{count}} cows</p>

When we use this, we run into a problem. What if ``count`` is ``1``? We'd
see this::

  <p>1 cows</p>

But this is wrong. We want this::

  <p>1 cow</p>

English has two *plural form*, one for the singular (1 cow) and one
for everything else, (5 cows). Other languages have other rules
though: some have 1 form for both singular and plural, some have more
than two. Polish for instance has a different form for when the
numeral ends with 2, 3, or 4 than for numbers that end with 5..9 and 0.

All this means we need to tell the translation system what the amount
is so that the right translated plural form can be retrieved. We do
this using ``data-plural``, like this::

  <p data-plural="count">{{count}} cows</p>

``data-plural`` behaves like ``data-t``, but you have to provide an
expression Oxymoron uses to determine the plural form.

If you write your template in English or another language with a
simple singular/plural split, it's handy to also be able to provide
the singular form. You can do so in the next element,
using ``data-singular``::

  <p data-plural="count">{{count}} cows</p>
  <p data-singular>{{count}} cow</p>

This way you can specify the behavior fully for English.

What if you want to indicate plurals for an attribute? Here we do it
for the ``value`` attribute::

  <input data-plural-value="count"
         type="submit" value="{{count}} cows">

You can also provide an optional singular for the ``value``
attribute::

  data-singular-value="{{count}} cow"

Sub-elements: data-tvar
~~~~~~~~~~~~~~~~~~~~~~~

What about a sub-element in a ``data-t`` section? Consider this, where
an ``em`` is inside an element marked with ``data-t``::

  <div data-t>The <em>pink</em> elephant.</div>

Oxymoron also reports an error for this. But why? At first glance the
translatable text could be this::

  The pink elephant.

But there is a problem: we have no reliable way of finding out where
``pink`` should show up in the translation. The French translation for
instance is this::

  L'éléphant rose.

So we'd expect the output to look like this::

  <div>L'éléphant <em>rose</em>.</div>

Oxymoron has no way to know that ``rose`` is French for ``pink`` and
therefore cannot place the ``em`` element correctly.

In these cases you have to help Oyxmoron by marking up the ``em`` element
with ``data-tvar``::

  <div data-t>The <em data-tvar="color">pink</em> elephant.</div>

Now Oxymoron knows to extract two separate translatable texts::

  The {{color}} elephant.

And::

  pink

If the contents of the sub-element is a variable (and a variable only,
nothing else), then ``data-tvar`` is optional, so instead of this::

  <div data-t>The <em data-tvar="color">{{color}}</em> elephant.</div>

can also be written like this::

  <div data-t>The <em>{{color}}</em> elephant.</div>

Logic within translatable text
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You may not put logic within translatable text that affects the
structure of the text. Therefore, elements marked by ``data-t`` may
not contain sub-elements with ``data-if`` or ``data-repeat`` on them.
The compiler reports an error for these.

Nesting
~~~~~~~

A ``data-t`` may not contain a sub-element with a ``data-t`` on it.

``data-tvar`` may however be nested::

  <div data-t>This is a <em data-tvar="something">complicated <a data-tvar="thing" href="">scenario</a></em>.</div>

This results in the following pieces marked for translation::

  This is a {{something}}.

  complicated {{thing}}

  scenario

