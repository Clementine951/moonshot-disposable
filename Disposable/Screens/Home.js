import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { EventContext } from './EventContext';
import { db } from '../firebaseConfig';
import { deleteDoc, doc, collection, getDocs, updateDoc } from 'firebase/firestore';

function HomeScreen({ navigation }) {
  const { eventDetails, clearEventDetails, userName, userRole, setEventDetails } = useContext(EventContext);
  const [participantCount, setParticipantCount] = useState(0);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (eventDetails) {
        const participantsRef = collection(db, 'events', eventDetails.eventId, 'participants');
        const snapshot = await getDocs(participantsRef);
        setParticipantCount(snapshot.size);
      }
    };

    fetchParticipants();

    const updateCountdown = () => {
      if (eventDetails?.revealTime) {
        const now = new Date();
        const endTime = new Date(eventDetails.revealTime);
        const diff = endTime - now;

        if (diff <= 0) {
          setCountdown('00:00:00');
        } else {
          const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
          const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
          const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
          setCountdown(`${hours}:${minutes}:${seconds}`);
        }
      }
    };

    if (eventDetails && eventDetails.revealTime) {
      updateCountdown(); // Initial call to set the countdown immediately
      const intervalId = setInterval(updateCountdown, 1000); // Update every second
      return () => clearInterval(intervalId);
    }
  }, [eventDetails]);

  const handleEndEvent = async () => {
    Alert.alert(
      "Ending the Event Now",
      "The photos will only be available during 1 hour.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "End Event",
          onPress: async () => {
            try {
              const eventDocRef = doc(db, 'events', eventDetails.eventId);
              const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

              // Update the event document with the new revealTime
              await updateDoc(eventDocRef, {
                revealTime: oneHourFromNow.toISOString() // Ensure the time is stored as a string in ISO format
              });

              // Update the local eventDetails with the new revealTime
              setEventDetails((prevDetails) => ({
                ...prevDetails,
                revealTime: oneHourFromNow.toISOString()
              }));

              navigation.navigate('HomeScreen');
            } catch (error) {
              console.error('Error ending event:', error);
              Alert.alert('Error', 'Failed to end event. Please try again.');
            }
          }
        },
      ],
      { cancelable: false }
    );
  };

  const handleLeaveEvent = () => {
    Alert.alert(
      "Leave Event",
      "You won't be able to add more photos, but your already saved photos are safe. Are you sure you want to leave?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          onPress: async () => {
            clearEventDetails();
            navigation.navigate('HomeScreen');
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {eventDetails && userRole === 'organizer' && (
        <>
          <Text style={styles.eventName}>{eventDetails.eventName}</Text>
          <Text style={styles.eventInfo}>{eventDetails.eventId}</Text>
          <Text style={styles.eventInfo}>{userName}</Text>
          <Text style={styles.eventInfo}>{participantCount} participants</Text>
          <Text style={styles.eventInfo}>{countdown}</Text>
          <TouchableOpacity style={styles.eventButton}>
            <Text style={styles.eventButtonText}>Share event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eventButton} onPress={handleEndEvent}>
            <Text style={styles.eventButtonText}>End the event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eventButton} onPress={handleLeaveEvent}>
            <Text style={styles.eventButtonText}>Leave the event</Text>
          </TouchableOpacity>
        </>
      )}
      {eventDetails && userRole === 'participant' && (
        <>
          <Text style={styles.eventName}>{eventDetails.eventName}</Text>
          <Text style={styles.eventInfo}>{userName}</Text>
          <Text style={styles.eventInfo}>{participantCount} participants</Text>
          <Text style={styles.eventInfo}>{countdown}</Text>
          <TouchableOpacity style={styles.eventButton} onPress={handleLeaveEvent}>
            <Text style={styles.eventButtonText}>Leave the event</Text>
          </TouchableOpacity>
        </>
      )}
      {!eventDetails && (
        <>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => navigation.navigate('CreatePage')}
          >
            <Text style={styles.createButtonText}>Create an event</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.joinButton} 
            onPress={() => navigation.navigate('JoinPage')}
          >
            <Text style={styles.joinButtonText}>Join an event</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  createButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#E6E6FA',
    borderRadius: 10,
    width: '80%',
  },
  createButtonText: {
    color: '#09745F',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  joinButton: {
    padding: 10,
    backgroundColor: '#E6E6FA',
    borderRadius: 10,
    width: '80%',
  },
  joinButtonText: {
    color: '#09745F',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#09745F',
    marginBottom: 20,
  },
  eventInfo: {
    fontSize: 18,
    color: '#09745F',
    marginBottom: 10,
  },
  eventButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E8D7FF',
    borderRadius: 10,
    width: '80%',
  },
  eventButtonText: {
    color: '#09745F',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default HomeScreen;
