/**
 * Created by kiyon on 2016/12/29.
 */

$(document).ready(function () {
  console.log(CONFIG.particles);
  var _config = CONFIG.particles;
  if (!_config.enable) {
    return false;
  }

  _config.color = _config.color === "random" ? _config.color : "#" + _config.color;
  _config.size_max = Math.random() * 4 + 7;

  if(_config.theme === "random") {
    _config.theme = Math.random() > 0.5 ? "snow" : "star";
    if( _config.theme ==="snow" && _config.color === "random") {
      _config.color = "#fff";
    }
  }
  switch (_config.theme) {
    case "snow":
      _config.number_value = Math.ceil(Math.random() * 25 + 32);
      _config.shape_type = "circle";
      _config.shape_nb_sides = "5";
      _config.anim_enable = false;
      _config.anim_speed = 2;
      _config.move_speed = Math.ceil(Math.random() * 4 + 1);
      _config.move_direction = "bottom";
      break;
    case "star":
      _config.number_value = Math.ceil(Math.random() * 25 + 12);
      _config.shape_type = "star";
      _config.shape_nb_sides = "5";
      _config.anim_enable = true;
      _config.anim_speed = Math.ceil(Math.random() * 3 + 1);
      _config.move_speed = 1;
      _config.move_direction = "none";
      break;
  }

  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": _config.number_value,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": _config.color
      },
      "shape": {
        "type": _config.shape_type,
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": _config.shape_nb_sides
        }
      },
      "opacity": {
        "value": 0.5,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": _config.size_max,
        "random": true,
        "anim": {
          "enable": _config.anim_enable,
          "speed": _config.anim_speed,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": false,
        "distance": 320,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 2
      },
      "move": {
        "enable": true,
        "speed": _config.move_speed,
        "direction": _config.move_direction,
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": true,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "window",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "bubble"
        },
        "onclick": {
          "enable": true,
          "mode": "repulse"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 250,
          "line_linked": {
            "opacity": 0.5
          }
        },
        "bubble": {
          "distance": 270,
          "size": 4,
          "duration": 0.3,
          "opacity": 1,
          "speed": 3
        },
        "repulse": {
          "distance": 150,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  });
});
