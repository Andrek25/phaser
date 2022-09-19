/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2022 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../utils/Class');
var Events = require('../events');
var TWEEN_CONST = require('./const');

/**
 * @classdesc
 * The TweenFrameData is a class that contains a single target that it will change the texture frame on.
 *
 * Tweens create TweenFrameData instances when they are created, with one TweenData instance per
 * target, per property. A Tween can own multiple TweenData instances, but a TweenData only
 * ever belongs to a single Tween.
 *
 * You should not typically create these yourself, but rather use the TweenBuilder,
 * or the `Tween.add` method.
 *
 * @class TweenFrameData
 * @memberof Phaser.Tweens
 * @constructor
 * @since 3.60.0
 *
 * @param {Phaser.Tweens.Tween} tween - The tween this TweenData instance belongs to.
 * @param {number} targetIndex - The target index within the Tween targets array.
 * @param {string} texture - The texture key to set at the end of this tween.
 * @param {(string|number)} frame - The texture frame to set at the end of this tween.
 * @param {function} delay - Function that returns the time in ms/frames before tween will start.
 * @param {number} duration - The duration of the tween in ms/frames.
 * @param {number} hold - Function that returns the time in ms/frames the tween will pause before repeating or returning to its starting value if yoyo is set to true.
 * @param {number} repeat - Function that returns the number of times to repeat the tween. The tween will always run once regardless, so a repeat value of '1' will play the tween twice.
 * @param {number} repeatDelay - Function that returns the time in ms/frames before the repeat will start.
 * @param {boolean} flipX - Should toggleFlipX be called when yoyo or repeat happens?
 * @param {boolean} flipY - Should toggleFlipY be called when yoyo or repeat happens?
 */
