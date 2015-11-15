/**
 * @fileoverview Lighttest - a clear testing environment
 * @version 0.1.4
 * 
 * @license MIT, see http://github.com/asvd/lighttest
 * Copyright (c) 2014 asvd <heliosframework@gmail.com> 
 */

include('base.js');
include('platform.js');

init = function() {

    lighttest._state = 'nothing';
    lighttest._pendingTests = null;
    lighttest._pendingCallback = null;
    
    
    /**
     * Wraps the given code so that in case of exception it will fail
     * the test (instead of breaking the stack)
     * 
     * @param {Function} method to wrap
     * 
     * @returns {Function} wrapped method
     */
    lighttest.protect = function(method) {
        return function() {
            try {
                method.apply(this, arguments);
            } catch(e) {
                lighttest.check(false);
                lighttest.done();
                throw e;
            }
        }
    }


    /**
     * Runs the given set of tests
     * 
     * @param {Array} tests list of tests to execute
     * @param {Function} callback to run after the tests
     */
    lighttest.start = function(tests, callback) {
        switch(lighttest._state) {
        case 'nothing':
        case 'paused':
            // (re)start
            lighttest._platform.init();
            lighttest._platform.reset();
            lighttest._testsFailed = 0;
            lighttest._currentTestIdx = 0;
            lighttest._state = 'running';
            lighttest._callback = callback || null;
            lighttest._tests = [];
            for (var label in tests) {
                if (tests.hasOwnProperty(label)) {
                    lighttest._tests.push({
                        label : label,
                        method : lighttest.protect(tests[label])
                    });
                }
            }
            lighttest._next();
            break;

        case 'running':
        case 'interrupting':
            // switching to restart even in case of requested pause
            // (restart is stronger)
            lighttest._state = 'interrupting';
            lighttest._pendingTests = tests;
            lighttest._pendingCallback = callback;
            break;
        }
    }

    
    /**
     * (Un)pauses the tests execution (waiting until the currently
     * running test is completed)
     */
    lighttest.pause = function() {
        switch(lighttest._state) {
        case 'nothing':
        case 'interrupting':
            break;

        case 'running': // pausing
            lighttest._state = 'interrupting';
            lighttest._pendingTests = null;
            lighttest._pendingCallback = null;
            break;

        case 'paused':  // unpausing
            lighttest._state = 'running';
            lighttest._next();
            break;
        }

    }
    
    
    /**
     * Checks the given value against being true, logs the result for
     * the currently running test
     * 
     * @param {Boolean} value to check
     */
    lighttest.check = function(value) {
        if (value) {
            lighttest._platform.printGreen('PASS ');
        } else {
            lighttest._platform.printRed('FAIL ');
            lighttest._currentFailed = true;
        }
        
    }


    /**
     * Called by the test body when finished, launches the next test
     */
    lighttest.done = function() {
        // let pause() called after done() time to perform
        setTimeout(lighttest._done, 10);
    }

    
    /**
     * Launches the next test
     */
    lighttest._done = function() {
        if (lighttest._currentFailed) {
            lighttest._testsFailed++;
        }

        lighttest._currentTestIdx++;
        
        switch(lighttest._state) {
        case 'paused':
        case 'nothing':
            // tests not running
            break;

        case 'running':
            // normal case, prevent stack growth
            setTimeout(lighttest._next, 0);
            break;

        case 'interrupting':
            if (lighttest._pendingTests) {
                // restart requested
                lighttest._state = 'nothing';
                var tests = lighttest._pendingTests;
                var callback = lighttest._pendingCallback;
                lighttest._pendingTests = null;
                lighttest._pendingCallback = null;
                lighttest.start(tests, callback);
            } else {
                // pause requested
                lighttest._state = 'paused';
                lighttest._platform.printLine();
                lighttest._platform.printLine();
                lighttest._platform.printBlue('// paused');
                lighttest._platform.printLine();
            }
            break;
        }
    }


    /**
     * Proceeds to the next test
     */
    lighttest._next = function() {
        var idx = lighttest._currentTestIdx;
        if (idx == lighttest._tests.length) {
            lighttest._finalize();
        } else {
            lighttest._platform.printLine();
            lighttest._currentFailed = false;
            var test = lighttest._tests[idx];
            lighttest._platform.printWhite(test.label+'  ');
            setTimeout(test.method, 0);
        }
    }


    /**
     * Finalizes testing after all tests completed
     */
    lighttest._finalize = function() {
        var failed = lighttest._testsFailed;
        var total = lighttest._tests.length;

        lighttest._platform.printLine();
        lighttest._platform.printLine();
        if (failed) {
            lighttest._platform.print(
                failed + ' of ' + total + ' tests '
            );
            lighttest._platform.printRed('FAILED');
        } else {
            lighttest._platform.print(total + ' tests ');
            lighttest._platform.printGreen('PASSED');
        }

        lighttest._platform.printLine();
        lighttest._platform.printLine();

        lighttest._state = 'nothing';

        if (lighttest._callback) {
            lighttest._callback(failed);
        }

        lighttest._platform.exit(failed);
    }

}

