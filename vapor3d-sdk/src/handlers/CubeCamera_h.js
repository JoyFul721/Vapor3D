import { CubeCamera } from '../lib/Tools/CubeCamera.js';

export class CubeCameraHandlers {
    CubeCam_GetViewMatrix({ X, Y, Z, FACE }) {
        return JSON.stringify(CubeCamera.getViewMatrix(X, Y, Z, FACE));
    }

    CubeCam_GetProjection() {
        return JSON.stringify(CubeCamera.getProjectionMatrix());
    }
}