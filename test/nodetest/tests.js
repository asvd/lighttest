lighttest = require('./lighttest-node.js');

var lighttestTests = {
    'Mixed test':
    function() {
        lighttest.check(true);
        lighttest.check(false);
        lighttest.done();
    },


    'strange test':
    function() {
        var a = 1;

        switch( a ) {
        case 1 :
            a = 2;
            break;
        case 2:
            lighttest.check(false);
            break;
        }
        lighttest.check(true);
        lighttest.done();
    },


    'Async test':
    function() {
        setTimeout(
            function() {
                lighttest.check(true);
                lighttest.done();
            },
            100
        );
    },

    
    'Check if a code runs without exceptions' : function() {
        var shouldRunWithoutExceptions = function() {
//            throw 'BAR';
        }

        var exception = null;
        try {
            shouldRunWithoutExceptions();
        } catch ( e ) {
            exception = e;
        }

        if ( !exception ) {
            lighttest.check( true );
            lighttest.done();
        } else {
            lighttest.check( false );

            // issuing asynchroniously since throwing breaks the stack
            setTimeout( lighttest.done, 10 );
            throw exception;
        }

    },


    'Check if a code throws an exception' : function() {
        var shouldThrowAnException = function() {
            throw 'FOO';
        }
        

        var exception = null;
        try {
            shouldThrowAnException();
        } catch ( e ) {
            exception = e;
        }

        if ( exception ) {
            lighttest.check( true );
            setTimeout( lighttest.done, 10 );
            throw exception;
        } else {
            lighttest.check( false );
            lighttest.done();
        }
    },

    'Test throwing expection':
    function() {
        setTimeout(
            function() {
                lighttest.check(true);
                lighttest.done();
            },
            100
        );
    },
    

    'Math.sqr() function test':
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

        setTimeout( callback, 100 );
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
        lighttest.pause();
        setTimeout(
            function() {
                lighttest.pause();
            },
            2000
        );
    }
};

for ( var i = 0; i < 15; i++ ) {
    lighttestTests['generated ' + i ] = function() {
        setTimeout(
            function() {
                lighttest.check(true);
                lighttest.done();
            },
            600
        );
    }
}

lighttestTests['Another test with a long description'] =  function() {
    setTimeout(
        function() {
            lighttest.check(true);
            lighttest.check(true);
            lighttest.check(false);
            lighttest.check(true);
            lighttest.check(false);
            lighttest.check(false);
            lighttest.check(false);
            lighttest.check(false);
            lighttest.done();
        },
        100
    );
};

var finalize = function( num ) {
    console.log('\n\nFinalized successfully! Failed: ' + num);

    setTimeout(
        function() {
            var finalize2 = function() {
                console.log('\n\nSecond finalize!');
            }
//            lighttest.start(tests,finalize2);
        },
        3000
    );
}

lighttest.start( lighttestTests, finalize );

