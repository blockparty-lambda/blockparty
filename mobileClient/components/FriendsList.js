import React from "react";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import axios from "axios";
import { localip } from 'react-native-dotenv';

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      friends: [],
    };
  }

  componentDidMount() {
    const token = this.props.navigation.state.params.token;
    axios.get(`http://${localip}:3000/getfriends`, {
      headers: {
        authorization: token,
      }
    }).then((response) => {
      this.setState({
        friends: response.data.friends,
      });
    }).catch(err => {
      console.log(err);
    });
  }

  render() {
    return (
      <View style={container}>
        <ScrollView>
          <FlatList
            data={this.state.friends}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return <Text>{item.toString()}</Text>
            }}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  textInput: {
    height: 20,
    borderColor: "gray",
    borderWidth: 1,
    width: 150
  },
  registerSignInHereText: {
    // fontFamily: "sans-serif",
    fontSize: 20,
    fontWeight: "bold"
  }
});
