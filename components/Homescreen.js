import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { idSession } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    if (!idSession) {
      setError('No se recibió IdSession');
      return;
    }

    setLoading(true);
    setError(null);

    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="urn:explorar">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:buscarLugares soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
          <latitud xsi:type="xsd:float">0</latitud>
          <longitud xsi:type="xsd:float">0</longitud>
          <radio xsi:type="xsd:float">0</radio>
          <TipoCliente xsi:type="xsd:int">0</TipoCliente>
          <pagina xsi:type="xsd:int">1</pagina>
          <IdSesion xsi:type="xsd:string">${idSession}</IdSesion>
          <IdEjecutivos xsi:type="xsd:string"></IdEjecutivos>
          <TipoEjecutivos xsi:type="xsd:int">0</TipoEjecutivos>
          <MostrarLocalidades xsi:type="xsd:int">0</MostrarLocalidades>
        </urn:buscarLugares>
      </soapenv:Body>
    </soapenv:Envelope>`;

    try {
      const response = await fetch('http://pakal.factury.mx/wspakal/Explorar2.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'urn:explorar#buscarLugares',
        },
        body: soapRequest,
      });

      const textResponse = await response.text();
      const match = textResponse.match(/<return[^>]*>(.*?)<\/return>/);

      if (match && match[1]) {
        let jsonString = match[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        try {
          const patientsData = JSON.parse(jsonString);
          if (Array.isArray(patientsData)) {
            setPatients(patientsData);
            setError(null);
          } else {
            setError('El formato de pacientes no es válido');
            setPatients([]);
          }
        } catch (parseError) {
          setError('Error al parsear JSON: ' + parseError.message);
          setPatients([]);
        }
      } else {
        setError('Respuesta malformada del servidor');
        setPatients([]);
      }
    } catch (fetchError) {
      setError('Error de conexión: ' + fetchError.message);
      setPatients([]);
    }

    setLoading(false);
  }, [idSession]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filtrado seguro
  const filteredPatients = patients.filter(patient =>
    patient.NombreNegocio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Manejo de click para navegar al detalle, pasando el paciente
  const handlePatientClick = (patient) => {
    navigation.navigate('PacienteDetailscreen', { patient });
  };

  // Para borrar paciente (localmente)
  const handleDeletePatient = (patientToDelete) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar a ${patientToDelete.NombreNegocio || 'este paciente'}?`,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Sí",
          onPress: () => {
            const updatedPatients = patients.filter(p => p !== patientToDelete);
            setPatients(updatedPatients);
          }
        }
      ]
    );
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewPaciente', { addPatient: (newPatient) => setPatients(p => [...p, newPatient]) })}
        >
          <Image style={styles.addIcon} source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/add-user-male.png' }} />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#007BFF" />}

      {error && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>}

      <ScrollView contentContainerStyle={styles.patientsContainer}>
        {filteredPatients.length === 0 && !loading && (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay pacientes para mostrar.</Text>
        )}
        {filteredPatients.map((patient, index) => (
          <View key={index} style={styles.patientCard}>
            <TouchableOpacity onPress={() => handlePatientClick(patient)}>
              <Image
                style={styles.patientImage}
                source={
                  patient.patientImage
                    ? { uri: patient.patientImage }
                    : { uri: 'https://via.placeholder.com/150' }
                }
              />
              <Text>{patient.NombreNegocio || 'Sin nombre'}</Text>
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
