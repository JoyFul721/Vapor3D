export class AnimationPlayerHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
    }

    _getNodeWithPlayer(sceneId, path) {
        const scene = this.sceneHandlers.scenes.get(sceneId);
        const node = scene?.getNodeByPath(path);
        if (!node || !node.animationPlayer) {
            const rootPath = path.split('/')[0];
            const rootNode = scene?.getNodeByPath(rootPath);
            if (rootNode && rootNode.animationPlayer) return rootNode;

            return null; // Return null if still not found
        }
        return node;
    }

    _getFlatTRS(node) {
        return [
            ...node.position,
            ...node.quaternion,
            ...node.scale
        ];
    }

    Animation_Play({ SCENE_ID, PATH, ANIM_NAME, MODE }) {
        const modelRoot = this._getNodeWithPlayer(SCENE_ID, PATH);
        if (!modelRoot) return;

        const doLoop = (MODE === 'loop');
        modelRoot.animationPlayer.play(String(ANIM_NAME), doLoop);
    }

    Animation_Stop({ SCENE_ID, PATH }) {
        const modelRoot = this._getNodeWithPlayer(SCENE_ID, PATH);
        if (modelRoot) modelRoot.animationPlayer.stop();
    }

    Animation_SetTime({ SCENE_ID, PATH, TIME }) { // 跳转到
        const modelRoot = this._getNodeWithPlayer(SCENE_ID, PATH);
        if (modelRoot) modelRoot.animationPlayer.setTime(Number(TIME));
    }

    Animation_SetSpeed({ SCENE_ID, PATH, SPEED }) {
        const modelRoot = this._getNodeWithPlayer(SCENE_ID, PATH);
        if (modelRoot && modelRoot.animationPlayer) {
            modelRoot.animationPlayer.speed = Number(SPEED);
        }
    }

    Animation_Update({ SCENE_ID, DT }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        if (!scene) return;

        for (const modelRoot of scene.modelsMap.values()) {
            if (modelRoot.animationPlayer) {
                modelRoot.animationPlayer.update(Number(DT));
                modelRoot.setDirty();
            }
        }
    }

    Animation_GetNodeTRS({ SCENE_ID, PATH }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const node = scene?.getNodeByPath(PATH);
        return node ? JSON.stringify(this._getFlatTRS(node)) : "[]";
    }
    Animation_GetModelJointTRS({ SCENE_ID, MODEL, IDX }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        const modelRoot = scene?.modelsMap.get(MODEL);
        if (!modelRoot || !modelRoot.skeleton) return "[]";

        const jointNode = modelRoot.skeleton.joints[Number(IDX)];
        return jointNode ? JSON.stringify(this._getFlatTRS(jointNode)) : "[]";
    }



    Animation_GetInfo({ SCENE_ID, PATH, PARAM }) {
        const modelRoot = this._getNodeWithPlayer(SCENE_ID, PATH);
        if (!modelRoot || !modelRoot.animationPlayer) return "";

        const player = modelRoot.animationPlayer;
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