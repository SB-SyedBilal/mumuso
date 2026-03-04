import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, radius, fontWeight, motion } from '../constants/dimensions';

interface Option {
    label: string;
    value: string;
}

interface SegmentedControlProps {
    options: Option[];
    selectedValue: string;
    onValueChange: (value: any) => void;
    containerStyle?: any;
}

export default function SegmentedControl({
    options,
    selectedValue,
    onValueChange,
    containerStyle,
}: SegmentedControlProps) {
    const [translateX] = React.useState(new Animated.Value(0));
    const segmentWidth = (Dimensions.get('window').width - 48) / options.length;

    React.useEffect(() => {
        const index = options.findIndex(o => o.value === selectedValue);
        Animated.spring(translateX, {
            toValue: index * segmentWidth,
            useNativeDriver: true,
            bounciness: 4,
            speed: 12,
        }).start();
    }, [selectedValue, segmentWidth]);

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View
                style={[
                    styles.activeIndicator,
                    {
                        width: segmentWidth - 4,
                        transform: [{ translateX }],
                    },
                ]}
            />
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.segment}
                    onPress={() => onValueChange(option.value)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.label,
                            selectedValue === option.value && styles.activeLabel,
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: radius.md,
        padding: 2,
        marginHorizontal: 24,
        height: 36,
        alignItems: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        height: 32,
        backgroundColor: colors.surface,
        borderRadius: radius.md - 2,
        left: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: fontWeight.medium,
        color: colors.text.secondary,
    },
    activeLabel: {
        color: colors.text.primary,
        fontWeight: fontWeight.semibold,
    },
});
