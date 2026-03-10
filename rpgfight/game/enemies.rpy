init -5 python:

    class Enemy(AnimatedSprite):
        """Base enemy class. Uses zombie sprites as placeholder."""

        VERTICAL_ACCELERATION = 3
        RISE_TIME = 2

        def __init__(self, x, y, platform_tiles, portal_group, min_speed, max_speed):
            AnimatedSprite.__init__(self, 120, 120, x, y)

            # Placeholder: use zombie sprites until Persian art is ready
            gender = random.randint(0, 1)
            if gender == 0:
                self.walk_right_sprites, self.walk_left_sprites = self.generate_mirrored_animation("images/zombie/boy/walk/Walk ({}).png", 1, 10)
                self.die_right_sprites, self.die_left_sprites = self.generate_mirrored_animation("images/zombie/boy/dead/Dead ({}).png", 1, 10)
                self.rise_right_sprites, self.rise_left_sprites = self.generate_mirrored_animation("images/zombie/boy/dead/Dead ({}).png", 10, 1, -1)
            else:
                self.walk_right_sprites, self.walk_left_sprites = self.generate_mirrored_animation("images/zombie/girl/walk/Walk ({}).png", 1, 10)
                self.die_right_sprites, self.die_left_sprites = self.generate_mirrored_animation("images/zombie/girl/dead/Dead ({}).png", 1, 10)
                self.rise_right_sprites, self.rise_left_sprites = self.generate_mirrored_animation("images/zombie/girl/dead/Dead ({}).png", 10, 1, -1)

            self.direction = random.choice([-1, 1])
            self.current_sprite_index = 0

            if self.direction == -1:
                self.image = self.walk_left_sprites[self.current_sprite_index]
            else:
                self.image = self.walk_right_sprites[self.current_sprite_index]

            self.platform_tiles = platform_tiles
            self.portal_group = portal_group

            self.animate_death = False
            self.animate_rise = False

            self.velocity = Vector(self.direction * random.randint(min_speed, max_speed), 0)
            self.acceleration = Vector(0, self.VERTICAL_ACCELERATION)

            self.hp = 1
            self.is_dead = False
            self.frames_dead = 0
            self.seconds_dead = 0

        def update(self, max_width, max_height):
            self.move(max_width)
            self.check_collisions(max_width, max_height)
            self.check_animations()

        def move(self, max_width):
            if not self.is_dead:
                if self.direction == -1:
                    self.animate(self.walk_left_sprites, 0.2)
                else:
                    self.animate(self.walk_right_sprites, 0.2)

                self.velocity += self.acceleration
                self.position += self.velocity + (0.5 * self.acceleration)

                if self.position.x < 0:
                    self.position.x = max_width
                elif self.position.x > max_width:
                    self.position.x = 0

        def check_collisions(self, max_width, max_height):
            for platform in self.platform_tiles:
                if platform.is_colliding(self):
                    self.position.y = platform.position.y - self.height + 5
                    self.velocity.y = 0

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
            if self.animate_death:
                if self.direction == 1:
                    self.animate(self.die_right_sprites, 0.15)
                else:
                    self.animate(self.die_left_sprites, 0.15)
            elif self.is_dead:
                # Death animation finished — stay on last frame
                if self.direction == 1:
                    self.image = self.die_right_sprites[-1]
                else:
                    self.image = self.die_left_sprites[-1]

        def animate(self, sprite_list, speed):
            if self.current_sprite_index < len(sprite_list) - 1:
                self.current_sprite_index += speed
            else:
                if self.animate_death:
                    # Stay on last frame of death animation
                    self.current_sprite_index = len(sprite_list) - 1
                    self.animate_death = False
                else:
                    self.current_sprite_index = 0

            self.image = sprite_list[int(self.current_sprite_index)]


    class ImmortalSoldier(Enemy):
        """Persian Immortal foot soldier. Basic enemy for Stages 1-2."""

        def __init__(self, x, y, platform_tiles, portal_group, min_speed, max_speed):
            Enemy.__init__(self, x, y, platform_tiles, portal_group, min_speed, max_speed)

            # Override zombie sprites with Immortal Soldier art
            self.walk_right_sprites, self.walk_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/walk/Walk ({}).png", 1, 10)
            self.die_right_sprites, self.die_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/dead/Dead ({}).png", 1, 10)
            self.rise_right_sprites, self.rise_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/dead/Dead ({}).png", 10, 1, -1)

            # Reset to correct starting sprite
            if self.direction == -1:
                self.image = self.walk_left_sprites[self.current_sprite_index]
            else:
                self.image = self.walk_right_sprites[self.current_sprite_index]


    class WarElephant(Enemy):
        """War elephant. Slower but tougher. Stages 2-3.
        Placeholder: uses Immortal Soldier sprites with slower speed."""

        def __init__(self, x, y, platform_tiles, portal_group, min_speed, max_speed):
            Enemy.__init__(self, x, y, platform_tiles, portal_group,
                          max(1, min_speed - 1), max(2, max_speed - 2))

            # Use Immortal Soldier art until elephant sprites are ready
            self.walk_right_sprites, self.walk_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/walk/Walk ({}).png", 1, 10)
            self.die_right_sprites, self.die_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/dead/Dead ({}).png", 1, 10)
            self.rise_right_sprites, self.rise_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/dead/Dead ({}).png", 10, 1, -1)

            if self.direction == -1:
                self.image = self.walk_left_sprites[self.current_sprite_index]
            else:
                self.image = self.walk_right_sprites[self.current_sprite_index]


    class DarkSorcerer(Enemy):
        """Dark sorcerer. Faster and harder to hit. Stages 3-4.
        Placeholder: uses Immortal Soldier sprites with faster speed."""

        def __init__(self, x, y, platform_tiles, portal_group, min_speed, max_speed):
            Enemy.__init__(self, x, y, platform_tiles, portal_group,
                          min_speed + 2, max_speed + 3)

            # Use Immortal Soldier art until sorcerer sprites are ready
            self.walk_right_sprites, self.walk_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/walk/Walk ({}).png", 1, 10)
            self.die_right_sprites, self.die_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/dead/Dead ({}).png", 1, 10)
            self.rise_right_sprites, self.rise_left_sprites = self.generate_mirrored_animation("images/enemies/immortal/dead/Dead ({}).png", 10, 1, -1)

            if self.direction == -1:
                self.image = self.walk_left_sprites[self.current_sprite_index]
            else:
                self.image = self.walk_right_sprites[self.current_sprite_index]
