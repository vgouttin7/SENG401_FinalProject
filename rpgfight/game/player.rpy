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

            self.move_right_sprites, self.move_left_sprites = self.generate_mirrored_animation("images/player/run/Run ({}).png", 1, 10)
            self.idle_right_sprites, self.idle_left_sprites = self.generate_mirrored_animation("images/player/idle/Idle ({}).png", 1, 10)
            self.jump_right_sprites, self.jump_left_sprites = self.generate_mirrored_animation("images/player/jump/Jump ({}).png", 1, 10)
            self.attack_right_sprites, self.attack_left_sprites = self.generate_mirrored_animation("images/player/attack/Attack ({}).png", 1, 10)

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

        def move(self, keyboard, max_width, can_trigger_space_action, can_trigger_shift_action):
            self.acceleration = Vector(0, self.VERTICAL_ACCELERATION)

            accel = self.HORIZONTAL_ACCELERATION * self.speed_multiplier

            if keyboard.left:
                self.acceleration.x = -1 * accel
                self.animate(self.move_left_sprites, 0.5)
            elif keyboard.right:
                self.acceleration.x = accel
                self.animate(self.move_right_sprites, 0.5)
            else:
                if self.velocity.x > 0:
                    self.animate(self.idle_right_sprites, 0.5)
                else:
                    self.animate(self.idle_left_sprites, 0.5)

            if keyboard.space > 0 and can_trigger_space_action:
                self.jump()

            if keyboard.shift > 0 and can_trigger_shift_action:
                self.fire()

            self.acceleration.x -= self.velocity.x * self.HORIZONTAL_FRICTION
            self.velocity += self.acceleration
            self.position += self.velocity + (0.5 * self.acceleration)

            if self.position.x < 0:
                self.position.x = max_width
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

            for portal in self.portal_group:
                if portal.is_colliding(self):
                    renpy.sound.play("audio/zk_portal_sound.wav")
                    if self.position.x > max_width // 2:
                        self.position.x = 150
                    else:
                        self.position.x = max_width - 150 - self.width
                    if self.position.y > max_height // 2:
                        self.position.y = 50
                    else:
                        self.position.y = max_height - 150 - self.height

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
                    renpy.sound.play("audio/zk_jump_sound.wav")
                    self.velocity.y = -1 * self.VERTICAL_JUMP_SPEED
                    self.animate_jump = True

        def fire(self):
            if self.dashes_remaining > 0:
                renpy.sound.play("audio/zk_slash_sound.wav")
                Beam(self.position.x + self.width / 2, self.position.y + self.height / 2, self.beam_group, self)
                self.animate_fire = True
                self.dashes_remaining -= 1

        def refill_dashes(self):
            self.dashes_remaining = self.dash_count

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
                self.image = Image("images/player/slash.png")
            else:
                self.image = Transform(Image("images/player/slash.png"), xzoom=-1.0)
                self.VELOCITY = -1 * self.VELOCITY

            self.starting_x = x
            self.beam_group = beam_group
            beam_group.append(self)

        def update(self):
            self.position.x += self.VELOCITY
            if abs(self.position.x - self.starting_x) > self.RANGE:
                self.beam_group.remove(self)
