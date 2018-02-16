import React from "react";
import {
  StyleSheet,
  View,
  TextInput,
  SectionList,
  AsyncStorage,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import { localip } from "react-native-dotenv";
import { List, ListItem, SearchBar, Button, Text } from "react-native-elements";

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      query: "",
      acceptedFriends: [],
      requestedFriends: [],
      pendingFriends: [],
      searchResults: [],
      refreshing: false,
      loading: false
    };
  }

  // call our api to get the users apis
  // set result to state
  async componentDidMount() {
    this.setState({ token: await AsyncStorage.getItem("jwt") });
    this.getFriendData();
  }

  getFriendData = async () => {
    this.setState({ loading: true });

    axios
      .get(`http://${localip}:3000/getfriends`, {
        headers: {
          Authorization: this.state.token
        }
      })
      .then(response => {
        // Ternary insanity
        const {
          acceptedFriends,
          pendingFriends,
          requestedFriends
        } = response.data.friends.reduce(
          (result, friend) =>
            friend.status === "accepted"
              ? (result.acceptedFriends.push(friend), result)
              : friend.status === "pending"
                ? (result.pendingFriends.push(friend), result)
                : friend.status === "requested"
                  ? (result.requestedFriends.push(friend), result)
                  : result,
          { acceptedFriends: [], pendingFriends: [], requestedFriends: [] }
        );

        this.setState({
          acceptedFriends,
          pendingFriends,
          requestedFriends,
          loading: false,
          refreshing: false,
          searchResults: []
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  acceptFriendRequest = async friend => {
    await axios.post(
      `http://${localip}:3000/addfriend`,
      { friendId: friend._id },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    this.getFriendData();
  };

  rejectFriendRequest = async friend => {
    await axios.post(
      `http://${localip}:3000/removefriend`,
      { friendId: friend._id },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    this.getFriendData();
  };

  handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this.getFriendData();
      }
    );
  };

  handleSearch = async () => {
    const query = this.state.query;
    try {
      if (query === "") {
        return this.setState({ searchResults: [] });
      }
      const results = await axios.get(
        `http://${localip}:3000/partialusers?query=${query}`,
        { headers: { Authorization: this.state.token } }
      );

      this.setState({ searchResults: results.data.users });
    } catch (error) {
      console.log(error);
    }
  };

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
    return (
      <SearchBar
        placeholder="Search friends..."
        onSubmitEditing={this.handleSearch}
        autoCapitalize="none"
        value={this.state.query}
        onChangeText={text => {
          this.setState({ query: text }, () => {
            this.handleSearch();
          });
        }}
        onClearText={this.getFriendData}
        clearIcon
        lightTheme
        round
      />
    );
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

  renderSectionHeader = section => {
    if (section.data.length) {
      return (
        <View>
          <Text h4>{section.key}</Text>
        </View>
      );
    }
    return null;
  };

  render() {
    return (
      <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
        <SectionList
          keyExtractor={item => item._id}
          ItemSeparatorComponent={this.renderSeparator}
          SectionSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          onRefresh={this.handleRefresh}
          refreshing={this.state.refreshing}
          extraData={this.state}
          renderSectionHeader={({ section }) =>
            this.renderSectionHeader(section)
          }
          sections={[
            {
              data: this.state.searchResults,
              key: "Search Results",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={`${item.username}`}
                    avatar={{ uri: item.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightTitle="Add Friend"
                    rightIcon={{ name: "add" }}
                    onPressRightIcon={() => {
                      this.acceptFriendRequest(item);
                    }}
                  />
                );
              }
            },
            {
              data: this.state.pendingFriends,
              key: "Friend Requests",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={`${item.friend.username}`}
                    subtitle="Friend Request Received"
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    leftIcon={{ name: "thumb-up" }}
                    leftIconOnPress={() => {
                      this.acceptFriendRequest(item);
                    }}
                    rightIcon={{ name: "thumb-down" }}
                    onPressRightIcon={() => {
                      this.rejectFriendRequest(item);
                    }}
                  />
                );
              }
            },
            {
              data: this.state.requestedFriends,
              key: "Sent Friend Requests",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={`${item.friend.username}`}
                    subtitle="Friend Request Sent"
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightIcon={{ name: "thumb-down" }}
                    onPressRightIcon={() => {
                      this.rejectFriendRequest(item);
                    }}
                  />
                );
              }
            },
            {
              data: this.state.acceptedFriends,
              key: "Friends",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={`${item.friend.username}`}
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                  />
                );
              }
            }
          ]}
        />
      </List>
    );
  }
}
