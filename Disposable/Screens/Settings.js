import React, {useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EventContext } from './EventContext';

function SettingsScreen() {
  const navigation = useNavigation();
  const {eventDetails} = useContext(EventContext);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('AppSettings')}>
        <Text style={styles.section}>Application</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity onPress={() => navigation.navigate('DataSettings')}>
        <Text style={styles.section}>Privacy</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      {eventDetails && (
        <>
          <TouchableOpacity onPress={() => navigation.navigate('EventSettings')}>
            <Text style={styles.section}>Event settings</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('ContactForm')}>
        <Text style={styles.section}>Contact</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  section: {
    fontSize: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});

export default SettingsScreen;
