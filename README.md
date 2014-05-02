Lighttest — a clear testing environment
=======================================


Lighttest is a JavaScript unit-testing library — it works both in
browsers and under Node.js, supports flow control, and is focused on
keeping the tests clear. This is achieved with a minimal syntax of the
test cases, and the only testing function, `lighttest.check()`, used
to indicate a success or a failure. As shown below, any testing
behaviour could be implemented using that function and the native
means of JavaScript. As result, one can easily understand or prepare
the exact process performed by a test without a need to involve some
additional testing API.


### Installation

- *For [Helios Kernel](http://asvd.github.io/helios-kernel/)* (upon
both Node.js and browser-based environments) — no installation
required, simply include the library in the module head:


```js
include('http://asvd.github.io/lighttest/lighttest-0.1.2.js');
```

Optionally you may [download the
distribution](https://github.com/asvd/lighttest/releases/download/v0.1.2/lighttest-0.1.2.tar.gz),
unpack it, and include the library locally.

- *For the plain Node.js* — uning npm:

```sh
$ npm install lighttest
```

and then in your code:

```js
var lighttest = require('lighttest');
```

- *Anywhere else* — download the Lighttest
[bundle](https://github.com/asvd/lighttest/releases/download/v0.1.2/lighttest-0.1.2-bundled.tar.gz),
unpack it and then load the `lighttest.js` in any suitable way: the
bundle is a plain JavaScript file simply declaring the global
`lighttest` object.


### Usage

Testing process is launched using the `lighttest.start()` function,
the only argument to provide is an object containing a set of tests
cases:

```js
lighttest.start({
    'Some test': function() {
        // test case code
        ...
    },


    'Another test': function() {
        // another test case code
        ...
    },

    ...
});

```

The test cases object is key-based, where the key is a test label, and
the value is a function to perform during the test. The code given
above should result into an output like this:

```sh

Some test  PASS
Another test  PASS

2 tests PASSED

```

Inside the test case, two other functions are available:

- `lighttest.check()` — verifies the given value against being true;

- `lighttest.done()` — notifies that the current test case is over.

Therefore a code of a single test case may look like this:

```js
    ...

    'Check if something works':
    function() {
        var result = something.shouldWork();
        lighttest.check(result);
        lighttest.done();
    },

    ...
```

If a value given to the `lighttest.check()` function casts to true, it
will result into a green `PASS` label on the output, otherwise the red
`FAIL` label will be displayed.

A single test may call the `lighttest.check()` method as many times as
needed thus performing several checks for a single test case. The
whole test case is considered as failed if at least one check has
failed.

After the `lighttest.done()` function is issued, Lighttest will
proceed to the next test case. This method could be issued after some
time, which makes it possible to test some callback-based stuff:

```js
    ...

    'Check if something asynchronous works fine':
    function() {
        var successCb = function() {
            lighttest.check(true);
            lighttest.done();
        }

        var failureCb = function() {
            lighttest.check(false);
            lighttest.done();
        }

        doSomethingAsynchronous(
            lighttest.protect(successCb),
            lighttest.protect(failureCb)
        );
    },

    
    ...
```

If an unhandled exception happens during the run of the test,
Lighttest will consider the running test as failed, and proceed to the
next test immediately. In order to also have the asynchronous
exceptions handled, the callbacks must be wrapped with the
`lighttest.protect()` method (which also passes all the arguments), as
shown in the example above.


If, on the other hand, you need to make sure that the given code
actually throws an exception (which should mean the passed test), this
could be performed manually:


```js
    ...

    'Check if a code throws an exception':
    function() {
        var exception = null;
        try {
            something.shouldThrowAnException();
        } catch (e) {
            exception = e;
        }

        lighttest.check(exception);
        lighttest.done();
    },
    

    ...
```


 An unhandled exception along with the call of the `lighttest.check()`
function are the only two things regarded by Lighttest in sence of
recognizing a success or a failure. Such approach makes the test
failure conditions specifying clear, and allows to see what exactly is
performed and checked during the test.

After all tests are processed, Lighttest will display the overall
number of the tested cases, and exit with an error code equalling the
number of failed tests (if performed under Node.js).

Optional callback could also be given to the `lighttest.start()`
function. It will be issued after all tests are completed, the number
of failed tests will be provided as an argument:

```js
var tests = {
    // set of tests
    ...
}

var finalize = function(failedCount) {
    // perform the cleanup or report the result
    ...
}

lighttest.start(tests, finalize);

```

When performed in the browser-based environment, Lighttest will take
over the whole browser window by default. Optionally the output may be
redirected to a particular node on the webpage. To do this, such node
should be designated with `id="lighttest"`. The node will be searched
for upon the first call of the `lighttest.start()` function, and if
not found, Lighttest will fill the whole page. Output redirect may be
useful to perform the tests inside a live frontend application.


### Flow control

Another feature designed for running the tests in a GUI-driven
environment is a flow control. When performing the tests inside a live
application during development, it may be useful to interrupt the
testing process or even to restart it completely.

To interrupt the process, one should call the `lighttest.pause()`
function. It will then wait until the current test case is completed
(since there could be some upcoming callbacks), and interrupt the
execution afterwards. To continue running the tests, call the
`lighttest.pause()` again.

To restart the tests, the `lighttest.start()` function should be
called again with the same arguments (optionally a different set of
tests may be provided). Similarry it will wait until the currently
running test case is over.

It is assumed that there are some buttons on the screen issuing
`lighttest.start()` and `lighttest.pause()` functions, but it may also
be convenient to call the the `lighttest.pause()` right inside the
test case code to interrupt the execution after that test (but in this
case there should certainly be a pause button, otherwise it will not
be possible to continue the process).


### Example

The following example shows a set of tests implemented as a [Helios
Kernel](http://asvd.github.io/helios-kernel/) module:

```js
include('http://asvd.github.io/lighttest/lighttest-0.1.2.js');

init = function() {
    lighttest.start({
        'Math.sqrt() function test':
        function() {
            var calculated = Math.sqrt(4);
            var expected = 2;
            lighttest.check( calculated == expected );

            lighttest.done();
        },


        'Callback-based test for setTimeout()':
        function() {
            var callback = function() {
                lighttest.check(true);
                lighttest.done();
            }

            setTimeout( lighttest.protect(callback), 100 );
        },


        'Test with several checks':
        function() {
            lighttest.check( 2*2 == 4 );
            lighttest.check( 3*3 == 9 );
            lighttest.done();
        },


        'Test with intentional failed check':
        function() {
            lighttest.check( 2*2 == 4 );
            lighttest.check( 2*2 == 5 );
            lighttest.done();
        },
        

        'Test with checks against undefined':
        function() {
            var a = { b : 1 };
            lighttest.check( typeof(a.b) != 'undefined' );
            lighttest.check( typeof(a.c) == 'undefined' );
            lighttest.check( typeof(a) != 'undefined' );
            lighttest.check( typeof(noSuchVar) == 'undefined' );
            lighttest.done();
        },
        

        'Test with checks against strict equality':
        function() {
            var a = false;
            var b = 0;
            lighttest.check( a == b );
            lighttest.check( a !== b );
            lighttest.done();
        }
    });

}

```


The given code produces the following output:

```sh
Math.sqrt() function test  PASS 
Callback-based test for setTimeout()  PASS 
Test with several checks  PASS PASS 
Test with intentional failed check  PASS FAIL 
Test with checks against undefined  PASS PASS PASS PASS 
Test with checks against strict equality  PASS PASS

1 of 6 tests FAILED 
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/asvd/lighttest/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

