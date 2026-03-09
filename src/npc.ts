const {GRAVITY} = require('./constants.js');
const {SpriteSheet} = require('./sprite-sheet');

export type NPCOptions = {
	bubbleOffset?: [number, number];
	noBounds?: boolean;
	noGravity?: boolean;
	scale?: number;
}

export class NPC {
	private readonly emojis = [
		0x1F600, 0x1F601, 0x1F603, 0x1F603, 0x1F604, 0x1F605, 0x1F606,
		0x1F607, 0x1F609, 0x1F60A, 0x1F642, 0x1F643, 0x1F355, 0x1F354,
	];
	private readonly texturePack: any;

	private random: number = 0;
	private sprite!: any;
	private text: string;

	public pos = [1000, 0];
	public vel = [0, 0];

	constructor(private readonly ctx: CanvasRenderingContext2D,
				public readonly spriteSheetPath: string,
				public readonly spriteDefPath: string,
				public readonly options: NPCOptions = {},
	) {
		this.texturePack = new SpriteSheet(this.ctx,
			'./assets/sprites/texture-pack/spritesheet.png',
			'../assets/sprites/texture-pack/spritesheet.json');

		if(this.options.bubbleOffset == null) this.options.bubbleOffset = [0, 0];
		if(this.options.scale == null) this.options.scale = 1;
		this.sprite = new SpriteSheet(ctx, spriteSheetPath, spriteDefPath);

		// setInterval(() => {
		// 	this.message(String.fromCodePoint(this.emojis[~~(Math.random() * this.emojis.length)]));
		// }, 10000);
	}

	animate(name: string, reverse = false) {
		if(this.text) {
			const bubble = this.texturePack.definitions.sprites['bubble'];
			const x = this.pos[0] + this.options.bubbleOffset[0] * (reverse ? -1 : 1);
			const y = this.pos[1] + this.options.bubbleOffset[1];
			this.texturePack.drawSprite(x, y, 'bubble', reverse);
			this.ctx.save();
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.font = '24px serif';
			this.ctx.fillText(this.text, x + (bubble.width / 2 * (reverse ? -1 : 1)), y + (bubble.height / 2));
			this.ctx.restore();
		}
		this.sprite.animate(this.pos[0], this.pos[1], name, reverse, this.options.scale);
	}

	tick() {
		if(this.random <= 0) {
			const move = Math.random();
			if(move < 0.333) this.vel = [0, 0];
			else if(move < 0.666) this.vel = [-10, 0];
			else this.vel = [10, 0];
			this.random = Math.random() * 50;
		}
		this.random--;

		this.pos = [this.pos[0] + this.vel[0], this.pos[1] + this.vel[1]];
		if(!this.options.noGravity) this.vel[1] -= GRAVITY;
		if(this.pos[1] < 0) this.pos[1] = 0;
		if(!this.options.noBounds) {
			if(this.pos[0] < 0) this.pos[0] = 0;
			if(this.pos[0] > this.ctx.canvas.width) this.pos[0] = this.ctx.canvas.width;
		}

		this.animate(this.vel[0] == 0 ? 'idle' : 'walk', this.vel[0] < 0);
	}

	message(text: string, ms = 5000) {
		setTimeout(() => this.text = null, ms);
		this.text = text;
	}
}
