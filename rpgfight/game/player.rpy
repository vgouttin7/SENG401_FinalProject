init -5 python:

    class Player(AnimatedSprite):
        HORIZONTAL_ACCELERATION = 2
        HORIZONTAL_FRICTION = 0.15
        VERTICAL_ACCELERATION = 0.8
        VERTICAL_JUMP_SPEED = 23
        STARTING_HEALTH = 100

        def __init__(self, x, y, platform_tiles, portal_group, beam_group):
            AnimatedSprite.__init__(self, 80, 118, x, y)

            # Apply player config from dashboard if loaded
            if _player_config is not None:
                self.HORIZONTAL_ACCELERATION = _player_config.get("horizontal_acceleration", 2)
                self.HORIZONTAL_FRICTION = _player_config.get("friction", 0.15)
                self.VERTICAL_ACCELERATION = _player_config.get("vertical_acceleration", 0.8)
                self.VERTICAL_JUMP_SPEED = _player_config.get("jump_speed", 23)
                self.STARTING_HEALTH = int(_player_config.get("starting_health", 100))

            self.move_right_sprites, self.move_left_sprites = self.generate_mirrored_animation("images/sprites/player/run_{:03d}.png", 0, 9)
            self.idle_right_sprites, self.idle_left_sprites = self.generate_mirrored_animation("images/sprites/player/idle_{:03d}.png", 0, 9)
            self.jump_right_sprites, self.jump_left_sprites = self.generate_mirrored_animation("images/sprites/player/jump_{:03d}.png", 0, 9)
            self.attack_right_sprites, self.attack_left_sprites = self.generate_mirrored_animation("images/sprites/player/attack_{:03d}.png", 0, 9)

            self.current_sprite_index = 0
            self.image = self.idle_right_sprites[self.current_sprite_index]

            self.platform_tiles = platform_tiles
            self.portal_group = portal_group
            self.beam_group = beam_group

            self.animate_jump = False
            self.animate_fire = False

            self.velocity = Vector(0, 0)
            self.acceleration = Vector(0, self.VERTICAL_ACCELERATION)

            self.health = self.STARTING_HEALTH
            self.max_health = self.STARTING_HEALTH
            self.starting_x = x
            self.starting_y = y

            # Hit flash effect
            self.is_flashing = False
            self.flash_timer = 0
            self.flash_duration = 90    # how many frames the flash lasts

            # Portal cooldown to prevent infinite teleport loops
            self.portal_cooldown = 0

            # Modifier-affected stats
            self.speed_multiplier = 1.0
            self.dash_count = 1
            self.dashes_remaining = 1
            self.damage_multiplier = 1.0
            self.has_shield = False

        def update(self, keyboard, max_width, max_height, can_trigger_space_action, can_trigger_shift_action):
            self.move(keyboard, max_width, can_trigger_space_action, can_trigger_shift_action)
            self.check_collisions(max_width, max_height)
            self.check_animations()
            self.update_flash()

        def move(self, keyboard, max_width, can_trigger_space_action, can_trigger_shift_action):
            self.acceleration = Vector(0, self.VERTICAL_ACCELERATION)

            accel = self.HORIZONTAL_ACCELERATION * self.speed_multiplier

            if keyboard.left or keyboard.a:
                self.acceleration.x = -1 * accel
                self.animate(self.move_left_sprites, 0.5)
            elif keyboard.right or keyboard.d:
                self.acceleration.x = accel
                self.animate(self.move_right_sprites, 0.5)
            else:
                if self.velocity.x > 0:
                    self.animate(self.idle_right_sprites, 0.5)
                else:
                    self.animate(self.idle_left_sprites, 0.5)

            if (keyboard.space > 0 or keyboard.w) and can_trigger_space_action:
                self.jump()

            if keyboard.shift > 0 and can_trigger_shift_action:
                self.fire()

            self.acceleration.x -= self.velocity.x * self.HORIZONTAL_FRICTION
            self.velocity += self.acceleration
            self.position += self.velocity + (0.5 * self.acceleration)

            if self.position.x + self.width < 0:
                self.position.x = max_width - self.width
            elif self.position.x > max_width:
                self.position.x = 0

        def check_collisions(self, max_width, max_height):
            if self.velocity.y > 0:
                for platform in self.platform_tiles:
                    if platform.is_colliding(self):
                        self.position.y = platform.position.y - self.height + 5
                        self.velocity.y = 0

            if self.velocity.y < 0:
                for platform in self.platform_tiles:
                    if platform.is_colliding(self):
                        self.velocity.y = 0
                        while platform.is_colliding(self):
                            self.position.y += 1

            # Tick down portal cooldown
            if self.portal_cooldown > 0:
                self.portal_cooldown -= 1

            if self.portal_cooldown == 0:
                for portal in self.portal_group:
                    if portal.is_colliding(self):
                        # Find the other portal of the SAME color
                        other = None
                        for p in self.portal_group:
                            if p is not portal and p.color == portal.color:
                                other = p
                                break

                        if other is not None:
                            renpy.sound.play("audio/zk_portal_sound.wav", channel=2)
                            renpy.sound.set_volume(0.5, channel=2)
                            # Keep same Y level, only nudge on X axis
                            self.position.y = other.position.y + (other.height - self.height) / 2
                            if other.position.x < max_width // 2:
                                self.position.x = other.position.x + other.width + 10
                            else:
                                self.position.x = other.position.x - self.width - 10
                            self.portal_cooldown = 30
                        break

        def check_animations(self):
            if self.animate_jump:
                if self.velocity.x > 0:
                    self.animate(self.jump_right_sprites, 0.1)
                else:
                    self.animate(self.jump_left_sprites, 0.1)

            if self.animate_fire:
                if self.velocity.x > 0:
                    self.animate(self.attack_right_sprites, 0.25)
                else:
                    self.animate(self.attack_left_sprites, 0.25)

        def jump(self):
            for platform in self.platform_tiles:
                if platform.is_colliding(self):
                    renpy.sound.play("audio/zk_jump_sound.wav", channel=0)
                    renpy.sound.set_volume(0.5, channel=0)
                    self.velocity.y = -1 * self.VERTICAL_JUMP_SPEED
                    self.animate_jump = True

        def fire(self):
            if self.dashes_remaining > 0:
                renpy.sound.play("audio/zk_slash_sound.wav", channel=1)
                renpy.sound.set_volume(0.5, channel=1)
                Beam(self.position.x + self.width / 2, self.position.y + self.height / 2, self.beam_group, self)
                self.animate_fire = True
                self.dashes_remaining -= 1

        def refill_dashes(self):
            self.dashes_remaining = self.dash_count

        # player flashes when hit, and is invulnerable during the flash
        def update_flash(self):
            if self.is_flashing:
                self.flash_timer += 1
                if self.flash_timer >= self.flash_duration:
                    self.is_flashing = False
                    self.flash_timer = 0

        def start_flash(self):
            self.is_flashing = True
            self.flash_timer = 0

        def reset(self):
            self.velocity = Vector(0, 0)
            self.position = Vector(self.starting_x, self.starting_y)

        def animate(self, sprite_list, speed):
            if self.current_sprite_index < len(sprite_list) - 1:
                self.current_sprite_index += speed
            else:
                self.current_sprite_index = 0
                if self.animate_jump:
                    self.animate_jump = False
                if self.animate_fire:
                    self.animate_fire = False

            self.image = sprite_list[int(self.current_sprite_index)]

        def render(self, render, st, at):
            if self.is_flashing and self.flash_timer % 4 < 2:
                r = renpy.render(
                    Transform(self.image, matrixcolor=TintMatrix("#FFFFFF") * BrightnessMatrix(1.0)),
                    self.width, self.height, st, at
                )
            else:
                r = renpy.render(self.image, self.width, self.height, st, at)
            render.blit(r, (int(self.position.x), int(self.position.y)))

    class Beam(GameSprite):
        VELOCITY = 20
        RANGE = 500

        def __init__(self, x, y, beam_group, player):
            GameSprite.__init__(self, 60, 60, x, y)

            # Apply beam config from dashboard if loaded
            if _player_config is not None:
                self.VELOCITY = _player_config.get("beam_velocity", 20)
                self.RANGE = _player_config.get("beam_range", 500)

            if player.velocity.x > 0:
                self.image = Image("images/sprites/player/slash.png")
            else:
                self.image = Transform(Image("images/sprites/player/slash.png"), xzoom=-1.0)
                self.VELOCITY = -1 * self.VELOCITY

            self.starting_x = x
            self.beam_group = beam_group
            beam_group.append(self)

        def update(self):
            self.position.x += self.VELOCITY
            if abs(self.position.x - self.starting_x) > self.RANGE:
                self.beam_group.remove(self)
