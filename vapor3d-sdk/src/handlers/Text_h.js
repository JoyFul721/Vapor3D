import { Text } from "../lib/Text/Text";

export class TextHandlers {
    constructor(engine, Cast, registry) {
        this.engine = engine;
        this.Cast = Cast;
        this.registry = registry;
    }

    Text_Create({ NAME, TEXT, FONT, COLOR, B_COLOR, SIZE }) {
        const color = this.Cast.toRgbColorObject(COLOR);
        const borderColor = this.Cast.toRgbColorObject(B_COLOR);

        const colorStr = `rgba(${color.r},${color.g},${color.b},${(color.a ?? 255) / 255})`;
        const borderColorStr = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${(borderColor.a ?? 255) / 255})`;
        
        const tex = Text.createFromText(
            this.engine.core.gl,
            this.Cast.toString(TEXT),
            this.Cast.toString(FONT),
            colorStr, this.Cast.toNumber(SIZE),
            borderColorStr
        );

        const index = this.registry.allocate('textures', tex);
        this.engine.texturesMap.set(this.Cast.toString(NAME), index);

        return index;
    }

    Text_GetWidth({ TEXT, FONT, BORDER_SIZE }, util) {
        const size = Text.getBounds(
            this.Cast.toString(TEXT),
            this.Cast.toString(FONT),
            this.Cast.toNumber(BORDER_SIZE)
        );
        return size.width;
    }

    Text_GetHeight({ TEXT, FONT, BORDER_SIZE }, util) {
        const size = Text.getBounds(
            this.Cast.toString(TEXT),
            this.Cast.toString(FONT),
            this.Cast.toNumber(BORDER_SIZE)
        );
        return size.height;
    }
}