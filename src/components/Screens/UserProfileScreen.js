import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Image, Linking ,Alert} from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(auth().currentUser);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);

  const [editableFields, setEditableFields] = useState({
    fullName: '',
    email: user.email || '',
    mobileNumber: '',
    accountNumber: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          setEditableFields({
            fullName: userData.name || '',
            email:userData.email || '',
            mobileNumber: userData.phone || '',
            accountNumber: userData.accountNumber || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
      }
    };

    fetchUserData();
  }, [user]); // Removed editableFields from the dependency array

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setUser(null);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Failed to log out. Please try again.', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(user.email);
      Alert.alert('Success', 'Password reset email sent. Check your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
      console.error('Failed to send password reset email. Please try again.', error);
    }
  };
  

  const handleEditProfile = () => {
    setModalVisible(true);
  };

  const handleSaveChanges = async () => {
    try {
      // Save changes to Firestore
      await firestore().collection('users').doc(user.uid).update({
        name: editableFields.fullName,
        phone: editableFields.mobileNumber,
        accountNumber: editableFields.accountNumber,
      });

      // Show success message
      setSuccessMessageVisible(true);

      // Hide success message after a delay (e.g., 3 seconds)
      setTimeout(() => {
        setSuccessMessageVisible(false);
      }, 3000);

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving changes to Firestore:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleChangeText = (field, value) => {
    setEditableFields({ ...editableFields, [field]: value });
  };
  /* const handleLogout = async () => {
    try {
      await auth().signOut();
      setUser(null);   
      navigation.navigate('Login');
    } catch (error) {
      console.error('Failed to log out. Please try again.', error);
    }
  }; */

 /*  const handleResetPassword = async () => {
    // Implement password reset logic
    console.log('Reset Password');
  };

  const handleEditProfile = () => {
    setModalVisible(true);
  };

  const handleSaveChanges = () => {
    // Implement logic to save changes to Firestore
    console.log('Save changes to Firestore:', editableFields);
    setModalVisible(false);
  };

  const handleChangeText = (field, value) => {
    setEditableFields({ ...editableFields, [field]: value });
  };
 */
  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/+254716304517?text=Hello%20from%20your%20app`);
  };

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/kezzy_ngothoo/');
  };

  const openTwitter = () => {
    Linking.openURL('https://twitter.com/your_username/');
  };

  const makePhoneCall = () => {
    Linking.openURL('tel:+254716304517');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image size={120} source={require('../assets/icons8-user-24.png')} style={styles.avatar} />
        <Text style={styles.username}>{editableFields.fullName}</Text>
        <Text style={styles.email}>{editableFields.email}</Text>
      </View>
      {editMode ? (
        <Button mode="contained" style={styles.saveChangesButton} onPress={handleSaveChanges}>
          Save Changes
        </Button>
      ) : (
        <Button mode="contained" style={styles.editProfileButton} onPress={handleEditProfile}>
          Edit Profile
        </Button>
      )}

      <View style={styles.editSection}>
        <TextInput
          style={styles.editInput}
          placeholder="Full Name"
          value={editableFields.fullName}
          onChangeText={(text) => handleChangeText('fullName', text)}
          editable={editMode}
        />
        <TextInput
          style={styles.editInput}
          placeholder="Email"
          value={editableFields.email}
          editable={false}
        />
        <TextInput
          style={styles.editInput}
          placeholder="Mobile Number"
          value={editableFields.mobileNumber}
          onChangeText={(text) => handleChangeText('mobileNumber', text)}
          editable={editMode}
        />
        <TextInput
          style={styles.editInput}
          placeholder="Account Number"
          value={editableFields.accountNumber}
          onChangeText={(text) => handleChangeText('accountNumber', text)}
          editable={editMode}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(!isModalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Edit Profile</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={editableFields.fullName}
              onChangeText={(text) => handleChangeText('fullName', text)}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Mobile Number"
              value={editableFields.mobileNumber}
              onChangeText={(text) => handleChangeText('mobileNumber', text)}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Account Number"
              value={editableFields.accountNumber}
              onChangeText={(text) => handleChangeText('accountNumber', text)}
            />
            <Button mode="contained" style={styles.modalSaveButton} onPress={handleSaveChanges}>
              Save Changes
            </Button>
            <Button mode="contained" style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      <View style={styles.infoSection}>
        <TouchableOpacity style={styles.infoItem} onPress={handleResetPassword}>
          <Text style={styles.infoLabel}>Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoItem} onPress={handleLogout}>
          <Text style={styles.infoLabel}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.supportSection}>
        <TouchableOpacity style={styles.supportItem} onPress={openWhatsApp}>
          <Image source={require('../assets/icons8-whatsapp-30.png')} style={styles.supportImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem} onPress={openInstagram}>
          <Image source={require('../assets/icons8-instagram-48.png')} style={styles.supportImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem} onPress={openTwitter}>
          <Image source={require('../assets/icons8-twitterx-24.png')} style={styles.supportImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportItem} onPress={makePhoneCall}>
          <Image source={require('../assets/icons8-call-30.png')} style={styles.supportImage} />
        </TouchableOpacity>
      </View>

        {/* Success message */}
        {successMessageVisible && (
        <View style={styles.successMessage}>
          <Text style={styles.successMessageText}>Changes saved successfully!</Text>
        </View>
      )}
    </ScrollView>
  );
};







const styles = StyleSheet.create({
  successMessage: {
    backgroundColor: '#2ecc71', // Success message background color
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  successMessageText: {
    color: '#fff', // Success message text color
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalInput: {
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  modalSaveButton: {
    backgroundColor: '#2ecc71', // Save Changes Button Color
    marginVertical: 10,
  },
  modalCancelButton: {
    backgroundColor: '#e74c3c', // Cancel Button Color
    marginVertical: 10,
  },
  saveChangesButton: {
    marginVertical: 10,
    backgroundColor: '#2ecc71', // Save Changes Button Color
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Light Gray Border
  },
  avatar: {
    marginBottom: 10,
    backgroundColor: '#fff', // White Background for Avatar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333', // Dark Text Color
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  editProfileButton: {
    marginVertical: 10,
    backgroundColor: '#3498db', // Button Color
  },
  editSection: {
    marginBottom: 16,
  },
  editInput: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16, // Increased Font Size
    color: '#333', // Dark Text Color
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#3498db',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#fff',
  },
  supportSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom:20,
  },
  supportItem: {
    flex: 1,
    alignItems: 'center',
  },
  supportImage: {
    width: 30,
    height: 30,
    borderRadius: 25,
  },
});



export default UserProfileScreen;
