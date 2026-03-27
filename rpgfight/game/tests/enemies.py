#Victor Gouttin
#"Mock" enemy class to avoid importing ren'py code and just test the logic of the enemy class

class Vector:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

    def __add__(self, other):
        if isinstance(other, (int, float)):
            return Vector(self.x + other, self.y + other)
        return Vector(self.x + other.x, self.y + other.y)

    def __iadd__(self, other):
        self.x += other.x
        self.y += other.y
        return self

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar):
        return self.__mul__(scalar)
    
class Image:
    def __init__(self, path): pass

class Transform:
    def __init__(self, *args, **kwargs): pass

class AnimatedSprite:
    def __init__(self, w, h, x, y):
        self.width = w
        self.height = h
        self.position = Vector(x, y)
        self.image = None

    def generate_mirrored_animation(self, pattern, start, end, step=1):
        dummy = [object()] * 10
        return (dummy, dummy)

class pygame:
    class image:
        @staticmethod
        def load(path):
            class FakeSurface:
                def get_size(self): return (140, 120)
            return FakeSurface()

class renpy:
    class loader:
        @staticmethod
        def transfn(path): return path

_DEFAULT_ENEMY_SPRITES = "images/sprites/knight_01"

def register_enemy_class(name, cls): pass

class Enemy(AnimatedSprite):
        """Base enemy class. Loads sprites from a folder path."""

        VERTICAL_ACCELERATION = 3
        RISE_TIME = 2

        def __init__(self, x, y, platform_tiles, portal_group,
                min_speed, max_speed, sprite_folder="", scale=1.0):
            folder = sprite_folder if sprite_folder else _DEFAULT_ENEMY_SPRITES
            folder = folder.rstrip("/")

            # Auto-detect actual sprite size from first walk frame
            try:
                first_frame = folder + "/walk_000.png"
                pi = pygame.image.load(renpy.loader.transfn(first_frame))
                actual_w, actual_h = pi.get_size()
            except Exception:
                actual_w, actual_h = 140, 120

            # Apply scale modifier
            scaled_w = int(actual_w * scale)
            scaled_h = int(actual_h * scale)
            AnimatedSprite.__init__(self, scaled_w, scaled_h, x, y)
            self.sprite_scale = scale

            walk_pattern = folder + "/walk_{:03d}.png"
            die_pattern = folder + "/die_{:03d}.png"

            if scale != 1.0:
                self.walk_right_sprites, self.walk_left_sprites = (
                    self._generate_scaled_mirrored(walk_pattern, 0, 9, scale))
                self.die_right_sprites, self.die_left_sprites = (
                    self._generate_scaled_mirrored(die_pattern, 0, 9, scale))
                self.rise_right_sprites, self.rise_left_sprites = (
                    self._generate_scaled_mirrored(die_pattern, 9, 0, scale, step=-1))
            else:
                self.walk_right_sprites, self.walk_left_sprites = (
                    self.generate_mirrored_animation(walk_pattern, 0, 9))
                self.die_right_sprites, self.die_left_sprites = (
                    self.generate_mirrored_animation(die_pattern, 0, 9))
                self.rise_right_sprites, self.rise_left_sprites = (
                    self.generate_mirrored_animation(die_pattern, 9, 0, -1))

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

            self.velocity = Vector(
                self.direction * random.randint(min_speed, max_speed), 0)
            self.acceleration = Vector(0, self.VERTICAL_ACCELERATION)

            self.hp = 1
            self.is_dead = False
            self.frames_dead = 0
            self.seconds_dead = 0
            self.revive_seconds = 0  # 0 = no revive; set by combat stage

        def _generate_scaled_mirrored(self, fname_pattern, start, end, scale, step=1):
            right_sprites = []
            left_sprites = []
            for i in range(start, end + 1 if step > 0 else end - 1, step):
                img = Image(fname_pattern.format(i))
                scaled_r = Transform(img, zoom=scale)
                right_sprites.append(scaled_r)
                left_sprites.append(Transform(img, xzoom=-scale, yzoom=scale))
            return (right_sprites, left_sprites)

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

                if self.position.x + self.width < 0:
                    self.position.x = max_width - self.width
                elif self.position.x > max_width:
                    self.position.x = 0

        def check_collisions(self, max_width, max_height):
            for platform in self.platform_tiles:
                if platform.is_colliding(self):
                    self.position.y = platform.position.y - self.height + 5
                    self.velocity.y = 0

        def check_animations(self):
            if self.animate_death:
                if self.direction == 1:
                    self.animate(self.die_right_sprites, 0.15)
                else:
                    self.animate(self.die_left_sprites, 0.15)
            elif self.animate_rise:
                if self.direction == 1:
                    self.animate(self.rise_right_sprites, 0.15)
                else:
                    self.animate(self.rise_left_sprites, 0.15)
            elif self.is_dead:
                # Count time spent dead
                self.frames_dead += 1
                if self.frames_dead % 60 == 0:
                    self.seconds_dead += 1

                # Check if enemy should revive
                if self.revive_seconds > 0 and self.seconds_dead >= self.revive_seconds:
                    self.animate_rise = True
                    self.current_sprite_index = 0
                else:
                    # Stay on last death frame
                    if self.direction == 1:
                        self.image = self.die_right_sprites[-1]
                    else:
                        self.image = self.die_left_sprites[-1]

        def animate(self, sprite_list, speed):
            if self.current_sprite_index < len(sprite_list) - 1:
                self.current_sprite_index += speed
            else:
                if self.animate_death:
                    self.current_sprite_index = len(sprite_list) - 1
                    self.animate_death = False
                elif self.animate_rise:
                    self.current_sprite_index = 0
                    self.animate_rise = False
                    self.is_dead = False
                    self.frames_dead = 0
                    self.seconds_dead = 0
                    self.hp = 1
                else:
                    self.current_sprite_index = 0

            self.image = sprite_list[int(self.current_sprite_index)]