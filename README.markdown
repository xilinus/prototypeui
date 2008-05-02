# Prototype UI

## Distrib files

To generate distrib files, you need to run rake tasks.

> rake dist 

To generate one JS file in dist directory with all components (prototype-iu.js)

> rake dist:each

To generate one JS file per component (window.js, carousel.js ...) in dist directory

> rake dist:compress 

To compress all JS files from dist directory (window.js ==> window.packed.js ...)

## Documentation

Currently, documentation is based on NaturalDocs. To generate hmtl files just tun

> rake doc

## Help Wanted

We want to move to [PDoc](http://pdoc.org/) and we need help to write new documentation.
Nothing has been done yet, only rake tasks.

If you want to generate pdoc files, you need to get pdoc (it's included as a git submodule)
Do it only once to get pdoc

> git submodule init
> git submodule update

then you can generate pdoc files

> rake -f Rakefile.pdoc pdoc 

And open pdoc/index.html to check it. Pretty easy.

To avoid conflicts with current doc, do not includ pdoc comment in current JS file. Edit documentation.pdoc in each component directory (add any new .pdoc file, they will be used in rake pdoc).
When you're done, pull request :).

Thanks in advance for your help.

## Bugs Report

We are also moving to [lighthouseapp.com](http://lighthouseapp.com/), right now you can fill tockets on our [Trac](http://dev.prototype-ui.com/)