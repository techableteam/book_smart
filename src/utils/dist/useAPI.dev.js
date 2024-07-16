"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isTokenInLocalStorage = exports.Signin = exports.Signup = void 0;

var _axios = _interopRequireDefault(require("./axios"));

var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Signup = function Signup(userData) {
  var response;
  return regeneratorRuntime.async(function Signup$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].post('/signup', userData));

        case 3:
          response = _context.sent;
          return _context.abrupt("return", response.data);

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          throw _context.t0;

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.Signup = Signup;

var Signin = function Signin(credentials, endpoint) {
  var response;
  return regeneratorRuntime.async(function Signin$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(_axios["default"].post("/".concat(endpoint, "/signin"), credentials));

        case 3:
          response = _context2.sent;

          if (!response.data.token) {
            _context2.next = 7;
            break;
          }

          _context2.next = 7;
          return regeneratorRuntime.awrap(_asyncStorage["default"].setItem('token', response.data.token));

        case 7:
          return _context2.abrupt("return", response.data);

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          throw _context2.t0;

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.Signin = Signin;

var isTokenInLocalStorage = function isTokenInLocalStorage() {
  var token;
  return regeneratorRuntime.async(function isTokenInLocalStorage$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(_asyncStorage["default"].getItem('token'));

        case 3:
          token = _context3.sent;
          return _context3.abrupt("return", token !== null);

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.error('Error checking for token in localstorage:', _context3.t0);
          return _context3.abrupt("return", false);

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.isTokenInLocalStorage = isTokenInLocalStorage;
//# sourceMappingURL=useAPI.dev.js.map
