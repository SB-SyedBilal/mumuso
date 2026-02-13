/**
 * Mumuso Loyalty App
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/services/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAF9F7" />
            <AuthProvider>
                <AppNavigator />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

export default App;
