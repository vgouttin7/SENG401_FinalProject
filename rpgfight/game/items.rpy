init -5 python:

    class Portal(AnimatedSprite):
        def __init__(self, x, y, color):
            AnimatedSprite.__init__(self, 120, 120, x, y)
            self.color = color
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
