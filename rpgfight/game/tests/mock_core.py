#Victor Gouttin
#"Mock" core class to avoid importing ren'py code and just test the logic of the core classes

# Stubs for Ren'Py dependencies
class Image:
    def __init__(self, path): pass

class Transform:
    def __init__(self, *args, **kwargs): pass

class renpy:
    @staticmethod
    def render(*args, **kwargs): pass


#vector and sprite classes directly from core.rpy
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


class GameSprite:
    def __init__(self, width, height, x, y):
        self.width = width
        self.height = height
        self.position = Vector(x, y)

    def is_colliding(self, other):
        return (
            self.position.x <= other.position.x + other.width and
            self.position.x + self.width >= other.position.x and
            self.position.y <= other.position.y + other.height and
            self.position.y + self.height >= other.position.y
        )

#taken from core.rpy
class MapTile(GameSprite):
    def __init__(self, x, y, image_int):
        GameSprite.__init__(self, 30, 30, x, y)
        self.image = Image(f"images/tiles/Tile ({image_int}).png")
        self.collision_padding = 2

    def is_colliding(self, other):
        return (
            self.position.x + self.collision_padding <= other.position.x + other.width and
            self.position.x + self.width - self.collision_padding >= other.position.x and
            self.position.y + self.collision_padding <= other.position.y + other.height and
            self.position.y + self.height - self.collision_padding >= other.position.y
        )