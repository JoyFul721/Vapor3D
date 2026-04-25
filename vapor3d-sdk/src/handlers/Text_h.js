import { Text } from "../lib/Text";

export class TextHandlers {
    constructor(engine, Cast) {
        this.engine = engine;
        this.Cast = Cast;
    }

    Text_Create({ NAME, TEXT, FONT, COLOR, BORDER_SIZE, BORDER_COLOR }, util) {
        const colorObj = this.Cast.toRgbColorObject(COLOR);
        const borderColorObj = this.Cast.toRgbColorObject(BORDER_COLOR);

        const colorStr = `rgba(${colorObj.r},${colorObj.g},${colorObj.b},${(colorObj.a ?? 255) / 255})`;
        const bColorStr = `rgba(${borderColorObj.r},${borderColorObj.g},${borderColorObj.b},${(borderColorObj.a ?? 255) / 255})`;

        const tex = Text.createFromText(
            this.engine.core.gl,
            this.Cast.toString(TEXT),
            this.Cast.toString(FONT),
            colorStr,
            this.Cast.toNumber(BORDER_SIZE),
            bColorStr
        );

        this.engine.textures.set(this.Cast.toString(NAME), tex);
    }
}