init -5 python:

    class RubyMaker(AnimatedSprite):
        def __init__(self, x, y):
            AnimatedSprite.__init__(self, 60, 60, x, y)
            self.rubymaker_sprites = self.generate_animation("images/ruby_maker/tile00{}.png", 0, 6)
            self.current_sprite_index = 0
            self.image = self.rubymaker_sprites[self.current_sprite_index]

        def update(self):
            self.animate(self.rubymaker_sprites, 0.25)

        def animate(self, sprite_list, speed):
            if self.current_sprite_index < len(sprite_list) - 1:
                self.current_sprite_index += speed
            else:
                self.current_sprite_index = 0
            self.image = sprite_list[int(self.current_sprite_index)]


    class Ruby(AnimatedSprite):
        VERTICAL_ACCELERATION = 3
        HORIZONTAL_VELOCITY = 5

        def __init__(self, max_width, platform_tiles, portal_group):
            AnimatedSprite.__init__(self, 60, 60, max_width // 2, 100)
            self.ruby_sprites = self.generate_animation("images/ruby/tile00{}.png", 0, 6)
            self.current_sprite_index = 0
            self.image = self.ruby_sprites[self.current_sprite_index]
            self.platform_tiles = platform_tiles
            self.portal_group = portal_group
            self.velocity = Vector(random.choice([-1 * self.HORIZONTAL_VELOCITY, self.HORIZONTAL_VELOCITY]), 0)
            self.acceleration = Vector(0, self.VERTICAL_ACCELERATION)

        def update(self, max_width, max_height):
            self.animate(self.ruby_sprites, 0.25)
            self.move(max_width)
            self.check_collisions(max_width, max_height)

        def move(self, max_width):
            self.velocity += self.acceleration
            self.position += self.velocity + (0.5 * self.acceleration)
            if self.position.x < 0:
                self.position.x = max_width
                self.position.y -= 120
            elif self.position.x > max_width:
                self.position.x = 0
                self.position.y -= 120

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

        def animate(self, sprite_list, speed):
            if self.current_sprite_index < len(sprite_list) - 1:
                self.current_sprite_index += speed
            else:
                self.current_sprite_index = 0
            self.image = sprite_list[int(self.current_sprite_index)]


    class Portal(AnimatedSprite):
        def __init__(self, x, y, color):
            AnimatedSprite.__init__(self, 120, 120, x, y)
            if color == "green":
                self.portal_sprites = self.generate_animation("images/portals/green/tile0{:02d}.png", 0, 21)
            else:
                self.portal_sprites = self.generate_animation("images/portals/purple/tile0{:02d}.png", 0, 21)
            self.current_sprite_index = random.randint(0, len(self.portal_sprites) - 1)
            self.image = self.portal_sprites[self.current_sprite_index]

        def update(self):
            self.animate(self.portal_sprites, 0.2)

        def animate(self, sprite_list, speed):
            if self.current_sprite_index < len(sprite_list) - 1:
                self.current_sprite_index += speed
            else:
                self.current_sprite_index = 0
            self.image = sprite_list[int(self.current_sprite_index)]
