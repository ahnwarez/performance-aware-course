{
  "targets": [
    {
      "target_name": "sim8086",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "sim8086_addon.cc" ],
      "conditions": [
        ['OS=="mac"', {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.15",
            "OTHER_CFLAGS": [
              "-arch arm64",
              "-std=c++11"
            ],
            "OTHER_LDFLAGS": [
              "-Wl,-rpath,/usr/local/lib"
            ]
          },
          "libraries": [
            "/usr/local/lib/libsim86.so"
          ]
        }]
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}