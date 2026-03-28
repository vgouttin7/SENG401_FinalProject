init -15 python:
    """
    Config Loader: Fetches campaign data from the dashboard API.
    Falls back to hardcoded defaults if the API is unavailable.

    Priority:
    1. Cached JSON file (game/config/campaign.json)
    2. Live API fetch from dashboard (http://localhost:3000/api/export/<id>)
    3. Hardcoded defaults in .rpy files
    """

    import json
    import os

    # SSL context for API calls — skip verification for our own server
    # Web builds (emscripten) don't have ssl module; browser handles HTTPS
    try:
        import ssl
        _ssl_ctx = ssl.create_default_context()
        _ssl_ctx.check_hostname = False
        _ssl_ctx.verify_mode = ssl.CERT_NONE
    except ImportError:
        _ssl_ctx = None

    # Dashboard API settings
    _CONFIG_API_URL = "https://farnoodm.com/dashboard/api/export/latest"
    _CONFIG_CAMPAIGNS_URL = "https://farnoodm.com/dashboard/api/export/campaigns"
    _CONFIG_CACHE_DIR = os.path.join(config.gamedir, "config")
    _CONFIG_CACHE_FILE = os.path.join(_CONFIG_CACHE_DIR, "campaign.json")
    _CAMPAIGNS_LIST_CACHE = os.path.join(_CONFIG_CACHE_DIR, "campaigns_list.json")

    # Loaded config data (None = not loaded yet)
    _loaded_config = None
    _config_loaded_from = "none"

    def _fetch_url(url):
        """Fetch JSON from a URL. Uses JS fetch on web, urllib on desktop."""
        if renpy.emscripten:
            try:
                import emscripten
                js = """
                    (function() {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', '%s', false);
                        xhr.send(null);
                        if (xhr.status === 200) return xhr.responseText;
                        return '';
                    })()
                """ % url
                result = emscripten.run_script_string(js)
                if result:
                    return json.loads(result)
            except Exception as e:
                print("[CONFIG] web fetch failed: %s" % str(e))
            return None

        try:
            from urllib.request import urlopen, Request
            req = Request(url, headers={"User-Agent": "ChroniclesOfChange/1.2"})
            if _ssl_ctx:
                response = urlopen(req, timeout=5, context=_ssl_ctx)
            else:
                response = urlopen(req, timeout=5)
            return json.loads(response.read().decode("utf-8"))
        except Exception as e:
            print("[CONFIG] fetch failed: %s" % str(e))
        return None

    def _fetch_config_from_api(campaign_id=None):
        """Try to fetch config from the dashboard API."""
        url = _CONFIG_API_URL
        if campaign_id is not None:
            url = "https://farnoodm.com/dashboard/api/export/" + str(campaign_id)
        return _fetch_url(url)

    def _load_cached_config():
        """Try to load config from cached JSON file."""
        try:
            if os.path.exists(_CONFIG_CACHE_FILE):
                with open(_CONFIG_CACHE_FILE, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return None

    def _save_config_cache(data):
        """Cache config to JSON file for offline use."""
        try:
            if not os.path.exists(_CONFIG_CACHE_DIR):
                os.makedirs(_CONFIG_CACHE_DIR)
            with open(_CONFIG_CACHE_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def _fetch_campaigns_list():
        """Fetch list of available campaigns from the dashboard API."""
        data = _fetch_url(_CONFIG_CAMPAIGNS_URL)
        if data:
            return data.get("campaigns", [])
        return None

    def _load_cached_campaigns_list():
        """Try to load campaigns list from cached JSON file."""
        try:
            if os.path.exists(_CAMPAIGNS_LIST_CACHE):
                with open(_CAMPAIGNS_LIST_CACHE, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return None

    def _save_campaigns_list_cache(data):
        """Cache campaigns list to JSON file for offline use."""
        try:
            if not os.path.exists(_CONFIG_CACHE_DIR):
                os.makedirs(_CONFIG_CACHE_DIR)
            with open(_CAMPAIGNS_LIST_CACHE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def load_campaigns_list():
        """
        Load list of available campaigns from the live API.
        Returns a list of dicts with id, name, description, stageCount.
        Returns None if API is unavailable.
        """
        campaigns = _fetch_campaigns_list()
        if campaigns:
            print("[CONFIG] Loaded %d campaigns from API" % len(campaigns))
            return campaigns

        print("[CONFIG] API unavailable — no campaigns loaded")
        return None

    def load_game_config(campaign_id=None):
        """
        Load campaign config from the live API. Returns None if unavailable.
        """
        global _loaded_config, _config_loaded_from

        data = _fetch_config_from_api(campaign_id)
        if data:
            _loaded_config = data
            _config_loaded_from = "api"
            print("[CONFIG] Loaded from API — %d stages" % len(data.get("stages", [])))
            return data

        _config_loaded_from = "none"
        print("[CONFIG] API unavailable — no config loaded")
        return None

    # ─── ENEMY CLASS REGISTRY ──────────────────────────────────
    # Maps enemy template names from the DB to Python classes.
    # When a new enemy type is added via the dashboard, register it here
    # or it falls back to the base Enemy class.

    _ENEMY_CLASS_REGISTRY = {}

    def register_enemy_class(name, cls):
        """Register an enemy class by template name."""
        _ENEMY_CLASS_REGISTRY[name] = cls

    def get_enemy_class(name):
        """Get enemy class by template name. Falls back to Enemy base class."""
        return _ENEMY_CLASS_REGISTRY.get(name, Enemy)


    # ─── BUILD CONFIG FROM JSON ────────────────────────────────

    def build_stage_configs_from_json(data):
        """
        Convert the API JSON export into STAGE_CONFIGS dict
        that the game already understands.
        """
        configs = {}

        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]

            # Resolve enemy types and sprite folders
            enemy_types = []
            enemy_speed_ranges = []
            enemy_sprites = []
            enemy_scales = []
            for e in stage_data.get("enemies", []):
                enemy_types.append(Enemy)
                enemy_speed_ranges.append((e["minSpeed"], e["maxSpeed"]))
                enemy_sprites.append(e.get("spriteWalk", ""))
                enemy_scales.append(e.get("spriteScale", 1.0))

            # Use the first enemy's speed range as the stage range
            # (stage_config uses a single range, enemies override individually)
            if enemy_speed_ranges:
                min_spd = min(r[0] for r in enemy_speed_ranges)
                max_spd = max(r[1] for r in enemy_speed_ranges)
            else:
                min_spd, max_spd = 1, 3

            sc = StageConfig(
                stage_id=stage_num,
                era_name=stage_data["eraName"],
                tile_map=stage_data["tileMap"],
                enemy_types=enemy_types if enemy_types else [Enemy],
                enemy_speed_range=(min_spd, max_spd),
                spawn_interval=stage_data["spawnInterval"],
                round_time=stage_data["roundTime"],
                background=stage_data.get("background", ""),
                enemy_hp=stage_data.get("enemies", [{}])[0].get("hp", 1) if stage_data.get("enemies") else 1,
                requires_stomp=stage_data.get("requiresStomp", False),
                revive_seconds=stage_data.get("reviveSeconds", 0),
                enemy_sprites=enemy_sprites,
                enemy_scales=enemy_scales,
            )
            configs[stage_num] = sc

        return configs

    def build_questions_from_json(data):
        """Convert the API JSON export into STAGE_QUESTIONS dict."""
        questions = {}

        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]
            stage_questions = []
            for q in stage_data.get("questions", []):
                stage_questions.append(Question(
                    text=q["text"],
                    choices=q["choices"],
                    correct_index=q["correctIndex"],
                    explanation=q.get("explanation", ""),
                ))
            questions[stage_num] = stage_questions

        return questions

    def build_dialogue_from_json(data):
        """
        Convert the API JSON export into a dict of stage_num -> list of (speaker_name, text) tuples.
        The game will use these to play dialogue dynamically.
        """
        dialogues = {}

        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]
            lines = []
            for dl in stage_data.get("dialogue", []):
                lines.append({
                    "speaker": dl["speaker"],
                    "color": dl.get("speakerColor", "#FFFFFF"),
                    "portrait": dl.get("portrait", ""),
                    "text": dl["text"],
                })
            dialogues[stage_num] = lines

        return dialogues

    def build_stage_messages_from_json(data):
        """Extract per-stage completion and retry messages from JSON."""
        complete = {}
        retry = {}
        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]
            cm = stage_data.get("completionMessage", "")
            rm = stage_data.get("retryMessage", "")
            if cm:
                complete[stage_num] = cm
            if rm:
                retry[stage_num] = rm
        return complete, retry

    def build_victory_dialogue_from_json(data):
        """Extract campaign victory dialogue and music from JSON."""
        campaign = data.get("campaign", {})
        victory_music = campaign.get("victoryMusic", "")
        lines = []
        for vl in campaign.get("victoryDialogue", []):
            lines.append({
                "speaker": vl["speaker"],
                "color": vl.get("speakerColor", "#FFFFFF"),
                "portrait": vl.get("portrait", ""),
                "text": vl["text"],
            })
        return victory_music, lines

    def build_stage_music_from_json(data):
        """Extract per-stage dialogue music mapping from JSON."""
        music = {}
        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]
            dm = stage_data.get("dialogueMusic", "")
            if dm:
                music[stage_num] = dm
        return music

    def build_combat_music_from_json(data):
        """Extract per-stage combat music mapping from JSON."""
        music = {}
        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]
            cm = stage_data.get("combatMusic", "")
            if cm:
                music[stage_num] = cm
        return music

    def build_quiz_music_from_json(data):
        """Extract per-stage quiz music mapping from JSON."""
        music = {}
        for stage_data in data.get("stages", []):
            stage_num = stage_data["stageNum"]
            qm = stage_data.get("quizMusic", "")
            if qm:
                music[stage_num] = qm
        return music

    def build_player_config_from_json(data):
        """Extract player config from JSON. Returns dict or None."""
        pc = data.get("playerConfig")
        if pc:
            return {
                "horizontal_acceleration": pc.get("horizontalAcceleration", 2),
                "friction": pc.get("friction", 0.15),
                "vertical_acceleration": pc.get("verticalAcceleration", 0.8),
                "jump_speed": pc.get("jumpSpeed", 23),
                "starting_health": pc.get("startingHealth", 100),
                "beam_velocity": pc.get("beamVelocity", 20),
                "beam_range": pc.get("beamRange", 500),
            }
        return None

    # Pre-load player config at init time so Player class can use it.
    # This runs before player.rpy (init -15 < init -5).
    _player_config = None
    _preload_config = _fetch_config_from_api()
    if _preload_config:
        _player_config = build_player_config_from_json(_preload_config)
