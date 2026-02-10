/**
 * Mumuso App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type { PropsWithChildren } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    };

    return (
        <SafeAreaView style={[styles.container, backgroundStyle]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome to Mumuso!</Text>
                    <Text style={styles.subtitle}>
                        Your professional React Native application
                    </Text>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Getting Started</Text>
                        <Text style={styles.text}>
                            Edit App.tsx to change this screen and then come back to see your edits.
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Project Structure</Text>
                        <Text style={styles.text}>
                            This app is organized with a professional folder structure in the src directory.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        marginBottom: 32,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
    },
});

export default App;
