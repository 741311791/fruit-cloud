/**
 * Root-cause fix for the benign "ResizeObserver loop completed with
 * undelivered notifications" warning.
 *
 * The warning is emitted by the browser when a ResizeObserver callback runs
 * synchronously and mutates layout in a way that would require another
 * observation pass within the same frame. Third-party UI primitives (base-ui
 * popovers/selects, etc.) commonly measure and reposition elements inside
 * their observer callbacks, which triggers this loop.
 *
 * Instead of suppressing the symptom after the fact, we patch the global
 * ResizeObserver constructor before any app or library code runs so that every
 * observer callback is deferred into a requestAnimationFrame. Coalescing the
 * work into the next frame breaks the synchronous resize -> layout -> resize
 * cascade, so the loop never occurs.
 *
 * This is injected as a blocking inline <script> in the document <head> so it
 * executes before hydration and before any ResizeObserver instances are
 * created.
 */
export const resizeObserverPatchScript = `(function(){try{var RO=window.ResizeObserver;if(!RO||RO.__patched)return;var Patched=function(callback){var frame=0;var ro=new RO(function(entries,observer){cancelAnimationFrame(frame);frame=requestAnimationFrame(function(){try{callback(entries,observer)}catch(e){}})});return ro};Patched.prototype=RO.prototype;Patched.__patched=true;window.ResizeObserver=Patched}catch(e){}})();`
