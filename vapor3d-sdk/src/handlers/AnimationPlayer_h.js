export class AnimationPlayerHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
    }

    _getAnimComponent(sceneId, path) {
        const scene = this.sceneHandlers.scenes.get(sceneId);
        if (!scene) return null;

        let node = scene.getNodeByPath(path);

        // 尝试找当前节点的动画组件
        let animComp = node ? node.getComponent('animation') : null;

        // 如果找不到，尝试找这个模型的根节点（Entity）
        if (!animComp) {
            const rootPath = path.split('/')[0];
            const rootNode = scene.getNodeByPath(rootPath);
            animComp = rootNode ? rootNode.getComponent('animation') : null;
        }

        return animComp;
    }

    _getFlatTRS(node) {
        return [
            ...node.position,
            ...node.quaternion,
            ...node.scale
        ];
    }

    Animation_Play({ SCENE_ID, PATH, ANIM_NAME, MODE }) {
        const animComp = this._getAnimComponent(SCENE_ID, PATH);
        if (animComp && animComp.player) {
            const doLoop = (MODE === 'loop');
            animComp.player.play(String(ANIM_NAME), doLoop);
        }
    }

    Animation_Stop({ SCENE_ID, PATH }) {
        const animComp = this._getAnimComponent(SCENE_ID, PATH);
        if (animComp && animComp.player) {
            animComp.player.stop();
        }
    }

    Animation_SetTime({ SCENE_ID, PATH, TIME }) {
        const animComp = this._getAnimComponent(SCENE_ID, PATH);
        if (animComp && animComp.player) {
            animComp.player.setTime(Number(TIME));
        }
    }

    Animation_SetSpeed({ SCENE_ID, PATH, SPEED }) {
        const animComp = this._getAnimComponent(SCENE_ID, PATH);
        if (animComp && animComp.player) {
            animComp.player.speed = Number(SPEED);
        }
    }

    Animation_Update({ SCENE_ID, DT }) {
        const scene = this.sceneHandlers.scenes.get(SCENE_ID);
        if (!scene) return;

        // 遍历所有实体，拿到 animation，更新
        for (const entity of scene.entities.values()) {
            const animComp = entity.getComponent('animation');

            if (animComp && animComp.player) {
                animComp.player.update(Number(DT));
                // entity.setDirty(); 强制更新根节点
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
        const entity = scene?.entities.get(MODEL);
        const modelComp = entity?.getComponent('model');

        if (!modelComp || !modelComp.flatSkeletons || modelComp.flatSkeletons.length === 0) return "[]";

        const jointNode = modelComp.flatSkeletons[0].joints[Number(IDX)];
        return jointNode ? JSON.stringify(this._getFlatTRS(jointNode)) : "[]";
    }

    Animation_GetInfo({ SCENE_ID, PATH, PARAM }) {
        const animComp = this._getAnimComponent(SCENE_ID, PATH);
        if (!animComp || !animComp.player) return "";

        const player = animComp.player;
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