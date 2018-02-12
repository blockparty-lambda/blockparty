import React from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, FlatList } from "react-native";
import axios from "axios";
import { localip } from 'react-native-dotenv';
import { List, ListItem, SearchBar } from "react-native-elements";

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      friends: [
        { name: "neil", age: 28, _id: '123', avatarUrl: 'https://impactspace.com/images/uploads/person-default.png'},
        { name: "doug", age: 36, _id: '124', avatarUrl: 'https://impactspace.com/images/uploads/person-default.png'},
        { name: "joseph", age: 28, _id: '125', avatarUrl: 'https://impactspace.com/images/uploads/person-default.png'},
      ],
    };
  }

  // call our api to get the users apis
  // set result to state
  // componentDidMount() {
  //   const token = this.props.navigation.state.params.token;
  //   axios.get(`http://${localip}:3000/getfriends`, {
  //     headers: {
  //       authorization: token,
  //     }
  //   }).then((response) => {
  //     this.setState({
  //       friends: response.data.friends,
  //     });
  //   }).catch(err => {
  //     console.log(err);
  //   });
  // }


  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  renderHeader = () => {
    return <SearchBar placeholder="Search friends..." lightTheme round />;
  };

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  render() {
    return (
        <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
          <FlatList
            data={this.state.friends}
            renderItem={({ item }) => (
              <ListItem
                roundAvatar
                title={`${item.name}`}
                subtitle={item.age}
                avatar={{ uri: item.avatarUrl }}
                containerStyle={{ borderBottomWidth: 0 }}
              />
            )}
            keyExtractor={item => item._id}
            ItemSeparatorComponent={this.renderSeparator}
            ListHeaderComponent={this.renderHeader}
            ListFooterComponent={this.renderFooter}
            // onRefresh={this.handleRefresh}
            // refreshing={this.state.refreshing}
            // onEndReached={this.handleLoadMore}
            // onEndReachedThreshold={50}
          />
        </List>
    );
  }
}