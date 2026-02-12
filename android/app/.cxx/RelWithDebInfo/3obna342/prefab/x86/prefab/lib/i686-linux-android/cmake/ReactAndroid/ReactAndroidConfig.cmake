if(NOT TARGET ReactAndroid::hermestooling)
add_library(ReactAndroid::hermestooling SHARED IMPORTED)
set_target_properties(ReactAndroid::hermestooling PROPERTIES
    IMPORTED_LOCATION "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/hermestooling/libs/android.x86/libhermestooling.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/hermestooling/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::jsctooling)
add_library(ReactAndroid::jsctooling SHARED IMPORTED)
set_target_properties(ReactAndroid::jsctooling PROPERTIES
    IMPORTED_LOCATION "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/jsctooling/libs/android.x86/libjsctooling.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/jsctooling/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::jsi)
add_library(ReactAndroid::jsi SHARED IMPORTED)
set_target_properties(ReactAndroid::jsi PROPERTIES
    IMPORTED_LOCATION "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/jsi/libs/android.x86/libjsi.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/jsi/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::reactnative)
add_library(ReactAndroid::reactnative SHARED IMPORTED)
set_target_properties(ReactAndroid::reactnative PROPERTIES
    IMPORTED_LOCATION "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/reactnative/libs/android.x86/libreactnative.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Dell/.gradle/caches/8.12/transforms/53346059f9f9aaf8e8b145283166a7a3/transformed/react-android-0.76.5-release/prefab/modules/reactnative/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

