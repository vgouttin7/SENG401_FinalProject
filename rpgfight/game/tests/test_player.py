#Victor Gouttin
#Test for player.rpy
#issues relating to importing code so just decided to make a seperate file for player only including the logic that we created
#there is no point in testing the ren'py code as it is not our code and we can assume it works as intended

from player import Player

#Mock Vector class to avoid importing ren'py code and just test the logic of the player class
class MockVector:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

    def __add__(self, other):
        return MockVector(self.x + other.x, self.y + other.y)

    def __iadd__(self, other):
        self.x += other.x
        self.y += other.y
        return self

#Mock Platform class to avoid importing ren'py code and just test the logic of the player class
class MockPlatform:
    def __init__(self, y=100):
        self.position = MockVector(0, y)

    def is_colliding(self, obj):
        return True

#Mock Keyboard class to avoid importing ren'py code and just test the logic of the player class
class MockKeyboard:
    def __init__(self):
        self.left = False
        self.right = False
        self.a = False
        self.d = False
        self.space = 0
        self.w = False
        self.shift = 0

#test player initialization
#after initializing player, health should be 100 and velocity should be (0, 0)
def test_player_initialization():
    player = Player(0, 0, [], [], [])
    assert player.health == player.STARTING_HEALTH
    assert player.velocity.x == 0
    assert player.velocity.y == 0

#test player jump sets velocity
#after jumping, vertical velocity should be negative and animate_jump should be True
def test_player_jump_sets_velocity():
    platform = MockPlatform()
    player = Player(0, 0, [platform], [], [])
    player.jump()
    assert player.velocity.y < 0
    assert player.animate_jump is True

#test player move right sets acceleration
#after moving right, horizontal acceleration should be positive
def test_player_move_right():
    player = Player(0, 0, [], [], [])
    kb = MockKeyboard()
    kb.right = True
    player.move(kb, 1000, False, False)
    assert player.acceleration.x > 0

#test player move left sets acceleration
#after moving left, horizontal acceleration should be negative
def test_player_move_left():
    player = Player(0, 0, [], [], [])
    kb = MockKeyboard()
    kb.left = True
    player.move(kb, 1000, False, False)
    assert player.acceleration.x < 0

#test player fire reduces dash
#after firing, dashes_remaining should decrease by 1
def test_player_fire_reduces_dash():
    player = Player(0, 0, [], [], [])
    player.dashes_remaining = 1
    player.fire()
    assert player.dashes_remaining == 0

#test player refill dashes
#after refilling dashes dashes_remaining should equal dash_count
def test_player_refill_dashes():
    player = Player(0, 0, [], [], [])
    player.dashes_remaining = 0
    player.refill_dashes()
    assert player.dashes_remaining == player.dash_count

#test player flash
#after starting flash, is_flashing should be True
#once flash duration has passed, is_flashing should be False
def test_player_flash():
    player = Player(0, 0, [], [], [])
    player.start_flash()
    assert player.is_flashing is True
    for _ in range(player.flash_duration): #this is simulating frames
        player.update_flash()
    assert player.is_flashing is False

#test player reset
#after resetting, position should be reset to initial values and velocity should be (10, 20)
def test_player_reset():
    player = Player(10, 20, [], [], [])
    player.position.x = 999
    player.position.y = 999
    player.reset()
    assert player.position.x == 10
    assert player.position.y == 20