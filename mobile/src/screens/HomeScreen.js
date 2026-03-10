import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello Freelancer</Text>
            <Text style={styles.subtitle}>Welcome to your SaaS Mobile App</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => alert('Mobile App is Ready!')}
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f9ff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0c4a6e',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#0284c7',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    }
});

export default HomeScreen;
