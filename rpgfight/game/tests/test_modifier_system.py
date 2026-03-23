#Victor Gouttin
#Test for modifier_system.rpy
#issues relating to importing code so just decided to make a seperate file for modifier_system

from modifier_system import Modifier, ModifierSystem
#test adding modifier
#after one modifier gets added, total should be 1
def test_add_modifier():
    ms = ModifierSystem()
    mod = Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health")
    ms.add_modifier(mod)
    assert len(ms.active_modifiers) == 1

#test total calculation for one modifier
#after adding one health boost of 50, total should be 50
def test_get_total_single():
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    assert ms.get_total(Modifier.HEALTH_BOOST) == 50

#test total calculation for multiple modifiers
#after adding two health boosts of 50 and 50, total should be 100
def test_get_total_multiple():
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    assert ms.get_total(Modifier.HEALTH_BOOST) == 100

#test get modifier names
#after adding two modifiers, names should be in list
def test_get_modifier_names():
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    ms.add_modifier(Modifier(Modifier.SPEED_UP, 0.2, "Speed+", "Increase speed"))
    names = ms.get_modifier_names()
    assert "HP+" in names
    assert "Speed+" in names

#test clear modifiers
#after adding two modifiers and clearing, active_modifiers should be empty
def test_clear_modifiers():
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    ms.add_modifier(Modifier(Modifier.SPEED_UP, 0.2, "Speed+", "Increase speed"))
    ms.clear()
    assert len(ms.active_modifiers) == 0

#test apply to player
#after applying health boost of 50, player health should be 150 (100 base + 50 boost)
def test_apply_to_player():
    class MockPlayer():
        STARTING_HEALTH = 100
        def __init__(self):
            self.health = self.STARTING_HEALTH
            self.max_health = self.STARTING_HEALTH
            self.speed_multiplier = 1.0
            self.dash_count = 1
            self.dashes_remaining = 1
            self.damage_multiplier = 1.0
            self.has_shield = False

    player = MockPlayer()
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    ms.apply_to_player(player)
    assert player.health == 150
    assert player.max_health == 150
