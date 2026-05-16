export class AnimationPlayerHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
    }

    _getAnimPlayer(sceneId, path) {
        const scene = this.sceneHandlers.scenes.get(sceneId);
        if (!scene) return null;

        const containerID = path.split('/')[0].trim();
        const container = scene.containers.get(containerID);

        if (!container) {
            console.warn(`Vapor3D: Model/Container "${containerID}" not found for animation.`);
            return null;
        }

        return container.animationPlayer;
    }

    _getFlatTRS(node) {
        return [
            ...node.position,
            ...node.quaternion,
            ...node.scale
        ];
    }

    // ====================== Actions ======================

    Animation_Play({ SCENE_ID, PATH, ANIM_NAME, MODE }) {
        const player = this._getAnimPlayer(SCENE_ID, PATH);
        if (player) {
            const doLoop = (MODE === 'loop');
            player.play(String(ANIM_NAME), doLoop);
        }
    }

    Animation_Stop({ SCENE_ID, PATH }) {
        const player = this._getAnimPlayer(SCENE_ID, PATH);
        if (player) {
            player.stop();
        }
    }

    Animation_SetTime({ SCENE_ID, PATH, TIME }) {
        const player = this._getAnimPlayer(SCENE_ID, PATH);
        if (player) {
            player.setTime(Number(TIME));
        }
    }

    Animation_SetSpeed({ SCENE_ID, PATH, SPEED }) {
        const player = this._getAnimPlayer(SCENE_ID, PATH);
        if (player) {
            player.speed = Number(SPEED);
        }
    }

    // 遍历 container
    Animation_Update({ SCENE_ID, DT }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        if (!scene) return;

        for (const container of scene.containers.values()) {
            if (container.animationPlayer) {
                container.animationPlayer.update(Number(DT));
            }
        }
    }

    // ====================== Getters ======================

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

    Animation_GetInfo({ SCENE_ID, PATH, PARAM }) {
        const player = this._getAnimPlayer(SCENE_ID, PATH);
        if (!player) return "";

        const activeAnim = player.activeAnimation;

        switch (PARAM) {
            case 'current animation name':
                return activeAnim ? activeAnim.name : "";
            case 'current time':
                return player.currentTime;
            case 'duration':
                return activeAnim ? activeAnim.duration : 0;
            case 'is playing':
                return player.isPlaying;
            case 'animation names':
                return JSON.stringify(Array.from(player.animations.keys()));
            default:
                return "";
        }
    }
}