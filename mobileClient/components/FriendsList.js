import React from "react";
import {
  StyleSheet,
  View,
  SectionList,
  AsyncStorage,
  ActivityIndicator,
  Alert
} from "react-native";
import axios from "axios";
import Modal from "react-native-modal";
import { apiUrl } from "../config";
import {
  Header,
  List,
  ListItem,
  SearchBar,
  Button,
  Text,
  Overlay,
  Input,
  Icon,
  Avatar,
  ButtonGroup
} from "react-native-elements";

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      query: "",
      transactionAmount: "",
      reason: "",
      selectedIndex: 0,
      acceptedFriends: [],
      requestedFriends: [],
      pendingFriends: [],
      searchResults: [],
      refreshing: false,
      loading: false,
      sendModalVisible: false,
      requestModalVisible: false,
      sendRequestModalVisible: false,
      selectedFriend: null
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
      .get(`${apiUrl}/getfriends`, {
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
      `${apiUrl}/addfriend`,
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
      `${apiUrl}/removefriend`,
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
      const results = await axios.get(`${apiUrl}/partialusers?query=${query}`, {
        headers: { Authorization: this.state.token }
      });

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
        autoCorrect={false}
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

  renderSectionSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE"
        }}
      />
    );
  };

  handleFriendClick = friend => {
    this.setState({ selectedFriend: friend, sendRequestModalVisible: true });
  };

  handleToSendClick = () => {
    this.setState({
      sendModalVisible: true,
      sendRequestModalVisible: false
    })
  };

  handleToRequestClick = () => {
    this.setState({
      requestModalVisible: true,
      sendRequestModalVisible: false
    })
  };

  handleCancel = () => {
    this.setState({
      selectedFriend: null,
      requestModalVisible: false,
      sendModalVisible: false,
      sendRequestModalVisible: false,
      transactionAmount: "",
      reason: ""
    });
  };

  updateIndex = idx => {
    this.setState({ selectedIndex: idx });
  };

  handleSend = async () => {
    const selectedCoin = ["eth", "btc", "eth_test", "btc_test"];

    const transaction = await axios.post(
      `${apiUrl}/send`,
      {
        friendId: this.state.selectedFriend._id,
        coin: selectedCoin[this.state.selectedIndex],
        amount: this.state.transactionAmount,
        subject: this.state.reason
      },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    if (transaction.data.success) {
      Alert.alert(
        "Transaction Sent",
        `Transaction ID: ${transaction.data.txId}`,
        [{ text: "OK", onPress: this.handleCancel }]
      );
    } else {
      Alert.alert("Transaction Failed", transaction.data.message, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    }
  };

  handleROF = async () => {
    const selectedCoin = ["eth", "btc", "eth_test", "btc_test"];

    const transaction = await axios.post(
      `${apiUrl}/requestfunds`,
      {
        receiver: this.state.selectedFriend._id,
        coin: selectedCoin[this.state.selectedIndex],
        amount: this.state.transactionAmount,
        subject: this.state.reason
      },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    if (transaction.data.success) {
      Alert.alert(
        "Request Sent",
        `Success: ${transaction.data.message}`,
        [{ text: "OK", onPress: this.handleCancel }]
      );
    } else {
      Alert.alert("Transaction Failed", transaction.data.message, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    }
  };

  renderSectionHeader = section => {
    if (section && section.data.length) {
      return (
        <View>
          <Text h4>{section.key}</Text>
        </View>
      );
    }
    return null;
  };

  render() {
    const buttons = ["Eth", "Btc", "Eth Test", "Btc Test"];
    return (
      <List
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: "100%"
        }}
      >
        <SectionList
          keyExtractor={item => item._id}
          ItemSeparatorComponent={this.renderSeparator}
          SectionSeparatorComponent={this.renderSectionSeparator}
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
                    rightIcon={{ type: "entypo", name: "add-user" }}
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
                    rightIcon={
                      <View>
                        <Icon
                          type="entypo"
                          size={24}
                          color="#bdc6cf"
                          name="cross"
                          onPress={() => this.rejectFriendRequest(item)}
                        />
                        <Icon
                          type="entypo"
                          color="#bdc6cf"
                          size={24}
                          name="check"
                          onPress={() => this.acceptFriendRequest(item)}
                        />
                      </View>
                    }
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
                    rightIcon={{ type: "entypo", name: "cross" }}
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
                    rightTitle="Send"
                    onPressRightIcon={() => {
                      this.handleFriendClick(item.friend);
                    }}
                  />
                );
              }
            }
          ]}
        />

        {/* send or request funds modal */}
        {this.state.sendRequestModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto">
              <View>
                <Header
                  backgroundColor="white"
                  outerContainerStyles={{
                    height: "25%",
                    paddingVertical: 5,
                    marginBottom: 5
                  }}
                  centerComponent={
                    <Text style={{ color: "gray", fontSize: 24 }}>
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={{ flexDirection: "column" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: 5
                    }}
                  >
                    <Button text="Send" onPress={this.handleToSendClick} />
                    <Button text="Request" onPress={this.handleToRequestClick} />
                    <Button text="Cancel" onPress={this.handleCancel} />
                  </View>
                </View>
              </View>
            </Overlay>
          )}

        {/* request money modal */}
        {this.state.requestModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto">
              <View>
                <Header
                  backgroundColor="white"
                  outerContainerStyles={{
                    height: "25%",
                    paddingVertical: 5,
                    marginBottom: 5
                  }}
                  centerComponent={
                    <Text style={{ color: "gray", fontSize: 24 }}>
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={{ flexDirection: "column" }}>
                  <Input
                    placeholder="0"
                    leftIcon={
                      <Icon name="attach-money" size={24} color="black" />
                    }
                    value={this.state.transactionAmount}
                    keyboardType="numeric"
                    onChangeText={text => this.setState({ transactionAmount: text })}
                  />
                  <Input
                    placeholder="What's it for?"
                    value={this.state.reason}
                    onChangeText={text => this.setState({ reason: text })}
                  />
                  <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    containerStyle={{ height: 35, marginTop: 5 }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: 5
                    }}
                  >
                    <Button
                      text="Request"
                      onPress={() => {
                        Alert.alert("Confirm Request", null, [
                          {
                            text: "NO",
                            onPress: this.handleCancel,
                            style: "cancel"
                          },
                          { text: "YES", onPress: this.handleROF }
                        ]);
                      }}
                    />
                    <Button text="Cancel" onPress={this.handleCancel} />
                  </View>
                </View>
              </View>
            </Overlay>
          )}

          {/* send money modal */}
        {this.state.sendModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto">
              <View>
                <Header
                  backgroundColor="white"
                  outerContainerStyles={{
                    height: "25%",
                    paddingVertical: 5,
                    marginBottom: 5
                  }}
                  centerComponent={
                    <Text style={{ color: "gray", fontSize: 24 }}>
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={{ flexDirection: "column" }}>
                  <Input
                    placeholder="0"
                    leftIcon={
                      <Icon name="attach-money" size={24} color="black" />
                    }
                    value={this.state.transactionAmount}
                    keyboardType="numeric"
                    onChangeText={text => this.setState({ transactionAmount: text })}
                  />
                  <Input
                    placeholder="What's it for?"
                    value={this.state.reason}
                    onChangeText={text => this.setState({ reason: text })}
                  />
                  <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    containerStyle={{ height: 35, marginTop: 5 }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: 5
                    }}
                  >
                    <Button
                      text="Send"
                      onPress={() => {
                        Alert.alert("Confirm Transaction", null, [
                          {
                            text: "NO",
                            onPress: this.handleCancel,
                            style: "cancel"
                          },
                          { text: "YES", onPress: this.handleSend }
                        ]);
                      }}
                    />
                    <Button text="Cancel" onPress={this.handleCancel} />
                  </View>
                </View>
              </View>
            </Overlay>
          )} 
      </List>
    );
  }
}
