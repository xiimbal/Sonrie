import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

const ClockScreen = ({ route }) => {
  const { patients = [] } = route.params || {};
  const [date, setDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [color, setColor] = useState('#F0F0F0');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientNameForDelete, setPatientNameForDelete] = useState("");

  const handlePrevMonth = () => {
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    setDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setDate(nextMonth);
  };

  const handleDayClick = (day) => {
    setSelectedDay(new Date(date.getFullYear(), date.getMonth(), day));
  };

  const handleSaveNote = () => {
    if (note.trim() === "" || !selectedPatient) return;
    setNotes([...notes, { date: selectedDay, time: selectedTime, text: note, patient: selectedPatient, color }]);
    setNote("");
    setSelectedTime(new Date());
    setSelectedPatient(null);
    setColor('#F0F0F0');
    setIsModalOpen(false);
  };

  const handleEditNote = (note, index) => {
    setNote(note.text);
    setSelectedPatient(note.patient);
    setSelectedTime(note.time);
    setColor(note.color);
    setSelectedNote({ ...note, index });
    setIsModalOpen(true);
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteNote = () => {
    if (patientNameForDelete === selectedNote.patient) {
      const updatedNotes = notes.filter((note, index) => index !== selectedNote.index);
      setNotes(updatedNotes);
      setSelectedNote(null);
      setIsDeleteModalOpen(false);
      setPatientNameForDelete("");
    } else {
      Alert.alert("Error", "El nombre del paciente no coincide.");
    }
  };

  const renderNote = (note, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.noteContainer, { backgroundColor: note.color }]}
      onPress={() => handleEditNote(note, index)}
    >
      <Text style={styles.noteText}>
        {note.date.toLocaleDateString()} - {note.time.toLocaleTimeString()}: {note.text} ({note.patient})
      </Text>
      <TouchableOpacity onPress={handleDeleteNote}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderWeekDays = () => (
    <View style={styles.weekDaysContainer}>
      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
        <View key={day} style={styles.weekDay}>
          <Text style={styles.weekDayText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={styles.navButton}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={styles.navButton}>{">"}</Text>
        </TouchableOpacity>
      </View>
      {renderWeekDays()}
      <View style={styles.daysContainer}>
        {Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => handleDayClick(day)}
            style={[
              styles.dayButton,
              selectedDay && selectedDay.getDate() === day ? styles.selectedDay : null,
              notes.some(n => new Date(n.date).getDate() === day) ? styles.hasNote : null
            ]}
          >
            <Text style={[
              styles.dayText,
              selectedDay && selectedDay.getDate() === day ? styles.selectedDayText : null
            ]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedDay && (
        <View style={styles.notesContainer}>
          <TouchableOpacity style={styles.addNoteButton} onPress={() => setIsModalOpen(true)}>
            <Text style={styles.addNoteButtonText}>+ Agregar Nota</Text>
          </TouchableOpacity>
          <FlatList
            data={notes.filter(note => note.date.toLocaleDateString() === selectedDay.toLocaleDateString())}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderNote(item, index)}
          />
        </View>
      )}
      <Modal visible={isModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nota</Text>
            <TextInput
              placeholder="Escribe una nota..."
              value={note}
              onChangeText={setNote}
              style={styles.noteInput}
            />
            <TouchableOpacity onPress={() => setTimePickerVisibility(true)} style={styles.timeButtonContainer}>
              <Text style={styles.timeButton}>
                {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              date={selectedTime}
              onConfirm={(time) => {
                setSelectedTime(time);
                setTimePickerVisibility(false);
              }}
              onCancel={() => setTimePickerVisibility(false)}
            />
            <Text style={styles.patientLabel}>Seleccionar Paciente:</Text>
            <Picker
              selectedValue={selectedPatient}
              onValueChange={(itemValue) => setSelectedPatient(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un paciente" value={null} />
              {patients.map((patient) => (
                <Picker.Item key={patient.nombre} label={patient.nombre} value={patient.nombre} />
              ))}
            </Picker>
            <Text style={styles.colorLabel}>Seleccionar Color:</Text>
            <Picker
              selectedValue={color}
              onValueChange={(itemValue) => setColor(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Gris Claro" value="#F0F0F0" />
              <Picker.Item label="Rojo" value="#FFCCCC" />
              <Picker.Item label="Verde" value="#CCFFCC" />
              <Picker.Item label="Azul" value="#CCCCFF" />
            </Picker>
            <TouchableOpacity style={styles.saveButtonContainer} onPress={handleSaveNote}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButtonContainer} onPress={() => setIsModalOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para Confirmar Eliminación */}
      <Modal visible={isDeleteModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.confirmationText}>Ingresa el nombre del paciente para confirmar:</Text>
            <TextInput
              placeholder="Nombre del paciente"
              value={patientNameForDelete}
              onChangeText={setPatientNameForDelete}
              style={styles.noteInput}
            />
            <TouchableOpacity style={styles.confirmButtonContainer} onPress={confirmDeleteNote}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButtonContainer} onPress={() => setIsDeleteModalOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navButton: {
    fontSize: 24,
    color: '#007BFF',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F7F7F7',
    margin: 2,
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedDay: {
    backgroundColor: '#007BFF',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  hasNote: {
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  notesContainer: {
    marginTop: 16,
  },
  addNoteButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 8,
  },
  addNoteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noteContainer: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
    color: '#333333',
  },
  deleteText: {
    color: '#FF0000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noteInput: {
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  timeButtonContainer: {
    marginBottom: 12,
  },
  timeButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    borderRadius: 5,
    textAlign: 'center',
  },
  patientLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    marginBottom: 12,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
  },
  colorLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  saveButtonContainer: {
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButtonContainer: {
    backgroundColor: '#DC3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  confirmationText: {
    marginBottom: 8,
  },
  confirmButtonContainer: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ClockScreen;
