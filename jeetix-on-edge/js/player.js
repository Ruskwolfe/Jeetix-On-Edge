export default class Player {
    constructor(x, y, image, playJumpSoundCallback) {
        this.image = image;
        this.width = 32; 
        this.height = 42;
        this.startX = x; 
        this.startY = y; 
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.playJumpSound = playJumpSoundCallback;
        this.facingRight = true; 
    }

    draw(ctx) {
        if (!this.image) {
            ctx.fillStyle = 'red'; // Fallback if image not loaded
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        // Flip image if facing left
        if (!this.facingRight) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update(deltaTime, input, platforms, gravity, playerSpeed, jumpForce, levelWidth, levelHeight) { 
        // Horizontal movement
        if (input.isPressed('ArrowLeft')) {
            this.vx = -playerSpeed;
            this.facingRight = false;
        } else if (input.isPressed('ArrowRight')) {
            this.vx = playerSpeed;
            this.facingRight = true;
        } else {
            this.vx = 0;
        }

        this.x += this.vx * deltaTime;

        // Apply gravity
        this.vy += gravity * deltaTime;
        this.y += this.vy * deltaTime;
        this.onGround = false;

        // Collision with platforms
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                // Collision detected

                const overlapX = Math.min(this.x + this.width, platform.x + platform.width) - Math.max(this.x, platform.x);
                const overlapY = Math.min(this.y + this.height, platform.y + platform.height) - Math.max(this.y, platform.y);

                if (overlapX > overlapY) { // Vertical collision
                    if (this.vy > 0 && (this.y + this.height - overlapY) <= platform.y + 1) { // Landing on top (+1 for better landing)
                        this.y = platform.y - this.height;
                        this.vy = 0;
                        this.onGround = true;
                    } else if (this.vy < 0 && (this.y + overlapY) >= (platform.y + platform.height -1) ) { // Hitting bottom (-1 for better detection)
                        this.y = platform.y + platform.height;
                        this.vy = 0;
                    }
                } else { // Horizontal collision
                     if (this.vx > 0 && (this.x + this.width - overlapX) <= platform.x +1 ) { // Colliding with left side of platform
                        this.x = platform.x - this.width;
                        this.vx = 0;
                    } else if (this.vx < 0 && (this.x + overlapX) >= (platform.x + platform.width -1) ) { // Colliding with right side of platform
                        this.x = platform.x + platform.width;
                        this.vx = 0;
                    }
                }
            }
        });
        
        // Jump
        if ((input.isPressed('Space') || input.isPressed('ArrowUp')) && this.onGround) {
            this.vy = jumpForce;
            this.onGround = false;
            if (this.playJumpSound) this.playJumpSound();
        }

        // Keep player within level bounds (horizontal)
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > levelWidth) { 
            this.x = levelWidth - this.width;
            this.vx = 0;
        }

        // Player falling off the bottom of the level is handled in main.js
        // by checking player.y > levelHeight.
        // No specific check needed here for y > levelHeight + this.height,
        // as main.js will handle the reset.
    }

    resetState(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
    }
}
