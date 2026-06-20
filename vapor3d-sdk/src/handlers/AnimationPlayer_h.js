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

    Animation_ClearClips({ SCENE_ID, MODEL }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);

        if (container && container.timeline) {
            container.timeline.clips.clear();
        }
    }

    Animation_AddClip({ SCENE_ID, MODEL, CLIP_ID, ANIM_NAME }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);
        const anim = container?.animations.get(ANIM_NAME);

        if (container && anim) {
            container.timeline.addClip(CLIP_ID, anim);
        }
    }

    Animation_RemoveClip({ SCENE_ID, MODEL, CLIP_ID }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);
        container?.timeline.removeClip(CLIP_ID);
    }

    Animation_SetClipProperty({ SCENE_ID, MODEL, CLIP_ID, PROP, VALUE }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);
        const clip = container?.timeline.clips.get(CLIP_ID);
        if (clip) {
            clip[PROP] = Number(VALUE);
        }
    }

    Animation_SetClipBoneWeight({ SCENE_ID, MODEL, CLIP_ID, BONE_NAME, WEIGHT, RECURSIVE }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);
        const clip = container?.timeline.clips.get(CLIP_ID);

        if (!container || !clip) return;

        let targetJoint = null;
        for (const skel of container.skeletons) {
            targetJoint = skel.joints.find(j => j.name === BONE_NAME);
            if (targetJoint) break;
        }

        if (targetJoint) {
            if (RECURSIVE === "true") {
                this._setBoneWeightRecursive(targetJoint, clip.boneWeights, Number(WEIGHT));
            } else {
                clip.boneWeights.set(targetJoint.name, Number(WEIGHT));
            }
        }
    }

    _setBoneWeightRecursive(node, weightMap, weight) {
        weightMap.set(node.name, weight);
        for (const child of node.children) {
            this._setBoneWeightRecursive(child, weightMap, weight);
        }
    }

    Animation_ApplyTime({ SCENE_ID, TIME }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        if (!scene) return;
        for (const container of scene.containers.values()) {
            container.timeline?.applyAt(Number(TIME), container.rootNode);
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
    

    Animation_GetModelJointTRS({ SCENE_ID, MODEL, IDX }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const container = scene?.containers.get(MODEL);

        if (!container || !container.skeletons || container.skeletons.length === 0) return "[]";

        const jointNode = container.skeletons[0].joints[Number(IDX)];
        return jointNode ? JSON.stringify(this._getFlatTRS(jointNode)) : "[]";
    }

    Animation_GetTrackCount({ SCENE_ID, MODEL }) {
        const timeline = this._getTimeline(SCENE_ID, MODEL);
        return timeline ? timeline.tracks.length : 0;
    }

    Animation_IsTimelineActive({ SCENE_ID, MODEL }) {
        const timeline = this._getTimeline(SCENE_ID, MODEL);
        return timeline ? Array.from(timeline.clips.values()).some(t =>
            timeline.currentTime >= t.startTime && timeline.currentTime < (t.startTime + t.duration)
        ) : false;
    }
}