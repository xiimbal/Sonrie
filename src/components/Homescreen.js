import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadPatients = async () => {
      const storedPatients = JSON.parse(await AsyncStorage.getItem('patients')) || [];
      setPatients(storedPatients);
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = async (newPatient) => {
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients));
  };

  const handleDeletePatient = (patientToDelete) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar a ${patientToDelete.nombre}?`,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Sí",
          onPress: async () => {
            const updatedPatients = patients.filter(patient => patient !== patientToDelete);
            setPatients(updatedPatients);
            await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients));
          }
        }
      ]
    );
  };

  const handlePatientClick = (patient) => {
    navigation.navigate('PacienteDetailscreen', { patient });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Pacientes</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar paciente"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewPaciente', { addPatient: handleAddPatient })}>
          <Image style={styles.addIcon} source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/add-user-male.png' }} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.patientsContainer}>
        {filteredPatients.map((patient, index) => (
          <View key={index} style={styles.patientCard}>
            <TouchableOpacity onPress={() => handlePatientClick(patient)}>
              <Image style={styles.patientImage} source={patient.patientImage ? { uri: patient.patientImage } : { uri: 'https://via.placeholder.com/150' }} />
              <Text>{patient.nombre}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePatient(patient)}
            >
              <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Image style={styles.navIcon} source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/user.png' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Clock', { patients })}>
          <Image style={styles.navIcon} source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/calendar.png' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Tratamiento')}>
          <Image style={styles.navIcon} source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/tooth.png' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Image style={styles.navIcon} source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/document.png' }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  addIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  patientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  patientCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '45%',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    width: 30,
    height: 30,
  },
});

export default HomeScreen;
