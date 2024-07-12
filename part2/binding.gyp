{
  "targets": [{
    "target_name": "performance_counter",
    "cflags!": [ "-fno-exceptions" ],
    "cflags_cc!": [ "-fno-exceptions" ],
    "sources": [ "performance_counter_wrapper.cpp" ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")"
    ],
    'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    "xcode_settings": {
      "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
      "CLANG_CXX_LIBRARY": "libc++",
      "MACOSX_DEPLOYMENT_TARGET": "10.15"
    }
  }]
}