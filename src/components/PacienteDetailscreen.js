import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const PacienteDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { patient } = route.params;

  const [nombre, setNombre] = useState(patient.nombre);
  const [edad, setEdad] = useState(patient.edad);
  const [telefono, setTelefono] = useState(patient.telefono);
  const [genero, setGenero] = useState(patient.genero);
  const [direccion, setDireccion] = useState(patient.direccion);
  const [numeroTelefono, setNumeroTelefono] = useState(patient.numeroTelefono);
  const [enfermedades, setEnfermedades] = useState(patient.enfermedades);
  const [alergias, setAlergias] = useState(patient.alergias);
  const [patientImage, setPatientImage] = useState(patient.patientImage || null); // Inicializa con la imagen del paciente

  const [isEditing, setIsEditing] = useState(false);

  const savePatientData = async () => {
    const updatedPatient = {
      ...patient,
      nombre,
      edad,
      telefono,
      genero,
      direccion,
      numeroTelefono,
      enfermedades,
      alergias,
      patientImage, // Guarda la imagen en el objeto del paciente
    };

    try {
      const jsonValue = JSON.stringify(updatedPatient);
      await AsyncStorage.setItem(`patient_${patient.id}`, jsonValue);
      Alert.alert('Éxito', 'Información guardada correctamente.');
      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la información.');
    }
  };

  const loadPatientData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(`patient_${patient.id}`);
      if (jsonValue != null) {
        const storedPatient = JSON.parse(jsonValue);
        setNombre(storedPatient.nombre);
        setEdad(storedPatient.edad);
        setTelefono(storedPatient.telefono);
        setGenero(storedPatient.genero);
        setDireccion(storedPatient.direccion);
        setNumeroTelefono(storedPatient.numeroTelefono);
        setEnfermedades(storedPatient.enfermedades);
        setAlergias(storedPatient.alergias);
        setPatientImage(storedPatient.patientImage); // Carga la imagen del paciente
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar la información.');
    }
  };

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Es necesario otorgar permiso para acceder a la galería.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setPatientImage(pickerResult.assets[0].uri);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadPatientData();
    };
    fetchData();
  }, [patient.id]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={isEditing ? savePatientData : () => setIsEditing(true)} style={styles.editButton}>
          <Text>{isEditing ? "Guardar" : "Editar"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [isEditing, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{nombre}</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity onPress={selectImage}>
          <Image
            style={styles.patientImage}
            source={patientImage ? { uri: patientImage } : { uri: 'https://via.placeholder.com/150' }}
          />
        </TouchableOpacity>

        <Text style={styles.text}>Edad: {edad}</Text>
        <Text style={styles.text}>Teléfono: {telefono}</Text>
        <Text style={styles.text}>Género: {genero}</Text>
        <Text style={styles.text}>Dirección: {direccion}</Text>
        <Text style={styles.text}>Número de casa: {numeroTelefono}</Text>
        <Text style={styles.text}>Enfermedades: {enfermedades}</Text>
        <Text style={styles.text}>Alergias: {alergias}</Text>

        <View style={styles.tableContainer}>
          <Text style={styles.tableHeaderText}>Tratamientos</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Diente</Text>
            <Text style={styles.tableHeader}>Tratamiento</Text>
            <Text style={styles.tableHeader}>Nota</Text>
            <Text style={styles.tableHeader}>Costo</Text>
          </View>
        </View>

        <Text style={styles.totalText}>Total: $ 00.00</Text>

        <TouchableOpacity style={styles.ticketButton}>
          <Text style={styles.ticketButtonText}>Generar ticket</Text>
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
    padding: 20,
    backgroundColor: '#007BFF',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  patientImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  tableContainer: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
  tableHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  ticketButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'stretch',
  },
  ticketButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 10,
    marginRight: 10,
  },
});

export default PacienteDetailScreen;
