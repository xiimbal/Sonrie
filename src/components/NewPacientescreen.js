import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Usamos uuid para generar IDs únicos

export default function NewPacienteScreen({ route, navigation }) {
  const { addPatient } = route.params;
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [alergias, setAlergias] = useState('');

  const handleGuardar = async () => {
    const id = uuidv4(); // Genera un ID único para cada paciente
    const newPatient = {
      id,
      nombre,
      telefono,
      edad,
      genero,
      direccion,
      numeroTelefono,
      enfermedades,
      alergias,
    };

    const existingPatients =
      JSON.parse(await AsyncStorage.getItem('patients')) || [];
    const updatedPatients = [...existingPatients, newPatient];
    await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients));

    addPatient(newPatient);
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Nuevo paciente</Text>
        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />
        <Text style={styles.label}>Teléfono:</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Edad:</Text>
        <TextInput
          style={styles.input}
          value={edad}
          onChangeText={setEdad}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Género:</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              genero === 'M' && styles.selectedGender,
            ]}
            onPress={() => setGenero('M')}>
            <Text style={styles.genderButtonText}>Masculino</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              genero === 'F' && styles.selectedGender,
            ]}
            onPress={() => setGenero('F')}>
            <Text style={styles.genderButtonText}>Femenino</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Dirección:</Text>
        <TextInput
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
        />
        <Text style={styles.label}>Número de casa:</Text>
        <TextInput
          style={styles.input}
          value={numeroTelefono}
          onChangeText={setNumeroTelefono}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Enfermedades:</Text>
        <TextInput
          style={styles.input}
          value={enfermedades}
          onChangeText={setEnfermedades}
        />
        <Text style={styles.label}>Alergias:</Text>
        <TextInput
          style={styles.input}
          value={alergias}
          onChangeText={setAlergias}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  genderButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#d3d3d3',
  },
  genderButtonText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
