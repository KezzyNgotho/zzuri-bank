import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { Image, Card, ListItem, Avatar } from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '../firebase';

const AccountsScreen = () => {
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [checkingBalance, setCheckingBalance] = useState(0);
  const [userDisplayName, setUserDisplayName] = useState('');

  useEffect(() => {
    fetchUserData();
   
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      console.log('Current User:', currentUser);

      setUserDisplayName(currentUser.displayName || 'User');
      // Set user profile image path here
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const userId = firebase.auth().currentUser.uid;
    const db = firebase.firestore();
  
    // Fetch checking account balance
    const unsubscribeChecking = db.collection('totals')
      .doc('checking')
      .onSnapshot((doc) => {
        if (doc.exists) {
          const checkingAccountData = doc.data();
          setCheckingBalance(checkingAccountData.amount || 0);
        } else {
          console.error('Checking account document does not exist.');
        }
      });
      return () => {
        unsubscribeChecking();
       
      };
    }, []);
  
  
  
  const handleTransfer = async () => {
    try {
      // Your existing transfer logic...
  
      // Set the checking balance after the transfer
      const updatedCheckingBalance = checkingBalance - parseFloat(amount);
      setCheckingBalance(updatedCheckingBalance);
  
      // Update balance in the "checking" document within "totals" collection
      const currentUser = auth().currentUser;
      const checkingDocRef = firestore().collection('totals').doc(currentUser.uid);
  
      await firestore().runTransaction(async (transaction) => {
        const checkingDoc = await transaction.get(checkingDocRef);
        const checkingData = checkingDoc.data();
  
        if (checkingData) {
          const updatedChecking = {
            balance: checkingData.balance - parseFloat(amount),
            // Add other fields as needed
          };
  
          transaction.update(checkingDocRef, updatedChecking);
        }
      });
  
      Alert.alert('Success', 'Money transferred successfully.');
    } catch (error) {
      console.error('Error transferring money:', error);
      Alert.alert('Error', 'Failed to transfer money. Please try again.');
    }
  };
  
  const handleBankSelection = (bank) => {
    setSelectedBank(bank);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card containerStyle={styles.userSection}>
        <Avatar
          size="xlarge"
          source={require('../assets/zzuri.png')}
          containerStyle={styles.bankLogo}
        />
        <Text style={styles.bankName}>You are the best!</Text>
      </Card>

      <View style={styles.rowContainer}>
        <Card containerStyle={styles.transactionSection}>
          <View style={styles.bankContainer}>
            <Text style={styles.label}>Select Bank:</Text>
            <ScrollView style={styles.bankIconsContainer} showsVerticalScrollIndicator={false}>
              {[
                { bank: 'Equity', image: require('../assets/equity-bank-logo.png') },
                { bank: 'Commercial', image: require('../assets/commercial-bank-of-africa-logo.png') },
                { bank: 'Co-operative', image: require('../assets/co-operative-bank-of-kenya-logo.png') },
                { bank: 'Tbn', image: require('../assets/bank-tabungan-negara-btn-logo.png') },
              ].map(({ bank, image }) => (
                <ListItem
                  key={bank}
                  bottomDivider
                  onPress={() => handleBankSelection(bank)}
                  containerStyle={selectedBank === bank ? styles.selectedBankItem : null}
                >
                  <Image source={image} style={styles.bankIcon} />
                  <ListItem.Content>
                    <ListItem.Title>{bank}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              ))}
            </ScrollView>
            {selectedBank ? (
              <View style={styles.selectedBankContainer}>
                <Text style={styles.label}>Selected Bank:</Text>
                <Text style={styles.selected}>{selectedBank}</Text>
              </View>
            ) : null}
          </View>
        </Card>

        <Card containerStyle={styles.transactionSection}>
          <View style={styles.balanceAndAmount}>
            <Text style={styles.balanceLabel}>Checking Balance:</Text>
            <Text style={styles.balanceAmount}>ksh {checkingBalance.toFixed(2)}</Text>
            <Text style={styles.label}>Recipient's Account Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              keyboardType="numeric"
              value={recipientAccount}
              onChangeText={(text) => setRecipientAccount(text)}
            />
            <Text style={styles.label}>Amount:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text)}
            />
          </View>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Transfer" onPress={handleTransfer} containerStyle={styles.button} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    /* justifyContent: 'space-between', */
    /* marginHorizontal: 1, */
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 20,
  },
  transactionSection: {
    marginBottom: 16,
    borderRadius: 10,
    flex: 1,
  },
  bankContainer: {
    marginRight: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  bankName: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: 'green',
    marginBottom: 8,
  },
  bankIconsContainer: {
    marginBottom: 8,
  },
  bankIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  balanceAndAmount: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 18,
    color: 'black',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 16,
  },
  input: {
    height: 40,
    marginBottom: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 16,
    borderRadius: 10,
    marginHorizontal: 30,
  },
  button: {
    borderRadius: 10,
  },
  selectedBankItem: {
    backgroundColor: '#F1EAFF',
  },
  selectedBankContainer: {
    marginTop: 10,
  },
  selected: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AccountsScreen;
