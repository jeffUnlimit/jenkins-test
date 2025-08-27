clear
=====

Clear the terminal screen if possible

Usage
-----

``` js
var clear = require('clear');
clear();
```

Example
-------

### clear([opts])

- `opts` (Object)
- `opts.fullClear` (Boolean) Defaults to `true`, setting this to `false` will
  prevent this module from clearing the screen.  This will not remove anything
  from the screen, but instead move your cursor to position 0,0.  Much like
  printing a `\r` instead of a `\n` to reset the current line of output.

ANSI Codes
----------

License
-------

MIT
