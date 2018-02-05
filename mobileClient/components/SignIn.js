import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
} from 'react-native';
import axios from 'axios';

export default class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
        this.signIn = this.signIn.bind(this);
    }

    signIn() {
        axios.post('http://localhost:3000/signIn', {
            email: this.state.email,
            password: this.state.password,
        }).then((response) => {
            // if (response.data.code === 11000) {
            //     return this.setState({
            //         error: 'Email already taken',
            //     });
            // }
            // this.props.navigation.navigate('Home', { token: response.data.token });
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Sign In</Text>
                <Text>{this.state.error && this.state.error.length ? this.state.error : null}</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={(email) => this.setState({ email })}
                    value={this.state.email}
                    placeholder="email"
                />
                <TextInput
                    style={styles.textInput}
                    onChangeText={(password) => this.setState({ password })}
                    value={this.state.password}
                    placeholder="password"
                    secureTextEntry={true}
                />
                <Button
                    title={'Submit'}
                    onPress={this.signIn}
                />

                <Text 
                    onPress={() => this.props.navigation.navigate('Register')}
                    style={styles.registerSignInHereText}
                >
                    Register Here!
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInput: {
        height: 20,
        borderColor: 'gray',
        borderWidth: 1,
        width: 150,
    },
    registerSignInHereText: {
        fontFamily: 'Cochin',
        fontSize: 20,
        fontWeight: 'bold',
    }
});