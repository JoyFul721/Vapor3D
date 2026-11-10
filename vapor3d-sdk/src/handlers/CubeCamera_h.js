import { CubeCamera } from "../lib/Tools/CubeCamera.js";
import { SafeArray } from "../lib/Tools/SafeArray.js";

export class CubeCameraHandlers {
    CubeCam_GetViewMatrix({ X, Y, Z, FACE }) {
        return SafeArray.createWithArray(
            CubeCamera.getViewMatrix(X, Y, Z, FACE),
        );
    }

    CubeCam_GetProjection() {
        return SafeArray.createWithArray(CubeCamera.getProjectionMatrix());
    }
}
