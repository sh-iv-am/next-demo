package com.example.app;

import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity implements DefaultHardwareBackBtnHandler {
    @Override
    public void invokeDefaultOnBackPressed() {
        // Let Capacitor / the system handle the back press.
        super.onBackPressed();
    }
}
