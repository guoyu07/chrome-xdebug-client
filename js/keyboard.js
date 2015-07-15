var Keyboard = (function() {

	var config_mode = false;
	var shortcuts = {};
	var settings_wrapper_selector = "#settings-shortcuts";

	var key_names = [];
	// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

	key_names[0x31] = "1";
	key_names[0x32] = "2";
	key_names[0x33] = "3";
	key_names[0x34] = "4";
	key_names[0x35] = "5";
	key_names[0x36] = "6";
	key_names[0x37] = "7";
	key_names[0x38] = "8";
	key_names[0x39] = "9";
	key_names[0x30] = "0";
	key_names[0x41] = "A";
	key_names[0x42] = "B";
	key_names[0x43] = "C";
	key_names[0x44] = "D";
	key_names[0x45] = "E";
	key_names[0x46] = "F";
	key_names[0x47] = "G";
	key_names[0x48] = "H";
	key_names[0x49] = "I";
	key_names[0x4A] = "J";
	key_names[0x4B] = "K";
	key_names[0x4C] = "L";
	key_names[0x4D] = "M";
	key_names[0x4E] = "N";
	key_names[0x4F] = "O";
	key_names[0x50] = "P";
	key_names[0x51] = "Q";
	key_names[0x52] = "R";
	key_names[0x53] = "S";
	key_names[0x54] = "T";
	key_names[0x55] = "U";
	key_names[0x56] = "V";
	key_names[0x57] = "W";
	key_names[0x58] = "X";
	key_names[0x59] = "Y";
	key_names[0x5A] = "Z";

	key_names[0x70] = "F1";
	key_names[0x71] = "F2";
	key_names[0x72] = "F3";
	key_names[0x73] = "F4";
	key_names[0x74] = "F5";
	key_names[0x75] = "F6";
	key_names[0x76] = "F7";
	key_names[0x77] = "F8";
	key_names[0x78] = "F9";
	key_names[0x79] = "F10";
	key_names[0x7A] = "F11";
	key_names[0x7B] = "F12";

	key_names[0x5D] = "ContextMenu";
	key_names[0x0D] = "Enter";
	key_names[0x20] = "Space";
	key_names[0x09] = "Tab";
	key_names[0x2E] = "Delete";
	key_names[0x23] = "End";
	key_names[0x24] = "Home";
	key_names[0x2D] = "Insert";
	key_names[0x22] = "PageDown";
	key_names[0x21] = "PageUp";
	key_names[0x28] = "ArrowDown";
	key_names[0x25] = "ArrowLeft";
	key_names[0x27] = "ArrowRight";
	key_names[0x26] = "ArrowUp";
	key_names[0x1B] = "Escape";
	key_names[0x2C] = "PrintScreen";
	key_names[0x91] = "ScrollLock";
	key_names[0x13] = "Pause";

	key_names[0xBC] = "Comma";
	key_names[0xBE] = "Period";
	key_names[0xBA] = "Semicolon";
	key_names[0xDE] = "Quote";
	key_names[0xDB] = "BracketLeft";
	key_names[0xDD] = "BracketRight";
	key_names[0xC0] = "Backquote";
	key_names[0xDC] = "Backslash";
	key_names[0xBD] = "Minuse";
	key_names[0xBB] = "Equal";


	function get_key_name(key_code) {
		return key_names[key_code] || "key_code:" + key_code;
	}

	function remove_mapping(action_name) {
		delete shortcuts[action_name];
		publicMethods.refreshShortcuts();
	}

	function process_key_event(e) {
		if (config_mode) {
			shortcuts[config_mode] = e;
			publicMethods.refreshShortcuts();
			config_mode = false;
		} else {
			for (var action_name in shortcuts) {
				if (JSON.stringify(e) == JSON.stringify(shortcuts[action_name])) {
					Action.exec(action_name);
				}
			}
		}
	}


	// object -> minified names -> string
	function stringify(shortcuts_obj) {
		var minified = {};

		for (var s in shortcuts) {
			minified[s] = {
				k: shortcuts[s].keyCode,
				c: shortcuts[s].modifiers.ctrlKey * 1,
				a: shortcuts[s].modifiers.altKey * 1,
				s: shortcuts[s].modifiers.shiftKey * 1
			};
		}

		return JSON.stringify(minified);
	}


	// string -> unminified names -> object
	function unstringify(shortcuts_string) {
		var unminified = {};

		try {
			var minified = JSON.parse(shortcuts_string);
			for (var i in minified) {
				unminified[i] = {
					keyCode: minified[i].k,
					modifiers: {
						ctrlKey: !!minified[i].c,
						altKey: !!minified[i].a,
						shiftKey: !!minified[i].s
					}
				};
			}
		} catch(error) {}

		return unminified;
	}


	function init_tooltips() {
		var show_tootlip_countdown;
		var hide_tootlip_countdown;

		$(".nav-button").on("mouseover", function() {
			var x = $(this).offset().left + $(this).width() / 2 + 10;
			var y = $(this).offset().top + $(this).height() / 2 + 10;
			var action = $(this).data("action");
			show_tootlip_countdown = setTimeout(function() {
				$("#tooltip").css({
					"left": x,
					"top": y,
				});
				var shortcut = Keyboard.getShortcutString(action) || '???';
				$("#tooltip").text(shortcut);
				$("body").trigger("show_tooltip");
			}, 800);
		});

		$(".nav-button").on("mouseout", function() {
			$("body").trigger("hide_tooltip");
		});

		$("body").on("hide_tooltip", function() {
			clearTimeout(show_tootlip_countdown);
			$("#tooltip").stop(true, true).fadeOut(100);
		});

		$("body").on("show_tooltip", function() {
			clearTimeout(show_tootlip_countdown);
			clearTimeout(hide_tootlip_countdown);
			$("#tooltip").stop(true, true).fadeIn(200, function() {
				hide_tootlip_countdown = setTimeout(function() {
					$("body").trigger("hide_tooltip");
				}, 2000);
			});
		});
	}

	function init_keypress_handler() {
		$("input").on("keyup", function(e) {
			e.stopPropagation();
		});
		$("#codeview, #eval-content, #stack").on("keyup keydown", function(e) {
			e.preventDefault();
		});
		$("body").on("keyup", function(e) {
			var ke = {
				keyCode: e.keyCode,
				modifiers: {
					ctrlKey: e.ctrlKey,
					altKey: e.altKey,
					shiftKey: e.shiftKey
				}
			};
			process_key_event(ke);
		});
	}


	/* PUBLIC */

	var publicMethods = {

		init: function() {
			shortcuts = unstringify(Config.get("shortcuts"));
			this.refreshShortcuts();

			$(function() {
				init_tooltips();
				init_keypress_handler();

				$(settings_wrapper_selector).on("click", ".key", function() {
					config_mode = $(this).attr("ref");
					$(this).addClass("undefined").text("Press a key...");
				});

				$(settings_wrapper_selector).on("click", ".key_remove", function() {
					var action_name = $(this).attr("ref");
					remove_mapping(action_name);
				});
			});
		},

		refreshShortcuts: function() {
			var that = this;
			$(function() {
				var table = $(settings_wrapper_selector);
				table.html("");

				$("input[name=shortcuts]").val(stringify(shortcuts));

				var all_action_names = Action.getAllActionNames();
				for (var a in all_action_names) {
					var tr = $("<tr/>");
					tr.append('<td class="action_label">' + a + "</td>");
					var key_name = that.getShortcutString(a);
					if (key_name) {
						tr.append('<td ref="' + a + '" class="key">' + key_name + "</td>");
						tr.append('<td ref="' + a + '" class="key_remove">x</td>');
					} else {
						tr.append('<td ref="' + a + '" class="key undefined">--- undefined ---</td>');
						tr.append('<td ref="' + a + '" class="key_remove"></td>');
					}
					table.append(tr);
				}
			});
		},

		getShortcutString: function(action) {
			var shortcut_string = '';

			var s = shortcuts[action];
			if (s) {
				shortcut_string = "";
				if (s.modifiers.ctrlKey) shortcut_string += "CTRL + ";
				if (s.modifiers.altKey) shortcut_string += "ALT + ";
				if (s.modifiers.shiftKey) shortcut_string += "SHIFT + ";
				shortcut_string += get_key_name(s.keyCode);
			}

			return shortcut_string;
		}

	}

	return publicMethods;

})();

