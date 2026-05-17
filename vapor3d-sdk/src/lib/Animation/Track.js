export class Track {
    constructor(animation, startTime, duration, weight = 1.0) {
        this.animation = animation;
        this.startTime = startTime;
        this.duration = duration;
        this.weight = weight;
        this.priority = 0; // 决定叠加顺序
    }

    // 计算片段内对应的本地时间
    getLocalTime(globalTime) {
        return globalTime - this.startTime;
    }
}