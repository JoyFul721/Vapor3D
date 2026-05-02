export class AnimationPlayer {
    constructor(animations) { // animations is a Map<string, Animation>
        this.animations = animations;
        this.activeAnimation = null;
        this.currentTime = 0;
        this.isPlaying = false;
        this.loop = true;
        this.speed = 1.0;
    }

    play(name, loop = true) {
        const anim = this.animations.get(name);
        if (anim) {
            this.activeAnimation = anim;
            this.isPlaying = true;
            this.loop = loop;
            this.currentTime = 0;
        } else {
            console.warn(`Vapor3D: Animation "${name}" not found.`);
        }
    }

    stop() {
        this.isPlaying = false;
        this.activeAnimation = null;
    }

    setTime(time) {
        if (!this.activeAnimation) return;

        this.currentTime = time;
        const duration = this.activeAnimation.duration;

        if (this.loop) {
            this.currentTime = this.currentTime % duration;
        } else {
            this.currentTime = Math.max(0, Math.min(this.currentTime, duration));
        }
    }

    update(dt) {
        if (!this.isPlaying || !this.activeAnimation) return;

        this.currentTime += dt * this.speed;
        const duration = this.activeAnimation.duration;

        if (this.loop) {
            this.currentTime %= duration;
        } else {
            this.currentTime = Math.min(this.currentTime, duration);
            if (this.currentTime >= duration) this.isPlaying = false;
        }

        this.activeAnimation.apply(this.currentTime);
    }
}