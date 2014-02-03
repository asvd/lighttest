include('http://asvd.github.io/lighttest/lighttest-0.1.0.js');

init = function() {
    lighttest.start({
        'Math.sqrt() function test':
        function() {
            var calculated = Math.sqrt(4);
            var expected = 2;
            lighttest.check(calculated == expected);

            lighttest.done();
        },


        'Callback-based test for setTimeout()':
        function() {
            var callback = function() {
                lighttest.check(true);
                lighttest.done();
            }

            setTimeout(callback, 100);
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

