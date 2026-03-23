class Modifier():
        EXTRA_DASH = "extra_dash"
        HEALTH_BOOST = "health_boost"
        SPEED_UP = "speed_up"
        DAMAGE_UP = "damage_up"
        SHIELD = "shield"

        def __init__(self, mod_type, value, name, description):
            self.mod_type = mod_type
            self.value = value
            self.name = name
            self.description = description


class ModifierSystem():
        def __init__(self):
            self.active_modifiers = []

        def add_modifier(self, modifier):
            self.active_modifiers.append(modifier)

        def get_total(self, mod_type):
            total = 0
            for mod in self.active_modifiers:
                if mod.mod_type == mod_type:
                    total += mod.value
            return total

        def get_modifier_names(self):
            return [mod.name for mod in self.active_modifiers]

        def clear(self):
            self.active_modifiers = []

        def apply_to_player(self, player):
            health_bonus = self.get_total(Modifier.HEALTH_BOOST)
            player.health = max(20, player.STARTING_HEALTH + int(health_bonus))
            player.max_health = player.health

            speed_bonus = self.get_total(Modifier.SPEED_UP)
            player.speed_multiplier = max(0.4, 1.0 + speed_bonus)

            dash_bonus = self.get_total(Modifier.EXTRA_DASH)
            player.dash_count = max(1, 1 + int(dash_bonus))
            player.dashes_remaining = player.dash_count

            damage_bonus = self.get_total(Modifier.DAMAGE_UP)
            player.damage_multiplier = max(0.25, 1.0 + damage_bonus)

            shield_count = self.get_total(Modifier.SHIELD)
            player.has_shield = shield_count > 0
