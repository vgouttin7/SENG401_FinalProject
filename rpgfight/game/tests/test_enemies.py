#Victor Gouttin
#Test for enemies.rpy
#issues relating to importing code so just decided to make a seperate file for enemies only including the logic that we created
#there is no point in testing the ren'py code as it is not our code and we can assume it works as intended

from enemies import Enemy

#Mock Platform for collision testing
class MockPlatform:
    def __init__(self, y=300):
        self.position = type('obj', (object,), {'x': 0, 'y': y})()

    def is_colliding(self, obj):
        return True


#test enemy initializes alive with 1 hp
#after creating enemy, is_dead should be False and hp should be 1
def test_enemy_initial_state():
    enemy = Enemy(0, 0, [], [], 1, 3)
    assert enemy.is_dead == False
    assert enemy.hp == 1
    assert enemy.frames_dead == 0
    assert enemy.seconds_dead == 0


#test enemy dead frame counting
#after 60 frames dead, seconds_dead should be 1
def test_enemy_frames_dead_counting():
    enemy = Enemy(0, 0, [], [], 1, 3)
    enemy.is_dead = True
    for _ in range(60):
        enemy.check_animations()
    assert enemy.seconds_dead == 1


#test enemy does not revive when revive_seconds is 0
#after enough frames, animate_rise should remain False
def test_enemy_no_revive_when_zero():
    enemy = Enemy(0, 0, [], [], 1, 3)
    enemy.is_dead = True
    enemy.revive_seconds = 0
    for _ in range(300):
        enemy.check_animations()
    assert enemy.animate_rise == False
    assert enemy.is_dead == True


#test enemy revive triggers after enough time
#after revive_seconds worth of frames, animate_rise should be True
def test_enemy_revive_triggers():
    enemy = Enemy(0, 0, [], [], 1, 3)
    enemy.is_dead = True
    enemy.revive_seconds = 3
    for _ in range(180):  # 3 seconds worth of frames at 60fps
        enemy.check_animations()
    assert enemy.animate_rise == True


#test enemy revive resets stats
#after animate_rise completes, enemy should be alive with full hp
def test_enemy_revive_resets_stats():
    enemy = Enemy(0, 0, [], [], 1, 3)
    enemy.is_dead = True
    enemy.frames_dead = 60
    enemy.seconds_dead = 1
    enemy.animate_rise = True
    enemy.check_animations()
    assert enemy.is_dead == False
    assert enemy.hp == 1
    assert enemy.frames_dead == 0
    assert enemy.seconds_dead == 0


#test collision repositions enemy on top of platform
#after collision, enemy y position should be platform.y - height + 5
def test_enemy_collision_repositions():
    enemy = Enemy(0, 0, [], [], 1, 3)
    platform = MockPlatform(y=300)
    enemy.platform_tiles = [platform]
    enemy.check_collisions(1000, 800)
    assert enemy.position.y == platform.position.y - enemy.height + 5
    assert enemy.velocity.y == 0