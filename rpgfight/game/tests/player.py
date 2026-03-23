class Player:
    HORIZONTAL_ACCELERATION = 2
    HORIZONTAL_FRICTION = 0.15
    VERTICAL_ACCELERATION = 0.8
    VERTICAL_JUMP_SPEED = 23
    STARTING_HEALTH = 100

    def __init__(self, x, y):
        self.position = [x, y]
        self.velocity = [0, 0]
        self.health = self.STARTING_HEALTH
        self.dash_count = 1
        self.dashes_remaining = 1

    def jump(self):
        self.velocity[1] = -self.VERTICAL_JUMP_SPEED

    def fire(self):
        if self.dashes_remaining > 0:
            self.dashes_remaining -= 1

    def refill_dashes(self):
        self.dashes_remaining = self.dash_count

    def reset(self, x, y):
        self.position = [x, y]
        self.velocity = [0, 0]