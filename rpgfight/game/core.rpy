init -10 python:

    import random
    import pygame

    class Vector:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def __add__(self, other):
            if isinstance(other, self.__class__):
                return Vector(self.x + other.x, self.y + other.y)
            return Vector(self.x + other, self.y + other)

        def __mul__(self, other):
            if isinstance(other, self.__class__):
                return Vector(self.x * other.x, self.y * other.y)
            return Vector(self.x * other, self.y * other)

        def __rmul__(self, other):
            return self.__mul__(other)

        def set(self, vec):
            self.x = vec.x
            self.y = vec.y


    class KeyboardInput():
        def __init__(self):
            self.left = False
            self.right = False
            self.a = False        # Alternative: move left
            self.d = False        # Alternative: move right
            self.w = False        # Alternative: jump (same as space)
            self.space = 0
            self.shift = 0
            self.enter = False
            self.escape = False
            self.alt = False


    class GameSprite():
        def __init__(self, width, height, x, y):
            self.width = width
            self.height = height
            self.position = Vector(x, y)

        def render(self, render, st, at):
            r = renpy.render(self.image, self.width, self.height, st, at)
            render.blit(r, (int(self.position.x), int(self.position.y)))

        def update(self):
            pass

        def is_colliding(self, other):
            return (
                self.position.x <= other.position.x + other.width and
                self.position.x + self.width >= other.position.x and
                self.position.y <= other.position.y + other.height and
                self.position.y + self.height >= other.position.y
            )


    class MapTile(GameSprite):
        def __init__(self, x, y, image_int):
            GameSprite.__init__(self, 30, 30, x, y)
            if image_int == 1:
                self.image = Image("images/tiles/Tile (1).png")
            elif image_int == 2:
                self.image = Image("images/tiles/Tile (2).png")
            elif image_int == 3:
                self.image = Image("images/tiles/Tile (3).png")
            elif image_int == 4:
                self.image = Image("images/tiles/Tile (4).png")
            elif image_int == 5:
                self.image = Image("images/tiles/Tile (5).png")


            self.collision_padding = 2    # shrinks collision area on each side

        def is_colliding(self, other):
            return (
                self.position.x + self.collision_padding <= other.position.x + other.width and
                self.position.x + self.width - self.collision_padding >= other.position.x and
                self.position.y + self.collision_padding <= other.position.y + other.height and
                self.position.y + self.height - self.collision_padding >= other.position.y
            )

    class AnimatedSprite(GameSprite):
        def __init__(self, width, height, x, y):
            GameSprite.__init__(self, width, height, x, y)

        def generate_mirrored_animation(self, fname_pattern, start, end, step=1):
            right_sprites = []
            left_sprites = []
            for i in range(start, end + 1 if step > 0 else end - 1, step):
                img = Image(fname_pattern.format(i))
                right_sprites.append(img)
                left_sprites.append(Transform(img, xzoom=-1.0))
            return (right_sprites, left_sprites)

        def generate_animation(self, fname_pattern, start, end, step=1):
            sprites = []
            for i in range(start, end + 1 if step > 0 else end - 1, step):
                sprites.append(Image(fname_pattern.format(i)))
            return sprites
