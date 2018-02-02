import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
} from 'react-native';
import axios from 'axios';

export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            passwordRepeat: '',
        };
        this.register = this.register.bind(this);
    }

    register() {
        axios.post('http://localhost:3000/register', {
            email: this.state.email,
            password: this.state.password,
        }).then((response) => {
            if (response.data.code === 11000) {
                return this.setState({
                    error: 'Email already taken',
                });
            }
            // this.props.navigation.navigate('Home', { token: response.data.token });
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Register</Text>
                <Text>{this.state.error && this.state.error.length ? this.state.error : null}</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={(email) => this.setState({ email })}
                    value={this.state.email}
                />
                <TextInput
                    style={styles.textInput}
                    onChangeText={(password) => this.setState({ password })}
                    value={this.state.password}
                />
                <TextInput
                    style={styles.textInput}
                    onChangeText={(passwordRepeat) => this.setState({ passwordRepeat })}
                    value={this.state.passwordRepeat}
                />
                <Button
                    title={'Submit'}
                    onPress={this.register}
                />

                <Text onPress={ () => alert('yooo') }>Already Registered?</Text>
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
});