var TweenFrameData = new Class({

    initialize:

    function TweenFrameData (tween, targetIndex, texture, frame, delay, duration, hold, repeat, repeatDelay, flipX, flipY)
    {
        /**
         * A reference to the Tween that this TweenData instance belongs to.
         *
         * @name Phaser.Tweens.TweenData#tween
         * @type {Phaser.Tweens.Tween}
         * @since 3.60.0
         */
        this.tween = tween;

        /**
         * The index of the target within the Tween `targets` array.
         *
         * @name Phaser.Tweens.TweenData#targetIndex
         * @type {number}
         * @since 3.60.0
         */
        this.targetIndex = targetIndex;

        /**
         * The texture to be set at the start of the tween.
         *
         * @name Phaser.Tweens.TweenData#startTexture
         * @type {string}
         * @since 3.60.0
         */
        this.startTexture = null;

        /**
         * The texture to be set at the end of the tween.
         *
         * @name Phaser.Tweens.TweenData#endTexture
         * @type {string}
         * @since 3.60.0
         */
        this.endTexture = texture;

        /**
         * The frame to be set at the start of the tween.
         *
         * @name Phaser.Tweens.TweenData#startFrame
         * @type {(string|number)}
         * @since 3.60.0
         */
        this.startFrame = null;

        /**
         * The frame to be set at the end of the tween.
         *
         * @name Phaser.Tweens.TweenData#endFrame
         * @type {(string|number)}
         * @since 3.60.0
         */
        this.endFrame = frame;

        /**
         * The duration of the tween in milliseconds, excluding any time required
         * for yoyo or repeats.
         *
         * @name Phaser.Tweens.TweenData#duration
         * @type {number}
         * @since 3.60.0
         */
        this.duration = duration;

        /**
         * The total calculated duration, in milliseconds, of this TweenData.
         * Factoring in the duration, repeats, delays and yoyos.
         *
         * @name Phaser.Tweens.TweenData#totalDuration
         * @type {number}
         * @since 3.60.0
         */
        this.totalDuration = 0;

        /**
         * The time, in milliseconds, before this tween will start playing.
         *
         * This value is generated by the `getDelay` function.
         *
         * @name Phaser.Tweens.TweenData#delay
         * @type {number}
         * @since 3.60.0
         */
        this.delay = 0;

        /**
         * This function returns the value to be used for `TweenData.delay`.
         *
         * @name Phaser.Tweens.TweenData#getDelay
         * @type {function}
         * @since 3.60.0
         */
        this.getDelay = delay;

        /**
         * Will the Tween ease back to its starting values, after reaching the end
         * and any `hold` value that may be set?
         *
         * @name Phaser.Tweens.TweenData#yoyo
         * @type {boolean}
         * @since 3.60.0
         */
        this.yoyo = (repeat > 0) ? true : false;

        /**
         * The time, in milliseconds, before this tween will start a yoyo to repeat.
         *
         * @name Phaser.Tweens.TweenData#hold
         * @type {number}
         * @since 3.60.0
         */
        this.hold = hold;

        /**
         * The number of times this tween will repeat.
         *
         * The tween will always run once regardless of this value,
         * so a repeat value of '1' will play the tween twice: I.e. the original
         * play-through and then it repeats that once (1).
         *
         * If this value is set to -1 this tween will repeat forever.
         *
         * @name Phaser.Tweens.TweenData#repeat
         * @type {number}
         * @since 3.60.0
         */
        this.repeat = repeat;

        /**
         * The time, in milliseconds, before the repeat will start.
         *
         * @name Phaser.Tweens.TweenData#repeatDelay
         * @type {number}
         * @since 3.60.0
         */
        this.repeatDelay = repeatDelay;

        /**
         * How many repeats are left to run?
         *
         * @name Phaser.Tweens.TweenData#repeatCounter
         * @type {number}
         * @since 3.60.0
         */
        this.repeatCounter = 0;

        /**
         * If `true` this Tween will call `toggleFlipX` on the Tween target
         * whenever it yoyo's or repeats. It will only be called if the target
         * has a function matching this name, like most Phaser GameObjects do.
         *
         * @name Phaser.Tweens.TweenData#flipX
         * @type {boolean}
         * @since 3.60.0
         */
        this.flipX = flipX;

        /**
         * If `true` this Tween will call `toggleFlipY` on the Tween target
         * whenever it yoyo's or repeats. It will only be called if the target
         * has a function matching this name, like most Phaser GameObjects do.
         *
         * @name Phaser.Tweens.TweenData#flipY
         * @type {boolean}
         * @since 3.60.0
         */
        this.flipY = flipY;

        /**
         * A value between 0 and 1 holding the progress of this TweenData.
         *
         * @name Phaser.Tweens.TweenData#progress
         * @type {number}
         * @since 3.60.0
         */
        this.progress = 0;

        /**
         * The amount of time, in milliseconds, that has elapsed since this
         * TweenData was made active.
         *
         * @name Phaser.Tweens.TweenData#elapsed
         * @type {number}
         * @since 3.60.0
         */
        this.elapsed = 0;

        /**
         * The state of this TweenData.
         *
         * @name Phaser.Tweens.TweenData#state
         * @type {Phaser.Types.Tweens.TweenDataState}
         * @since 3.60.0
         */
        this.state = 0;

        /**
         * Is this Tween Data currently waiting for a countdown to elapse, or not?
         *
         * @name Phaser.Tweens.TweenData#isCountdown
         * @type {boolean}
         * @since 3.60.0
         */
        this.isCountdown = false;
    },

    /**
     * Prepares this TweenData for playback.
     *
     * Called automatically by the parent Tween. Should not be called directly.
     *
     * @method Phaser.Tweens.TweenData#init
     * @since 3.60.0
     *
     * @param {boolean} [isSeek=false] - Is the parent Tween currently seeking?
     */
    init: function (isSeek)
    {
        var tween = this.tween;
        var totalTargets = tween.totalTargets;

        var targetIndex = this.targetIndex;
        var target = tween.targets[targetIndex];

        //  Function signature: target, key, value, index, total, tween

        this.delay = this.getDelay(target, 'texture', 0, targetIndex, totalTargets, tween);

        this.repeatCounter = (this.repeat === -1) ? 999999999999 : this.repeat;

        this.setPendingRenderState();

        //  calcDuration:

        //  Set t1 (duration + hold + yoyo)
        var t1 = this.duration + this.hold;

        if (this.yoyo)
        {
            t1 += this.duration;
        }

        //  Set t2 (repeatDelay + duration + hold + yoyo)
        var t2 = t1 + this.repeatDelay;

        //  Total Duration
        this.totalDuration = this.delay + t1;

        if (this.repeat === -1)
        {
            this.totalDuration += (t2 * 999999999999);
        }
        else if (this.repeat > 0)
        {
            this.totalDuration += (t2 * this.repeat);
        }

        if (this.totalDuration > tween.duration)
        {
            //  Set the longest duration in the parent Tween
            tween.duration = this.totalDuration;
        }

        if (this.delay < tween.startDelay)
        {
            tween.startDelay = this.delay;
        }

        if (!this.startTexture)
        {
            this.startTexture = target.texture.key;
            this.startFrame = target.frame.name;
        }

        //  seek specific:
        if (isSeek)
        {
            this.progress = 0;
            this.elapsed = 0;

            this.setPlayingForwardState();

            this.update(0);
        }

        if (this.delay > 0)
        {
            this.elapsed = this.delay;

            this.setDelayState();
        }
    },

    /**
     * Internal method that advances this TweenData based on the delta value given.
     *
     * @method Phaser.Tweens.TweenData#update
     * @fires Phaser.Tweens.Events#TWEEN_UPDATE
     * @fires Phaser.Tweens.Events#TWEEN_REPEAT
     * @since 3.60.0
     *
     * @param {number} delta - The elapsed delta time in ms.
     *
     * @return {boolean} `true` if this TweenData is still playing, or `false` if it has finished entirely.
     */
    update: function (delta)
    {
        var tween = this.tween;
        var targetIndex = this.targetIndex;
        var target = tween.targets[targetIndex];

        //  Bail out if we don't have a target to act upon
        if (!target)
        {
            this.setCompleteState();

            return false;
        }

        if (this.isCountdown)
        {
            this.elapsed -= delta;

            if (this.elapsed <= 0)
            {
                this.elapsed = 0;

                delta = 0;

                if (this.isDelayed())
                {
                    this.setPendingRenderState();
                }
                else if (this.isRepeating())
                {
                    this.setPlayingForwardState();

                    this.dispatchEvent(Events.TWEEN_REPEAT, 'onRepeat');
                }
                else if (this.isHolding())
                {
                    this.setStateFromEnd(0);
                }
            }
        }

        //  All of the above have the ability to change the state, so put this in its own check

        if (this.isPendingRender())
        {
            if (this.startTexture)
            {
                target.setTexture(this.startTexture, this.startFrame);
            }

            this.setPlayingForwardState();

            return true;
        }

        var forward = this.isPlayingForward();
        var backward = this.isPlayingBackward();

        if (forward || backward)
        {
            var elapsed = this.elapsed;
            var duration = this.duration;
            var diff = 0;
            var complete = false;

            elapsed += delta;

            if (elapsed >= duration)
            {
                diff = elapsed - duration;
                elapsed = duration;
                complete = true;
            }

            var progress = elapsed / duration;

            this.elapsed = elapsed;
            this.progress = progress;

            if (complete)
            {
                if (forward)
                {
                    target.setTexture(this.endTexture, this.endFrame);

                    if (this.hold > 0 && this.repeatCounter > 0)
                    {
                        this.elapsed = this.hold;

                        this.setHoldState();
                    }
                    else
                    {
                        this.setStateFromEnd(diff);
                    }
                }
                else
                {
                    target.setTexture(this.startTexture, this.startFrame);

                    this.setStateFromStart(diff);
                }
            }

            this.dispatchEvent(Events.TWEEN_UPDATE, 'onUpdate');
        }

        //  Return TRUE if this TweenData still playing, otherwise FALSE
        return !this.isComplete();
    },

    /**
     * Internal method that resets this Tween Data, including the progress and elapsed values.
     *
     * @method Phaser.Tweens.TweenData#reset
     * @since 3.60.0
     *
     * @param {boolean} resetFromLoop - Has this method been called as part of a loop?
     */
    reset: function (resetFromLoop)
    {
        this.progress = 0;
        this.elapsed = 0;

        this.repeatCounter = (this.repeat === -1) ? 999999999999 : this.repeat;

        if (resetFromLoop)
        {
            this.setPlayingForwardState();
        }
        else
        {
            this.setPendingRenderState();
        }

        if (this.delay > 0)
        {
            this.elapsed = this.delay;

            this.setDelayState();
        }
    },

    /**
     * Internal method that will emit a TweenData based Event on the
     * parent Tween and also invoke the given callback, if provided.
     *
     * @method Phaser.Tweens.TweenData#dispatchEvent
     * @since 3.60.0
     *
     * @param {Phaser.Types.Tweens.Event} event - The Event to be dispatched.
     * @param {Phaser.Types.Tweens.TweenCallbackTypes} [callback] - The name of the callback to be invoked. Can be `null` or `undefined` to skip invocation.
     */
    dispatchEvent: function (event, callback)
    {
        var tween = this.tween;

        if (!tween.isSeeking)
        {
            var target = tween.targets[this.targetIndex];

            tween.emit(event, tween, 'texture', target);

            var handler = tween.callbacks[callback];

            if (handler)
            {
                handler.func.apply(handler.scope, [ tween, target, 'texture' ].concat(handler.params));
            }
        }
    },

    /**
     * Internal method used as part of the playback process that checks if this
     * TweenData should yoyo, repeat, or has completed.
     *
     * @method Phaser.Tweens.TweenData#setStateFromEnd
     * @fires Phaser.Tweens.Events#TWEEN_REPEAT
     * @fires Phaser.Tweens.Events#TWEEN_YOYO
     * @since 3.60.0
     *
     * @param {number} diff - Any extra time that needs to be accounted for in the elapsed and progress values.
     */
    setStateFromEnd: function (diff)
    {
        if (this.repeatCounter > 0)
        {
            this.onRepeat(diff, true);
        }
        else
        {
            this.setCompleteState();
        }
    },

    /**
     * Internal method used as part of the playback process that checks if this
     * TweenData should repeat or has completed.
     *
     * @method Phaser.Tweens.TweenData#setStateFromStart
     * @fires Phaser.Tweens.Events#TWEEN_REPEAT
     * @since 3.60.0
     *
     * @param {number} diff - Any extra time that needs to be accounted for in the elapsed and progress values.
     */
    setStateFromStart: function (diff)
    {
        if (this.repeatCounter > 0)
        {
            this.onRepeat(diff, false);
        }
        else
        {
            this.setCompleteState();
        }
    },

    /**
     * Internal method that handles repeating or yoyo'ing this TweenData.
     *
     * Called automatically by `setStateFromStart` and `setStateFromEnd`.
     *
     * @method Phaser.Tweens.TweenData#onRepeat
     * @fires Phaser.Tweens.Events#TWEEN_REPEAT
     * @fires Phaser.Tweens.Events#TWEEN_YOYO
     * @since 3.60.0
     *
     * @param {number} diff - Any extra time that needs to be accounted for in the elapsed and progress values.
     * @param {boolean} [isYoyo=false] - Is this call a Yoyo check?
     */
    onRepeat: function (diff, isYoyo)
    {
        if (isYoyo === undefined) { isYoyo = false; }

        var tween = this.tween;

        var targetIndex = this.targetIndex;
        var target = tween.targets[targetIndex];

        //  Account for any extra time we got from the previous frame
        this.elapsed = diff;
        this.progress = diff / this.duration;

        if (this.flipX)
        {
            target.toggleFlipX();
        }

        if (this.flipY)
        {
            target.toggleFlipY();
        }

        if (isYoyo)
        {
            this.setPlayingBackwardState();

            this.dispatchEvent(Events.TWEEN_YOYO, 'onYoyo');

            return;
        }

        this.repeatCounter--;

        //  Delay?
        if (this.repeatDelay > 0)
        {
            this.elapsed = this.repeatDelay - diff;

            this.setRepeatState();
        }
        else
        {
            this.setPlayingForwardState();

            this.dispatchEvent(Events.TWEEN_REPEAT, 'onRepeat');
        }
    },

    /**
     * Sets this TweenData state to CREATED.
     *
     * @method Phaser.Tweens.TweenData#setCreatedState
     * @since 3.60.0
     */
    setCreatedState: function ()
    {
        this.state = TWEEN_CONST.CREATED;
        this.isCountdown = false;
    },

    /**
     * Sets this TweenData state to DELAY.
     *
     * @method Phaser.Tweens.TweenData#setDelayState
     * @since 3.60.0
     */
    setDelayState: function ()
    {
        this.state = TWEEN_CONST.DELAY;
        this.isCountdown = true;
    },

    /**
     * Sets this TweenData state to PENDING_RENDER.
     *
     * @method Phaser.Tweens.TweenData#setPendingRenderState
     * @since 3.60.0
     */
    setPendingRenderState: function ()
    {
        this.state = TWEEN_CONST.PENDING_RENDER;
        this.isCountdown = false;
    },

    /**
     * Sets this TweenData state to PLAYING_FORWARD.
     *
     * @method Phaser.Tweens.TweenData#setPlayingForwardState
     * @since 3.60.0
     */
    setPlayingForwardState: function ()
    {
        this.state = TWEEN_CONST.PLAYING_FORWARD;
        this.isCountdown = false;
    },

    /**
     * Sets this TweenData state to PLAYING_BACKWARD.
     *
     * @method Phaser.Tweens.TweenData#setPlayingBackwardState
     * @since 3.60.0
     */
    setPlayingBackwardState: function ()
    {
        this.state = TWEEN_CONST.PLAYING_BACKWARD;
        this.isCountdown = false;
    },

    /**
     * Sets this TweenData state to HOLD_DELAY.
     *
     * @method Phaser.Tweens.TweenData#setHoldState
     * @since 3.60.0
     */
    setHoldState: function ()
    {
        this.state = TWEEN_CONST.HOLD_DELAY;
        this.isCountdown = true;
    },

    /**
     * Sets this TweenData state to REPEAT_DELAY.
     *
     * @method Phaser.Tweens.TweenData#setRepeatState
     * @since 3.60.0
     */
    setRepeatState: function ()
    {
        this.state = TWEEN_CONST.REPEAT_DELAY;
        this.isCountdown = true;
    },

    /**
     * Sets this TweenData state to COMPLETE.
     *
     * @method Phaser.Tweens.TweenData#setCompleteState
     * @since 3.60.0
     */
    setCompleteState: function ()
    {
        this.state = TWEEN_CONST.COMPLETE;
        this.isCountdown = false;
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of CREATED, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isCreated
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of CREATED, otherwise `false`.
     */
    isCreated: function ()
    {
        return (this.state === TWEEN_CONST.CREATED);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of DELAY, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isDelayed
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of DELAY, otherwise `false`.
     */
    isDelayed: function ()
    {
        return (this.state === TWEEN_CONST.DELAY);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of PENDING_RENDER, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isPendingRender
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of PENDING_RENDER, otherwise `false`.
     */
    isPendingRender: function ()
    {
        return (this.state === TWEEN_CONST.PENDING_RENDER);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of PLAYING_FORWARD, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isPlayingForward
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of PLAYING_FORWARD, otherwise `false`.
     */
    isPlayingForward: function ()
    {
        return (this.state === TWEEN_CONST.PLAYING_FORWARD);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of PLAYING_BACKWARD, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isPlayingBackward
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of PLAYING_BACKWARD, otherwise `false`.
     */
    isPlayingBackward: function ()
    {
        return (this.state === TWEEN_CONST.PLAYING_BACKWARD);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of HOLD_DELAY, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isHolding
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of HOLD_DELAY, otherwise `false`.
     */
    isHolding: function ()
    {
        return (this.state === TWEEN_CONST.HOLD_DELAY);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of REPEAT_DELAY, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isRepeating
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of REPEAT_DELAY, otherwise `false`.
     */
    isRepeating: function ()
    {
        return (this.state === TWEEN_CONST.REPEAT_DELAY);
    },

    /**
     * Returns `true` if this TweenData has a _current_ state of COMPLETE, otherwise `false`.
     *
     * @method Phaser.Tweens.TweenData#isComplete
     * @since 3.60.0
     *
     * @return {boolean} `true` if this TweenData has a _current_ state of COMPLETE, otherwise `false`.
     */
    isComplete: function ()
    {
        return (this.state === TWEEN_CONST.COMPLETE);
    },

    /**
     * Immediately destroys this TweenData, nulling of all its references.
     *
     * @method Phaser.Tweens.TweenData#destroy
     * @since 3.60.0
     */
    destroy: function ()
    {
        this.tween = null;
        this.getDelay = null;
        this.setCompleteState();
    }

});

module.exports = TweenFrameData;
