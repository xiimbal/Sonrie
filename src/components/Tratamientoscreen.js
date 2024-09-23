import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TratamientoScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [noteText, setNoteText] = useState('');
  const [treatments, setTreatments] = useState([]);
  const [total, setTotal] = useState(0);
  const [isAdult, setIsAdult] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadPatients = async () => {
      const storedPatients = JSON.parse(await AsyncStorage.getItem('patients')) || [];
      setPatients(storedPatients);
    };

    loadPatients();
  }, []);

  const treatmentsOptions = [
    { name: 'Corona(Metal)', cost: 1000 },
    { name: 'Corona(Porcelana)', cost: 2700 },
    { name: 'Amalgama', cost: 400 },
    { name: 'Resina', cost: 600 },
    { name: 'Incrustación(Metal)', cost: 100 },
    { name: 'Incrustación(Esteticos)', cost: 100 },
    { name: 'Incrustación(Metal)', cost: 100 },
    { name: 'Endoposte', cost: 800 },
    { name: 'Endodoncia', cost: 1000 }
  ];

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const handleToothPress = (tooth) => {
    setSelectedTooth(tooth);
    setModalVisible(true);
  };

  const handleSaveNote = () => {
    const treatment = treatmentsOptions.find(option => option.name === selectedTreatment);
    if (treatment) {
      const newTreatment = {
        tooth: selectedTooth,
        treatment: treatment.name,
        note: noteText,
        cost: treatment.cost,
      };
      const newTreatments = [...treatments, newTreatment];
      setTreatments(newTreatments);
      setTotal(total + treatment.cost);
      setModalVisible(false);
      setSelectedTooth('');
      setSelectedTreatment('');
      setNoteText('');
    }
  };

  const handleRemoveTreatment = (index) => {
    const treatmentToRemove = treatments[index];
    const newTreatments = treatments.filter((_, i) => i !== index);
    setTreatments(newTreatments);
    setTotal(total - treatmentToRemove.cost);
  };

  const handleSave = () => {
    // Lógica para guardar los tratamientos
    console.log("Tratamientos guardados:", treatments);
    // lógica para base de datos
  };

  return (
    <ScrollView 
    style={styles.container} 
    contentContainerStyle={styles.contentContainer}
>
    <Text style={styles.title}>Tratamientos</Text>
      <Picker
        selectedValue={selectedPatient}
        onValueChange={(itemValue) => setSelectedPatient(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione paciente" value="" />
        {patients.map((patient, index) => (
          <Picker.Item key={index} label={patient.nombre} value={patient.nombre} />
        ))}
      </Picker>

      <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
        <Text>{selectedDate ? selectedDate.toLocaleDateString() : 'Seleccione fecha'}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />

      <View style={styles.selectionContainer}>
        <TouchableOpacity
          style={[styles.selectionButton, isAdult && styles.selectedButton]}
          onPress={() => setIsAdult(true)}
        >
          <Text style={styles.selectionButtonText}>Adulto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectionButton, !isAdult && styles.selectedButton]}
          onPress={() => setIsAdult(false)}
        >
          <Text style={styles.selectionButtonText}>Niño</Text>
        </TouchableOpacity>
      </View>

      {isAdult ? (
        <View style={styles.teethContainer}>
          <Image source={require('../assets/adulto.png')} style={styles.teethImageAdulto} />
          {[...Array(32)].map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tooth, {
                top: getAdultToothPosition(index + 1).top,
                left: getAdultToothPosition(index + 1).left,
              }]}
              onPress={() => handleToothPress(index + 1)}
            >
              <Text style={styles.toothText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.teethContainer}>
          <Image source={require('../assets/n.png')} style={styles.teethImage} />
          {[...Array(20)].map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tooth, {
                top: getKidToothPosition(index + 1).top,
                left: getKidToothPosition(index + 1).left,
              }]}
              onPress={() => handleToothPress(index + 1)}
            >
              <Text style={styles.toothText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Diente</Text>
            <Text style={styles.tableHeaderText}>Tratamiento</Text>
            <Text style={styles.tableHeaderText}>Nota</Text>
            <Text style={styles.tableHeaderText}>Costo</Text>
            <Text style={styles.tableHeaderText}></Text>
          </View>
          <ScrollView>
            {treatments.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{item.tooth}</Text>
                <Text style={styles.tableCell}>{item.treatment}</Text>
                <Text style={styles.tableCell}>{item.note}</Text>
                <Text style={styles.tableCell}>${item.cost}</Text>
                <TouchableOpacity onPress={() => handleRemoveTreatment(index)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${total}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Guardar tratamiento</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir Tratamiento</Text>
            <Picker
              selectedValue={selectedTreatment}
              onValueChange={(itemValue) => setSelectedTreatment(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione tratamiento" value="" />
              {treatmentsOptions.map(option => (
                <Picker.Item key={option.name} label={option.name} value={option.name} />
              ))}
            </Picker>
            <TextInput
              style={styles.textInput}
              placeholder="Nota"
              value={noteText}
              onChangeText={setNoteText}
            />
            <TouchableOpacity onPress={handleSaveNote} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Guardar tratamiento</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getAdultToothPosition = (toothNumber) => {
  const positions = {
    1: { top: 150, left: 75 },
    2: { top: 125, left: 75 },
    3: { top: 95, left: 79 },
    4: { top: 70, left: 85 },
    5: { top: 45, left: 92 },
    6: { top: 20, left: 107 },
    7: { top: 10, left: 128 },
    8: { top: 5, left: 152 },
    9: { top: 7, left: 178 },
    10: { top: 10, left: 200 },
    11: { top: 22, left: 222 },
    12: { top: 44, left: 235 },
    13: { top: 65, left: 245 },
    14: { top: 95, left: 248 },
    15: { top: 125, left: 251 },
    16: { top: 150, left: 255 },
    17: { top: 220, left: 80 },
    18: { top: 246, left: 80 },
    19: { top: 280, left: 85 },
    20: { top: 305, left: 90 },
    21: { top: 326, left: 100 },
    22: { top: 350, left: 109 },
    23: { top: 360, left: 130 },
    24: { top: 367, left: 150 },
    25: { top: 367, left: 176 },
    26: { top: 360, left: 200 },
    27: { top: 350, left: 220 },
    28: { top: 329, left: 230 },
    29: { top: 307, left: 239 },
    30: { top: 280, left: 245 },
    31: { top: 245, left: 250 },
    32: { top: 220, left: 255 },
  };

  return positions[toothNumber] || { top: 0, left: 0 };
};

const getKidToothPosition = (toothNumber) => {
  const positions = {
    1: { top: 80, left: 110 },
    2: { top: 50, left: 113 },
    3: { top: 24, left: 120 },
    4: { top: 5, left: 135 },
    5: { top: 1, left: 156 },
    6: { top: 1, left: 176 },
    7: { top: 9, left: 197 },
    8: { top: 25, left: 210 },
    9: { top: 50, left: 219 },
    10: { top: 80, left: 222 },
    11: { top: 140, left: 110 },
    12: { top: 170, left: 115 },
    13: { top: 192, left: 120 },
    14: { top: 215, left: 135 },
    15: { top: 220, left: 155 },
    16: { top: 219, left: 179 },
    17: { top: 210, left: 199 },
    18: { top: 190, left: 209 },
    19: { top: 167, left: 218 },
    20: { top: 140, left: 220 },
  };

  return positions[toothNumber] || { top: 0, left: 0 };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 50, // Ajusta este valor según tus necesidades
  },
  contentContainer: {
    paddingBottom: 50, // Añade más espacio al final para que puedas desplazarte mejor
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 16,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  selectionButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007BFF',
  },
  selectionButtonText: {
    color: 'white', // Cambia el color según el estado
  },
  teethContainer: {
    position: 'relative',
  },
  teethImageAdulto: {
  width: '60%',
  height: 400,
  left: '20%'
  },
  teethImage: {
    width: '40%',
    height: 250,
    left: '30%'
  },
  tooth: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toothText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginTop: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333333', 
  },
  removeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 5,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  totalText: {
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default TratamientoScreen;
