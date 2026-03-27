#Victor Gouttin
#Test for core.rpy
#core.py is a copy of the core classes extracted for pytest
#the methods that are tested in here are used all over this test folder, so I thought it would be good for them to be tested as well

from mock_core import Vector, GameSprite, MapTile


#test vector addition with another vector
#(1, 2) + (3, 4) should equal (4, 6)
def test_vector_add_vector():
    v1 = Vector(1, 2)
    v2 = Vector(3, 4)
    result = v1 + v2
    assert result.x == 4
    assert result.y == 6


#test vector addition with a scalar
#(1, 2) + 3 should equal (4, 5)
def test_vector_add_scalar():
    v = Vector(1, 2)
    result = v + 3
    assert result.x == 4
    assert result.y == 5


#test vector multiplication with another vector
#(2, 3) * (4, 5) should equal (8, 15)
def test_vector_mul_vector():
    v1 = Vector(2, 3)
    v2 = Vector(4, 5)
    result = v1 * v2
    assert result.x == 8
    assert result.y == 15


#test vector multiplication with a scalar
#(2, 3) * 4 should equal (8, 12)
def test_vector_mul_scalar():
    v = Vector(2, 3)
    result = v * 4
    assert result.x == 8
    assert result.y == 12


#test vector right multiplication with a scalar
#4 * (2, 3) should equal (8, 12)
def test_vector_rmul_scalar():
    v = Vector(2, 3)
    result = 4 * v
    assert result.x == 8
    assert result.y == 12


#test gamesprite collision when overlapping
#two overlapping sprites should return True
def test_gamesprite_is_colliding_true():
    a = GameSprite(50, 50, 0, 0)
    b = GameSprite(50, 50, 25, 25)
    assert a.is_colliding(b) == True


#test gamesprite collision when not overlapping
#two non overlapping sprites should return False
def test_gamesprite_is_colliding_false():
    a = GameSprite(50, 50, 0, 0)
    b = GameSprite(50, 50, 100, 100)
    assert a.is_colliding(b) == False


#test gamesprite collision at exact edge
#two sprites touching exactly at edge should return True
def test_gamesprite_is_colliding_edge():
    a = GameSprite(50, 50, 0, 0)
    b = GameSprite(50, 50, 50, 0)
    assert a.is_colliding(b) == True


#test maptile collision padding shrinks collision area
#a sprite that would collide with base GameSprite but is within padding should return False
def test_maptile_collision_padding():
    tile = MapTile(0, 0, 1)
    # place sprite just inside the padding zone (1 pixel inside edge)
    other = GameSprite(1, 1, 1, 1)
    assert tile.is_colliding(other) == False


#test maptile collision outside padding still collides
#a sprite well inside the tile should still collide
def test_maptile_collision_inside():
    tile = MapTile(0, 0, 1)
    other = GameSprite(10, 10, 10, 10)
    assert tile.is_colliding(other) == True