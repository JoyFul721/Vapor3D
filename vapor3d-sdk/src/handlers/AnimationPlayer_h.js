import { Track } from "../lib/index";
export class AnimationPlayerHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
    }

    _getTimeline(sceneId, path) {
        const scene = this.sceneHandlers.scenes.get(sceneId);
        if (!scene) return null;

        const containerID = path.split('/')[0].trim();
        const container = scene.containers.get(containerID);

        // 直接返回 container.timeline
        return container?.timeline || null;
    }

    // ====================== Actions ======================

    Animation_AddTrack({ SCENE_ID, PATH, TRACK_NAME }) {
        const timeline = this._getTimeline(SCENE_ID, PATH);
        if (timeline) timeline.tracks.set(TRACK_NAME, []);
    }

    Animation_RemoveTrack({ SCENE_ID, PATH, TRACK_NAME }) {
        const timeline = this._getTimeline(SCENE_ID, PATH);
        if (timeline) timeline.tracks.delete(TRACK_NAME);
    }

    Animation_ClearTracks({ SCENE_ID, PATH }) {
        const timeline = this._getTimeline(SCENE_ID, PATH);
        if (timeline) timeline.tracks.clear();
    }

    Animation_AddClip({ SCENE_ID, PATH, ANIM_NAME, TRACK_NAME, START, DURATION, WEIGHT }) {
        const timeline = this._getTimeline(SCENE_ID, PATH);
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(PATH.split('/')[0].trim());
        const anim = container?.animations.get(ANIM_NAME);

        if (timeline && anim) {
            // 容错：如果音轨不存在，自动创建它
            if (!timeline.tracks.has(TRACK_NAME)) {
                timeline.tracks.set(TRACK_NAME, []);
            }

            timeline.tracks.get(TRACK_NAME).push({
                animation: anim,
                startTime: Number(START),
                duration: Number(DURATION),
                weight: Number(WEIGHT),
                boneWeights: new Map()
            });
        }
    }

    _setBoneWeightRecursive(node, weightMap, weight) {
        weightMap.set(node.name, weight);
        for (const child of node.children) {
            this._setBoneWeightRecursive(child, weightMap, weight);
        }
    }
    Animation_SetClipBoneWeight({ SCENE_ID, PATH, TRACK_NAME, ANIM_NAME, BONE_NAME, WEIGHT, RECURSIVE }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const containerID = PATH.split('/')[0].trim();
        const container = scene?.containers.get(containerID);

        if (!container) return;

        const clips = container.timeline.tracks.get(TRACK_NAME);
        const clip = clips?.find(c => c.animation.name === ANIM_NAME);
        if (!clip) return;

        // 从 skeletons 数组里找骨骼
        let targetJoint = null;

        // 遍历模型的所有骨架
        for (const skel of container.skeletons) {
            targetJoint = skel.joints.find(j => j.name === BONE_NAME);
            if (targetJoint) break;
        }

        if (targetJoint) {
            const isRecursive = String(RECURSIVE) === "true";
            if (isRecursive) {
                this._setBoneWeightRecursive(targetJoint, clip.boneWeights, Number(WEIGHT));
            } else {
                clip.boneWeights.set(targetJoint.name, Number(WEIGHT));
            }
        } else {
            console.warn(`Vapor3D: Joint "${BONE_NAME}" not found in skeletons of model "${containerID}".`);
        }
    }

    Animation_ApplyTime({ SCENE_ID, TIME }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        if (!scene) return;

        for (const container of scene.containers.values()) {
            if (container.timeline) {
                container.timeline.applyAt(Number(TIME), container.rootNode);
            }
        }
    }

    // ====================== Getters ======================

    _getFlatTRS(node) {
        return [
            ...node.position,
            ...node.quaternion,
            ...node.scale
        ];
    }
    
    Animation_GetNodeTRS({ SCENE_ID, PATH }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const node = scene?.getNodeByPath(PATH);
        return node ? JSON.stringify(this._getFlatTRS(node)) : "[]";
    }

    Animation_GetModelJointTRS({ SCENE_ID, MODEL, IDX }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);

        if (!container || !container.skeletons || container.skeletons.length === 0) return "[]";

        const jointNode = container.skeletons[0].joints[Number(IDX)];
        return jointNode ? JSON.stringify(this._getFlatTRS(jointNode)) : "[]";
    }

    Animation_GetTrackCount({ SCENE_ID, PATH }) {
        const timeline = this._getTimeline(SCENE_ID, PATH);
        return timeline ? timeline.tracks.length : 0;
    }

    Animation_IsTimelineActive({ SCENE_ID, PATH }) {
        const timeline = this._getTimeline(SCENE_ID, PATH);
        // 需要 timeline 类里维护一个 currentTime 属性
        return timeline ? timeline.tracks.some(t => t.isActive(timeline.currentTime)) : false;
    }
}