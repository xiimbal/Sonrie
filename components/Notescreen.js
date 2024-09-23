// NoteScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const NoteScreen = ({ route }) => {
  const { date } = route.params;
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirm = (time) => {
    setSelectedTime(time);
    hideTimePicker();
  };

  const handleSaveNote = () => {
    setNotes([...notes, { date, time: selectedTime, text: note }]);
    setNote("");
    setSelectedTime(new Date());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Nota</Text>
      <TouchableOpacity onPress={showTimePicker}>
        <TextInput
          style={styles.input}
          placeholder="Hora"
          value={selectedTime.toLocaleTimeString()}
          editable={false}
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideTimePicker}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Nota"
        value={note}
        onChangeText={setNote}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveNote}>
        <Text style={styles.buttonText}>Guardar Nota</Text>
      </TouchableOpacity>
      <ScrollView style={styles.noteList}>
        <Text style={styles.title}>Notas</Text>
        {notes.map((note, index) => (
          <View style={styles.noteItem} key={index}>
            <Text><Text style={styles.bold}>Día:</Text> {note.date.toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>Hora:</Text> {note.time.toLocaleTimeString()}</Text>
            <Text><Text style={styles.bold}>Nota:</Text> {note.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 100,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noteList: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  noteItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default NoteScreen;
